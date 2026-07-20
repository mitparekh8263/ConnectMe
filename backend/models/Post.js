const mongoose = require('mongoose');

// Define the Reply structure
const ReplySchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  username: { type: String, required: true },
  text: { type: String, required: true },
  date: { type: Date, default: Date.now }
});
//posting content
const PostSchema = new mongoose.Schema({
  title: { type: String, required: true },
  content: { type: String, required: true },
  coverImage: { type: String, default: "" },
  tags: [{ type: String }], 
  visibility: { type: String, enum: ['public', 'friends'], default: 'public' },
  author: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  likes: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  views: { type: Number, default: 0 },
  
  // 🚀 UPGRADED: Comments now contain Replies!
  comments: [
    {
      user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
      username: { type: String, required: true },
      text: { type: String, required: true },
      date: { type: Date, default: Date.now },
      replies: [ReplySchema] 
    }
  ],
  date: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Post', PostSchema);