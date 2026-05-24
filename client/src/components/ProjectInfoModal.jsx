import { useEffect } from "react";

const licenseUrl = "#"; // TODO: replace with link to LICENSE on GitHub once docs are merged

const ProjectInfoModal = ({ open, onClose }) => {
  useEffect(() => {
    if (!open) return undefined;

    const onKey = (event) => {
      if (event.key === "Escape") onClose();
    };

    document.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";

    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div
      className="modal-backdrop"
      role="dialog"
      aria-modal="true"
      aria-labelledby="project-info-title"
      onClick={onClose}
    >
      <div className="modal-card" onClick={(event) => event.stopPropagation()}>
        <button
          className="modal-close"
          type="button"
          onClick={onClose}
          aria-label="Close project info"
        >
          ×
        </button>

        <header className="modal-header">
          <span className="modal-eyebrow">OppoTrain — Discord Clone</span>
          <h2 id="project-info-title">Project Info & Demo</h2>
          <p className="modal-subtitle">
            Developed and presented by <strong>Saif Khalifa</strong> · Summer
            Internship Assessment Task
          </p>
        </header>

        <div className="modal-note" role="note">
          <strong>Heads up:</strong> for demo purposes the backend runs on a
          free-tier host that spins down when idle. The first request after a
          quiet period can take up to ~50 seconds to cold-start — please be
          patient on the first login or message send.
        </div>

        <div className="video-wrapper">
          <iframe
            src="https://www.youtube.com/embed/IL-Afu_y_eY"
            title="OppoTrain DiscordClone Demo"
            frameBorder="0"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
            referrerPolicy="strict-origin-when-cross-origin"
            allowFullScreen
          />
        </div>

        <section className="modal-section">
          <h3>Project Overview</h3>
          <p>
            A small assessment project created for applying to the OppoTrain
            Summer Internship — a real-time messaging web app inspired by
            Discord, featuring channel-based chat, authentication, and live
            message updates.
          </p>
        </section>

        <section className="modal-section">
          <h3>Core Features</h3>
          <ul className="modal-list">
            <li>Real-time messaging</li>
            <li>Channel-based conversations</li>
            <li>User authentication</li>
            <li>Live message updates</li>
            <li>Discord-inspired dark UI</li>
          </ul>
        </section>

        <section className="modal-section">
          <h3>Built With</h3>
          <div className="tech-chips">
            <span>React</span>
            <span>Express</span>
            <span>Socket.io</span>
            <span>MongoDB</span>
            <span>Mongoose</span>
            <span>JWT</span>
            <span>bcrypt</span>
            <span>Pure CSS</span>
          </div>
        </section>

        <section className="modal-section">
          <h3>AI Usage Disclosure</h3>
          <p>
            AI tools were used during the development process for guidance,
            debugging support, code improvement, and documentation assistance.
          </p>
          <p>
            All implementation decisions, integration, testing, and final
            project delivery were completed by Saif Khalifa.
          </p>
        </section>

        <section className="modal-section">
          <h3>License</h3>
          <p>
            This project is open source and released under the{" "}
            <a
              className="modal-link"
              href={licenseUrl}
              target="_blank"
              rel="noreferrer"
            >MIT License</a>. You are free to use, modify, and redistribute it
            with attribution.
          </p>
        </section>

        <div className="modal-footer">
          <button className="btn btn-primary" type="button" onClick={onClose}>
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default ProjectInfoModal;
