import React, { useState, useEffect } from 'react';
import SideBar from './SideBar';
import './HomePage.css'; // Reusing your card styles

export default function AdminDashboard() {
  const [clubs, setClubs] = useState([]);
  const [selectedClub, setSelectedClub] = useState('');
  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(false);

  // Fetch all clubs this user is an admin of
  useEffect(() => {
    const fetchMyClubs = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) return;

        // Reusing our existing clubs endpoint, but we should ideally filter by user ownership.
        // For now, we'll fetch all and let the user select the one they own.
        const response = await fetch('http://localhost:5000/api/clubs');
        const data = await response.json();
        setClubs(data);
        if (data.length > 0) {
          setSelectedClub(data[0].id);
        }
      } catch (err) {
        console.error('Failed to fetch clubs', err);
      }
    };
    fetchMyClubs();
  }, []);

  // Fetch dashboard data when the selected club changes
  useEffect(() => {
    const fetchDashboard = async () => {
      if (!selectedClub) return;
      setLoading(true);
      try {
        const token = localStorage.getItem('token');
        const response = await fetch(`http://localhost:5000/api/admin/dashboard/${selectedClub}`, {
          headers: { 'token': token }
        });
        
        if (response.ok) {
          const data = await response.json();
          setDashboardData(data);
        } else {
          setDashboardData(null); // Likely not an admin
        }
      } catch (err) {
        console.error('Dashboard fetch error', err);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboard();
  }, [selectedClub]);

  const handleDeleteComment = async (commentId) => {
    if (!window.confirm("Are you sure you want to delete this toxic comment?")) return;

    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`http://localhost:5000/api/admin/comment/${commentId}`, {
        method: 'DELETE',
        headers: { 'token': token }
      });

      if (response.ok) {
        // Remove it from the UI
        setDashboardData(prev => ({
          ...prev,
          flagged_comments: prev.flagged_comments.filter(c => c.comment_id !== commentId)
        }));
      }
    } catch (err) {
      console.error('Failed to delete comment', err);
    }
  };

  return (
    <>
      <SideBar />
      <div className='container' style={{ marginLeft: '270px', paddingBottom: '50px' }}>
        <div id='containerTitle'>Command Center</div>

        {/* Club Selector */}
        <div className="cardOuter" style={{ marginBottom: '20px', padding: '15px' }}>
          <label style={{ fontWeight: 'bold', marginRight: '10px' }}>Select Club to Manage:</label>
          <select 
            value={selectedClub} 
            onChange={(e) => setSelectedClub(e.target.value)}
            style={{ padding: '8px', borderRadius: '5px' }}
          >
            {clubs.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
          </select>
        </div>

        {loading && <p>Loading insights...</p>}

        {!loading && !dashboardData && (
          <div className="cardOuter" style={{ padding: '20px', color: 'red' }}>
            You do not have administrative access to this club.
          </div>
        )}

        {!loading && dashboardData && (
          <>
            {/* Top Stats Row */}
            <div style={{ display: 'flex', gap: '20px', marginBottom: '30px' }}>
              <div className="cardOuter" style={{ flex: 1, padding: '20px', textAlign: 'center' }}>
                <h2 style={{ fontSize: '36px', margin: '0', color: '#007bff' }}>{dashboardData.stats.members}</h2>
                <p style={{ margin: '5px 0 0 0', color: '#666' }}>Total Members</p>
              </div>
              <div className="cardOuter" style={{ flex: 1, padding: '20px', textAlign: 'center' }}>
                <h2 style={{ fontSize: '36px', margin: '0', color: '#28a745' }}>{dashboardData.stats.posts}</h2>
                <p style={{ margin: '5px 0 0 0', color: '#666' }}>Published Posts</p>
              </div>
              <div className="cardOuter" style={{ flex: 1, padding: '20px', textAlign: 'center' }}>
                <h2 style={{ fontSize: '36px', margin: '0', color: '#ffc107' }}>{dashboardData.stats.events}</h2>
                <p style={{ margin: '5px 0 0 0', color: '#666' }}>Hosted Events</p>
              </div>
            </div>

            {/* Moderation Panel */}
            <div className="cardOuter" style={{ padding: '20px' }}>
              <h3 style={{ marginTop: '0', borderBottom: '1px solid #eee', paddingBottom: '10px' }}>
                🚨 AI Moderation Queue
              </h3>
              
              {dashboardData.flagged_comments.length === 0 ? (
                <p style={{ color: 'green' }}>All clear! No toxic comments detected recently.</p>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                  {dashboardData.flagged_comments.map(comment => (
                    <div key={comment.comment_id} style={{ border: '1px solid #ffcccc', padding: '15px', borderRadius: '8px', backgroundColor: '#fff5f5' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                        <div>
                          <p style={{ margin: '0 0 5px 0', fontSize: '12px', color: '#888' }}>
                            <strong>{comment.author_name}</strong> commented on "{comment.post_title}"
                          </p>
                          <p style={{ margin: '0 0 10px 0', fontSize: '15px' }}>"{comment.content}"</p>
                          <span style={{ fontSize: '12px', backgroundColor: '#ffdada', padding: '3px 8px', borderRadius: '12px', color: '#d32f2f' }}>
                            Toxicity: {Math.round(comment.toxicity_score * 100)}% | Emotion: {comment.emotion}
                          </span>
                        </div>
                        <button 
                          onClick={() => handleDeleteComment(comment.comment_id)}
                          style={{ backgroundColor: '#dc3545', color: 'white', border: 'none', padding: '8px 12px', borderRadius: '5px', cursor: 'pointer' }}
                        >
                          Delete Comment
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </>
        )}
      </div>
    </>
  );
}