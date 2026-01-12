import { useState } from "react";
import { register } from "../api/auth";
import { Link } from "react-router-dom";
import HudCorners from "../components/ui/HudCorners";
import { PublicLayout } from "../components/ui/PublicLayout";

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

    const usernameError = validateUsername(username);
    if (usernameError) {
      setError(usernameError);
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

    if (!/[a-zA-Z]/.test(password)) {
      return "Password must contain at least one letter";
    }

    if (!/\d/.test(password)) {
      return "Password must contain at least one digit";
    }

    return null;
  }

  function validateUsername(username: string): string | null {
    if (username.length < 3 || username.length > 100) {
      return "Username must be between 3 and 100 characters long";
    }

    if (!/^[a-zA-Z0-9_.]+$/.test(username)) {
      return "Username may only contain letters, numbers, underscores (_), and dots (.)";
    }
    return null;
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

        <h1 className="text-sm font-semibold text-zinc-200">
          initialize new user
        </h1>
        <p className="mt-1 mb-3 text-xs text-zinc-500">
          <span className="text-(--glitch-green)">&gt;</span> new here?
          initialize operator
        </p>

        {success ? (
          <p className="text-xs text-zinc-400">
            account created successfully. you can now{" "}
            <Link to="/login" className="text-(--glitch-green) hover:underline">
              log in
            </Link>
            .
          </p>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block mb-1 text-xs text-zinc-500">
                username
              </label>
              <input
                type="text"
                className="w-full input-glitch-green"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
              />
            </div>

            <div>
              <label className="block mb-1 text-xs text-zinc-500">
                password
              </label>
              <input
                type="password"
                className="w-full input-glitch-green"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>

            <div>
              <label className="block mb-1 text-xs text-zinc-500">
                confirm password
              </label>
              <input
                type="password"
                className="w-full input-glitch-green"
                value={confirm}
                onChange={(e) => setConfirm(e.target.value)}
              />
            </div>

            {error && (
              <p className="text-xs text-red-400">
                error: {error.toLowerCase()}
              </p>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full btn-glitch-green"
            >
              {loading ? "creating account…" : "register"}
            </button>

            <p className="pt-2 text-xs text-zinc-500">
              already have an account?{" "}
              <Link
                to="/login"
                className="text-(--glitch-green) hover:underline"
              >
                login
              </Link>
            </p>
          </form>
        )}
      </div>
    </PublicLayout>
  );
}
