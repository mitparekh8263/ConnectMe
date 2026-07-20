import { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom'; // This lets us redirect the user

const CreatePost = () => {
  const [formData, setFormData] = useState({
    title: '',
    content: ''
  });
  const [message, setMessage] = useState('');
  const navigate = useNavigate(); // Initialize the redirect tool

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      // 1. Grab the token from Local Storage
      const token = localStorage.getItem('token');
      
      if (!token) {
        setMessage('You must be logged in to create a post.');
        return;
      }

      // 2. Send the data AND the token in the Headers
      await axios.post(
        'http://localhost:5000/api/posts', 
        formData, 
        { headers: { 'x-auth-token': token } } // The exact same way we did it in Thunder Client!
      );

      // 3. If successful, redirect the user back to the Home page to see their new post
      navigate('/');
      
    } catch (error) {
      setMessage(error.response?.data?.message || 'Error creating post');
    }
  };

  return (
    <div style={{ maxWidth: '500px', margin: '40px auto', fontFamily: 'sans-serif' }}>
      <h2 style={{ textAlign: 'center' }}>Write a New Post</h2>
      
      {message && <p style={{ color: 'red', textAlign: 'center', fontWeight: 'bold' }}>{message}</p>}

      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
        <input 
          type="text" 
          name="title" 
          placeholder="Post Title" 
          value={formData.title} 
          onChange={handleChange} 
          required 
          style={{ padding: '10px', fontSize: '16px', borderRadius: '5px', border: '1px solid #ccc' }}
        />
        <textarea 
          name="content" 
          placeholder="Write your blog post here..." 
          value={formData.content} 
          onChange={handleChange} 
          required 
          rows="6"
          style={{ padding: '10px', fontSize: '16px', borderRadius: '5px', border: '1px solid #ccc', resize: 'vertical' }}
        />
        <button 
          type="submit" 
          style={{ padding: '12px', cursor: 'pointer', backgroundColor: '#333', color: 'white', border: 'none', borderRadius: '5px', fontSize: '16px', fontWeight: 'bold' }}
        >
          Publish Post
        </button>
      </form>
    </div>
  );
};

export default CreatePost;