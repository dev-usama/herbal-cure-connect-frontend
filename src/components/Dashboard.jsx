import { useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import DashboardCard from './DashboardCard';

export default function Dashboard() {

    const { logout, user } = useContext(AuthContext);
    const navigate = useNavigate(); 

    const handleLogout = async () => {
        try {
            const apiUrl = import.meta.env.VITE_BACKEND_URL;
            const response = await fetch(`${apiUrl}/users/logout`, {
                method: 'POST',
                credentials: 'include',
            });

            if (response.ok) {
                logout();
                navigate('/login');
            }
        } catch (error) {
            console.error("Logout failed:", error);
        }
    };
    return (
        <>
            {user && <h5>Welcome back, {user.name}!</h5>}
            <div className="grid sm:grid-cols-1 xs:grid-cols-2 md:grid-cols-3 gap-4">
                <DashboardCard imageSrc="https://images.unsplash.com/photo-1563986768609-322da13575f3?q=80&w=1470&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D" title="Book An Appointment" description="Three Days Money Back Guarantee!" url='/meeting/12345' />
                <DashboardCard imageSrc="https://images.unsplash.com/photo-1633509817627-5a29634475af?w=800&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MTJ8fHN1cHBsZW1lbnR8ZW58MHwwfDB8fHwy" title="Buy Supplements" description="Become a lion!" url='/meeting/12345' />
                <DashboardCard imageSrc="https://images.unsplash.com/photo-1758691462848-31a39258dbd8?q=80&w=1632&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D" title="Initiate Video Call" description="Use Room ID" url='/meeting/12345' />
            </div>
            <button onClick={handleLogout}>Logout</button>
        </>
    );
}