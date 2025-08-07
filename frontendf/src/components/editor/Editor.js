import React, { useEffect, useState, useRef, useCallback } from 'react';
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Collaboration from '@tiptap/extension-collaboration';
import CollaborationCursor from '@tiptap/extension-collaboration-cursor';
import Image from '@tiptap/extension-image';
import Table from '@tiptap/extension-table';
import TableRow from '@tiptap/extension-table-row';
import TableCell from '@tiptap/extension-table-cell';
import TableHeader from '@tiptap/extension-table-header';
import TextStyle from '@tiptap/extension-text-style';
import { Color } from '@tiptap/extension-color';
import Highlight from '@tiptap/extension-highlight';
import FontFamily from '@tiptap/extension-font-family';
import TextAlign from '@tiptap/extension-text-align';
import Underline from '@tiptap/extension-underline';
import Strike from '@tiptap/extension-strike';
import Subscript from '@tiptap/extension-subscript';
import Superscript from '@tiptap/extension-superscript';
import Link from '@tiptap/extension-link';

// Enhanced Image extension with resize functionality
const ResizableImage = Image.extend({
  name: 'resizableImage',
  
  addAttributes() {
    return {
      ...this.parent?.(),
      width: {
        default: null,
        parseHTML: element => element.getAttribute('width'),
        renderHTML: attributes => {
          if (!attributes.width) return {};
          return { width: attributes.width };
        },
      },
      height: {
        default: null,
        parseHTML: element => element.getAttribute('height'),
        renderHTML: attributes => {
          if (!attributes.height) return {};
          return { height: attributes.height };
        },
      },
    };
  },

  addNodeView() {
    return ({ node, updateAttributes }) => {
      const container = document.createElement('div');
      container.className = 'image-container';
      container.style.position = 'relative';
      container.style.display = 'inline-block';

      const img = document.createElement('img');
      img.src = node.attrs.src;
      img.alt = node.attrs.alt || '';
      img.className = 'resizable-image';
      img.style.maxWidth = '100%';
      img.style.height = 'auto';

      if (node.attrs.width) img.style.width = node.attrs.width + 'px';
      if (node.attrs.height) img.style.height = node.attrs.height + 'px';

      const resizeHandle = document.createElement('div');
      resizeHandle.className = 'resize-handle';
      resizeHandle.style.position = 'absolute';
      resizeHandle.style.bottom = '0';
      resizeHandle.style.right = '0';
      resizeHandle.style.width = '10px';
      resizeHandle.style.height = '10px';
      resizeHandle.style.backgroundColor = '#1a73e8';
      resizeHandle.style.cursor = 'nw-resize';
      resizeHandle.style.opacity = '0';
      resizeHandle.style.transition = 'opacity 0.2s';

      container.addEventListener('mouseenter', () => {
        resizeHandle.style.opacity = '1';
      });

      container.addEventListener('mouseleave', () => {
        resizeHandle.style.opacity = '0';
      });

      let isResizing = false;
      let startX, startY, startWidth, startHeight;

      const startResize = (e) => {
        e.preventDefault();
        e.stopPropagation();
        isResizing = true;
        startX = e.clientX;
        startY = e.clientY;
        startWidth = parseInt(window.getComputedStyle(img).width, 10);
        startHeight = parseInt(window.getComputedStyle(img).height, 10);
        
        document.addEventListener('mousemove', doResize);
        document.addEventListener('mouseup', stopResize);
      };

      const doResize = (e) => {
        if (!isResizing) return;
        
        const width = startWidth + e.clientX - startX;
        const height = startHeight + e.clientY - startY;

        if (width > 50 && height > 50) {
          img.style.width = width + 'px';
          img.style.height = height + 'px';
          updateAttributes({ width, height });
        }
      };

      const stopResize = () => {
        isResizing = false;
        document.removeEventListener('mousemove', doResize);
        document.removeEventListener('mouseup', stopResize);
      };

      resizeHandle.addEventListener('mousedown', startResize);

      container.appendChild(img);
      container.appendChild(resizeHandle);

      return {
        dom: container,
        update: (updatedNode) => {
          if (updatedNode.type !== node.type) return false;

          img.src = updatedNode.attrs.src;
          img.alt = updatedNode.attrs.alt || '';

          if (updatedNode.attrs.width) img.style.width = updatedNode.attrs.width + 'px';
          if (updatedNode.attrs.height) img.style.height = updatedNode.attrs.height + 'px';

          return true;
        },
        destroy: () => {
          resizeHandle.removeEventListener('mousedown', startResize);
          document.removeEventListener('mousemove', doResize);
          document.removeEventListener('mouseup', stopResize);
        },
      };
    };
  },
});

