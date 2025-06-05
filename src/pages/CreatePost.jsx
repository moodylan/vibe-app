import { useState, useContext, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { PostContext } from "../context/PostContext";
import { supabase } from "../supabaseClient";
import { v4 as uuidv4 } from "uuid";
import { AuthContext } from "../context/AuthProvider";
import "../styles/modal.css";

const CreatePost = () => {
  const navigate = useNavigate();
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [imageFile, setImageFile] = useState(null);
  const [spotifyUrl, setSpotifyUrl] = useState("");
  const { user } = useContext(AuthContext);
  const { fetchPosts } = useContext(PostContext);

  useEffect(() => {
    if (!user) {
      navigate("/login", { replace: true });
    }
  }, [user, navigate]);

  if (!user) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();

    let finalImageUrl = imageUrl;

    if (imageFile) {
      const fileExt = imageFile.name.split(".").pop();
      const fileName = `${uuidv4()}.${fileExt}`;
      const filePath = `${fileName}`;

      let { error: uploadError } = await supabase.storage
        .from("images")
        .upload(filePath, imageFile);

      if (uploadError) {
        alert("Image upload failed.");
        return;
      }

      const { data } = supabase.storage.from("images").getPublicUrl(filePath);

      finalImageUrl = data.publicUrl;
    }

    const { error } = await supabase.from("posts").insert([
      {
        title,
        description,
        imageUrl: finalImageUrl,
        spotifyUrl,
        likes: 0,
        user_id: user.id,
      },
    ]);

    if (error) {
      alert("Error creating post");
      console.error(error);
      return;
    }

    await fetchPosts();

    navigate("/");
  };

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <button className="close-btn" onClick={() => navigate(-1)}>
          &times;
        </button>
        <h2>Create a new post</h2>
        <form className="create-post-form" onSubmit={handleSubmit}>
          <label>
            Title:*
            <input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
            />
          </label>

          <label>
            Description:
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Describe your vibe..."
            />
          </label>

          <label>
            Upload image:
            <input
              type="file"
              accept="image/*"
              onChange={(e) => setImageFile(e.target.files[0])}
            />
          </label>

          <label>
            Or add an image URL instead:
            <input
              value={imageUrl}
              onChange={(e) => setImageUrl(e.target.value)}
              placeholder="Paste URL here..."
            />
          </label>

          <label>
            Spotify Link:
            <input
              value={spotifyUrl}
              onChange={(e) => setSpotifyUrl(e.target.value)}
              placeholder="https://open.spotify.com/track/..."
            />
          </label>

          <button type="submit" className="modal-action-btn">
            Post
          </button>
        </form>
      </div>
    </div>
  );
};

export default CreatePost;
