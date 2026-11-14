import { ORGANIZATIONS } from "../data";

function OrganizationsPage({ projects, onOpenProject }) {
  return (
    <section className="section">
      <div className="section-head">
        <div>
          <span className="eyebrow">НАУЧНЫЕ КОМАНДЫ</span>
          <h2>Организации</h2>
          <p>{ORGANIZATIONS.length} команды в демонстрационном каталоге</p>
        </div>
      </div>

      <div className="grid">
        {ORGANIZATIONS.map((org) => (
          <article className="card" key={org.id}>
            <div className="card__body">
              <span className="avatar avatar--big">{org.initials}</span>
              <h3>{org.name}</h3>
              <span className="label">{org.field}</span>
              <p className="card__summary">{org.about}</p>

              <div className="org-card__projects">
                {projects
                  .filter((p) => p.orgId === org.id)
                  .map((p) => (
                    <a
                      key={p.id}
                      href={`#project/${p.id}`}
                      className="text-link"
                      onClick={(e) => {
                        e.preventDefault();
                        onOpenProject(p.id);
                      }}
                    >
                      {p.title} →
                    </a>
                  ))}
              </div>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}

export default OrganizationsPage;