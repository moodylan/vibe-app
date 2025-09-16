import { useEffect, useState } from "react";

const DarkModeToggle = () => {
  const [theme, setTheme] = useState(localStorage.getItem("theme") || "light");

  useEffect(() => {
    document.documentElement.setAttribute("data-theme", theme);
    localStorage.setItem("theme", theme);
  }, [theme]);

  const isLight = theme === "light";
  const label = isLight ? "Switch to dark mode" : "Switch to light mode";

  return (
    <button
      className="icon-btn toggle-btn-navbar"
      title={label}
      aria-label={label}
      onClick={() => setTheme(isLight ? "dark" : "light")}
    >
      {isLight ? "☾" : "☀"}
    </button>
  );
};

export default DarkModeToggle;
