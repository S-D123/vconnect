import React, { useState, useEffect } from 'react';
import SideBar from './SideBar';
import useThemeNoStorage from '../hooks/useThemeNoStorage';
import './HomePage.css';
import { BsChatRightText, BsHandThumbsUp, BsShare } from 'react-icons/bs';

export default function HomePage() {
  const [theme, toggleTheme] = useThemeNoStorage();
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // New state to track which post has its comments section open
  const [activeCommentPost, setActiveCommentPost] = useState(null);
  const [comments, setComments] = useState([]);
  const [newCommentText, setNewCommentText] = useState('');

  useEffect(() => {
    const fetchPosts = async () => {
      try {
        const response = await fetch('http://localhost:5000/api/posts');
        const data = await response.json();
        setPosts(data);
        setLoading(false);
      } catch (error) {
        console.error('Error fetching posts:', error);
        setLoading(false);
      }
    };
    fetchPosts();
  }, []);

  // Fetch comments when a post's comment button is clicked
  const toggleComments = async (postId) => {
    if (activeCommentPost === postId) {
      setActiveCommentPost(null); // Close it if it's already open
      return;
    }
    
    setActiveCommentPost(postId);
    try {
      const response = await fetch(`http://localhost:5000/api/comments/${postId}`);
      const data = await response.json();
      setComments(data);
    } catch (err) {
      console.error('Failed to fetch comments', err);
    }
  };

  // Submit a new comment
  const handleCommentSubmit = async (e, postId) => {
    e.preventDefault();
    if (!newCommentText.trim()) return;

    try {
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:5000/api/comments', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'token': token
        },
        body: JSON.stringify({ post_id: postId, content: newCommentText })
      });

      if (response.ok) {
        setNewCommentText('');
        // Refresh the comments for this post
        toggleComments(postId); // Closes it
        setTimeout(() => toggleComments(postId), 50); // Reopens it to fetch fresh data
      } else {
        alert("Please log in to comment.");
      }
    } catch (err) {
      console.error(err);
    }
  };

  // --- ADD THIS STATE ---
  const [likedPosts, setLikedPosts] = useState(new Set()); 

  // --- UPDATE THE handleLike FUNCTION ---
  const handleLike = async (postId) => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        alert("Please log in to like a post.");
        return;
      }

      const response = await fetch('http://localhost:5000/api/reactions/toggle', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'token': token
        },
        body: JSON.stringify({ post_id: postId })
      });

      if (response.ok) {
        const result = await response.json();
        
        setPosts(posts.map(post => {
          if (post.id === postId) {
            let currentCount = parseInt(post.like_count) || 0;
            return { ...post, like_count: result.liked ? currentCount + 1 : currentCount - 1 };
          }
          return post;
        }));

        // --- NEW: UPDATE THE LIKED BUTTON COLOR STATE ---
        setLikedPosts(prev => {
          const newSet = new Set(prev);
          if (result.liked) newSet.add(postId);
          else newSet.delete(postId);
          return newSet;
        });
      }
    } catch (err) {
      console.error('Failed to toggle like', err);
    }
  };

  return (
    <>
      <SideBar />
      <div className='themeControl' style={{ padding: '8px 16px' }}>
        <button className='themeToggle' onClick={toggleTheme} aria-label='Toggle theme'>
          {theme === 'dark' ? 'dark' : 'light'}
        </button>
      </div>
      
      <div className='container'>
        <div id='containerTitle'>Home Page</div>

        {loading ? (
          <p>Loading feed...</p>
        ) : posts.length === 0 ? (
          <p>No posts available right now.</p>
        ) : (
          posts.map((post) => (
            <div className="cardOuter" key={post.id} style={{ marginBottom: '20px' }}>
              {post.image_url && <img className='cardImage' src={post.image_url} alt={post.title} />}

              <div className='description'>
                <div className='lineContainer1'>
                  <span className='title'>{post.title}</span>
                  <span className='eventDate'>Posted on: {new Date(post.posted).toLocaleDateString()}</span>
                </div>
                <div className='eventDescription'>{post.description}</div>
              </div>

              <div className='separator'>
                <div className='author'>
                  <p id='institute' className='institute'>Adani University</p>
                  <p id='club' className='club'>{post.club_name || 'General Community'}</p>
                </div>
                <div className='buttons'>
                  {/* Updated Like Button with Color Toggle */}
                  <div id='like' onClick={() => handleLike(post.id)} style={{ cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <BsHandThumbsUp 
                      className='eachButtons' 
                      style={{ 
                        color: likedPosts.has(post.id) ? '#0a66c2' : 'inherit', // Turns LinkedIn Blue when liked
                        transform: likedPosts.has(post.id) ? 'scale(1.1)' : 'scale(1)',
                        transition: 'all 0.2s ease-in-out'
                      }} 
                    />
                    <span style={{ fontSize: '14px', fontWeight: likedPosts.has(post.id) ? 'bold' : 'normal', color: likedPosts.has(post.id) ? '#0a66c2' : 'var(--text-color)' }}>
                      {post.like_count || 0}
                    </span>
                  </div>
                  
                  <div id='share' style={{ cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <BsShare className='eachButtons' />
                    <span style={{ fontSize: '14px' }}>Share</span>
                  </div>
                  <div id='comment' onClick={() => toggleComments(post.id)} style={{ cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <BsChatRightText className='eachButtons' />
                    <span style={{ fontSize: '14px' }}>Comment</span>
                  </div>
                </div>
              </div>

              {/* REFINED COMMENTS SECTION */}
              {activeCommentPost === post.id && (
                <div className="comments-section" style={{ 
                  padding: '15px 20px', 
                  borderTop: '1px solid var(--border-color, #e0e0e0)', 
                  backgroundColor: 'var(--background-secondary, #f8f9fa)', // Adapts to theme
                  borderRadius: '0 0 12px 12px' 
                }}>
                  
                  {/* List existing comments */}
                  <div style={{ maxHeight: '200px', overflowY: 'auto', marginBottom: '15px' }}>
                    {comments.length === 0 ? (
                      <p style={{ fontSize: '13px', color: 'var(--text-muted, #888)', fontStyle: 'italic' }}>Be the first to comment!</p>
                    ) : (
                      comments.map(comment => (
                        <div key={comment.id} style={{ 
                          marginBottom: '10px', 
                          backgroundColor: 'var(--background-primary, #ffffff)', 
                          padding: '10px 15px', 
                          borderRadius: '10px',
                          border: '1px solid var(--border-color, #eee)',
                          color: 'var(--text-primary, #333)' // Ensures text is always visible
                        }}>
                          <strong style={{ fontSize: '13px', display: 'block', marginBottom: '3px' }}>{comment.author_name}</strong> 
                          <span style={{ fontSize: '14px' }}>{comment.content}</span>
                        </div>
                      ))
                    )}
                  </div>

                  {/* Add a new comment form */}
                  <form onSubmit={(e) => handleCommentSubmit(e, post.id)} style={{ display: 'flex', gap: '10px' }}>
                    <input 
                      type="text" 
                      value={newCommentText} 
                      onChange={(e) => setNewCommentText(e.target.value)}
                      placeholder="Write a comment..." 
                      style={{ 
                        flex: 1, 
                        padding: '10px 15px', 
                        borderRadius: '20px', 
                        border: '1px solid var(--border-color, #ccc)',
                        outline: 'none',
                        backgroundColor: 'var(--background-primary, #ffffff)',
                        color: 'var(--text-primary, #333)'
                      }}
                    />
                    <button type="submit" style={{ 
                      padding: '8px 20px', 
                      borderRadius: '20px', 
                      backgroundColor: '#0a66c2', 
                      color: 'white', 
                      fontWeight: 'bold',
                      border: 'none', 
                      cursor: 'pointer',
                      transition: 'background-color 0.2s'
                    }}
                    onMouseOver={(e) => e.target.style.backgroundColor = '#004182'}
                    onMouseOut={(e) => e.target.style.backgroundColor = '#0a66c2'}
                    >
                      Post
                    </button>
                  </form>
                </div>
              )}

            </div>
          ))
        )}
      </div>

      {/* Comment Modal Overlay */}
      {isModalOpen && (
        <div className="modalOverlay" onClick={toggleModal}>
          <div className="modalBox" onClick={(e) => e.stopPropagation()}>
            <button className="closeBtn" onClick={toggleModal}>&times;</button>
            <h3>Sentiments</h3>
            
            {/* Visualisation Area */}
            <div className="visualisation">
              <div className="statRow">
                <span className="statLabel">Excited to go!</span>
                <div className="barTrack"><div className="barFill" style={{ width: '65%' }}></div></div>
                <span className="statPercent">65%</span>
              </div>
              <div className="statRow">
                <span className="statLabel">Looking for team</span>
                <div className="barTrack"><div className="barFill" style={{ width: '25%' }}></div></div>
                <span className="statPercent">25%</span>
              </div>
              <div className="statRow">
                <span className="statLabel">Can't make it</span>
                <div className="barTrack"><div className="barFill" style={{ width: '10%' }}></div></div>
                <span className="statPercent">10%</span>
              </div>
            </div>

            {/* Latest Comment Area */}
            <div className="latestComment">
              <span className="commentHeader">Comments:</span>
              <p>"This looks like a fantastic event, can't wait to see everyone there!" <br/><small>- Student001</small></p>
            </div>
            
            <div class="field">
              <div class="button-group">
                <input 
                  type="text" 
                  id="input-button-group" 
                  class="input" 
                  placeholder="Please write your comments in short"
                  onChange={(e) => setCommentText(e.target.value)}
                  disabled={isSubmitted} // Locks the input when submitted
                  style={{
                    backgroundColor: isSubmitted ? '#f4f4f5' : 'transparent', // Visual cue that it's locked
                    color: isSubmitted ? '#71717a' : 'inherit'
                  }}
                />
                <button type="button" id="search-button" class="button button-outline" onClick={handleSubmitOrEdit}>
                  {isSubmitted ? 'Edit' : 'Submit'}
                </button>
              </div>
            </div>


          </div>
        </div>
      )}
    </>
  );
}