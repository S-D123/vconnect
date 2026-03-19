import React, { useState } from 'react';
import SideBar from './SideBar';
import useThemeNoStorage from '../hooks/useThemeNoStorage';
import data from '../exampleBlock/ex';
import image from '../exampleBlock/1.png';

import './HomePage.css';
import { BsChatRightText, BsHandThumbsUp, BsHandThumbsUpFill, BsShare } from 'react-icons/bs';

export default function HomePage() {
  const [theme, toggleTheme] = useThemeNoStorage();
  
  // States for interactions
  const [isLiked, setIsLiked] = useState(false);
  const [showCopied, setShowCopied] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  
  // ---------------------------comments
  const [commentText, setCommentText] = useState('');
  const [isSubmitted, setIsSubmitted] = useState(false);

  const handleSubmitOrEdit = () => {
    // If it's not submitted yet, and the text isn't empty, lock it
    if (!isSubmitted) {
      if (commentText.trim() !== '') {
        setIsSubmitted(true);
      }
    } else {
      // If it is already submitted, unlock it for editing
      setIsSubmitted(false);
    }
  };

  // Handlers
  const handleLike = () => setIsLiked(!isLiked);

  const handleShare = () => {
    navigator.clipboard.writeText(window.location.href);
    setShowCopied(true);
    setTimeout(() => setShowCopied(false), 2000); // Hide notification after 2 seconds
  };

  const toggleModal = () => setIsModalOpen(!isModalOpen);

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

        <div className="cardOuter">
          <img className='cardImage' src={image} alt="Event" />

          <div className='description'>
            <div className='lineContainer1'>
              <span className='title'>{data['title']}</span>
              <span className='eventDate'>event on: {data['eventdate']}</span>
            </div>
            <div className='eventDescription'>{data['description']}</div>
            <div className='posted'>{data['posted']}</div>
          </div>

          <div className='separator'>
            <div className='author'>
              <p id='institute' className='institute'>{data['institute']}</p>
              <p id='club' className='club'>{data['club']}</p>
            </div>
            
            <div className='buttons'>
              {/* Like Button */}
              <div className='actionBtn' onClick={handleLike}>
                {isLiked ? (
                  <BsHandThumbsUpFill className='eachButtons animatePop likedIcon' />
                ) : (
                  <BsHandThumbsUp className='eachButtons' />
                )}
              </div>

              {/* Share Button */}
              <div className='actionBtn' onClick={handleShare}>
                <BsShare className='eachButtons' />
                {showCopied && <div className="toastPopup">Link copied!</div>}
              </div>

              {/* Comment Button */}
              <div className='actionBtn' onClick={toggleModal}>
                <BsChatRightText className='eachButtons' />
              </div>
            </div>
          </div>
        </div>
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