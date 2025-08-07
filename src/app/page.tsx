import ChatInterface from '@/components/ChatInterface';

export default function Home() {
  return (
    <main className="min-h-screen bg-gradient-to-br from-blue-900 to-purple-900 p-4 md:p-8">
      <div className="max-w-4xl mx-auto">
        <header className="text-center mb-8 pt-6">
          <h1 className="text-5xl md:text-6xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-pink-400 drop-shadow-lg">
            The Doc Guy
          </h1>
          <p className="text-cyan-100 mt-3 text-lg">Your document whisperer. Ask anything about your docs!</p>
        </header>
        
        <ChatInterface />
      </div>
    </main>
  );
}