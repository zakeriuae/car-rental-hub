import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { Session, User } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';

interface AuthContextType {
  session: Session | null;
  user: User | null;
  staffProfile: { id: string; full_name: string | null; role: string } | null;
  loading: boolean;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
  session: null, user: null, staffProfile: null, loading: true, signOut: async () => {}
});

export const useAuth = () => useContext(AuthContext);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [staffProfile, setStaffProfile] = useState<AuthContextType['staffProfile']>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_event, session) => {
      setSession(session);
      if (session?.user) {
        const { data } = await supabase
          .from('staff_profiles')
          .select('id, full_name, role')
          .eq('id', session.user.id)
          .maybeSingle();
        
        if (!data) {
          // Auto-create staff profile on first login
          const { data: newProfile } = await supabase
            .from('staff_profiles')
            .insert({ id: session.user.id, full_name: session.user.email, role: 'admin' })
            .select('id, full_name, role')
            .single();
          setStaffProfile(newProfile);
        } else {
          setStaffProfile(data);
        }
      } else {
        setStaffProfile(null);
      }
      setLoading(false);
    });

    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!session) setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  const signOut = async () => {
    await supabase.auth.signOut();
    setSession(null);
    setStaffProfile(null);
  };

  return (
    <AuthContext.Provider value={{ session, user: session?.user ?? null, staffProfile, loading, signOut }}>
      {children}
    </AuthContext.Provider>
  );
}
