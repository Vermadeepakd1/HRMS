import { useEffect, useState } from "react";
import Layout from "../components/Layout";
import API from "../services/api";

const RowBadge = ({ children }) => (
    <span className="inline-flex items-center rounded-md border border-[var(--line)] bg-[var(--soft)] px-2 py-0.5 text-[10px] font-semibold uppercase tracking-[0.12em] text-[var(--muted)]">
        {children}
    </span>
);

const IconButton = ({ label, onClick, children }) => (
    <button
        className="icon-button"
        type="button"
        aria-label={label}
        title={label}
        onClick={onClick}
    >
        {children}
    </button>
);

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

export default function Employees() {
    const [employees, setEmployees] = useState([]);
    const [error, setError] = useState("");
    const [editingEmployeeId, setEditingEmployeeId] = useState("");
    const [name, setName] = useState("");

    useEffect(() => {
        (async () => {
            try {
                const res = await API.get("/employees");
                setEmployees(res.data);
            } catch (err) {
                setError(err.response?.data?.msg || "Failed to load employees");
            }
        })();
    }, []);

    const startEdit = (employee) => {
        setError("");
        setEditingEmployeeId(employee._id);
        setName(employee.name || "");
    };

    const cancelEdit = () => {
        setEditingEmployeeId("");
        setName("");
    };

    const handleUpdate = async (employeeId) => {
        try {
            await API.put(`/employees/${employeeId}`, { name, role: "employee" });
            cancelEdit();
            const res = await API.get("/employees");
            setEmployees(res.data);
        } catch (err) {
            setError(err.response?.data?.msg || "Failed to update employee");
        }
    };

    const handleDelete = async (employeeId) => {
        const confirmed = window.confirm("Delete this employee account?");
        if (!confirmed) return;

        try {
            await API.delete(`/employees/${employeeId}`);
            if (editingEmployeeId === employeeId) cancelEdit();
            const res = await API.get("/employees");
            setEmployees(res.data);
        } catch (err) {
            setError(err.response?.data?.msg || "Failed to delete employee");
        }
    };

    return (
        <Layout>
            <div className="page-wrap">
                <section className="page-header">
                    <p className="label">Workforce</p>
                    <div className="mt-2.5">
                        <h1 className="page-title text-[1.7rem] font-semibold">Registered employees</h1>
                        <p className="mt-1.5 max-w-2xl text-sm text-[var(--muted)]">
                            Employees register themselves and appear here for assignment.
                        </p>
                    </div>
                </section>

                {error ? (
                    <div className="mt-4 rounded-[12px] border border-[#fecaca] bg-[#fee2e2] px-4 py-3 text-sm text-[#991b1b]">{error}</div>
                ) : null}

                <section className="section mt-4">
                    <div className="section-head">
                        <p className="label">Directory</p>
                        <h2 className="mt-1.5 text-base font-semibold">Employee accounts</h2>
                    </div>

                    <div className="divide-y divide-[var(--line)]">
                        {employees.length === 0 ? (
                            <p className="px-4 py-6 text-sm text-[var(--muted)]">No employee accounts yet.</p>
                        ) : (
                            employees.map((employee) => (
                                <div key={employee._id} className="px-4 py-3.5">
                                    {editingEmployeeId === employee._id ? (
                                        <div className="grid gap-3 md:grid-cols-[1fr_auto] md:items-center">
                                            <input
                                                className="field"
                                                value={name}
                                                onChange={(event) => setName(event.target.value)}
                                                placeholder="Employee name"
                                            />
                                            <div className="flex gap-2">
                                                <button type="button" className="button-primary px-4 py-2" onClick={() => handleUpdate(employee._id)}>
                                                    Save
                                                </button>
                                                <button type="button" className="button-secondary px-4 py-2" onClick={cancelEdit}>
                                                    Cancel
                                                </button>
                                            </div>
                                        </div>
                                    ) : (
                                        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                                            <div className="min-w-0">
                                                <div className="flex flex-wrap items-center gap-3">
                                                    <p className="font-medium text-[var(--ink)]">{employee.name}</p>
                                                    <RowBadge>{employee.role || "employee"}</RowBadge>
                                                </div>
                                                <p className="mt-1 text-sm text-[var(--muted)]">{employee.email}</p>
                                                <p className="mt-1.5 break-all text-xs text-[var(--muted)]">
                                                    Wallet {employee.walletAddress || "not provided"}
                                                </p>
                                            </div>
                                            <div className="flex gap-2">
                                                <IconButton label="Edit employee" onClick={() => startEdit(employee)}>
                                                    <EditIcon />
                                                </IconButton>
                                                <IconButton label="Delete employee" onClick={() => handleDelete(employee._id)}>
                                                    <DeleteIcon />
                                                </IconButton>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            ))
                        )}
                    </div>
                </section>
            </div>
        </Layout>
    );
}
