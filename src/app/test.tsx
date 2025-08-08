export default function Home() {
  return (
    <div style={{
      padding: '2rem',
      textAlign: 'center',
      fontFamily: 'Arial, sans-serif',
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #1a202c, #4a5568)',
      color: 'white',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center'
    }}>
      <h1 style={{
        fontSize: '3rem',
        marginBottom: '1rem'
      }}>
        The Doc Guy
      </h1>
      <p style={{
        fontSize: '1.2rem',
        marginBottom: '2rem'
      }}>
        This is a simplified test page for Vercel deployment.
      </p>
    </div>
  );
}
