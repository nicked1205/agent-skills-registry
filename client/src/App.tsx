import { Routes, Route, Navigate } from "react-router-dom";
import Login from "./pages/login";
import Register from "./pages/register";
import Dashboard from "./pages/dashboard";
import SkillDetails from "./pages/skill_details";
import SkillEdit from "./pages/skill-edit";
import ProtectedRoute from "./components/ProtectedRoute";

export default function App() {
  return (
    <>
      <div className="terminal-lines" />
      <Routes>
        {/* add future routes here */}
        <Route path="/" element={<Navigate to="/login" replace />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/skills/:id"
          element={
            <ProtectedRoute>
              <SkillDetails />
            </ProtectedRoute>
          }
        />
        <Route
          path="/skills/:id/edit"
          element={
            <ProtectedRoute>
              <SkillEdit />
            </ProtectedRoute>
          }
        />
      </Routes>
    </>
  );
}
