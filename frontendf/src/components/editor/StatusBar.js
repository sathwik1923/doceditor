import React from 'react';
import { Wifi, WifiOff, Users, Type } from 'lucide-react';

const StatusBar = ({ isConnected, wordCount, onlineUsers }) => {
  const getCharacterCount = () => {
    // This would need to be calculated from the editor content
    return wordCount * 5; // Rough estimate
  };

  return (
    <div className="status-bar">
      <div className="connection-status">
        {isConnected ? (
          <>
            <Wifi size={12} style={{ color: '#34a853' }} />
            <span>All changes saved</span>
          </>
        ) : (
          <>
            <WifiOff size={12} style={{ color: '#ea4335' }} />
            <span>Offline</span>
          </>
        )}
        <div className={`connection-indicator ${isConnected ? '' : 'disconnected'}`}></div>
      </div>
      
      <div className="document-stats">
        <span>{wordCount} words</span>
        <span>•</span>
        <span>{getCharacterCount()} characters</span>
        <span>•</span>
        <span>{onlineUsers.length} {onlineUsers.length === 1 ? 'editor' : 'editors'}</span>
      </div>
    </div>
  );
};

export default StatusBar;