export type UserRole = 'STUDENT' | 'FACULTY' | 'SECURITY_STAFF' | 'ADMIN';

export interface User {
  id: string;
  email: string;
  full_name: string;
  role: UserRole;
  is_active: boolean;
  is_verified: boolean;
  created_at: string;
}

export type ItemStatus = 'REPORTED' | 'MATCHED' | 'CLAIMED' | 'RETURNED' | 'CLOSED';

export interface LostItem {
  id: string;
  report_id: string;
  user_id?: string;
  title: string;
  category: string;
  brand?: string;
  color?: string;
  location: string;
  lost_date: string;
  description: string;
  reward?: number;
  image_url?: string;
  thumbnail_url?: string;
  status: ItemStatus;
  created_at: string;
}

export interface FoundItem {
  id: string;
  report_id: string;
  reporter_id?: string;
  title: string;
  category: string;
  brand?: string;
  color?: string;
  location: string;
  found_date: string;
  description: string;
  storage_location: string;
  image_url?: string;
  thumbnail_url?: string;
  status: ItemStatus;
  created_at: string;
}

export interface MatchScore {
  id: string;
  lost_item_id: string;
  found_item_id: string;
  similarity_score: number;
  breakdown_json: Record<string, number>;
  status: 'PENDING' | 'CONFIRMED' | 'REJECTED';
  created_at: string;
  lost_item?: LostItem;
  found_item?: FoundItem;
}

export interface Claim {
  id: string;
  found_item_id: string;
  claimant_id?: string;
  claimant_email?: string;
  proof_description: string;
  verification_answers: Record<string, any>;
  status: 'PENDING' | 'APPROVED' | 'REJECTED';
  admin_notes?: string;
  reviewed_by_id?: string;
  created_at: string;
  claimant?: User;
  found_item?: FoundItem;
}

export interface AuditLog {
  id: string;
  user_id?: string;
  action: string;
  resource: string;
  details: Record<string, any>;
  ip_address?: string;
  timestamp: string;
}

export interface DashboardStats {
  total_users: number;
  total_lost: number;
  total_found: number;
  total_matches: number;
  pending_claims: number;
  resolved_claims: number;
  resolution_rate: number;
  category_distribution: Record<string, number>;
}
