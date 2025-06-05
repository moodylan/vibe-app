import { Routes, Route, useLocation } from "react-router-dom";
import Home from "./pages/Home";
import CreatePost from "./pages/CreatePost";
import PostDetail from "./pages/PostDetail";
import EditPost from "./pages/EditPost";
import Login from "./pages/Login";

const App = () => {
  const location = useLocation();
  const state = location.state;
  const background =
    state?.background || (location.pathname === "/" ? location : null);

  return (
    <>
      {/* main route tree*/}
      <Routes location={background || location}>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/posts/:id" element={<PostDetail />} />
        <Route path="/create" element={<CreatePost />} />
        <Route path="/edit/:id" element={<EditPost />} />
      </Routes>

      {/* modal rendering */}
      {background && (
        <Routes>
          <Route path="/posts/:id" element={<PostDetail />} />
          <Route path="/create" element={<CreatePost />} />
          <Route path="/edit/:id" element={<EditPost />} />
        </Routes>
      )}
    </>
  );
};

export default App;
