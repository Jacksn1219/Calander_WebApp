import '../styles/error-unauthorized.css';

export default function Unauthorized() {
  return (
    <div className="app-layout">
      <main className="main-content">
        <section className="login-card error-page" aria-labelledby="unauthorized-title">
          <h1 id="unauthorized-title">Unauthorized</h1>
          <p role="alert" className="muted">
            You do not have access to this page.
          </p>
        </section>
      </main>
    </div>
  );
}
