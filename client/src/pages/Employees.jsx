import { useEffect, useState } from "react";
import API from "../services/api";
import Layout from "../components/Layout";

const initialForm = {
    name: "",
    role: "",
    department: "",
    skills: "",
    walletAddress: "",
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

export default function Employees() {
    const [employees, setEmployees] = useState([]);
    const [form, setForm] = useState(initialForm);
    const [error, setError] = useState("");
    const [saving, setSaving] = useState(false);
    const [editingEmployeeId, setEditingEmployeeId] = useState("");
    const [editForm, setEditForm] = useState(initialForm);
    const [updating, setUpdating] = useState(false);

    const fetchEmployees = async () => {
        try {
            const res = await API.get("/employees");
            setEmployees(res.data);
        } catch (err) {
            setError(err.response?.data?.msg || "Failed to load employees");
        }
    };

    useEffect(() => {
        fetchEmployees();
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
            await API.post("/employees", {
                ...form,
                skills: form.skills
                    .split(",")
                    .map((skill) => skill.trim())
                    .filter(Boolean),
            });
            setForm(initialForm);
            await fetchEmployees();
        } catch (err) {
            setError(err.response?.data?.msg || "Failed to create employee");
        } finally {
            setSaving(false);
        }
    };

    const startEdit = (employee) => {
        setError("");
        setEditingEmployeeId(employee._id);
        setEditForm({
            name: employee.name || "",
            role: employee.role || "",
            department: employee.department || "",
            skills: (employee.skills || []).join(", "),
            walletAddress: employee.walletAddress || "",
        });
    };

    const cancelEdit = () => {
        setEditingEmployeeId("");
        setEditForm(initialForm);
    };

    const handleUpdate = async (employeeId) => {
        setUpdating(true);
        setError("");

        try {
            await API.put(`/employees/${employeeId}`, {
                ...editForm,
                skills: editForm.skills
                    .split(",")
                    .map((skill) => skill.trim())
                    .filter(Boolean),
            });

            cancelEdit();
            await fetchEmployees();
        } catch (err) {
            setError(err.response?.data?.msg || "Failed to update employee");
        } finally {
            setUpdating(false);
        }
    };

    const handleDelete = async (employeeId) => {
        const confirmed = window.confirm("Delete this employee?");
        if (!confirmed) {
            return;
        }

        setError("");

        try {
            await API.delete(`/employees/${employeeId}`);
            if (editingEmployeeId === employeeId) {
                cancelEdit();
            }
            await fetchEmployees();
        } catch (err) {
            setError(err.response?.data?.msg || "Failed to delete employee");
        }
    };

    return (
        <Layout>
            <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
                <div className="mb-8">
                    <p className="text-sm font-medium uppercase tracking-[0.3em] text-slate-500">Workforce</p>
                    <h1 className="mt-2 text-3xl font-semibold tracking-tight">Employees</h1>
                </div>

                <div className="grid gap-8 lg:grid-cols-[380px_1fr]">
                    <form onSubmit={handleSubmit} className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                        <h2 className="text-lg font-semibold">Create employee</h2>
                        <div className="mt-4 space-y-4">
                            <input className="w-full rounded-xl border border-slate-300 px-4 py-3" name="name" placeholder="Name" value={form.name} onChange={handleChange} required />
                            <input className="w-full rounded-xl border border-slate-300 px-4 py-3" name="role" placeholder="Role" value={form.role} onChange={handleChange} />
                            <input className="w-full rounded-xl border border-slate-300 px-4 py-3" name="department" placeholder="Department" value={form.department} onChange={handleChange} />
                            <input className="w-full rounded-xl border border-slate-300 px-4 py-3" name="skills" placeholder="Skills, comma separated" value={form.skills} onChange={handleChange} />
                            <input className="w-full rounded-xl border border-slate-300 px-4 py-3" name="walletAddress" placeholder="Wallet address (optional)" value={form.walletAddress} onChange={handleChange} />
                        </div>

                        {error ? <div className="mt-4 rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">{error}</div> : null}

                        <button className="mt-4 w-full rounded-xl bg-slate-950 px-4 py-3 font-medium text-white disabled:opacity-70" type="submit" disabled={saving}>
                            {saving ? "Saving..." : "Save employee"}
                        </button>
                    </form>

                    <section className="rounded-2xl border border-slate-200 bg-white shadow-sm">
                        <div className="border-b border-slate-200 px-5 py-4">
                            <h2 className="text-lg font-semibold">Employee list</h2>
                            <p className="mt-1 text-sm text-slate-500">Employees created by the current admin</p>
                        </div>
                        <div className="divide-y divide-slate-200">
                            {employees.length === 0 ? (
                                <p className="px-5 py-6 text-sm text-slate-500">No employees yet.</p>
                            ) : (
                                employees.map((employee) => (
                                    <div key={employee._id} className="px-5 py-4">
                                        {editingEmployeeId === employee._id ? (
                                            <div className="space-y-3">
                                                <input className="w-full rounded-xl border border-slate-300 px-4 py-2" name="name" value={editForm.name} onChange={handleEditChange} />
                                                <input className="w-full rounded-xl border border-slate-300 px-4 py-2" name="role" value={editForm.role} onChange={handleEditChange} placeholder="Role" />
                                                <input className="w-full rounded-xl border border-slate-300 px-4 py-2" name="department" value={editForm.department} onChange={handleEditChange} placeholder="Department" />
                                                <input className="w-full rounded-xl border border-slate-300 px-4 py-2" name="skills" value={editForm.skills} onChange={handleEditChange} placeholder="Skills, comma separated" />
                                                <input className="w-full rounded-xl border border-slate-300 px-4 py-2" name="walletAddress" value={editForm.walletAddress} onChange={handleEditChange} placeholder="Wallet address" />
                                                <div className="flex gap-2">
                                                    <button className="rounded-xl bg-slate-900 px-4 py-2 text-sm font-medium text-white" type="button" disabled={updating} onClick={() => handleUpdate(employee._id)}>
                                                        {updating ? "Updating..." : "Save"}
                                                    </button>
                                                    <button className="rounded-xl border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700" type="button" onClick={cancelEdit}>
                                                        Cancel
                                                    </button>
                                                </div>
                                            </div>
                                        ) : (
                                            <>
                                                <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
                                                    <div>
                                                        <p className="font-medium text-slate-900">{employee.name}</p>
                                                        <p className="text-sm text-slate-500">
                                                            {employee.role || "Role not set"} · {employee.department || "Department not set"}
                                                        </p>
                                                    </div>
                                                    <p className="text-sm text-slate-500">
                                                        {employee.walletAddress ? employee.walletAddress : "No wallet linked"}
                                                    </p>
                                                </div>
                                                <div className="mt-3 flex flex-wrap gap-2">
                                                    {(employee.skills || []).map((skill) => (
                                                        <span key={skill} className="rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-700">
                                                            {skill}
                                                        </span>
                                                    ))}
                                                </div>
                                                <div className="mt-3 flex gap-2">
                                                    <button className="inline-flex h-9 w-9 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-500 transition hover:border-slate-300 hover:bg-slate-50 hover:text-slate-900" type="button" aria-label="Edit employee" title="Edit" onClick={() => startEdit(employee)}>
                                                        <EditIcon />
                                                    </button>
                                                    <button className="inline-flex h-9 w-9 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-500 transition hover:border-slate-300 hover:bg-slate-50 hover:text-slate-900" type="button" aria-label="Delete employee" title="Delete" onClick={() => handleDelete(employee._id)}>
                                                        <DeleteIcon />
                                                    </button>
                                                </div>
                                            </>
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
