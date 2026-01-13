
export type UserID = 'husband' | 'wife';

export interface UserProfile {
  name: string;
  avatar: string;
}

export interface IncomeRecord {
  id: string;
  amount: number;
  source: string;
  category: string;
  timestamp: number;
  userId: UserID;
}

export type WishStatus = 'pending' | 'ongoing' | 'completed';

export interface Wish {
  id: string;
  title: string;
  targetAmount: number;
  currentSavedAmount: number;
  status: WishStatus;
  imageUrl: string;
  userId: UserID;
  isPinned?: boolean;
}

export type Tab = 'income' | 'wishlist';

export interface FamilyConfig {
  familyId: string | null;
  pairedUserId: UserID | null;
  pairingCode?: string;
}
