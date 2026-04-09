import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import SideBar from './SideBar';
import './LoginPage.css'; // Reusing your card styles

export default function CreatePost() {
  const navigate = useNavigate();
  const [clubs, setClubs] = useState([]);
  
  // State for the text inputs
  const [form, setForm] = useState({
    club_id: '',
    title: '',
    content: ''
  });
  
  // State for the file upload
  const [file, setFile] = useState(null);
  const [message, setMessage] = useState('');
  const [isUploading, setIsUploading] = useState(false);

  // Fetch clubs to populate the dropdown
  useEffect(() => {
    const fetchClubs = async () => {
      try {
        const response = await fetch('http://localhost:5000/api/clubs');
        const data = await response.json();
        setClubs(data);
        if (data.length > 0) {
          setForm((s) => ({ ...s, club_id: data[0].id }));
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

  const handleFileChange = (e) => {
    setFile(e.target.files[0]);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsUploading(true);
    setMessage('Publishing post...');

    try {
      const token = localStorage.getItem('token');
      if (!token) {
        setMessage('You must be logged in to create a post.');
        setIsUploading(false);
        return;
      }

      let uploadedImageUrl = null;

      // STEP 1: If the user selected an image, upload it first
      if (file) {
        const formData = new FormData();
        formData.append('image', file);

        const uploadResponse = await fetch('http://localhost:5000/api/upload', {
          method: 'POST',
          headers: {
            'token': token // Send auth token, but NOT Content-Type (fetch sets it automatically for FormData)
          },
          body: formData
        });

        if (uploadResponse.ok) {
          const uploadData = await uploadResponse.json();
          uploadedImageUrl = uploadData.imageUrl;
        } else {
          setMessage('Image upload failed. Post aborted.');
          setIsUploading(false);
          return;
        }
      }

      // STEP 2: Create the post in the database with the new image URL
      const postPayload = {
        ...form,
        image_url: uploadedImageUrl // This will be null if no file was uploaded, which is perfectly fine!
      };

      const postResponse = await fetch('http://localhost:5000/api/posts', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'token': token
        },
        body: JSON.stringify(postPayload)
      });

      if (postResponse.ok) {
        setMessage('Post created successfully!');
        setTimeout(() => navigate('/home'), 1500);
      } else {
        setMessage('Failed to create post.');
      }
    } catch (err) {
      console.error(err.message);
      setMessage('Server error.');
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <>
      <SideBar />
      <div className="login-form" style={{ marginLeft: '60px' }}>
        <div className="card" style={{ width: '600px', maxWidth: '90%' }}>
          <div className="card-header">
            <h3 className="card-title">Create a New Post</h3>
            <p className="card-description">Share updates, announcements, or events.</p>
          </div>

          <div className="card-content">
            <form className="form" onSubmit={handleSubmit}>
              {message && (
                <p style={{ color: message.includes('successfully') ? 'green' : (message.includes('Publishing') ? 'blue' : 'red') }}>
                  {message}
                </p>
              )}
              
              <div className="field-group">
                <div className="field">
                  <label className="field-label">Select Club</label>
                  <select name="club_id" className="input" value={form.club_id} onChange={handleChange} required disabled={isUploading}>
                    {clubs.map(club => (
                      <option key={club.id} value={club.id}>{club.name}</option>
                    ))}
                  </select>
                </div>

                <div className="field">
                  <label className="field-label">Post Title</label>
                  <input name="title" type="text" className="input" value={form.title} onChange={handleChange} placeholder="What's this about?" required disabled={isUploading} />
                </div>

                <div className="field">
                  <label className="field-label">Content</label>
                  <textarea name="content" className="input" value={form.content} onChange={handleChange} placeholder="Write your post here..." rows="5" required style={{ resize: 'vertical', padding: '10px' }} disabled={isUploading} />
                </div>

                {/* NEW FILE UPLOAD FIELD */}
                <div className="field">
                  <label className="field-label">Attach an Image (Optional)</label>
                  <input type="file" accept="image/*" onChange={handleFileChange} className="input" style={{ padding: '8px' }} disabled={isUploading} />
                </div>

                <div className="field actions">
                  <button type="submit" className="btn" disabled={isUploading}>
                    {isUploading ? 'Uploading...' : 'Publish Post'}
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      </div>
    </>
  );
}