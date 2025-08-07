import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './Dashstyles.css';


const DocumentCard = ({ 
  document, 
  onDelete, 
  onUpdate, 
  onSelect, 
  isSelected, 
  formatDate,
  viewMode = 'grid'
}) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [newTitle, setNewTitle] = useState(document.title);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  
  const navigate = useNavigate();
  const menuRef = useRef(null);
  const renameInputRef = useRef(null);

  // Fixed useEffect for click outside handling
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setIsMenuOpen(false);
      }
    };

    if (isMenuOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      
      // Return cleanup function only when event listener is added
      return () => {
        document.removeEventListener('mousedown', handleClickOutside);
      };
    }
    // No cleanup needed when menu is closed
  }, [isMenuOpen]);

  // Focus input when editing starts
  useEffect(() => {
    if (isEditing && renameInputRef.current) {
      renameInputRef.current.focus();
      renameInputRef.current.select();
    }
  }, [isEditing]);

  const handleCardClick = (e) => {
    // Prevent navigation when clicking on interactive elements
    if (e.target.closest('.menu-button, .checkbox-container, .rename-form, .favorite-button, .dropdown-menu')) {
      return;
    }
    
    if (!isEditing && !isMenuOpen) {
      navigate(`/editor/${document._id}`);
    }
  };

  const handleSelectClick = (e) => {
    e.stopPropagation();
    if (onSelect) {
      onSelect(document._id);
    }
  };

  const handleDeleteClick = async (e) => {
    e.stopPropagation();
    setIsMenuOpen(false);
    
    if (window.confirm(`Are you sure you want to delete "${document.title}"?`)) {
      setIsDeleting(true);
      try {
        await onDelete(document._id);
      } catch (error) {
        console.error('Error deleting document:', error);
        alert('Failed to delete document. Please try again.');
      } finally {
        setIsDeleting(false);
      }
    }
  };

  const handleRenameClick = (e) => {
    e.stopPropagation();
    setIsEditing(true);
    setIsMenuOpen(false);
  };
 
  const handleFavoriteClick = async (e) => {
    e.stopPropagation();
    try {
      await onUpdate(document._id, { isFavorite: !document.isFavorite });
    } catch (error) {
      console.error('Error updating favorite:', error);
      alert('Failed to update favorite status');
    }
  };

  const handleRenameSubmit = async (e) => {
    e.preventDefault();
    const trimmedTitle = newTitle.trim();
    
    if (trimmedTitle && trimmedTitle !== document.title) {
      try {
        await onUpdate(document._id, { title: trimmedTitle });
      } catch (error) {
        console.error('Error updating document:', error);
        alert('Failed to update document title');
        setNewTitle(document.title); // Reset to original title
      }
    }
    setIsEditing(false);
  };

  const handleRenameCancel = () => {
    setNewTitle(document.title);
    setIsEditing(false);
  };

  const handleRenameKeyDown = (e) => {
    if (e.key === 'Escape') {
      handleRenameCancel();
    }
  };

  const getInitials = (name) => {
    if (!name) return '?';
    return name
      .split(' ')
      .map(word => word.charAt(0))
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  const getRelativeTime = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = Math.abs(now - date);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays === 1) {
      return 'Today';
    } else if (diffDays === 2) {
      return 'Yesterday';
    } else if (diffDays <= 7) {
      return `${diffDays - 1} days ago`;
    } else if (diffDays <= 30) {
      return `${Math.ceil(diffDays / 7)} weeks ago`;
    } else {
      return date.toLocaleDateString('en-US', { 
        month: 'short', 
        day: 'numeric',
        year: date.getFullYear() !== now.getFullYear() ? 'numeric' : undefined
      });
    }
  };

  const truncateContent = (content, maxLength = 150) => {
    if (!content) return '';
    const textContent = content.replace(/<[^>]*>/g, '').replace(/\s+/g, ' ').trim();
    return textContent.length > maxLength 
      ? textContent.substring(0, maxLength) + '...'
      : textContent;
  };

  const getDocumentTypeIcon = () => {
    return (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M14 2H6C4.9 2 4 2.9 4 4V20C4 21.1 4.89 22 5.99 22H18C19.1 22 20 21.1 20 20V8L14 2Z" fill="#4285F4"/>
        <path d="M14 2V8H20" fill="#A1C2FA"/>
      </svg>
    );
  };

  if (viewMode === 'list') {
    return (
      <div 
        className={`document-list-item ${isSelected ? 'selected' : ''} ${isDeleting ? 'deleting' : ''}`}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        <div className="list-item-checkbox">
          <input
            type="checkbox"
            checked={isSelected}
            onChange={handleSelectClick}
            className="item-checkbox"
            aria-label={`Select ${document.title}`}
          />
        </div>

        <div className="list-item-icon">
          {getDocumentTypeIcon()}
        </div>

        <div className="list-item-content" onClick={handleCardClick}>
          {isEditing ? (
            <form onSubmit={handleRenameSubmit} className="rename-form">
              <input
                ref={renameInputRef}
                type="text"
                value={newTitle}
                onChange={(e) => setNewTitle(e.target.value)}
                onBlur={handleRenameCancel}
                onKeyDown={handleRenameKeyDown}
                className="rename-input"
                maxLength={100}
                placeholder="Document title"
              />
            </form>
          ) : (
            <div className="list-item-title">
              <span className="document-title" title={document.title}>
                {document.title}
              </span>
              {document.isFavorite && (
                <span className="favorite-star" title="Favorite">⭐</span>
              )}
            </div>
          )}
        </div>

        <div className="list-item-folder">
          <span className="folder-name">All Documents</span>
        </div>

        <div className="list-item-modified">
          <span className="modified-date" title={new Date(document.updatedAt).toLocaleString()}>
            {getRelativeTime(document.updatedAt)}
          </span>
        </div>

        <div className="list-item-size">
          <span className="word-count">
            {(document.wordCount || 0).toLocaleString()} words
          </span>
        </div>

        <div className="list-item-actions" ref={menuRef}>
          <button 
            className="favorite-button"
            onClick={handleFavoriteClick}
            title={document.isFavorite ? 'Remove from favorites' : 'Add to favorites'}
            aria-label={document.isFavorite ? 'Remove from favorites' : 'Add to favorites'}
          >
            {document.isFavorite ? '★' : '☆'}
          </button>
          
          <button 
            className="menu-button"
            onClick={(e) => {
              e.stopPropagation();
              setIsMenuOpen(!isMenuOpen);
            }}
            aria-label="More options"
            aria-expanded={isMenuOpen}
          >
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
              <circle cx="8" cy="3" r="1.5" fill="currentColor"/>
              <circle cx="8" cy="8" r="1.5" fill="currentColor"/>
              <circle cx="8" cy="13" r="1.5" fill="currentColor"/>
            </svg>
          </button>
          
          {isMenuOpen && (
            <div className="dropdown-menu" role="menu">
              <button onClick={handleRenameClick} role="menuitem">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" stroke="currentColor" strokeWidth="2"/>
                  <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" stroke="currentColor" strokeWidth="2"/>
                </svg>
                Rename
              </button>
              <button onClick={handleFavoriteClick} role="menuitem">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <polygon points="12,2 15.09,8.26 22,9.27 17,14.14 18.18,21.02 12,17.77 5.82,21.02 7,14.14 2,9.27 8.91,8.26" 
                    stroke="currentColor" strokeWidth="2" fill={document.isFavorite ? "currentColor" : "none"}/>
                </svg>
                {document.isFavorite ? 'Remove from favorites' : 'Add to favorites'}
              </button>
              <div className="menu-divider"></div>
              <button onClick={handleDeleteClick} className="delete-option" role="menuitem">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <polyline points="3,6 5,6 21,6" stroke="currentColor" strokeWidth="2"/>
                  <path d="M19,6V20a2,2,0,0,1-2,2H7a2,2,0,0,1-2-2V6M8,6V4a2,2,0,0,1,2-2h4a2,2,0,0,1,2,2V6" stroke="currentColor" strokeWidth="2"/>
                </svg>
                Delete
              </button>
            </div>
          )}
        </div>

        {isDeleting && (
          <div className="loading-overlay">
            <div className="spinner"></div>
            <span className="loading-text">Deleting...</span>
          </div>
        )}
      </div>
    );
  }

  // Grid view (default)
  return (
    <div 
      className={`document-card ${isSelected ? 'selected' : ''} ${isDeleting ? 'deleting' : ''} ${isHovered ? 'hovered' : ''}`}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div className="document-card-header">
        <div className="card-header-left">
          <div className="checkbox-container">
            <input
              type="checkbox"
              checked={isSelected}
              onChange={handleSelectClick}
              className="item-checkbox"
              aria-label={`Select ${document.title}`}
            />
          </div>
          <div className="document-icon">
            {getDocumentTypeIcon()}
          </div>
          {document.isFavorite && (
            <span className="favorite-indicator" title="Favorite">⭐</span>
          )}
        </div>

        <div className="card-header-right" ref={menuRef}>
          <button 
            className="favorite-button"
            onClick={handleFavoriteClick}
            title={document.isFavorite ? 'Remove from favorites' : 'Add to favorites'}
            aria-label={document.isFavorite ? 'Remove from favorites' : 'Add to favorites'}
          >
            {document.isFavorite ? '★' : '☆'}
          </button>
          
          <button 
            className="menu-button"
            onClick={(e) => {
              e.stopPropagation();
              setIsMenuOpen(!isMenuOpen);
            }}
            aria-label="More options"
            aria-expanded={isMenuOpen}
          >
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
              <circle cx="8" cy="3" r="1.5" fill="currentColor"/>
              <circle cx="8" cy="8" r="1.5" fill="currentColor"/>
              <circle cx="8" cy="13" r="1.5" fill="currentColor"/>
            </svg>
          </button>
          
          {isMenuOpen && (
            <div className="dropdown-menu" role="menu">
              <button onClick={handleRenameClick} role="menuitem">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" stroke="currentColor" strokeWidth="2"/>
                  <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" stroke="currentColor" strokeWidth="2"/>
                </svg>
                Rename
              </button>
              <button onClick={handleFavoriteClick} role="menuitem">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <polygon points="12,2 15.09,8.26 22,9.27 17,14.14 18.18,21.02 12,17.77 5.82,21.02 7,14.14 2,9.27 8.91,8.26" 
                    stroke="currentColor" strokeWidth="2" fill={document.isFavorite ? "currentColor" : "none"}/>
                </svg>
                {document.isFavorite ? 'Remove from favorites' : 'Add to favorites'}
              </button>
              <div className="menu-divider"></div>
              <button onClick={handleDeleteClick} className="delete-option" role="menuitem">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <polyline points="3,6 5,6 21,6" stroke="currentColor" strokeWidth="2"/>
                  <path d="M19,6V20a2,2,0,0,1-2,2H7a2,2,0,0,1-2-2V6M8,6V4a2,2,0,0,1,2-2h4a2,2,0,0,1,2,2V6" stroke="currentColor" strokeWidth="2"/>
                </svg>
                Delete
              </button>
            </div>
          )}
        </div>
      </div>

      <div className="document-card-body" onClick={handleCardClick}>
        {isEditing ? (
          <form onSubmit={handleRenameSubmit} className="rename-form">
            <input
              ref={renameInputRef}
              type="text"
              value={newTitle}
              onChange={(e) => setNewTitle(e.target.value)}
              onBlur={handleRenameCancel}
              onKeyDown={handleRenameKeyDown}
              className="rename-input"
              maxLength={100}
              placeholder="Document title"
            />
          </form>
        ) : (
          <h3 className="document-title" title={document.title}>
            {document.title}
          </h3>
        )}
        
        <div className="document-preview">
          {document.content ? (
            <p className="document-content-preview" title={truncateContent(document.content, 300)}>
              {truncateContent(document.content)}
            </p>
          ) : (
            <p className="document-content-preview empty">No content yet</p>
          )}
        </div>
      </div>

      <div className="document-card-footer">
        <div className="document-meta">
          <span className="last-modified" title={new Date(document.updatedAt).toLocaleString()}>
            Modified {getRelativeTime(document.updatedAt)}
          </span>
          <span className="word-count">
            {(document.wordCount || 0).toLocaleString()} words
          </span>
        </div>
        
        <div className="document-collaborators">
          {document.collaborators && document.collaborators.length > 0 ? (
            <div className="collaborators-list">
              {document.collaborators.slice(0, 3).map((collaborator, index) => (
                <div 
                  key={index} 
                  className="collaborator-avatar" 
                  title={collaborator.user?.username || collaborator.name}
                  style={{
                    backgroundColor: `hsl(${(collaborator.user?.username || collaborator.name || '').charCodeAt(0) * 137.5 % 360}, 70%, 50%)`
                  }}
                >
                  {getInitials(collaborator.user?.username || collaborator.name)}
                </div>
              ))}
              {document.collaborators.length > 3 && (
                <div className="collaborator-more" title={`${document.collaborators.length - 3} more collaborators`}>
                  +{document.collaborators.length - 3}
                </div>
              )}
            </div>
          ) : (
            <span className="no-collaborators">Just you</span>
          )}
        </div>
      </div>

      {isDeleting && (
        <div className="loading-overlay">
          <div className="spinner"></div>
          <span className="loading-text">Deleting...</span>
        </div>
      )}
    </div>
  );
};

export default DocumentCard;
