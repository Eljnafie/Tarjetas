import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { signInWithEmailAndPassword, createUserWithEmailAndPassword, signInWithPopup, signInWithRedirect, getRedirectResult, GoogleAuthProvider } from 'firebase/auth';
import { auth, db } from '../firebase/config';
import { setDoc, doc, getDoc } from 'firebase/firestore';
import { useTranslation } from 'react-i18next';
import { Capacitor } from '@capacitor/core';

export const LoginScreen: React.FC = () => {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [isRegister, setIsRegister] = useState(false);

  useEffect(() => {
    const checkRedirect = async () => {
      if (Capacitor.isNativePlatform()) return; // Not supported properly on native capacitor without plugins
      try {
        setLoading(true);
        const result = await getRedirectResult(auth);
        if (result) {
          const userDocRef = doc(db, 'users', result.user.uid);
          const docSnap = await getDoc(userDocRef);
          if (!docSnap.exists()) {
            await setDoc(userDocRef, {
              email: result.user.email,
              createdAt: Date.now()
            });
          }
          navigate('/', { replace: true });
        }
      } catch (err: any) {
        console.error("Redirect result error", err);
      } finally {
        setLoading(false);
      }
    };
    checkRedirect();
  }, []);

  const handleGoogleLogin = async () => {
    if (Capacitor.isNativePlatform()) {
      setError('El inicio de sesión con Google en la app nativa requiere instalación de plugins adicionales. Por favor usa email/contraseña.');
      return;
    }
    
    setLoading(true);
    setError('');
    try {
      const provider = new GoogleAuthProvider();
      await signInWithRedirect(auth, provider);
    } catch (err: any) {
      if (err.code !== 'auth/popup-closed-by-user') {
        setError(err.message);
      }
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      if (isRegister) {
        const userCreds = await createUserWithEmailAndPassword(auth, email, password);
        await setDoc(doc(db, 'users', userCreds.user.uid), {
          email: userCreds.user.email,
          createdAt: Date.now()
        });
        navigate('/', { replace: true });
      } else {
        await signInWithEmailAndPassword(auth, email, password);
        navigate('/', { replace: true });
      }
    } catch (err: any) {
      if (err.code === 'auth/operation-not-allowed') {
        setError('El inicio de sesión con correo y contraseña no está habilitado en Firebase. Usa Google o habilítalo en la consola de Firebase.');
      } else {
        setError(err.message);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-xl p-8">
        <div className="flex justify-between items-start mb-8">
          <div className="flex items-center gap-3">
            <img src="/icon.png" alt="Mas Pins Logo" className="w-12 h-12 rounded-xl shadow-sm" />
            <h1 className="text-3xl font-bold text-gray-900">{t('app_title')}</h1>
          </div>
          <select 
            className="text-sm border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 mt-2"
            value={i18n.language}
            onChange={(e) => i18n.changeLanguage(e.target.value)}
          >
            <option value="es">Español</option>
            <option value="ca">Català</option>
          </select>
        </div>
        
        <h2 className="text-xl font-medium text-gray-700 mb-6">
          {isRegister ? 'Registrarse' : t('login_title')}
        </h2>

        {error && (
          <div className="bg-red-50 text-red-600 p-3 rounded-lg mb-6 text-sm">
            {t('error', { msg: error })}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">{t('email')}</label>
            <input
              type="email"
              required
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">{t('password')}</label>
            <input
              type="password"
              required
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-600 text-white font-medium py-3 rounded-lg hover:bg-blue-700 focus:ring-4 focus:ring-blue-500/50 transition-all disabled:opacity-50"
          >
            {loading ? t('logging_in') : (isRegister ? 'Registrarse' : t('login_btn'))}
          </button>
        </form>

        <div className="mt-6">
          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-300"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-2 bg-white text-gray-500">O ingresa con</span>
            </div>
          </div>

          <button
            onClick={handleGoogleLogin}
            disabled={loading}
            className="mt-6 w-full flex justify-center items-center gap-3 bg-white border border-gray-300 text-gray-700 font-medium py-3 rounded-lg hover:bg-gray-50 focus:ring-4 focus:ring-gray-100 transition-all disabled:opacity-50"
          >
            <svg className="w-5 h-5" viewBox="0 0 24 24">
              <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
              <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
              <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
              <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
            </svg>
            Google
          </button>
        </div>
        
        <div className="mt-8 text-center text-gray-500">
          <button 
            type="button"
            onClick={() => setIsRegister(!isRegister)}
            className="text-sm text-blue-600 hover:underline"
          >
            {isRegister ? '¿Ya tienes cuenta? Inicia sesión' : '¿No tienes cuenta? Regístrate'}
          </button>
        </div>
      </div>
    </div>
  );
};
