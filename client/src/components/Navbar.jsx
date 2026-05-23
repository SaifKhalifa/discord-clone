const Navbar = ({ activeChannel, onLogout }) => (
  <header className="navbar">
    <div className="navbar-title">
      <span>#{activeChannel?.name || "Select a channel"}</span>
      <span className="navbar-badge">
        {activeChannel?.description || "Pick a channel to start chatting"}
      </span>
    </div>
    <button className="btn btn-secondary" type="button" onClick={onLogout}>
      Logout
    </button>
  </header>
);

export default Navbar;
