import React, { useState } from 'react';
import { 
  Bold, Italic, Underline, Strikethrough, List, ListOrdered, Quote, Code, Type, 
  Palette, Highlighter, Image, Table, AlignLeft, AlignCenter, AlignRight,
  Link, Subscript, Superscript, Undo, Redo, MoreHorizontal
} from 'lucide-react';

const Toolbar = ({ editor }) => {
  const [showColorPicker, setShowColorPicker] = useState(false);
  const [showHighlightPicker, setShowHighlightPicker] = useState(false);
  const [showFontPicker, setShowFontPicker] = useState(false);
  const [showLinkDialog, setShowLinkDialog] = useState(false);
  const [linkUrl, setLinkUrl] = useState('');

  if (!editor) return null;

  const colors = [
    '#000000', '#434343', '#666666', '#999999', '#cccccc',
    '#ffffff', '#ff0000', '#ff9900', '#ffff00', '#00ff00',
    '#00ffff', '#0000ff', '#9900ff', '#ff00ff', '#1a73e8',
    '#34a853', '#fbbc04', '#ea4335'
  ];

  const highlights = [
    '#ffff00', '#00ff00', '#00ffff', '#ff00ff', '#ff9900',
    '#ff0000', '#0000ff', '#9900ff', '#c9daf8', '#fce5cd',
    '#fff2cc', '#d9ead3', '#f4cccc', '#e1d5f3'
  ];

  const fonts = [
    'Arial', 'Helvetica', 'Times New Roman', 'Courier New',
    'Verdana', 'Georgia', 'Palatino', 'Garamond',
    'Comic Sans MS', 'Trebuchet MS', 'Roboto'
  ];

  const handleLinkSubmit = () => {
    if (linkUrl) {
      editor.chain().focus().setLink({ href: linkUrl }).run();
    }
    setShowLinkDialog(false);
    setLinkUrl('');
  };

  const buttons = [
    // Undo/Redo
    {
      icon: Undo,
      label: 'Undo',
      onClick: () => editor.chain().focus().undo().run(),
      isDisabled: !editor.can().undo(),
    },
    {
      icon: Redo,
      label: 'Redo',
      onClick: () => editor.chain().focus().redo().run(),
      isDisabled: !editor.can().redo(),
    },
    {
      type: 'divider'
    },
    // Basic formatting
    {
      icon: Bold,
      label: 'Bold',
      isActive: editor.isActive('bold'),
      onClick: () => editor.chain().focus().toggleBold().run(),
    },
    {
      icon: Italic,
      label: 'Italic',
      isActive: editor.isActive('italic'),
      onClick: () => editor.chain().focus().toggleItalic().run(),
    },
    {
      icon: Underline,
      label: 'Underline',
      isActive: editor.isActive('underline'),
      onClick: () => editor.chain().focus().toggleUnderline().run(),
    },
    {
      icon: Strikethrough,
      label: 'Strikethrough',
      isActive: editor.isActive('strike'),
      onClick: () => editor.chain().focus().toggleStrike().run(),
    },
    {
      type: 'divider'
    },
    // Text color
    {
      icon: Palette,
      label: 'Text Color',
      isActive: showColorPicker,
      onClick: () => setShowColorPicker(!showColorPicker),
      hasDropdown: true
    },
    // Highlight color
    {
      icon: Highlighter,
      label: 'Highlight',
      isActive: showHighlightPicker,
      onClick: () => setShowHighlightPicker(!showHighlightPicker),
      hasDropdown: true
    },
    {
      type: 'divider'
    },
    // Font family
    {
      icon: Type,
      label: 'Font',
      isActive: showFontPicker,
      onClick: () => setShowFontPicker(!showFontPicker),
      hasDropdown: true
    },
    {
      type: 'divider'
    },
    // Headings
    {
      text: 'H1',
      label: 'Heading 1',
      isActive: editor.isActive('heading', { level: 1 }),
      onClick: () => editor.chain().focus().toggleHeading({ level: 1 }).run(),
    },
    {
      text: 'H2',
      label: 'Heading 2',
      isActive: editor.isActive('heading', { level: 2 }),
      onClick: () => editor.chain().focus().toggleHeading({ level: 2 }).run(),
    },
    {
      text: 'H3',
      label: 'Heading 3',
      isActive: editor.isActive('heading', { level: 3 }),
      onClick: () => editor.chain().focus().toggleHeading({ level: 3 }).run(),
    },
    {
      type: 'divider'
    },
    // Alignment
    {
      icon: AlignLeft,
      label: 'Align Left',
      isActive: editor.isActive({ textAlign: 'left' }),
      onClick: () => editor.chain().focus().setTextAlign('left').run(),
    },
    {
      icon: AlignCenter,
      label: 'Align Center',
      isActive: editor.isActive({ textAlign: 'center' }),
      onClick: () => editor.chain().focus().setTextAlign('center').run(),
    },
    {
      icon: AlignRight,
      label: 'Align Right',
      isActive: editor.isActive({ textAlign: 'right' }),
      onClick: () => editor.chain().focus().setTextAlign('right').run(),
    },
    {
      type: 'divider'
    },
    // Lists
    {
      icon: List,
      label: 'Bullet List',
      isActive: editor.isActive('bulletList'),
      onClick: () => editor.chain().focus().toggleBulletList().run(),
    },
    {
      icon: ListOrdered,
      label: 'Numbered List',
      isActive: editor.isActive('orderedList'),
      onClick: () => editor.chain().focus().toggleOrderedList().run(),
    },
    {
      type: 'divider'
    },
    // Quote and Code
    {
      icon: Quote,
      label: 'Quote',
      isActive: editor.isActive('blockquote'),
      onClick: () => editor.chain().focus().toggleBlockquote().run(),
    },
    {
      icon: Code,
      label: 'Code',
      isActive: editor.isActive('code'),
      onClick: () => editor.chain().focus().toggleCode().run(),
    },
    {
      type: 'divider'
    },
    // Subscript and Superscript
    {
      icon: Subscript,
      label: 'Subscript',
      isActive: editor.isActive('subscript'),
      onClick: () => editor.chain().focus().toggleSubscript().run(),
    },
    {
      icon: Superscript,
      label: 'Superscript',
      isActive: editor.isActive('superscript'),
      onClick: () => editor.chain().focus().toggleSuperscript().run(),
    },
    {
      type: 'divider'
    },
    // Link
    {
      icon: Link,
      label: 'Link',
      isActive: editor.isActive('link'),
      onClick: () => {
        if (editor.isActive('link')) {
          editor.chain().focus().unsetLink().run();
        } else {
          setShowLinkDialog(true);
        }
      },
    },
  ];

  return (
    <div className="toolbar">
      {buttons.map((button, index) => {
        if (button.type === 'divider') {
          return (
            <div key={index} className="toolbar-divider"></div>
          );
        }

        const Icon = button.icon;
        return (
          <div key={index} className="toolbar-item">
            <button
              className={`toolbar-button ${button.isActive ? 'active' : ''} ${button.isDisabled ? 'disabled' : ''}`}
              onClick={button.onClick}
              title={button.label}
              disabled={button.isDisabled}
            >
              {Icon && <Icon size={16} />}
              {button.text && <span>{button.text}</span>}
            </button>
            
            {/* Color Picker Dropdown */}
            {button.label === 'Text Color' && showColorPicker && (
              <div className="color-picker-dropdown">
                <div className="color-grid">
                  {colors.map((color, i) => (
                    <button
                      key={i}
                      className="color-swatch"
                      style={{ backgroundColor: color }}
                      onClick={() => {
                        editor.chain().focus().setColor(color).run();
                        setShowColorPicker(false);
                      }}
                    />
                  ))}
                </div>
                <button
                  className="color-option"
                  onClick={() => {
                    editor.chain().focus().unsetColor().run();
                    setShowColorPicker(false);
                  }}
                >
                  Default Color
                </button>
              </div>
            )}
            
            {/* Highlight Picker Dropdown */}
            {button.label === 'Highlight' && showHighlightPicker && (
              <div className="color-picker-dropdown">
                <div className="color-grid">
                  {highlights.map((color, i) => (
                    <button
                      key={i}
                      className="color-swatch"
                      style={{ backgroundColor: color }}
                      onClick={() => {
                        editor.chain().focus().setHighlight({ color }).run();
                        setShowHighlightPicker(false);
                      }}
                    />
                  ))}
                </div>
                <button
                  className="color-option"
                  onClick={() => {
                    editor.chain().focus().unsetHighlight().run();
                    setShowHighlightPicker(false);
                  }}
                >
                  Remove Highlight
                </button>
              </div>
            )}
            
            {/* Font Picker Dropdown */}
            {button.label === 'Font' && showFontPicker && (
              <div className="font-picker-dropdown">
                {fonts.map((font, i) => (
                  <button
                    key={i}
                    className="font-option"
                    style={{ fontFamily: font }}
                    onClick={() => {
                      editor.chain().focus().setFontFamily(font).run();
                      setShowFontPicker(false);
                    }}
                  >
                    {font}
                  </button>
                ))}
                <button
                  className="font-option"
                  onClick={() => {
                    editor.chain().focus().unsetFontFamily().run();
                    setShowFontPicker(false);
                  }}
                >
                  Default Font
                </button>
              </div>
            )}
          </div>
        );
      })}
      
      {/* Link Dialog */}
      {showLinkDialog && (
        <div className="link-dialog">
          <div className="link-dialog-content">
            <h3>Add Link</h3>
            <input
              type="url"
              placeholder="Enter URL"
              value={linkUrl}
              onChange={(e) => setLinkUrl(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleLinkSubmit()}
              autoFocus
            />
            <div className="link-dialog-actions">
              <button onClick={handleLinkSubmit}>Add Link</button>
              <button onClick={() => setShowLinkDialog(false)}>Cancel</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Toolbar;