import { useNavigate, useLocation, Link } from "react-router-dom";
import { useContext, useState, useEffect } from "react";
import { PostContext } from "../context/PostContext";
import { AuthContext } from "../context/AuthProvider";
import UpvoteButton from "../components/UpvoteButton";
import Navbar from "../components/Navbar";
import Masonry from "react-masonry-css";
import "../styles/home.css";

const Home = () => {
  const { user } = useContext(AuthContext);
  const { posts, fetchPosts } = useContext(PostContext);
  const navigate = useNavigate();
  const location = useLocation();
  const [sortBy, setSortBy] = useState("createdAt");
  const [searchQuery, setSearchQuery] = useState("");

  const extractSpotifyId = (url) => {
    const parts = url.split("/track/");
    return parts[1]?.split("?")[0] || "";
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

  useEffect(() => {
    fetchPosts(sortBy);
  }, [sortBy]);

  const filteredPosts = posts.filter((post) =>
    post.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div>
      <Navbar
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        onCreateClick={() =>
          navigate("/create", { state: { background: location } })
        }
      />

      <button
        className="create-btn"
        onClick={() => navigate("/create", { state: { background: location } })}
      >
        + Post a new vibe
      </button>

      <div className="sort-options">
        <span>Sort by: </span>
        <button
          className={sortBy === "createdAt" ? "active" : ""}
          onClick={() => {
            setSortBy("createdAt");
            fetchPosts("createdAt");
          }}
        >
          Latest
        </button>
        <button
          className={sortBy === "likes" ? "active" : ""}
          onClick={() => {
            setSortBy("likes");
            fetchPosts("likes");
          }}
        >
          Most liked
        </button>
      </div>

      <Masonry
        breakpointCols={{
          default: 4,
          1280: 3,
          900: 2,
          540: 1,
        }}
        className="post-grid-masonry"
        columnClassName="post-grid-column"
      >
        {filteredPosts.map((post) => (
          <div key={post.id} className="post-card">
            <div className="image-container">
              <Link
                to={`/posts/${post.id}`}
                state={{ background: location }}
                className="post-image-wrapper"
              >
                <div className="image-hover-wrapper">
                  <img
                    className="post-image"
                    src={post.imageUrl}
                    alt={post.title}
                  />
                  <div className="hover-overlay"></div>
                </div>
              </Link>

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
            </div>

            <div className="post-meta">
              <p>
                <strong>
                  {post.title.slice(0, 20)}
                  {post.title.length > 20 && "…"}
                </strong>{" "}
                · {timeAgo(post.createdAt)}
              </p>
              <UpvoteButton postId={post.id} likes={post.likes} />
            </div>
          </div>
        ))}
      </Masonry>
    </div>
  );
};

export default Home;
