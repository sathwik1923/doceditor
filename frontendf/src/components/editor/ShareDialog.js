import React, { useState, useEffect } from 'react';
import api from '../../utils/api';
import './ShareDialog.css';

const ShareDialog = ({ isOpen, onClose, documentId, onShareUpdate }) => {
  const [sharing, setSharing] = useState({
    isEnabled: false,
    permission: 'read',
    token: null,
    expiresAt: null
  });
  const [shareUrl, setShareUrl] = useState('');
  const [permission, setPermission] = useState('read');
  const [expiresIn, setExpiresIn] = useState('');
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (isOpen && documentId) {
      loadSharingStatus();
    }
  }, [isOpen, documentId]);

  const loadSharingStatus = async () => {
    try {
      const response = await api.get(`/documents/${documentId}`);
      if (response.data.success) {
        const doc = response.data.document;
        setSharing(doc.sharing || {});
        if (doc.sharing && doc.sharing.isEnabled && doc.sharing.token) {
          setShareUrl(`${window.location.origin}/shared/${doc.sharing.token}`);
          setPermission(doc.sharing.permission);
        }
      }
    } catch (error) {
      console.error('Failed to load sharing status:', error);
    }
  };

  const enableSharing = async () => {
    try {
      setLoading(true);
      const response = await api.post(`/documents/${documentId}/share`, {
        permission,
        expiresIn: expiresIn ? parseInt(expiresIn) : null
      });

      if (response.data.success) {
        setShareUrl(response.data.shareUrl);
        setSharing(response.data.sharing);
        if (onShareUpdate) {
          onShareUpdate(response.data.sharing);
        }
      }
    } catch (error) {
      console.error('Failed to enable sharing:', error);
      alert('Failed to enable sharing');
    } finally {
      setLoading(false);
    }
  };

  const disableSharing = async () => {
    try {
      setLoading(true);
      const response = await api.delete(`/documents/${documentId}/share`);

      if (response.data.success) {
        setSharing({ isEnabled: false, permission: 'read', token: null });
        setShareUrl('');
        if (onShareUpdate) {
          onShareUpdate({ isEnabled: false });
        }
      }
    } catch (error) {
      console.error('Failed to disable sharing:', error);
      alert('Failed to disable sharing');
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(shareUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      console.error('Failed to copy to clipboard:', error);
      // Fallback for older browsers
      const textArea = document.createElement('textarea');
      textArea.value = shareUrl;
      document.body.appendChild(textArea);
      textArea.select();
      document.execCommand('copy');
      document.body.removeChild(textArea);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="share-dialog-overlay">
      <div className="share-dialog">
        <div className="share-dialog-header">
          <h3>Share Document</h3>
          <button className="close-button" onClick={onClose}>×</button>
        </div>

        <div className="share-dialog-content">
          {!sharing.isEnabled ? (
            <div className="sharing-disabled">
              <p>Enable sharing to allow others to access this document.</p>
              
              <div className="sharing-options">
                <div className="option-group">
                  <label>Permission Level:</label>
                  <select 
                    value={permission} 
                    onChange={(e) => setPermission(e.target.value)}
                  >
                    <option value="read">View Only</option>
                    <option value="write">Can Edit</option>
                  </select>
                </div>

                <div className="option-group">
                  <label>Expires In (hours):</label>
                  <input
                    type="number"
                    placeholder="Never (leave empty)"
                    value={expiresIn}
                    onChange={(e) => setExpiresIn(e.target.value)}
                    min="1"
                  />
                </div>
              </div>

              <button 
                className="btn btn-primary"
                onClick={enableSharing}
                disabled={loading}
              >
                {loading ? 'Enabling...' : 'Enable Sharing'}
              </button>
            </div>
          ) : (
            <div className="sharing-enabled">
              <div className="share-url-container">
                <label>Share Link:</label>
                <div className="url-input-group">
                  <input
                    type="text"
                    value={shareUrl}
                    readOnly
                    className="share-url-input"
                  />
                  <button 
                    className={`copy-button ${copied ? 'copied' : ''}`}
                    onClick={copyToClipboard}
                  >
                    {copied ? 'Copied!' : 'Copy'}
                  </button>
                </div>
              </div>

              <div className="sharing-info">
                <div className="info-item">
                  <strong>Permission:</strong> 
                  <span className={`permission-badge ${sharing.permission}`}>
                    {sharing.permission === 'read' ? 'View Only' : 'Can Edit'}
                  </span>
                </div>
                
                {sharing.expiresAt && (
                  <div className="info-item">
                    <strong>Expires:</strong> 
                    {new Date(sharing.expiresAt).toLocaleString()}
                  </div>
                )}
              </div>

              <div className="sharing-actions">
                <button 
                  className="btn btn-danger"
                  onClick={disableSharing}
                  disabled={loading}
                >
                  {loading ? 'Disabling...' : 'Disable Sharing'}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ShareDialog;
