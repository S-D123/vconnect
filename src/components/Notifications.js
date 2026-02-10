import React, { useState } from 'react';
import SideBar from './SideBar';
import { FiBell, FiCheck, FiX } from 'react-icons/fi';
import './Notifications.css';

const sampleNotifications = [
    { id: 1, title: 'New event posted', body: 'Hackathon this weekend — join now!', time: '2h', unread: true },
    { id: 2, title: 'Club accepted you', body: 'Your membership request to Music Club was accepted.', time: '1d', unread: true },
    { id: 3, title: 'Comment reply', body: 'Someone replied to your comment on the AI post.', time: '3d', unread: false },
];

export default function Notifications() {
    const [notifs, setNotifs] = useState(sampleNotifications);

    const markRead = (id) => {
        setNotifs((prev) => prev.map(n => n.id === id ? { ...n, unread: false } : n));
    };

    const toggleRead = (id) => {
        setNotifs((prev) => prev.map(n => n.id === id ? { ...n, unread: !n.unread } : n));
    };

    const markAllRead = () => {
        setNotifs((prev) => prev.map(n => ({ ...n, unread: false })));
    };

    const clearAll = () => {
        setNotifs([]);
    };

    return (
        <>
            <SideBar />
            <div className="notificationsContainer">
                <div className="notificationsHeader">
                    <div className="headerLeft">
                        <h2>Notifications</h2>
                        <span className="smallMuted">Recent activity</span>
                    </div>
                    <div className="headerActions">
                        <button className="actionBtn" onClick={markAllRead} title="Mark all read"><FiCheck /></button>
                        <button className="actionBtn danger" onClick={clearAll} title="Clear all"><FiX /></button>
                    </div>
                </div>

                <div className="notifCard">
                    {notifs.length === 0 ? (
                        <div className="emptyState">
                            <FiBell size={36} />
                            <p>No notifications</p>
                        </div>
                    ) : (
                        notifs.map(n => (
                            <div
                                key={n.id}
                                className={`notifItem ${n.unread ? 'unread' : ''}`}
                                onClick={() => markRead(n.id)}
                            >
                                <div className="avatar">{n.title.charAt(0)}</div>
                                <div className="notifContent">
                                    <div className="notifTitleRow">
                                        <div className="title">{n.title}</div>
                                        <div className="time">{n.time}</div>
                                    </div>
                                    <div className="body">{n.body}</div>
                                </div>
                                <div className="notifActions">
                                    <button className="smallBtn" onClick={(e) => { e.stopPropagation(); toggleRead(n.id); }}>
                                        {n.unread ? 'Mark read' : 'Mark unread'}
                                    </button>
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </div>
        </>
    );
}