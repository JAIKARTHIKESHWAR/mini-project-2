import mongoose from 'mongoose';

const sessionSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  refreshTokenHash: {
    type: String,
    required: true,
    unique: true,
    index: true
  },
  expiresAt: {
    type: Date,
    required: true,
    index: { expireAfterSeconds: 0 } // Auto-delete expired sessions
  },
  isRevoked: {
    type: Boolean,
    default: false,
    index: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  },
  ipAddress: {
    type: String
  },
  userAgent: {
    type: String
  }
}, {
  timestamps: true
});

// Index for efficient queries
sessionSchema.index({ userId: 1, isRevoked: 1 });
sessionSchema.index({ refreshTokenHash: 1, isRevoked: 1, expiresAt: 1 });

// Method to check if session is valid
sessionSchema.methods.isValid = function() {
  return !this.isRevoked && this.expiresAt > new Date();
};

// Static method to find valid session by refresh token hash
sessionSchema.statics.findValidSession = async function(refreshTokenHash) {
  return await this.findOne({
    refreshTokenHash,
    isRevoked: false,
    expiresAt: { $gt: new Date() }
  });
};

// Static method to revoke all sessions for a user
sessionSchema.statics.revokeAllUserSessions = async function(userId) {
  return await this.updateMany(
    { userId, isRevoked: false },
    { 
      isRevoked: true,
      updatedAt: new Date()
    }
  );
};

const Session = mongoose.model('Session', sessionSchema);

export default Session;

