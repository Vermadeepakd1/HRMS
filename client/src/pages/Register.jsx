import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import API from "../services/api";
import { setAuthSession } from "../utils/auth";

const initialForm = {
    name: "",
    email: "",
    password: "",
    walletAddress: "",
};

export default function Register() {
    const navigate = useNavigate();
    const [form, setForm] = useState(initialForm);
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
            const res = await API.post("/auth/register", {
                ...form,
                role: "employee",
            });
            setAuthSession(res.data);
            navigate("/dashboard");
        } catch (err) {
            setError(err.response?.data?.msg || "Registration failed");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="app-shell min-h-screen px-4 py-6 sm:px-6 lg:px-8">
            <div className="mx-auto grid min-h-[calc(100vh-3rem)] max-w-6xl overflow-hidden section rounded-[16px] lg:grid-cols-[0.95fr_1.05fr]">
                <section className="order-2 flex items-center p-8 lg:order-1 lg:p-10">
                    <div className="w-full max-w-md">
                        <p className="label">Create account</p>
                        <h1 className="page-title mt-2.5 text-[1.7rem] font-semibold">Register employee access</h1>
                        <p className="mt-1.5 text-sm text-[var(--muted)]">Employee accounts require a wallet address for payment logging.</p>

                        {error ? (
                            <div className="mt-4 rounded-[12px] border border-[#fecaca] bg-[#fee2e2] px-4 py-3 text-sm text-[#991b1b]">{error}</div>
                        ) : null}

                        <form onSubmit={handleSubmit} className="mt-5 space-y-3">
                            <input className="field" name="name" placeholder="Full name" value={form.name} onChange={handleChange} required />
                            <input className="field" name="email" type="email" placeholder="Email" value={form.email} onChange={handleChange} required />
                            <input className="field" name="password" type="password" placeholder="Password" value={form.password} onChange={handleChange} required />
                            <input className="field" name="walletAddress" placeholder="Wallet address" value={form.walletAddress} onChange={handleChange} required />
                            <button className="button-primary w-full" type="submit" disabled={loading}>
                                {loading ? "Creating account..." : "Create account"}
                            </button>
                        </form>

                        <p className="mt-4 text-sm text-[var(--muted)]">
                            Already have access? <Link className="font-semibold text-[var(--ink)] underline underline-offset-4" to="/">Back to sign in</Link>
                        </p>
                    </div>
                </section>

                <aside className="order-1 border-b border-[var(--line)] bg-[var(--soft)] p-8 lg:order-2 lg:border-b-0 lg:border-l">
                    <p className="label">Workflow</p>
                    <h2 className="mt-3 max-w-xl text-4xl font-semibold leading-[0.97] tracking-tight">Employee registration keeps payment routing explicit.</h2>
                    <div className="mt-4 space-y-2.5">
                        {[
                            "Register with wallet address",
                            "Receive assigned tasks",
                            "Submit proof for review",
                            "Approved work gets payment logging",
                        ].map((item) => (
                            <div key={item} className="rounded-[10px] border border-[var(--line)] bg-white px-3 py-2.5 text-sm text-[var(--ink)]">
                                {item}
                            </div>
                        ))}
                    </div>
                </aside>
            </div>
        </div>
    );
}
