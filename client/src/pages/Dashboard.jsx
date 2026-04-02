import { useEffect, useState } from "react";
import API from "../services/api";
import Layout from "../components/Layout";

export default function Dashboard() {
    const [data, setData] = useState(null);
    const [error, setError] = useState("");

    useEffect(() => {
        const fetchData = async () => {
            try {
                const res = await API.get("/dashboard");
                setData(res.data);
            } catch (err) {
                setError(err.response?.data?.msg || "Failed to load dashboard");
            }
        };

        fetchData();
    }, []);

    if (error) {
        return (
            <Layout>
                <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
                    <div className="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
                        {error}
                    </div>
                </div>
            </Layout>
        );
    }

    if (!data) {
        return (
            <Layout>
                <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">Loading...</div>
            </Layout>
        );
    }

    return (
        <Layout>
            <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
                <div className="mb-8 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
                    <div>
                        <p className="text-sm font-medium uppercase tracking-[0.3em] text-slate-500">Overview</p>
                        <h1 className="mt-2 text-3xl font-semibold tracking-tight">Dashboard</h1>
                    </div>
                    <p className="max-w-xl text-sm text-slate-500">
                        Operational snapshot of employees, tasks, and rule-based productivity scoring.
                    </p>
                </div>

                <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
                    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                        <p className="text-sm text-slate-500">Total employees</p>
                        <p className="mt-3 text-3xl font-semibold">{data.totalEmployees}</p>
                    </div>
                    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                        <p className="text-sm text-slate-500">Active employees</p>
                        <p className="mt-3 text-3xl font-semibold">{data.activeEmployees}</p>
                    </div>
                    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                        <p className="text-sm text-slate-500">Total tasks</p>
                        <p className="mt-3 text-3xl font-semibold">{data.totalTasks}</p>
                    </div>
                    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                        <p className="text-sm text-slate-500">Completed tasks</p>
                        <p className="mt-3 text-3xl font-semibold">{data.completedTasks}</p>
                    </div>
                </div>

                <div className="mt-8 rounded-2xl border border-slate-200 bg-white shadow-sm">
                    <div className="border-b border-slate-200 px-5 py-4">
                        <h2 className="text-lg font-semibold">Productivity intelligence</h2>
                        <p className="mt-1 text-sm text-slate-500">Rule-based score per employee</p>
                    </div>
                    <div className="divide-y divide-slate-200">
                        {data.productivity.map((employee) => (
                            <div key={employee.employeeId} className="flex flex-col gap-3 px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
                                <div>
                                    <p className="font-medium text-slate-900">{employee.name}</p>
                                    <p className="text-sm text-slate-500">
                                        Completed {employee.completed} · Delayed {employee.delayed} · Active {employee.active}
                                    </p>
                                </div>
                                <div className="rounded-full bg-slate-950 px-4 py-2 text-sm font-medium text-white">
                                    Score: {employee.score}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </Layout>
    );
}
