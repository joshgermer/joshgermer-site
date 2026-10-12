import { Link, useParams } from 'react-router-dom';
import { lifeTopics } from '../content/life.js';
import NotFound from './NotFound.jsx';

export default function LifeTopic() {
  const { topic } = useParams();
  const i = lifeTopics.findIndex((t) => t.slug === topic);
  if (i === -1) return <NotFound />;
  const t = lifeTopics[i];
  const prev = lifeTopics[(i - 1 + lifeTopics.length) % lifeTopics.length];
  const next = lifeTopics[(i + 1) % lifeTopics.length];

  return (
    <article className="topic">
      <p className="eyebrow"><Link to="/life">Life</Link> / {t.title}</p>
      <h1><span className="topic-icon">{t.icon}</span>{t.title}</h1>
      <p className="lead">{t.summary}</p>

      <div className="next-box">
        <span>Next step</span>
        <p>{t.next}</p>
      </div>

      <h2>Why it matters</h2>
      <p>{t.why}</p>

      <h2>Right now</h2>
      <ul className="checks">
        {t.now.map((n) => <li key={n}>{n}</li>)}
      </ul>

      <nav className="pager">
        <Link to={`/life/${prev.slug}`}>← {prev.title}</Link>
        <Link to={`/life/${next.slug}`}>{next.title} →</Link>
      </nav>
    </article>
  );
}
