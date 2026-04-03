import { Link, NavLink, useNavigate } from "react-router-dom";
import { clearAuthSession, getAuthUser } from "../utils/auth";

const navClass = ({ isActive }) =>
    `flex items-center justify-between rounded-xl border px-3 py-2.5 text-sm font-medium transition ${isActive
        ? "border-[#1566cc] bg-[#e8f1fa] text-[#0f47a6]"
        : "border-transparent text-[var(--muted)] hover:border-[var(--line)] hover:bg-white hover:text-[var(--ink)]"
    }`;

export default function Layout({ children }) {
    const navigate = useNavigate();
    const user = getAuthUser();

    const navItems = [
        { to: "/dashboard", label: "Dashboard" },
        ...(user?.role === "admin" ? [{ to: "/employees", label: "Employees" }] : []),
        { to: "/tasks", label: "Tasks" },
    ];

    const handleLogout = () => {
        const confirmed = window.confirm("Log out of this session?");
        if (!confirmed) return;
        clearAuthSession();
        navigate("/");
    };

    return (
        <div className="app-shell min-h-screen text-[var(--ink)]">
            <div className="mx-auto flex min-h-screen max-w-[1540px] gap-3 px-3 py-3 lg:px-4">
                <aside className="sticky top-3 flex h-[calc(100vh-1.5rem)] w-68 shrink-0 flex-col rounded-[16px] border border-[var(--line)] bg-[var(--panel)] p-3 shadow-[var(--shadow)]">
                    <Link to="/dashboard" className="block rounded-[12px] border border-[var(--line)] bg-white px-3 py-3">
                        <p className="label">Mini AI-HRMS</p>
                        <p className="mt-2 text-[1.35rem] font-semibold tracking-tight">Work Ledger</p>
                        <p className="mt-1.5 text-sm text-[var(--muted)]">Tasks, approvals, and payment proof.</p>
                    </Link>

                    <div className="mt-3 rounded-[12px] border border-[var(--line)] bg-[var(--soft)] px-3 py-2.5">
                        <p className="text-sm font-medium">{user?.name || "User"}</p>
                        <p className="mt-1 text-sm text-[var(--muted)]">{user?.role || "user"}</p>
                    </div>

                    <nav className="mt-3 flex min-h-0 flex-1 flex-col gap-1.5 overflow-y-auto pr-1 pb-1">
                        <p className="px-1 py-1.5 label">Navigation</p>
                        {navItems.map((item) => (
                            <NavLink key={item.to} to={item.to} className={navClass}>
                                <span>{item.label}</span>
                                <span className="h-1.5 w-1.5 rounded-full bg-current opacity-50" />
                            </NavLink>
                        ))}
                        <button
                            type="button"
                            onClick={handleLogout}
                            className="mt-auto mb-1 rounded-xl border border-[var(--line)] bg-white px-3 py-2.5 text-left text-sm font-medium text-[var(--ink)] transition hover:bg-[var(--soft)]"
                        >
                            Logout
                        </button>
                    </nav>
                </aside>

                <main className="min-w-0 flex-1 overflow-hidden rounded-[16px] border border-[var(--line)] bg-[var(--panel)] shadow-[var(--shadow)]">
                    <div className="relative min-w-0">{children}</div>
                </main>
            </div>
        </div>
    );
}
