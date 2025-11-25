import React, { useState } from 'react';
import { loginUser, registerUser } from '../services/storageService';
import { User } from '../types';
import { BarChart2, Loader2, Lock, ArrowLeft } from 'lucide-react';
import { Button } from './ui/button'; // Re-use Shadcn button if preferred, or keep standard

interface AuthProps {
  onAuthSuccess: (user: User) => void;
  onCancel: () => void;
  initialMode?: 'LOGIN' | 'REGISTER';
}

const Auth: React.FC<AuthProps> = ({ onAuthSuccess, onCancel, initialMode = 'LOGIN' }) => {
  const [isLogin, setIsLogin] = useState(initialMode === 'LOGIN');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccessMsg('');

    try {
      if (isLogin) {
        const { user, error } = await loginUser(email, password);
        if (error) {
           setError('Erro ao entrar. Verifique suas credenciais.');
           console.error(error);
        } else if (user) {
          onAuthSuccess(user);
        }
      } else {
        if (!name) {
          setError('Nome é obrigatório.');
          setLoading(false);
          return;
        }
        const { user, error } = await registerUser(name, email, password);
         if (error) {
           setError('Erro ao cadastrar. Tente novamente.');
           console.error(error);
        } else if (user) {
           // Registration successful. 
           // If Supabase returns a user session immediately, onAuthSuccess will log them in.
           // If email confirmation is required, we might not get a session immediately depending on config.
           // Assuming default "Log them in" behavior from storageService implementation.
           setSuccessMsg('Conta criada com sucesso! Entrando...');
           setTimeout(() => {
               onAuthSuccess(user);
           }, 800);
        }
      }
    } catch (err: any) {
      setError(err.message || 'Erro inesperado.');
    } finally {
      if (!successMsg) setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4 animate-fade-in">
      <div className="bg-white rounded-2xl shadow-xl border border-gray-100 p-8 w-full max-w-md relative overflow-hidden">
        
        {/* Simple decorative header */}
        <div className="flex justify-center mb-6">
          <div className="bg-gray-900 text-white p-3 rounded-xl shadow-lg shadow-gray-200">
            <BarChart2 size={32} />
          </div>
        </div>
        
        <h2 className="text-2xl font-bold text-center text-gray-900 mb-2 tracking-tight">
          {isLogin ? 'Bem-vindo de volta' : 'Crie sua conta'}
        </h2>
        <p className="text-center text-gray-500 mb-8 text-sm">
          {isLogin ? 'Acesse seu diário e analytics.' : 'Comece a registrar sua jornada hoje.'}
        </p>

        <form onSubmit={handleSubmit} className="space-y-4">
          {!isLogin && (
            <div className="animate-fade-in-up">
              <label className="block text-sm font-medium text-gray-700 mb-1">Nome</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-gray-900 focus:ring-1 focus:ring-gray-900 outline-none transition-all"
                placeholder="Seu nome"
                required={!isLogin}
              />
            </div>
          )}
          <div className="animate-fade-in-up" style={{animationDelay: '0.05s'}}>
            <label className="block text-sm font-medium text-gray-700 mb-1">E-mail</label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-gray-900 focus:ring-1 focus:ring-gray-900 outline-none transition-all"
              placeholder="seu@email.com"
            />
          </div>
          
           <div className="animate-fade-in-up" style={{animationDelay: '0.1s'}}>
            <label className="block text-sm font-medium text-gray-700 mb-1">Senha</label>
            <div className="relative">
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-gray-900 focus:ring-1 focus:ring-gray-900 outline-none transition-all"
                placeholder="••••••••"
                minLength={6}
              />
              <Lock className="absolute right-3 top-3.5 text-gray-400" size={18} />
            </div>
          </div>

          {error && <div className="text-red-600 text-sm text-center bg-red-50 p-3 rounded-lg border border-red-100 animate-fade-in">{error}</div>}
          {successMsg && <div className="text-emerald-600 text-sm text-center bg-emerald-50 p-3 rounded-lg border border-emerald-100 animate-fade-in">{successMsg}</div>}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-gray-900 hover:bg-gray-800 text-white font-semibold py-3.5 rounded-xl transition-all shadow-lg shadow-gray-200 flex justify-center items-center mt-6"
          >
            {loading ? <Loader2 className="animate-spin" /> : (isLogin ? 'Entrar' : 'Cadastrar')}
          </button>
        </form>

        <div className="mt-6 text-center">
          <button
            type="button"
            onClick={() => { setIsLogin(!isLogin); setError(''); }}
            className="text-sm text-gray-500 hover:text-gray-900 font-medium transition-colors"
          >
            {isLogin ? 'Não tem uma conta? Cadastre-se' : 'Já tem conta? Entrar'}
          </button>
        </div>
        
        <div className="mt-8 text-center border-t border-gray-100 pt-4">
             <button onClick={onCancel} className="text-xs text-gray-400 hover:text-gray-600 flex items-center justify-center gap-1 w-full">
                <ArrowLeft size={12} /> Voltar ao início
             </button>
        </div>
      </div>
    </div>
  );
};

export default Auth;