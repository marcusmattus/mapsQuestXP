export interface UserProfile {
  uid: string;
  displayName: string;
  photoURL: string;
  xp: number;
  level: number;
  points: number;
  streak: number;
  totalSteps: number;
  lastActive: string;
}

export interface Place {
  id: string;
  name: string;
  category: string;
  lat: number;
  lng: number;
  rewardXP: number;
  rewardPoints: number;
  radius: number; // in meters
  description?: string;
}

export interface CheckIn {
  id: string;
  userId: string;
  placeId: string;
  timestamp: string;
  xpAwarded: number;
}

export interface Challenge {
  id: string;
  title: string;
  description: string;
  type: 'steps' | 'visits';
  target: number;
  rewardXP: number;
  progress: number;
  completed: boolean;
}
