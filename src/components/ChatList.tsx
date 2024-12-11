import React, { useEffect, useState } from 'react';
import { User, Chat, Message } from '../types';
import { db } from '../config/firebase.ts';
import { collection, query, orderBy, limit, onSnapshot, where } from 'firebase/firestore';
import { useAuth } from '../contexts/AuthContext.tsx';
import ChatHeader from './ChatHeader.tsx';

interface ChatListProps {
  users: User[];
  selectedChat: Chat | null;
  onSelectChat: (chat: Chat) => void;
  onOpenSettings: () => void;
}

interface LastMessage {
  userId: string;
  message: Message | null;
  unreadCount: number;
}

export default function ChatList({ users, selectedChat, onSelectChat, onOpenSettings }: ChatListProps) {
  const { currentUser } = useAuth();
  const [lastMessages, setLastMessages] = useState<{ [key: string]: LastMessage }>({});

  useEffect(() => {
    if (!currentUser) return;

    // Subscribe to last messages for each user
    const unsubscribes = users.map(user => {
      const chatId = [currentUser.uid, user.uid].sort().join('_');
      const messagesRef = collection(db, 'chats', chatId, 'messages');
      
      // Query for last message and unread count
      const lastMessageQuery = query(
        messagesRef,
        orderBy('timestamp', 'desc'),
        limit(1)
      );

      const unreadQuery = query(
        messagesRef,
        where('senderId', '==', user.uid),
        where('read', '==', false)
      );

      // Subscribe to last message
      const messageUnsub = onSnapshot(lastMessageQuery, (snapshot) => {
        const lastMessage = snapshot.docs[0]?.data() as Message;
        setLastMessages(prev => ({
          ...prev,
          [user.uid]: {
            ...prev[user.uid],
            userId: user.uid,
            message: lastMessage || null
          }
        }));
      });

      // Subscribe to unread count
      const unreadUnsub = onSnapshot(unreadQuery, (snapshot) => {
        setLastMessages(prev => ({
          ...prev,
          [user.uid]: {
            ...prev[user.uid],
            userId: user.uid,
            unreadCount: snapshot.size
          }
        }));
      });

      return () => {
        messageUnsub();
        unreadUnsub();
      };
    });

    return () => {
      unsubscribes.forEach(unsub => unsub());
    };
  }, [users, currentUser]);

  const formatTime = (timestamp: any) => {
    if (!timestamp) return '';
    const date = timestamp.toDate();
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const oneDay = 24 * 60 * 60 * 1000;

    if (diff < oneDay && date.getDate() === now.getDate()) {
      // Today: show time
      return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    } else if (diff < 7 * oneDay) {
      // This week: show day name
      return date.toLocaleDateString([], { weekday: 'short' });
    } else {
      // Older: show date
      return date.toLocaleDateString([], { day: '2-digit', month: '2-digit', year: '2-digit' });
    }
  };

  return (
    <div className="h-full flex flex-col">
      <ChatHeader onOpenSettings={onOpenSettings} />
      <div className="flex-1 overflow-y-auto h-[calc(100vh-4rem)]">
        {users.map((user) => {
          const lastMessage = lastMessages[user.uid]?.message;
          const unreadCount = lastMessages[user.uid]?.unreadCount || 0;
          
          return (
            <div
              key={user.uid}
              onClick={() => onSelectChat({ id: [currentUser.uid, user.uid].sort().join('_'), participants: [user] } as Chat)}
              className={`flex items-center space-x-4 p-4 hover:bg-gray-200 dark:hover:bg-gray-800 cursor-pointer ${
                selectedChat?.id === [currentUser.uid, user.uid].sort().join('_') ? 'bg-gray-200 dark:bg-gray-800' : ''
              }`}
            >
              <div className="relative">
                <img
                  src={user.photoURL || 'https://via.placeholder.com/40'}
                  alt={user.displayName}
                  className="w-12 h-12 rounded-full"
                />
                {user.status === 'online' && (
                  <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-white"></div>
                )}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex justify-between items-baseline">
                  <h3 className="text-sm font-medium truncate dark:text-white">
                    {user.displayName}
                  </h3>
                  {lastMessage && (
                    <span className="text-xs text-gray-500 dark:text-gray-400">
                      {formatTime(lastMessage.timestamp)}
                    </span>
                  )}
                </div>
                <div className="flex justify-between items-center">
                  <p className="text-sm text-gray-500 dark:text-gray-400 truncate max-w-[200px]">
                    {lastMessage ? (
                      <>
                        {lastMessage.senderId === currentUser.uid && (
                          <span className="mr-1">
                            {lastMessage.read ? '✓✓' : '✓'}
                          </span>
                        )}
                        {lastMessage.type === 'text' 
                          ? lastMessage.content 
                          : lastMessage.type === 'image' 
                            ? '📷 Photo' 
                            : '📎 File'}
                      </>
                    ) : (
                      'No messages yet'
                    )}
                  </p>
                  {unreadCount > 0 && (
                    <span className="ml-2 bg-primary text-white text-xs rounded-full px-2 py-1">
                      {unreadCount}
                    </span>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
