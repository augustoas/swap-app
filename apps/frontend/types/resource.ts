/**
 * Represents the available resources in the application.
 */
export enum Resource {
  Auth = 'auth',
  User = 'users',
  Job = 'jobs',
  JobCategory = 'job-categories',
  Category = 'categories',
  TermsAndConditions = 'tyc',
  Offer = 'offers',
  Question = 'questions',
  Reply = 'replies',
  Review = 'reviews',
  Notification = 'notification',
  ChatRoom = 'chatrooms',
  Chat = 'chats'
}

export type ResourceType = User | 
  Job | 
  JobCategory | 
  Category |
  TermsAndConditions |
  Offer |
  Question |
  Reply |
  Review | 
  Notification |
  ChatRoom |
  Chat;


type BaseTable = {
  id: number;
  createdDate?: Date;
  updatedDate?: Date;
};

/**
 * Represents a User object.
 */
export type User = BaseTable & {
  firstname: string;
  lastname: string;
  email: string;
  phonenumber?: string;
  password?: string;
  token?: string;
  gender?: string;
  birthdate?: Date;
  rut?: string;
  bank?: string;
  accountType?: string;
  accountNumber?: string;
  isSwapper?: boolean;
  isEmailConfirmed?: boolean;
  profilePicturePath?: string;
}; 


export type Category = BaseTable & {
  name: string;
  description: string;
}

export type TermsAndConditions = BaseTable & {
  title: string;
  text: string;
  description: string;
};

export type Job = BaseTable & {
  budget: number;
  accepted_budget?: number;
  details: string;
  status?: string; // Assuming an enum or a string, adjust based on actual type
  currency?: string; // Assuming an enum or a string, adjust based on actual type
  dateType: string; // Assuming an enum or a string, adjust based on actual type
  date?: Date;
  region?: string;
  commune?: string;
  is_remote: boolean;
  jobCreatorId?: number;
  jobWorkerId?: number;
};

export type JobCategory = BaseTable & {
  categoryId?: number;
  jobId?: number;
};

export type Offer = BaseTable & {
  text: string;
  budget: number;
  is_read: boolean;
  jobId: number;
  userId: number;
  status: string;
};

export type Question = BaseTable & {
  text: string;
  is_read: boolean;
  jobId: number;
  userId: number;
};

export type Reply = BaseTable & {
  text: string;
  questionId: number;
  userId: number;
};

export type Review = BaseTable & {
  // Define fields based on the schema of the review table
};

export type Notification = BaseTable & {
  title: string;
  subtitle: string;
  message: string;
  userId: number;
  is_read: boolean;
  path: string;
};

export type ChatRoom = BaseTable & {
  jobId: number;
  jobCreatorId: number;
  jobWorkerId: number;
  isActive: boolean;
  job?: Job;
  jobCreator?: User;
  jobWorker?: User;
  chats?: Chat[];
};

export type Chat = BaseTable & {
  text: string;
  chatRoomId: number;
  senderId: number;
  chatRoom?: ChatRoom;
  sender?: User;
};