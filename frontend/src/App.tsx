import { useState } from 'react';
import { Sidebar } from './components/Sidebar';
import { ChatArea } from './components/ChatArea';
import { AuthScreen } from './components/AuthScreen';
import { InferencesModal } from './components/InferencesModal';
import { sendChatMessage, type Memory } from './services/api';
import { AuthProvider, useAuth } from './context/AuthContext';

interface Message {
  role: 'user' | 'assistant';
  content: string;
}

function MainApp() {
  const { isAuthenticated, logout } = useAuth();
  const [messages, setMessages] = useState<Message[]>([]);
  const [currentMemories, setCurrentMemories] = useState<Memory[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isInferencesOpen, setIsInferencesOpen] = useState(false);
  
  const [sessionId] = useState(() => 'session_' + Math.random().toString(36).substring(2, 9));

  if (!isAuthenticated) {
    return <AuthScreen />;
  }

  const handleSendMessage = async (text: string) => {
    const userMsg: Message = { role: 'user', content: text };
    setMessages(prev => [...prev, userMsg]);
    setIsLoading(true);
    setCurrentMemories([]);
    setMessages(prev => [...prev, { role: 'assistant', content: '' }]);

    await sendChatMessage(
      text,
      sessionId,
      (chunk) => {
        setMessages(prev => {
          const newMessages = [...prev];
          const lastIndex = newMessages.length - 1;
          const lastMsg = newMessages[lastIndex];
          if (lastMsg.role === 'assistant') {
            newMessages[lastIndex] = { ...lastMsg, content: lastMsg.content + chunk };
          }
          return newMessages;
        });
      },
      (memories) => {
        setCurrentMemories(memories);
      },
      (error) => {
        if (error === "UNAUTHORIZED") {
          logout();
          return;
        }
        console.error(error);
        setMessages(prev => {
          const newMessages = [...prev];
          const lastIndex = newMessages.length - 1;
          const lastMsg = newMessages[lastIndex];
          if (lastMsg.role === 'assistant' && !lastMsg.content) {
            newMessages[lastIndex] = { ...lastMsg, content: `Error: ${error}` };
          }
          return newMessages;
        });
        setIsLoading(false);
      }
    );
    
    setIsLoading(false);
  };

  return (
    <div className="flex h-screen w-full bg-background overflow-hidden font-sans selection:bg-primary/30">
      <ChatArea 
        messages={messages}
        isLoading={isLoading}
        onSendMessage={handleSendMessage}
        onToggleSidebar={() => setIsSidebarOpen(true)}
      />
      <Sidebar 
        isOpen={isSidebarOpen} 
        onClose={() => setIsSidebarOpen(false)} 
        memories={currentMemories}
        onOpenProfile={() => setIsInferencesOpen(true)}
      />
      
      <InferencesModal 
        isOpen={isInferencesOpen} 
        onClose={() => setIsInferencesOpen(false)} 
      />

      {isSidebarOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-30 md:hidden backdrop-blur-sm transition-opacity"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}
    </div>
  );
}

function App() {
  return (
    <AuthProvider>
      <MainApp />
    </AuthProvider>
  );
}

export default App;
