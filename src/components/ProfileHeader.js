import React, { useState } from 'react';
import { Camera, Calendar, Mail, MapPin } from "lucide-react";

export default function ProfileHeader() {
  // We use state to track hover for the "interactive/fun" feel 
  // since standard inline styles don't support :hover
  const [isHovered, setIsHovered] = useState(false);
  const [isPressed, setIsPressed] = useState(false);

  return (
    <div style={styles.profileCard}>
      <div style={styles.profileContent}>
        <div style={styles.profileLayout}>
          
          {/* Avatar Section */}
          <div style={styles.avatarContainer}>
            <div style={styles.avatar}>
              <img src="https://bundui-images.netlify.app/avatars/08.png" alt="Profile" style={styles.avatarImg} />
            </div>
            <button style={styles.cameraBadge} title="Change Photo">
              <Camera size={16} />
            </button>
          </div>

          {/* Info Section */}
          <div style={styles.profileInfo}>
            <div style={styles.nameRow}>
              <h1 style={styles.profileName}>Shriman Dasadiya</h1>
              <span style={styles.badge}>Student</span>
            </div>
            <p style={styles.profileTitle}>Adani University</p>
            
            <div style={styles.metadataRow}>
              <div style={styles.metaItem}><Mail size={16} /> sd@example.com</div>
              <div style={styles.metaItem}><MapPin size={16} /> Ahmedabad</div>
              <div style={styles.metaItem}><Calendar size={16} /> Joined March 2023</div>
            </div>
          </div>

          {/* Action Button with Dynamic Interaction */}
          <button 
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => { setIsHovered(false); setIsPressed(false); }}
            onMouseDown={() => setIsPressed(true)}
            onMouseUp={() => setIsPressed(false)}
            style={{
              ...styles.btnPrimary,
              ...(isHovered ? styles.btnPrimaryHover : {}),
              ...(isPressed ? styles.btnPrimaryActive : {})
            }}
          >
            Save Profile
          </button>
        </div>
      </div>
    </div>
  );
}

// Styles Object
const styles = {
  profileCard: {
    backgroundColor: '#fff',
    border: '1px solid #e5e7eb',
    borderRadius: '16px',
    boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
    maxWidth: '800px',
    margin: '20px auto',
    fontFamily: 'sans-serif',
  },
  profileContent: {
    padding: '24px',
  },
  profileLayout: {
    display: 'flex',
    flexDirection: 'row', // Defaulting to row for this example
    alignItems: 'center',
    gap: '24px',
    flexWrap: 'wrap'
  },
  avatarContainer: {
    position: 'relative',
  },
  avatar: {
    height: '96px',
    width: '96px',
    borderRadius: '50%',
    overflow: 'hidden',
    backgroundColor: '#f3f4f6',
  },
  avatarImg: {
    width: '100%',
    height: '100%',
    objectFit: 'cover',
  },
  cameraBadge: {
    position: 'absolute',
    right: '-4px',
    bottom: '-4px',
    height: '32px',
    width: '32px',
    borderRadius: '50%',
    border: '1px solid #e5e7eb',
    backgroundColor: 'white',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    cursor: 'pointer',
  },
  profileInfo: {
    flex: 1,
    minWidth: '250px',
  },
  nameRow: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
  },
  profileName: {
    fontSize: '24px',
    fontWeight: '700',
    margin: 0,
    color: '#111827',
  },
  badge: {
    backgroundColor: '#f3f4f6',
    color: '#374151',
    padding: '2px 10px',
    borderRadius: '9999px',
    fontSize: '12px',
    fontWeight: '500',
  },
  profileTitle: {
    color: '#6b7280',
    margin: '4px 0 12px 0',
  },
  metadataRow: {
    display: 'flex',
    flexWrap: 'wrap',
    gap: '16px',
    color: '#6b7280',
    fontSize: '14px',
  },
  metaItem: {
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
  },
  /* Primary Button States */
  btnPrimary: {
    padding: '10px 24px',
    backgroundColor: '#18181b',
    color: 'white',
    fontWeight: '600',
    borderRadius: '10px',
    border: 'none',
    cursor: 'pointer',
    transition: 'all 0.2s ease',
  },
  btnPrimaryHover: {
    backgroundColor: '#27272a',
    transform: 'translateY(-2px)',
    boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
  },
  btnPrimaryActive: {
    transform: 'translateY(0) scale(0.95)',
  },
};