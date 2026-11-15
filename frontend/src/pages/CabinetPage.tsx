import { Link } from "react-router-dom";
import Button from "../components/Button";
import Spinner from "../components/Spinner";
import CustomerDashboard from "../components/dashboard/CustomerDashboard";
import ResearcherDashboard from "../components/dashboard/ResearcherDashboard";
import SponsorDashboard from "../components/dashboard/SponsorDashboard";
import { useAuth } from "../hooks/useAuth";
import { getAccountRoleLabel } from "../lib/accounts";

function CabinetPage() {
  const { user, loading } = useAuth();

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
        <div className="card mt-8 p-8">
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

  return (
    <section>
      <div>
        <h1 className="text-4xl font-black tracking-tight">Кабинет</h1>
        <p className="mt-2 text-sm text-stone-600">
          {user.name} · {user.email}
        </p>
        <span className="mt-3 inline-flex rounded-full bg-green-100 px-2.5 py-1 text-[11px] shadow-sm font-bold uppercase tracking-wide text-green-800">
          {getAccountRoleLabel(user.role)}
        </span>
      </div>

      <div className="mt-10">
        {user.role === "CUSTOMER" && <CustomerDashboard />}
        {user.role === "SPONSOR" && <SponsorDashboard />}
        {user.role === "RESEARCHER" && <ResearcherDashboard />}
      </div>
    </section>
  );
}

export default CabinetPage;
