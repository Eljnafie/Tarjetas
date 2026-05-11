export interface Child {
  id: string;
  name: string;
  photoUrl?: string;
  expirationDate: number; // timestamp in ms
  notes?: string;
  isLost?: boolean;
  ownerId: string;
  createdAt: number;
  updatedAt: number;
}

export interface User {
  id: string;
  email: string;
  createdAt: number;
}
