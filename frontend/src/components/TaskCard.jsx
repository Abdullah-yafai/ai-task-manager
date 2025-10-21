import { Dialog } from "@headlessui/react";
import { motion } from "framer-motion";
import { useState } from "react";
import { FaTrash, FaEdit } from "react-icons/fa";

export default function TaskCard({ task, onEdit, onDelete, onToggle, setModalOpen }) {
  const [open, setOpen] = useState(false);
  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.25 }} className="glass p-4 rounded-lg">
      <div className="flex justify-between items-start gap-3 cursor-pointor" onClick={() => setOpen(true)}>
        <div>
          <h3 className={`font-semibold ${task.completed ? "line-through text-gray-400" : ""} text-white`}>{task.title}</h3>
          <p className="text-muted text-sm mt-1">{task.description}</p>
        </div>
        <div className="text-right">
          <div className="text-xs text-muted">Due</div>
          <div className="font-medium text-white" >{new Date(task.dueDate).toLocaleDateString()}</div>
        </div>
      </div>

      <div className="flex items-center justify-between mt-4">
        <div className="flex items-center gap-2">
          <button onClick={() => onToggle(task._id)} className="text-sm text-muted hover:underline ">
            {task.completed ? "Mark Incomplete" : "Mark Complete"}
          </button>
          <div className={`text-xs px-2 py-1 rounded-md text-white ${task.priority === "High" ? "bg-red-600/10" : task.priority === "Medium" ? "bg-yellow-500/10" : "bg-green-700"}`}>{task.priority}</div>
        </div>

        <div className="flex items-center gap-2">
          <button onClick={() => { onEdit(task); setModalOpen(true) }} className="p-2 rounded-md hover:bg-white/5 text-green-700"><FaEdit /></button>
          <button onClick={() => onDelete(task._id)} className="p-2 rounded-md hover:bg-white/5 text-red-400"><FaTrash /></button>
        </div>
      </div>

      <Dialog
        open={open}
        onClose={() => setOpen(false)}
        className="relative z-50"
      >
        {/* Overlay */}
        <div className="fixed inset-0 bg-black/70" aria-hidden="true" />

        {/* Modal Box */}
        <div className="fixed inset-0 flex items-center justify-center p-4">
          <Dialog.Panel className="bg-gray-900 max-w-2xl w-full rounded-2xl shadow-2xl p-6 text-white">
            <Dialog.Title className="text-2xl font-bold mb-4">
              {task.title}
            </Dialog.Title>

            <div className="max-h-[60vh] overflow-y-auto">
              <p className="text-gray-300 whitespace-pre-line leading-relaxed">
                {task.aiPlan}
              </p>
            </div>

            <div className="mt-6 flex justify-between items-center">
              <p className="text-sm text-gray-500">
                Due: {new Date(task.dueDate).toLocaleDateString()}
              </p>
              <button
                onClick={() => setOpen(false)}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-sm rounded-lg transition"
              >
                Close
              </button>
            </div>
          </Dialog.Panel>
        </div>
      </Dialog>

    </motion.div>
  );
}
