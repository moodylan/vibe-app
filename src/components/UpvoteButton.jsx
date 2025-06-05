import { useContext } from "react";
import { supabase } from "../supabaseClient";
import { AuthContext } from "../context/AuthProvider";
import { PostContext } from "../context/PostContext";
import "../styles/postDetail.css";
import "../styles/home.css";

const UpvoteButton = ({ postId, likes }) => {
  const { user } = useContext(AuthContext);
  const { fetchPosts } = useContext(PostContext);

  const handleUpvote = async () => {
    if (!user) return alert("Log in to upvote.");

    const { error } = await supabase
      .from("posts")
      .update({ likes: likes + 1 })
      .eq("id", postId);

    if (!error) fetchPosts();
    else console.error("Upvote failed:", error);
  };

  return <button className="likes-btn" onClick={handleUpvote}>❤️ {likes}</button>;
};

export default UpvoteButton;
