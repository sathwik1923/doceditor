const mongoose = require('mongoose');

const documentSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    default: 'Untitled Document'
  },
  content: {
    type: String,
    default: ''
  },
  owner: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  collaborators: [{
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    permission: {
      type: String,
      enum: ['read', 'write', 'admin'],
      default: 'read'
    },
    addedAt: {
      type: Date,
      default: Date.now
    }
  }],
  // NEW: Sharing configuration
  sharing: {
    isEnabled: {
      type: Boolean,
      default: false
    },
    permission: {
      type: String,
      enum: ['read', 'write'],
      default: 'read'
    },
    token: {
      type: String,
      unique: true,
      sparse: true
    },
    expiresAt: {
      type: Date,
      default: null // null means no expiration
    }
  },
  tags: [{
    type: String,
    trim: true
  }],
  wordCount: {
    type: Number,
    default: 0
  },
  isFavorite: {
    type: Boolean,
    default: false
  },
  isPublic: {
    type: Boolean,
    default: false
  },
  lastModified: {
    type: Date,
    default: Date.now
  },
  version: {
    type: Number,
    default: 1
  }
}, {
  timestamps: true
});

// Update lastModified on save
documentSchema.pre('save', function(next) {
  this.lastModified = new Date();
  next();
});

// Method to update word count
documentSchema.methods.updateWordCount = function() {
  const text = this.content.replace(/<[^>]*>/g, '');
  const words = text.trim() ? text.trim().split(/\s+/).length : 0;
  this.wordCount = words;
};

// Method to generate sharing token
documentSchema.methods.generateSharingToken = function() {
  const crypto = require('crypto');
  this.sharing.token = crypto.randomBytes(32).toString('hex');
  return this.sharing.token;
};

documentSchema.index({ owner: 1 });
documentSchema.index({ title: 'text', content: 'text' });
documentSchema.index({ 'sharing.token': 1 });

module.exports = mongoose.model('Document', documentSchema);
