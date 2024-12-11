export interface User {
  uid: string;
  email: string;
  displayName: string;
  photoURL?: string;
  status?: 'online' | 'offline';
  lastSeen?: Date;
}

export interface Message {
  id: string;
  senderId: string;
  content: string;
  timestamp: Date;
  type: 'text' | 'image' | 'file';
  fileUrl?: string;
}

export interface Chat {
  id: string;
  participants: User[];
  lastMessage?: Message;
  isGroup: boolean;
  groupName?: string;
  groupPhoto?: string;
  createdAt: Date;
  updatedAt: Date;
}
