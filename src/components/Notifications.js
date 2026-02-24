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
                        <div id='containerTitle'>Notifications</div>
                    </div>
                    <div className="headerActions">
                        <div class="button-container">
                            <button class="btn btn-clear" onClick={clearAll}>
                                <span class="default-text">Clear All</span>
                                <span class="hover-text">Are you sure? 🗑️</span>
                            </button>
                            <button class="btn btn-read" onClick={markAllRead}>
                                Mark Everything Read
                            </button>
                        </div>
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