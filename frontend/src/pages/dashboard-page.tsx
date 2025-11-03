import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../auth-context";

const DashboardPage = () => {
    const auth = useAuth();
    const navigate = useNavigate();
    const [status, setStatus] = useState<string | null>(null);
    const [refreshing, setRefreshing] = useState(false);

    useEffect(() => {
        if (!auth.user && !auth.initializing) {
            navigate("/login", { replace: true });
        }
    }, [auth.user, auth.initializing, navigate]);

    const handleLogout = async () => {
        await auth.logout();
        navigate("/login", { replace: true });
    };

    const handleRefresh = async () => {
        setRefreshing(true);
        const refreshed = await auth.refreshSession();
        setStatus(refreshed ? "Session refreshed." : "Session refresh failed.");
        setRefreshing(false);
    };

    return (
        <div className="page">
            <h1>{auth.user ? `Welcome ${auth.user.email}` : "Welcome"}</h1>
            <button type="button" onClick={handleRefresh} disabled={refreshing}>
                {refreshing ? "Refreshing..." : "Refresh session"}
            </button>
            {status ? <div>{status}</div> : null}
            <button type="button" onClick={handleLogout}>
                Sign out
            </button>
        </div>
    );
};

export default DashboardPage;
