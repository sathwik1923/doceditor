import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import api from '../../utils/api';
import SharedEditorWrapper from './SharedEditorWrapper';
import './SharedDocument.css';

const SharedDocumentHandler = () => {
  const { token } = useParams();
  const { isAuthenticated, user } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [document, setDocument] = useState(null);
  const [permission, setPermission] = useState('read');
  const [error, setError] = useState(null);
  const [requiresAuth, setRequiresAuth] = useState(false);

  useEffect(() => {
    checkDocumentAccess();
  }, [token, isAuthenticated]);

  const checkDocumentAccess = async () => {
    try {
      setLoading(true);
      setError(null);

      if (!isAuthenticated) {
        // First, check if document exists without auth
        const response = await api.get(`/documents/shared/${token}`);
        if (response.data.success) {
          setDocument(response.data.document);
          setRequiresAuth(true);
          setLoading(false);
          return;
        }
      } else {
        // User is authenticated, get full access
        const response = await api.get(`/documents/shared/${token}/access`);
        if (response.data.success) {
          setDocument(response.data.document);
          setPermission(response.data.permission);
          setRequiresAuth(false);
          setLoading(false);
          return;
        }
      }
    } catch (error) {
      console.error('Document access error:', error);
      setError(
        error.response?.data?.error || 
        'Document not found or access denied'
      );
    } finally {
      setLoading(false);
    }
  };

  const handleSignIn = () => {
    // Store the current URL to redirect back after login
    localStorage.setItem('redirectAfterLogin', window.location.pathname);
    navigate('/login');
  };

  const handleSignUp = () => {
    // Store the current URL to redirect back after registration
    localStorage.setItem('redirectAfterLogin', window.location.pathname);
    navigate('/register');
  };

  if (loading) {
    return (
      <div className="shared-document-loading">
        <div className="loading-spinner"></div>
        <p>Loading document...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="shared-document-error">
        <div className="error-container">
          <h2>Document Not Found</h2>
          <p>{error}</p>
          <button onClick={() => navigate('/')} className="btn btn-primary">
            Go to Home
          </button>
        </div>
      </div>
    );
  }

  if (requiresAuth && !isAuthenticated) {
    return (
      <div className="shared-document-auth">
        <div className="auth-container">
          <div className="document-preview">
            <h2>"{document.title}"</h2>
            <p>by {document.owner.name}</p>
            <div className="document-info">
              <span className="word-count">{document.wordCount} words</span>
              <span className="last-modified">
                Last modified: {new Date(document.lastModified).toLocaleDateString()}
              </span>
            </div>
          </div>
          
          <div className="auth-prompt">
            <h3>Sign in to access this document</h3>
            <p>This document has been shared with you. Please sign in to view or edit it.</p>
            
            <div className="auth-buttons">
              <button onClick={handleSignIn} className="btn btn-primary">
                Sign In
              </button>
              <button onClick={handleSignUp} className="btn btn-secondary">
                Create Account
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (document && isAuthenticated) {
    return (
      <SharedEditorWrapper 
        document={document} 
        permission={permission} 
        token={token}
      />
    );
  }

  return null;
};

export default SharedDocumentHandler;
