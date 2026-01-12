import { useState } from "react";
import { login } from "../api/auth";
import { Link, useNavigate } from "react-router-dom";
import HudCorners from "../components/ui/HudCorners";
import { PublicLayout } from "../components/ui/PublicLayout";

export default function Login() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const token = await login(username, password);
      localStorage.setItem("token", token);
      navigate("/dashboard");
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <PublicLayout>
      <div className="relative w-full p-6 sm:p-8 bg-(--glitch-green-container-bg)">
        <HudCorners
          className="text-(--glitch-green) pointer-events-none"
          offset={0.5}
          length={16}
          strokeWidth={3}
        />

        <h1 className="text-sm font-semibold text-zinc-200">resume session</h1>
        <p className="mt-1 mb-3 text-xs text-zinc-500">
          <span className="text-(--glitch-green)">&gt;</span> existing operator?
          authenticate
        </p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block mb-1 text-xs text-zinc-500">username</label>
            <input
              type="text"
              className="w-full input-glitch-green"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
            />
          </div>

          <div>
            <label className="block mb-1 text-xs text-zinc-500">password</label>
            <input
              type="password"
              className="w-full input-glitch-green"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>

          {error && (
            <p className="text-xs text-red-400">error: {error.toLowerCase()}</p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full btn-glitch-green"
          >
            {loading ? "authenticating…" : "login"}
          </button>

          <p className="pt-2 text-xs text-zinc-500">
            no account?{" "}
            <Link
              to="/register"
              className="text-(--glitch-green) hover:underline"
            >
              register
            </Link>
          </p>
        </form>
      </div>
    </PublicLayout>
  );
}
