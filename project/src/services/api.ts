import type { Club, ClubDetail, Comment, FilterCategory, Notification, Post, User } from '../types';

/** Empty string = same-origin (use Vite `server.proxy` in dev or deploy API behind same host). */
const API_BASE = (import.meta.env.VITE_API_URL ?? '').replace(/\/$/, '');

function getToken(): string | null {
  return localStorage.getItem('vconnect_token');
}

async function apiFetch<T>(path: string, init: RequestInit = {}): Promise<T> {
  const headers = new Headers(init.headers);
  if (init.body && typeof init.body === 'string' && !headers.has('Content-Type')) {
    headers.set('Content-Type', 'application/json');
  }
  const token = getToken();
  if (token) {
    headers.set('Authorization', `Bearer ${token}`);
  }

  const url = `${API_BASE}${path}`;
  const res = await fetch(url, { ...init, headers });
  const text = await res.text();
  let data: unknown = null;
  if (text) {
    try {
      data = JSON.parse(text) as unknown;
    } catch {
      if (!res.ok) throw new Error(res.statusText || 'Request failed');
      throw new Error('Invalid JSON from server.');
    }
  }

  if (!res.ok) {
    const msg = (data as { error?: string })?.error || res.statusText || 'Request failed';
    throw new Error(msg);
  }
  return data as T;
}

const CATEGORIES: Club['category'][] = ['Technical', 'Cultural', 'Sports', 'Academic', 'Social'];

/** Stable pseudo-category for UI filters when the API has no category field */
export function categoryFromId(id: string | number): Club['category'] {
  const s = String(id);
  let n = 0;
  for (let i = 0; i < s.length; i++) n += s.charCodeAt(i);
  return CATEGORIES[n % CATEGORIES.length]!;
}

interface ApiUserRow {
  id: number;
  name: string;
  email: string;
  role: string;
  club_id?: number | null;
  club_name?: string | null;
  bio?: string | null;
  profile_image?: string | null;
  created_at?: string;
}

function mapUser(row: ApiUserRow, extras?: Partial<User>): User {
  return {
    id: String(row.id),
    name: row.name,
    email: row.email,
    role: row.role,
    isClub: row.role === 'club',
    clubId: row.club_id ? String(row.club_id) : undefined,
    clubName: row.club_name ?? undefined,
    studentId: extras?.studentId ?? '',
    department: extras?.department ?? '—',
    year: extras?.year ?? '—',
    avatar: row.profile_image ?? undefined,
    bio: row.bio ?? undefined,
    followedClubs: extras?.followedClubs ?? [],
    savedPosts: extras?.savedPosts ?? [],
  };
}

interface ApiPostRow {
  id: number;
  club_id: number;
  title: string;
  content: string;
  image_url?: string | null;
  created_at: string;
  club_name: string;
  like_count?: number;
  comment_count?: number;
  is_liked?: boolean;
}

interface SignupPayload {
  name: string;
  email: string;
  password: string;
  isClub?: boolean;
  clubName?: string;
  department?: string;
  year?: string;
  category?: string;
  president?: string;
}

interface CreatePostPayload {
  clubId: string;
  eventName: string;
  description: string;
  image?: string;
  eventDate?: string;
  eventTime?: string;
  venue?: string;
  tags?: string;
}

export function mapPostRow(row: ApiPostRow, comments: Comment[] = []): Post {
  const clubId = String(row.club_id);
  const date = row.created_at?.slice(0, 10) ?? '';
  return {
    id: String(row.id),
    clubId,
    clubName: row.club_name,
    department: 'Campus',
    category: categoryFromId(row.club_id),
    eventName: row.title,
    description: row.content,
    image: row.image_url ?? undefined,
    postedDate: row.created_at,
    eventDate: date,
  venue: 'See post',
    likesCount: row.like_count ?? 0,
    isLiked: Boolean(row.is_liked),
    isSaved: false,
    comments,
    commentCount: row.comment_count ?? comments.length,
  };
}

