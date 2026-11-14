import clsx from "clsx";
import { Link, useLocation } from "react-router-dom";

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

  return (
    <header className="border-b border-stone-200 bg-white text-stone-950">
      <div className="mx-auto flex max-w-[1560px] items-center gap-8 px-8 py-5 max-lg:flex-wrap max-lg:gap-4 max-lg:px-5 max-lg:py-4">
        <Link
          to="/"
          aria-label="На главную"
          className="flex items-center gap-3 rounded-md focus-ring"
        >
          <span className="text-3xl font-black">SciStarter</span>
          <span className="ml-1.5 text-xs font-medium text-stone-600 max-lg:hidden">
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
                    ? "text-green-800"
                    : "text-stone-950 hover:text-green-800",
                )}
              >
                {label}
              </Link>
            );
          })}
        </nav>

        <div className="flex items-center gap-6 max-lg:ml-auto">
          <Link
            to="/cabinet"
            className="rounded-md text-sm font-bold text-stone-950 transition-colors hover:text-green-800 focus-ring"
          >
            Войти
          </Link>
          <Link
            to="/cabinet"
            className="inline-flex items-center gap-2 rounded-lg bg-green-800 px-5 py-3 text-sm font-bold text-white transition-colors hover:bg-green-900 focus-ring"
          >
            Регистрация
            <span>→</span>
          </Link>
        </div>
      </div>
    </header>
  );
}

export default Header;
