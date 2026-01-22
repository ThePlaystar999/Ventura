import React, { useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../App';
import VLogo from '../components/VLogo';

const API = process.env.REACT_APP_BACKEND_URL + "/api";

const AuthCallback = () => {
  const navigate = useNavigate();
  const { setUser, checkAuth } = useAuth();
  const hasProcessed = useRef(false);

  useEffect(() => {
    // Use ref to prevent double processing in StrictMode
    if (hasProcessed.current) return;
    hasProcessed.current = true;

    const processAuth = async () => {
      try {
        // Extract session_id from URL hash
        const hash = window.location.hash;
        const sessionIdMatch = hash.match(/session_id=([^&]+)/);
        
        if (!sessionIdMatch) {
          console.error('No session_id found');
          navigate('/');
          return;
        }

        const sessionId = sessionIdMatch[1];

        // Exchange session_id for session_token
        const response = await fetch(`${API}/auth/session`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          credentials: 'include',
          body: JSON.stringify({ session_id: sessionId })
        });

        if (!response.ok) {
          throw new Error('Failed to authenticate');
        }

        const userData = await response.json();
        setUser(userData);

        // Clear hash and redirect to dashboard
        window.history.replaceState(null, '', '/dashboard');
        navigate('/dashboard', { replace: true, state: { user: userData } });
      } catch (error) {
        console.error('Auth error:', error);
        navigate('/');
      }
    };

    processAuth();
  }, [navigate, setUser, checkAuth]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-white to-[#F0F7FF]" data-testid="auth-callback">
      <div className="text-center">
        <div className="flex justify-center mb-6">
          <VLogo size="lg" className="animate-pulse" />
        </div>
        <div className="w-12 h-12 border-4 border-[#0B4DBB] border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
        <p className="text-slate-600 font-medium">Signing you in...</p>
      </div>
    </div>
  );
};

export default AuthCallback;
