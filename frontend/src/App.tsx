import React from 'react';
import { Toaster, toast } from 'react-hot-toast';
import { Bot } from 'lucide-react';

const App: React.FC = () => {
  const handleTestToast = () => {
    toast.success('OmniCustomer Frontend Initialized!');
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4">
      <div className="bg-white shadow-xl rounded-2xl p-8 max-w-md text-center border border-gray-100">
        <div className="flex justify-center mb-6">
          <div className="bg-blue-50 p-4 rounded-full">
            <Bot size={48} className="text-blue-600" />
          </div>
        </div>
        <h1 className="text-3xl font-bold mb-4 text-gray-800">OmniCustomer Agent</h1>
        <p className="text-gray-500 mb-8">
          Enterprise-grade autonomous multi-agent customer operations platform.
        </p>
        <button 
          onClick={handleTestToast}
          className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-6 rounded-xl transition-all shadow-md hover:shadow-lg cursor-pointer"
        >
          Verify System Status
        </button>
      </div>
      <Toaster position="bottom-right" />
    </div>
  );
};

export default App;
