import ChannelList from "./ChannelList";

const Sidebar = ({ channels, activeChannelId, onSelectChannel, user }) => (
  <aside className="sidebar">
    <div className="sidebar-header">
      <div className="app-mark">DC</div>
      <div className="app-title">Discord Clone</div>
    </div>
    <ChannelList
      channels={channels}
      activeChannelId={activeChannelId}
      onSelectChannel={onSelectChannel}
    />
    <div className="sidebar-footer">
      <div className="user-pill">{user?.username || "Guest"}</div>
    </div>
  </aside>
);

export default Sidebar;
