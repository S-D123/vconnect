import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import SideBar from './SideBar';
import './LoginPage.css'; // Reusing your card styles

export default function CreatePost() {
  const navigate = useNavigate();
  const [clubs, setClubs] = useState([]);
  const [form, setForm] = useState({
    club_id: '',
    title: '',
    content: '',
    image_url: ''
  });
  const [message, setMessage] = useState('');

  // Fetch clubs when the page loads to populate the dropdown
  useEffect(() => {
    const fetchClubs = async () => {
      try {
        const response = await fetch('http://localhost:5000/api/clubs');
        const data = await response.json();
        setClubs(data);
        if (data.length > 0) {
          setForm((s) => ({ ...s, club_id: data[0].id })); // Set default selected club
        }
      } catch (err) {
        console.error('Failed to fetch clubs', err);
      }
    };
    fetchClubs();
  }, []);

  const handleChange = (e) => {
    setForm((s) => ({ ...s, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        setMessage('You must be logged in to create a post.');
        return;
      }

      const response = await fetch('http://localhost:5000/api/posts', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'token': token
        },
        body: JSON.stringify(form)
      });

      if (response.ok) {
        setMessage('Post created successfully!');
        setTimeout(() => navigate('/home'), 1500); // Redirect to feed
      } else {
        setMessage('Failed to create post.');
      }
    } catch (err) {
      console.error(err.message);
      setMessage('Server error.');
    }
  };

  return (
    <>
      <SideBar />
      <div className="login-form" style={{ marginLeft: '60px' }}> {/* Margin to clear sidebar */}
        <div className="card" style={{ width: '600px', maxWidth: '90%' }}>
          <div className="card-header">
            <h3 className="card-title">Create a New Post</h3>
            <p className="card-description">Share updates, announcements, or events.</p>
          </div>

          <div className="card-content">
            <form className="form" onSubmit={handleSubmit}>
              {message && <p style={{ color: message.includes('successfully') ? 'green' : 'red' }}>{message}</p>}
              
              <div className="field-group">
                <div className="field">
                  <label className="field-label">Select Club</label>
                  <select name="club_id" className="input" value={form.club_id} onChange={handleChange} required>
                    {clubs.map(club => (
                      <option key={club.id} value={club.id}>{club.name}</option>
                    ))}
                  </select>
                </div>

                <div className="field">
                  <label className="field-label">Post Title</label>
                  <input name="title" type="text" className="input" value={form.title} onChange={handleChange} placeholder="What's this about?" required />
                </div>

                <div className="field">
                  <label className="field-label">Content</label>
                  <textarea name="content" className="input" value={form.content} onChange={handleChange} placeholder="Write your post here..." rows="5" required style={{ resize: 'vertical', padding: '10px' }} />
                </div>

                <div className="field">
                  <label className="field-label">Image URL (Optional)</label>
                  <input name="image_url" type="text" className="input" value={form.image_url} onChange={handleChange} placeholder="https://example.com/image.jpg" />
                </div>

                <div className="field actions">
                  <button type="submit" className="btn">Publish Post</button>
                </div>
              </div>
            </form>
          </div>
        </div>
      </div>
    </>
  );
}