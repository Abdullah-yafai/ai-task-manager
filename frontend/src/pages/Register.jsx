import { useContext, useState } from "react";
import { AuthContext } from "../Context/AuthContext";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import LoadingButton from "../components/LoadingButton";

export default function Register() {
  const { register,loadingAuth } = useContext(AuthContext);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  
  const nav = useNavigate();
  const [err, setErr] = useState("");

  const submit = async (e) => {
    e.preventDefault();
    try {
      await register(name, email, password);
      nav("/");
    } catch (error) {
      setErr(error.response?.data?.message || "Registration failed");
    }
  };

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex items-center justify-center h-screen">
      <div className="w-full max-w-md glass p-8 rounded-lg">
        <h2 className="text-2xl font-bold mb-4 text-white">Create account</h2>
        {err && <div className="text-sm text-red-400 mb-2">{err}</div>}
        <form onSubmit={submit} className="space-y-3">
          <input value={name} onChange={e => setName(e.target.value)} className="w-full p-3 rounded-md bg-transparent border border-white/5 outline-none text-white" placeholder="Name" />
          <input value={email} onChange={e => setEmail(e.target.value)} className="w-full p-3 rounded-md bg-transparent border border-white/5 outline-none text-white" placeholder="Email" />
          <input value={password} onChange={e => setPassword(e.target.value)} type="password" className="w-full p-3 rounded-md bg-transparent border border-white/5 outline-none text-white" placeholder="Password" />
          <LoadingButton loading={loadingAuth} className="btn-primary w-full p-3 rounded-md">
            Register
          </LoadingButton>
        </form>
      </div>
    </motion.div>
  );
}
