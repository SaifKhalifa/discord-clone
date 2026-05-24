import { Link } from "react-router-dom";
import avatar from "../assets/Github_TransBG.png";

const githubUrl = "https://github.com/saifkhalifa";
const portfolioUrl = "https://saifkhalifa.github.io";

const About = () => (
  <div className="about-page">
    <article className="dev-card">
      <div className="dev-avatar-wrap">
        <img className="dev-avatar" src={avatar} alt="Saif Khalifa" />
      </div>

      <h1 className="dev-heading">Developed by:</h1>
      <h2 className="dev-name">Saif Khalifa</h2>

      <p className="dev-tagline">OppoTrain Summer Internship Assessment</p>

      <p className="dev-link-line">
        For more projects, find me on GitHub:
        <br />
        <a href={githubUrl} target="_blank" rel="noreferrer">
          github.com/saifkhalifa
        </a>
        <br />
        Or visit my portfolio:
        <br />
        <a href={portfolioUrl} target="_blank" rel="noreferrer">
          saifkhalifa.github.io
        </a>
      </p>

      <Link className="dev-back" to="/">
        ← Back to app
      </Link>
    </article>
  </div>
);

export default About;
