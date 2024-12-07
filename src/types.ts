export interface Session {
  deviceInfo: string;
  lastActive: number;
  token: string;
}

export interface User {
  id: string;
  name: string;
  username: string;
  email: string;
  avatar?: string;
  status?: string;
  lastSeen: number;
  isOnline: boolean;
  activeSessions?: Session[];
}

export interface Message {
  id: string;
  sender: User;
  recipient: User;
  type: 'text' | 'image' | 'file' | 'audio';
  content: string;
  mediaUrl?: string;
  read: boolean;
  readAt?: number;
  deliveredAt?: number;
  createdAt: number;
  replyTo?: Message;
  deleted?: boolean;
}

export interface Chat {
  id: string;
  participants: User[];
  lastMessage?: Message;
  unreadCount: number;
}

export interface AuthResponse {
  token: string;
  user: User;
}

export interface ApiError {
  message: string;
  error?: string;
}
