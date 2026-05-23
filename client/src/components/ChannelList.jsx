const ChannelList = ({ channels, activeChannelId, onSelectChannel }) => (
  <ul className="channel-list">
    {channels.map((channel) => (
      <li
        key={channel._id}
        className={`channel-item ${
          activeChannelId === channel._id ? "active" : ""
        }`}
        onClick={() => onSelectChannel(channel)}
      >
        # {channel.name}
      </li>
    ))}
  </ul>
);

export default ChannelList;
