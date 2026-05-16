import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';

export default function Dashboard(){
  const [books,setBooks] = useState([]);
  const [title,setTitle] = useState('');
  const [author,setAuthor] = useState('');
  const [pdfFile,setPdfFile] = useState(null);
  const [query,setQuery] = useState('');
  const [filter,setFilter] = useState('all');
  const [message,setMessage] = useState('');
  const [loading,setLoading] = useState(true);
  const [saving,setSaving] = useState(false);
  const [actionId,setActionId] = useState(null);

  function readFileAsBase64(file){
    return new Promise((resolve,reject) => {
      const reader = new FileReader();
      reader.onload = () => {
        const result = reader.result;
        if (typeof result !== 'string') {
          reject(new Error('Unable to read the selected file.'));
          return;
        }
        resolve(result.split(',')[1] || '');
      };
      reader.onerror = () => reject(new Error('Unable to read the selected file.'));
      reader.readAsDataURL(file);
    });
  }

  async function loadBooks(){
    setLoading(true);
    try {
      const res = await fetch('/api/books');
      const data = await res.json();
      setBooks(Array.isArray(data) ? data : []);
    } finally {
      setLoading(false);
    }
  }

  useEffect(()=>{ loadBooks(); },[]);

  const stats = useMemo(() => {
    const total = books.length;
    const available = books.filter(book => Number(book.available) === 1).length;
    const borrowed = total - available;
    return { total, available, borrowed };
  }, [books]);

  const visibleBooks = useMemo(() => {
    const term = query.trim().toLowerCase();
    return books.filter(book => {
      const matchesQuery =
        !term ||
        `${book.title || ''} ${book.author || ''}`.toLowerCase().includes(term);
      const available = Number(book.available) === 1;
      const matchesFilter =
        filter === 'all' ||
        (filter === 'available' && available) ||
        (filter === 'borrowed' && !available);
      return matchesQuery && matchesFilter;
    });
  }, [books, filter, query]);

  async function addBook(e){
    e.preventDefault();
    setSaving(true);
    setMessage('');
    try {
      if (!pdfFile) {
        setMessage('Please choose a PDF file before saving.');
        return;
      }

      if (pdfFile.type !== 'application/pdf') {
        setMessage('Only PDF files are supported.');
        return;
      }

      const pdfData = await readFileAsBase64(pdfFile);
      let res;
      try {
        res = await fetch('/api/admin/books', {
          method:'POST',
          headers:{'Content-Type':'application/json'},
          body: JSON.stringify({
            title,
            author,
            pdfData,
            pdfName: pdfFile.name,
            pdfType: pdfFile.type
          })
        });
      } catch (error) {
        setMessage('Upload failed. The PDF may be too large or the server is unavailable.');
        return;
      }

      if (res.status === 401) {
        setMessage('Your session expired. Please sign in again.');
        return;
      }

      if (!res.ok) {
        setMessage('Unable to add the book right now.');
        return;
      }

      setTitle('');
      setAuthor('');
      setPdfFile(null);
      setMessage('Book added to the catalogue.');
      await loadBooks();
    } finally {
      setSaving(false);
    }
  }

  async function toggle(id, avail){
    setActionId(id);
    setMessage('');
    try {
      const res = await fetch('/api/admin/borrow', {
        method:'POST',
        headers:{'Content-Type':'application/json'},
        body: JSON.stringify({bookId:id, action: avail ? 'borrow' : 'return'})
      });

      if (res.status === 401) {
        setMessage('Your session expired. Please sign in again.');
        return;
      }

      if (!res.ok) {
        setMessage('That action could not be completed.');
        return;
      }

      setMessage(avail ? 'Marked as borrowed.' : 'Marked as available.');
      await loadBooks();
    } finally {
      setActionId(null);
    }
  }

  return (
    <main className="page-shell dashboard-shell">
      <div className="ambient ambient-a" aria-hidden="true" />
      <div className="ambient ambient-b" aria-hidden="true" />

      <header className="topbar">
        <div className="brand-lockup">
          <span className="brand-mark" aria-hidden="true">A</span>
          <div>
            <p className="brand-name">Admin Control Center</p>
            <p className="brand-subtitle">Library operations at a glance</p>
          </div>
        </div>

        <nav className="topbar-nav" aria-label="Admin navigation">
          <Link href="/">Public catalogue</Link>
          <Link href="/admin/login">Sign in</Link>
        </nav>
      </header>

      <section className="dashboard-hero">
        <div>
          <p className="eyebrow">Operational overview</p>
          <h1>Calm tools for a busy library.</h1>
          <p className="hero-text">
            Manage inventory, mark circulation, and keep your catalogue accurate
            with a clean control surface designed to reduce noise.
          </p>
        </div>

        <dl className="metric-grid">
          <div className="metric-card">
            <dt>Total titles</dt>
            <dd>{stats.total}</dd>
          </div>
          <div className="metric-card">
            <dt>Available</dt>
            <dd>{stats.available}</dd>
          </div>
          <div className="metric-card">
            <dt>Borrowed</dt>
            <dd>{stats.borrowed}</dd>
          </div>
        </dl>
      </section>

      <div className="dashboard-layout">
        <section className="panel form-panel">
          <div className="section-heading">
            <div>
              <p className="panel-label">Catalogue maintenance</p>
              <h2>Add a book</h2>
            </div>
            <p className="section-copy">Create a new record in seconds.</p>
          </div>

          <form className="form-stack" onSubmit={addBook}>
            <label className="field">
              <span className="field-label">Title</span>
              <input
                placeholder="The Quiet Archive"
                value={title}
                onChange={e=>setTitle(e.target.value)}
                required
              />
            </label>
            <label className="field">
              <span className="field-label">Author</span>
              <input
                placeholder="Author name"
                value={author}
                onChange={e=>setAuthor(e.target.value)}
              />
            </label>
            <label className="field">
              <span className="field-label">PDF file</span>
              <input
                accept="application/pdf"
                onChange={e => setPdfFile(e.target.files && e.target.files[0] ? e.target.files[0] : null)}
                type="file"
              />
              <span className="form-hint">
                Upload the book PDF. Public readers will open it inside the site.
              </span>
            </label>
            <button className="button button-primary button-full" type="submit" disabled={saving}>
              {saving ? 'Saving…' : 'Add book with PDF'}
            </button>
          </form>

          {message && (
            <p className="notice" role="status">
              {message}
            </p>
          )}
        </section>

        <section className="panel collection-panel">
          <div className="section-heading">
            <div>
              <p className="panel-label">Current inventory</p>
              <h2>Books</h2>
            </div>
            <p className="section-copy">Filter, review, and toggle availability.</p>
          </div>

          <div className="catalogue-controls admin-controls">
            <label className="search-field">
              <span className="field-label">Search inventory</span>
              <input
                value={query}
                onChange={e=>setQuery(e.target.value)}
                placeholder="Search titles or authors"
                type="search"
              />
            </label>

            <div className="segmented-control" role="tablist" aria-label="Inventory filters">
              {[
                ['all', 'All'],
                ['available', 'Available'],
                ['borrowed', 'Borrowed'],
              ].map(([value, label]) => (
                <button
                  key={value}
                  type="button"
                  className={`segmented-button ${filter === value ? 'is-active' : ''}`}
                  aria-pressed={filter === value}
                  onClick={() => setFilter(value)}
                >
                  {label}
                </button>
              ))}
            </div>
          </div>

          <div className="catalogue-meta">
            <p>
              Showing <strong>{visibleBooks.length}</strong> of{' '}
              <strong>{books.length}</strong> titles
            </p>
          </div>

          {loading ? (
            <p className="empty-inline">Loading catalogue…</p>
          ) : (
            <div className="admin-book-list">
              {visibleBooks.map(book => {
                const available = Number(book.available) === 1;
                return (
                  <article className="admin-row" key={book.id}>
                    <div className="admin-row-copy">
                      <div className="admin-row-title">
                        <span className="book-id">#{book.id}</span>
                        <h3>{book.title}</h3>
                      </div>
                      <p>{book.author || 'Unknown author'}</p>
                      <span className={`file-badge ${book.pdfPath ? 'file-ready' : 'file-missing'}`}>
                        {book.pdfPath ? 'PDF ready' : 'PDF missing'}
                      </span>
                    </div>

                    <div className="admin-row-actions">
                      <span
                        className={`status-badge ${
                          available ? 'status-available' : 'status-borrowed'
                        }`}
                      >
                        {available ? 'Available' : 'Borrowed'}
                      </span>
                      <button
                        type="button"
                        className="button button-secondary button-small"
                        onClick={() => toggle(book.id, available)}
                        disabled={actionId === book.id}
                      >
                        {available ? 'Borrow' : 'Return'}
                      </button>
                    </div>
                  </article>
                );
              })}

              {!visibleBooks.length && (
                <div className="empty-state">
                  <h3>No matching titles.</h3>
                  <p>Try another title, author, or availability filter.</p>
                </div>
              )}
            </div>
          )}
        </section>
      </div>
    </main>
  )
}
