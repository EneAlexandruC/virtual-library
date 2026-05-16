import Link from 'next/link';
import { useEffect, useMemo, useState } from 'react';

export default function Home() {
  const [books, setBooks] = useState([]);
  const [query, setQuery] = useState('');
  const [filter, setFilter] = useState('all');

  useEffect(() => {
    let active = true;
    fetch('/api/books')
      .then(r => r.json())
      .then(data => {
        if (active) setBooks(Array.isArray(data) ? data : []);
      });
    return () => {
      active = false;
    };
  }, []);

  const stats = useMemo(() => {
    const total = books.length;
    const available = books.filter(book => Number(book.available) === 1).length;
    const borrowed = total - available;
    return { total, available, borrowed };
  }, [books]);

  const filteredBooks = useMemo(() => {
    const term = query.trim().toLowerCase();
    return books.filter(book => {
      const matchesQuery =
        !term ||
        `${book.title || ''} ${book.author || ''}`.toLowerCase().includes(term);
      const isAvailable = Number(book.available) === 1;
      const matchesFilter =
        filter === 'all' ||
        (filter === 'available' && isAvailable) ||
        (filter === 'borrowed' && !isAvailable);
      return matchesQuery && matchesFilter;
    });
  }, [books, filter, query]);

  return (
    <main className="page-shell catalog-shell">
      <div className="ambient ambient-a" aria-hidden="true" />
      <div className="ambient ambient-b" aria-hidden="true" />

      <header className="topbar">
        <div className="brand-lockup">
          <span className="brand-mark" aria-hidden="true">V</span>
          <div>
            <p className="brand-name">Virtual Library</p>
            <p className="brand-subtitle">Curated digital catalogue</p>
          </div>
        </div>

        <nav className="topbar-nav" aria-label="Primary">
          <Link href="#catalogue">Catalogue</Link>
          <Link href="/admin">Admin</Link>
        </nav>
      </header>

      <section className="hero">
        <div className="hero-copy">
          <p className="eyebrow">Premium digital library</p>
          <h1>Curated reading, elegantly presented.</h1>
          <p className="hero-text">
            Explore a calm, modern catalogue designed for focused discovery.
            Availability, author details, and a refined browsing experience are
            always within reach.
          </p>

          <div className="hero-actions">
            <Link className="button button-primary" href="#catalogue">
              Browse catalogue
            </Link>
            <Link className="button button-secondary" href="/admin">
              Admin control center
            </Link>
          </div>

          <dl className="metric-grid" aria-label="Library highlights">
            <div className="metric-card">
              <dt>Total titles</dt>
              <dd>{stats.total}</dd>
            </div>
            <div className="metric-card">
              <dt>Available now</dt>
              <dd>{stats.available}</dd>
            </div>
            <div className="metric-card">
              <dt>Borrowed</dt>
              <dd>{stats.borrowed}</dd>
            </div>
          </dl>
        </div>

        <aside className="hero-panel panel">
          <p className="panel-label">Collection snapshot</p>
          <h2>Designed for quiet browsing.</h2>
          <p className="panel-copy">
            A focused reading room for the web: generous spacing, gentle
            contrast, and status cues that remain readable at a glance.
          </p>

          <div className="panel-list">
            {books.slice(0, 3).map(book => (
              <article className="mini-book" key={book.id}>
                <div>
                  <h3>{book.title}</h3>
                  <p>{book.author || 'Unknown author'}</p>
                </div>
                <div className="mini-book-actions">
                  <span
                    className={`status-badge ${
                      Number(book.available) === 1 ? 'status-available' : 'status-borrowed'
                    }`}
                  >
                    {Number(book.available) === 1 ? 'Available' : 'Borrowed'}
                  </span>
                  {book.pdfPath ? (
                    <Link className="button button-secondary button-small" href={`/books/${book.id}`}>
                      Read
                    </Link>
                  ) : (
                    <span className="mini-note">PDF pending</span>
                  )}
                </div>
              </article>
            ))}
            {!books.length && (
              <p className="empty-inline">No titles have been added yet.</p>
            )}
          </div>
        </aside>
      </section>

      <section id="catalogue" className="catalogue-section">
        <div className="section-heading">
          <div>
            <p className="eyebrow">Public catalogue</p>
            <h2>Find your next title</h2>
          </div>
          <p className="section-copy">
            Search by title or author, then refine by availability.
          </p>
        </div>

        <div className="catalogue-controls">
          <label className="search-field">
            <span className="field-label">Search books</span>
            <input
              value={query}
              onChange={e => setQuery(e.target.value)}
              placeholder="Search titles, authors, or themes"
              type="search"
            />
          </label>

          <div className="segmented-control" role="tablist" aria-label="Filter books">
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
            Showing <strong>{filteredBooks.length}</strong> of{' '}
            <strong>{books.length}</strong> titles
          </p>
        </div>

        <div className="book-grid">
          {filteredBooks.map(book => (
            <article className="book-card panel" key={book.id}>
              <div className="book-card-head">
                <span className="book-id">#{book.id}</span>
                <span
                  className={`status-badge ${
                    Number(book.available) === 1 ? 'status-available' : 'status-borrowed'
                  }`}
                >
                  {Number(book.available) === 1 ? 'Available' : 'Borrowed'}
                </span>
              </div>

              <h3>{book.title}</h3>
              <p className="book-author">{book.author || 'Unknown author'}</p>

              <div className="book-card-footer">
                <span>{Number(book.available) === 1 ? 'Ready to read' : 'Currently checked out'}</span>
                {book.pdfPath ? (
                  <Link className="text-link" href={`/books/${book.id}`}>
                    Open reader
                  </Link>
                ) : (
                  <span className="mini-note">PDF pending</span>
                )}
              </div>
            </article>
          ))}
        </div>

        {!filteredBooks.length && (
          <div className="empty-state panel">
            <h3>No books match your search.</h3>
            <p>Try a different title, author, or availability filter.</p>
          </div>
        )}
      </section>
    </main>
  )
}
