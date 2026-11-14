
import { useMemo, useState } from "react";
import ProjectCard from "../components/ProjectCard";
import { CATEGORIES, getOrg, plural } from "../data";

const AUDIENCES = [
  {
    title: "Спонсорам",
    text: "Поддержка идей и открытые результаты",
    icon: <path d="m12 3 2.5 6.5L21 12l-6.5 2.5L12 21l-2.5-6.5L3 12l6.5-2.5Z" />,
  },
  {
    title: "Компаниям",
    text: "Научная команда под вашу задачу",
    icon: <path d="m12 3 10 6-10 6L2 9Zm-9 11 9 6 9-6M3 18l9 5 9-5" />,
  },
  {
    title: "Исследователям",
    text: "Финансирование и новые заказчики",
    icon: <path d="M9 3h6m-5 0v6L4 19a1 1 0 0 0 1 2h14a1 1 0 0 0 1-2L14 9V3M7 15h10" />,
  },
];

function Hero({ onDemo }) {
  return (
    <section className="hero">
      <div>
        <span className="live">Наука, в которой можно участвовать</span>
        <h1>
          Сегодня — гипотеза.
          <br />
          Завтра — <em>открытие.</em>
        </h1>
        <p>
          Поддерживайте исследования, находите научные команды и получайте
          результаты в понятном формате.
        </p>
        <div className="hero__actions">
          <a
            className="button"
            href="#explore"
            onClick={(e) => {
              e.preventDefault();
              document.getElementById("explore")?.scrollIntoView({ behavior: "smooth" });
            }}
          >
            Поддержать исследование ↗
          </a>
          <button
            type="button"
            className="button button--secondary"
            onClick={() => onDemo("Заказ исследования — раздел в разработке (демо)")}
          >
            Заказать исследование
          </button>
        </div>
        <a
          href="#"
          className="text-link"
          onClick={(e) => {
            e.preventDefault();
            onDemo("Публикация проектов — раздел в разработке (демо)");
          }}
        >
          Вы — исследователь? Опубликуйте проект →
        </a>
      </div>

      <div className="science" aria-hidden="true">
        <div className="orbit">
          <span className="core">г.</span>
          <i className="orb" />
          <i className="orb orb--two" />
        </div>
        <div className="float-note">
          <strong>От вопроса — к доказательству</strong>
          Цель. Команда. Этапы. Результат.
        </div>
      </div>
    </section>
  );
}

function AudienceStrip() {
  return (
    <section className="audience-strip">
      {AUDIENCES.map((a) => (
        <div key={a.title}>
          <svg
            width={22}
            height={22}
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth={1.5}
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden="true"
          >
            {a.icon}
          </svg>
          <span>
            <strong>{a.title}</strong>
            {a.text}
          </span>
        </div>
      ))}
    </section>
  );
}

function CatalogPage({ projects, onOpenProject, onOpenTeam, onDemo }) {
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState(CATEGORIES[0]);

  const visible = useMemo(() => {
    const q = query.trim().toLowerCase();
    return projects.filter((p) => {
      const byCategory = category === CATEGORIES[0] || p.category === category;
      const haystack =
        `${p.title} ${p.summary} ${p.category} ${getOrg(p.orgId)?.name ?? ""}`.toLowerCase();
      return byCategory && (!q || haystack.includes(q));
    });
  }, [projects, query, category]);

  return (
    <>
      <Hero onDemo={onDemo} />
      <AudienceStrip />

      <section id="explore" className="section">
        <div className="section-head">
          <div>
            <span className="eyebrow">НАЙДИТЕ СВОЁ ОТКРЫТИЕ</span>
            <h2>Исследования, меняющие завтра</h2>
            <p>
              {visible.length}{" "}
              {plural(visible.length, ["проект", "проекта", "проектов"])} в
              демонстрационном каталоге
            </p>
          </div>
          <input
            className="search"
            type="search"
            aria-label="Поиск исследований"
            placeholder="Тема, задача или научная команда"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
        </div>

        <div className="filters">
          {CATEGORIES.map((c) => (
            <button
              key={c}
              type="button"
              className={`chip${category === c ? " chip--active" : ""}`}
              aria-pressed={category === c}
              onClick={() => setCategory(c)}
            >
              {c}
            </button>
          ))}
        </div>

        {visible.length > 0 ? (
          <div className="grid">
            {visible.map((p) => (
              <ProjectCard
                key={p.id}
                project={p}
                onOpen={onOpenProject}
                onOpenTeam={onOpenTeam}
              />
            ))}
          </div>
        ) : (
          <p className="empty">
            Ничего не нашлось. Попробуйте изменить запрос или фильтр.
          </p>
        )}
      </section>

      <section className="banner">
        <div>
          <span className="eyebrow">ЕСТЬ ЗАДАЧА ДЛЯ НАУКИ?</span>
          <h3>Расскажите о проблеме — найдём точку старта</h3>
          <p>Черновик задания, подбор команды и согласование этапов до финансирования.</p>
        </div>
        <button
          type="button"
          className="button"
          onClick={() => onDemo("Форма заказа исследования — в разработке (демо)")}
        >
          Сформулировать задачу ↗
        </button>
      </section>
    </>
  );
}

export default CatalogPage;