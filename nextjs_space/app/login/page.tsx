'use client';
import { useState } from 'react';
import { signIn } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { Shield, Eye, EyeOff } from 'lucide-react';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [isSignup, setIsSignup] = useState(false);
  const [name, setName] = useState('');
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      if (isSignup) {
        const res = await fetch('/api/signup', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email, password, name }),
        });
        const data = await res.json();
        if (!res.ok) { setError(data?.error || 'Error al registrar'); setLoading(false); return; }
      }
      const result = await signIn('credentials', { email, password, redirect: false });
      if (result?.error) { setError('Credenciales inválidas'); setLoading(false); return; }
      router.replace('/dashboard');
    } catch (err: any) {
      console.error(err);
      setError('Error de conexión');
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-900 via-blue-800 to-teal-700 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-teal-500 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-xl">
            <Shield className="w-9 h-9 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-white">Inventario TIC</h1>
          <p className="text-blue-200 mt-1">Sistema de Auditoría Tecnológica — Reverse</p>
        </div>

        <form onSubmit={handleSubmit} className="bg-white rounded-2xl shadow-2xl p-8 space-y-5">
          <h2 className="text-xl font-semibold text-gray-800 text-center">
            {isSignup ? 'Crear Cuenta' : 'Iniciar Sesión'}
          </h2>

          {error && <div className="bg-red-50 text-red-600 text-sm p-3 rounded-lg text-center">{error}</div>}

          {isSignup && (
            <div>
              <label className="text-sm font-medium text-gray-700">Nombre</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full mt-1 px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none text-gray-800"
                placeholder="Tu nombre"
              />
            </div>
          )}

          <div>
            <label className="text-sm font-medium text-gray-700">Correo electrónico</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full mt-1 px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none text-gray-800"
              placeholder="correo@ejemplo.com"
              required
            />
          </div>

          <div>
            <label className="text-sm font-medium text-gray-700">Contraseña</label>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full mt-1 px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none pr-12 text-gray-800"
                placeholder="••••••••"
                required
              />
              <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 mt-0.5 text-gray-400 hover:text-gray-600">
                {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-700 hover:bg-blue-800 text-white font-medium py-3 rounded-lg transition-colors disabled:opacity-50"
          >
            {loading ? 'Procesando...' : isSignup ? 'Registrarse' : 'Ingresar'}
          </button>

          <p className="text-center text-sm text-gray-500">
            {isSignup ? '¿Ya tienes cuenta?' : '¿No tienes cuenta?'}{' '}
            <button type="button" onClick={() => { setIsSignup(!isSignup); setError(''); }} className="text-blue-600 hover:underline font-medium">
              {isSignup ? 'Iniciar sesión' : 'Regístrate'}
            </button>
          </p>
        </form>
      </div>
    </div>
  );
}
