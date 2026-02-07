import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export interface User {
  id: string;
  name: string;
  email: string;
  target_role: string;
  experience_level: string;
  created_at: string;
  updated_at: string;
}

export interface UserSkill {
  id: string;
  user_id: string;
  skill_name: string;
  created_at: string;
}

export interface Role {
  id: string;
  role_name: string;
  description: string;
  created_at: string;
}

export interface RoleSkill {
  id: string;
  role_id: string;
  skill_name: string;
  order_index: number;
  created_at: string;
}

export interface LearningResource {
  id: string;
  skill_name: string;
  resource_type: string;
  title: string;
  url: string;
  created_at: string;
}

export interface UserProgress {
  id: string;
  user_id: string;
  skill_name: string;
  completed_at: string;
}
