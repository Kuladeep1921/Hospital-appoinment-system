const StatusBadge = ({ status }) => {
    const map = {
        Pending: 'badge-pending',
        Approved: 'badge-approved',
        Rejected: 'badge-rejected',
    };
    const icons = { Pending: '⏳', Approved: '✅', Rejected: '❌' };
    const displayStatus = status === 'Approved' ? 'Accepted' : status;
    return (
        <span className={map[status] || 'badge-pending'}>
            {icons[status]} {displayStatus}
        </span>
    );
};

export default StatusBadge;
