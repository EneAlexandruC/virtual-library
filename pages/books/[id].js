import Link from 'next/link';
const db = require('../../lib/db');

export async function getServerSideProps(context){
  const id = Number(context.params.id);
  if (!Number.isFinite(id)) {
    return { notFound: true };
  }

  const book = db.getBookById(id);
  if (!book) {
    return { notFound: true };
  }

  return {
    props: {
      book: JSON.parse(JSON.stringify(book))
    }
  };
}

export default function BookReader({ book }){
  const hasPdf = Boolean(book.pdfPath);

  return (
    <main className="page-shell reader-shell">
      <div className="ambient ambient-a" aria-hidden="true" />
      <div className="ambient ambient-b" aria-hidden="true" />

      <header className="topbar">
        <div className="brand-lockup">
          <span className="brand-mark" aria-hidden="true">V</span>
          <div>
            <p className="brand-name">Virtual Library</p>
            <p className="brand-subtitle">Embedded reader</p>
          </div>
        </div>

        <nav className="topbar-nav" aria-label="Reader navigation">
          <Link href="/">Back to catalogue</Link>
          <Link href="/admin">Admin</Link>
        </nav>
      </header>

      <section className="reader-hero panel">
        <div>
          <p className="eyebrow">Read inside the site</p>
          <h1>{book.title}</h1>
          <p className="hero-text">{book.author || 'Unknown author'}</p>
        </div>

        <div className="reader-meta">
          <span className={`status-badge ${Number(book.available) === 1 ? 'status-available' : 'status-borrowed'}`}>
            {Number(book.available) === 1 ? 'Available' : 'Borrowed'}
          </span>
          <span className="book-id">#{book.id}</span>
        </div>
      </section>

      <section className="reader-panel panel">
        {hasPdf ? (
          <iframe
            className="reader-frame"
            src={book.pdfPath}
            title={`${book.title} PDF reader`}
          />
        ) : (
          <div className="empty-state">
            <h2>PDF not uploaded yet.</h2>
            <p>This title exists in the catalogue, but the PDF file has not been attached.</p>
            <Link className="button button-secondary" href="/">
              Return to catalogue
            </Link>
          </div>
        )}
      </section>
    </main>
  );
}
