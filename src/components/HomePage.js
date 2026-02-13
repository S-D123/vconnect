import SideBar from './SideBar';
import data from '../exampleBlock/ex'
import image from '../exampleBlock/1.png'

import './HomePage.css'
import { BsChatRightText, BsHandThumbsUp, BsShare } from 'react-icons/bs';

// authors can show participation of students to public or not
// there is a sidebar that shows student participation

export default function HomePage() {

  return (
    <>
      <SideBar />
      <div class='container'>
        <h2>Home Page</h2>
        {/* <p>Welcome to the home page!</p> */}

        <div class="cardOuter">
          <img class='cardImage' src={image} />

          <div class='description'>
            <div class='lineContainer1'>
              <span class='title'>{data['title']}</span>
              <span class='eventDate'>event on: {data['eventdate']}</span>
            </div>
            <div class='eventDescription'>{data['description']}</div>
            <div class='posted'>{data['posted']}</div>
          </div>

          <div class='separator'>
            <div class='author'>
              <p id='institute' class='institute'>{data['institute']}</p>
              <p id='club' class='club'>{data['club']}</p>
            </div>
            <div class='buttons'>
              {/* <div id='willUparticipate'></div> */}
              <div id='like' >
                <BsHandThumbsUp class='eachButtons'></BsHandThumbsUp>
              </div>
              <div id='share' >
                <BsShare class='eachButtons'></BsShare>
              </div>
              <div id='comment' >
                <BsChatRightText class='eachButtons'></BsChatRightText>
              </div>
            </div>
          </div>

        </div>
      </div>
    </>
  );
}