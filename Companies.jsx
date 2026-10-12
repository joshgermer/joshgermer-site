export default function Companies() {
  return (
    <section className="page-head">
      <p className="eyebrow">Companies</p>
      <h1>Company concepts</h1>
      <p className="lead">
        A place to sketch out businesses I want to build — the idea, who it serves, and the first
        step. Coming soon.
      </p>
      <div className="card card-muted" style={{ maxWidth: 520 }}>
        <h3>Template for each concept</h3>
        <ul className="plain">
          <li>Name + one-line pitch</li>
          <li>Who it’s for and what problem it solves</li>
          <li>How it makes money</li>
          <li>First step to test it</li>
        </ul>
      </div>
    </section>
  );
}
