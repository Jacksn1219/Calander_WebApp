import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Sidebar from './Sidebar';
import '../styles/index.css';
import '../styles/login-page.css';
import { isAuthenticated } from '../utils/auth';



const Home: React.FC = () => {
  const navigate = useNavigate();

  useEffect(() => {
    if (!isAuthenticated()) {
      navigate('/login');
    }
  }, [navigate]);

  return (
    <div className="app-layout">
      <Sidebar />
      <main className="main-content">
        <h1>Welcome</h1>
        <p>This is a placeholder Home page. Backend integration will provide dynamic content.</p>
      </main>
    </div>
  );
};

export default Home;
