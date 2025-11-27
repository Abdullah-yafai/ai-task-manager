import React, { useEffect, useState } from "react";
import Modal from "react-modal";
import Loader from "./Loader";

Modal.setAppElement("#root");

export default function TaskModal({ isOpen, onClose, onSaved, initial }) {
  const [title, setTitle] = useState(initial?.title || "");
  const [description, setDescription] = useState(initial?.description || "");
  const [dueDate, setDueDate] = useState(initial?.dueAt ? initial.dueAt.split("T")[0] : "");
  const [priority, setPriority] = useState(initial?.priority || "Medium");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setTitle(initial?.title || "");
    setDescription(initial?.description || "");
    setDueDate(initial?.dueDate ? initial.dueDate.split("T")[0] : "");
    setPriority(initial?.priority || "Medium");
  }, [initial]);

  const submit = () => {
    setLoading(true);
    const payload = { title, description, dueAt:dueDate, priority };
    onSaved(payload).finally(() => setLoading(false));
  };

  return (
    <Modal
      isOpen={isOpen}
      onRequestClose={() => { if(!loading) onClose(); }}
      className="max-w-lg mx-auto mt-24 bg-gray-900 text-white p-6 rounded-lg outline-none"
      overlayClassName="fixed inset-0 bg-black/50 flex items-start justify-center z-50"
    >
      <h3 className="text-xl font-semibold mb-4">{initial ? "Edit Task" : "Create Task"}</h3>

      <input value={title} onChange={e=>setTitle(e.target.value)} placeholder="Title" className="w-full p-3 rounded-md mb-3 bg-gray-800" />
      <textarea value={description} onChange={e=>setDescription(e.target.value)} placeholder="Description" className="w-full p-3 rounded-md mb-3 bg-gray-800" rows={4} />
      <div className="flex gap-3 mb-3">
        <input type="date" value={dueDate} onChange={e=>setDueDate(e.target.value)} className="p-2 rounded-md bg-gray-800" />
        <select value={priority} onChange={e=>setPriority(e.target.value)} className="p-2 rounded-md bg-gray-800">
          <option>Low</option>
          <option>Medium</option>
          <option>High</option>
        </select>
      </div>

      <div className="flex items-center justify-end gap-3">
        <button onClick={onClose} className="px-4 py-2 rounded-md glass">Cancel</button>
        <button onClick={submit} className="px-4 py-2 rounded-md btn-primary" disabled={loading}>
          {loading ? <Loader size={16} /> : (initial ? "Update Task" : "Create Task")}
        </button>
      </div>
    </Modal>
  );
}
