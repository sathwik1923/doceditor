import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import DocumentCard from './DocumentCard';
import api from '../../utils/api';
import './Dashstyles.css';

const Dashboard = ({ onOpenEditor }) => {
  const [documents, setDocuments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState('lastModified');
  const [sortOrder, setSortOrder] = useState('desc');
  const [viewMode, setViewMode] = useState('grid');
  const [selectedItems, setSelectedItems] = useState([]);
  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!user) {
      navigate('/login');
      return;
    }
    fetchDocuments();
  }, [user, navigate]);

  // Fetch all documents for the user
  const fetchDocuments = async () => {
    try {
      setLoading(true);
      setError('');
      
      const response = await api.get('/documents');
      
      if (response.data.success) {
        setDocuments(response.data.documents || []);
      } else {
        setError('Failed to fetch documents');
      }
    } catch (error) {
      console.error('Fetch documents error:', error);
      setError(`Failed to fetch documents: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  // Create new document
  const createDocument = async () => {
    try {
      setError('');
      
      const response = await api.post('/documents', {
        title: 'Untitled Document',
        content: ''
      });
      
      if (response.data.success) {
        const newDoc = response.data.document;
        setDocuments(prev => [newDoc, ...prev]);
        
        // Navigate to editor
        if (onOpenEditor) {
          onOpenEditor(newDoc._id);
        } else {
          navigate(`/editor/${newDoc._id}`);
        }

      } else {
        setError('Failed to create document: ' + (response.data.error || 'Unknown error'));
      }
    } catch (error) {
      console.error('Create document error:', error);
      setError(`Failed to create document: ${error.message}`);
    }
  };

  // Delete document
  const deleteDocument = async (documentId) => {
    try {
      setError('');
      
      if (!window.confirm('Are you sure you want to delete this document?')) {
        return;
      }
      
      await api.delete(`/documents/${documentId}`);
      setDocuments(prev => prev.filter(doc => doc._id !== documentId));
      setSelectedItems(prev => prev.filter(id => id !== documentId));
    } catch (error) {
      console.error('Delete document error:', error);
      setError(`Failed to delete document: ${error.message}`);
    }
  };

  // Bulk delete selected documents
  const deleteSelectedDocuments = async () => {
    if (selectedItems.length === 0) return;
    
    if (!window.confirm(`Are you sure you want to delete ${selectedItems.length} selected document(s)?`)) {
      return;
    }
    try {
      setError('');
      
      // Delete all selected documents
      await Promise.all(
        selectedItems.map(id => api.delete(`/documents/${id}`))
      );
      
      setDocuments(prev => prev.filter(doc => !selectedItems.includes(doc._id)));
      setSelectedItems([]);
    } catch (error) {
      console.error('Bulk delete error:', error);
      setError(`Failed to delete documents: ${error.message}`);
    }
  };

  // Update document
  const updateDocument = async (documentId, updates) => {
    try {
      setError('');
      const response = await api.put(`/documents/${documentId}`, updates);
      
      if (response.data.success) {
        setDocuments(prev => prev.map(doc => 
          doc._id === documentId ? response.data.document : doc
        ));
      } else {
        setError('Failed to update document');
      }
    } catch (error) {
      console.error('Update document error:', error);
      setError(`Failed to update document: ${error.message}`);
    }
  };

  // Handle selection
  const handleSelect = (documentId) => {
    setSelectedItems(prev => {
      if (prev.includes(documentId)) {
        return prev.filter(id => id !== documentId);
      } else {
        return [...prev, documentId];
      }
    });
  };

  // Select all documents
  const handleSelectAll = () => {
    if (selectedItems.length === sortedDocuments.length) {
      setSelectedItems([]);
    } else {
      setSelectedItems(sortedDocuments.map(doc => doc._id));
    }
  };

  // Clear selection
  const clearSelection = () => {
    setSelectedItems([]);
  };

  // Filter and sort documents
  const filteredDocuments = documents.filter(doc =>
    doc.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    doc.content?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const sortedDocuments = [...filteredDocuments].sort((a, b) => {
    const aValue = a[sortBy];
    const bValue = b[sortBy];
    
    if (sortOrder === 'asc') {
      return aValue > bValue ? 1 : -1;
    } else {
      return aValue < bValue ? 1 : -1;
    }
  });

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  if (loading) {
    return (
      <div className="dashboard">
        <div className="loading-container">
          <div className="spinner"></div>
          <p>Loading your documents...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="dashboard">
      <div className="dashboard-header">
        <div className="header-left">
          <h1>My Documents</h1>
          <div className="document-count">
            {documents.length} {documents.length === 1 ? 'document' : 'documents'}
          </div>
        </div>
        
        <div className="header-right">
          <div className="search-container">
            <svg className="search-icon" width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <circle cx="11" cy="11" r="8" stroke="currentColor" strokeWidth="2"/>
              <path d="21 21l-4.35-4.35" stroke="currentColor" strokeWidth="2"/>
            </svg>
            <input
              type="text"
              placeholder="Search documents..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="search-input"
            />
          </div>
          
          <div className="view-controls">
            <button
              className={`view-button ${viewMode === 'grid' ? 'active' : ''}`}
              onClick={() => setViewMode('grid')}
              title="Grid View"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <rect x="3" y="3" width="7" height="7" stroke="currentColor" strokeWidth="2"/>
                <rect x="14" y="3" width="7" height="7" stroke="currentColor" strokeWidth="2"/>
                <rect x="3" y="14" width="7" height="7" stroke="currentColor" strokeWidth="2"/>
                <rect x="14" y="14" width="7" height="7" stroke="currentColor" strokeWidth="2"/>
              </svg>
            </button>
            <button
              className={`view-button ${viewMode === 'list' ? 'active' : ''}`}
              onClick={() => setViewMode('list')}
              title="List View"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <line x1="8" y1="6" x2="21" y2="6" stroke="currentColor" strokeWidth="2"/>
                <line x1="8" y1="12" x2="21" y2="12" stroke="currentColor" strokeWidth="2"/>
                <line x1="8" y1="18" x2="21" y2="18" stroke="currentColor" strokeWidth="2"/>
                <line x1="3" y1="6" x2="3.01" y2="6" stroke="currentColor" strokeWidth="2"/>
                <line x1="3" y1="12" x2="3.01" y2="12" stroke="currentColor" strokeWidth="2"/>
                <line x1="3" y1="18" x2="3.01" y2="18" stroke="currentColor" strokeWidth="2"/>
              </svg>
            </button>
          </div>
        </div>
      </div>

      <div className="dashboard-toolbar">
        <div className="toolbar-left">
          <button className="btn btn-primary new-doc-btn" onClick={createDocument}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <line x1="12" y1="5" x2="12" y2="19" stroke="currentColor" strokeWidth="2"/>
              <line x1="5" y1="12" x2="19" y2="12" stroke="currentColor" strokeWidth="2"/>
            </svg>
            New Document
          </button>
          
          {selectedItems.length > 0 && (
            <div className="selection-controls">
              <span className="selection-count">
                {selectedItems.length} selected
              </span>
              <button 
                className="btn btn-danger btn-sm"
                onClick={deleteSelectedDocuments}
              >
                Delete Selected
              </button>
              <button 
                className="btn btn-secondary btn-sm"
                onClick={clearSelection}
              >
                Clear Selection
              </button>
            </div>
          )}
        </div>

        <div className="toolbar-right">
          {documents.length > 0 && (
            <button
              className="select-all-btn"
              onClick={handleSelectAll}
            >
              {selectedItems.length === sortedDocuments.length ? 'Deselect All' : 'Select All'}
            </button>
          )}
          
          <div className="sort-controls">
            <select 
              value={sortBy} 
              onChange={(e) => setSortBy(e.target.value)}
              className="sort-select"
            >
              <option value="lastModified">Last Modified</option>
              <option value="title">Title</option>
              <option value="createdAt">Created</option>
            </select>
            <button
              className="sort-order-btn"
              onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
              title={`Sort ${sortOrder === 'asc' ? 'Descending' : 'Ascending'}`}
            >
              {sortOrder === 'asc' ? '↑' : '↓'}
            </button>
          </div>
        </div>
      </div>

      {error && (
        <div className="error-message">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2"/>
            <line x1="15" y1="9" x2="9" y2="15" stroke="currentColor" strokeWidth="2"/>
            <line x1="9" y1="9" x2="15" y2="15" stroke="currentColor" strokeWidth="2"/>
          </svg>
          {error}
          <button onClick={() => setError('')} className="error-close">×</button>
        </div>
      )}

      <div className="dashboard-content">
        <div className={`items-container ${viewMode}`}>
          {sortedDocuments.map(document => (
            <DocumentCard
              key={document._id}
              document={document}
              onDelete={deleteDocument}
              onUpdate={updateDocument}
              onSelect={handleSelect}
              isSelected={selectedItems.includes(document._id)}
              formatDate={formatDate}
              viewMode={viewMode}
            />
          ))}
        </div>

        {sortedDocuments.length === 0 && !loading && (
          <div className="empty-state">
            <div className="empty-icon">📄</div>
            <h3>No documents yet</h3>
            <p>Create your first document to get started</p>
            <button className="btn btn-primary" onClick={createDocument}>
              Create Document
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default Dashboard;
