export interface User {
  id: string;
  name: string;
  email: string;
  role?: string;
  isClub?: boolean;
  clubId?: string;
  clubName?: string;
  /** Optional — shown when linked to backend profile extras */
  studentId?: string;
  department?: string;
  year?: string;
  avatar?: string;
  bio?: string;
  followedClubs: string[];
  savedPosts: string[];
}

export interface ClubDetail extends Club {
  totalMembers: number;
  president: string;
  email: string;
  facultyCoordinator: string;
  facultyEmail: string;
  socialLinks?: {
    instagram?: string;
    twitter?: string;
    website?: string;
  };
  foundedYear: number;
}

export interface Club {
  id: string;
  name: string;
  department: string;
  category: 'Technical' | 'Cultural' | 'Sports' | 'Academic' | 'Social';
  logo?: string;
  description: string;
  followersCount: number;
  isFollowed: boolean;
}

export interface Comment {
  id: string;
  userId: string;
  userName: string;
  userAvatar?: string;
  userDepartment: string;
  content: string;
  createdAt: string;
  likes: number;
  isLiked: boolean;
}

export interface Post {
  id: string;
  clubId: string;
  clubName: string;
  department: string;
  category: string;
  eventName: string;
  description: string;
  image?: string;
  postedDate: string;
  eventDate: string;
  venue: string;
  likesCount: number;
  isLiked: boolean;
  isSaved: boolean;
  comments: Comment[];
  /** From API when comments are not embedded in the feed */
  commentCount?: number;
}

export interface Notification {
  id: string;
  type: 'new_event' | 'comment_reply' | 'like' | 'follow';
  message: string;
  clubName?: string;
  postId?: string;
  isRead: boolean;
  createdAt: string;
  avatar?: string;
  meta?: string;
}

export type ThemeMode = 'light' | 'dark';

export type FilterCategory = 'All' | 'Technical' | 'Cultural' | 'Sports' | 'Academic' | 'Social';
