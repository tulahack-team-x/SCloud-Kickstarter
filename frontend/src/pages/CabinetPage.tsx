import { Link, useNavigate } from "react-router-dom";
import Button from "../components/Button";
import Spinner from "../components/Spinner";
import { useAuth } from "../hooks/useAuth";
import { getAccountRoleLabel } from "../lib/accounts";

function CabinetPage() {
  const { user, loading, logout } = useAuth();
  const navigate = useNavigate();

  if (loading) {
    return (
      <div className="mt-12 flex justify-center">
        <Spinner className="size-6 text-green-800" />
      </div>
    );
  }

  if (!user) {
    return (
      <section className="mx-auto max-w-2xl">
        <h1 className="text-4xl font-black tracking-tight">Кабинет</h1>
        <div className="mt-8 rounded-2xl border border-stone-200 bg-white p-8">
          <p className="text-sm text-stone-600">
            Войдите или создайте профиль, чтобы продолжить.
          </p>
          <div className="mt-5 flex flex-wrap gap-3">
            <Button asChild>
              <Link to="/login">Войти</Link>
            </Button>
            <Button asChild variant="secondary">
              <Link to="/register">Регистрация</Link>
            </Button>
          </div>
        </div>
      </section>
    );
  }

  async function handleLogout() {
    await logout();
    navigate("/");
  }

  return (
    <section className="mx-auto max-w-2xl">
      <h1 className="text-4xl font-black tracking-tight">Кабинет</h1>

      <div className="mt-8 rounded-2xl border border-stone-200 bg-white p-8">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.18em] text-green-800">
              {getAccountRoleLabel(user.role)}
            </p>
            <h2 className="mt-2 text-2xl font-bold text-stone-950">
              {user.name}
            </h2>
            <p className="mt-1 text-sm text-stone-500">{user.email}</p>
          </div>

          <Button variant="secondary" onClick={() => void handleLogout()}>
            Выйти
          </Button>
        </div>
      </div>
    </section>
  );
}

export default CabinetPage;
