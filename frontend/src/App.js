import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import Sidebar from "./components/Sidebar";
import Topbar from "./components/Topbar";
import Dashboard from "./pages/Dashboard";
import AiPlanner from "./pages/AiPlanner";
import Login from "./pages/Login";
import Register from "./pages/Register";
import { AuthProvider, AuthContext } from "./Context/AuthContext";
import { useContext } from "react";
import Profile from "./pages/Profile";

function Layout({children, onGenerate}){
  return (
    <div className="flex h-screen">
      <Sidebar />
      <div className="flex-1 flex flex-col">
        <Topbar onGenerate={onGenerate} />
        <main className="flex-1 overflow-auto bg-transparent">{children}</main>
      </div>
    </div>
  );
}

function Protected({ children }) {
  const { user, loadingUser } = useContext(AuthContext);

  if (loadingUser) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-900 text-white">
        <span className="animate-pulse text-lg">Loading...</span>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" />;
  }

  return children;
}

function AppRoutes(){
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="/" element={
        <Protected>
          <Layout>
            <Dashboard />
          </Layout>
        </Protected>
      } />
      <Route path="/ai" element={
        <Protected>
          <Layout>
            <AiPlanner />
          </Layout>
        </Protected>
      } />
      <Route path="/profile" element={
        <Protected>
          <Layout>
            <Profile />
          </Layout>
        </Protected>
      } />
    </Routes>
  );
}

export default function App(){
  return (
    <AuthProvider>
      <Router>
        <AppRoutes />
      </Router>
    </AuthProvider>
  );
}
