const express = require('express');
const Document = require('../models/Document');
const auth = require('../middleware/auth');
const router = express.Router();

// Get all documents for user
router.get('/', auth, async (req, res) => {
  try {
    const documents = await Document.find({ owner: req.user.id })
      .sort({ lastModified: -1 })
      .populate('owner', 'name email');
    
    res.json({
      success: true,
      documents
    });
  } catch (error) {
    console.error('Get documents error:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Get single document (for owners)
router.get('/:id', auth, async (req, res) => {
  try {
    const document = await Document.findOne({
      _id: req.params.id,
      owner: req.user.id
    }).populate('owner', 'name email');
    
    if (!document) {
      return res.status(404).json({
        success: false,
        error: 'Document not found'
      });
    }
    
    res.json({
      success: true,
      document
    });
  } catch (error) {
    console.error('Get document error:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// NEW: Get shared document by token (no auth required initially)
router.get('/shared/:token', async (req, res) => {
  try {
    const { token } = req.params;
    
    const document = await Document.findOne({
      'sharing.token': token,
      'sharing.isEnabled': true
    }).populate('owner', 'name email');
    
    if (!document) {
      return res.status(404).json({
        success: false,
        error: 'Document not found or sharing disabled'
      });
    }
    
    // Check if sharing has expired
    if (document.sharing.expiresAt && document.sharing.expiresAt < new Date()) {
      return res.status(404).json({
        success: false,
        error: 'Sharing link has expired'
      });
    }
    
    res.json({
      success: true,
      document: {
        _id: document._id,
        title: document.title,
        content: document.content,
        owner: document.owner,
        sharing: document.sharing,
        wordCount: document.wordCount,
        lastModified: document.lastModified
      }
    });
  } catch (error) {
    console.error('Get shared document error:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// NEW: Access shared document (with auth)
router.get('/shared/:token/access', auth, async (req, res) => {
  try {
    const { token } = req.params;
    
    const document = await Document.findOne({
      'sharing.token': token,
      'sharing.isEnabled': true
    }).populate('owner', 'name email');
    
    if (!document) {
      return res.status(404).json({
        success: false,
        error: 'Document not found or sharing disabled'
      });
    }
    
    // Check if sharing has expired
    if (document.sharing.expiresAt && document.sharing.expiresAt < new Date()) {
      return res.status(404).json({
        success: false,
        error: 'Sharing link has expired'
      });
    }
    
    res.json({
      success: true,
      document,
      permission: document.sharing.permission,
      isOwner: document.owner._id.toString() === req.user.id
    });
  } catch (error) {
    console.error('Access shared document error:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// NEW: Enable/Update sharing
router.post('/:id/share', auth, async (req, res) => {
  try {
    const { permission, expiresIn } = req.body; // expiresIn in hours
    
    const document = await Document.findOne({
      _id: req.params.id,
      owner: req.user.id
    });
    
    if (!document) {
      return res.status(404).json({
        success: false,
        error: 'Document not found'
      });
    }
    
    // Generate token if not exists
    if (!document.sharing.token) {
      document.generateSharingToken();
    }
    
    document.sharing.isEnabled = true;
    document.sharing.permission = permission || 'read';
    
    // Set expiration if provided
    if (expiresIn) {
      document.sharing.expiresAt = new Date(Date.now() + (expiresIn * 60 * 60 * 1000));
    } else {
      document.sharing.expiresAt = null;
    }
    
    await document.save();
    
    const shareUrl = `${req.protocol}://${req.get('host')}/shared/${document.sharing.token}`;
    
    res.json({
      success: true,
      shareUrl,
      sharing: document.sharing
    });
  } catch (error) {
    console.error('Enable sharing error:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// NEW: Disable sharing
router.delete('/:id/share', auth, async (req, res) => {
  try {
    const document = await Document.findOne({
      _id: req.params.id,
      owner: req.user.id
    });
    
    if (!document) {
      return res.status(404).json({
        success: false,
        error: 'Document not found'
      });
    }
    
    document.sharing.isEnabled = false;
    document.sharing.token = undefined;
    document.sharing.expiresAt = null;
    
    await document.save();
    
    res.json({
      success: true,
      message: 'Sharing disabled'
    });
  } catch (error) {
    console.error('Disable sharing error:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Create new document
router.post('/', auth, async (req, res) => {
  try {
    const { title, content } = req.body;
    
    const document = new Document({
      title: title || 'Untitled Document',
      content: content || '',
      owner: req.user.id
    });
    
    await document.save();
    
    res.status(201).json({
      success: true,
      document
    });
  } catch (error) {
    console.error('Create document error:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Update document
router.put('/:id', auth, async (req, res) => {
  try {
    const document = await Document.findOne({
      _id: req.params.id,
      owner: req.user.id
    });
    
    if (!document) {
      return res.status(404).json({
        success: false,
        error: 'Document not found'
      });
    }
    
    const allowedUpdates = ['title', 'content', 'tags', 'isFavorite', 'isPublic'];
    const updates = Object.keys(req.body)
      .filter(key => allowedUpdates.includes(key))
      .reduce((obj, key) => {
        obj[key] = req.body[key];
        return obj;
      }, {});
    
    Object.assign(document, updates);
    document.updateWordCount();
    
    await document.save();
    
    res.json({
      success: true,
      document
    });
  } catch (error) {
    console.error('Update document error:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// NEW: Update shared document (for collaborators)
router.put('/shared/:token', auth, async (req, res) => {
  try {
    const { token } = req.params;
    
    const document = await Document.findOne({
      'sharing.token': token,
      'sharing.isEnabled': true
    });
    
    if (!document) {
      return res.status(404).json({
        success: false,
        error: 'Document not found or sharing disabled'
      });
    }
    
    // Check if sharing has expired
    if (document.sharing.expiresAt && document.sharing.expiresAt < new Date()) {
      return res.status(404).json({
        success: false,
        error: 'Sharing link has expired'
      });
    }
    
    // Check permission
    if (document.sharing.permission === 'read') {
      return res.status(403).json({
        success: false,
        error: 'Read-only access'
      });
    }
    
    const allowedUpdates = ['title', 'content'];
    const updates = Object.keys(req.body)
      .filter(key => allowedUpdates.includes(key))
      .reduce((obj, key) => {
        obj[key] = req.body[key];
        return obj;
      }, {});
    
    Object.assign(document, updates);
    document.updateWordCount();
    
    await document.save();
    
    res.json({
      success: true,
      document
    });
  } catch (error) {
    console.error('Update shared document error:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Delete document
router.delete('/:id', auth, async (req, res) => {
  try {
    const document = await Document.findOneAndDelete({
      _id: req.params.id,
      owner: req.user.id
    });
    
    if (!document) {
      return res.status(404).json({
        success: false,
        error: 'Document not found'
      });
    }
    
    res.json({
      success: true,
      message: 'Document deleted successfully'
    });
  } catch (error) {
    console.error('Delete document error:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

module.exports = router;
