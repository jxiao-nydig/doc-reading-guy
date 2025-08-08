import Link from 'next/link'

export default function DebugPage() {
  return (
    <div style={{
      padding: '2rem',
      maxWidth: '800px',
      margin: '0 auto',
      fontFamily: 'Arial, sans-serif'
    }}>
      <h1>Doc Guy - Debug Page</h1>
      <p>This is a debug page to help diagnose Vercel deployment issues.</p>
      
      <h2>Available Routes</h2>
      <ul>
        <li>
          <Link href="/">Home Page</Link> - The main application
        </li>
        <li>
          <Link href="/test">Test Page</Link> - A simplified test page
        </li>
        <li>
          <Link href="/api/health">API Health Check</Link> - Check if the API is running
        </li>
      </ul>

      <h2>Environment Info</h2>
      <pre style={{
        background: '#f0f0f0',
        padding: '1rem',
        borderRadius: '4px',
        overflowX: 'auto'
      }}>
        {`Node Environment: ${process.env.NODE_ENV}
Next.js Version: ${process.env.NEXT_PUBLIC_VERSION || 'Unknown'}`}
      </pre>
    </div>
  );
}
