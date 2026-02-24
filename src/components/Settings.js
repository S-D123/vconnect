import { useState } from "react";
import SideBar from "./SideBar";
import "./Settings.css"
import { GoChevronRight } from "react-icons/go";
import { MdDelete, MdBlock } from "react-icons/md";
import { FaRegEdit } from "react-icons/fa";
import useThemeNoStorage from "../hooks/useThemeNoStorage";

export default function Settings() {
    
    const [isPrivate, setIsPrivate] = useState(false);
    const [theme, toggleTheme] = useThemeNoStorage();
    const [isDark, setIsDark] = useState(theme === 'dark' ? true : false);
    const [allNotif, setAllNotif] = useState(true);
    const [clubPostNotif, setClubPostNotif] = useState(true);
    const [userCommentNotif, setUserCommentNotif] = useState(true);
    
    const privateButtonPressed = () => {
        const userConfirmed = window.confirm("Are you sure you want to make this change?");
        if (userConfirmed) {
            setIsPrivate(!isPrivate);
        }
    }
    
    const darkButtonPressed = () => {
        setIsDark(!isDark);
        toggleTheme();
    }

    return (
        <>
            <SideBar />
            <div id='container'>
                <div id='containerTitle'>Settings</div>
                <div id='accountInfo'>
                    <div class='heading title'>Account Information</div>
                    <div class='row'>
                        <div class='rowsLeftpart'>
                            <div class='heading'>Private Account</div>
                            <div class='description'>Private accounts remain anonymous to other users and clubs</div>
                        </div>

                        {/* handmade button */}
                        <div class='privateButtonOutline' onClick={privateButtonPressed}>
                            <div className={`privateButtonDot ${isPrivate ? "buttonOn" : "buttonOff"}`}></div>
                        </div>
                        {/* pop up a dialog box to confirm whether to apply changes */}
                    </div>
                    <div class='row'>
                        <div class='rowsLeftpart'>
                            <div class='heading'>Blocked Accounts</div>
                            <div class='description'>This is for club owners to see accounts they blocked due to spamming or due to other reasons</div>
                        </div>
                        {/* <div className="blockB">See<MdBlock /></div> */}
                        <GoChevronRight className="rightArrowIcon" />
                    </div>
                    <div class='row'>
                        <div class='rowsLeftpart'>
                            <div class='heading'>Change Password</div>
                            <div class='description'>Once password is changed, you cannot change it for next 30 days</div>
                        </div>
                        <button className="changeB">Change<FaRegEdit /></button>
                    </div>
                    <div class='row'>
                        <div class='rowsLeftpart'>
                            <div class='heading'>Delete Account</div>
                            <div class='description'>The changes cannot be reversed</div>
                        </div>
                        <div className="deleteB">Delete<MdDelete /></div>
                    </div>
                </div>

                <div id='appearanceThemes'>
                    <div class='heading title'>Appearance & Themes</div>
                    <div class='row'>
                        <div class='rowsLeftpart'>
                            <div class='heading'>Dark Mode</div>
                            <div class='description'>Change the theme to dark mode</div>
                        </div>
                        {/* pop up a dialog box to confirm whether to apply changes */}
                        <div class='darkButtonOutline' onClick={darkButtonPressed}>
                            <div className={`darkButtonDot ${isDark ? "buttonOn" : "buttonOff"}`}></div>
                        </div>                    
                    </div>
                </div>

                <div id='posts'>
                    {/* posts you commented, created, liked */}
                    <div class='heading title'>Posts</div>
                    <div class='row'>
                        <div class='rowsLeftpart'>
                            <div class='heading'>Liked</div>
                            <div class='description'>See all the posts you have liked</div>
                        </div>
                        <GoChevronRight className="rightArrowIcon" />
                    </div>

                    <div class='row'>
                        <div class='rowsLeftpart'>
                            <div class='heading'>Commented</div>
                            <div class='description'>See all the posts you have Commented</div>
                        </div>
                        <GoChevronRight className="rightArrowIcon" />

                    </div><div class='row'>
                        <div class='rowsLeftpart'>
                            <div class='heading'>Created</div>
                            <div class='description'>See all the posts you have Created</div>
                        </div>
                        <GoChevronRight className="rightArrowIcon" />
                    </div>
                </div>

                <div id='notifications'>
                    <div class='heading title'>Notifications</div>
                    <div class='row'>
                        <div class='rowsLeftPart'>
                            <div class="heading">All Notifications</div>
                            <div class='description'>Turn on/off all notifications</div>
                        </div>
                        <div class='darkButtonOutline' onClick={() => setAllNotif(!allNotif)}>
                            <div className={`darkButtonDot ${allNotif ? "buttonOn" : "buttonOff"}`}></div>
                        </div>
                    </div>
                    <div class='row'>
                        <div class='rowsLeftPart'>
                            <div class="heading">Club Post Notification</div>
                            <div class='description'>Get noitified whenever any club posts</div>
                        </div>
                        <div class='darkButtonOutline' onClick={() => setClubPostNotif(!clubPostNotif)}>
                            <div className={`darkButtonDot ${clubPostNotif ? "buttonOn" : "buttonOff"}`}></div>
                        </div>
                    </div>
                    <div class='row'>
                        <div class='rowsLeftPart'>
                            <div class="heading">Comment Notification(for Clubs)</div>
                            <div class='description'>Get notified when any student comments on club's posts</div>
                        </div>
                        <div class='darkButtonOutline' onClick={() => setUserCommentNotif(!userCommentNotif)}>
                            <div className={`darkButtonDot ${userCommentNotif ? "buttonOn" : "buttonOff"}`}></div>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
}