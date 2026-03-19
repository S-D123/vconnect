import React, { useState, useEffect } from 'react';
import SideBar from './SideBar';
import './HomePage.css'; // Reusing existing card styling

export default function EventsPage() {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchEvents = async () => {
      try {
        const response = await fetch('http://localhost:5000/api/events');
        const data = await response.json();
        setEvents(data);
        setLoading(false);
      } catch (error) {
        console.error('Error fetching events:', error);
        setLoading(false);
      }
    };
    fetchEvents();
  }, []);

  const handleRSVP = async (eventId, status) => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        alert("Please log in to RSVP.");
        return;
      }

      const response = await fetch('http://localhost:5000/api/events/rsvp', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'token': token
        },
        body: JSON.stringify({ event_id: eventId, status: status })
      });

      if (response.ok) {
        alert(`Successfully RSVP'd as ${status}!`);
        // Optionally, re-fetch events to update the RSVP count instantly
      }
    } catch (err) {
      console.error('Failed to RSVP', err);
    }
  };

  return (
    <>
      <SideBar />
      <div className='container' style={{ marginLeft: '70px' }}>
        <div id='containerTitle'>Upcoming Events</div>

        {loading ? (
          <p>Loading events...</p>
        ) : events.length === 0 ? (
          <p>No upcoming events at the moment.</p>
        ) : (
          events.map((event) => (
            <div className="cardOuter" key={event.id} style={{ marginBottom: '20px' }}>
              {event.poster_url && <img className='cardImage' src={event.poster_url} alt={event.title} />}

              <div className='description'>
                <div className='lineContainer1'>
                  <span className='title'>{event.title}</span>
                  <span className='eventDate'>Date: {new Date(event.event_date).toLocaleString()}</span>
                </div>
                <div className='eventDescription'>{event.description}</div>
                <div className='eventDescription' style={{ fontWeight: 'bold', marginTop: '10px' }}>📍 Location: {event.location}</div>
              </div>

              <div className='separator'>
                <div className='author'>
                  <p className='club'>Hosted by: {event.club_name}</p>
                  <p style={{ fontSize: '13px', color: '#666' }}>{event.rsvp_count || 0} students attending</p>
                </div>
                <div className='buttons' style={{ display: 'flex', gap: '10px' }}>
                  <button onClick={() => handleRSVP(event.id, 'going')} className="btn" style={{ padding: '8px 12px', fontSize: '12px' }}>Going</button>
                  <button onClick={() => handleRSVP(event.id, 'maybe')} className="btn btn-outline" style={{ padding: '8px 12px', fontSize: '12px' }}>Maybe</button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </>
  );
}