import { Link } from 'react-router-dom';
import '../styles/error-unauthorized.css';

export default function Unauthorized() {
  return (
    <div className="app-layout">
      <main className="main-content">
        <section className="login-card error-page" aria-labelledby="error-title">
          <h1 id="error-title">Unauthorized</h1>
          <p role="alert" className="muted">
            You don't have acces to this page
          </p>
        </section>
      </main>
    </div>
  );
}
