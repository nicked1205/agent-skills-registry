import { useState } from "react";
import { login } from "../api/auth";
import { Link, useNavigate } from "react-router-dom";

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
    <div className="min-h-screen bg-zinc-100 dark:bg-zinc-950 flex items-center justify-center px-4">
      <div className="w-full max-w-md rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-6">
        <h1 className="mb-1 text-xl font-semibold text-zinc-900 dark:text-zinc-100">
          Sign in
        </h1>
        <p className="mb-4 text-xs text-zinc-600 dark:text-zinc-400">
          Access your account
        </p>

        <form onSubmit={handleSubmit} className="space-y-3">
          <div>
            <label className="mb-1 block text-xs text-zinc-700 dark:text-zinc-300">
              Username
            </label>
            <input
              type="text"
              className="w-full rounded-md border border-zinc-300 dark:border-zinc-700 bg-zinc-100 dark:bg-zinc-800 px-3 py-1 text-zinc-900 dark:text-zinc-100 text-xs focus:outline-none focus:ring-1 focus:ring-orange-500 duration-200 caret-amber-500"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
            />
          </div>

          <div>
            <label className="mb-1 block text-xs text-zinc-700 dark:text-zinc-300">
              Password
            </label>
            <input
              type="password"
              className="w-full rounded-md border border-zinc-300 dark:border-zinc-700 bg-zinc-100 dark:bg-zinc-800 px-3 py-1 text-zinc-900 dark:text-zinc-100 text-xs focus:outline-none focus:ring-1 focus:ring-orange-500 duration-200 caret-amber-500"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          {error && <p className="text-xs text-red-500">{error}</p>}

          <div className="flex justify-center mt-4">
            <button
              type="submit"
              disabled={loading}
              className="w-1/5 rounded-sm bg-orange-500 py-1 font-medium text-white text-xs hover:bg-orange-600 hover:cursor-pointer disabled:opacity-50 duration-300"
            >
              {loading ? "Signing in…" : "Login"}
            </button>
          </div>

          <p className="text-center text-xs text-zinc-600 dark:text-zinc-400">
            Don’t have an account?{" "}
            <Link to="/register" className="text-orange-500 hover:underline">
              Register
            </Link>
          </p>
        </form>
      </div>
    </div>
  );
}
