import { useEffect, useState } from "react";
import API from "../services/api";
import Layout from "../components/Layout";

const StatCard = ({ label, value, note }) => (
    <article className="rounded-[12px] border border-[var(--line)] bg-white p-3">
        <p className="label">{label}</p>
        <div className="mt-2.5 flex items-end justify-between gap-3">
            <p className="text-2xl font-semibold tracking-tight">{value}</p>
            <p className="max-w-28 text-right text-xs text-[var(--muted)]">{note}</p>
        </div>
    </article>
);

const MetricRow = ({ title, value, description }) => (
    <div className="flex items-center justify-between gap-4 rounded-[10px] border border-[var(--line)] bg-[var(--soft)] px-3 py-2.5">
        <div>
            <p className="text-sm font-medium text-[var(--ink)]">{title}</p>
            <p className="mt-1 text-sm text-[var(--muted)]">{description}</p>
        </div>
        <div className="rounded-md border border-[var(--line)] bg-white px-2.5 py-1 text-sm font-semibold text-[var(--ink)]">{value}</div>
    </div>
);

export default function Dashboard() {
    const [data, setData] = useState(null);
    const [error, setError] = useState("");

    useEffect(() => {
        (async () => {
            try {
                const res = await API.get("/dashboard");
                setData(res.data);
            } catch (err) {
                setError(err.response?.data?.msg || "Failed to load dashboard");
            }
        })();
    }, []);

    if (error) {
        return (
            <Layout>
                <div className="px-4 py-6 lg:px-8">
                    <div className="rounded-[12px] border border-[#d4dce4] bg-[#f0f4f9] px-4 py-3 text-sm text-[#586b7e]">{error}</div>
                </div>
            </Layout>
        );
    }

    if (!data) {
        return (
            <Layout>
                <div className="px-4 py-6 text-sm text-[var(--muted)] lg:px-8">Loading...</div>
            </Layout>
        );
    }

    const stats = data.role === "employee"
        ? [
            { label: "My tasks", value: data.myTasks, note: "Assigned to you" },
            { label: "Assigned", value: data.assignedTasks, note: "Needs proof" },
            { label: "Submitted", value: data.submittedTasks, note: "Waiting review" },
            { label: "Approved", value: data.approvedTasks, note: "Logged on approval" },
        ]
        : [
            { label: "Employees", value: data.totalEmployees, note: "Registered users" },
            { label: "Tasks", value: data.totalTasks, note: "Total workflow items" },
            { label: "Assigned", value: data.assignedTasks, note: "Active work" },
            { label: "Submitted", value: data.submittedTasks, note: "Needs approval" },
            { label: "Approved", value: data.approvedTasks, note: "Completed work" },
        ];

    return (
        <Layout>
            <div className="page-wrap">
                <section className="page-header">
                    <p className="label">Overview</p>
                    <div className="mt-2.5">
                        <h1 className="page-title text-[1.7rem] font-semibold">Dashboard</h1>
                        <p className="mt-1.5 max-w-2xl text-sm text-[var(--muted)]">
                            Status, approvals, and payment logging in one clear place.
                        </p>
                    </div>
                </section>

                <section className="mt-4 grid gap-3 md:grid-cols-2 xl:grid-cols-5">
                    {stats.map((item) => (
                        <StatCard key={item.label} {...item} />
                    ))}
                </section>

                <div className="mt-4 grid gap-4 xl:grid-cols-[1.15fr_0.85fr]">
                    <section className="section">
                        <div className="section-head">
                            <p className="label">Workflow</p>
                            <h2 className="mt-1.5 text-base font-semibold">Task lifecycle</h2>
                        </div>
                        <div className="section-body grid gap-3">
                            <MetricRow title="Assigned" value={data.assignedTasks} description="Waiting for proof" />
                            <MetricRow title="Submitted" value={data.submittedTasks} description="Ready for approval" />
                            <MetricRow title="Approved" value={data.approvedTasks} description="Payment logged" />
                        </div>
                    </section>

                    {data.role === "admin" ? (
                        <section className="section">
                            <div className="section-head">
                                <p className="label">Productivity</p>
                                <h2 className="mt-1.5 text-base font-semibold">Rule-based score</h2>
                            </div>
                            <div className="divide-y divide-[var(--line)]">
                                {data.productivity?.map((employee) => (
                                    <div key={employee.employeeId} className="flex items-center justify-between gap-4 px-4 py-3">
                                        <div>
                                            <p className="font-medium text-[var(--ink)]">{employee.name}</p>
                                            <p className="mt-1 text-sm text-[var(--muted)]">
                                                Approved {employee.approved} · Submitted {employee.submitted} · Delayed {employee.delayed}
                                            </p>
                                        </div>
                                        <div className="rounded-md border border-[var(--line)] bg-[#1566cc] px-3 py-1.5 text-sm font-semibold text-white">
                                            {employee.score}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </section>
                    ) : null}
                </div>
            </div>
        </Layout>
    );
}
