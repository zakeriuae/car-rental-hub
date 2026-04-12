import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { Session, User } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';

interface StaffProfile {
  id: string;
  full_name: string | null;
  role: string;
  tenant_id: string | null;
}

interface AuthContextType {
  session: Session | null;
  user: User | null;
  staffProfile: StaffProfile | null;
  tenantId: string | null;
  loading: boolean;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
  session: null, user: null, staffProfile: null, tenantId: null, loading: true, signOut: async () => {}
});

export const useAuth = () => useContext(AuthContext);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [staffProfile, setStaffProfile] = useState<StaffProfile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Safety timeout to prevent infinite loading
    const timer = setTimeout(() => {
      console.warn("Auth initialization timed out, forcing loading to false");
      setLoading(false);
    }, 5000);

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_event, session) => {
      try {
        setSession(session);
        if (session?.user) {
          const { data, error } = await supabase
            .from('staff_profiles')
            .select('id, full_name, role, tenant_id')
            .eq('id', session.user.id)
            .maybeSingle();
          
          if (error) throw error;

          if (!data) {
            // Auto-create tenant + staff profile on first login
            const { data: tenant, error: tenantError } = await supabase
              .from('tenants')
              .insert({ name: session.user.email || 'My Company', slug: session.user.id.slice(0, 8) })
              .select('id')
              .single();

            if (tenantError) throw tenantError;

            if (tenant) {
              const { data: newProfile, error: profileError } = await supabase
                .from('staff_profiles')
                .insert({ id: session.user.id, full_name: session.user.email, role: 'admin', tenant_id: tenant.id })
                .select('id, full_name, role, tenant_id')
                .single();
              
              if (profileError) throw profileError;
              setStaffProfile(newProfile);
            }
          } else {
            setStaffProfile(data);
          }
        } else {
          setStaffProfile(null);
        }
      } catch (error) {
        console.error("Error in auth state change:", error);
      } finally {
        setLoading(false);
        clearTimeout(timer);
      }
    });

    supabase.auth.getSession().then(({ data: { session }, error }) => {
      if (error) {
        console.error("Error getting session:", error);
        setLoading(false);
        clearTimeout(timer);
      } else if (!session) {
        setLoading(false);
        clearTimeout(timer);
      }
    });

    return () => {
      subscription.unsubscribe();
      clearTimeout(timer);
    };
  }, []);

  const signOut = async () => {
    await supabase.auth.signOut();
    setSession(null);
    setStaffProfile(null);
  };

  return (
    <AuthContext.Provider value={{ session, user: session?.user ?? null, staffProfile, tenantId: staffProfile?.tenant_id ?? null, loading, signOut }}>
      {children}
    </AuthContext.Provider>
  );
}
