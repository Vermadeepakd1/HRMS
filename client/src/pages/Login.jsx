import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import API from "../services/api";

export default function Login() {
    const navigate = useNavigate();
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);

    const handleLogin = async (event) => {
        event.preventDefault();
        setLoading(true);
        setError("");

        try {
            const res = await API.post("/auth/login", { email, password });
            localStorage.setItem("token", res.data.token);
            navigate("/dashboard");
        } catch (err) {
            setError(err.response?.data?.msg || "Login failed");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-slate-100 via-white to-slate-200 px-4">
            <div className="grid w-full max-w-5xl overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-[0_20px_80px_rgba(15,23,42,0.08)] lg:grid-cols-2">
                <section className="hidden flex-col justify-between bg-slate-950 p-10 text-white lg:flex">
                    <div>
                        <p className="text-sm uppercase tracking-[0.35em] text-slate-400">Mini AI-HRMS</p>
                        <h1 className="mt-6 max-w-md text-4xl font-semibold tracking-tight">
                            Workforce operations, clarified.
                        </h1>
                        <p className="mt-4 max-w-md text-slate-300">
                            Manage employees, assign work, and track productivity from one clean operational view.
                        </p>
                    </div>
                    <div className="grid grid-cols-3 gap-4 text-sm text-slate-300">
                        <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                            JWT Auth
                        </div>
                        <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                            Rule-based AI
                        </div>
                        <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                            Web3-ready
                        </div>
                    </div>
                </section>

                <section className="p-8 sm:p-10">
                    <div className="mb-8">
                        <p className="text-sm font-medium uppercase tracking-[0.3em] text-slate-500">Welcome back</p>
                        <h2 className="mt-3 text-3xl font-semibold tracking-tight">Login</h2>
                        <p className="mt-2 text-sm text-slate-500">Use your admin account to continue.</p>
                    </div>

                    <form onSubmit={handleLogin} className="space-y-4">
                        <div>
                            <label className="mb-2 block text-sm font-medium text-slate-700">Email</label>
                            <input
                                className="w-full rounded-xl border border-slate-300 px-4 py-3 outline-none transition focus:border-slate-900"
                                placeholder="admin@company.com"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                            />
                        </div>
                        <div>
                            <label className="mb-2 block text-sm font-medium text-slate-700">Password</label>
                            <input
                                className="w-full rounded-xl border border-slate-300 px-4 py-3 outline-none transition focus:border-slate-900"
                                placeholder="••••••••"
                                type="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                            />
                        </div>

                        {error ? (
                            <div className="rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
                                {error}
                            </div>
                        ) : null}

                        <button
                            className="w-full rounded-xl bg-slate-950 px-4 py-3 font-medium text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-70"
                            type="submit"
                            disabled={loading}
                        >
                            {loading ? "Signing in..." : "Login"}
                        </button>
                    </form>

                    <p className="mt-6 text-sm text-slate-500">
                        No admin account yet? <Link className="font-medium text-slate-950 underline" to="/register">Create one</Link>
                    </p>
                </section>
            </div>
        </div>
    );
}
