import { useContext } from 'react';
import { Navigate } from 'react-router-dom';
import AuthContext from '../context/AuthContext';

const PrivateRoute = ({ children, allowedRoles }) => {
    const { user, token, loading } = useContext(AuthContext);

    if (loading) {
        return <div>Loading...</div>; 
    }

    if (!token) {
        return <Navigate to="/login" replace />;
    }

    if (allowedRoles && user && !allowedRoles.includes(user.role)) {
        if (user.role === 'admin') {
            return <Navigate to="/admin/dashboard" replace />;
        } else if (user.role === 'partner') {
            return <Navigate to="/partner/dashboard" replace />;
        } else {
            return <Navigate to="/" replace />;
        }
    }

    return children;
};

export default PrivateRoute;
