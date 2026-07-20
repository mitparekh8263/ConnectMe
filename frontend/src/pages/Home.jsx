/* eslint-disable no-empty */
/* eslint-disable no-unused-vars */
import { useState, useEffect } from 'react';
import axios from 'axios';

const Home = () => {
  const [posts, setPosts] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [bookmarks, setBookmarks] = useState([]);
  const [commentInputs, setCommentInputs] = useState({});
  const [activeReplyBox, setActiveReplyBox] = useState(null);
  const [replyInputs, setReplyInputs] = useState({});
  const [friends, setFriends] = useState([]);
  const [sentRequests, setSentRequests] = useState([]);
  const [friendRequests, setFriendRequests] = useState([]);
  const [activeTab, setActiveTab] = useState('latest'); 
  const [trendingPosts, setTrendingPosts] = useState([]);
  const [viewedPosts, setViewedPosts] = useState(new Set());
  const [newPostData, setNewPostData] = useState({ title: '', content: '', coverImage: '', tags: '', visibility: 'public' });
  const [isCreatingPost, setIsCreatingPost] = useState(false);

  const currentUserId = localStorage.getItem('userId');
  const isAuthenticated = !!localStorage.getItem('token');
  const currentUsername = localStorage.getItem('username') || "User";

  useEffect(() => {
    const fetchData = async () => {
      try {
        const postRes = await axios.get('http://localhost:5000/api/posts', { headers: isAuthenticated ? { 'x-auth-token': localStorage.getItem('token') } : {} });
        setPosts(postRes.data);
        const trendingRes = await axios.get('http://localhost:5000/api/posts/trending', { headers: isAuthenticated ? { 'x-auth-token': localStorage.getItem('token') } : {} });
        setTrendingPosts(trendingRes.data);
        if (isAuthenticated) {
          const token = localStorage.getItem('token');
          const userRes = await axios.get('http://localhost:5000/api/auth/user', { headers: { 'x-auth-token': token } });
          setBookmarks(userRes.data.bookmarks || []);
          if (userRes.data) {
            setFriends(userRes.data.friends.map(f => f._id));
            setSentRequests(userRes.data.sentRequests.map(f => f._id));
            setFriendRequests(userRes.data.friendRequests.map(f => f._id));
          }
        }
      } catch (error) { console.error("Fetch error", error); }
    };
    fetchData();
  }, [isAuthenticated, activeTab]); 

  const handleCreatePost = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.post('http://localhost:5000/api/posts', newPostData, { headers: { 'x-auth-token': localStorage.getItem('token') } });
      setPosts([response.data, ...posts]); 
      setNewPostData({ title: '', content: '', coverImage: '', tags: '', visibility: 'public' });
      setIsCreatingPost(false);
    } catch (error) { alert("Error creating post"); }
  };

  const handleSendRequest = async (targetUserId) => {
    try {
      const response = await axios.post(`http://localhost:5000/api/auth/friend-request/${targetUserId}`, {}, { headers: { 'x-auth-token': localStorage.getItem('token') } });
      setFriends(response.data.friends.map(f => f._id));
      setSentRequests(response.data.sentRequests.map(f => f._id));
      setFriendRequests(response.data.friendRequests.map(f => f._id));
    } catch (error) { alert("Error sending friend request"); }
  };

  const registerView = async (postId) => {
    if (viewedPosts.has(postId)) return; 
    try {
      await axios.put(`http://localhost:5000/api/posts/view/${postId}`);
      setViewedPosts(prev => new Set(prev).add(postId));
    } catch (error) { }
  };

  const handleDelete = async (postId) => {
    if (!window.confirm("Delete this post?")) return;
    try {
      await axios.delete(`http://localhost:5000/api/posts/${postId}`, { headers: { 'x-auth-token': localStorage.getItem('token') } });
      setPosts(posts.filter(post => post._id !== postId));
      setTrendingPosts(trendingPosts.filter(post => post._id !== postId));
    } catch (error) { alert("Error deleting post"); }
  };

  const handleLike = async (postId) => {
    try {
      const response = await axios.put(`http://localhost:5000/api/posts/like/${postId}`, {}, { headers: { 'x-auth-token': localStorage.getItem('token') } });
      const updateLikes = (p) => p._id === postId ? { ...p, likes: response.data } : p;
      setPosts(posts.map(updateLikes));
      setTrendingPosts(trendingPosts.map(updateLikes));
    } catch (error) { }
  };

  const handleBookmark = async (postId) => {
    try {
      const response = await axios.put(`http://localhost:5000/api/posts/bookmark/${postId}`, {}, { headers: { 'x-auth-token': localStorage.getItem('token') } });
      setBookmarks(response.data); 
    } catch (error) { }
  };

  const handleCommentSubmit = async (postId) => {
    const text = commentInputs[postId];
    if (!text || text.trim() === '') return;
    try {
      const response = await axios.post(`http://localhost:5000/api/posts/comment/${postId}`, { text }, { headers: { 'x-auth-token': localStorage.getItem('token') } });
      const updateComments = (p) => p._id === postId ? { ...p, comments: response.data } : p;
      setPosts(posts.map(updateComments));
      setTrendingPosts(trendingPosts.map(updateComments));
      setCommentInputs({ ...commentInputs, [postId]: '' });
    } catch (error) { alert("Error posting comment"); }
  };

  const handleDeleteComment = async (postId, commentId) => {
    if (!window.confirm("Delete comment?")) return;
    try {
      const response = await axios.delete(`http://localhost:5000/api/posts/comment/${postId}/${commentId}`, { headers: { 'x-auth-token': localStorage.getItem('token') } });
      const updateComments = (p) => p._id === postId ? { ...p, comments: response.data } : p;
      setPosts(posts.map(updateComments));
      setTrendingPosts(trendingPosts.map(updateComments));
    } catch (error) { alert("Error deleting comment"); }
  };

  const handleReplySubmit = async (postId, commentId) => {
    const text = replyInputs[commentId];
    if (!text || text.trim() === '') return;
    try {
      const response = await axios.post(`http://localhost:5000/api/posts/comment/${postId}/${commentId}/reply`, { text }, { headers: { 'x-auth-token': localStorage.getItem('token') } });
      const updateComments = (p) => p._id === postId ? { ...p, comments: response.data } : p;
      setPosts(posts.map(updateComments));
      setTrendingPosts(trendingPosts.map(updateComments));
      setReplyInputs({ ...replyInputs, [commentId]: '' });
      setActiveReplyBox(null);
    } catch (error) { alert("Error posting reply"); }
  };

  const handleDeleteReply = async (postId, commentId, replyId) => {
    if (!window.confirm("Delete reply?")) return;
    try {
      const response = await axios.delete(`http://localhost:5000/api/posts/comment/${postId}/${commentId}/reply/${replyId}`, { headers: { 'x-auth-token': localStorage.getItem('token') } });
      const updateComments = (p) => p._id === postId ? { ...p, comments: response.data } : p;
      setPosts(posts.map(updateComments));
      setTrendingPosts(trendingPosts.map(updateComments));
    } catch (error) { alert("Error deleting reply"); }
  };

  const filteredPosts = posts.filter((post) => {
    const searchLower = searchTerm.toLowerCase();
    return post.title.toLowerCase().includes(searchLower) || (post.tags && post.tags.some(tag => tag.toLowerCase().includes(searchLower)));
  });

  const postsToDisplay = activeTab === 'latest' ? filteredPosts : trendingPosts;

  return (
    <div style={{ maxWidth: '680px', margin: '40px auto', color: 'var(--text-main)' }}>
      <h2 style={{ textAlign: 'center', marginBottom: '20px', fontSize: '2rem', fontWeight: '800' }}>Global Feed</h2>

      <div style={{ marginBottom: '30px' }}>
        <input type="text" placeholder="🔍 Search posts by title or tag..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} style={{ width: '100%', padding: '16px 20px', borderRadius: '30px', border: '1px solid var(--border-color)', backgroundColor: 'var(--bg-card)', color: 'var(--text-main)', boxShadow: 'var(--shadow-sm)', fontSize: '1.05rem', outline: 'none', boxSizing: 'border-box' }} />
      </div>

      {isAuthenticated && (
        <div style={{ marginBottom: '40px' }}>
          {!isCreatingPost ? (
            <button onClick={() => setIsCreatingPost(true)} style={{ width: '100%', padding: '20px', backgroundColor: 'var(--bg-card)', border: '2px dashed var(--border-color)', borderRadius: '16px', color: 'var(--text-muted)', fontSize: '1.1rem', fontWeight: '600', cursor: 'pointer', transition: 'all 0.2s', boxShadow: 'var(--shadow-sm)' }}>
              + What's on your mind, {currentUsername}?
            </button>
          ) : (
            <form onSubmit={handleCreatePost} style={{ backgroundColor: 'var(--bg-card)', padding: '24px', borderRadius: '16px', boxShadow: 'var(--shadow-sm)', display: 'flex', flexDirection: 'column', gap: '15px', border: '1px solid var(--border-color)' }}>
              <h3 style={{ margin: 0, display: 'flex', justifyContent: 'space-between', alignItems: 'center', color: 'var(--text-main)' }}>
                Create a Post
                <select value={newPostData.visibility} onChange={(e) => setNewPostData({...newPostData, visibility: e.target.value})} style={{ padding: '8px 12px', borderRadius: '8px', border: '1px solid var(--border-color)', backgroundColor: 'var(--input-bg)', color: 'var(--text-main)', outline: 'none', fontWeight: 'bold', fontSize: '0.9rem' }}>
                  <option value="public">🌍 Public</option>
                  <option value="friends">🔒 Friends Only</option>
                </select>
              </h3>
              <input type="text" placeholder="Post Title" value={newPostData.title} onChange={(e) => setNewPostData({...newPostData, title: e.target.value})} required style={{ padding: '12px', borderRadius: '8px', border: '1px solid var(--border-color)', backgroundColor: 'var(--input-bg)', color: 'var(--text-main)', outline: 'none' }} />
              <input type="url" placeholder="Cover Image URL (Optional)" value={newPostData.coverImage} onChange={(e) => setNewPostData({...newPostData, coverImage: e.target.value})} style={{ padding: '12px', borderRadius: '8px', border: '1px solid var(--border-color)', backgroundColor: 'var(--input-bg)', color: 'var(--text-main)', outline: 'none' }} />
              <input type="text" placeholder="Tags (comma separated)" value={newPostData.tags} onChange={(e) => setNewPostData({...newPostData, tags: e.target.value})} style={{ padding: '12px', borderRadius: '8px', border: '1px solid var(--border-color)', backgroundColor: 'var(--input-bg)', color: 'var(--text-main)', outline: 'none' }} />
              <textarea placeholder="Write your thoughts..." value={newPostData.content} onChange={(e) => setNewPostData({...newPostData, content: e.target.value})} required rows="5" style={{ padding: '12px', borderRadius: '8px', border: '1px solid var(--border-color)', backgroundColor: 'var(--input-bg)', color: 'var(--text-main)', outline: 'none', resize: 'vertical' }} />
              <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
                <button type="button" onClick={() => setIsCreatingPost(false)} style={{ padding: '10px 20px', background: 'transparent', color: 'var(--text-muted)', border: 'none', fontWeight: '600', cursor: 'pointer' }}>Cancel</button>
                <button type="submit" style={{ padding: '10px 24px', background: '#4f46e5', color: 'white', border: 'none', borderRadius: '8px', fontWeight: '600', cursor: 'pointer' }}>Publish</button>
              </div>
            </form>
          )}
        </div>
      )}

      <div style={{ display: 'flex', borderBottom: '2px solid var(--border-color)', marginBottom: '30px' }}>
        <button onClick={() => setActiveTab('latest')} style={{ flex: 1, padding: '15px', background: 'none', border: 'none', borderBottom: activeTab === 'latest' ? '3px solid #4f46e5' : '3px solid transparent', color: activeTab === 'latest' ? '#4f46e5' : 'var(--text-muted)', fontWeight: '800', fontSize: '1.1rem', cursor: 'pointer', transition: 'all 0.2s' }}>🌍 Latest</button>
        <button onClick={() => setActiveTab('trending')} style={{ flex: 1, padding: '15px', background: 'none', border: 'none', borderBottom: activeTab === 'trending' ? '3px solid #ef4444' : '3px solid transparent', color: activeTab === 'trending' ? '#ef4444' : 'var(--text-muted)', fontWeight: '800', fontSize: '1.1rem', cursor: 'pointer', transition: 'all 0.2s' }}>🔥 Trending</button>
      </div>
      
      {postsToDisplay.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '40px', backgroundColor: 'var(--bg-card)', borderRadius: '12px', border: '1px dashed var(--border-color)' }}><p style={{ color: 'var(--text-muted)', fontSize: '1.1rem' }}>No posts found.</p></div>
      ) : (
        postsToDisplay.map((post, index) => {
          const formattedDate = new Date(post.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
          const hasLiked = (post.likes || []).includes(currentUserId);
          const isBookmarked = bookmarks.includes(post._id);
          const targetId = post.author?._id;
          const isFriend = friends.includes(targetId);
          const isPending = sentRequests.includes(targetId);
          const needsResponse = friendRequests.includes(targetId);

          return (
            <div key={post._id} onClick={() => registerView(post._id)} style={{ backgroundColor: 'var(--bg-card)', padding: '24px', marginBottom: '24px', borderRadius: '16px', border: activeTab === 'trending' && index === 0 ? '2px solid #ef4444' : '1px solid var(--border-color)', boxShadow: 'var(--shadow-sm)', position: 'relative' }}>
              
              {activeTab === 'trending' && index === 0 && <div style={{ position: 'absolute', top: '-15px', left: '20px', backgroundColor: '#ef4444', color: 'white', padding: '5px 15px', borderRadius: '20px', fontWeight: '900', fontSize: '0.9rem', boxShadow: '0 4px 6px -1px rgba(239, 68, 68, 0.4)' }}>👑 #1 Hottest</div>}

              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px', marginTop: activeTab === 'trending' && index === 0 ? '10px' : '0' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <div style={{ width: '40px', height: '40px', borderRadius: '50%', backgroundColor: '#e0e7ff', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#4f46e5', fontWeight: 'bold', fontSize: '1.2rem' }}>
                    {post.author?.username?.charAt(0).toUpperCase() || '?'}
                  </div>
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center' }}>
                      <h4 style={{ margin: 0, fontSize: '1rem', fontWeight: '600', color: 'var(--text-main)' }}>{post.author?.username || 'Unknown'}</h4>
                      {currentUserId !== targetId && isAuthenticated && targetId && (
                        <div style={{ marginLeft: '10px' }}>
                          {isFriend ? <span style={{ fontSize: '0.75rem', padding: '4px 10px', borderRadius: '12px', backgroundColor: 'var(--hover-bg)', color: 'var(--text-muted)', fontWeight: 'bold' }}>✓ Friends</span> : isPending ? <span style={{ fontSize: '0.75rem', padding: '4px 10px', borderRadius: '12px', backgroundColor: '#fef3c7', color: '#d97706', fontWeight: 'bold' }}>⏳ Pending</span> : needsResponse ? <span style={{ fontSize: '0.75rem', padding: '4px 10px', borderRadius: '12px', backgroundColor: '#e0e7ff', color: '#4f46e5', fontWeight: 'bold' }}>See Requests</span> : <button onClick={(e) => { e.stopPropagation(); handleSendRequest(targetId); }} style={{ padding: '4px 10px', fontSize: '0.75rem', borderRadius: '12px', border: 'none', backgroundColor: '#e0e7ff', color: '#4f46e5', fontWeight: 'bold', cursor: 'pointer' }}>+ Add Friend</button>}
                        </div>
                      )}
                    </div>
                    <small style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>{formattedDate} • <span style={{ fontWeight: '600', color: post.visibility === 'friends' ? '#d97706' : 'var(--text-muted)' }}>{post.visibility === 'friends' ? '🔒 Friends Only' : '🌍 Public'}</span></small>
                  </div>
                </div>
                {currentUserId === post.author?._id && <button onClick={(e) => { e.stopPropagation(); handleDelete(post._id); }} style={{ background: 'transparent', color: '#ef4444', border: '1px solid #fee2e2', borderRadius: '8px', padding: '6px 12px', cursor: 'pointer', fontWeight: '600', fontSize: '0.85rem' }}>Delete</button>}
              </div>

              <h3 style={{ margin: '0 0 16px 0', color: 'var(--text-main)', fontSize: '1.25rem', fontWeight: '700' }}>{post.title}</h3>
              
              {post.tags && post.tags.length > 0 && (
                <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', marginBottom: '16px' }}>
                  {post.tags.map((tag, i) => <span key={i} style={{ backgroundColor: '#e0e7ff', color: '#4f46e5', padding: '4px 10px', borderRadius: '12px', fontSize: '0.8rem', fontWeight: 'bold' }}>#{tag}</span>)}
                </div>
              )}

              {post.coverImage && <img src={post.coverImage} alt="Cover" style={{ width: '100%', maxHeight: '350px', objectFit: 'cover', borderRadius: '12px', marginBottom: '16px', border: '1px solid var(--border-color)' }} onError={(e) => { e.target.style.display = 'none' }} />}
              <p style={{ margin: '0 0 20px 0', color: 'var(--text-main)', lineHeight: '1.6', fontSize: '1.05rem', whiteSpace: 'pre-wrap' }}>{post.content}</p>
              
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingBottom: '16px', borderBottom: '1px solid var(--border-color)' }}>
                <div style={{ display: 'flex', gap: '15px', alignItems: 'center' }}>
                  <button onClick={(e) => { e.stopPropagation(); handleLike(post._id); }} style={{ background: hasLiked ? '#fef2f2' : 'var(--hover-bg)', border: 'none', borderRadius: '20px', padding: '8px 16px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px', color: hasLiked ? '#ef4444' : 'var(--text-muted)', fontWeight: '600', fontSize: '0.95rem' }}>{hasLiked ? '❤️' : '🤍'} {post.likes?.length || 0}</button>
                  <span style={{ color: 'var(--text-muted)', fontSize: '0.95rem', fontWeight: '500' }}>💬 {post.comments?.length || 0} Comments</span>
                </div>
                <button onClick={(e) => { e.stopPropagation(); handleBookmark(post._id); }} style={{ background: isBookmarked ? '#e0e7ff' : 'transparent', color: isBookmarked ? '#4f46e5' : 'var(--text-muted)', border: isBookmarked ? 'none' : '1px solid var(--border-color)', borderRadius: '20px', padding: '8px 16px', cursor: 'pointer', fontWeight: '600', fontSize: '0.95rem' }}>{isBookmarked ? '🔖 Saved' : '📑 Save'}</button>
              </div>

              <div style={{ marginTop: '16px' }} onClick={(e) => e.stopPropagation()}>
                {post.comments && post.comments.length > 0 && (
                  <div style={{ marginBottom: '16px', maxHeight: '300px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '16px' }}>
                    {post.comments.map((comment) => (
                      <div key={comment._id} style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                        <div style={{ backgroundColor: 'var(--input-bg)', padding: '12px 16px', borderRadius: '12px', border: '1px solid var(--border-color)' }}>
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                            <div>
                              <span style={{ fontWeight: '600', color: 'var(--text-main)', marginRight: '8px', fontSize: '0.9rem' }}>{comment.username}</span> 
                              <span style={{ color: 'var(--text-main)', fontSize: '0.95rem' }}>{comment.text}</span>
                            </div>
                            <div style={{ display: 'flex', gap: '8px' }}>
                              {isAuthenticated && <button onClick={(e) => { e.stopPropagation(); setActiveReplyBox(activeReplyBox === comment._id ? null : comment._id); }} style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', fontSize: '0.8rem', fontWeight: 'bold' }}>Reply</button>}
                              {currentUserId === comment.user && <button onClick={(e) => { e.stopPropagation(); handleDeleteComment(post._id, comment._id); }} style={{ background: 'none', border: 'none', color: '#ef4444', cursor: 'pointer', fontSize: '1rem', padding: '0', opacity: '0.6' }}>🗑️</button>}
                            </div>
                          </div>
                        </div>
                        {comment.replies && comment.replies.length > 0 && (
                          <div style={{ marginLeft: '20px', borderLeft: '2px solid var(--border-color)', paddingLeft: '16px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                            {comment.replies.map(reply => (
                              <div key={reply._id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', backgroundColor: 'var(--bg-card)', padding: '8px 12px', borderRadius: '8px', border: '1px solid var(--border-color)' }}>
                                <div>
                                  <span style={{ fontWeight: '600', color: 'var(--text-muted)', marginRight: '8px', fontSize: '0.85rem' }}>{reply.username}</span> 
                                  <span style={{ color: 'var(--text-main)', fontSize: '0.9rem' }}>{reply.text}</span>
                                </div>
                                {currentUserId === reply.user && <button onClick={(e) => { e.stopPropagation(); handleDeleteReply(post._id, comment._id, reply._id); }} style={{ background: 'none', border: 'none', color: '#ef4444', cursor: 'pointer', fontSize: '0.9rem', opacity: '0.5' }}>🗑️</button>}
                              </div>
                            ))}
                          </div>
                        )}
                        {activeReplyBox === comment._id && (
                          <div style={{ marginLeft: '20px', display: 'flex', gap: '10px', marginTop: '4px' }}>
                            <input type="text" placeholder="Reply..." value={replyInputs[comment._id] || ''} onChange={(e) => setReplyInputs({ ...replyInputs, [comment._id]: e.target.value })} style={{ flex: 1, padding: '8px 12px', borderRadius: '20px', border: '1px solid var(--border-color)', backgroundColor: 'var(--input-bg)', color: 'var(--text-main)', fontSize: '0.85rem', outline: 'none' }} />
                            <button onClick={() => handleReplySubmit(post._id, comment._id)} style={{ backgroundColor: '#10b981', color: 'white', border: 'none', borderRadius: '20px', padding: '6px 16px', cursor: 'pointer', fontWeight: 'bold', fontSize: '0.85rem' }}>Reply</button>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
                {isAuthenticated && (
                  <div style={{ display: 'flex', gap: '10px', marginTop: '12px' }}>
                    <input type="text" placeholder="Write a comment..." value={commentInputs[post._id] || ''} onChange={(e) => setCommentInputs({ ...commentInputs, [post._id]: e.target.value })} style={{ flex: 1, padding: '12px 16px', borderRadius: '24px', border: '1px solid var(--border-color)', backgroundColor: 'var(--input-bg)', color: 'var(--text-main)', outline: 'none', fontSize: '0.95rem' }} />
                    <button onClick={() => handleCommentSubmit(post._id)} style={{ backgroundColor: '#3b82f6', color: 'white', border: 'none', borderRadius: '24px', padding: '10px 20px', cursor: 'pointer', fontWeight: '600', fontSize: '0.95rem' }}>Post</button>
                  </div>
                )}
              </div>
            </div>
          );
        })
      )}
    </div>
  );
};

export default Home;