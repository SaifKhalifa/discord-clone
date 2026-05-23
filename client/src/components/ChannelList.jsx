const ChannelList = ({ channels, activeChannelId, onSelectChannel }) => (
  <ul className="channel-list">
    {channels.map((channel) => (
      <li key={channel._id}>
        <button
          type="button"
          className={`channel-item ${
            activeChannelId === channel._id ? "active" : ""
          }`}
          onClick={() => onSelectChannel(channel)}
        >
          <span className="channel-hash">#</span>
          <span className="channel-name">{channel.name}</span>
        </button>
      </li>
    ))}
  </ul>
);

export default ChannelList;
