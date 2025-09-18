import { useParams, useNavigate, useLocation } from "react-router-dom";
import { useContext, useState, useEffect, useRef } from "react";
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

  // Accessibility: Close modal on Escape key press
  const dialogRef = useRef(null);
  const previouslyFocused = useRef(null);

  useEffect(() => {
    previouslyFocused.current = document.activeElement;
    // focus the close button or first focusable element
    const first = dialogRef.current?.querySelector(
      'button, [href], input, textarea, select, [tabindex]:not([tabindex="-1"])'
    );
    first?.focus();

    // prevent background scroll
    const { overflow } = document.body.style;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = overflow;
      previouslyFocused.current?.focus?.();
    };
  }, []);

  const handleKeydown = (e) => {
    if (e.key === "Escape") {
      e.stopPropagation();
      navigate(-1);
      return;
    }
    if (e.key === "Tab" && dialogRef.current) {
      const focusables = dialogRef.current.querySelectorAll(
        'button, [href], input, textarea, select, [tabindex]:not([tabindex="-1"])'
      );
      const list = Array.from(focusables);
      if (list.length === 0) return;
      const first = list[0];
      const last = list[list.length - 1];
      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault();
        first.focus();
      }
    }
  };

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
    <div
      className="modal-overlay"
      onClick={() => navigate(-1)}
      role="presentation"
    >
      <div
        className="modal-content post-detail"
        role="dialog"
        aria-modal="true"
        aria-labelledby="post-detail-title"
        aria-describedby="post-detail-desc"
        onClick={(e) => e.stopPropagation()}
        ref={dialogRef}
        onKeyDown={handleKeydown}
      >
        {!post ? (
          <div>
            <button
              className="close-btn"
              onClick={() => navigate(-1)}
              aria-label="Close"
            >
              &times;
            </button>
            <p>Post not found.</p>
          </div>
        ) : (
          <>
            <button
              className="close-btn"
              onClick={() => navigate(-1)}
              aria-label="Close"
            >
              &times;
            </button>
            <div className="post-info-top">
              <p>
                <time dateTime={new Date(post.createdAt).toISOString()}>
                  {timeAgo(post.createdAt)}
                </time>
              </p>
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
                title={`Spotify player for ${post.title || "track"}`}
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

            <h2 id="post-detail-title">{post.title}</h2>
            <p id="post-detail-desc" className="post-description">
              {post.description}
            </p>
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
                        <button onClick={() => updateComment(c.id)}>
                          Save
                        </button>
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
                        <button onClick={() => deleteComment(c.id)}>
                          Delete
                        </button>
                      </div>
                    )}
                  </div>
                ))}
              </div>

              <form
                onSubmit={(e) => handleAddComment(e)}
                className="comment-form"
              >
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
          </>
        )}
      </div>
    </div>
  );
};

const extractSpotifyId = (url) => {
  const parts = url.split("/track/");
  return parts[1]?.split("?")[0] || "";
};

export default PostDetail;
