import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';

export default function Login(){
  const [email,setEmail] = useState('');
  const [password,setPassword] = useState('');
  const [err,setErr] = useState(null);
  const [loading,setLoading] = useState(false);
  const router = useRouter();

  async function submit(e){
    e.preventDefault();
    setErr(null);
    setLoading(true);
    try {
      const res = await fetch('/api/admin/login', {method:'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify({email,password})});
      if(res.ok) router.push('/admin/dashboard');
      else setErr('Login failed. Check your credentials and try again.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="page-shell auth-shell">
      <div className="ambient ambient-a" aria-hidden="true" />
      <div className="ambient ambient-b" aria-hidden="true" />

      <section className="auth-grid">
        <aside className="auth-intro panel">
          <p className="eyebrow">Admin access</p>
          <h1>Sign in to the control center.</h1>
          <p className="panel-copy">
            Manage the collection, update circulation, and keep the library
            running with a calm, modern interface.
          </p>

          <div className="auth-highlights">
            <div>
              <strong>Secure</strong>
              <span>Cookie-based session</span>
            </div>
            <div>
              <strong>Simple</strong>
              <span>Add and update books</span>
            </div>
            <div>
              <strong>Responsive</strong>
              <span>Built for every screen</span>
            </div>
          </div>

          <Link className="text-link" href="/">
            Return to catalogue
          </Link>
        </aside>

        <form className="auth-form panel" onSubmit={submit}>
          <p className="panel-label">Library operations</p>
          <h2>Welcome back.</h2>
          <p className="section-copy">
            Enter your administrator credentials to continue.
          </p>

          <label className="field">
            <span className="field-label">Email</span>
            <input
              value={email}
              onChange={e=>setEmail(e.target.value)}
              placeholder="admin@library.com"
              type="email"
              autoComplete="email"
              required
            />
          </label>

          <label className="field">
            <span className="field-label">Password</span>
            <input
              value={password}
              onChange={e=>setPassword(e.target.value)}
              placeholder="••••••••"
              type="password"
              autoComplete="current-password"
              required
            />
          </label>

          {err && (
            <p className="notice notice-error" role="alert">
              {err}
            </p>
          )}

          <button className="button button-primary button-full" type="submit" disabled={loading}>
            {loading ? 'Signing in…' : 'Sign in'}
          </button>

          <p className="form-note">
            Need the admin hub instead? <Link href="/admin">Open the gateway</Link>
          </p>
        </form>
      </section>
    </main>
  )
}
