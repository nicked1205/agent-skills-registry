import { useState } from "react";
import { register } from "../api/auth";
import { Link } from "react-router-dom";

export default function Register() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    if (password !== confirm) {
      setError("Passwords do not match");
      return;
    }

    const passwordError = validatePassword(password);
    if (passwordError) {
      setError(passwordError);
      return;
    }

    setLoading(true);

    try {
      await register(username, password);
      setSuccess(true);
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setLoading(false);
    }
  }

  function validatePassword(password: string): string | null {
    if (password.length < 8) {
      return "Password must be at least 8 characters long";
    }

    if (!/\d/.test(password)) {
      return "Password must contain at least one digit";
    }

    if (!/^[a-zA-Z0-9_.]+$/.test(password)) {
      return "Password may only contain letters, numbers, underscores (_), and dots (.)";
    }

    return null;
  }

  return (
    <div className="min-h-screen bg-zinc-950 flex items-center justify-center px-4">
      <div className="w-full max-w-md rounded-xl border border-zinc-800 bg-zinc-900 p-6">
        <h1 className="mb-1 text-xl font-semibold text-zinc-100">
          Create account
        </h1>
        <p className="mb-4 text-xs text-zinc-400">Register a new account</p>

        {success ? (
          <p className="text-xs text-orange-500">
            Account created successfully. You can now{" "}
            <Link to="/login" className="text-orange-500 underline">
              log in
            </Link>
            .
          </p>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-3">
            <div>
              <label className="mb-1 block text-xs text-zinc-300">
                Username
              </label>
              <input
                type="text"
                className="w-full rounded-md border border-zinc-700 bg-zinc-800 px-3 py-1 text-zinc-100 focus:outline-none focus:ring-1 focus:ring-orange-500 text-xs duration-300"
                placeholder="e.g., johndoe"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
              />
            </div>

            <div>
              <label className="mb-1 block text-xs text-zinc-300">
                Password
              </label>
              <input
                type="password"
                className="w-full rounded-md border border-zinc-700 bg-zinc-800 px-3 py-1 text-zinc-100 focus:outline-none focus:ring-1 focus:ring-orange-500 text-xs duration-300"
                placeholder="At least 8 characters, incl. a number"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>

            <div>
              <label className="mb-1 block text-xs text-zinc-300">
                Confirm password
              </label>
              <input
                type="password"
                className="w-full rounded-md border border-zinc-700 bg-zinc-800 px-3 py-1 text-zinc-100 focus:outline-none focus:ring-1 focus:ring-orange-500 text-xs duration-300"
                placeholder="Re-enter your password"
                value={confirm}
                onChange={(e) => setConfirm(e.target.value)}
                required
              />
            </div>

            {error && <p className="text-xs text-red-500">{error}</p>}

            <div className="flex justify-center mt-4">
              <button
                type="submit"
                disabled={loading}
                className="w-1/5 rounded-sm bg-orange-500 py-1 font-medium text-white hover:bg-orange-600 disabled:opacity-50 text-xs hover:cursor-pointer duration-300"
              >
                {loading ? "Creating account…" : "Register"}
              </button>
            </div>

            <p className="text-center text-xs text-zinc-400">
              Already have an account?{" "}
              <Link to="/login" className="text-orange-500 hover:underline">
                Login
              </Link>
            </p>
          </form>
        )}
      </div>
    </div>
  );
}
