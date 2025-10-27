import "../styles/global.css";
import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "../styles/index.css";
import "../styles/login-page.css";
import { isAuthenticated } from "../utils/auth";

const Home: React.FC = () => {
  // TODO: Backend Integration - Add user dashboard features
  // - Fetch upcoming events (GET /api/events/upcoming)
  // - Display user statistics (total events, attendance rate, etc.)
  // - Show recent activity or notifications
  // - Display office attendance status
  return (
    <main className="main-content">
      <h1>Welcome</h1>
      <p>This is a placeholder Home page. Backend integration will provide dynamic content.</p>
    </main>
  );
};

export default Home;
