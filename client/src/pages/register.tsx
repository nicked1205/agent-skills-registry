import { useState } from "react";
import { register } from "../api/auth";
import { Link } from "react-router-dom";
import HudCorners from "../components/ui/HudCorners";
import { PublicLayout } from "../components/ui/PublicLayout";
import { validatePassword, validateUsername } from "../utils/validation";

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

  return (
    <PublicLayout>
      <div className="relative w-full p-6 sm:p-8 bg-(--glitch-green-container-bg)">
        <HudCorners
          className="text-(--glitch-green) pointer-events-none"
          offset={0.5}
          length={16}
          strokeWidth={3}
        />

        <h1 className="text-md font-semibold text-zinc-200">
          initialize new user
        </h1>
        <p className="mt-1 mb-3 text-sm text-zinc-500">
          <span className="text-(--glitch-green)">&gt;</span> new here?
          initialize operator
        </p>

        {success ? (
          <p className="text-sm text-zinc-400">
            account created successfully. you can now{" "}
            <Link to="/login" className="text-(--glitch-green) hover:underline">
              log in
            </Link>
            .
          </p>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block mb-1 text-sm text-zinc-500">
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
              <label className="block mb-1 text-sm text-zinc-500">
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
              <label className="block mb-1 text-sm text-zinc-500">
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
              <p className="text-sm text-red-400">
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

            <p className="pt-2 text-sm text-zinc-500">
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
