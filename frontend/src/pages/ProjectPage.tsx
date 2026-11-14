import { getOrg, formatMoney, percent, plural } from "../data";

const STAGES = [
  "Постановка задачи и методика",
  "Сбор средств",
  "Лабораторные испытания",
  "Отчёт и открытые данные",
];

function ProjectPage({ project, amount, onSupport, onBack, onOpenTeam }) {
  if (!project) return <p className="empty">Проект не найден.</p>;

  const org = getOrg(project.orgId);
  const pct = percent(project);

  return (
    <section className="section">
      <button type="button" className="text-link back" onClick={onBack}>
        ← Ко всем исследованиям
      </button>

      <div className="project__layout">
        <div className={`visual visual--${project.visual} project__visual`}>
          <span className="tag">{project.status}</span>
        </div>

        <div className="project__info">
          <span className="label">{project.category}</span>
          <h2>{project.title}</h2>
          <p>{project.summary}</p>

          <a
            href={`#organization/${org.id}`}
            className="team"
            onClick={(e) => {
              e.preventDefault();
              onOpenTeam();
            }}
          >
            <span className="avatar">{org.initials}</span>
            {org.name}
          </a>

          <div className="money">
            <strong>{formatMoney(project.raised)}</strong>
            <span>из {formatMoney(project.goal)}</span>
          </div>
          <div
            className="line"
            role="meter"
            aria-label="Сбор средств"
            aria-valuemin={0}
            aria-valuemax={100}
            aria-valuenow={pct}
          >
            <span style={{ width: `${pct}%` }} />
          </div>
          <div className="meta">
            <span>{project.weeks} нед.</span>
            <span>
              {project.backers} {plural(project.backers, ["взнос", "взноса", "взносов"])}
            </span>
          </div>

          <ol className="stages">
            {STAGES.map((s) => (
              <li key={s}>{s}</li>
            ))}
          </ol>

          <button type="button" className="button" onClick={() => onSupport(project.id)}>
            Поддержать · {formatMoney(amount)} (тест)
          </button>
          <p className="hint">Платёж тестовый — деньги не списываются.</p>
        </div>
      </div>
    </section>
  );
}

export default ProjectPage;