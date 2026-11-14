const LINKS = ["Исследования", "Организации", "Кабинет"];

function Header({ page, onNavigate, onAuth }) {
  const active = page.name === "Проект" ? "Исследования" : page.name;

  return (
    <div className="header-wrap">
      <header className="header">
        {/* Лого + название + слоган — одна большая «невидимая» кнопка */}
        <button
          type="button"
          className="brand"
          aria-label="Гипотеза — на главную"
          onClick={() => onNavigate("Исследования")}
        >
          <span className="brand__logo">г.</span>
          <span className="brand__name">гипотеза</span>
          <span className="brand__tagline">
            наука с вашим
            <br />
            участием
          </span>
        </button>

        <nav className="nav" aria-label="Основная навигация">
          {LINKS.map((name) => (
            <a
              key={name}
              href="#"
              className={`nav__link${active === name ? " nav__link--active" : ""}`}
              aria-current={active === name ? "page" : undefined}
              onClick={(e) => {
                e.preventDefault();
                onNavigate(name);
              }}
            >
              {name}
            </a>
          ))}
        </nav>

        <div className="actions">
          <a
            className="actions__login"
            href="#"
            onClick={(e) => {
              e.preventDefault();
              onAuth();
            }}
          >
            Войти
          </a>
          <button type="button" className="register" onClick={onAuth}>
            Регистрация <span className="register__arrow">→</span>
          </button>
        </div>
      </header>
    </div>
  );
}

export default Header;