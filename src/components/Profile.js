import SideBar from "./SideBar";
import image from '../exampleBlock/1.png';
import './Profile.css';

export default function Profile() {
    return (
        <>
            <SideBar />
            <div class='profileContainer'>
                <h2>Profile Page</h2>
                <div class='profileBlock1'>
                    <img class='profilePhoto' src={image} alt="Photo" />
                    <div class='profileHeading'>
                        <p>Shriman Dasadiya</p>
                        <div class='email'>email@email.com</div>
                    </div>
                </div>
                <div class='profileBlock2'>
                    {/* posts voted on, participated */}
                    <div class='profileRow'>
                        <div class='profile'>First Name</div>
                        <div class='inputLocked'>Shriman</div>
                    </div>
                        <div class='profileSecondName'>Second</div>
                </div>
            </div>
        </>
    );
}