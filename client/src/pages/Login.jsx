import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import API from "../services/api";
import { setAuthSession } from "../utils/auth";

export default function Login() {
    const navigate = useNavigate();
    const [form, setForm] = useState({ email: "", password: "" });
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);

    const handleChange = (event) => {
        const { name, value } = event.target;
        setForm((current) => ({ ...current, [name]: value }));
    };

    const handleSubmit = async (event) => {
        event.preventDefault();
        setLoading(true);
        setError("");

        try {
            const res = await API.post("/auth/login", form);
            setAuthSession(res.data);
            navigate("/dashboard");
        } catch (err) {
            setError(err.response?.data?.msg || "Login failed");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="app-shell min-h-screen px-4 py-3 sm:px-6 lg:px-8">
            <div className="mx-auto grid min-h-[calc(100vh-1.5rem)] max-w-6xl overflow-hidden section rounded-[16px] lg:grid-cols-[1.05fr_0.95fr]">
                <aside className="flex flex-col justify-center gap-10 border-b border-[var(--line)] bg-[var(--soft)] p-8 lg:border-b-0 lg:border-r">
                    <div>
                        <p className="label">Mini AI-HRMS</p>
                        <h1 className="page-title mt-3 max-w-xl text-4xl font-semibold">Work, proof, approval, payment.</h1>
                        <p className="mt-3 max-w-lg text-sm text-[var(--muted)]">
                            A small internal tool for assigning work and approving it with clear payment logging.
                        </p>
                    </div>

                    <div className="grid gap-2.5 sm:grid-cols-3">
                        {[
                            ["Assigned", "Waiting for proof"],
                            ["Submitted", "Ready for approval"],
                            ["Approved", "Payment logged"],
                        ].map(([label, subtitle]) => (
                            <div key={label} className="rounded-[10px] border border-[var(--line)] bg-white px-3 py-2.5">
                                <p className="text-sm font-medium">{label}</p>
                                <p className="mt-1 text-xs text-[var(--muted)]">{subtitle}</p>
                            </div>
                        ))}
                    </div>
                </aside>

                <section className="flex items-center p-8 lg:p-10">
                    <div className="w-full max-w-md">
                        <p className="label">Sign in</p>
                        <h2 className="mt-2.5 text-[1.75rem] font-semibold tracking-tight">Welcome back</h2>
                        <p className="mt-1.5 text-sm text-[var(--muted)]">Sign in to your workspace.</p>

                        {error ? (
                            <div className="mt-4 rounded-[12px] border border-[#fecaca] bg-[#fee2e2] px-4 py-3 text-sm text-[#991b1b]">{error}</div>
                        ) : null}

                        <form onSubmit={handleSubmit} className="mt-5 space-y-3">
                            <input className="field" name="email" type="email" placeholder="Email" value={form.email} onChange={handleChange} required />
                            <input className="field" name="password" type="password" placeholder="Password" value={form.password} onChange={handleChange} required />
                            <button className="button-primary w-full" type="submit" disabled={loading}>
                                {loading ? "Signing in..." : "Sign in"}
                            </button>
                        </form>

                        <p className="mt-4 text-sm text-[var(--muted)]">
                            New here? <Link className="font-semibold text-[var(--ink)] underline underline-offset-4" to="/register">Create an account</Link>
                        </p>
                    </div>
                </section>
            </div>
        </div>
    );
}
