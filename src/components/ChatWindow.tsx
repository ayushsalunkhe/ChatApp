import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../contexts/AuthContext.tsx';
import { db, storage } from '../config/firebase.ts';
import EmojiPicker from 'emoji-picker-react';
import { 
  collection, 
  query, 
  orderBy, 
  onSnapshot, 
  addDoc, 
  serverTimestamp,
  updateDoc,
  doc,
  where,
  getDocs
} from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { Chat, Message } from '../types';

interface ChatWindowProps {
  chat: Chat;
  onBack?: () => void;
}

export default function ChatWindow({ chat, onBack }: ChatWindowProps) {
  const { currentUser } = useAuth();
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [isUploading, setIsUploading] = useState(false);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    scrollToBottom();
  }, [chat.id]); // Scroll when chat changes

  useEffect(() => {
    if (!chat || !currentUser) return;

    // Subscribe to messages
    const q = query(
      collection(db, `chats/${chat.id}/messages`),
      orderBy('timestamp', 'asc')
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const messageList: Message[] = [];
      snapshot.forEach((doc) => {
        messageList.push({ id: doc.id, ...doc.data() } as Message);
      });
      setMessages(messageList);
      
      // Scroll to bottom after messages update
      setTimeout(scrollToBottom, 100);

      // Mark messages as read
      messageList.forEach(async (message) => {
        if (message.senderId !== currentUser.uid && !message.read) {
          await updateDoc(doc(db, `chats/${chat.id}/messages/${message.id}`), {
            read: true
          });
        }
      });
    });

    return () => unsubscribe();
  }, [chat, currentUser]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const formatMessageTime = (timestamp: any) => {
    if (!timestamp) return '';
    const date = timestamp.toDate();
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const formatMessageDate = (timestamp: any) => {
    if (!timestamp) return '';
    const date = timestamp.toDate();
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    if (date.toDateString() === today.toDateString()) {
      return 'Today';
    } else if (date.toDateString() === yesterday.toDateString()) {
      return 'Yesterday';
    } else {
      return date.toLocaleDateString([], { 
        weekday: 'long', 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric' 
      });
    }
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim()) return;

    try {
      await addDoc(collection(db, `chats/${chat.id}/messages`), {
        content: newMessage,
        senderId: currentUser?.uid,
        timestamp: serverTimestamp(),
        type: 'text',
        read: false
      });

      setNewMessage('');
    } catch (error) {
      console.error('Error sending message:', error);
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    try {
      const storageRef = ref(storage, `chat-files/${chat.id}/${Date.now()}-${file.name}`);
      await uploadBytes(storageRef, file);
      const downloadURL = await getDownloadURL(storageRef);

      await addDoc(collection(db, `chats/${chat.id}/messages`), {
        content: file.name,
        fileUrl: downloadURL,
        senderId: currentUser?.uid,
        timestamp: serverTimestamp(),
        type: file.type.startsWith('image/') ? 'image' : 'file',
        read: false
      });
    } catch (error) {
      console.error('Error uploading file:', error);
    }
    setIsUploading(false);
  };

  const onEmojiClick = (emojiObject: any) => {
    setNewMessage((prevMessage) => prevMessage + emojiObject.emoji);
    setShowEmojiPicker(false);
  };

  let lastMessageDate = '';

  return (
    <div className="h-full flex flex-col">
      {/* Chat Header */}
      <div className="h-16 bg-white dark:bg-gray-800 flex items-center justify-between px-4 border-b dark:border-gray-700">
        <div className="flex items-center space-x-4">
          {onBack && (
            <button
              onClick={onBack}
              className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full md:hidden"
            >
              ←
            </button>
          )}
          <div className="relative">
            <img
              src={chat.participants[0]?.photoURL || 'https://via.placeholder.com/40'}
              alt="Chat"
              className="w-10 h-10 rounded-full"
            />
            {chat.participants[0]?.status === 'online' && (
              <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-white dark:border-gray-800"></div>
            )}
          </div>
          <div className="flex flex-col">
            <span className="font-medium dark:text-white">
              {chat.participants[0]?.displayName}
            </span>
            <span className="text-xs text-gray-500 dark:text-gray-400">
              {chat.participants[0]?.status === 'online' ? 'online' : 'offline'}
            </span>
          </div>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 chat-background">
        {messages.map((message, index) => {
          const messageDate = formatMessageDate(message.timestamp);
          const showDateDivider = messageDate !== lastMessageDate;
          lastMessageDate = messageDate;

          return (
            <React.Fragment key={message.id}>
              {showDateDivider && (
                <div className="flex justify-center my-4">
                  <span className="bg-white/80 dark:bg-gray-800/80 text-gray-600 dark:text-gray-300 text-xs px-4 py-1 rounded-full shadow-sm backdrop-blur-sm">
                    {messageDate}
                  </span>
                </div>
              )}
              <div
                className={`flex ${message.senderId === currentUser?.uid ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`chat-bubble max-w-[75%] md:max-w-[60%] shadow-sm ${
                    message.senderId === currentUser?.uid ? 'chat-bubble-sent' : 'chat-bubble-received'
                  } relative group`}
                >
                  {message.type === 'text' ? (
                    <p className="break-words">{message.content}</p>
                  ) : message.type === 'image' ? (
                    <div className="relative">
                      <img 
                        src={message.fileUrl} 
                        alt="Shared" 
                        className="max-w-full rounded-lg cursor-pointer hover:opacity-95 transition-opacity"
                        onClick={() => window.open(message.fileUrl, '_blank')}
                      />
                    </div>
                  ) : (
                    <a
                      href={message.fileUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center space-x-2 text-blue-500 hover:text-blue-600 dark:text-blue-400 dark:hover:text-blue-300"
                    >
                      <span>📎</span>
                      <span className="truncate max-w-[200px]">{message.content}</span>
                    </a>
                  )}
                  <div className="flex items-center space-x-1 text-xs mt-1">
                    <span className={message.senderId === currentUser?.uid ? 'text-gray-200' : 'text-gray-500 dark:text-gray-400'}>
                      {formatMessageTime(message.timestamp)}
                    </span>
                    {message.senderId === currentUser?.uid && (
                      <span className={`message-status ${message.read ? 'message-status-read' : 'message-status-sent'}`}>✓{message.read ? '✓' : ''}</span>
                    )}
                  </div>
                </div>
              </div>
            </React.Fragment>
          );
        })}
        <div ref={messagesEndRef} />
      </div>

      {/* Message Input */}
      <form onSubmit={handleSendMessage} className="p-4 bg-white dark:bg-gray-800 border-t dark:border-gray-700">
        <div className="flex items-center space-x-2 md:space-x-4">
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="p-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full transition-colors"
            disabled={isUploading}
          >
            {isUploading ? '📤' : '📎'}
          </button>
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileUpload}
            className="hidden"
            accept="image/*,.pdf,.doc,.docx"
          />
          <div className="relative flex-1">
            <input
              type="text"
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              placeholder="Type a message"
              className="w-full px-4 py-2 rounded-full border message-input"
            />
            <button
              type="button"
              onClick={() => setShowEmojiPicker(!showEmojiPicker)}
              className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
            >
              😊
            </button>
            {showEmojiPicker && (
              <div className="emoji-picker-container">
                <div className="max-h-[350px] overflow-y-auto">
                  <EmojiPicker onEmojiClick={onEmojiClick} />
                </div>
              </div>
            )}
          </div>
          <button
            type="submit"
            disabled={!newMessage.trim()}
            className="p-2 text-white bg-primary hover:bg-primary-dark rounded-full disabled:opacity-50 transition-colors"
          >
            📨
          </button>
        </div>
      </form>
    </div>
  );
}
