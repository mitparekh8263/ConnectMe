import { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate, Link } from 'react-router-dom';

const Register = () => {
  const [formData, setFormData] = useState({ username: '', email: '', password: '' });
  const [error, setError] = useState('');
  const navigate = useNavigate();

  // 🚀 Added Dark Mode State & Logic
  const [isDark, setIsDark] = useState(localStorage.getItem('theme') === 'dark');

  useEffect(() => {
    if (isDark) {
      document.documentElement.classList.add('dark-mode');
      localStorage.setItem('theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark-mode');
      localStorage.setItem('theme', 'light');
    }
  }, [isDark]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(''); 
    try {
      const res = await axios.post('http://localhost:5000/api/auth/register', formData);
      localStorage.setItem('token', res.data.token);
      localStorage.setItem('userId', res.data.userId);
      localStorage.setItem('username', res.data.username);
      navigate('/');
      window.location.reload(); 
    } catch (err) { setError(err.response?.data?.msg || "Server error during registration"); }
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: "'Inter', sans-serif", padding: '20px', position: 'relative' }}>
      
      {/* 🚀 Floating Dark Mode Toggle */}
      <button 
        onClick={() => setIsDark(!isDark)}
        style={{ position: 'absolute', top: '30px', right: '30px', background: 'var(--bg-card)', border: '1px solid var(--border-color)', fontSize: '1.5rem', cursor: 'pointer', padding: '12px', borderRadius: '50%', color: 'var(--text-main)', boxShadow: 'var(--shadow-sm)', transition: 'all 0.3s ease' }}
        onMouseOver={(e) => e.currentTarget.style.transform = 'scale(1.1)'}
        onMouseOut={(e) => e.currentTarget.style.transform = 'scale(1)'}
      >
        {isDark ? '☀️' : '🌙'}
      </button>

      {/* Card UI using CSS Variables */}
      <div style={{ backgroundColor: 'var(--bg-card)', padding: '50px 40px', borderRadius: '24px', boxShadow: 'var(--shadow-sm)', width: '100%', maxWidth: '420px', border: '1px solid var(--glass-border)', backdropFilter: 'blur(10px)' }}>
        
        <div style={{ textAlign: 'center', marginBottom: '35px' }}>
          <div style={{ fontSize: '3rem', marginBottom: '10px' }}>⚡</div>
          <h2 style={{ fontSize: '2.2rem', fontWeight: '900', color: 'var(--text-main)', margin: '0 0 10px 0', letterSpacing: '-1px' }}>Join the Network</h2>
          <p style={{ color: 'var(--text-muted)', margin: 0, fontSize: '1rem', fontWeight: '500' }}>Create an account to connect with friends.</p>
        </div>

        {error && <div style={{ backgroundColor: '#fef2f2', color: '#ef4444', padding: '12px', borderRadius: '8px', marginBottom: '20px', fontSize: '0.9rem', fontWeight: '600', textAlign: 'center', border: '1px solid #fee2e2' }}>{error}</div>}

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <div>
            <label style={{ display: 'block', marginBottom: '8px', fontSize: '0.85rem', fontWeight: '800', color: 'var(--text-muted)', letterSpacing: '0.5px' }}>USERNAME</label>
            <input type="text" placeholder="johndoe123" value={formData.username} onChange={(e) => setFormData({ ...formData, username: e.target.value })} required style={{ width: '100%', padding: '16px', borderRadius: '12px', border: '2px solid var(--border-color)', backgroundColor: 'var(--input-bg)', color: 'var(--text-main)', outline: 'none', fontSize: '1.05rem', boxSizing: 'border-box', transition: 'all 0.2s', fontWeight: '500' }} onFocus={(e) => { e.target.style.borderColor = '#4f46e5'; }} onBlur={(e) => { e.target.style.borderColor = 'var(--border-color)'; }} />
          </div>
          
          <div>
            <label style={{ display: 'block', marginBottom: '8px', fontSize: '0.85rem', fontWeight: '800', color: 'var(--text-muted)', letterSpacing: '0.5px' }}>EMAIL ADDRESS</label>
            <input type="email" placeholder="john@example.com" value={formData.email} onChange={(e) => setFormData({ ...formData, email: e.target.value })} required style={{ width: '100%', padding: '16px', borderRadius: '12px', border: '2px solid var(--border-color)', backgroundColor: 'var(--input-bg)', color: 'var(--text-main)', outline: 'none', fontSize: '1.05rem', boxSizing: 'border-box', transition: 'all 0.2s', fontWeight: '500' }} onFocus={(e) => { e.target.style.borderColor = '#4f46e5'; }} onBlur={(e) => { e.target.style.borderColor = 'var(--border-color)'; }} />
          </div>

          <div>
            <label style={{ display: 'block', marginBottom: '8px', fontSize: '0.85rem', fontWeight: '800', color: 'var(--text-muted)', letterSpacing: '0.5px' }}>PASSWORD</label>
            <input type="password" placeholder="••••••••" value={formData.password} onChange={(e) => setFormData({ ...formData, password: e.target.value })} required style={{ width: '100%', padding: '16px', borderRadius: '12px', border: '2px solid var(--border-color)', backgroundColor: 'var(--input-bg)', color: 'var(--text-main)', outline: 'none', fontSize: '1.05rem', boxSizing: 'border-box', transition: 'all 0.2s', fontWeight: '500' }} onFocus={(e) => { e.target.style.borderColor = '#4f46e5'; }} onBlur={(e) => { e.target.style.borderColor = 'var(--border-color)'; }} />
          </div>

          <button type="submit" style={{ width: '100%', padding: '16px', backgroundColor: '#4f46e5', color: '#ffffff', border: 'none', borderRadius: '12px', fontSize: '1.1rem', fontWeight: '800', cursor: 'pointer', marginTop: '10px', transition: 'all 0.2s', boxShadow: '0 4px 14px 0 rgba(79, 70, 229, 0.39)' }} onMouseOver={(e) => e.target.style.transform = 'translateY(-2px)'} onMouseOut={(e) => e.target.style.transform = 'translateY(0)'}>
            Create Account
          </button>
        </form>

        <p style={{ textAlign: 'center', marginTop: '30px', fontSize: '1rem', color: 'var(--text-muted)', fontWeight: '500' }}>
          Already have an account? <Link to="/login" style={{ color: '#4f46e5', fontWeight: '800', textDecoration: 'none' }}>Log In</Link>
        </p>

      </div>
    </div>
  );
};

export default Register;