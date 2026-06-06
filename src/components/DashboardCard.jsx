import { useNavigate } from "react-router-dom";

function DashboardCard({ imageSrc, title, description, url }) {
    const navigate = useNavigate();
    return (
        <div className="dashboard-card">
            <div className="dashboard-imageWrapper">
                <img
                    src={imageSrc}
                    alt={title}
                    className="dashboard-image"
                />
            </div>

            <div className="dashboard-card-content">
                <h3>{title}</h3>
                <p>{description}</p>
                <button className="dashboard-button" onClick={() => navigate(url)}>
                    Connect Now
                </button>
            </div>
        </div>
    );
}

export default DashboardCard;