import React, { useState } from 'react';
import { supabase } from '../utils/supabaseClient';
import { X, Mail, Lock, LogIn, UserPlus, Loader2 } from 'lucide-react';

export default function AuthModal({ onClose, onAuthSuccess }) {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState(null);
  const [successMsg, setSuccessMsg] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg(null);
    setSuccessMsg(null);

    try {
      if (isLogin) {
        const { data, error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });
        if (error) throw error;
        if (onAuthSuccess) onAuthSuccess(data.user);
      } else {
        const { data, error } = await supabase.auth.signUp({
          email,
          password,
        });
        if (error) throw error;
        setSuccessMsg("¡¡Registro exitoso! Revisa tu correo para confirmar la cuenta (si el envío de correos está activado en Supabase) o inicia sesión directamente.");
        if (data.session && onAuthSuccess) {
          onAuthSuccess(data.user);
        }
      }
    } catch (err) {
      setErrorMsg(err.message || 'Ha ocurrido un error. Verifica tus datos e intenta de nuevo.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-overlay" style={{ animation: 'fadeIn 0.2s ease-out' }}>
      <div className="modal-content auth-modal">
        <button className="modal-close" onClick={onClose}><X size={18} /></button>
        <div style={{ textAlign: 'center', marginBottom: '24px' }}>
          <div style={{ display: 'inline-flex', padding: '12px', background: 'rgba(149, 200, 79, 0.1)', borderRadius: '50%', color: 'var(--olive)', marginBottom: '12px' }}>
            {isLogin ? <LogIn size={28}/> : <UserPlus size={28}/>}
          </div>
          <h2 style={{ margin: 0, color: 'var(--cream)', fontSize: '1.5rem', fontWeight: 600 }}>
            {isLogin ? 'Iniciar Sesión' : 'Crear Cuenta'}
          </h2>
          <p style={{ color: 'var(--sage)', fontSize: '0.9rem', marginTop: '6px' }}>
            {isLogin ? 'Bienvenido de vuelta, compañero.' : 'Únete y guarda tu progreso en la nube.'}
          </p>
        </div>
        
        {errorMsg && (
          <div style={{ background: 'rgba(255, 106, 71, 0.1)', color: 'var(--clay)', padding: '10px 14px', borderRadius: '8px', marginBottom: '16px', fontSize: '0.9rem', display: 'flex', alignItems: 'center', gap: '8px', border: '1px solid rgba(255, 106, 71, 0.2)' }}>
            <span style={{flex: 1}}>{errorMsg}</span>
          </div>
        )}
        
        {successMsg && (
          <div style={{ background: 'rgba(149, 200, 79, 0.1)', color: 'var(--olive)', padding: '10px 14px', borderRadius: '8px', marginBottom: '16px', fontSize: '0.9rem', display: 'flex', alignItems: 'center', gap: '8px', border: '1px solid rgba(149, 200, 79, 0.2)' }}>
            <span style={{flex: 1}}>{successMsg}</span>
          </div>
        )}
        
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div>
            <label style={{ display: 'block', color: 'var(--beige)', fontSize: '0.85rem', marginBottom: '6px', fontWeight: 500 }}>Correo Electrónico</label>
            <div style={{ display: 'flex', alignItems: 'center', background: 'var(--raised)', padding: '10px 14px', borderRadius: '10px', border: '1px solid var(--sage)', transition: 'border-color 0.2s' }} className="input-wrap">
              <Mail size={16} color="var(--sage)" style={{ marginRight: '10px' }}/>
              <input 
                type="email" 
                required 
                value={email} 
                onChange={e => setEmail(e.target.value)} 
                style={{ background: 'transparent', border: 'none', color: 'var(--cream)', width: '100%', outline: 'none', fontSize: '0.95rem' }}
                placeholder="tu@correo.com"
              />
            </div>
          </div>

          <div>
            <label style={{ display: 'block', color: 'var(--beige)', fontSize: '0.85rem', marginBottom: '6px', fontWeight: 500 }}>Contraseña</label>
            <div style={{ display: 'flex', alignItems: 'center', background: 'var(--raised)', padding: '10px 14px', borderRadius: '10px', border: '1px solid var(--sage)', transition: 'border-color 0.2s' }} className="input-wrap">
              <Lock size={16} color="var(--sage)" style={{ marginRight: '10px' }}/>
              <input 
                type="password" 
                required 
                value={password} 
                onChange={e => setPassword(e.target.value)} 
                style={{ background: 'transparent', border: 'none', color: 'var(--cream)', width: '100%', outline: 'none', fontSize: '0.95rem' }}
                placeholder="••••••••"
              />
            </div>
          </div>

          <button 
            type="submit" 
            disabled={loading}
            style={{
              background: 'var(--olive)', color: '#0d1813', border: 'none', padding: '12px', 
              borderRadius: '10px', fontWeight: 600, fontSize: '1rem', cursor: loading ? 'not-allowed' : 'pointer',
              marginTop: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
              transition: 'transform 0.1s, filter 0.2s', filter: loading ? 'brightness(0.8)' : 'brightness(1)'
            }}
            onMouseDown={e => e.currentTarget.style.transform = 'scale(0.98)'}
            onMouseUp={e => e.currentTarget.style.transform = 'scale(1)'}
            onMouseLeave={e => e.currentTarget.style.transform = 'scale(1)'}
          >
            {loading && <Loader2 size={18} className="spin" />}
            {loading ? 'Cargando...' : isLogin ? 'Entrar' : 'Registrarse'}
          </button>
        </form>

        <div style={{ marginTop: '20px', textAlign: 'center', fontSize: '0.9rem', color: 'var(--sage)' }}>
          {isLogin ? "¿No tenés cuenta? " : "¿Ya tenés cuenta? "}
          <button 
            onClick={() => { setIsLogin(!isLogin); setErrorMsg(null); setSuccessMsg(null); setEmail(''); setPassword(''); }}
            style={{ background: 'transparent', border: 'none', color: 'var(--highlight)', cursor: 'pointer', fontWeight: 500, padding: '4px' }}>
            {isLogin ? "Regístrate gratis" : "Inicia sesión"}
          </button>
        </div>
      </div>
    </div>
  );
}
