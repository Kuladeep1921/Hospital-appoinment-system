import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const PrivateRoute = ({ children, role }) => {
    const { user } = useAuth();
    
    if (!user) return <Navigate to="/login" replace />;
    
    if (role && user.role !== role) {
        return <Navigate to="/dashboard" replace />;
    }

    return children;
};

export default PrivateRoute;
