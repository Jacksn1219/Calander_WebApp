import '../styles/error-unauthorized.css';

export default function ErrorUnauthorized() {
  return (
    <div className="app-layout">
      <main className="main-content">
        <section className="login-card error-page" aria-labelledby="error-title">
          <h1 id="error-title">Error</h1>
          <p role="alert" className="muted">
            404 Error: This page doesn't exist
          </p>
        </section>
      </main>
    </div>
  );
}
