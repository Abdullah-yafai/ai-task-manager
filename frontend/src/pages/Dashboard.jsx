import { useContext, useEffect, useState } from "react";
import TaskCard from "../components/TaskCard";
import TaskModal from "../components/TaskModal";
import api from "../utils/api";
import toast from "react-hot-toast";
import { Tab } from "@headlessui/react";
import Swal from "sweetalert2";
import TaskSkeleton from "../components/TaskSkeleton";
import Loader from "../components/Loader";
import { AuthContext } from "../Context/AuthContext";


export default function Dashboard() {
  const { user } = useContext(AuthContext);
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [ManualTasks, setManualTasks] = useState([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState(null);

  const fetchTasks = async () => {
    setLoading(true);
    try {
      const res = await api.get("/task/get-all");
      console.log(res)
      const all = res.data.data;
      setTasks(all.filter(t => t.generatedByAI));
      setManualTasks(all.filter(t => !t.generatedByAI));
    } catch (err) {
      console.error(err);
      toast.error("Failed to fetch tasks");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchTasks(); }, []);

  const handleCreate = async (payload) => {
    try {
      setLoading(true);
      const res = await api.post("/task/create", payload);
      toast.success("Task created");
      setModalOpen(false);
      fetchTasks();
    } catch (err) {
      console.error(err);
      toast.error("Create failed");
    } finally {
      setLoading(false);
    }
  };

  const handleUpdate = async (payload) => {
    try {
      setLoading(true);
      await api.post(`/task/update/${editing._id}`, payload);
      toast.success("Task updated");
      setEditing(null);
      setModalOpen(false);
      fetchTasks();
    } catch (err) {
      console.error(err);
      toast.error("Update failed");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    const result = await Swal.fire({
      title: 'Delete task?',
      text: "This can't be undone",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Yes, delete',
    });

    if (!result.isConfirmed) return;
    try {
      await api.delete(`/task/delete/${id}`);
      toast.success("Deleted");
      fetchTasks();
    } catch {
      toast.error("Delete failed");
    }
  };

  const toggleComplete = async (id) => {
    try {
      const t = tasks.find(x => x._id === id);
      await api.post(`/task/update/${id}`, { completed: !t.completed });
      fetchTasks();
    } catch (err) { console.error(err); toast.error("Update failed"); }
  };

  return (
    <div className="p-6 flex-1">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-white">{user.name} Tasks</h1>
          <p className="text-muted">Overview of tasks assigned to you</p>
        </div>

        <div className="flex items-center gap-3">
          <button onClick={() => { setEditing(null); setModalOpen(true); }} className="btn-primary px-4 py-2 rounded-md">+ New Task</button>
        </div>
      </div>
      <div className="min-h-screen bg-gray-950 text-white p-6">

         <Tab.Group>
      <Tab.List className="flex space-x-4 border-b border-gray-700 mb-4">
        <Tab
          className={({ selected }) =>
            `px-4 py-2 rounded-t-lg text-lg transition ${
              selected
                ? "bg-gradient-to-r from-purple-500 to-pink-500 text-white"
                : "bg-gray-800 text-gray-300"
            }`
          }
        >
          Your Tasks
        </Tab>
        <Tab
          className={({ selected }) =>
            `px-4 py-2 rounded-t-lg text-lg transition ${
              selected
                ? "bg-gradient-to-r from-blue-500 to-cyan-500 text-white"
                : "bg-gray-800 text-gray-300"
            }`
          }
        >
          AI Tasks
        </Tab>
      </Tab.List>

      <Tab.Panels>
        <Tab.Panel>
          {loading ? (
            <Loader />
          ) : ManualTasks.length ? (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
              {ManualTasks.map((task) => (
                <TaskCard key={task._id} task={task} />
              ))}
            </div>
          ) : (
            <p>No manual tasks found.</p>
          )}
        </Tab.Panel>

        <Tab.Panel>
          {loading ? (
            <Loader />
          ) : tasks.length ? (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
              {tasks.map((task) => (
                <TaskCard key={task._id} task={task} onDelete={handleDelete} onToggle={toggleComplete} onEdit={setEditing} setModalOpen={setModalOpen}/>
              ))}
            </div>
          ) : (
            <p>No AI-generated tasks found.</p>
          )}
        </Tab.Panel>
      </Tab.Panels>
    </Tab.Group>
      </div>

      <TaskModal isOpen={modalOpen} initial={editing} onClose={() => { setModalOpen(false); setEditing(null); }} onSaved={async (payload) => {
        if (editing) return await handleUpdate(payload);
        return await handleCreate(payload);
      }} />
    </div>
  );
}