interface ApiCommentRow {
  id: number;
  post_id: number;
  user_id: number;
  content: string;
  created_at: string;
  author_name: string;
}

export function mapCommentRow(row: ApiCommentRow): Comment {
  return {
    id: String(row.id),
    userId: String(row.user_id),
    userName: row.author_name,
    userAvatar: undefined,
    userDepartment: '',
    content: row.content,
    createdAt: row.created_at,
    likes: 0,
    isLiked: false,
  };
}

interface ApiClubRow {
  id: number;
  name: string;
  description?: string | null;
  logo?: string | null;
  member_count?: number;
}

interface ApiClubDetailRow {
  id: number;
  name: string;
  description?: string | null;
  logo?: string | null;
  department?: string;
  category?: Club['category'];
  president?: string;
  email?: string;
  member_count?: number;
  followers_count?: number;
  faculty_coordinator?: string;
  faculty_email?: string;
  founded_year?: number;
  is_followed?: boolean;
  is_owner?: boolean;
}

function mapClubRow(row: ApiClubRow): Club {
  const desc = row.description ?? '';
  const dept = desc.includes('—') ? desc.split('—')[0].trim() : desc.slice(0, 80) || 'Campus club';
  return {
    id: String(row.id),
    name: row.name,
    department: dept,
    category: categoryFromId(row.id),
    logo: row.logo ?? undefined,
    description: desc || 'Club on campus.',
    followersCount: row.member_count ?? 0,
    isFollowed: false,
  };
}

export async function fetchClubDetail(clubId: string): Promise<ClubDetail> {
  const row = await apiFetch<ApiClubDetailRow>(`/api/clubs/${encodeURIComponent(clubId)}`);
  return {
    id: String(row.id),
    name: row.name,
    department: row.department ?? 'Campus',
    category: row.category ?? categoryFromId(row.id),
    logo: row.logo ?? undefined,
    description: row.description ?? 'Club on campus.',
    followersCount: row.followers_count ?? row.member_count ?? 0,
    isFollowed: Boolean(row.is_followed),
    totalMembers: row.member_count ?? 0,
    president: row.president ?? 'Not specified',
    email: row.email ?? '',
    facultyCoordinator: row.faculty_coordinator ?? 'Not available',
    facultyEmail: row.faculty_email ?? '',
    foundedYear: row.founded_year ?? new Date().getFullYear(),
  };
}

export async function loginUser(identifier: string, password: string): Promise<{ user: User; token: string }> {
  const email = identifier.includes('@') ? identifier.trim() : identifier.trim();
  const data = await apiFetch<{ token: string; user: ApiUserRow }>('/api/auth/login', {
    method: 'POST',
    body: JSON.stringify({ email, password }),
  });
  return { token: data.token, user: mapUser(data.user) };
}

export async function registerUser(
  name: string,
  email: string,
  password: string
): Promise<{ user: User; token: string }> {
  const data = await apiFetch<{ token: string; user: ApiUserRow }>('/api/auth/register', {
    method: 'POST',
    body: JSON.stringify({ name, email, password }),
  });
  return { token: data.token, user: mapUser(data.user) };
}

