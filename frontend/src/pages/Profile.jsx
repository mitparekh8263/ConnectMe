/* eslint-disable no-unused-vars */
import { useState, useEffect } from 'react';
import axios from 'axios';

const Profile = () => {
  const [allPosts, setAllPosts] = useState([]);
  const currentUserId = localStorage.getItem('userId');
  const [user, setUser] = useState(null);
  const [isEditingBio, setIsEditingBio] = useState(false);
  const [bioInput, setBioInput] = useState('');
  const [friends, setFriends] = useState([]);
  const [friendRequests, setFriendRequests] = useState([]);
  const [sentRequests, setSentRequests] = useState([]);
  const [activeTab, setActiveTab] = useState('published'); 
  const [editingPostId, setEditingPostId] = useState(null);
  const [editFormData, setEditFormData] = useState({ title: '', content: '', coverImage: '', tags: '', visibility: 'public' });
  const [newPostData, setNewPostData] = useState({ title: '', content: '', coverImage: '', tags: '', visibility: 'public' });
  const [isCreatingPost, setIsCreatingPost] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const token = localStorage.getItem('token');
        const userRes = await axios.get('http://localhost:5000/api/auth/user', { headers: { 'x-auth-token': token } });
        setUser(userRes.data);
        setBioInput(userRes.data.bio);
        setFriends(userRes.data.friends || []);
        setFriendRequests(userRes.data.friendRequests || []);
        setSentRequests(userRes.data.sentRequests || []);
        const postRes = await axios.get('http://localhost:5000/api/posts');
        setAllPosts(postRes.data);
      } catch (error) { console.error(error); }
    };
    fetchData();
  }, []);

  const handleAcceptRequest = async (senderId) => {
    try {
      const res = await axios.post(`http://localhost:5000/api/auth/friend-accept/${senderId}`, {}, { headers: { 'x-auth-token': localStorage.getItem('token') } });
      setFriends(res.data.friends); setFriendRequests(res.data.friendRequests); setSentRequests(res.data.sentRequests);
    } catch (error) { alert("Error accepting request"); }
  };

  const handleRejectRequest = async (senderId) => {
    try {
      const res = await axios.post(`http://localhost:5000/api/auth/friend-reject/${senderId}`, {}, { headers: { 'x-auth-token': localStorage.getItem('token') } });
      setFriendRequests(res.data.friendRequests);
    } catch (error) { alert("Error rejecting request"); }
  };

  const handleRemoveFriend = async (friendId) => {
    if(!window.confirm("Remove this friend?")) return;
    try {
      const res = await axios.delete(`http://localhost:5000/api/auth/friend-remove/${friendId}`, { headers: { 'x-auth-token': localStorage.getItem('token') } });
      setFriends(res.data.friends);
    } catch (error) { alert("Error removing friend"); }
  };

  const handleSaveBio = async () => {
    try {
      const res = await axios.put('http://localhost:5000/api/auth/user/bio', { bio: bioInput }, { headers: { 'x-auth-token': localStorage.getItem('token') } });
      setUser(res.data); setIsEditingBio(false);
    } catch (error) { alert("Error updating bio"); }
  };

  const handleCreatePost = async (e) => {
    e.preventDefault();
    try {
      const res = await axios.post('http://localhost:5000/api/posts', newPostData, { headers: { 'x-auth-token': localStorage.getItem('token') } });
      setAllPosts([res.data, ...allPosts]); setNewPostData({ title: '', content: '', coverImage: '', tags: '', visibility: 'public' }); setIsCreatingPost(false);
    } catch (error) { alert("Error creating post"); }
  };

  const handleDelete = async (postId) => {
    if (!window.confirm("Delete this post forever?")) return;
    try {
      await axios.delete(`http://localhost:5000/api/posts/${postId}`, { headers: { 'x-auth-token': localStorage.getItem('token') } });
      setAllPosts(allPosts.filter(p => p._id !== postId));
    } catch (error) { alert("Error deleting post"); }
  };

  const handleSaveEdit = async (postId) => {
    try {
      const res = await axios.put(`http://localhost:5000/api/posts/${postId}`, editFormData, { headers: { 'x-auth-token': localStorage.getItem('token') } });
      setAllPosts(allPosts.map(post => post._id === postId ? res.data : post)); setEditingPostId(null); 
    } catch (error) { alert("Error updating post"); }
  };

  const myPosts = allPosts.filter((post) => post.author?._id === currentUserId);
  const savedPosts = allPosts.filter((post) => user?.bookmarks?.includes(post._id));
  const postsToDisplay = activeTab === 'published' ? myPosts : savedPosts;

  return (
    <div style={{ maxWidth: '680px', margin: '0 auto', color: 'var(--text-main)', padding: '20px' }}>
      
      <div style={{ backgroundColor: 'var(--bg-card)', borderRadius: '24px', padding: '40px', textAlign: 'center', boxShadow: 'var(--shadow-sm)', marginBottom: '40px', position: 'relative', overflow: 'hidden', border: '1px solid var(--border-color)' }}>
        <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: '100px', background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' }}></div>
        <div style={{ width: '100px', height: '100px', borderRadius: '50%', backgroundColor: 'var(--bg-card)', margin: '30px auto 20px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '2.5rem', fontWeight: '900', color: '#4f46e5', boxShadow: 'var(--shadow-sm)', position: 'relative', zIndex: 1, border: '4px solid var(--bg-card)' }}>
          {user?.username?.charAt(0).toUpperCase() || '?'}
        </div>
        <h2 style={{ fontSize: '2rem', margin: '0 0 10px 0', fontWeight: '800' }}>{user?.username}</h2>
        {isEditingBio ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', maxWidth: '400px', margin: '0 auto' }}>
            <textarea value={bioInput} onChange={(e) => setBioInput(e.target.value)} rows="3" style={{ padding: '12px', borderRadius: '12px', border: '1px solid var(--border-color)', backgroundColor: 'var(--input-bg)', color: 'var(--text-main)', outline: 'none' }} />
            <div style={{ display: 'flex', gap: '10px', justifyContent: 'center' }}>
              <button onClick={handleSaveBio} style={{ background: '#4f46e5', color: 'white', border: 'none', padding: '8px 20px', borderRadius: '20px', fontWeight: '600', cursor: 'pointer' }}>Save</button>
              <button onClick={() => setIsEditingBio(false)} style={{ background: 'var(--hover-bg)', color: 'var(--text-muted)', border: 'none', padding: '8px 20px', borderRadius: '20px', fontWeight: '600', cursor: 'pointer' }}>Cancel</button>
            </div>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '15px' }}>
            <p style={{ color: 'var(--text-muted)', fontSize: '1.05rem', margin: 0, fontStyle: 'italic', maxWidth: '80%' }}>"{user?.bio || 'Write a bio.'}"</p>
            <button onClick={() => setIsEditingBio(true)} style={{ background: '#e0e7ff', color: '#4f46e5', border: 'none', padding: '8px 20px', borderRadius: '20px', fontSize: '0.9rem', fontWeight: '700', cursor: 'pointer' }}>Edit Bio</button>
          </div>
        )}
      </div>

      <div style={{ display: 'flex', borderBottom: '2px solid var(--border-color)', marginBottom: '24px' }}>
        <button onClick={() => setActiveTab('published')} style={{ flex: 1, padding: '15px', background: 'none', border: 'none', borderBottom: activeTab === 'published' ? '3px solid #4f46e5' : '3px solid transparent', color: activeTab === 'published' ? '#4f46e5' : 'var(--text-muted)', fontWeight: '800', fontSize: '1.1rem', cursor: 'pointer' }}>📝 Published</button>
        <button onClick={() => setActiveTab('saved')} style={{ flex: 1, padding: '15px', background: 'none', border: 'none', borderBottom: activeTab === 'saved' ? '3px solid #4f46e5' : '3px solid transparent', color: activeTab === 'saved' ? '#4f46e5' : 'var(--text-muted)', fontWeight: '800', fontSize: '1.1rem', cursor: 'pointer' }}>🔖 Saved</button>
        <button onClick={() => setActiveTab('network')} style={{ flex: 1, padding: '15px', background: 'none', border: 'none', borderBottom: activeTab === 'network' ? '3px solid #10b981' : '3px solid transparent', color: activeTab === 'network' ? '#10b981' : 'var(--text-muted)', fontWeight: '800', fontSize: '1.1rem', cursor: 'pointer' }}>🤝 Network</button>
      </div>

      {activeTab === 'network' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '30px' }}>
          <div style={{ backgroundColor: 'var(--bg-card)', padding: '24px', borderRadius: '16px', border: '1px solid var(--border-color)', boxShadow: 'var(--shadow-sm)' }}>
            <h3 style={{ margin: '0 0 16px 0', borderBottom: '1px solid var(--border-color)', paddingBottom: '10px' }}>📥 Friend Requests</h3>
            {friendRequests.length === 0 ? <p style={{ color: 'var(--text-muted)' }}>No requests.</p> : friendRequests.map(req => (
              <div key={req._id} style={{ display: 'flex', justifyContent: 'space-between', padding: '10px 0', borderBottom: '1px solid var(--border-color)' }}>
                <span style={{ fontWeight: 'bold' }}>{req.username}</span>
                <div style={{ display: 'flex', gap: '10px' }}>
                  <button onClick={() => handleAcceptRequest(req._id)} style={{ background: '#10b981', color: 'white', border: 'none', padding: '6px 12px', borderRadius: '8px', cursor: 'pointer' }}>Accept</button>
                  <button onClick={() => handleRejectRequest(req._id)} style={{ background: 'var(--hover-bg)', color: 'var(--text-muted)', border: 'none', padding: '6px 12px', borderRadius: '8px', cursor: 'pointer' }}>Reject</button>
                </div>
              </div>
            ))}
          </div>

          <div style={{ backgroundColor: 'var(--bg-card)', padding: '24px', borderRadius: '16px', border: '1px solid var(--border-color)', boxShadow: 'var(--shadow-sm)' }}>
            <h3 style={{ margin: '0 0 16px 0', borderBottom: '1px solid var(--border-color)', paddingBottom: '10px' }}>🤝 My Friends</h3>
            {friends.length === 0 ? <p style={{ color: 'var(--text-muted)' }}>No friends yet.</p> : friends.map(friend => (
              <div key={friend._id} style={{ display: 'flex', justifyContent: 'space-between', padding: '10px 0', borderBottom: '1px solid var(--border-color)' }}>
                <span style={{ fontWeight: 'bold' }}>{friend.username}</span>
                <button onClick={() => handleRemoveFriend(friend._id)} style={{ background: '#fee2e2', color: '#ef4444', border: 'none', padding: '6px 12px', borderRadius: '8px', cursor: 'pointer' }}>Remove</button>
              </div>
            ))}
          </div>
        </div>
      )}

      {(activeTab === 'published' || activeTab === 'saved') && (
        postsToDisplay.length === 0 ? <p style={{ textAlign: 'center', color: 'var(--text-muted)', fontStyle: 'italic', padding: '20px' }}>No posts.</p> : postsToDisplay.map((post) => {
          const isEditing = editingPostId === post._id;
          return (
            <div key={post._id} style={{ backgroundColor: 'var(--bg-card)', padding: '24px', marginBottom: '24px', borderRadius: '16px', border: '1px solid var(--border-color)', boxShadow: 'var(--shadow-sm)', position: 'relative' }}>
              {!isEditing && activeTab === 'published' && (
                <div style={{ position: 'absolute', top: '24px', right: '24px', display: 'flex', gap: '10px' }}>
                  <button onClick={() => { setEditingPostId(post._id); setEditFormData({ title: post.title, content: post.content, coverImage: post.coverImage || '', tags: post.tags ? post.tags.join(', ') : '', visibility: post.visibility || 'public' }); }} style={{ background: '#fef08a', color: '#854d0e', border: 'none', borderRadius: '8px', padding: '6px 12px', cursor: 'pointer', fontWeight: '600' }}>Edit</button>
                  <button onClick={() => handleDelete(post._id)} style={{ background: '#fef2f2', color: '#ef4444', border: 'none', borderRadius: '8px', padding: '6px 12px', cursor: 'pointer', fontWeight: '600' }}>Delete</button>
                </div>
              )}
              {isEditing ? (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '15px', marginTop: '40px' }}>
                  <input type="text" value={editFormData.title} onChange={(e) => setEditFormData({ ...editFormData, title: e.target.value })} style={{ padding: '12px', fontSize: '1.2rem', fontWeight: 'bold', width: '100%', borderRadius: '8px', border: '1px solid var(--border-color)', backgroundColor: 'var(--input-bg)', color: 'var(--text-main)' }} />
                  <textarea value={editFormData.content} onChange={(e) => setEditFormData({ ...editFormData, content: e.target.value })} rows="5" style={{ padding: '12px', width: '100%', borderRadius: '8px', border: '1px solid var(--border-color)', backgroundColor: 'var(--input-bg)', color: 'var(--text-main)' }} />
                  <div style={{ display: 'flex', gap: '10px' }}>
                    <button onClick={() => handleSaveEdit(post._id)} style={{ backgroundColor: '#28a745', color: 'white', padding: '10px 20px', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold' }}>Save</button>
                    <button onClick={() => setEditingPostId(null)} style={{ backgroundColor: 'var(--hover-bg)', color: 'var(--text-muted)', padding: '10px 20px', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold' }}>Cancel</button>
                  </div>
                </div>
              ) : (
                <>
                  <h3 style={{ margin: 0, color: 'var(--text-main)', fontSize: '1.25rem', fontWeight: '700' }}>{post.title}</h3>
                  <p style={{ margin: '10px 0 20px 0', color: 'var(--text-main)', lineHeight: '1.6', fontSize: '1.05rem', whiteSpace: 'pre-wrap' }}>{post.content}</p>
                </>
              )}
            </div>
          );
        })
      )}
    </div>
  );
};

export default Profile;