import { useParams, useNavigate } from "react-router-dom";
import { useContext, useState, useEffect } from "react";
import { PostContext } from "../context/PostContext";
import { supabase } from "../supabaseClient";
import "../styles/modal.css";

const EditPost = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { posts, fetchPosts } = useContext(PostContext);

  const post = posts.find((p) => p.id.toString() === id);

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [spotifyUrl, setSpotifyUrl] = useState("");

  useEffect(() => {
    if (post) {
      setTitle(post.title);
      setDescription(post.description);
      setImageUrl(post.imageUrl);
      setSpotifyUrl(post.spotifyUrl);
    }
  }, [post]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    const { error } = await supabase
      .from("posts")
      .update({
        title,
        description,
        imageUrl,
        spotifyUrl,
      })
      .eq("id", post.id);

    if (error) {
      alert("Error updating post");
      console.error(error);
      return;
    }

    await fetchPosts();
    navigate(-1);
  };

  if (!post) return null;

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <button className="close-btn" onClick={() => navigate(-1)}>
          &times;
        </button>
        <h2>Edit post</h2>
        <form className="create-post-form" onSubmit={handleSubmit}>
          <label>
            Title:
            <input value={title} onChange={(e) => setTitle(e.target.value)} />
          </label>

          <label>
            Description:
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
          </label>

          <label>
            Image URL:
            <input
              value={imageUrl}
              onChange={(e) => setImageUrl(e.target.value)}
            />
          </label>

          <label>
            Spotify Link:
            <input
              value={spotifyUrl}
              onChange={(e) => setSpotifyUrl(e.target.value)}
            />
          </label>

          <button type="submit" className="modal-action-btn">
            Save Changes
          </button>
        </form>
      </div>
    </div>
  );
};

export default EditPost;
