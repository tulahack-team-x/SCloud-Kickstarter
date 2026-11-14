import { getOrg, formatMoney, percent, plural } from "../data";

function ProjectCard({ project, onOpen, onOpenTeam }) {
  const org = getOrg(project.orgId);
  const pct = percent(project);

  const open = (e) => {
    e.preventDefault();
    onOpen(project.id);
  };

  return (
    <article className="card">
      <a
        href={`#project/${project.id}`}
        className="card__visual-link"
        tabIndex={-1}
        aria-hidden="true"
        onClick={open}
      >
        <div className={`visual visual--${project.visual}`}>
          <span className="tag">{project.status}</span>
        </div>
      </a>

      <div className="card__body">
        <span className="label">{project.category}</span>
        <h3>
          <a href={`#project/${project.id}`} onClick={open}>
            {project.title}
          </a>
        </h3>
        <p className="card__summary">{project.summary}</p>

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

        <a className="card-link" href={`#project/${project.id}`} onClick={open}>
          Изучить исследование <span>↗</span>
        </a>
      </div>
    </article>
  );
}

export default ProjectCard;