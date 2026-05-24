import { Link } from "react-router-dom";

const Navbar = ({ activeChannel, onLogout }) => (
  <header className="navbar">
    <div className="navbar-title">
      <div className="channel-title">
        <span className="channel-hash">#</span>
        <span>{activeChannel?.name || "Select a channel"}</span>
      </div>
      <span className="navbar-badge">
        {activeChannel?.description || "Pick a channel to start chatting"}
      </span>
    </div>
    <div className="navbar-actions">
      <Link className="btn btn-ghost" to="/about">
        About
      </Link>
      <button className="btn btn-secondary" type="button" onClick={onLogout}>
        Logout
      </button>
    </div>
  </header>
);

export default Navbar;
