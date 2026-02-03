import React, { useState } from 'react';
import './SideBar.css';
import { BsPower, BsPlusLg, BsPerson, BsSearch, BsHeart, BsGear, BsHouseDoor } from 'react-icons/bs';
import { useNavigate } from 'react-router-dom';

export default function SideBar() {
  const navigate = useNavigate();

  const [isCollapsed, setIsCollapsed] = useState(false);

  const toggleSidebar = () => {
    setIsCollapsed(!isCollapsed);
  };

  return (
    <div className={`sidebar ${isCollapsed ? 'collapsed' : ''}`}>
      <button className="toggle-button" onClick={toggleSidebar}>
        {isCollapsed ? '☰' : '✕'}
      </button>
      <div className="menu-item" onClick={() => navigate('/home')} >
        <BsHouseDoor className="menu-icon" />
        {!isCollapsed && <span>Home</span>}
      </div>
      <div className="menu-item" onClick={() => navigate('/search')}>
        <BsSearch className="menu-icon" />
        {!isCollapsed && <span>Search</span>}
      </div>
      <div className="menu-item">
        <BsPlusLg className="menu-icon" />  
        {!isCollapsed && <span>Create(not button)</span>}
      </div>
      <div className="menu-item" onClick={() => navigate("/notifications")}>
        <BsHeart className="menu-icon" />
        {!isCollapsed && <span>Notifications</span>}
      </div>
      <div className="menu-item" onClick={() => navigate("/settings")}>
        <BsGear className="menu-icon" />
        {!isCollapsed && <span>Settings</span>}
      </div>
      <div className="menu-item" onClick={() => navigate("/profile")} >
        <BsPerson className="menu-icon" />
        {!isCollapsed && <span>Profile</span>}
      </div>
      <div className="menu-item" onClick={() => navigate("/logout")}>
        <BsPower className="menu-icon" />
        {!isCollapsed && <span>Logout</span>}
      </div>
      
    </div>
  );
}