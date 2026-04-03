import { useEffect, useState } from "react";
import Layout from "../components/Layout";
import API from "../services/api";
import { getAuthUser } from "../utils/auth";
import { logToBlockchain } from "../utils/web3";

const initialForm = {
    title: "",
    description: "",
    assignedTo: "",
    dueDate: "",
};

const EditIcon = () => (
    <svg aria-hidden="true" viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <path d="M12 20h9" />
        <path d="M16.5 3.5a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4Z" />
    </svg>
);

const DeleteIcon = () => (
    <svg aria-hidden="true" viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <path d="M3 6h18" />
        <path d="M8 6V4h8v2" />
        <path d="M19 6l-1 14H6L5 6" />
        <path d="M10 11v6" />
        <path d="M14 11v6" />
    </svg>
);

const statusClass = {
    Assigned: "status-assigned",
    Submitted: "status-submitted",
    Approved: "status-approved",
};

export default function Tasks() {
    const user = getAuthUser();
    const isAdmin = user?.role === "admin";

    const [tasks, setTasks] = useState([]);
    const [employees, setEmployees] = useState([]);
    const [form, setForm] = useState(initialForm);
    const [proofUrlMap, setProofUrlMap] = useState({});
    const [editingTaskId, setEditingTaskId] = useState("");
    const [editForm, setEditForm] = useState(initialForm);
    const [latestTxHash, setLatestTxHash] = useState("");
    const [error, setError] = useState("");

    const getExplorerUrl = (hash) => `https://amoy.polygonscan.com/tx/${hash}`;

    useEffect(() => {
        (async () => {
            try {
                const requests = [API.get("/tasks")];
                if (isAdmin) requests.push(API.get("/employees"));

                const [tasksRes, employeesRes] = await Promise.all(requests);
                setTasks(tasksRes.data);
                setEmployees(employeesRes?.data || []);
            } catch (err) {
                setError(err.response?.data?.msg || "Failed to load tasks");
            }
        })();
    }, [isAdmin]);

    const refresh = async () => {
        const requests = [API.get("/tasks")];
        if (isAdmin) requests.push(API.get("/employees"));

        const [tasksRes, employeesRes] = await Promise.all(requests);
        setTasks(tasksRes.data);
        setEmployees(employeesRes?.data || []);
    };

    const handleChange = (event) => {
        const { name, value } = event.target;
        setForm((current) => ({ ...current, [name]: value }));
    };

    const handleEditChange = (event) => {
        const { name, value } = event.target;
        setEditForm((current) => ({ ...current, [name]: value }));
    };

    const handleCreateTask = async (event) => {
        event.preventDefault();
        setError("");

        try {
            await API.post("/tasks", {
                ...form,
                assignedTo: form.assignedTo || undefined,
                status: "Assigned",
            });

            setForm(initialForm);
            await refresh();
        } catch (err) {
            setError(err.response?.data?.msg || "Failed to create task");
        }
    };

    const startEditTask = (task) => {
        if (task.status === "Approved") return;

        setEditingTaskId(task._id);
        setEditForm({
            title: task.title || "",
            description: task.description || "",
            assignedTo: task.assignedTo?._id || "",
            dueDate: task.dueDate ? new Date(task.dueDate).toISOString().slice(0, 10) : "",
        });
    };

    const cancelEditTask = () => {
        setEditingTaskId("");
        setEditForm(initialForm);
    };

    const handleUpdateTask = async (taskId) => {
        setError("");

        try {
            await API.put(`/tasks/${taskId}`, {
                title: editForm.title,
                description: editForm.description,
                assignedTo: editForm.assignedTo || undefined,
                dueDate: editForm.dueDate || undefined,
            });
            cancelEditTask();
            await refresh();
        } catch (err) {
            setError(err.response?.data?.msg || "Failed to update task");
        }
    };

    const handleDeleteTask = async (taskId) => {
        const confirmed = window.confirm("Delete this task?");
        if (!confirmed) return;

        try {
            await API.delete(`/tasks/${taskId}`);
            await refresh();
        } catch (err) {
            setError(err.response?.data?.msg || "Failed to delete task");
        }
    };

    const handleSubmitProof = async (task) => {
        const proofUrl = proofUrlMap[task._id];
        if (!proofUrl) {
            setError("Add a proof link before submitting.");
            return;
        }

        try {
            await API.put(`/tasks/${task._id}/submit`, { proofUrl });
            setProofUrlMap((current) => ({ ...current, [task._id]: "" }));
            await refresh();
        } catch (err) {
            setError(err.response?.data?.msg || "Failed to submit proof");
        }
    };

    const handleApproveTask = async (task) => {
        try {
            const employeeId = task.assignedTo?._id || task.assignedTo;
            const employeeWallet = task.assignedTo?.walletAddress;

            if (!employeeWallet) {
                setError("Assigned employee does not have a wallet address");
                return;
            }

            const txHash = await logToBlockchain(employeeWallet, `Payment for task ${task._id} to employee ${employeeId}`);
            await API.put(`/tasks/${task._id}/approve`, { txHash });
            setLatestTxHash(txHash || "");
            await refresh();
        } catch (err) {
            setError(err.response?.data?.msg || "Failed to approve task");
        }
    };

    return (
        <Layout>
            <div className="page-wrap">
                <section className="page-header">
                    <p className="label">Task workflow</p>
                    <div className="mt-2.5">
                        <h1 className="page-title text-[1.7rem] font-semibold">Tasks</h1>
                        <p className="mt-1.5 max-w-2xl text-sm text-[var(--muted)]">
                            {isAdmin
                                ? "Assign work, review proof, and approve with blockchain logging."
                                : "Submit proof links for assigned tasks to request approval."}
                        </p>
                    </div>
                </section>

                {latestTxHash ? (
                    <div className="mt-4 rounded-[12px] border border-[#4db8a8] bg-[#e8f5f2] px-4 py-3 text-sm text-[#1a5c52]">
                        Latest payment tx: {" "}
                        <a className="font-semibold underline" href={getExplorerUrl(latestTxHash)} target="_blank" rel="noreferrer">
                            {latestTxHash}
                        </a>
                    </div>
                ) : null}

                {error ? (
                    <div className="mt-4 rounded-[12px] border border-[#fecaca] bg-[#fee2e2] px-4 py-3 text-sm text-[#991b1b]">{error}</div>
                ) : null}

                <div className="mt-4 grid gap-4 lg:grid-cols-[340px_1fr]">
                    {isAdmin ? (
                        <section className="section">
                            <div className="section-head">
                                <p className="label">Assignment</p>
                                <h2 className="mt-1.5 text-base font-semibold">Assign task</h2>
                                <p className="mt-1.5 text-sm text-[var(--muted)]">Route work to a registered employee and set a due date.</p>
                            </div>
                            <div className="section-body">
                                <form onSubmit={handleCreateTask} className="space-y-4">
                                    <input className="field" name="title" placeholder="Title" value={form.title} onChange={handleChange} required />
                                    <textarea className="field min-h-28" name="description" placeholder="Description" rows="4" value={form.description} onChange={handleChange} />
                                    <select className="field" name="assignedTo" value={form.assignedTo} onChange={handleChange} required>
                                        <option value="">Assign to registered employee</option>
                                        {employees.map((employee) => (
                                            <option key={employee._id} value={employee._id}>
                                                {employee.name} ({employee.email})
                                            </option>
                                        ))}
                                    </select>
                                    <input className="field" type="date" name="dueDate" value={form.dueDate} onChange={handleChange} />
                                    <button className="button-primary w-full" type="submit">Assign task</button>
                                </form>
                            </div>
                        </section>
                    ) : (
                        <section className="section">
                            <div className="section-head">
                                <p className="label">Employee actions</p>
                                <h2 className="mt-1.5 text-base font-semibold">Submit proof</h2>
                                <p className="mt-1.5 text-sm text-[var(--muted)]">Use the proof field on each assigned task to move it forward.</p>
                            </div>
                            <div className="section-body">
                                <div className="rounded-[10px] border border-[var(--line)] bg-[var(--soft)] px-3 py-3 text-sm text-[var(--muted)]">
                                    Only tasks in Assigned status accept proof submissions.
                                </div>
                            </div>
                        </section>
                    )}

                    <section className="section">
                        <div className="section-head">
                            <p className="label">Task list</p>
                            <h2 className="mt-1.5 text-base font-semibold">Current tasks</h2>
                            <p className="mt-1.5 text-sm text-[var(--muted)]">Track assigned work, submissions, and approved items.</p>
                        </div>
                        <div className="section-body space-y-2.5">
                            {tasks.length === 0 ? (
                                <p className="text-sm text-[var(--muted)]">No tasks available.</p>
                            ) : (
                                tasks.map((task) => (
                                    <article key={task._id} className="rounded-[12px] border border-[var(--line)] bg-white px-3.5 py-3">
                                        {editingTaskId === task._id ? (
                                            <div className="space-y-3">
                                                <input className="field" name="title" value={editForm.title} onChange={handleEditChange} />
                                                <textarea className="field min-h-24" rows="3" name="description" value={editForm.description} onChange={handleEditChange} />
                                                <select className="field" name="assignedTo" value={editForm.assignedTo} onChange={handleEditChange}>
                                                    <option value="">Assign to employee</option>
                                                    {employees.map((employee) => (
                                                        <option key={employee._id} value={employee._id}>
                                                            {employee.name}
                                                        </option>
                                                    ))}
                                                </select>
                                                <input className="field" type="date" name="dueDate" value={editForm.dueDate} onChange={handleEditChange} />
                                                <div className="flex flex-wrap gap-2">
                                                    <button className="button-primary px-3 py-2" type="button" onClick={() => handleUpdateTask(task._id)}>
                                                        Save
                                                    </button>
                                                    <button className="button-secondary px-3 py-2" type="button" onClick={cancelEditTask}>
                                                        Cancel
                                                    </button>
                                                </div>
                                            </div>
                                        ) : (
                                            <div className="space-y-3">
                                                <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                                                    <div className="min-w-0">
                                                        <div className="flex flex-wrap items-center gap-3">
                                                            <p className="font-medium text-[var(--ink)]">{task.title}</p>
                                                            <span className={`status ${statusClass[task.status] || statusClass.Assigned}`}>{task.status}</span>
                                                        </div>
                                                        <p className="mt-1.5 text-sm text-[var(--muted)]">{task.description || "No description"}</p>
                                                        <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-xs text-[var(--muted)]">
                                                            <span>Assigned: {task.assignedTo?.name || "Unassigned"}</span>
                                                            <span>Wallet: {task.assignedTo?.walletAddress || "Not provided"}</span>
                                                            <span>Due: {task.dueDate ? new Date(task.dueDate).toLocaleDateString() : "Not set"}</span>
                                                        </div>
                                                        {task.proofUrl ? (
                                                            <p className="mt-2.5 break-all text-xs text-[var(--muted)]">
                                                                Proof: <a className="underline decoration-[var(--line)] underline-offset-4" href={task.proofUrl} target="_blank" rel="noreferrer">{task.proofUrl}</a>
                                                            </p>
                                                        ) : null}
                                                        {task.txHash ? (
                                                            <p className="mt-2 break-all text-xs text-[var(--muted)]">
                                                                Payment Tx: <a className="underline decoration-[var(--line)] underline-offset-4" href={getExplorerUrl(task.txHash)} target="_blank" rel="noreferrer">{task.txHash}</a>
                                                            </p>
                                                        ) : null}
                                                    </div>

                                                    <div className="flex items-center gap-2">
                                                        {isAdmin && task.status !== "Approved" ? (
                                                            <>
                                                                <button className="icon-button" type="button" aria-label="Edit task" title="Edit" onClick={() => startEditTask(task)}>
                                                                    <EditIcon />
                                                                </button>
                                                                <button className="icon-button" type="button" aria-label="Delete task" title="Delete" onClick={() => handleDeleteTask(task._id)}>
                                                                    <DeleteIcon />
                                                                </button>
                                                            </>
                                                        ) : null}
                                                    </div>
                                                </div>

                                                {isAdmin && task.status === "Submitted" ? (
                                                    <button className="button-primary w-fit px-3 py-2" type="button" onClick={() => handleApproveTask(task)}>
                                                        Approve
                                                    </button>
                                                ) : null}

                                                {!isAdmin && task.status === "Assigned" ? (
                                                    <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
                                                        <input
                                                            className="field"
                                                            placeholder="Proof URL"
                                                            value={proofUrlMap[task._id] || ""}
                                                            onChange={(event) => setProofUrlMap((current) => ({ ...current, [task._id]: event.target.value }))}
                                                        />
                                                        <button className="button-primary px-3 py-2" type="button" onClick={() => handleSubmitProof(task)}>
                                                            Submit
                                                        </button>
                                                    </div>
                                                ) : null}
                                            </div>
                                        )}
                                    </article>
                                ))
                            )}
                        </div>
                    </section>
                </div>
            </div>
        </Layout>
    );
}
