import React, { useState } from 'react';
import './variables.css';

export default function ProfileContent() {
  return (
    <div style={styles.container}>
      {/* Tab Content: Personal */}
        <div style={styles.card}>
          <div style={styles.cardHeader}>
            <h2 style={styles.cardTitle}>Personal Information</h2>
            <p style={styles.cardDescription}>Update your personal details and profile information.</p>
          </div>
          <div style={styles.cardContent}>
            <div style={styles.grid}>
              <div style={styles.fieldGroup}>
                <label style={styles.label}>First Name</label>
                <input style={styles.input} defaultValue="Shriman" />
              </div>
              <div style={styles.fieldGroup}>
                <label style={styles.label}>Last Name</label>
                <input style={styles.input} defaultValue="Dasadiya" />
              </div>
              <div style={styles.fieldGroup}>
                <label style={styles.label}>Email</label>
                <input style={styles.input} type="email" defaultValue="sd@example.com" />
              </div>
              <div style={styles.fieldGroup}>
                <label style={styles.label}>Phone</label>
                <input style={styles.input} defaultValue="12345 12345" />
              </div>
              <div style={styles.fieldGroup}>
                <label style={styles.label}>College</label>
                <input style={styles.input} defaultValue="Adani University" />
              </div>
              <div style={styles.fieldGroup}>
                <label style={styles.label}>Department</label>
                <input style={styles.input} defaultValue="FEST" />
              </div>
            </div>
            <div style={{ ...styles.fieldGroup, marginTop: '20px' }}>
              <label style={styles.label}>Bio</label>
              <textarea style={styles.textarea} rows={4} defaultValue="Passionate product designer..." />
            </div>
          </div>
        </div>
    </div>
  );
}

const styles = {
  container: {
    maxWidth: '800px',
    margin: '0 auto',
    fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
  },
  card: {
    backgroundColor: 'var(--bg)',
    border: '1px solid var(--border)',
    borderRadius: '12px',
    marginBottom: '24px',
    overflow: 'hidden',
    color: 'var(--text)'
  },
  cardHeader: {
    padding: '24px',
    borderBottom: '1px solid var(--border)',
  },
  cardTitle: {
    fontSize: '20px',
    fontWeight: '600',
    margin: '0 0 4px 0',
    color: 'var(--text)'
  },
  cardDescription: {
    fontSize: '14px',
    color: 'var(--text2)',
    margin: 0,
  },
  cardContent: {
    padding: '24px',
  },
  grid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
    gap: '20px',
  },
  fieldGroup: {
    display: 'flex',
    flexDirection: 'column',
    gap: '8px',
  },
  label: {
    fontSize: '14px',
    fontWeight: '500',
    color: 'var(--text)'
  },
  input: {
    padding: '8px 12px',
    borderRadius: '6px',
    border: '1px solid #e4e4e7',
    fontSize: '14px',
  },
  textarea: {
    padding: '12px',
    borderRadius: '6px',
    border: '1px solid #e4e4e7',
    fontSize: '14px',
    resize: 'vertical',
  },
  settingRow: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '8px 0',
  },
  labelBase: {
    fontSize: '16px',
    fontWeight: '500',
  },
  textMuted: {
    fontSize: '14px',
    color: '#71717a',
  },
  activeBadge: {
    backgroundColor: '#f0fdf4',
    color: '#15803d',
    border: '1px solid #bbf7d0',
    padding: '2px 10px',
    borderRadius: '9999px',
    fontSize: '12px',
    fontWeight: '500',
  },
  separator: {
    height: '1px',
    backgroundColor: '#f4f4f5',
    margin: '16px 0',
  },
  btnOutline: {
    padding: '8px 16px',
    backgroundColor: '#fff',
    border: '1px solid #e4e4e7',
    borderRadius: '6px',
    cursor: 'pointer',
    fontWeight: '500',
  },
  btnDestructive: {
    display: 'flex',
    alignItems: 'center',
    padding: '8px 16px',
    backgroundColor: '#ef4444',
    color: '#fff',
    border: 'none',
    borderRadius: '6px',
    cursor: 'pointer',
    fontWeight: '500',
  },
  stack: {
    display: 'flex',
    flexDirection: 'column',
    gap: '24px',
  }
};