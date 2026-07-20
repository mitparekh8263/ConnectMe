const express = require('express');
const router = express.Router();
const Post = require('../models/Post');
const jwt = require('jsonwebtoken');

const auth = (req, res, next) => {
  const token = req.header('x-auth-token');
  if (!token) return res.status(401).json({ msg: 'No token, authorization denied' });
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded.userId;
    next();
  } catch (err) {
    res.status(401).json({ msg: 'Token is not valid' });
  }
};

router.get('/trending', async (req, res) => {
  try {
    const token = req.header('x-auth-token');
    let currentUserId = null;
    if (token) {
      try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        currentUserId = decoded.userId;
      } catch (err) { }
    }

    const posts = await Post.find().populate('author', ['username', 'friends']);
    
    const visiblePosts = posts.filter(post => {
      if (post.visibility === 'public' || !post.visibility) return true; 
      if (!currentUserId) return false; 
      const isAuthor = post.author._id.toString() === currentUserId;
      const isFriend = post.author.friends && post.author.friends.includes(currentUserId);
      return isAuthor || isFriend; 
    });

    const sortedPosts = visiblePosts.sort((a, b) => {
      const scoreA = (a.likes.length * 2) + a.views + (a.comments.length * 3);
      const scoreB = (b.likes.length * 2) + b.views + (b.comments.length * 3);
      return scoreB - scoreA; 
    });

    res.json(sortedPosts.slice(0, 5));
  } catch (err) { res.status(500).send('Server Error'); }
});

router.post('/', auth, async (req, res) => {
  try {
    const { title, content, coverImage, tags, visibility } = req.body; 
    let tagArray = [];
    if (tags) {
      tagArray = Array.isArray(tags) ? tags : tags.split(',').map(tag => tag.trim().toLowerCase());
    }
    
    const newPost = new Post({ 
      title, 
      content, 
      coverImage, 
      tags: tagArray, 
      visibility: visibility || 'public', 
      author: req.user 
    }); 
    
    let post = await newPost.save();
    post = await post.populate('author', ['username', 'friends']);
    res.json(post);
  } catch (err) {
    console.error("Error creating post:", err.message);
    res.status(500).send('Server Error');
  }
});

router.get('/', async (req, res) => {
  try {
    const token = req.header('x-auth-token');
    let currentUserId = null;
    if (token) {
      try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        currentUserId = decoded.userId;
      } catch (err) { }
    }

    const posts = await Post.find().populate('author', ['username', 'friends']).sort({ date: -1 });

    const visiblePosts = posts.filter(post => {
      if (post.visibility === 'public' || !post.visibility) return true; 
      if (!currentUserId) return false; 
      const isAuthor = post.author._id.toString() === currentUserId;
      const isFriend = post.author.friends && post.author.friends.includes(currentUserId);
      return isAuthor || isFriend; 
    });

    res.json(visiblePosts);
  } catch (err) { res.status(500).send('Server Error'); }
});

router.put('/:id', auth, async (req, res) => {
  try {
    let post = await Post.findById(req.params.id);
    if (!post) return res.status(404).json({ msg: 'Post not found' });
    if (post.author.toString() !== req.user) return res.status(401).json({ msg: 'Not authorized' });

    post.title = req.body.title || post.title;
    post.content = req.body.content || post.content;
    if (req.body.coverImage !== undefined) post.coverImage = req.body.coverImage;
    if (req.body.tags !== undefined) {
      post.tags = Array.isArray(req.body.tags) ? req.body.tags : req.body.tags.split(',').map(tag => tag.trim().toLowerCase());
    }
    if (req.body.visibility !== undefined) post.visibility = req.body.visibility; 

    await post.save();
    post = await post.populate('author', ['username', 'friends']);
    res.json(post);
  } catch (err) { res.status(500).send('Server Error'); }
});

