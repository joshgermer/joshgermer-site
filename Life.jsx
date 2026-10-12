import { Link } from 'react-router-dom';
import { lifeTopics } from '../content/life.js';

export default function Life() {
  return (
    <>
      <section className="page-head">
        <p className="eyebrow">Life</p>
        <h1>Managing my life</h1>
        <p className="lead">Five areas I want to keep in balance. Each one: why it matters, what I’m doing now, and the next step.</p>
      </section>
      <section className="cards">
        {lifeTopics.map((t) => (
          <Link key={t.slug} to={`/life/${t.slug}`} className="card">
            <div className="card-icon">{t.icon}</div>
            <h3>{t.title}</h3>
            <p>{t.summary}</p>
            <p className="next"><strong>Next:</strong> {t.next}</p>
          </Link>
        ))}
      </section>
    </>
  );
}
