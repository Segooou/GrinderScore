import React, { useState } from 'react';
import { Header } from './ui/header';
import { TrendingUp, ShieldCheck, Zap, BarChart2, ArrowRight, BrainCircuit, LineChart, Calendar, Target, Activity, Users, Globe } from 'lucide-react';
import { Button } from './ui/button';

interface LandingPageProps {
  onGetStarted: () => void;
  onLogin: () => void;
}

type ViewState = 'HOME' | 'FEATURES' | 'ABOUT';

const LandingPage: React.FC<LandingPageProps> = ({ onGetStarted, onLogin }) => {
  const [currentView, setCurrentView] = useState<ViewState>('HOME');

  const renderContent = () => {
    switch (currentView) {
      case 'FEATURES':
        return (
          <div className="animate-fade-in pt-12 pb-24">
             <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="text-center max-w-3xl mx-auto mb-20">
                    <h2 className="text-4xl font-bold tracking-tight text-gray-900 mb-6">Poder Institucional para o Trader Varejo</h2>
                    <p className="text-xl text-gray-500 leading-relaxed">
                        O GrinderScore não é apenas uma planilha bonita. É um ecossistema completo focado em alta performance, disciplina e evolução constante.
                    </p>
                </div>

                {/* Feature 1 */}
                <div className="grid md:grid-cols-2 gap-12 items-center mb-24">
                    <div className="order-2 md:order-1 bg-gray-50 rounded-2xl p-8 border border-gray-100 shadow-sm min-h-[300px] flex flex-col justify-center">
                         <div className="mb-6 w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center text-blue-600">
                             <BarChart2 size={24} />
                         </div>
                         <h3 className="text-2xl font-bold text-gray-900 mb-3">Dashboard Analítico</h3>
                         <p className="text-gray-600 leading-relaxed">
                             Esqueça o Excel. Tenha uma visão clara do seu P&L, curva de patrimônio, taxa de acerto e drawdown em tempo real. Identifique o que funciona e elimine o que te dá prejuízo.
                         </p>
                    </div>
                    <div className="order-1 md:order-2 flex justify-center">
                         <div className="bg-white p-6 rounded-2xl shadow-xl border border-gray-100 rotate-2 w-full max-w-md h-64 flex items-center justify-center relative overflow-hidden">
                             <LineChart className="text-blue-500 w-32 h-32 opacity-20" />
                             <div className="absolute inset-0 flex items-center justify-center">
                                 <span className="text-lg font-bold text-gray-400">Preview Dashboard</span>
                             </div>
                         </div>
                    </div>
                </div>

                {/* Feature 2 */}
                <div className="grid md:grid-cols-2 gap-12 items-center mb-24">
                    <div className="flex justify-center">
                         <div className="bg-white p-6 rounded-2xl shadow-xl border border-gray-100 -rotate-2 w-full max-w-md h-64 flex items-center justify-center relative overflow-hidden">
                             <Calendar className="text-emerald-500 w-32 h-32 opacity-20" />
                             <div className="absolute inset-0 flex items-center justify-center">
                                 <span className="text-lg font-bold text-gray-400">Preview Calendário</span>
                             </div>
                         </div>
                    </div>
                    <div className="bg-gray-50 rounded-2xl p-8 border border-gray-100 shadow-sm min-h-[300px] flex flex-col justify-center">
                         <div className="mb-6 w-12 h-12 bg-emerald-100 rounded-xl flex items-center justify-center text-emerald-600">
                             <Calendar size={24} />
                         </div>
                         <h3 className="text-2xl font-bold text-gray-900 mb-3">Calendário Visual</h3>
                         <p className="text-gray-600 leading-relaxed">
                             O "Heatmap" da sua consistência. Visualize seus dias de ganho e perda como um calendário profissional. Anexe prints, anotações e reviva seus melhores trades com um clique.
                         </p>
                    </div>
                </div>

                {/* Feature 3 */}
                <div className="grid md:grid-cols-2 gap-12 items-center mb-24">
                    <div className="order-2 md:order-1 bg-gray-50 rounded-2xl p-8 border border-gray-100 shadow-sm min-h-[300px] flex flex-col justify-center">
                         <div className="mb-6 w-12 h-12 bg-violet-100 rounded-xl flex items-center justify-center text-violet-600">
                             <BrainCircuit size={24} />
                         </div>
                         <h3 className="text-2xl font-bold text-gray-900 mb-3">AI Insight (Gemini 3 Pro)</h3>
                         <p className="text-gray-600 leading-relaxed">
                             Seu copiloto de mercado. Nossa IA analisa notícias econômicas (Payroll, Copom) e correlaciona com seus trades para te dar feedbacks comportamentais e previsões de cenário.
                         </p>
                    </div>
                    <div className="order-1 md:order-2 flex justify-center">
                         <div className="bg-white p-6 rounded-2xl shadow-xl border border-gray-100 rotate-2 w-full max-w-md h-64 flex items-center justify-center relative overflow-hidden">
                             <Zap className="text-violet-500 w-32 h-32 opacity-20" />
                             <div className="absolute inset-0 flex items-center justify-center">
                                 <span className="text-lg font-bold text-gray-400">Preview IA</span>
                             </div>
                         </div>
                    </div>
                </div>

                <div className="bg-gray-900 rounded-3xl p-12 text-center text-white">
                    <h2 className="text-3xl font-bold mb-6">Pronto para elevar o nível?</h2>
                    <Button size="lg" className="bg-white text-gray-900 hover:bg-gray-100 text-lg px-8 h-14 rounded-xl" onClick={onGetStarted}>
                        Criar Conta Gratuita
                    </Button>
                </div>
             </div>
          </div>
        );

      case 'ABOUT':
        return (
          <div className="animate-fade-in pt-12 pb-24">
             <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="text-center mb-16">
                    <h1 className="text-4xl font-bold text-gray-900 mb-6">Sobre o GrinderScore</h1>
                    <p className="text-xl text-gray-500">Nossa missão é transformar apostadores em traders profissionais através da disciplina e dados.</p>
                </div>

                <div className="space-y-12">
                    <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100">
                        <div className="flex items-center gap-4 mb-4">
                            <Target className="text-blue-600" size={28} />
                            <h2 className="text-2xl font-bold text-gray-900">O Problema</h2>
                        </div>
                        <p className="text-gray-600 leading-relaxed text-lg">
                            95% dos day traders perdem dinheiro. Não por falta de técnica, mas por falta de gestão e controle emocional. A maioria opera sem registrar nada, sem saber sua taxa de acerto real e sem entender onde está errando. O mercado financeiro pune a falta de profissionalismo.
                        </p>
                    </div>

                    <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100">
                         <div className="flex items-center gap-4 mb-4">
                            <Activity className="text-emerald-600" size={28} />
                            <h2 className="text-2xl font-bold text-gray-900">A Solução</h2>
                        </div>
                        <p className="text-gray-600 leading-relaxed text-lg">
                            O GrinderScore nasceu da necessidade de um diário simples, porém poderoso. Unimos a facilidade de uso de um app moderno com a profundidade analítica que grandes fundos utilizam. Ao forçar o registro diário, criamos o hábito da responsabilidade.
                        </p>
                    </div>

                    <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100">
                         <div className="flex items-center gap-4 mb-4">
                            <Zap className="text-violet-600" size={28} />
                            <h2 className="text-2xl font-bold text-gray-900">Tecnologia</h2>
                        </div>
                        <p className="text-gray-600 leading-relaxed text-lg mb-4">
                            Construído com a stack mais moderna da web:
                        </p>
                        <ul className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <li className="flex items-center gap-2 text-gray-700 bg-gray-50 p-3 rounded-lg"><div className="w-2 h-2 bg-blue-500 rounded-full"></div> React & TypeScript</li>
                            <li className="flex items-center gap-2 text-gray-700 bg-gray-50 p-3 rounded-lg"><div className="w-2 h-2 bg-emerald-500 rounded-full"></div> Supabase (Banco de Dados)</li>
                            <li className="flex items-center gap-2 text-gray-700 bg-gray-50 p-3 rounded-lg"><div className="w-2 h-2 bg-violet-500 rounded-full"></div> Google Gemini 3 Pro (IA)</li>
                            <li className="flex items-center gap-2 text-gray-700 bg-gray-50 p-3 rounded-lg"><div className="w-2 h-2 bg-cyan-500 rounded-full"></div> Tailwind CSS</li>
                        </ul>
                    </div>
                </div>
             </div>
          </div>
        );

      default: // HOME
        return (
          <>
            <main className="mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8 pt-20 pb-32">
                <div className="flex flex-col items-center text-center max-w-4xl mx-auto space-y-8">
                    <div className="inline-flex items-center gap-2 bg-accent/50 border border-border px-4 py-1.5 rounded-full text-sm font-semibold text-muted-foreground animate-fade-in-up">
                        <Zap size={14} className="text-yellow-500 fill-yellow-500" />
                        <span>Powered by Gemini 3 Pro</span>
                    </div>
                    
                    <h1 className="text-5xl md:text-7xl font-bold tracking-tight text-primary leading-[1.1] animate-fade-in-up" style={{ animationDelay: '0.1s' }}>
                        Domine o mercado com <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-primary/50">Inteligência.</span>
                    </h1>
                    
                    <p className="text-xl text-muted-foreground max-w-2xl leading-relaxed animate-fade-in-up" style={{ animationDelay: '0.2s' }}>
                        O diário de trade definitivo. Registre operações, visualize métricas avançadas e receba insights de IA para atingir a consistência.
                    </p>
                    
                    <div className="flex flex-col sm:flex-row gap-4 w-full justify-center animate-fade-in-up" style={{ animationDelay: '0.3s' }}>
                        <Button size="lg" className="h-14 px-8 text-lg rounded-xl shadow-lg shadow-primary/20" onClick={onGetStarted}>
                            Começar Gratuitamente <ArrowRight className="ml-2 size-5" />
                        </Button>
                        <Button size="lg" variant="outline" className="h-14 px-8 text-lg rounded-xl" onClick={onLogin}>
                            Já tenho conta
                        </Button>
                    </div>
                </div>

                {/* Hero Visual */}
                <div className="mt-20 relative animate-fade-in-up" style={{ animationDelay: '0.4s' }}>
                    <div className="absolute inset-0 bg-gradient-to-t from-background to-transparent z-10 h-20 bottom-0 pointer-events-none"></div>
                    <div className="rounded-2xl border border-border shadow-2xl overflow-hidden bg-card">
                        <div className="grid grid-cols-12 gap-0 border-b border-border bg-muted/30 p-2">
                            <div className="col-span-1 flex gap-2 items-center px-2">
                                <div className="w-3 h-3 rounded-full bg-red-400/80"></div>
                                <div className="w-3 h-3 rounded-full bg-yellow-400/80"></div>
                                <div className="w-3 h-3 rounded-full bg-green-400/80"></div>
                            </div>
                        </div>
                        <div className="p-4 md:p-8 grid md:grid-cols-3 gap-6 bg-gray-50/50">
                            <div className="md:col-span-2 space-y-4">
                                <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm h-64 flex items-center justify-center relative overflow-hidden">
                                    <div className="absolute inset-0 opacity-[0.03]" style={{backgroundImage: 'radial-gradient(#000 1px, transparent 1px)', backgroundSize: '20px 20px'}}></div>
                                    <LineChart className="text-primary/10 w-32 h-32" />
                                    <div className="absolute bottom-6 left-6 right-6">
                                        <div className="h-2 bg-primary/5 rounded w-3/4 mb-2"></div>
                                        <div className="h-2 bg-primary/5 rounded w-1/2"></div>
                                    </div>
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm h-24"></div>
                                    <div className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm h-24"></div>
                                </div>
                            </div>
                            <div className="hidden md:block space-y-4">
                                <div className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm h-full flex flex-col gap-3">
                                    <div className="flex items-center gap-2 text-sm font-semibold text-gray-900 mb-2">
                                        <BrainCircuit size={16} className="text-violet-500"/> AI Insight
                                    </div>
                                    <div className="h-2 bg-gray-100 rounded w-full"></div>
                                    <div className="h-2 bg-gray-100 rounded w-5/6"></div>
                                    <div className="h-2 bg-gray-100 rounded w-4/6"></div>
                                    <div className="mt-auto p-3 bg-violet-50 rounded-lg text-xs text-violet-700 font-medium">
                                        "Risco elevado em operações de rompimento hoje devido à volatilidade do Payroll."
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </main>

            <section className="bg-muted/30 py-24 border-t border-border">
                <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                <div className="text-center mb-16">
                    <h2 className="text-3xl font-bold tracking-tight text-foreground mb-4">Tudo que você precisa para evoluir</h2>
                    <p className="text-muted-foreground text-lg">Ferramentas profissionais simplificadas para o trader moderno.</p>
                </div>
                <div className="grid md:grid-cols-3 gap-8 cursor-pointer">
                    <div onClick={() => {setCurrentView('FEATURES'); window.scrollTo(0,0)}} className="bg-background p-8 rounded-2xl shadow-sm border border-border hover:shadow-md transition-shadow group">
                    <div className="w-12 h-12 bg-blue-50 rounded-xl flex items-center justify-center text-blue-600 mb-6 border border-blue-100 group-hover:scale-110 transition-transform">
                        <BarChart2 size={24} />
                    </div>
                    <h3 className="text-xl font-bold mb-3">Analytics Completo</h3>
                    <p className="text-muted-foreground leading-relaxed">Visualize sua curva de patrimônio, taxa de acerto e métricas detalhadas em tempo real.</p>
                    </div>
                    <div onClick={() => {setCurrentView('FEATURES'); window.scrollTo(0,0)}} className="bg-background p-8 rounded-2xl shadow-sm border border-border hover:shadow-md transition-shadow group">
                    <div className="w-12 h-12 bg-violet-50 rounded-xl flex items-center justify-center text-violet-600 mb-6 border border-violet-100 group-hover:scale-110 transition-transform">
                        <BrainCircuit size={24} />
                    </div>
                    <h3 className="text-xl font-bold mb-3">IA Gemini Integrada</h3>
                    <p className="text-muted-foreground leading-relaxed">Receba feedbacks automáticos sobre seus trades e identifique padrões comportamentais.</p>
                    </div>
                    <div onClick={() => {setCurrentView('FEATURES'); window.scrollTo(0,0)}} className="bg-background p-8 rounded-2xl shadow-sm border border-border hover:shadow-md transition-shadow group">
                    <div className="w-12 h-12 bg-emerald-50 rounded-xl flex items-center justify-center text-emerald-600 mb-6 border border-emerald-100 group-hover:scale-110 transition-transform">
                        <ShieldCheck size={24} />
                    </div>
                    <h3 className="text-xl font-bold mb-3">Gestão de Risco</h3>
                    <p className="text-muted-foreground leading-relaxed">Ferramentas dedicadas para manter seu drawdown controlado e sua mente tranquila.</p>
                    </div>
                </div>
                </div>
            </section>
          </>
        );
    }
  };

  return (
    <div className="min-h-screen bg-background text-foreground font-sans selection:bg-primary/10 flex flex-col">
      <Header onLogin={onLogin} onGetStarted={onGetStarted} onNavigate={(view) => setCurrentView(view)} />
      
      <div className="flex-1">
        {renderContent()}
      </div>
      
      <footer className="bg-background py-12 border-t border-border text-center mt-auto">
        <div className="flex items-center justify-center gap-2 mb-4 opacity-50">
            <BarChart2 size={20} />
            <span className="font-bold">GrinderScore</span>
        </div>
        <p className="text-muted-foreground text-sm">© 2025 GrinderScore. Todos os direitos reservados.</p>
      </footer>
    </div>
  );
};

export default LandingPage;