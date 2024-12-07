import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Message, User } from '../types';
import { motion } from 'framer-motion';
import { Send, Settings, LogOut, Check, CheckCheck } from 'lucide-react';
import ViewAvatar from './ViewAvatar';

const POLLING_INTERVAL = 1000; // 1 second

function UserAvatar({ name, avatar, onClick, isOnline }: { 
  name: string; 
  avatar?: string; 
  onClick?: () => void;
  isOnline?: boolean;
}) {
  return (
    <div className="relative">
      {avatar ? (
        <div 
          className="w-10 h-10 rounded-full overflow-hidden cursor-pointer"
          onClick={onClick}
        >
          <img src={avatar} alt={name} className="w-full h-full object-cover" />
        </div>
      ) : (
        <div 
          className="w-10 h-10 rounded-full bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center text-white font-medium cursor-pointer"
          onClick={onClick}
        >
          {name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)}
        </div>
      )}
      {isOnline && (
        <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-white"></div>
      )}
    </div>
  );
}

export default function Chat() {
  const { currentUser, logout } = useAuth();
  const navigate = useNavigate();
  const [users, setUsers] = useState<User[]>([]);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [message, setMessage] = useState('');
  const [messages, setMessages] = useState<Message[]>([]);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [viewingAvatar, setViewingAvatar] = useState<{isOpen: boolean; user: User | null}>({
    isOpen: false,
    user: null
  });
  const [isTyping, setIsTyping] = useState(false);

  useEffect(() => {
    if (!currentUser) {
      navigate('/login');
      return;
    }

    // Initial load
    const loadData = () => {
      const allUsers = JSON.parse(localStorage.getItem('users') || '[]');
      setUsers(allUsers.filter((user: User) => user.username !== currentUser.username));
      const storedMessages = JSON.parse(localStorage.getItem('messages') || '[]');
      setMessages(storedMessages);
    };

    loadData();

    // Set up polling for updates
    const interval = setInterval(() => {
      loadData();
    }, POLLING_INTERVAL);

    return () => clearInterval(interval);
  }, [currentUser, navigate]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const isUserOnline = (user: User) => {
    return user.lastSeen && Date.now() - user.lastSeen < 60000; // Within last minute
  };

  const handleTyping = (e: React.ChangeEvent<HTMLInputElement>) => {
    setMessage(e.target.value);
    setIsTyping(e.target.value.length > 0);
  };

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!message.trim() || !selectedUser || !currentUser) return;

    const newMessage: Message = {
      id: Date.now().toString(),
      sender: currentUser, 
      recipient: selectedUser, 
      content: message.trim(),
      type: 'text', 
      createdAt: Date.now(),
      read: false
    };

    const updatedMessages = [...messages, newMessage];
    setMessages(updatedMessages);
    localStorage.setItem('messages', JSON.stringify(updatedMessages));
    setMessage('');
  };

  const handleViewAvatar = (user: User) => {
    setViewingAvatar({ isOpen: true, user });
  };

  // Mark messages as read
  useEffect(() => {
    if (selectedUser && currentUser) {
      const updatedMessages = messages.map(msg => {
        if (msg.sender.id === selectedUser.username && 
            msg.recipient.id === currentUser.username && 
            !msg.read) {
          return { ...msg, read: true };
        }
        return msg;
      });

      if (JSON.stringify(messages) !== JSON.stringify(updatedMessages)) {
        setMessages(updatedMessages);
        localStorage.setItem('messages', JSON.stringify(updatedMessages));
      }
    }
  }, [messages, selectedUser, currentUser]);

  const filteredMessages = messages.filter(
    msg => 
      (msg.sender.id === currentUser?.id && msg.recipient.id === selectedUser?.id) ||
      (msg.sender.id === selectedUser?.id && msg.recipient.id === currentUser?.id)
  );

  return (
    <div className="h-screen flex bg-gray-50 dark:bg-gray-900">
      {viewingAvatar.user && (
        <ViewAvatar
          isOpen={viewingAvatar.isOpen}
          onClose={() => setViewingAvatar({ isOpen: false, user: null })}
          avatar={viewingAvatar.user.avatar}
          name={viewingAvatar.user.name}
        />
      )}

      {/* Sidebar */}
      <div className="w-80 bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700">
        <div className="p-4 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <UserAvatar
                name={currentUser?.name || ''}
                avatar={currentUser?.avatar}
                onClick={() => currentUser && handleViewAvatar(currentUser)}
                isOnline={true}
              />
              <div>
                <h2 className="font-semibold text-gray-900 dark:text-white">{currentUser?.name}</h2>
                <p className="text-sm text-gray-500">@{currentUser?.username}</p>
              </div>
            </div>
            <div className="flex space-x-2">
              <button
                onClick={() => navigate('/profile')}
                className="p-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300"
              >
                <Settings size={20} />
              </button>
              <button
                onClick={handleLogout}
                className="p-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300"
              >
                <LogOut size={20} />
              </button>
            </div>
          </div>
        </div>

        <div className="overflow-y-auto h-[calc(100vh-73px)]">
          {users.map(user => (
            <button
              key={user.username}
              onClick={() => setSelectedUser(user)}
              className={`w-full p-4 flex items-center space-x-3 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors ${
                selectedUser?.username === user.username ? 'bg-gray-50 dark:bg-gray-700' : ''
              }`}
            >
              <UserAvatar
                name={user.name}
                avatar={user.avatar}
                onClick={(e) => {
                  e.stopPropagation();
                  handleViewAvatar(user);
                }}
                isOnline={isUserOnline(user)}
              />
              <div className="text-left flex-1">
                <h3 className="font-medium text-gray-900 dark:text-white">{user.name}</h3>
                <p className="text-sm text-gray-500">
                  {isTyping && user.username === selectedUser?.username ? (
                    <span className="text-indigo-500">typing...</span>
                  ) : (
                    `@${user.username}`
                  )}
                </p>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Chat Area */}
      <div className="flex-1 flex flex-col">
        {selectedUser ? (
          <>
            {/* Chat Header */}
            <div className="p-4 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
              <div className="flex items-center space-x-3">
                <UserAvatar
                  name={selectedUser.name}
                  avatar={selectedUser.avatar}
                  onClick={() => handleViewAvatar(selectedUser)}
                  isOnline={isUserOnline(selectedUser)}
                />
                <div>
                  <h2 className="font-semibold text-gray-900 dark:text-white">{selectedUser.name}</h2>
                  <p className="text-sm text-gray-500">
                    {isTyping ? (
                      <span className="text-indigo-500">typing...</span>
                    ) : isUserOnline(selectedUser) ? (
                      <span className="text-green-500">online</span>
                    ) : (
                      <span>
                        last seen {new Date(selectedUser.lastSeen || Date.now()).toLocaleString()}
                      </span>
                    )}
                  </p>
                </div>
              </div>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {filteredMessages.map(msg => (
                <div key={msg.id} className={`flex ${msg.sender.id === currentUser?.id ? 'justify-end' : 'justify-start'}`}>
                  <div className={`max-w-[70%] p-3 rounded-lg ${msg.sender.id === currentUser?.id ? 'bg-indigo-600 text-white' : 'bg-gray-200 dark:bg-gray-700 text-gray-900 dark:text-white'}`}>
                    <p>{msg.content}</p>
                    <div className={`flex items-center justify-end gap-1 mt-1 text-xs ${msg.sender.id === currentUser?.id ? 'text-indigo-200' : 'text-gray-500 dark:text-gray-400'}`}>
                      <span>{new Date(msg.createdAt).toLocaleTimeString()}</span>
                      {msg.sender.id === currentUser?.id && (msg.read ? <CheckCheck size={14} /> : <Check size={14} />)}
                    </div>
                  </div>
                </div>
              ))}
              <div ref={messagesEndRef} />
            </div>

            {/* Message Input */}
            <form onSubmit={handleSendMessage} className="p-4 bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700">
              <div className="flex space-x-4">
                <input
                  type="text"
                  value={message}
                  onChange={handleTyping}
                  placeholder="Type a message..."
                  className="flex-1 p-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:text-white"
                />
                <button
                  type="submit"
                  disabled={!message.trim()}
                  className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <Send size={20} />
                </button>
              </div>
            </form>
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center">
            <p className="text-gray-500 dark:text-gray-400">Select a user to start chatting</p>
          </div>
        )}
      </div>
    </div>
  );
}