router.delete('/:id', auth, async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    if (!post) return res.status(404).json({ msg: 'Post not found' });
    if (post.author.toString() !== req.user) return res.status(401).json({ msg: 'Not authorized' });

    await post.deleteOne();
    res.json({ msg: 'Post deleted successfully' });
  } catch (err) { res.status(500).send('Server Error'); }
});

router.put('/like/:id', auth, async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    if (!post) return res.status(404).json({ msg: 'Post not found' });

    const index = post.likes.indexOf(req.user);
    if (index === -1) post.likes.push(req.user);
    else post.likes.splice(index, 1);

    await post.save();
    res.json(post.likes); 
  } catch (err) { res.status(500).send('Server Error'); }
});

router.post('/comment/:id', auth, async (req, res) => {
  try {
    const User = require('../models/User');
    const user = await User.findById(req.user).select('-password');
    const post = await Post.findById(req.params.id);
    if (!post) return res.status(404).json({ msg: 'Post not found' });

    const newComment = { user: req.user, username: user.username, text: req.body.text };
    post.comments.push(newComment); // Switched to push so top comments are chronological
    await post.save();
    res.json(post.comments); 
  } catch (err) { res.status(500).send('Server Error'); }
});

router.delete('/comment/:id/:comment_id', auth, async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    if (!post) return res.status(404).json({ msg: 'Post not found' });

    const comment = post.comments.find(comment => comment.id === req.params.comment_id);
    if (!comment) return res.status(404).json({ msg: 'Comment does not exist' });
    if (comment.user.toString() !== req.user) return res.status(401).json({ msg: 'User not authorized to delete this comment' });

    post.comments = post.comments.filter(({ id }) => id !== req.params.comment_id);
    await post.save();
    res.json(post.comments);
  } catch (err) { res.status(500).send('Server Error'); }
});

router.put('/bookmark/:id', auth, async (req, res) => {
  try {
    const User = require('../models/User'); 
    const user = await User.findById(req.user);
    const post = await Post.findById(req.params.id);
    if (!post) return res.status(404).json({ msg: 'Post not found' });

    const index = user.bookmarks.indexOf(req.params.id);
    if (index === -1) user.bookmarks.push(req.params.id);
    else user.bookmarks.splice(index, 1);

    await user.save();
    res.json(user.bookmarks); 
  } catch (err) { res.status(500).send('Server Error'); }
});

router.put('/view/:id', async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    if (!post) return res.status(404).json({ msg: 'Post not found' });

    post.views += 1;
    await post.save();
    res.json({ views: post.views });
  } catch (err) { res.status(500).send('Server Error'); }
});

// 🚀 NEW: POST A REPLY TO A COMMENT
router.post('/comment/:id/:comment_id/reply', auth, async (req, res) => {
  try {
    const User = require('../models/User');
    const user = await User.findById(req.user).select('-password');
    const post = await Post.findById(req.params.id);
    if (!post) return res.status(404).json({ msg: 'Post not found' });

    const comment = post.comments.find(c => c.id === req.params.comment_id);
    if (!comment) return res.status(404).json({ msg: 'Comment not found' });

    const newReply = { user: req.user, username: user.username, text: req.body.text };
    comment.replies.push(newReply);
    
    await post.save();
    res.json(post.comments); 
  } catch (err) { res.status(500).send('Server Error'); }
});

// 🚀 NEW: DELETE A REPLY
router.delete('/comment/:id/:comment_id/reply/:reply_id', auth, async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    if (!post) return res.status(404).json({ msg: 'Post not found' });

    const comment = post.comments.find(c => c.id === req.params.comment_id);
    if (!comment) return res.status(404).json({ msg: 'Comment not found' });

    const reply = comment.replies.find(r => r.id === req.params.reply_id);
    if (!reply) return res.status(404).json({ msg: 'Reply not found' });
    
    if (reply.user.toString() !== req.user) return res.status(401).json({ msg: 'Not authorized' });

    comment.replies = comment.replies.filter(r => r.id !== req.params.reply_id);
    await post.save();
    res.json(post.comments);
  } catch (err) { res.status(500).send('Server Error'); }
});

module.exports = router;