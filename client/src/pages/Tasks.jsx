import { useEffect, useState } from "react";
import API from "../services/api";
import Layout from "../components/Layout";
import { connectWallet, logToBlockchain } from "../utils/web3";

const initialForm = {
    title: "",
    description: "",
    assignedTo: "",
    status: "Assigned",
    dueDate: "",
};

const EditIcon = () => (
    <svg aria-hidden="true" viewBox="0 0 24 24" className="h-4 w-4 stroke-current" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <path d="M12 20h9" />
        <path d="M16.5 3.5a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4Z" />
    </svg>
);

const DeleteIcon = () => (
    <svg aria-hidden="true" viewBox="0 0 24 24" className="h-4 w-4 stroke-current" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <path d="M3 6h18" />
        <path d="M8 6V4h8v2" />
        <path d="M19 6l-1 14H6L5 6" />
        <path d="M10 11v6" />
        <path d="M14 11v6" />
    </svg>
);

export default function Tasks() {
    const [tasks, setTasks] = useState([]);
    const [employees, setEmployees] = useState([]);
    const [form, setForm] = useState(initialForm);
    const [error, setError] = useState("");
    const [saving, setSaving] = useState(false);
    const [walletAddress, setWalletAddress] = useState("");
    const [latestTxHash, setLatestTxHash] = useState("");
    const [editingTaskId, setEditingTaskId] = useState("");
    const [editForm, setEditForm] = useState(initialForm);
    const [updatingTask, setUpdatingTask] = useState(false);

    const getExplorerUrl = (hash) => `https://amoy.polygonscan.com/tx/${hash}`;

    const fetchData = async () => {
        try {
            const [tasksRes, employeesRes] = await Promise.all([
                API.get("/tasks"),
                API.get("/employees"),
            ]);
            setTasks(tasksRes.data);
            setEmployees(employeesRes.data);
        } catch (err) {
            setError(err.response?.data?.msg || "Failed to load tasks");
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    const handleChange = (event) => {
        const { name, value } = event.target;
        setForm((current) => ({ ...current, [name]: value }));
    };

    const handleEditChange = (event) => {
        const { name, value } = event.target;
        setEditForm((current) => ({ ...current, [name]: value }));
    };

    const handleSubmit = async (event) => {
        event.preventDefault();
        setSaving(true);
        setError("");

        try {
            await API.post("/tasks", {
                ...form,
                assignedTo: form.assignedTo || undefined,
            });
            setForm(initialForm);
            await fetchData();
        } catch (err) {
            setError(err.response?.data?.msg || "Failed to create task");
        } finally {
            setSaving(false);
        }
    };

    const updateStatus = async (taskId, status) => {
        try {
            const currentTask = tasks.find((task) => task._id === taskId);

            if (!currentTask) {
                return;
            }

            if (currentTask.status === "Completed" && status !== "Completed") {
                setError("Completed tasks are locked and cannot be changed");
                return;
            }

            if (status === "Completed" && currentTask.status !== "Completed") {
                const txHash = await logToBlockchain();

                await API.put(`/tasks/${taskId}`, {
                    status,
                    txHash,
                });

                setLatestTxHash(txHash);

                alert("Task completed + logged on blockchain");
            } else {
                await API.put(`/tasks/${taskId}`, { status });
            }

            await fetchData();
        } catch (err) {
            setError(err.response?.data?.msg || "Failed to update task");
        }
    };

    const startEditTask = (task) => {
        setError("");
        setEditingTaskId(task._id);
        setEditForm({
            title: task.title || "",
            description: task.description || "",
            assignedTo: task.assignedTo?._id || "",
            status: task.status || "Assigned",
            dueDate: task.dueDate ? new Date(task.dueDate).toISOString().slice(0, 10) : "",
        });
    };

    const cancelEditTask = () => {
        setEditingTaskId("");
        setEditForm(initialForm);
    };

    const handleUpdateTask = async (task) => {
        setUpdatingTask(true);
        setError("");

        try {
            let txHash;

            if (task.status !== "Completed" && editForm.status === "Completed") {
                txHash = await logToBlockchain();
                setLatestTxHash(txHash);
            }

            await API.put(`/tasks/${task._id}`, {
                title: editForm.title,
                description: editForm.description,
                assignedTo: editForm.assignedTo || undefined,
                status: editForm.status,
                dueDate: editForm.dueDate || undefined,
                txHash,
            });

            cancelEditTask();
            await fetchData();
        } catch (err) {
            setError(err.response?.data?.msg || "Failed to update task");
        } finally {
            setUpdatingTask(false);
        }
    };

    const handleDeleteTask = async (taskId) => {
        const confirmed = window.confirm("Delete this task?");
        if (!confirmed) {
            return;
        }

        setError("");

        try {
            await API.delete(`/tasks/${taskId}`);
            if (editingTaskId === taskId) {
                cancelEditTask();
            }
            await fetchData();
        } catch (err) {
            setError(err.response?.data?.msg || "Failed to delete task");
        }
    };

    const handleConnectWallet = async () => {
        try {
            const address = await connectWallet();

            if (address) {
                setWalletAddress(address);
                console.log("Connected wallet:", address);
            }
        } catch (err) {
            setError(err?.message || "Wallet connection failed");
        }
    };

    const handleTestWeb3 = async () => {
        try {
            const hash = await logToBlockchain();

            if (hash) {
                setLatestTxHash(hash);
                console.log("TX HASH:", hash);
                alert(`Web3 test transaction sent: ${hash}`);
            }
        } catch (err) {
            setError(err?.message || "Web3 test transaction failed");
        }
    };

    return (
        <Layout>
            <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
                <div className="mb-8">
                    <p className="text-sm font-medium uppercase tracking-[0.3em] text-slate-500">Execution</p>
                    <h1 className="mt-2 text-3xl font-semibold tracking-tight">Tasks</h1>
                    <div className="mt-4 flex flex-wrap items-center gap-3">
                        <button
                            type="button"
                            onClick={handleConnectWallet}
                            className="rounded-xl border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-800 transition hover:border-slate-400 hover:bg-slate-100"
                        >
                            Connect Wallet
                        </button>
                        <button
                            type="button"
                            onClick={handleTestWeb3}
                            className="rounded-xl bg-slate-900 px-4 py-2 text-sm font-medium text-white transition hover:bg-slate-800"
                        >
                            Test Web3
                        </button>
                        {walletAddress ? (
                            <p className="text-sm text-slate-600">
                                Connected: {walletAddress.slice(0, 6)}...{walletAddress.slice(-4)}
                            </p>
                        ) : null}
                    </div>
                    {latestTxHash ? (
                        <div className="mt-3 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-800">
                            Latest tx: {" "}
                            <a
                                className="font-medium underline"
                                href={getExplorerUrl(latestTxHash)}
                                target="_blank"
                                rel="noreferrer"
                            >
                                {latestTxHash}
                            </a>
                        </div>
                    ) : null}
                </div>

                <div className="grid gap-8 lg:grid-cols-[380px_1fr]">
                    <form onSubmit={handleSubmit} className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                        <h2 className="text-lg font-semibold">Create task</h2>
                        <div className="mt-4 space-y-4">
                            <input className="w-full rounded-xl border border-slate-300 px-4 py-3" name="title" placeholder="Title" value={form.title} onChange={handleChange} required />
                            <textarea className="w-full rounded-xl border border-slate-300 px-4 py-3" name="description" placeholder="Description" rows="4" value={form.description} onChange={handleChange} />
                            <select className="w-full rounded-xl border border-slate-300 px-4 py-3" name="assignedTo" value={form.assignedTo} onChange={handleChange}>
                                <option value="">Assign to employee</option>
                                {employees.map((employee) => (
                                    <option key={employee._id} value={employee._id}>
                                        {employee.name}
                                    </option>
                                ))}
                            </select>
                            <select className="w-full rounded-xl border border-slate-300 px-4 py-3" name="status" value={form.status} onChange={handleChange}>
                                <option value="Assigned">Assigned</option>
                                <option value="In Progress">In Progress</option>
                                <option value="Completed">Completed</option>
                            </select>
                            <input className="w-full rounded-xl border border-slate-300 px-4 py-3" type="date" name="dueDate" value={form.dueDate} onChange={handleChange} />
                        </div>

                        {error ? <div className="mt-4 rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">{error}</div> : null}

                        <button className="mt-4 w-full rounded-xl bg-slate-950 px-4 py-3 font-medium text-white disabled:opacity-70" type="submit" disabled={saving}>
                            {saving ? "Saving..." : "Save task"}
                        </button>
                    </form>

                    <section className="rounded-2xl border border-slate-200 bg-white shadow-sm">
                        <div className="border-b border-slate-200 px-5 py-4">
                            <h2 className="text-lg font-semibold">Task list</h2>
                            <p className="mt-1 text-sm text-slate-500">Track status and completion timestamps</p>
                        </div>
                        <div className="divide-y divide-slate-200">
                            {tasks.length === 0 ? (
                                <p className="px-5 py-6 text-sm text-slate-500">No tasks yet.</p>
                            ) : (
                                tasks.map((task) => (
                                    <div key={task._id} className="px-5 py-4">
                                        {editingTaskId === task._id ? (
                                            <div className="space-y-3">
                                                <input className="w-full rounded-xl border border-slate-300 px-4 py-2" name="title" value={editForm.title} onChange={handleEditChange} />
                                                <textarea className="w-full rounded-xl border border-slate-300 px-4 py-2" name="description" rows="3" value={editForm.description} onChange={handleEditChange} />
                                                <select className="w-full rounded-xl border border-slate-300 px-4 py-2" name="assignedTo" value={editForm.assignedTo} onChange={handleEditChange}>
                                                    <option value="">Assign to employee</option>
                                                    {employees.map((employee) => (
                                                        <option key={employee._id} value={employee._id}>
                                                            {employee.name}
                                                        </option>
                                                    ))}
                                                </select>
                                                <select
                                                    className="w-full rounded-xl border border-slate-300 px-4 py-2 disabled:cursor-not-allowed disabled:bg-slate-100"
                                                    name="status"
                                                    value={editForm.status}
                                                    disabled={task.status === "Completed"}
                                                    onChange={handleEditChange}
                                                >
                                                    <option value="Assigned">Assigned</option>
                                                    <option value="In Progress">In Progress</option>
                                                    <option value="Completed">Completed</option>
                                                </select>
                                                <input className="w-full rounded-xl border border-slate-300 px-4 py-2" type="date" name="dueDate" value={editForm.dueDate} onChange={handleEditChange} />
                                                <div className="flex gap-2">
                                                    <button className="rounded-xl bg-slate-900 px-4 py-2 text-sm font-medium text-white" type="button" disabled={updatingTask} onClick={() => handleUpdateTask(task)}>
                                                        {updatingTask ? "Updating..." : "Save"}
                                                    </button>
                                                    <button className="rounded-xl border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700" type="button" onClick={cancelEditTask}>
                                                        Cancel
                                                    </button>
                                                </div>
                                            </div>
                                        ) : (
                                            <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                                                <div>
                                                    <p className="font-medium text-slate-900">{task.title}</p>
                                                    <p className="mt-1 text-sm text-slate-500">{task.description || "No description"}</p>
                                                    <p className="mt-2 text-sm text-slate-500">
                                                        Assigned to: {task.assignedTo?.name || "Unassigned"}
                                                    </p>
                                                    <p className="text-sm text-slate-500">
                                                        Due: {task.dueDate ? new Date(task.dueDate).toLocaleDateString() : "Not set"}
                                                    </p>
                                                    {task.completedAt ? (
                                                        <p className="text-sm text-slate-500">
                                                            Completed: {new Date(task.completedAt).toLocaleString()}
                                                        </p>
                                                    ) : null}
                                                    {task.txHash ? (
                                                        <p className="text-sm text-slate-500">
                                                            Tx Hash:{" "}
                                                            <a
                                                                className="underline"
                                                                href={getExplorerUrl(task.txHash)}
                                                                target="_blank"
                                                                rel="noreferrer"
                                                            >
                                                                {task.txHash}
                                                            </a>
                                                        </p>
                                                    ) : null}
                                                </div>
                                                <div className="flex flex-col items-start gap-2 sm:items-end">
                                                    <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-700">
                                                        {task.status}
                                                    </span>
                                                    <select
                                                        className="rounded-xl border border-slate-300 px-3 py-2 text-sm disabled:cursor-not-allowed disabled:bg-slate-100 disabled:text-slate-400"
                                                        value={task.status}
                                                        disabled={task.status === "Completed"}
                                                        onChange={(event) => updateStatus(task._id, event.target.value)}
                                                    >
                                                        <option value="Assigned">Assigned</option>
                                                        <option value="In Progress">In Progress</option>
                                                        <option value="Completed">Completed</option>
                                                    </select>
                                                    <div className="flex gap-2">
                                                        <button className="inline-flex h-9 w-9 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-500 transition hover:border-slate-300 hover:bg-slate-50 hover:text-slate-900" type="button" aria-label="Edit task" title="Edit" onClick={() => startEditTask(task)}>
                                                            <EditIcon />
                                                        </button>
                                                        <button className="inline-flex h-9 w-9 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-500 transition hover:border-slate-300 hover:bg-slate-50 hover:text-slate-900" type="button" aria-label="Delete task" title="Delete" onClick={() => handleDeleteTask(task._id)}>
                                                            <DeleteIcon />
                                                        </button>
                                                    </div>
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                ))
                            )}
                        </div>
                    </section>
                </div>
            </div>
        </Layout>
    );
}
