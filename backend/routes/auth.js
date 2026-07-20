const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
// register/login
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

router.post('/register', async (req, res) => {
  try {
    const { username, email, password } = req.body;
    let user = await User.findOne({ email });
    if (user) return res.status(400).json({ msg: 'User already exists' });
    let userNameCheck = await User.findOne({ username });
    if (userNameCheck) return res.status(400).json({ msg: 'Username already taken' });

    user = new User({ username, email, password });
    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(password, salt);
    await user.save();

    const payload = { userId: user.id };
    jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '5h' }, (err, token) => {
      if (err) throw err;
      res.json({ token, userId: user.id, username: user.username });
    });
  } catch (err) { res.status(500).send('Server error'); }
});

router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ msg: 'Invalid Credentials' });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(400).json({ msg: 'Invalid Credentials' });

    const payload = { userId: user.id };
    jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '5h' }, (err, token) => {
      if (err) throw err;
      res.json({ token, userId: user.id, username: user.username });
    });
  } catch (err) { res.status(500).send('Server error'); }
});

router.get('/user', auth, async (req, res) => {
  try {
    const user = await User.findById(req.user)
      .select('-password')
      .populate('friends', 'username')
      .populate('friendRequests', 'username')
      .populate('sentRequests', 'username');
    res.json(user);
  } catch (err) { res.status(500).send('Server Error'); }
});

router.put('/user/bio', auth, async (req, res) => {
  try {
    const user = await User.findById(req.user).select('-password');
    user.bio = req.body.bio;
    await user.save();
    res.json(user);
  } catch (err) { res.status(500).send('Server Error'); }
});

router.post('/friend-request/:id', auth, async (req, res) => {
  try {
    const sender = await User.findById(req.user);
    const receiver = await User.findById(req.params.id);
    if (!receiver) return res.status(404).json({ msg: 'User not found' });
    if (sender._id.toString() === receiver._id.toString()) return res.status(400).json({ msg: 'Cannot friend yourself' });
    if (sender.friends.includes(receiver._id)) return res.status(400).json({ msg: 'Already friends' });
    if (sender.sentRequests.includes(receiver._id)) return res.status(400).json({ msg: 'Request already sent' });

    sender.sentRequests.push(receiver._id);
    receiver.friendRequests.push(sender._id);
    await sender.save();
    await receiver.save();
    
    const updatedUser = await User.findById(req.user).select('-password').populate('friends', 'username').populate('friendRequests', 'username').populate('sentRequests', 'username');
    res.json(updatedUser);
  } catch (err) { res.status(500).send('Server Error'); }
});

router.post('/friend-accept/:id', auth, async (req, res) => {
  try {
    const user = await User.findById(req.user);
    const sender = await User.findById(req.params.id);

    user.friendRequests = user.friendRequests.filter(id => id.toString() !== sender._id.toString());
    sender.sentRequests = sender.sentRequests.filter(id => id.toString() !== user._id.toString());

    if (!user.friends.includes(sender._id)) user.friends.push(sender._id);
    if (!sender.friends.includes(user._id)) sender.friends.push(user._id);

    await user.save();
    await sender.save();

    const updatedUser = await User.findById(req.user).select('-password').populate('friends', 'username').populate('friendRequests', 'username').populate('sentRequests', 'username');
    res.json(updatedUser);
  } catch (err) { res.status(500).send('Server Error'); }
});

router.post('/friend-reject/:id', auth, async (req, res) => {
  try {
    const user = await User.findById(req.user);
    const sender = await User.findById(req.params.id);

    user.friendRequests = user.friendRequests.filter(id => id.toString() !== sender._id.toString());
    sender.sentRequests = sender.sentRequests.filter(id => id.toString() !== user._id.toString());

    await user.save();
    await sender.save();

    const updatedUser = await User.findById(req.user).select('-password').populate('friends', 'username').populate('friendRequests', 'username').populate('sentRequests', 'username');
    res.json(updatedUser);
  } catch (err) { res.status(500).send('Server Error'); }
});

router.delete('/friend-remove/:id', auth, async (req, res) => {
  try {
    const user = await User.findById(req.user);
    const friend = await User.findById(req.params.id);

    user.friends = user.friends.filter(id => id.toString() !== friend._id.toString());
    friend.friends = friend.friends.filter(id => id.toString() !== user._id.toString());

    await user.save();
    await friend.save();

    const updatedUser = await User.findById(req.user).select('-password').populate('friends', 'username').populate('friendRequests', 'username').populate('sentRequests', 'username');
    res.json(updatedUser);
  } catch (err) { res.status(500).send('Server Error'); }
});

module.exports = router;