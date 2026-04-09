import React, { useState, useEffect } from 'react';
import SideBar from './SideBar';
import './Search.css'; // Optional: if you have specific search styles
import './HomePage.css'; // Reusing existing card styles

export default function Search() {
  const [searchTerm, setSearchTerm] = useState('');
  const [results, setResults] = useState({ users: [], clubs: [] });
  const [loading, setLoading] = useState(false);

  // Use a simple debounce so we don't spam the database on every single keystroke
  useEffect(() => {
    const fetchResults = async () => {
      if (searchTerm.trim() === '') {
        setResults({ users: [], clubs: [] });
        return;
      }

      setLoading(true);
      try {
        const response = await fetch(`http://localhost:5000/api/search?q=${encodeURIComponent(searchTerm)}`);
        const data = await response.json();
        setResults(data);
      } catch (err) {
        console.error('Search failed', err);
      } finally {
        setLoading(false);
      }
    };

    const delayDebounceFn = setTimeout(() => {
      fetchResults();
    }, 300); // Waits 300ms after the user stops typing before fetching

    return () => clearTimeout(delayDebounceFn);
  }, [searchTerm]);

  return (
    <>
      <SideBar />
      <div className='container' style={{ marginLeft: '70px', paddingBottom: '50px' }}>
        <div id='containerTitle'>Search Community</div>

        {/* Search Input Box */}
        <div className="cardOuter" style={{ marginBottom: '20px', padding: '15px' }}>
          <input 
            type="text" 
            placeholder="Search for students or clubs..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={{ width: '100%', padding: '12px', fontSize: '16px', borderRadius: '8px', border: '1px solid #ccc' }}
          />
        </div>

        {loading && <p>Searching...</p>}

        {/* Display Club Results */}
        {results.clubs.length > 0 && (
          <div style={{ marginBottom: '30px' }}>
            <h3>Clubs</h3>
            {results.clubs.map(club => (
              <div className="cardOuter" key={club.id} style={{ marginBottom: '10px', padding: '15px', display: 'flex', alignItems: 'center', gap: '15px' }}>
                <div style={{ width: '50px', height: '50px', backgroundColor: '#e0e0e0', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  🏢
                </div>
                <div>
                  <h4 style={{ margin: '0 0 5px 0' }}>{club.name}</h4>
                  <p style={{ margin: '0', fontSize: '14px', color: '#666' }}>{club.description}</p>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Display User Results */}
        {results.users.length > 0 && (
          <div>
            <h3>Students</h3>
            {results.users.map(user => (
              <div className="cardOuter" key={user.id} style={{ marginBottom: '10px', padding: '15px', display: 'flex', alignItems: 'center', gap: '15px' }}>
                <img 
                  src={user.profile_image || "https://cdn.pixabay.com/photo/2015/10/05/22/37/blank-profile-picture-973460_1280.png"} 
                  alt="Profile" 
                  style={{ width: '50px', height: '50px', borderRadius: '50%', objectFit: 'cover' }} 
                />
                <div>
                  <h4 style={{ margin: '0 0 5px 0' }}>{user.name}</h4>
                  <p style={{ margin: '0', fontSize: '14px', color: '#666' }}>{user.email}</p>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Empty State */}
        {searchTerm && !loading && results.users.length === 0 && results.clubs.length === 0 && (
          <p>No results found for "{searchTerm}".</p>
        )}
      </div>
    </>
  );
}