import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import { useAuth } from "./auth-context";
import LoginPage from "./pages/login-page";
import RegisterPage from "./pages/register-page";
import DashboardPage from "./pages/dashboard-page";

const AppRoutes = () => {
    const auth = useAuth();

    if (auth.initializing) {
        return <div className="page">Loading session...</div>;
    }

    return (
        <Routes>
            <Route path="/" element={<Navigate to="/dashboard" replace />} />
            <Route
                path="/login"
                element={auth.user ? <Navigate to="/dashboard" replace /> : <LoginPage />}
            />
            <Route
                path="/register"
                element={auth.user ? <Navigate to="/dashboard" replace /> : <RegisterPage />}
            />
            <Route
                path="/dashboard"
                element={auth.user ? <DashboardPage /> : <Navigate to="/login" replace />}
            />
            <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </Routes>
    );
};

const App = () => (
    <BrowserRouter>
        <AppRoutes />
    </BrowserRouter>
);

export default App;
