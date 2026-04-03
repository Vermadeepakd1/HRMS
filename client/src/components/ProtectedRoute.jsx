import { Navigate } from "react-router-dom";
import { getAuthToken, getAuthUser } from "../utils/auth";

export default function ProtectedRoute({ children, roles }) {
    const token = getAuthToken();
    const user = getAuthUser();

    if (!token) {
        return <Navigate to="/" replace />;
    }

    if (roles?.length && (!user || !roles.includes(user.role))) {
        return <Navigate to="/dashboard" replace />;
    }

    return children;
}
