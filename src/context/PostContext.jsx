import { createContext, useState, useEffect } from "react";
import { supabase } from "../supabaseClient";

export const PostContext = createContext();

export const PostProvider = ({ children }) => {
  const [posts, setPosts] = useState([]);
  const [currentUser, setCurrentUser] = useState("");

  const fetchPosts = async (orderBy = "createdAt") => {
    console.log("Fetching posts...");
    const { data, error } = await supabase
      .from("posts")
      .select("*")
      .order(orderBy, { ascending: false });

    if (error) {
      console.error("Error fetching posts:", error);
    } else {
      setPosts(data);
    }
  };

  useEffect(() => {
    const init = async () => {
      // wait for supabase to finish checking session
      const {
        data: { session },
      } = await supabase.auth.getSession();

      console.log("✅ Session:", session);
      // fetch regardless of session
      await fetchPosts();
    };

    init();

    // re-fetch posts when user logs in/out
    const { data: listener } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        console.log("🔁 Auth state changed");
        fetchPosts();
      }
    );

    return () => listener.subscription.unsubscribe();
  }, []);

  return (
    <PostContext.Provider value={{ posts, setPosts, currentUser, fetchPosts }}>
      {children}
    </PostContext.Provider>
  );
};
