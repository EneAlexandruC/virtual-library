import Link from 'next/link';
export default function AdminIndex(){
  return (
    <main className="page-shell admin-home-shell">
      <div className="ambient ambient-a" aria-hidden="true" />
      <div className="ambient ambient-b" aria-hidden="true" />

      <section className="admin-home panel">
        <p className="eyebrow">Administration</p>
        <h1>Library operations, refined.</h1>
        <p className="hero-text">
          Enter the secure admin flow to manage the catalogue and circulation
          with a minimal, high-clarity interface.
        </p>

        <div className="hero-actions">
          <Link className="button button-primary" href="/admin/login">
            Sign in
          </Link>
          <Link className="button button-secondary" href="/admin/dashboard">
            Open dashboard
          </Link>
        </div>

        <div className="auth-highlights admin-links">
          <div>
            <strong>Dashboard</strong>
            <span>Manage books and availability</span>
          </div>
          <div>
            <strong>Login</strong>
            <span>Secure cookie-based access</span>
          </div>
        </div>
      </section>
    </main>
  )
}