const Editor = ({ ydoc, provider, onEditorReady, onWordCountChange, initialContent, permission = 'write' }) => {
  const [isUploading, setIsUploading] = useState(false);
  const editorInitialized = useRef(false);
  const lastWordCount = useRef(0);
  const mounted = useRef(true);

  // Use useCallback to prevent unnecessary re-renders and avoid state updates during render
  const handleWordCountUpdate = useCallback((count) => {
    if (onWordCountChange && count !== lastWordCount.current && mounted.current) {
      lastWordCount.current = count;
      // Use setTimeout to defer the state update and avoid render-time updates
      setTimeout(() => {
        if (mounted.current) {
          onWordCountChange(count);
        }
      }, 0);
    }
  }, [onWordCountChange]);

  const editor = useEditor({
    extensions: [
      StarterKit.configure({ 
        history: false // Disable history since we're using Yjs
      }),
      Collaboration.configure({ 
        document: ydoc,
        field: 'default'
      }),
      CollaborationCursor.configure({
        provider,
        user: {
          name: 'Anonymous',
          color: '#1a73e8',
        },
      }),
      ResizableImage.configure({
        inline: false,
        HTMLAttributes: {
          class: 'editor-image',
        },
      }),
      Table.configure({
        resizable: true,
        HTMLAttributes: {
          class: 'editor-table',
        },
      }),
      TableRow,
      TableHeader,
      TableCell,
      TextStyle,
      Color,
      Highlight.configure({ multicolor: true }),
      FontFamily.configure({ types: ['textStyle'] }),
      TextAlign.configure({ types: ['heading', 'paragraph'] }),
      Underline,
      Strike,
      Subscript,
      Superscript,
      Link.configure({ 
        openOnClick: false,
        HTMLAttributes: {
          class: 'editor-link',
        },
      }),
    ],
    editable: permission !== 'read',
    content: '', // Don't set initial content here, let Yjs handle it
    onUpdate: ({ editor }) => {
      // Don't call state updates during render - use callback
      const text = editor.getText();
      const words = text.trim() ? text.trim().split(/\s+/).length : 0;
      handleWordCountUpdate(words);
    },
    onCreate: ({ editor }) => {
      // Handle initial word count when editor is created
      const text = editor.getText();
      const words = text.trim() ? text.trim().split(/\s+/).length : 0;
      handleWordCountUpdate(words);
    },
    editorProps: {
      attributes: {
        class: `ProseMirror ${permission === 'read' ? 'read-only' : ''}`,
      },
    },
  }, [ydoc, provider]); // Dependencies to ensure recreation when needed

  // Notify parent when editor is ready - only once
  useEffect(() => {
    if (editor && onEditorReady && !editorInitialized.current) {
      editorInitialized.current = true;
      onEditorReady(editor);
    }
  }, [editor, onEditorReady]);

  // Update editor editability based on permission
  useEffect(() => {
    if (editor) {
      editor.setEditable(permission !== 'read');
    }
  }, [editor, permission]);

  // Clean up on unmount
  useEffect(() => {
    mounted.current = true;
    return () => {
      mounted.current = false;
      if (editor) {
        editor.destroy();
      }
    };
  }, [editor]);

  const handleImageUpload = async (file) => {
    if (!file || permission === 'read') return;

    setIsUploading(true);
    const formData = new FormData();
    formData.append('image', file);

    try {
      const response = await fetch('http://localhost:4000/upload-image', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();

      if (result.success) {
        editor.chain().focus().setImage({ 
          src: result.url, 
          alt: result.originalName || 'Uploaded image' 
        }).run();
      } else {
        console.error('Upload failed:', result.error);
        alert('Upload failed: ' + result.error);
      }
    } catch (error) {
      console.error('Upload error:', error);
      alert('Upload failed: ' + error.message);
    } finally {
      setIsUploading(false);
    }
  };

  const insertTable = () => {
    if (editor && permission !== 'read') {
      editor.chain().focus().insertTable({ 
        rows: 3, 
        cols: 3, 
        withHeaderRow: true 
      }).run();
    }
  };

  const addTableRow = () => {
    if (editor && permission !== 'read') {
      editor.chain().focus().addRowAfter().run();
    }
  };

  const addTableColumn = () => {
    if (editor && permission !== 'read') {
      editor.chain().focus().addColumnAfter().run();
    }
  };

  const deleteTable = () => {
    if (editor && permission !== 'read') {
      editor.chain().focus().deleteTable().run();
    }
  };

  if (!editor) {
    return (
      <div className="editor-loading">
        <div className="loading-spinner"></div>
        <p>Loading editor...</p>
      </div>
    );
  }

  return (
    <div className="editor-container">
      {/* Editor Tools - Only show for write permission */}
      {permission !== 'read' && (
        <div className="editor-tools">
          <input
            type="file"
            accept="image/*"
            onChange={(e) => handleImageUpload(e.target.files[0])}
            style={{ display: 'none' }}
            id="image-upload"
          />
          <button
            onClick={() => document.getElementById('image-upload').click()}
            disabled={isUploading}
            className="editor-tool-button"
            title="Insert Image"
          >
            {isUploading ? 'Uploading...' : '📷 Insert Image'}
          </button>

          <div className="table-controls">
            <button 
              onClick={insertTable} 
              className="editor-tool-button"
              title="Insert Table"
            >
              📊 Insert Table
            </button>
            {editor.isActive('table') && (
              <>
                <button 
                  onClick={addTableRow} 
                  className="editor-tool-button"
                  title="Add Row"
                >
                  ➕ Add Row
                </button>
                <button 
                  onClick={addTableColumn} 
                  className="editor-tool-button"
                  title="Add Column"
                >
                  ➕ Add Column
                </button>
                <button 
                  onClick={deleteTable} 
                  className="editor-tool-button delete"
                  title="Delete Table"
                >
                  🗑️ Delete Table
                </button>
              </>
            )}
          </div>
        </div>
      )}

      {/* Read-only indicator */}
      {permission === 'read' && (
        <div className="read-only-banner">
          <span>👁️ You are viewing this document in read-only mode</span>
        </div>
      )}

      {/* Main Editor */}
      <div className={`editor-wrapper ${permission === 'read' ? 'read-only' : ''}`}>
        <EditorContent editor={editor} />
      </div>
    </div>
  );
};

export default Editor;
