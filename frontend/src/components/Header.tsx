import { Link, useLocation } from "react-router-dom";

const LINKS = [
  { label: "Исследования", to: "/" },
  { label: "Организации", to: "/organizations" },
  { label: "Кабинет", to: "/cabinet" },
];

function Header() {
  const { pathname } = useLocation();

  const active =
    pathname === "/" || pathname.startsWith("/projects")
      ? "Исследования"
      : pathname.startsWith("/organizations")
        ? "Организации"
        : pathname.startsWith("/cabinet")
          ? "Кабинет"
          : "";

  return (
    <div className="header-wrap">
      <header className="header">
        <Link className="brand" to="/" aria-label="На главную">
          <span className="brand__name">SCloud - kickStarter</span>
          <span className="brand__tagline">наука с вашим участием</span>
        </Link>

        <nav className="nav" aria-label="Основная навигация">
          {LINKS.map(({ label, to }) => (
            <Link
              key={label}
              to={to}
              className={`nav__link${active === label ? " nav__link--active" : ""}`}
              aria-current={active === label ? "page" : undefined}
            >
              {label}
            </Link>
          ))}
        </nav>

        <div className="actions">
          <Link className="actions__login" to="/cabinet">
            Войти
          </Link>
          <Link className="register" to="/cabinet">
            Регистрация <span className="register__arrow">→</span>
          </Link>
        </div>
      </header>
    </div>
  );
}

export default Header;
