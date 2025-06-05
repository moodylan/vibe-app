import { useEffect, useState, createContext } from "react";
import { supabase } from "../supabaseClient";

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);

  useEffect(() => {
    const handleAuth = async () => {
      const {
        data: { session },
      } = await supabase.auth.getSession();

      const currentUser = session?.user;
      setUser(currentUser);

      if (currentUser) {
        const { data, error } = await supabase
          .from("profiles")
          .select("display_name")
          .eq("id", currentUser.id)
          .single();

        if (!data || !data.display_name) {
          const name = prompt("Enter a display name:");
          if (name) {
            await supabase.from("profiles").upsert({
              id: currentUser.id,
              display_name: name,
            });
          }
        }
      }
    };

    handleAuth();

    const { data: listener } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        setUser(session?.user ?? null);
      }
    );

    return () => listener.subscription.unsubscribe();
  }, []);

  return (
    <AuthContext.Provider value={{ user }}>{children}</AuthContext.Provider>
  );
};
