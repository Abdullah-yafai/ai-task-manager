import { useState } from "react";
import api from "../utils/api";
import LoadingButton from "../components/LoadingButton";
import toast from "react-hot-toast";

export default function AiPlanner() {
  const [plan, setPlan] = useState("");
  const [loading, setLoading] = useState(false);
  const [goal, setGoal] = useState("");

  const generate = async () => {
    if (!goal) return;
    setLoading(true);
    try {
      const res = await api.post("/ai/generate-plan", { goals: [goal], deadlines: [] });
      console.log(res,'ai')
      toast.success(res.data?.message)
      setPlan(res.data?.data || "No plan");
    } catch (err) {
      console.error(err);
      setPlan("Failed to generate plan.");
    } finally { setLoading(false); }
  };

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-2 text-white">AI Planner</h1>
      <p className="text-muted mb-4">Type a goal and let AI build a 7-day plan for you.</p>

      <div className="glass p-4 rounded-lg">
        <textarea value={goal} onChange={e => setGoal(e.target.value)} placeholder="e.g. Build basic AI Task Manager MVP" className="w-full p-3 rounded-md bg-transparent border border-white/5 outline-none text-white" rows={3} />
        <div className="flex gap-3 mt-3">

          <LoadingButton loading={loading} onClick={generate} disabled={loading} className="btn-primary w-full p-3 rounded-md">
            Generate Plan
          </LoadingButton>
          <button onClick={() => { setGoal(""); setPlan(""); }} className="px-4 py-2 rounded-md glass">Clear</button>
        </div>
      </div>

      {plan && (
        <div className="mt-6 glass p-4 rounded-lg whitespace-pre-wrap gradient-card">
          <h3 className="font-semibold mb-2 text-white">Generated Plan</h3>
          <pre className="text-sm text-muted">{plan?.aiPlan}</pre>
        </div>
      )}
    </div>
  );
}
