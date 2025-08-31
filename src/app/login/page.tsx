'use client'; // Directiva necesaria para componentes con interactividad en Next.js App Router

import { useState, useEffect } from 'react';

// ---- CAMBIO AQUÍ: Se importan más funciones de firebase/app ----
import { initializeApp, getApps, getApp } from 'firebase/app';
import { getAuth, signInWithEmailAndPassword, GoogleAuthProvider, signInWithPopup, getIdToken } from 'firebase/auth';

// --- Configuración de Firebase ---
const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
};

// ---- CAMBIO AQUÍ: Inicialización segura de Firebase para evitar duplicados ----
const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
const auth = getAuth(app);

// Función para establecer la cookie de sesión llamando a nuestra API
async function setSessionCookie(user) {
  const token = await getIdToken(user, true);
  await fetch('/api/auth', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ token }),
  });
}

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [passwordVisible, setPasswordVisible] = useState(false);
  const [error, setError] = useState('');
  
  // Efecto para inicializar los íconos de Feather
  useEffect(() => {
    const script = document.createElement('script');
    script.src = 'https://unpkg.com/feather-icons';
    script.async = true;
    document.body.appendChild(script);

    script.onload = () => {
        if (typeof window !== 'undefined' && window.feather) {
            window.feather.replace();
        }
    };
    
    if (typeof window !== 'undefined' && window.feather) {
        window.feather.replace();
    }

    return () => {
      if (script.parentNode) {
        script.parentNode.removeChild(script);
      }
    }
  }, [passwordVisible]);

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      await setSessionCookie(userCredential.user);
      window.location.href = '/dashboard'; 
    } catch (err) {
      setError('Email o contraseña incorrectos.');
      console.error(err);
    }
  };
  
  const handleGoogleLogin = async () => {
    const provider = new GoogleAuthProvider();
    try {
        const userCredential = await signInWithPopup(auth, provider);
        await setSessionCookie(userCredential.user);
        window.location.href = '/dashboard';
    } catch (err) {
        setError('Error al iniciar sesión con Google.');
        console.error(err);
    }
  };

  return (
    <div className="bg-gray-900 text-white w-screen h-screen">
      <style jsx global>{`
        @import url('https://fonts.googleapis.com/css2?family=Poppins:wght@400;500;600;700&display=swap');
        body {
          font-family: 'Poppins', sans-serif;
          margin: 0;
        }
        @keyframes gradient-animation {
          0% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
          100% { background-position: 0% 50%; }
        }
        .animated-gradient {
          background: linear-gradient(-45deg, #4f46e5, #7c3aed, #db2777, #22d3ee);
          background-size: 400% 400%;
          animation: gradient-animation 15s ease infinite;
        }
        ::placeholder {
          color: #9ca3af;
        }
      `}</style>

      <div className="min-h-full flex items-center justify-center p-4 relative">
        
        <header className="absolute top-0 left-0 w-full z-10 p-6">
            <div className="container mx-auto flex justify-between items-center">
                <div className="flex items-center">
                    <img 
                      src="/images/logo_orderflow.png" 
                      alt="Logo de Orderflow" 
                      className="h-8 w-auto"
                    />
                </div>
            </div>
        </header>

        <main className="w-full max-w-6xl z-0">
            <div className="flex flex-col md:flex-row bg-gray-800 bg-opacity-50 backdrop-blur-lg rounded-2xl shadow-2xl overflow-hidden">
                
                <div className="w-full md:w-1/2 p-8 md:p-12">
                    <h2 className="text-3xl font-bold mb-2">Iniciar Sesión</h2>
                    <p className="text-gray-400 mb-8">Bienvenido de nuevo, te hemos echado de menos.</p>
                    
                    <form onSubmit={handleLogin}>
                        <div className="mb-4">
                            <label htmlFor="email" className="block text-gray-300 mb-2">Email</label>
                            <input 
                              type="email" 
                              id="email" 
                              name="email" 
                              value={email}
                              onChange={(e) => setEmail(e.target.value)}
                              placeholder="Ingresa tu email" 
                              className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-fuchsia-500 transition-all"
                              required
                            />
                        </div>
                        
                        <div className="mb-4 relative">
                            <label htmlFor="password" className="block text-gray-300 mb-2">Password</label>
                            <input 
                              type={passwordVisible ? 'text' : 'password'} 
                              id="password" 
                              name="password" 
                              value={password}
                              onChange={(e) => setPassword(e.target.value)}
                              placeholder="Ingresa tu contraseña" 
                              className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-fuchsia-500 transition-all"
                              required
                            />
                            <button type="button" onClick={() => setPasswordVisible(!passwordVisible)} className="absolute top-1/2 right-4 -translate-y-0.5 text-gray-400 hover:text-white">
                                <i data-feather={passwordVisible ? 'eye-off' : 'eye'} className="w-5 h-5"></i>
                            </button>
                        </div>

                        <div className="flex justify-between items-center mb-6">
                            <div className="flex items-center">
                                <input type="checkbox" id="remember-me" className="w-4 h-4 text-fuchsia-600 bg-gray-700 border-gray-600 rounded focus:ring-fuchsia-500"/>
                                <label htmlFor="remember-me" className="ml-2 text-sm text-gray-300">Remember me</label>
                            </div>
                            <a href="#" className="text-sm text-fuchsia-400 hover:underline">Forgot Password?</a>
                        </div>

                        {error && <p className="text-red-400 text-center mb-4">{error}</p>}

                        <button type="submit" className="w-full bg-fuchsia-600 hover:bg-fuchsia-700 text-white font-bold py-3 px-4 rounded-lg focus:outline-none focus:shadow-outline transition-all transform hover:scale-105">
                            Log In
                        </button>
                    </form>

                    <div className="mt-8 text-center">
                        <p className="text-gray-400 mb-4">O inicia sesión con</p>
                        <div className="flex justify-center space-x-4">
                            <button onClick={handleGoogleLogin} className="w-12 h-12 bg-gray-700 rounded-full flex items-center justify-center hover:bg-gray-600 transition-colors">
                                <svg className="w-6 h-6" viewBox="0 0 48 48"><path fill="#FFC107" d="M43.611 20.083H42V20H24v8h11.303c-1.649 4.657-6.08 8-11.303 8c-6.627 0-12-5.373-12-12s5.373-12 12-12c3.059 0 5.842 1.154 7.961 3.039l5.657-5.657C34.046 6.053 29.268 4 24 4C12.955 4 4 12.955 4 24s8.955 20 20 20s20-8.955 20-20c0-1.341-.138-2.65-.389-3.917z"></path><path fill="#FF3D00" d="M6.306 14.691l6.571 4.819C14.655 15.108 18.961 12 24 12c3.059 0 5.842 1.154 7.961 3.039l5.657-5.657C34.046 6.053 29.268 4 24 4C16.318 4 9.656 8.337 6.306 14.691z"></path><path fill="#4CAF50" d="M24 44c5.166 0 9.86-1.977 13.409-5.192l-6.19-5.238C29.211 35.091 26.715 36 24 36c-5.202 0-9.619-3.317-11.283-7.946l-6.522 5.025C9.505 39.556 16.227 44 24 44z"></path><path fill="#1976D2" d="M43.611 20.083H42V20H24v8h11.303c-.792 2.237-2.231 4.166-4.087 5.571l6.19 5.238C44.572 36.833 48 30.857 48 24c0-1.341-.138-2.65-.389-3.917z"></path></svg>
                            </button>
                        </div>
                    </div>
                </div>

                <div className="hidden md:flex w-1/2 relative items-center justify-center animated-gradient overflow-hidden">
                    <div className="text-center p-12">
                        <h1 className="text-5xl font-bold mb-4">Welcome Back</h1>
                        <p className="text-xl text-gray-200">Accede a tu cuenta y gestiona todo fácilmente.</p>
                    </div>
                    <div className="absolute -bottom-20 -left-20 w-80 h-80 border-4 border-fuchsia-500 rounded-full opacity-20"></div>
                    <div className="absolute -top-20 -right-20 w-80 h-80 border-4 border-blue-500 rounded-full opacity-20"></div>
                </div>
            </div>
        </main>
      </div>
    </div>
  );
}

