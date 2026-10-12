import { Link } from 'react-router-dom';
import { projects, projectIdeas } from '../content/projects.js';

export default function Projects() {
  return (
    <>
      <section className="page-head">
        <p className="eyebrow">Projects</p>
        <h1>Things I build</h1>
        <p className="lead">Built for me first. If they get good, they can help other people too.</p>
      </section>
      <section className="cards">
        {projects.map((p) => (
          <Link key={p.slug} to={`/projects/${p.slug}`} className="card card-feature">
            <span className="badge">{p.status}</span>
            <h3>{p.title}</h3>
            <p>{p.summary}</p>
            <span className="more">Open →</span>
          </Link>
        ))}
        <div className="card card-muted">
          <h3>Ideas in the queue</h3>
          <ul className="plain">
            {projectIdeas.map((x) => <li key={x}>{x}</li>)}
          </ul>
        </div>
      </section>
    </>
  );
}
