import React, { useState, useEffect } from 'react';
import './SideBar.css';
import { BsPower, BsPlusLg, BsPerson, BsSearch, BsHeart, BsGear, BsHouseDoor } from 'react-icons/bs';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

export default function SideBar() {
  const navigate = useNavigate();
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [menuItems, setMenuItems] = useState([]);

  const toggleSidebar = () => {
    setIsCollapsed(!isCollapsed);
  };

  // Fetch XML data
  useEffect(() => {
    axios.get(`${process.env.PUBLIC_URL}/sidebar.xml`)
      .then((response) => {
        const parser = new DOMParser();
        const xmlDoc = parser.parseFromString(response.data, 'text/xml');
        const items = Array.from(xmlDoc.getElementsByTagName('menuItem')).map((item) => ({
          route: item.getElementsByTagName('route')[0]?.textContent,
          icon: item.getElementsByTagName('icon')[0]?.textContent,
          label: item.getElementsByTagName('label')[0]?.textContent,
        }));
        setMenuItems(items);
      })
      .catch((error) => {
        console.error('Error fetching sidebar XML:', error);
      });
  }, []);

  // Map icon names to React components
  const iconMap = {
    BsHouseDoor: BsHouseDoor,
    BsSearch: BsSearch,
    BsPlusLg: BsPlusLg,
    BsHeart: BsHeart,
    BsGear: BsGear,
    BsPerson: BsPerson,
    BsPower: BsPower,
  };

  return (
    <div className={`sidebar ${isCollapsed ? 'collapsed' : ''}`}>
      <button className="toggle-button" onClick={toggleSidebar}>
        {isCollapsed ? '☰' : '✕'}
      </button>
      {menuItems.map((item, index) => {
        const IconComponent = iconMap[item.icon];
        return (
          <div key={index} className="menu-item" onClick={() => navigate(item.route)}>
            {IconComponent && <IconComponent className="menu-icon" />}
            {!isCollapsed && <span>{item.label}</span>}
          </div>
        );
      })}
    </div>
  );
}