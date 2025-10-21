import { useEffect, useState } from "react";
import api from "../utils/api";
import { toast } from "react-toastify";
import Loader from "../components/Loader";
import LoadingButton from "../components/LoadingButton";

export default function Profile() {
    const [profile, setProfile] = useState(null);
    const [loading, setLoading] = useState(true);
    const [name, setName] = useState("");

    const fetchProfile = async () => {
        setLoading(true);
        try {
            const res = await api.get("/auth/me"); // make sure backend supports this
            setProfile(res.data);
            setName(res.data.name);
        } catch (err) {
            console.error(err);
            toast.error("Failed to load profile");
        } finally { setLoading(false); }
    };

    useEffect(() => { fetchProfile(); }, []);

    const update = async () => {
        try {
            const res = await api.put("/auth/me", { name });
            toast.success("Profile updated");
            setProfile(res.data);
        } catch (err) {
            console.error(err);
            toast.error("Update failed");
        }
    };

    if (loading) return <div className="p-6"><Loader /></div>;

    return (
        <div className="p-6">
            <h1 className="text-2xl font-bold text-white">Profile</h1>
            <div className="mt-4 glass p-4 rounded-lg max-w-md">
                <label className="text-sm text-muted">Name</label>
                <input className="w-full p-3 rounded-md bg-transparent border border-white/5 mt-1" value={name} onChange={e => setName(e.target.value)} />
                <div className="flex gap-3 mt-4">
                    <LoadingButton loading={loading} onClick={update} className="btn-primary w-full p-3 rounded-md">
                        Save
                    </LoadingButton>
                </div>
            </div>
        </div>
    );
}
