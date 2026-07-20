import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useState, useEffect } from 'react';

const Navbar = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const isAuthenticated = !!localStorage.getItem('token');
  const currentUsername = localStorage.getItem('username') || "User";
  
  // Dark Mode Logic inside Navbar
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

  const handleLogout = () => {
    if (!window.confirm("Are you sure you want to log out?")) return;
    localStorage.clear();
    navigate('/login');
    window.location.reload();
  };

  if (!isAuthenticated) return null; 

  return (
    <nav style={{ position: 'sticky', top: 0, backgroundColor: 'var(--bg-nav)', backdropFilter: 'blur(12px)', WebkitBackdropFilter: 'blur(12px)', borderBottom: '1px solid var(--glass-border)', zIndex: 1000, padding: '15px 40px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', boxShadow: 'var(--shadow-sm)', transition: 'all 0.3s ease' }}>
      <Link to="/" style={{ textDecoration: 'none', color: 'var(--text-main)', fontSize: '1.6rem', fontWeight: '900', letterSpacing: '-1px', display: 'flex', alignItems: 'center', gap: '8px' }}>
        ⚡ Connect<span style={{ color: '#4f46e5' }}>Me</span>
      </Link>
      
      <div style={{ display: 'flex', gap: '15px', alignItems: 'center' }}>
        <Link to="/" style={{ textDecoration: 'none', color: location.pathname === '/' ? '#4f46e5' : 'var(--text-muted)', fontWeight: '800', fontSize: '1.05rem', padding: '10px 18px', borderRadius: '12px', backgroundColor: location.pathname === '/' ? '#e0e7ff' : 'transparent', transition: 'all 0.2s ease' }}>🌍 Feed</Link>
        <Link to="/profile" style={{ textDecoration: 'none', color: location.pathname === '/profile' ? '#4f46e5' : 'var(--text-muted)', fontWeight: '800', fontSize: '1.05rem', padding: '10px 18px', borderRadius: '12px', backgroundColor: location.pathname === '/profile' ? '#e0e7ff' : 'transparent', transition: 'all 0.2s ease' }}>👤 Profile</Link>
        
        <div style={{ height: '30px', width: '2px', backgroundColor: 'var(--border-color)', margin: '0 10px' }}></div>
        
        {/* Dark Mode Toggle */}
        <button onClick={() => setIsDark(!isDark)} style={{ background: 'none', border: 'none', fontSize: '1.2rem', cursor: 'pointer', marginRight: '10px', padding: '8px', borderRadius: '50%', backgroundColor: 'var(--hover-bg)' }}>
          {isDark ? '☀️' : '🌙'}
        </button>

        <span style={{ fontWeight: '700', color: 'var(--text-muted)', fontSize: '0.95rem', marginRight: '10px' }}>Hello, {currentUsername}</span>
        <button onClick={handleLogout} style={{ backgroundColor: '#fef2f2', color: '#ef4444', border: 'none', padding: '10px 18px', borderRadius: '10px', fontWeight: '700', cursor: 'pointer', transition: 'all 0.2s', fontSize: '0.95rem' }}>Logout</button>
      </div>
    </nav>
  );
};

export default Navbar;