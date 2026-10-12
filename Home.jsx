import { Link } from 'react-router-dom';
import { lifeTopics } from '../content/life.js';

export default function Home() {
  return (
    <>
      <section className="hero">
        <p className="eyebrow">life · projects · ideas</p>
        <h1>Hi, I’m Josh.</h1>
        <p className="lead">
          This is my personal space — how I manage my life, what I’m building, and the ideas I’m
          working on. It’s a work in progress, on purpose.
        </p>
        <div className="hero-actions">
          <Link className="btn" to="/life">Life</Link>
          <Link className="btn btn-ghost" to="/projects">Projects</Link>
        </div>
      </section>

      <section className="cards three">
        <Link to="/life" className="card">
          <h3>Life</h3>
          <p>Finance, faith, family, friends, vision — what matters and what’s next.</p>
          <span className="more">Open →</span>
        </Link>
        <Link to="/projects" className="card">
          <h3>Projects</h3>
          <p>Things I build. Starting with a 3D clothing mockup tool.</p>
          <span className="more">Open →</span>
        </Link>
        <Link to="/companies" className="card">
          <h3>Companies</h3>
          <p>Concepts for businesses I want to build. Coming soon.</p>
          <span className="more">Open →</span>
        </Link>
      </section>

      <section className="section">
        <h2>Life at a glance</h2>
        <div className="chips">
          {lifeTopics.map((t) => (
            <Link key={t.slug} to={`/life/${t.slug}`} className="chip">
              <span>{t.icon}</span> {t.title}
            </Link>
          ))}
        </div>
      </section>
    </>
  );
}
