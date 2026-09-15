import React, { useState } from 'react';
import { supabase } from '../utils/supabaseClient';
import { X, Mail, Lock, LogIn, UserPlus } from 'lucide-react';

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
        setSuccessMsg("¡Listo! Revisa tu correo pa' confirmar la cuenta (si el envío de correos está activado en Supabase) o inicia sesión de una.");
        // Si Supabase auto-confirma, capaz ya devuelve la sesión.
        if (data.session && onAuthSuccess) {
          onAuthSuccess(data.user);
        }
      }
    } catch (err) {
      setErrorMsg(err.message || 'Hubo un peo, revisá tus datos.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-overlay">
      <div className="modal-content auth-modal">
        <button className="modal-close" onClick={onClose}><X size={18} /></button>
        <h2 style={{ marginTop: 0, color: 'var(--olive)', display: 'flex', alignItems: 'center', gap: '8px' }}>
          {isLogin ? <><LogIn size={20}/> Iniciar Sesión</> : <><UserPlus size={20}/> Crear Cuenta</>}
        </h2>
        
        {errorMsg && <div className="alert-error" style={{ color: 'var(--clay)', marginBottom: '1rem', fontSize: '0.9rem' }}>{errorMsg}</div>}
        {successMsg && <div className="alert-success" style={{ color: 'var(--olive)', marginBottom: '1rem', fontSize: '0.9rem' }}>{successMsg}</div>}
        
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <div className="input-group">
            <label style={{ color: 'var(--beige)', fontSize: '0.9rem' }}>Correo Electrónico</label>
            <div style={{ display: 'flex', alignItems: 'center', background: 'var(--raised)', padding: '0.5rem', borderRadius: '4px' }}>
              <Mail size={16} color="var(--sage)" style={{ marginRight: '8px' }}/>
              <input 
                type="email" 
                required 
                value={email} 
                onChange={e => setEmail(e.target.value)} 
                style={{ background: 'transparent', border: 'none', color: 'var(--cream)', width: '100%', outline: 'none' }}
                placeholder="tu@correo.com"
              />
            </div>
          </div>

          <div className="input-group">
            <label style={{ color: 'var(--beige)', fontSize: '0.9rem' }}>Contraseña</label>
            <div style={{ display: 'flex', alignItems: 'center', background: 'var(--raised)', padding: '0.5rem', borderRadius: '4px' }}>
              <Lock size={16} color="var(--sage)" style={{ marginRight: '8px' }}/>
              <input 
                type="password" 
                required 
                value={password} 
                onChange={e => setPassword(e.target.value)} 
                style={{ background: 'transparent', border: 'none', color: 'var(--cream)', width: '100%', outline: 'none' }}
                placeholder="••••••••"
              />
            </div>
          </div>

          <button 
            type="submit" 
            disabled={loading}
            style={{
              background: 'var(--olive)', color: 'var(--pine)', border: 'none', padding: '0.75rem', 
              borderRadius: '4px', fontWeight: 'bold', cursor: loading ? 'not-allowed' : 'pointer',
              marginTop: '0.5rem'
            }}>
            {loading ? 'Cargando...' : isLogin ? 'Entrar' : 'Registrarse'}
          </button>
        </form>

        <div style={{ marginTop: '1rem', textAlign: 'center', fontSize: '0.85rem', color: 'var(--sage)' }}>
          {isLogin ? "¿No tenéis cuenta, primo? " : "¿Ya tenéis cuenta? "}
          <button 
            onClick={() => { setIsLogin(!isLogin); setErrorMsg(null); setSuccessMsg(null); }}
            style={{ background: 'transparent', border: 'none', color: 'var(--highlight)', cursor: 'pointer', textDecoration: 'underline' }}>
            {isLogin ? "Registrate aquí" : "Iniciá sesión"}
          </button>
        </div>
      </div>
    </div>
  );
}
