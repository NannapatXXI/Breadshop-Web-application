export default function AuthLayout({ children }) {
  return (
    <div style={{
      minHeight: '100vh',
      background: '#0B1F33',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '2rem',
    }}>
     
        {children}
     
    </div>
  );
}