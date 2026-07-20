const mongoose = require('mongoose');
//user data storage
const UserSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  bio: { type: String, default: "" },
  bookmarks: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Post' }],
  
  friends: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  friendRequests: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }], 
  sentRequests: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }]    
});

module.exports = mongoose.model('User', UserSchema);