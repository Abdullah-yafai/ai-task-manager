import { useState, useMemo } from "react";
import api from "../utils/api";
import LoadingButton from "../components/LoadingButton";
import toast from "react-hot-toast";

const todayISO = () => new Date().toISOString().slice(0, 10);

export default function AiPlanner() {
  // Required fields
  const [goal, setGoal] = useState("");
  const [startDate, setStartDate] = useState(todayISO());
  const [duration, setDuration] = useState(7);

  // Optional but recommended fields
  const [timePerDay, setTimePerDay] = useState(60);
  const [skillLevel, setSkillLevel] = useState("Beginner"); // Beginner | Intermediate | Advanced
  const [constraints, setConstraints] = useState("");
  const [taskType, setTaskType] = useState(""); // e.g., study, workout, coding

  const [plan, setPlan] = useState(null); // will store object
  const [loading, setLoading] = useState(false);

  const isFormValid = useMemo(
    () => goal.trim() && startDate && Number(duration) > 0,
    [goal, startDate, duration]
  );

  const generate = async () => {
    if (!isFormValid) {
      toast.error("Please fill Goal, Start Date, and Duration.");
      return;
    }
    setLoading(true);
    setPlan(null);
    try {
      // Payload the API can pass directly to your LLM prompt
      const payload = {
        goal: goal.trim(),
        startDate, // YYYY-MM-DD
        duration: Number(duration),
        timePerDay: timePerDay ? Number(timePerDay) : undefined,
        skillLevel,
        constraints: constraints?.trim() || undefined,
        taskType: taskType?.trim() || undefined,
      };

      const res = await api.post("/ai/generate-plan", payload);
      // Expecting: res.data?.data to be the plan object
      const planData = res?.data?.data || res?.data; // tolerate either shape
      setPlan(planData || { message: "No plan returned." });

      const msg = res?.data?.message || "Plan generated.";
      toast.success(msg);
    } catch (err) {
      console.error(err);
      toast.error("Failed to generate plan.");
      setPlan({ error: true, message: "Failed to generate plan." });
    } finally {
      setLoading(false);
    }
  };

  console.log(plan, 'plan')

  const clearAll = () => {
    setGoal("");
    setStartDate(todayISO());
    setDuration(7);
    setTimePerDay(60);
    setSkillLevel("Beginner");
    setConstraints("");
    setTaskType("");
    setPlan(null);
  };

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-2 text-white">AI Planner</h1>
      <p className="text-muted mb-4">
        Type your goal and preferences. AI will build a day-by-day plan.
      </p>

      {/* Form */}
      <div className="glass p-4 rounded-lg space-y-3">
        <label className="block">
          <span className="text-sm text-white/80">Goal *</span>
          <textarea
            value={goal}
            onChange={(e) => setGoal(e.target.value)}
            placeholder="e.g. Learn React.js basics"
            className="w-full mt-1 p-3 rounded-md bg-transparent border border-white/10 outline-none text-white"
            rows={3}
          />
        </label>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          <label className="block">
            <span className="text-sm text-white/80">Start Date *</span>
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="w-full mt-1 p-3 rounded-md bg-transparent border border-white/10 outline-none text-white"
            />
          </label>

          <label className="block">
            <span className="text-sm text-white/80">Duration (days) *</span>
            <input
              type="number"
              min={1}
              value={duration}
              onChange={(e) => setDuration(e.target.value)}
              className="w-full mt-1 p-3 rounded-md bg-transparent border border-white/10 outline-none text-white"
              placeholder="7"
            />
          </label>

          <label className="block">
            <span className="text-sm text-white/80">Time per day (minutes)</span>
            <input
              type="number"
              min={5}
              value={timePerDay}
              onChange={(e) => setTimePerDay(e.target.value)}
              className="w-full mt-1 p-3 rounded-md bg-transparent border border-white/10 outline-none text-white"
              placeholder="60"
            />
          </label>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          <label className="block">
            <span className="text-sm text-white/80">Skill Level</span>
            <select
              value={skillLevel}
              onChange={(e) => setSkillLevel(e.target.value)}
              className="w-full mt-1 p-3 rounded-md bg-transparent border border-white/10 outline-none text-white"
            >
              <option className="bg-gray-900">Beginner</option>
              <option className="bg-gray-900">Intermediate</option>
              <option className="bg-gray-900">Advanced</option>
            </select>
          </label>

          <label className="block">
            <span className="text-sm text-white/80">Preferred Task Type (optional)</span>
            <input
              type="text"
              value={taskType}
              onChange={(e) => setTaskType(e.target.value)}
              className="w-full mt-1 p-3 rounded-md bg-transparent border border-white/10 outline-none text-white"
              placeholder="e.g. study, coding, workout"
            />
          </label>

          <div />
        </div>

        <label className="block">
          <span className="text-sm text-white/80">Constraints / Notes (optional)</span>
          <textarea
            value={constraints}
            onChange={(e) => setConstraints(e.target.value)}
            placeholder="e.g. evenings only, rest after 3 days"
            className="w-full mt-1 p-3 rounded-md bg-transparent border border-white/10 outline-none text-white"
            rows={2}
          />
        </label>

        <div className="flex gap-3 pt-1">
          <LoadingButton
            loading={loading}
            onClick={generate}
            disabled={loading || !isFormValid}
            className="btn-primary w-full p-3 rounded-md"
          >
            Generate Plan
          </LoadingButton>
          <button onClick={clearAll} className="px-4 py-2 rounded-md glass">
            Clear
          </button>
        </div>
      </div>

      {/* Output */}
      {Array.isArray(plan?.tasks) && plan?.tasks?.length > 0 && (
        <div className="glass mt-6 p-4 rounded-lg overflow-y-auto max-h-96">
          <h3 className="font-semibold mb-2 text-white">Generated Plan</h3>

          {/* Header from first task's planMeta (if available) */}
          {(() => {
            const meta = plan?.meta || {};
            return (
              <div className="text-sm text-white/80 space-x-4 mb-3">
                <span><span className="font-semibold">Goal:</span> {meta.goal || "—"}</span>
                <span><span className="font-semibold">Start:</span> {meta.startDate || "—"}</span>
                {meta.duration != null && (
                  <span><span className="font-semibold">Duration:</span> {meta.duration} days</span>
                )}
                {meta.timePerDay != null && (
                  <span><span className="font-semibold">Time/day:</span> {meta.timePerDay} mins</span>
                )}
              </div>
            );
          })()}

          {/* Group by day (sorted) */}
          {(() => {
            const byDay = plan?.tasks
              .slice()
              .sort((a, b) => (a.day ?? 1) - (b.day ?? 1))
              .reduce((acc, t) => {
                const d = t.day ?? 1;
                (acc[d] ||= []).push(t);
                return acc;
              }, {});
            const dayKeys = Object.keys(byDay).map(Number).sort((a, b) => a - b);

            return dayKeys.length ? (
              <div className="space-y-4">
                {dayKeys.map((d) => (
                  <div key={d}>
                    <div className="font-semibold text-white mb-1">Day {d}</div>
                    <ul className="divide-y divide-white/5">
                      {byDay[d].map((t) => {
                        const priority = (t.priority || "").toString().toLowerCase();
                        return (
                          <li key={t._id} className="py-2">
                            <div className="flex items-center justify-between">
                              <div className="font-medium text-white">{t.title}</div>
                              {priority && (
                                <span className="text-xs px-2 py-0.5 rounded-full bg-white/10 capitalize">
                                  {priority}
                                </span>
                              )}
                            </div>
                            {t.description && (
                              <p className="text-sm text-white/70 mt-1">{t.description}</p>
                            )}
                            {t.effortMins ? (
                              <p className="text-xs text-white/50 mt-1">
                                Effort: {t.effortMins} mins
                              </p>
                            ) : null}
                          </li>
                        );
                      })}
                    </ul>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-muted">No tasks found.</p>
            );
          })()}
        </div>
      )}

    </div>
  );
}
