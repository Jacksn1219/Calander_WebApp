import React from 'react';
import Sidebar from './Sidebar';
import '../styles/index.css';
import '../styles/login-page.css';

const Home: React.FC = () => {
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
