import { useLocation } from 'react-router-dom';

const Footer = () => {
  const location = useLocation();
  const isAuthPage = location.pathname === '/login' || location.pathname === '/register';

  if (isAuthPage) return null;

  return (
    <footer style={{ width: '100%', padding: '40px 20px', marginTop: 'auto', borderTop: '1px solid var(--glass-border)', backgroundColor: 'var(--bg-nav)', backdropFilter: 'blur(10px)', textAlign: 'center', color: 'var(--text-muted)', boxSizing: 'border-box' }}>
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '10px' }}>
        <div style={{ fontSize: '1.5rem' }}>⚡</div>
        <p style={{ margin: 0, fontSize: '0.95rem', fontWeight: '500', textTransform: 'uppercase', letterSpacing: '1px' }}>Designed & Engineered By</p>
        <p style={{ margin: 0, fontSize: '1.2rem', fontWeight: '900', background: 'linear-gradient(135deg, #4f46e5 0%, #10b981 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
          Shrey Kathiriya • Mit Parekh • Harshil Talaviya
        </p>
        <p style={{ margin: 0, fontSize: '0.85rem', opacity: 0.7, marginTop: '10px' }}>
          © {new Date().getFullYear()} ConnectMe Network. All rights reserved.
        </p>
      </div>
    </footer>
  );
};

export default Footer;