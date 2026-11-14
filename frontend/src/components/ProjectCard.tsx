import { Link } from "react-router-dom";
import { getOrg, formatMoney, percent, plural } from "../data";
import type { Project } from "../data";

function ProjectCard({ project }: { project: Project }) {
  const org = getOrg(project.orgId);
  const pct = percent(project);
  const projectPath = `/projects/${project.id}`;

  if (!org) return null;

  return (
    <article className="card">
      <Link
        to={projectPath}
        className="card__visual-link"
        tabIndex={-1}
        aria-hidden="true"
      >
        <div className={`visual visual--${project.visual}`}>
          <span className="tag">{project.status}</span>
        </div>
      </Link>

      <div className="card__body">
        <span className="label">{project.category}</span>
        <h3>
          <Link to={projectPath}>{project.title}</Link>
        </h3>
        <p className="card__summary">{project.summary}</p>

        <Link to="/organizations" className="team">
          <span className="avatar">{org.initials}</span>
          {org.name}
        </Link>

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

        <Link className="card-link" to={projectPath}>
          Изучить исследование <span>↗</span>
        </Link>
      </div>
    </article>
  );
}

export default ProjectCard;
