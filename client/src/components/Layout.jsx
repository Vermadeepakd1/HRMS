import { Link, NavLink, useNavigate } from "react-router-dom";

const linkClass = ({ isActive }) =>
    `rounded-md px-3 py-2 text-sm font-medium transition ${isActive
        ? "bg-slate-900 text-white"
        : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
    }`;

export default function Layout({ children }) {
    const navigate = useNavigate();

    const handleLogout = () => {
        localStorage.removeItem("token");
        navigate("/");
    };

    return (
        <div className="min-h-screen bg-slate-50 text-slate-900">
            <header className="border-b border-slate-200 bg-white/90 backdrop-blur">
                <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4 sm:px-6 lg:px-8">
                    <Link to="/dashboard" className="text-lg font-semibold tracking-tight">
                        Mini AI-HRMS
                    </Link>
                    <nav className="flex items-center gap-2">
                        <NavLink to="/dashboard" className={linkClass}>
                            Dashboard
                        </NavLink>
                        <NavLink to="/employees" className={linkClass}>
                            Employees
                        </NavLink>
                        <NavLink to="/tasks" className={linkClass}>
                            Tasks
                        </NavLink>
                        <button
                            type="button"
                            onClick={handleLogout}
                            className="rounded-md border border-slate-300 px-3 py-2 text-sm font-medium text-slate-700 transition hover:border-slate-400 hover:bg-slate-100"
                        >
                            Logout
                        </button>
                    </nav>
                </div>
            </header>
            <main>{children}</main>
        </div>
    );
}