export async function signupUser(payload: SignupPayload): Promise<{ user: User; token: string }> {
  const data = await apiFetch<{ token: string; user: ApiUserRow }>('/api/auth/signup', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
  return { token: data.token, user: mapUser(data.user) };
}

export async function fetchPosts(category: FilterCategory = 'All'): Promise<Post[]> {
  const rows = await apiFetch<ApiPostRow[]>('/api/posts');
  const posts = rows.map((r) => mapPostRow(r, []));
  if (category === 'All') return posts;
  return posts.filter((p) => p.category === category);
}

export async function createPost(payload: CreatePostPayload): Promise<Post> {
  const row = await apiFetch<ApiPostRow>(`/api/posts/club/${encodeURIComponent(payload.clubId)}`, {
    method: 'POST',
    body: JSON.stringify({
      title: payload.eventName,
      content: payload.description,
      image_url: payload.image ?? null,
      event_date: payload.eventDate ?? null,
      event_time: payload.eventTime ?? null,
      venue: payload.venue ?? null,
      tags: payload.tags ?? null,
    }),
  });
  return mapPostRow(row, []);
}

export async function fetchClubs(query = '', category: FilterCategory = 'All'): Promise<Club[]> {
  const q = query.trim();
  let rows: ApiClubRow[];

  if (q) {
    const data = await apiFetch<{ clubs: { id: number; name: string; description?: string | null }[] }>(
      `/api/search?q=${encodeURIComponent(q)}`
    );
    rows = data.clubs.map((c) => ({
      id: c.id,
      name: c.name,
      description: c.description ?? '',
      logo: null,
      member_count: 0,
    }));
  } else {
    rows = await apiFetch<ApiClubRow[]>('/api/clubs');
  }

  let clubs = rows.map(mapClubRow);
  if (category !== 'All') {
    clubs = clubs.filter((c) => c.category === category);
  }
  return clubs;
}

export async function fetchNotifications(): Promise<Notification[]> {
  return [];
}

interface ProfileResponse {
  user: ApiUserRow;
  posts: ApiPostRow[];
  events_attending: unknown[];
  my_comments: {
    id: number;
    content: string;
    created_at: string;
    post_id: number;
    post_title: string;
    club_name: string;
  }[];
  followed_clubs_count: number;
}

export async function fetchUserProfile(): Promise<{
  user: User;
  comments: {
    postId: string;
    postTitle: string;
    clubName: string;
    comment: string;
    createdAt: string;
    likes: number;
  }[];
  savedPosts: Post[];
}> {
  const data = await apiFetch<ProfileResponse>('/api/users/me');
  const user = mapUser(data.user, {
    followedClubs: Array.from({ length: data.followed_clubs_count }, (_, i) => String(i)),
  });
  const comments = data.my_comments.map((c) => ({
    postId: String(c.post_id),
    postTitle: c.post_title,
    clubName: c.club_name,
    comment: c.content,
    createdAt: c.created_at,
    likes: 0,
  }));
  return {
    user,
    comments,
    savedPosts: [],
  };
}

export async function toggleLikePost(postId: string): Promise<{ success: boolean; isLiked: boolean }> {
  const data = await apiFetch<{ liked: boolean }>('/api/reactions/toggle', {
    method: 'POST',
    body: JSON.stringify({ post_id: Number(postId) }),
  });
  return { success: true, isLiked: data.liked };
}

export async function fetchComments(postId: string): Promise<Comment[]> {
  const rows = await apiFetch<ApiCommentRow[]>(`/api/comments/${encodeURIComponent(postId)}`);
  return rows.map(mapCommentRow);
}

export async function addComment(postId: string, content: string): Promise<Comment> {
  const row = await apiFetch<ApiCommentRow>('/api/comments', {
    method: 'POST',
    body: JSON.stringify({ post_id: Number(postId), content }),
  });
  return mapCommentRow(row);
}

export async function deleteComment(commentId: string): Promise<{ success: boolean }> {
  await apiFetch(`/api/comments/${encodeURIComponent(commentId)}`, {
    method: 'DELETE',
  });
  return { success: true };
}

export async function markNotificationsRead(): Promise<{ success: boolean }> {
  return { success: true };
}

export async function updatePassword(currentPassword: string, newPassword: string): Promise<{ success: boolean }> {
  await apiFetch('/api/users/me/password', {
    method: 'PATCH',
    body: JSON.stringify({ currentPassword, newPassword }),
  });
  return { success: true };
}

export async function updateProfile(data: Partial<Pick<User, 'name' | 'bio'>>): Promise<{ success: boolean; user: User }> {
  const res = await apiFetch<{ user: ApiUserRow }>('/api/users/me', {
    method: 'PATCH',
    body: JSON.stringify({ name: data.name, bio: data.bio }),
  });
  return { success: true, user: mapUser(res.user) };
}
