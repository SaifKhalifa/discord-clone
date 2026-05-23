import { Link } from "react-router-dom";

const repoUrl = "https://github.com/SaifKhalifa/discord-clone";
const portfolioUrl = "https://saifkhalifa.github.io/";

const About = () => (
  <div className="about-page">
    <header className="about-hero">
      <span className="about-badge">About / Info</span>
      <h1>Discord Clone</h1>
      <p>
        A realtime chat playground focused on fast channels, clean presence,
        and a bold UI refresh.
      </p>
      <div className="about-links">
        <a className="btn btn-primary" href={repoUrl} target="_blank" rel="noreferrer">
          View Repo
        </a>
        <a
          className="btn btn-secondary"
          href={portfolioUrl}
          target="_blank"
          rel="noreferrer"
        >
          Portfolio
        </a>
      </div>
      <Link className="about-back" to="/">
        Back to app
      </Link>
    </header>

    <section className="about-grid">
      <article className="about-card">
        <h2>What it is</h2>
        <p>
          A focused Discord-inspired experience with real-time channels,
          conversations, and a clean navigation flow.
        </p>
      </article>
      <article className="about-card">
        <h2>Built with</h2>
        <ul>
          <li>React + Vite on the frontend</li>
          <li>REST + WebSocket-powered chat flows</li>
          <li>Responsive layout tuned for desktop and mobile</li>
        </ul>
      </article>
      <article className="about-card">
        <h2>Design notes</h2>
        <p>
          Warm accents, layered panels, and motion that makes the UI feel
          alive without getting in the way of conversation.
        </p>
      </article>
    </section>
  </div>
);

export default About;
