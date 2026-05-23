import { Link } from "react-router-dom";
import ChannelList from "./ChannelList";

const Sidebar = ({ channels, activeChannelId, onSelectChannel, user }) => (
  <aside className="sidebar">
    <div className="sidebar-brand">
      <div className="app-mark">DC</div>
      <div>
        <div className="app-title">Discord Clone</div>
        <div className="app-subtitle">Realtime chat space</div>
      </div>
    </div>
    <div className="sidebar-section">
      <span className="sidebar-label">Channels</span>
      <ChannelList
        channels={channels}
        activeChannelId={activeChannelId}
        onSelectChannel={onSelectChannel}
      />
    </div>
    <div className="sidebar-footer">
      <div className="user-pill">
        <span className="user-label">Signed in</span>
        <span className="user-name">{user?.username || "Guest"}</span>
      </div>
      <Link className="sidebar-link" to="/about">
        About / Info
      </Link>
    </div>
  </aside>
);

export default Sidebar;
