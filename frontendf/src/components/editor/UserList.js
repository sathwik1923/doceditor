import React from 'react';

const UserList = ({ users = [], isConnected }) => {
  return (
    <div className="user-list">
      <div className="connection-status">
        <span className={`status-indicator ${isConnected ? 'connected' : 'disconnected'}`}>
          {isConnected ? '●' : '○'}
        </span>
        <span className="status-text">
          {isConnected ? 'Connected' : 'Disconnected'}
        </span>
      </div>
      
      <div className="users">
        {users.length > 0 ? (
          users.map((user) => (
            <div key={user.id} className="user-avatar" title={user.name}>
              <div 
                className="avatar-circle"
                style={{ backgroundColor: user.color }}
              >
                {user.avatar}
              </div>
              <span className="user-name">{user.name}</span>
              <span className="user-mode">({user.mode})</span>
            </div>
          ))
        ) : (
          <div className="no-users">
            <span>Just you</span>
          </div>
        )}
      </div>
    </div>
  );
};

export default UserList;
