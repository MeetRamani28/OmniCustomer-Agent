import React, { useState } from "react";
import { Toaster } from "react-hot-toast";
import { ChatInterface } from "./components/ChatInterface";
import { AdminDashboard } from "./components/AdminDashboard";
import { LayoutDashboard, MessageSquare } from "lucide-react";

const App: React.FC = () => {
  const [view, setView] = useState<"chat" | "admin">("chat");

  return (
    <div className="min-h-screen bg-slate-50 font-sans flex flex-col">
      <nav className="bg-white border-b border-slate-200 px-6 py-3 flex items-center justify-between shadow-sm sticky top-0 z-50">
        <div className="flex items-center gap-2">
          <div className="bg-blue-600 w-8 h-8 rounded flex items-center justify-center">
            <span className="text-white font-bold text-lg leading-none">O</span>
          </div>
          <span className="font-bold text-slate-800 text-lg tracking-tight">
            OmniCustomer
          </span>
        </div>

        <div className="flex bg-slate-100 p-1 rounded-lg">
          <button
            onClick={() => setView("chat")}
            className={`flex items-center gap-2 px-4 py-1.5 rounded-md text-sm font-medium transition-colors ${
              view === "chat"
                ? "bg-white text-blue-600 shadow-sm"
                : "text-slate-500 hover:text-slate-700"
            }`}
          >
            <MessageSquare size={16} />
            Swarm Interface
          </button>
          <button
            onClick={() => setView("admin")}
            className={`flex items-center gap-2 px-4 py-1.5 rounded-md text-sm font-medium transition-colors ${
              view === "admin"
                ? "bg-white text-blue-600 shadow-sm"
                : "text-slate-500 hover:text-slate-700"
            }`}
          >
            <LayoutDashboard size={16} />
            Admin Control
          </button>
        </div>
      </nav>

      <main className="flex-1 overflow-hidden">
        {view === "chat" ? <ChatInterface /> : <AdminDashboard />}
      </main>

      <Toaster position="top-center" toastOptions={{ duration: 4000 }} />
    </div>
  );
};

export default App;
