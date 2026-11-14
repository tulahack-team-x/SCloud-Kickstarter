import { useState } from "react";
import type { FormEvent } from "react";
import { Link, Navigate, useNavigate } from "react-router-dom";
import Button from "../components/Button";
import { FormField } from "../components/FormField";
import Spinner from "../components/Spinner";
import { useAuth } from "../hooks/useAuth";
import { getApiErrorMessage } from "../lib/api";

function LoginPage() {
  const { user, loading, login } = useAuth();
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (loading) {
    return (
      <div className="mt-12 flex justify-center">
        <Spinner className="size-6 text-green-800" />
      </div>
    );
  }

  if (user) {
    return <Navigate to="/cabinet" replace />;
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSubmitting(true);
    setError(null);

    try {
      await login(email.trim(), password);
      navigate("/cabinet", { replace: true });
    } catch (err) {
      setError(getApiErrorMessage(err, "Не удалось войти"));
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <section className="mx-auto max-w-md">
      <div className="rounded-2xl border border-stone-200 bg-white p-8 shadow-sm">
        <p className="text-xs font-bold uppercase tracking-[0.18em] text-green-800">
          Вход
        </p>
        <h1 className="mt-2 text-3xl font-black tracking-tight">
          С возвращением
        </h1>

        <form onSubmit={handleSubmit} className="mt-8 space-y-5">
          <FormField
            id="login-email"
            label="Email"
            type="email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            placeholder="name@example.test"
            autoComplete="email"
            required
          />

          <FormField
            id="login-password"
            label="Пароль"
            type="password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            autoComplete="current-password"
            required
          />

          {error && (
            <p className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
              {error}
            </p>
          )}

          <Button
            type="submit"
            disabled={submitting}
            className="w-full justify-center"
          >
            {submitting ? "Входим..." : "Войти"}
          </Button>
        </form>

        <p className="mt-4 text-sm text-stone-500">
          Нет профиля?{" "}
          <Link
            to="/register"
            className="font-semibold text-green-800 hover:underline"
          >
            Зарегистрироваться
          </Link>
        </p>
      </div>
    </section>
  );
}

export default LoginPage;
