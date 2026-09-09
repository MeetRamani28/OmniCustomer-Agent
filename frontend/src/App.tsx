import React from 'react';
import { Toaster } from 'react-hot-toast';
import { ChatInterface } from './components/ChatInterface.tsx';

const App: React.FC = () => {
  return (
    <div className="min-h-screen bg-slate-50 font-sans">
      <ChatInterface />
      <Toaster position="top-center" toastOptions={{ duration: 4000 }} />
    </div>
  );
};

export default App;
