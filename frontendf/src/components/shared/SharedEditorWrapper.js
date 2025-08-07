import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import * as Y from 'yjs';
import { WebsocketProvider } from 'y-websocket';
import Editor from '../editor/Editor';
import Toolbar from '../editor/Toolbar';
import UserList from '../editor/UserList';
import StatusBar from '../editor/StatusBar';
import api from '../../utils/api';

const SharedEditorWrapper = ({ document: initialDocument, permission, token }) => {
  const [documentTitle, setDocumentTitle] = useState(initialDocument.title);
  const [isConnected, setIsConnected] = useState(false);
  const [onlineUsers, setOnlineUsers] = useState([]);
  const [wordCount, setWordCount] = useState(initialDocument.wordCount || 0);
  const [editor, setEditor] = useState(null);
  const [mode, setMode] = useState(permission === 'read' ? 'view' : 'edit');
  const [isSaving, setIsSaving] = useState(false);
  const [lastSaved, setLastSaved] = useState(null);
  const [userId] = useState(() => `user-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`);
  
  const ydoc = useRef(new Y.Doc());
  const provider = useRef(null);
  const navigate = useNavigate();

  useEffect(() => {
    const initializeEditor = async () => {
      try {
        if (token) {
          // Clean up previous connections
          if (provider.current) {
            provider.current.destroy();
          }
          
          // Create fresh Y.Doc
          ydoc.current = new Y.Doc();
          
          // Use the token as the room identifier for shared documents
          provider.current = new WebsocketProvider(
            'ws://localhost:4000',
            `shared-${token}`,
            ydoc.current
          );

          provider.current.on('status', (event) => {
            console.log('Connection status:', event.status);
            setIsConnected(event.status === 'connected');
          });

          provider.current.on('connection-error', (error) => {
            console.error('Connection error:', error);
            setIsConnected(false);
          });

          provider.current.awareness.on('change', () => {
            const users = [];
            provider.current.awareness.getStates().forEach((state, clientId) => {
              if (state.user) {
                users.push({ id: clientId, ...state.user });
              }
            });
            setOnlineUsers(users);
          });

          provider.current.awareness.setLocalStateField('user', {
            name: `Guest ${Math.floor(Math.random() * 1000)}`,
            color: `hsl(${Math.floor(Math.random() * 360)}, 70%, 50%)`,
            avatar: String.fromCharCode(65 + Math.floor(Math.random() * 26)),
            mode,
            id: userId,
            permission
          });
        }
      } catch (error) {
        console.error('Shared editor initialization error:', error);
      }
    };

    initializeEditor();

    return () => {
      if (provider.current) {
        provider.current.destroy();
      }
    };
  }, [token, userId, mode, permission]);

  // Save document to database (only if user has write permission)
  const saveDocument = async () => {
    if (!token || !editor || permission === 'read') return;
    
    try {
      setIsSaving(true);
      
      const content = editor.getHTML();
      
      const response = await api.put(`/documents/shared/${token}`, {
        title: documentTitle,
        content: content,
        wordCount: wordCount
      });
      
      if (response.data.success) {
        setLastSaved(new Date());
        console.log('Shared document saved successfully');
      } else {
        console.error('Failed to save shared document');
      }
    } catch (error) {
      console.error('Save error:', error);
    } finally {
      setIsSaving(false);
    }
  };

  // Auto-save functionality (only for write permission)
  useEffect(() => {
    if (permission === 'read') return;

    const autoSaveInterval = setInterval(() => {
      if (editor && token) {
        saveDocument();
      }
    }, 30000); // Auto-save every 30 seconds

    return () => clearInterval(autoSaveInterval);
  }, [editor, documentTitle, token, permission]);

  const handleWordCountChange = (count) => {
    setWordCount(count);
  };

  const handleModeChange = (newMode) => {
    // Restrict mode changes based on permission
    if (permission === 'read' && newMode !== 'view') {
      return;
    }
    
    setMode(newMode);
    if (provider.current) {
      const currentUser = provider.current.awareness.getLocalState().user;
      provider.current.awareness.setLocalStateField('user', {
        ...currentUser,
        mode: newMode
      });
    }
  };

  const handleEditorReady = (editorInstance) => {
    setEditor(editorInstance);
  };

  const handleTitleChange = (newTitle) => {
    if (permission === 'read') return;
    setDocumentTitle(newTitle);
  };

  return (
    <div className="shared-editor-wrapper">
      {/* Header with title and controls */}
      <div className="editor-header">
        <div className="editor-header-left">
          <button 
            className="back-button"
            onClick={() => navigate('/')}
            title="Back to Home"
          >
            ← Home
          </button>
          <input
            type="text"
            className={`document-title-input ${permission === 'read' ? 'readonly' : ''}`}
            value={documentTitle}
            onChange={(e) => handleTitleChange(e.target.value)}
            placeholder="Untitled document"
            readOnly={permission === 'read'}
          />
          <div className="permission-badge">
            <span className={`badge ${permission}`}>
              {permission === 'read' ? '👁️ View Only' : '✏️ Can Edit'}
            </span>
          </div>
        </div>
        
        <div className="editor-header-right">
          <UserList users={onlineUsers} isConnected={isConnected} />
          
          {permission === 'write' && (
            <>
              <div className="save-status">
                {isSaving && <span className="saving">Saving...</span>}
                {lastSaved && !isSaving && (
                  <span className="last-saved">
                    Saved {lastSaved.toLocaleTimeString()}
                  </span>
                )}
              </div>
              
              <button 
                className="save-button btn btn-primary"
                onClick={saveDocument}
                disabled={isSaving || !editor}
              >
                {isSaving ? 'Saving...' : 'Save'}
              </button>
            </>
          )}
          
          <div className="connection-status">
            <div className={`status-indicator ${isConnected ? 'connected' : 'disconnected'}`}>
              {isConnected ? '🟢 Connected' : '🔴 Disconnected'}
            </div>
          </div>
        </div>
      </div>

      {/* Toolbar - Only show when editor is ready and user has write permission */}
      {editor && permission === 'write' && <Toolbar editor={editor} />}

      {/* Main Editor Content */}
      <div className="editor-content">
        {provider.current && ydoc.current && (
          <Editor
            ydoc={ydoc.current}
            provider={provider.current}
            onEditorReady={handleEditorReady}
            onWordCountChange={handleWordCountChange}
            mode={mode}
            onModeChange={handleModeChange}
            initialContent={initialDocument.content}
          />
        )}
      </div>

      {/* Status Bar at the bottom */}
      <StatusBar
        wordCount={wordCount}
        onlineUsers={onlineUsers}
        isConnected={isConnected}
      />
    </div>
  );
};

export default SharedEditorWrapper;
