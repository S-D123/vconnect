import React, { useState, useEffect } from 'react';
import SideBar from './SideBar';
import './Profile.css'; // Assuming you have some profile-specific styling
import './HomePage.css'; // Reusing your card styles for posts

export default function Profile() {
  const [profileData, setProfileData] = useState({
    user: null,
    posts: [],
    attending_events: []
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) return; // In a real app, you might redirect to /login here

        const response = await fetch('http://localhost:5000/api/users/me', {
          method: 'GET',
          headers: { token: token }
        });

        if (response.ok) {
          const data = await response.json();
          setProfileData(data);
        }
        setLoading(false);
      } catch (err) {
        console.error('Failed to fetch profile', err);
        setLoading(false);
      }
    };

    fetchProfile();
  }, []);

  if (loading) return <div style={{ marginLeft: '70px', padding: '20px' }}>Loading profile...</div>;
  if (!profileData.user) return <div style={{ marginLeft: '70px', padding: '20px' }}>Please log in to view your profile.</div>;

  return (
    <>
      <SideBar />
      <div className='container' style={{ marginLeft: '70px', paddingBottom: '50px' }}>
        
        {/* --- PROFILE HEADER --- */}
        <div className="cardOuter" style={{ marginBottom: '30px', textAlign: 'center', padding: '30px' }}>
          {/* Placeholder avatar if profile_image is null */}
          <img 
            src={profileData.user.profile_image || "https://cdn.pixabay.com/photo/2015/10/05/22/37/blank-profile-picture-973460_1280.png"} 
            alt="Profile" 
            style={{ width: '120px', height: '120px', borderRadius: '50%', objectFit: 'cover', marginBottom: '15px' }} 
          />
          <h2>{profileData.user.name}</h2>
          <p style={{ color: '#666' }}>{profileData.user.email} | Role: <span style={{ textTransform: 'capitalize' }}>{profileData.user.role}</span></p>
          <p style={{ marginTop: '10px', fontStyle: 'italic' }}>{profileData.user.bio || "No bio added yet."}</p>
        </div>

        {/* --- PROFILE CONTENT SPLIT --- */}
        <div style={{ display: 'flex', gap: '20px', flexWrap: 'wrap' }}>
          
          {/* Left Column: User's Posts */}
          <div style={{ flex: '2', minWidth: '300px' }}>
            <h3>My Posts</h3>
            {profileData.posts.length === 0 ? (
              <p>You haven't created any posts yet.</p>
            ) : (
              profileData.posts.map(post => (
                <div className="cardOuter" key={post.id} style={{ marginBottom: '15px', padding: '15px' }}>
                  <h4 style={{ margin: '0 0 5px 0' }}>{post.title}</h4>
                  <p style={{ fontSize: '12px', color: '#888', marginBottom: '10px' }}>
                    Posted in {post.club_name || 'General'} on {new Date(post.created_at).toLocaleDateString()}
                  </p>
                  <p style={{ fontSize: '14px' }}>{post.content}</p>
                </div>
              ))
            )}
          </div>

          {/* Right Column: Attending Events */}
          <div style={{ flex: '1', minWidth: '250px' }}>
            <h3>Events I'm Attending</h3>
            {profileData.attending_events.length === 0 ? (
              <p>You haven't RSVP'd to any events.</p>
            ) : (
              profileData.attending_events.map(event => (
                <div className="cardOuter" key={event.id} style={{ marginBottom: '15px', padding: '15px', backgroundColor: '#f4f7f6' }}>
                  <h4 style={{ margin: '0 0 5px 0' }}>{event.title}</h4>
                  <p style={{ fontSize: '13px', margin: '5px 0' }}>📅 {new Date(event.event_date).toLocaleDateString()}</p>
                  <p style={{ fontSize: '13px', margin: '0' }}>📍 {event.location}</p>
                </div>
              ))
            )}
          </div>

        </div>
      </div>
    </>
  );
}