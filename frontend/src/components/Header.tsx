import clsx from "clsx";
import { Link, useLocation, useNavigate } from "react-router-dom";
import Button from "./Button";
import { ArrowRight } from "lucide-react";
import { useAuth } from "../hooks/useAuth";

const LINKS = [
  {
    label: "Исследования",
    to: "/",
    isActive: (path: string) => path === "/" || path.startsWith("/projects"),
  },
  {
    label: "Организации",
    to: "/organizations",
    isActive: (path: string) => path.startsWith("/organizations"),
  },
  {
    label: "Кабинет",
    to: "/cabinet",
    isActive: (path: string) => path.startsWith("/cabinet"),
  },
];

function Header() {
  const { pathname } = useLocation();
  const navigate = useNavigate();
  const { user, loading, logout } = useAuth();

  async function handleLogout() {
    await logout();
    navigate("/");
  }

  return (
    <header className="border-b border-stone-200 bg-white text-stone-950">
      <div className="mx-auto flex max-w-[1560px] items-center gap-8 px-8 py-5 max-lg:flex-wrap max-lg:gap-4 max-lg:px-5 max-lg:py-4">
        <Link
          to="/"
          aria-label="На главную"
          className="flex flex-col focus-ring"
        >
          <span className="text-2xl font-black">SciStarter</span>
          <span className="text-xs font-medium text-stone-600 max-lg:hidden">
            наука с вашим участием
          </span>
        </Link>

        <nav
          aria-label="Основная навигация"
          className="mx-auto flex gap-7 max-lg:order-3 max-lg:mx-0 max-lg:w-full max-lg:gap-5"
        >
          {LINKS.map(({ label, to, isActive }) => {
            const active = isActive(pathname);

            return (
              <Link
                key={label}
                to={to}
                aria-current={active ? "page" : undefined}
                className={clsx(
                  "rounded-md text-sm font-bold transition-colors focus-ring",
                  active
                    ? "text-green-800 underline underline-offset-4"
                    : "text-stone-950 hover:text-green-800",
                )}
              >
                {label}
              </Link>
            );
          })}
        </nav>

        <div className="flex items-center gap-6 max-lg:ml-auto">
          {!loading &&
            (user ? (
              <>
                <Link
                  to="/cabinet"
                  className="rounded-md text-sm font-bold text-stone-950 transition-colors hover:text-green-800 focus-ring"
                >
                  {user.name}
                </Link>
                <button
                  type="button"
                  onClick={() => void handleLogout()}
                  className="rounded-md text-sm font-bold text-stone-500 transition-colors hover:text-green-800 focus-ring"
                >
                  Выйти
                </button>
              </>
            ) : (
              <>
                <Link
                  to="/login"
                  className="rounded-md text-sm font-bold text-stone-950 transition-colors hover:text-green-800 focus-ring"
                >
                  Войти
                </Link>
                <Button asChild>
                  <Link to="/register">
                    Регистрация
                    <ArrowRight size={16} strokeWidth={3} />
                  </Link>
                </Button>
              </>
            ))}
        </div>
      </div>
    </header>
  );
}

export default Header;
