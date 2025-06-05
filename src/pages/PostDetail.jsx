import { useParams, useNavigate, useLocation } from "react-router-dom";
import { useContext, useState, useEffect } from "react";
import { PostContext } from "../context/PostContext";
import { AuthContext } from "../context/AuthProvider";
import { supabase } from "../supabaseClient";
import UpvoteButton from "../components/UpvoteButton";
import "../styles/modal.css";
import "../styles/postDetail.css";

const PostDetail = () => {
  const { user } = useContext(AuthContext);
  const { id } = useParams();
  const navigate = useNavigate();
  const { posts, fetchPosts } = useContext(PostContext);
  const location = useLocation();
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState("");
  const [editingCommentId, setEditingCommentId] = useState(null);
  const [editingContent, setEditingContent] = useState("");

  const post = posts.find((p) => p.id.toString() === id);

  const fetchComments = async () => {
    const { data, error } = await supabase
      .from("comments")
      .select("*, profiles(display_name)")
      .eq("post_id", post.id)
      .order("created_at", { ascending: true });

    if (error) console.error("Error fetching comments:", error);
    else setComments(data);
  };

  useEffect(() => {
    if (!post) return;
    fetchComments();
  }, [post]);

  if (!post) return <div className="modal-content">Post not found.</div>;

  const handleDelete = async () => {
    const confirmed = window.confirm(
      "Are you sure you want to delete this post?"
    );
    if (!confirmed) return;

    const { error } = await supabase.from("posts").delete().eq("id", post.id);

    if (error) {
      alert("Error deleting post");
      console.error(error);
      return;
    }

    await fetchPosts();
    navigate("/");
  };

  const handleAddComment = async (e) => {
    e.preventDefault();

    if (!user) return alert("Please log in to comment");

    const { error } = await supabase.from("comments").insert({
      post_id: post.id,
      user_id: user.id,
      content: newComment,
    });

    if (error) console.error("Error adding comment:", error);
    else {
      setNewComment("");
      fetchComments();
    }
  };

  const updateComment = async (commentId) => {
    const { error } = await supabase
      .from("comments")
      .update({ content: editingContent })
      .eq("id", commentId);

    if (!error) {
      setEditingCommentId(null);
      fetchComments();
    } else console.error("Failed to update comment", error);
  };

  const deleteComment = async (commentId) => {
    const { error } = await supabase
      .from("comments")
      .delete()
      .eq("id", commentId);

    if (!error) fetchComments();
    else console.error("Failed to delete comment", error);
  };

  const timeAgo = (timestamp) => {
    const seconds = Math.floor((Date.now() - new Date(timestamp)) / 1000);
    if (seconds < 60) return `${seconds}s ago`;
    const mins = Math.floor(seconds / 60);
    if (mins < 60) return `${mins}m ago`;
    const hours = Math.floor(mins / 60);
    if (hours < 24) return `${hours}h ago`;
    const days = Math.floor(hours / 24);
    return `${days}d ago`;
  };

  return (
    <div className="modal-overlay" onClick={() => navigate(-1)}>
      <div
        className="modal-content post-detail"
        onClick={(e) => e.stopPropagation()}
      >
        <button className="close-btn" onClick={() => navigate(-1)}>
          &times;
        </button>
        <div className="post-info-top">
          <p>{timeAgo(post.createdAt)}</p>
          {user?.id === post.user_id && (
            <div className="post-actions">
              <button
                onClick={() =>
                  navigate(`/edit/${post.id}`, {
                    state: {
                      background: location.state?.background || location,
                    },
                  })
                }
              >
                Edit
              </button>

              <button onClick={handleDelete}>Delete</button>
            </div>
          )}
        </div>

        {post.spotifyUrl && (
          <iframe
            src={`https://open.spotify.com/embed/track/${extractSpotifyId(
              post.spotifyUrl
            )}`}
            width="100%"
            height="80"
            frameBorder="0"
            allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"
            loading="lazy"
          ></iframe>
        )}
        <img src={post.imageUrl} alt={post.title} />

        <h2>{post.title}</h2>
        <p className="post-description">{post.description}</p>
        <p>
          <UpvoteButton postId={post.id} likes={post.likes} />
          likes
        </p>

        <div className="comment-section">
          <div className="comment-list">
            {comments.map((c) => (
              <div key={c.id} className="comment-item">
                <p>
                  <strong>{c.profiles?.display_name || "Unknown"}</strong> ·{" "}
                  {new Date(c.created_at).toLocaleString()}
                </p>
                {editingCommentId === c.id ? (
                  <>
                    <input
                      value={editingContent}
                      onChange={(e) => setEditingContent(e.target.value)}
                    />
                    <button onClick={() => updateComment(c.id)}>Save</button>
                    <button onClick={() => setEditingCommentId(null)}>
                      Cancel
                    </button>
                  </>
                ) : (
                  <p>{c.content}</p>
                )}

                {user?.id === c.user_id && editingCommentId !== c.id && (
                  <div className="comment-actions">
                    <button
                      onClick={() => {
                        setEditingCommentId(c.id);
                        setEditingContent(c.content);
                      }}
                    >
                      Edit
                    </button>
                    <button onClick={() => deleteComment(c.id)}>Delete</button>
                  </div>
                )}
              </div>
            ))}
          </div>

          <form onSubmit={(e) => handleAddComment(e)} className="comment-form">
            <input
              type="text"
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              placeholder="Add a comment..."
              required
            />
            <button type="submit">Post</button>
          </form>
        </div>
      </div>
    </div>
  );
};

const extractSpotifyId = (url) => {
  const parts = url.split("/track/");
  return parts[1]?.split("?")[0] || "";
};

export default PostDetail;
