import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import * as Y from 'yjs';
import { WebsocketProvider } from 'y-websocket';
import Editor from './Editor';
import Toolbar from './Toolbar';
import UserList from './UserList';
import StatusBar from './StatusBar';
import api from '../../utils/api';
import ShareDialog from './ShareDialog';

const EditorWrapper = () => {
  const [showShareDialog, setShowShareDialog] = useState(false);
  const [documentSharing, setDocumentSharing] = useState({});
  const [documentTitle, setDocumentTitle] = useState('Untitled document');
  const [isConnected, setIsConnected] = useState(false);
  const [onlineUsers, setOnlineUsers] = useState([]);
  const [wordCount, setWordCount] = useState(0);
  const [editor, setEditor] = useState(null);
  const [isSaving, setIsSaving] = useState(false);
  const [lastSaved, setLastSaved] = useState(null);
  const [documentContent, setDocumentContent] = useState('');
  const [userId] = useState(() => `user-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`);

  const ydoc = useRef(new Y.Doc());
  const provider = useRef(null);
  const { docId } = useParams();
  const navigate = useNavigate();

  useEffect(() => {
    const initializeEditor = async () => {
      try {
        await loadDocument();
        if (docId) {
          if (provider.current) provider.current.destroy();
          ydoc.current = new Y.Doc();
          provider.current = new WebsocketProvider('ws://localhost:4000', docId, ydoc.current);

          provider.current.on('status', (event) => setIsConnected(event.status === 'connected'));
          provider.current.on('connection-error', () => setIsConnected(false));

          provider.current.awareness.on('change', () => {
            const users = [];
            provider.current.awareness.getStates().forEach((state, clientId) => {
              if (state.user) users.push({ id: clientId, ...state.user });
            });
            setOnlineUsers(users);
          });

          provider.current.awareness.setLocalStateField('user', {
            name: `User ${Math.floor(Math.random() * 1000)}`,
            color: `hsl(${Math.floor(Math.random() * 360)}, 70%, 50%)`,
            avatar: String.fromCharCode(65 + Math.floor(Math.random() * 26)),
            id: userId,
          });
        }
      } catch (error) {
        console.error('Editor initialization error:', error);
      }
    };

    initializeEditor();
    return () => {
      if (provider.current) provider.current.destroy();
    };
  }, [docId, userId]);

  const loadDocument = async () => {
    try {
      if (docId) {
        const response = await api.get(`/documents/${docId}`);
        if (response.data.success) {
          const doc = response.data.document;
          setDocumentTitle(doc.title || 'Untitled Document');
          setDocumentContent(doc.content || '');
          setWordCount(doc.wordCount || 0);
        }
      }
    } catch (error) {
      console.error('Failed to load document:', error);
    }
  };

  const saveDocument = async () => {
    if (!docId || !editor) return;
    try {
      setIsSaving(true);
      const content = editor.getHTML();
      const response = await api.put(`/documents/${docId}`, {
        title: documentTitle,
        content,
        wordCount,
      });

      if (response.data.success) {
        setLastSaved(new Date());
      }
    } catch (error) {
      console.error('Save error:', error);
    } finally {
      setIsSaving(false);
    }
  };

  useEffect(() => {
    const autoSaveInterval = setInterval(() => {
      if (editor && docId) saveDocument();
    }, 30000);
    return () => clearInterval(autoSaveInterval);
  }, [editor, documentTitle, docId]);

  const handleWordCountChange = (count) => setWordCount(count);
  const handleEditorReady = (editorInstance) => setEditor(editorInstance);
  const handleBackToDashboard = () => navigate('/dashboard');

  return (
    <div className="editor-wrapper">
      <div className="editor-header">
        <div className="editor-header-left">
          <button className="back-button" onClick={handleBackToDashboard}>← Dashboard</button>
          <input
            type="text"
            className="document-title-input"
            value={documentTitle}
            onChange={(e) => setDocumentTitle(e.target.value)}
            placeholder="Untitled document"
          />
        </div>

        <div className="editor-header-right">
          <UserList users={onlineUsers} isConnected={isConnected} />
          <div className="save-status">
            {isSaving && <span className="saving">Saving...</span>}
            {lastSaved && !isSaving && (
              <span className="last-saved">Saved {lastSaved.toLocaleTimeString()}</span>
            )}
          </div>
          <button className="save-button btn btn-primary" onClick={saveDocument} disabled={isSaving || !editor}>
            {isSaving ? 'Saving...' : 'Save'}
          </button>
          <button className="share-button btn btn-secondary" onClick={() => setShowShareDialog(true)}>📤 Share</button>
          <div className="connection-status">
            <div className={`status-indicator ${isConnected ? 'connected' : 'disconnected'}`}>
              {isConnected ? '🟢 Connected' : '🔴 Disconnected'}
            </div>
          </div>
        </div>
      </div>

      {editor && <Toolbar editor={editor} />}

      <div className="editor-content">
        {provider.current && ydoc.current && (
          <Editor
            ydoc={ydoc.current}
            provider={provider.current}
            onEditorReady={handleEditorReady}
            onWordCountChange={handleWordCountChange}
            initialContent={documentContent}
          />
        )}
      </div>

      <StatusBar wordCount={wordCount} onlineUsers={onlineUsers} isConnected={isConnected} />
      <ShareDialog
        isOpen={showShareDialog}
        onClose={() => setShowShareDialog(false)}
        documentId={docId}
        onShareUpdate={setDocumentSharing}
      />
    </div>
  );
};

export default EditorWrapper;
