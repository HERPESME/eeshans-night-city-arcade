import { useLocation } from "react-router-dom";
import { useEffect } from "react";

const NotFound = () => {
  const location = useLocation();

  useEffect(() => {
    document.title = "Page not found | Night City Arcade";
    document.querySelector('link[rel="canonical"]')?.remove();
    document.querySelector('meta[name="robots"]')?.setAttribute("content", "noindex");
    console.error(
      "404 Error: User attempted to access non-existent route:",
      location.pathname
    );
  }, [location.pathname]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-dark-bg text-white font-pixel">
      <div className="text-center">
        <h1 className="text-4xl font-bold mb-4">404</h1>
        <p className="text-xl text-cyber-blue mb-4">Oops! Page not found</p>
        <a href="/" className="text-cyber-pink hover:text-cyber-blue underline">
          Return to Home
        </a>
      </div>
    </div>
  );
};

export default NotFound;
