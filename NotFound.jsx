import { Link } from 'react-router-dom';
export default function NotFound() {
  return (
    <section className="page-head">
      <h1>Page not found</h1>
      <p className="lead">That page doesn’t exist (yet).</p>
      <Link className="btn" to="/">Back home</Link>
    </section>
  );
}
