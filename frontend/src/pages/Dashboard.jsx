import { useContext, useEffect, useState, useMemo } from "react";
import TaskCard from "../components/TaskCard";
import TaskModal from "../components/TaskModal";
import api from "../utils/api";
import toast from "react-hot-toast";
import { Tab } from "@headlessui/react";
import Swal from "sweetalert2";
import TaskSkeleton from "../components/TaskSkeleton";
import { FaCheckCircle } from "react-icons/fa";
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
      const res = await api.get("/task/get-all?grouped=1");
      const { manual = [], ai = [] } = res.data.data || {};
      console.log(ai)
      setTasks(ai);
      setManualTasks(manual);
    } catch (err) {
      console.error(err);
      toast.error("Failed to fetch tasks");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchTasks(); }, []);

  // console.log(ManualTasks,'ManualTasks')

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
      // find task within groups
      const t = groups.flatMap(g => g.tasks).find(x => x._id === id);
      if (!t) throw new Error("Task not found in groups");
      await api.post(`/task/update/${id}`, { completed: !t.completed });
      fetchTasks();
    } catch (err) {
      console.error(err);
      toast.error("Update failed");
    }
  };

  const groups = useMemo(() => {
    const map = {};
    (tasks || []).forEach((t) => {
      const gid = t.groupId || `${t.meta?.goal || ""}|${t.meta?.startDate || ""}|${t.meta?.duration || ""}`;
      if (!map[gid]) map[gid] = { groupId: gid, meta: t.meta || {}, tasks: [] };
      map[gid].tasks = t.tasks;
    });

    // sort tasks inside each group by day
    return Object.values(map).map((g) => ({
      ...g,
      tasks: g.tasks.slice().sort((a, b) => (a.day ?? 1) - (b.day ?? 1)),
    }));
  }, [tasks]);


  console.log(tasks, 'tasks')
  console.log(groups, 'groups')


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
                `px-4 py-2 rounded-t-lg text-lg transition ${selected
                  ? "bg-gradient-to-r from-purple-500 to-pink-500 text-white"
                  : "bg-gray-800 text-gray-300"
                }`
              }
            >
              Your Tasks
            </Tab>
            <Tab
              className={({ selected }) =>
                `px-4 py-2 rounded-t-lg text-lg transition ${selected
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
                    <TaskCard key={task._id} task={task} onDelete={handleDelete} onToggle={toggleComplete} onEdit={setEditing} setModalOpen={setModalOpen} />
                  ))}
                </div>
              ) : (
                <p>No manual tasks found.</p>
              )}
            </Tab.Panel>

            <Tab.Panel>
              {loading ? (
                <Loader />
              ) : !groups.length ? (
                <p>No AI-generated tasks found.</p>
              ) : (
                <Tab.Group>
                  {/* Goals as sub-tabs */}
                  <Tab.List className="flex flex-wrap gap-2 border-b border-gray-700 mb-4">
                    {groups.map((g) => (
                      <Tab
                        key={g.groupId}
                        className={({ selected }) =>
                          `px-3 py-1.5 rounded-t-md text-sm transition ${selected
                            ? "bg-gradient-to-r from-blue-500 to-cyan-500 text-white"
                            : "bg-gray-800 text-gray-300"
                          }`
                        }
                        title={g.meta?.goal}
                      >
                        {g.meta?.goal?.slice(0, 24) || "Plan"}
                      </Tab>
                    ))}
                  </Tab.List>

                  {/* Panels: each group's tasks day-wise */}
                  <Tab.Panels>
                    {groups.map((g) => {
                      // day-wise grouping
                      const byDay = g.tasks.reduce((acc, t) => {
                        const d = t.day ?? 1;
                        (acc[d] ||= []).push(t);
                        return acc;
                      }, {});
                      const dayKeys = Object.keys(byDay).map(Number).sort((a, b) => a - b);

                      return (
                        <Tab.Panel key={g.groupId}>
                          <section className="glass p-4 rounded-lg">
                            {/* Header */}
                            <div className="flex items-center justify-between mb-3">
                              <div className="text-sm text-white/80 flex flex-wrap gap-x-4 gap-y-1">
                                <span><b>Goal:</b> {g.meta?.goal || "—"}</span>
                                <span><b>Start:</b> {g.meta?.startDate || "—"}</span>
                                {g.meta?.duration != null && <span><b>Days:</b> {g.meta.duration}</span>}
                                {g.meta?.timePerDay != null && (
                                  <span><b>Time/day:</b> {g.meta.timePerDay} mins</span>
                                )}
                              </div>
                            </div>

                            {/* Day-wise lists */}
                            {dayKeys.length ? (
                              <div className="space-y-4">
                                {dayKeys.map((d) => (
                                  <div key={d} className="border-t-2 border-white">
                                    <div className="font-semibold text-white mb-1">Day {d}</div>
                                    <ul className="divide-y divide-white/5">
                                      {byDay[d].map((t) => (
                                        <li key={t._id} className="py-2">
                                          <div className="flex items-center justify-between">
                                            <div className="font-medium text-white">{t.title}</div>
                                            <div className="flex items-center gap-4 flex-col">
                                              {t.priority && (
                                                <span className="text-xs px-2 py-0.5 rounded bg-white/10 capitalize">
                                                  {t.priority}
                                                </span>
                                              )}
                                              {t.completed && (
                                                <FaCheckCircle className="text-green-500 text-lg" title="Completed" />
                                              )}
                                            </div>
                                          </div>
                                          {t.description && (
                                            <p className="text-sm text-white/70 mt-1">{t.description}</p>
                                          )}
                                          <div className="flex items-center gap-4">
                                            {t.effortMins ? (
                                              <p className="text-xs text-white/50 mt-1">
                                                Effort: {t.effortMins} mins
                                              </p>
                                            ) : null}
                                            {t.dueAt ? (
                                              <p className="text-xs text-white/50 mt-1">
                                                Due: {new Date(t.dueAt).toLocaleDateString()}
                                              </p>
                                            ) : null}
                                          </div>

                                          {/* actions */}
                                          <div className="mt-2 flex gap-2">
                                            {t.completed ? "Completed" :
                                              <button onClick={() => toggleComplete(t._id)} className="text-xs underline">
                                                Mark As Completed
                                              </button>
                                            }
                                            <button onClick={() => handleDelete(t._id)} className="text-xs underline text-red-400">
                                              Delete
                                            </button>
                                          </div>
                                        </li>
                                      ))}
                                    </ul>
                                  </div>
                                ))}
                              </div>
                            ) : (
                              <p className="text-sm text-muted">No tasks in this plan.</p>
                            )}
                          </section>
                        </Tab.Panel>
                      );
                    })}
                  </Tab.Panels>
                </Tab.Group>
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
