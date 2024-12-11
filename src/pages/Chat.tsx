import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext.tsx';
import { db } from '../config/firebase.ts';
import { collection, query, where, getDocs, orderBy, onSnapshot } from 'firebase/firestore';
import { Chat as ChatType, User } from '../types';
import ChatList from '../components/ChatList.tsx';
import ChatWindow from '../components/ChatWindow.tsx';
import Settings from '../components/Settings.tsx';

export default function Chat() {
  const { currentUser } = useAuth();
  const navigate = useNavigate();
  const [users, setUsers] = useState<User[]>([]);
  const [selectedChat, setSelectedChat] = useState<ChatType | null>(null);
  const [showSettings, setShowSettings] = useState(false);
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);
  const [showChatList, setShowChatList] = useState(true);

  useEffect(() => {
    const handleResize = () => {
      const mobile = window.innerWidth <= 768;
      setIsMobile(mobile);
      if (!mobile) {
        setShowChatList(true);
      }
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    if (isMobile && selectedChat) {
      setShowChatList(false);
    }
  }, [selectedChat, isMobile]);

  useEffect(() => {
    if (!currentUser) {
      navigate('/login');
      return;
    }

    const fetchUsers = async () => {
      const q = query(
        collection(db, 'users'),
        where('uid', '!=', currentUser.uid)
      );
      
      const querySnapshot = await getDocs(q);
      const userList: User[] = [];
      querySnapshot.forEach((doc) => {
        userList.push(doc.data() as User);
      });
      setUsers(userList);
    };

    fetchUsers();
  }, [currentUser, navigate]);

  const handleBackToList = () => {
    setShowChatList(true);
    setSelectedChat(null);
  };

  return (
    <div className="h-screen flex bg-gray-100 dark:bg-gray-900">
      {/* Chat List */}
      <div 
        className={`${
          isMobile ? 'absolute inset-0 z-10 bg-white dark:bg-gray-900' : 'w-1/3 min-w-[300px] max-w-[400px]'
        } ${
          isMobile && !showChatList ? 'hidden' : 'block'
        } border-r dark:border-gray-700`}
      >
        <ChatList
          users={users}
          onSelectChat={setSelectedChat}
          selectedChatId={selectedChat?.id}
          onOpenSettings={() => setShowSettings(true)}
        />
      </div>

      {/* Chat Window */}
      <div 
        className={`flex-1 ${
          isMobile && showChatList ? 'hidden' : 'block'
        }`}
      >
        {selectedChat ? (
          <ChatWindow 
            chat={selectedChat} 
            onOpenSettings={() => setShowSettings(true)}
            onBack={isMobile ? handleBackToList : undefined}
          />
        ) : (
          <div className="h-full flex items-center justify-center text-gray-500 dark:text-gray-400">
            Select a chat to start messaging
          </div>
        )}
      </div>

      {/* Settings Modal */}
      {showSettings && (
        <Settings 
          onClose={() => setShowSettings(false)} 
        />
      )}
    </div>
  );
}
