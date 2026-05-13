function DashboardCard({ imageSrc, title, description }) {
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
            </div>
        </div>
    );
}

export default DashboardCard;