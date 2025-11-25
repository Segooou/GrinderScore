import React, { useState, useRef, useEffect } from 'react';
import { Send, Image as ImageIcon, Sparkles, BrainCircuit, Globe, Loader2, Bot, Calendar as CalendarIcon, ChevronLeft, ChevronRight } from 'lucide-react';
import { ChatMode, ChatMessage, Trade } from '../types';
import { sendChatMessage } from '../services/geminiService';
import { getChatHistory, saveChatMessage, getCurrentSessionUser } from '../services/storageService';
import ReactMarkdown from 'react-markdown';

interface ChatBotProps {
  trades: Trade[];
}

const ChatBot: React.FC<ChatBotProps> = ({ trades }) => {
  const [userId, setUserId] = useState<string | null>(null);
  const [currentDate, setCurrentDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isHistoryLoading, setIsHistoryLoading] = useState(false);
  const [selectedMode, setSelectedMode] = useState<ChatMode>(ChatMode.STANDARD);
  const [attachedImage, setAttachedImage] = useState<string | null>(null);
  
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    getCurrentSessionUser().then(u => u && setUserId(u.id));
  }, []);

  // Load history when date changes
  useEffect(() => {
    const fetchHistory = async () => {
        if (userId && currentDate) {
            setIsHistoryLoading(true);
            try {
                const history = await getChatHistory(userId, currentDate);
                if (history.length > 0) {
                    setMessages(history);
                } else {
                    // Initial welcome message for empty days
                    setMessages([{
                    id: 'welcome',
                    role: 'model',
                    text: 'Olá! Sou seu Analista Especialista de Mercado. Cole aqui notícias ou dados econômicos (Payroll, PIB, Copom) para eu analisar o impacto no WINFUT e Ibovespa.',
                    timestamp: Date.now()
                    }]);
                }
            } finally {
                setIsHistoryLoading(false);
            }
        }
    };
    fetchHistory();
  }, [currentDate, userId]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isLoading, isHistoryLoading]);

  const changeDate = (offset: number) => {
    const date = new Date(currentDate);
    date.setDate(date.getDate() + offset);
    setCurrentDate(date.toISOString().split('T')[0]);
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setAttachedImage(reader.result as string);
        const base64 = (reader.result as string).split(',')[1];
        setAttachedImage(base64); // Store raw base64 for API
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSend = async () => {
    if ((!input.trim() && !attachedImage) || isLoading || !userId) return;

    const newMessage: ChatMessage = {
      id: Date.now().toString(),
      role: 'user',
      text: input,
      image: attachedImage || undefined,
      timestamp: Date.now()
    };

    // Update UI
    setMessages(prev => [...prev, newMessage]);
    
    // Save to DB (Fire and forget, but ideally await)
    saveChatMessage(userId, currentDate, newMessage);
    
    setInput('');
    setIsLoading(true);

    const tempImage = attachedImage;
    setAttachedImage(null); 

    try {
      const responseText = await sendChatMessage(newMessage.text, tempImage, selectedMode, trades);
      
      const botResponse: ChatMessage = {
        id: (Date.now() + 1).toString(),
        role: 'model',
        text: responseText,
        timestamp: Date.now(),
        isThinking: selectedMode === ChatMode.THINKING
      };

      // Update UI and Save Bot Response
      setMessages(prev => [...prev, botResponse]);
      await saveChatMessage(userId, currentDate, botResponse);

    } catch (error) {
      const errorMsg: ChatMessage = {
        id: (Date.now() + 1).toString(),
        role: 'model',
        text: 'Desculpe, tive um problema ao processar sua mensagem.',
        timestamp: Date.now()
      };
      setMessages(prev => [...prev, errorMsg]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-[calc(100vh-8rem)] bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden animate-fade-in">
      {/* Chat Header */}
      <div className="bg-white p-4 border-b border-gray-100 flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-3 w-full md:w-auto">
          <div className="p-2 bg-gray-900 rounded-lg">
            <Bot className="text-white" size={24} />
          </div>
          <div>
            <h2 className="text-gray-900 font-bold">Analista Pro</h2>
            <p className="text-gray-500 text-xs font-medium">Especialista WINFUT & Macro</p>
          </div>
        </div>

        {/* Date Selector */}
        <div className="flex items-center gap-3 bg-gray-50 px-2 py-1.5 rounded-lg border border-gray-200">
          <button onClick={() => changeDate(-1)} className="p-1 hover:bg-white rounded-md transition-colors text-gray-500"><ChevronLeft size={16}/></button>
          <div className="flex items-center gap-2 text-sm font-semibold text-gray-700 min-w-[140px] justify-center">
            <CalendarIcon size={14} />
            <input 
              type="date" 
              value={currentDate}
              onChange={(e) => setCurrentDate(e.target.value)}
              className="bg-transparent border-none outline-none text-center w-[110px] cursor-pointer"
            />
          </div>
          <button onClick={() => changeDate(1)} className="p-1 hover:bg-white rounded-md transition-colors text-gray-500"><ChevronRight size={16}/></button>
        </div>
        
        {/* Mode Selector */}
        <div className="flex bg-gray-50 p-1 rounded-lg border border-gray-200">
          <button 
            onClick={() => setSelectedMode(ChatMode.STANDARD)}
            className={`p-2 rounded-md transition-all ${selectedMode === ChatMode.STANDARD ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-400 hover:text-gray-600'}`}
            title="Chat Analista (Padrão)"
          >
            <Sparkles size={18} />
          </button>
          <button 
            onClick={() => setSelectedMode(ChatMode.THINKING)}
            className={`p-2 rounded-md transition-all ${selectedMode === ChatMode.THINKING ? 'bg-white text-violet-600 shadow-sm' : 'text-gray-400 hover:text-gray-600'}`}
            title="Análise Profunda (Thinking)"
          >
            <BrainCircuit size={18} />
          </button>
          <button 
            onClick={() => setSelectedMode(ChatMode.SEARCH)}
            className={`p-2 rounded-md transition-all ${selectedMode === ChatMode.SEARCH ? 'bg-white text-blue-600 shadow-sm' : 'text-gray-400 hover:text-gray-600'}`}
            title="Pesquisa de Notícias"
          >
            <Globe size={18} />
          </button>
        </div>
      </div>

      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto p-6 space-y-6 bg-gray-50">
        {isHistoryLoading ? (
             <div className="flex justify-center pt-10">
                 <Loader2 className="animate-spin text-gray-400" />
             </div>
        ) : (
            <>
                {messages.map((msg, index) => (
                <div key={`${msg.id}-${index}`} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'} animate-fade-in-up`}>
                    <div className={`max-w-[85%] rounded-2xl p-5 shadow-sm ${
                    msg.role === 'user' 
                        ? 'bg-gray-900 text-white rounded-br-none' 
                        : 'bg-white text-gray-800 border border-gray-100 rounded-bl-none'
                    }`}>
                    {msg.image && (
                        <div className="mb-3 p-2 bg-gray-800/20 rounded-lg w-fit">
                        <span className="text-xs opacity-75 flex items-center gap-1"><ImageIcon size={12}/> Imagem analisada</span>
                        </div>
                    )}
                    {msg.isThinking && (
                        <div className="text-xs text-violet-600 mb-2 font-mono flex items-center gap-1 bg-violet-50 w-fit px-2 py-1 rounded">
                        <BrainCircuit size={12}/> Pensamento Profundo
                        </div>
                    )}
                    <div className={`prose prose-sm max-w-none ${msg.role === 'user' ? 'prose-invert' : 'prose-gray'}`}>
                        <ReactMarkdown>{msg.text}</ReactMarkdown>
                    </div>
                    <span className={`text-[10px] block mt-2 text-right ${msg.role === 'user' ? 'text-gray-400' : 'text-gray-400'}`}>
                        {new Date(msg.timestamp).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                    </span>
                    </div>
                </div>
                ))}
            </>
        )}
        {isLoading && (
          <div className="flex justify-start animate-fade-in">
            <div className="bg-white rounded-2xl p-4 border border-gray-100 flex items-center gap-3 shadow-sm">
               <Loader2 className="animate-spin text-gray-900" size={20} />
               <span className="text-gray-500 text-sm font-medium">
                 {selectedMode === ChatMode.THINKING ? 'Analisando cenário macro...' : 
                  selectedMode === ChatMode.SEARCH ? 'Buscando dados...' : 'Processando...'}
               </span>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <div className="p-4 bg-white border-t border-gray-100">
        {attachedImage && (
          <div className="mb-2 flex items-center gap-2 bg-gray-100 p-2 rounded-lg w-fit border border-gray-200 animate-fade-in-up">
            <ImageIcon size={16} className="text-gray-600" />
            <span className="text-xs text-gray-700">Imagem anexada</span>
            <button onClick={() => setAttachedImage(null)} className="ml-2 text-gray-400 hover:text-red-500">x</button>
          </div>
        )}
        <div className="flex gap-3">
          <button 
            onClick={() => fileInputRef.current?.click()}
            className="p-3 bg-gray-50 hover:bg-gray-100 border border-gray-200 rounded-xl text-gray-500 transition-colors"
          >
            <ImageIcon size={20} />
          </button>
          <input 
            type="file" 
            ref={fileInputRef} 
            className="hidden" 
            accept="image/*"
            onChange={handleImageUpload}
          />
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSend()}
            placeholder={
              selectedMode === ChatMode.THINKING ? "Cole o texto da notícia aqui..." :
              selectedMode === ChatMode.SEARCH ? "Pesquisar taxa de juros atual..." :
              "Cole a notícia ou pergunte sobre o mercado..."
            }
            className="flex-1 bg-white border border-gray-200 rounded-xl px-4 text-gray-900 focus:outline-none focus:border-gray-900 focus:ring-1 focus:ring-gray-900 transition-all placeholder:text-gray-400"
          />
          <button 
            onClick={handleSend}
            disabled={isLoading || (!input && !attachedImage)}
            className="p-3 bg-gray-900 hover:bg-gray-800 disabled:bg-gray-200 disabled:text-gray-400 rounded-xl text-white transition-all shadow-md"
          >
            <Send size={20} />
          </button>
        </div>
      </div>
    </div>
  );
};

export default ChatBot;