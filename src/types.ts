export type OrderStatus = 'pending' | 'completed' | 'cancelled';

export interface UserProfile {
  uid: string;
  name: string;
  email: string;
  storeName: string;
  createdAt: string;
}

export interface Order {
  id: string;
  shopkeeperId: string;
  customerName: string;
  amount: number;
  status: OrderStatus;
  notes?: string;
  createdAt: any; // Firestore Timestamp
  updatedAt?: any; // Firestore Timestamp
}

export interface Message {
  id: string;
  shopkeeperId: string;
  title: string;
  body: string;
  createdAt: any; // Firestore Timestamp
}

export enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

export interface FirestoreErrorInfo {
  error: string;
  operationType: OperationType;
  path: string | null;
  authInfo: {
    userId?: string | null;
    email?: string | null;
    emailVerified?: boolean | null;
    isAnonymous?: boolean | null;
    tenantId?: string | null;
    providerInfo?: {
      providerId?: string | null;
      email?: string | null;
    }[];
  }
}
