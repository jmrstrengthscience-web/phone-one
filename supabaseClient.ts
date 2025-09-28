// src/lib/supabaseClient.ts
import { createClient } from '@supabase/supabase-js';

declare global {
  interface ImportMetaEnv {
    readonly VITE_SUPABASE_URL: string;
    readonly VITE_SUPABASE_ANON_KEY: string;
    // add other env variables here if needed
  }

  interface ImportMeta {
    readonly env: ImportMetaEnv;
  }
}

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

console.log('Supabase URL:', supabaseUrl);
console.log('Supabase Key (first 20 chars):', supabaseAnonKey?.substring(0, 20) + '...');

// For development without Supabase configured, use placeholder values
const isConfigured = supabaseUrl && supabaseAnonKey && 
  supabaseUrl !== 'https://your-project-id.supabase.co' && 
  supabaseAnonKey !== 'your-anon-key-here' &&
  supabaseUrl.includes('.supabase.co') &&
  supabaseAnonKey.startsWith('eyJ');

if (!isConfigured) {
  console.warn('Supabase not configured - using mock values for development');
}

const finalUrl = isConfigured ? supabaseUrl : 'https://placeholder.supabase.co';
const finalKey = isConfigured ? supabaseAnonKey : 'placeholder-key-for-development';

// Create Supabase client with enhanced configuration
export const supabase = createClient(finalUrl, finalKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true,
    storage: window?.localStorage,
  },
  db: {
    schema: 'public',
  },
  global: {
    headers: {
      'X-Client-Info': 'phorce-one@1.0.0',
    },
    // Add fetch implementation for better debugging
    fetch: (url, options = {}) => {
      console.log('🌐 Supabase fetch request:', { url, method: options.method || 'GET' });
      const startTime = Date.now();
      return fetch(url, {
        ...options,
        // Add timeout to fetch requests
        signal: AbortSignal.timeout(30000), // 30 second timeout
      }).then(response => {
        const duration = Date.now() - startTime;
        console.log(`🌐 Supabase fetch response: ${response.status} (${duration}ms)`, { url });
        return response;
      }).catch(error => {
        const duration = Date.now() - startTime;
        console.error(`🔴 Supabase fetch error (${duration}ms):`, { url, error: error.message });
        throw error;
      });
    },
  },
});

// Export configuration status for components to check
export const isSupabaseConfigured = isConfigured;

// Auth helpers
export const auth = supabase.auth;

// Multi-tenant database helpers
export const db = {
  from: (table: string) => supabase.from(table),
  
  // Helper to get current user's organization
  getCurrentOrganization: async () => {
    const { data: { user } } = await auth.getUser();
    if (!user) return null;
    
    const { data: profile } = await supabase
      .from('profiles')
      .select(`
        organization_id,
        role,
        organizations (
          id,
          name,
          slug,
          plan,
          max_athletes,
          max_coaches,
          settings
        )
      `)
      .eq('id', user.id)
      .single();
    
    return profile?.organizations || null;
  },
  
  // Helper to get current user's profile
  getCurrentProfile: async () => {
    const { data: { user } } = await auth.getUser();
    if (!user) return null;
    
    const { data: profile } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .single();
    
    return profile;
  },
  
  // Helper to create organization-scoped queries
  withOrganization: async (table: string) => {
    const profile = await db.getCurrentProfile();
    if (!profile?.organization_id) throw new Error('No organization found');
    
    return supabase
      .from(table)
      .select('*')
      .eq('organization_id', profile.organization_id);
  }
};

// Types for our database tables
export interface Organization {
  id: string;
  name: string;
  slug: string;
  plan: 'free' | 'pro' | 'enterprise';
  max_athletes: number;
  max_coaches: number;
  created_at: string;
  updated_at: string;
  settings: Record<string, any>;
  is_active: boolean;
}

export interface Profile {
  id: string;
  organization_id: string;
  email: string;
  first_name?: string;
  last_name?: string;
  role: 'coach' | 'assistant_coach' | 'athlete';
  avatar_url?: string;
  phone?: string;
  date_of_birth?: string;
  position?: string;
  jersey_number?: number;
  height?: string;
  weight?: number;
  grade?: number;
  is_active: boolean;
  last_seen: string;
  created_at: string;
  updated_at: string;
  metadata: Record<string, any>;
}

export interface Team {
  id: string;
  organization_id: string;
  name: string;
  description?: string;
  sport?: string;
  season?: string;
  color: string;
  is_active: boolean;
  created_by: string;
  created_at: string;
  updated_at: string;
  settings: Record<string, any>;
}

export interface Exercise {
  id: string;
  organization_id: string;
  name: string;
  description?: string;
  category: string;
  muscle_groups: string[];
  equipment: string[];
  instructions?: string[];
  video_url?: string;
  image_url?: string;
  difficulty_level: number;
  is_public: boolean;
  created_by: string;
  created_at: string;
  updated_at: string;
  tags: string[];
  metadata: Record<string, any>;
}

export interface Workout {
  id: string;
  organization_id: string;
  title: string;
  description?: string;
  workout_type: string;
  date?: string;
  estimated_duration?: number;
  difficulty_level: number;
  exercises: any[]; // JSONB array
  notes?: string;
  is_template: boolean;
  created_by: string;
  created_at: string;
  updated_at: string;
  tags: string[];
  status: 'draft' | 'published' | 'archived';
}

export default supabase;
