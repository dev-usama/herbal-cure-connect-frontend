function DashboardCard({ imageSrc, title, description, url }) {
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
                <button className="dashboard-button" onClick={() => window.location.href = url}>
                    Connect Now
                </button>
            </div>
        </div>
    );
}

export default DashboardCard;