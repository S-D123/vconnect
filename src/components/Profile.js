import SideBar from "./SideBar";
import ProfileHeader from "./ProfileHeader";
import './Profile.css';
import ProfileContent from "./ProfileContent";

export default function Profile() {
    return (
        <>
            <SideBar />
            <ProfileHeader />
            <ProfileContent />
        </>
    );
}