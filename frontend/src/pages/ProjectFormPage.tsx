import { useState } from "react";
import type { FormEvent } from "react";
import { Link, Navigate, useNavigate, useParams } from "react-router-dom";
import Button from "../components/Button";
import {
  FormField,
  SelectField,
  TextareaField,
} from "../components/FormField";
import { BackLink, PageError, PageLoading } from "../components/PageState";
import { useApiResource } from "../hooks/useApiResource";
import { useAuth } from "../hooks/useAuth";
import { apiFetch, getApiErrorMessage } from "../lib/api";
import { formatKopecks } from "../lib/format";
import type {
  OrganizationView,
  ProjectPageItem,
  ProjectView,
} from "../types/api";

type StageForm = {
  title: string;
  result: string;
  acceptance: string;
  weeks: string;
  budget: string;
};

function emptyStage(): StageForm {
  return {
    title: "",
    result: "",
    acceptance: "",
    weeks: "8",
    budget: "100000",
  };
}

function projectToStageForm(project: ProjectView): StageForm[] {
  return project.stages.map((stage) => ({
    title: stage.title,
    result: stage.result,
    acceptance: stage.acceptance,
    weeks: String(stage.weeks),
    budget: String(Math.round(stage.budgetKopecks / 100)),
  }));
}

function ProjectEditor({
  id,
  projectItem,
  organizations,
}: {
  id?: string;
  projectItem?: ProjectPageItem;
  organizations: OrganizationView[];
}) {
  const project = projectItem?.project;
  const navigate = useNavigate();

  const [form, setForm] = useState({
    organizationId: project?.organizationId ?? organizations[0]?.id ?? "",
    title: project?.title ?? "",
    category: project?.category ?? "",
    summary: project?.summary ?? "",
    hypothesis: project?.hypothesis ?? "",
    method: project?.method ?? "",
    result: project?.result ?? "",
    risks: project?.risks ?? "",
    visibility: project?.visibility ?? "PUBLIC",
  });
  const [stages, setStages] = useState<StageForm[]>(
    project ? projectToStageForm(project) : [emptyStage()],
  );
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const totalBudget = stages.reduce(
    (total, stage) => total + (Number(stage.budget) || 0),
    0,
  );
  const totalWeeks = stages.reduce(
    (total, stage) => total + (Number(stage.weeks) || 0),
    0,
  );

  function updateField(field: keyof typeof form, value: string) {
    setForm((current) => ({ ...current, [field]: value }));
  }

  function updateStage(field: keyof StageForm, index: number, value: string) {
    setStages((current) =>
      current.map((stage, stageIndex) =>
        stageIndex === index ? { ...stage, [field]: value } : stage,
      ),
    );
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!form.organizationId) {
      setError("Выберите научную команду");
      return;
    }

    if (stages.length === 0) {
      setError("Добавьте хотя бы один этап");
      return;
    }

    const invalidStage = stages.find(
      (stage) =>
        !Number.isInteger(Number(stage.weeks)) ||
        Number(stage.weeks) < 1 ||
        Number(stage.weeks) > 520 ||
        !Number.isFinite(Number(stage.budget)) ||
        Number(stage.budget) * 100 < 10000 ||
        Number(stage.budget) * 100 > 1000000000,
    );

    if (invalidStage) {
      setError("Проверьте сроки и бюджеты этапов");
      return;
    }

    setSubmitting(true);
    setError(null);

    const draft = {
      organizationId: form.organizationId,
      title: form.title.trim(),
      category: form.category.trim(),
      summary: form.summary.trim(),
      hypothesis: form.hypothesis.trim(),
      method: form.method.trim(),
      result: form.result.trim(),
      risks: form.risks.trim(),
      visibility: form.visibility,
      stages: stages.map((stage) => ({
        title: stage.title.trim(),
        result: stage.result.trim(),
        acceptance: stage.acceptance.trim(),
        weeks: Number(stage.weeks),
        budgetKopecks: Math.round(Number(stage.budget) * 100),
      })),
    };

    try {
      const saved = project
        ? await apiFetch<ProjectView>(`/projects/${id}`, {
            method: "PUT",
            body: JSON.stringify({
              project: draft,
              expectedVersion: project.version,
            }),
          })
        : await apiFetch<ProjectView>("/projects", {
            method: "POST",
            body: JSON.stringify(draft),
          });

      navigate(`/projects/${saved.id}`, { replace: true });
    } catch (err) {
      setError(getApiErrorMessage(err, "Не удалось сохранить исследование"));
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <section className="mx-auto max-w-4xl">
      <BackLink to={project ? `/projects/${project.id}` : "/cabinet"}>
        {project ? "К проекту" : "В кабинет"}
      </BackLink>

      <div className="mt-6">
        <h1 className="text-3xl font-black tracking-tight text-stone-950">
          {project ? "Редактировать исследование" : "Новое исследование"}
        </h1>
        <p className="mt-2 text-sm text-stone-500">
          {project
            ? "Черновик можно менять до публикации."
            : "Создайте черновик, проверьте данные и опубликуйте проект."}
        </p>
      </div>

      <form onSubmit={handleSubmit} className="mt-8 space-y-6">
        <section className="card p-6">
          <h2 className="text-lg font-bold text-stone-950">Паспорт</h2>

          <div className="mt-5 space-y-5">
            <SelectField
              id="project-organization"
              label="Научная команда"
              value={form.organizationId}
              onChange={(event) =>
                updateField("organizationId", event.target.value)
              }
              disabled={!!project}
              hint={
                project ? "Команду нельзя сменить после создания проекта." : undefined
              }
              required
            >
              {organizations.map((organization) => (
                <option key={organization.id} value={organization.id}>
                  {organization.name}
                </option>
              ))}
            </SelectField>

            <FormField
              id="project-title"
              label="Название исследования"
              value={form.title}
              onChange={(event) => updateField("title", event.target.value)}
              minLength={8}
              maxLength={200}
              required
            />

            <div className="grid gap-4 sm:grid-cols-2">
              <FormField
                id="project-category"
                label="Направление"
                value={form.category}
                onChange={(event) => updateField("category", event.target.value)}
                placeholder="Например, экология"
                maxLength={100}
                required
              />

              <SelectField
                id="project-visibility"
                label="Формат исследования"
                value={form.visibility}
                onChange={(event) =>
                  updateField("visibility", event.target.value)
                }
              >
                <option value="PUBLIC">Публичный проект</option>
                <option value="PRIVATE">Закрытый проект</option>
              </SelectField>
            </div>

            <TextareaField
              id="project-summary"
              label="Краткое описание"
              value={form.summary}
              onChange={(event) => updateField("summary", event.target.value)}
              minLength={30}
              maxLength={5000}
              required
            />
          </div>
        </section>

        <section className="card p-6">
          <h2 className="text-lg font-bold text-stone-950">
            Гипотеза и результат
          </h2>

          <div className="mt-5 space-y-5">
            <TextareaField
              id="project-hypothesis"
              label="Гипотеза"
              value={form.hypothesis}
              onChange={(event) =>
                updateField("hypothesis", event.target.value)
              }
              minLength={10}
              maxLength={5000}
              required
            />
            <TextareaField
              id="project-method"
              label="Методика"
              value={form.method}
              onChange={(event) => updateField("method", event.target.value)}
              minLength={10}
              maxLength={5000}
              required
            />
            <TextareaField
              id="project-result"
              label="Ожидаемый результат"
              value={form.result}
              onChange={(event) => updateField("result", event.target.value)}
              minLength={10}
              maxLength={5000}
              required
            />
            <TextareaField
              id="project-risks"
              label="Риски и ограничения"
              value={form.risks}
              onChange={(event) => updateField("risks", event.target.value)}
              minLength={10}
              maxLength={5000}
              required
            />
          </div>
        </section>

        <section className="card p-6">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <h2 className="text-lg font-bold text-stone-950">Этапы</h2>
            <Button
              type="button"
              variant="secondary"
              compact
              onClick={() => setStages((current) => [...current, emptyStage()])}
              disabled={stages.length >= 20}
            >
              Добавить этап
            </Button>
          </div>

          <div className="mt-5 space-y-4">
            {stages.map((stage, index) => (
              <fieldset
                key={index}
                className="rounded-xl border border-stone-200 p-4"
              >
                <div className="flex items-center justify-between gap-3">
                  <legend className="text-sm font-bold text-stone-950">
                    Этап {index + 1}
                  </legend>

                  {stages.length > 1 && (
                    <button
                      type="button"
                      onClick={() =>
                        setStages((current) =>
                          current.filter((_, stageIndex) => stageIndex !== index),
                        )
                      }
                      className="text-xs font-semibold text-red-600 hover:underline focus-ring"
                    >
                      Удалить
                    </button>
                  )}
                </div>

                <div className="mt-4 space-y-4">
                  <FormField
                    id={`stage-title-${index}`}
                    label="Название этапа"
                    value={stage.title}
                    onChange={(event) =>
                      updateStage("title", index, event.target.value)
                    }
                    maxLength={200}
                    required
                  />
                  <TextareaField
                    id={`stage-result-${index}`}
                    label="Результат этапа"
                    value={stage.result}
                    onChange={(event) =>
                      updateStage("result", index, event.target.value)
                    }
                    maxLength={5000}
                    required
                  />
                  <TextareaField
                    id={`stage-acceptance-${index}`}
                    label="Критерий приёмки"
                    value={stage.acceptance}
                    onChange={(event) =>
                      updateStage("acceptance", index, event.target.value)
                    }
                    maxLength={5000}
                    required
                  />

                  <div className="grid gap-4 sm:grid-cols-2">
                    <FormField
                      id={`stage-budget-${index}`}
                      label="Бюджет, ₽"
                      type="number"
                      min={100}
                      max={10000000}
                      step={100}
                      value={stage.budget}
                      onChange={(event) =>
                        updateStage("budget", index, event.target.value)
                      }
                      required
                    />
                    <FormField
                      id={`stage-weeks-${index}`}
                      label="Срок, недель"
                      type="number"
                      min={1}
                      max={520}
                      value={stage.weeks}
                      onChange={(event) =>
                        updateStage("weeks", index, event.target.value)
                      }
                      required
                    />
                  </div>
                </div>
              </fieldset>
            ))}
          </div>

          <div className="mt-5 rounded-xl bg-stone-50 px-4 py-3 text-sm text-stone-600">
            Итого: <strong className="text-stone-950">{formatKopecks(totalBudget * 100)}</strong>{" "}
            · {totalWeeks} недель
          </div>
        </section>

        {error && (
          <p className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            {error}
          </p>
        )}

        <div className="flex flex-wrap gap-3">
          <Button type="submit" disabled={submitting}>
            {submitting
              ? "Сохраняем..."
              : project
                ? "Сохранить изменения"
                : "Создать исследование"}
          </Button>
          <Button asChild variant="secondary">
            <Link to={project ? `/projects/${project.id}` : "/cabinet"}>
              Отмена
            </Link>
          </Button>
        </div>
      </form>
    </section>
  );
}

function ProjectFormContent({ id }: { id?: string }) {
  const { user, loading: authLoading, organizations } = useAuth();
  const projectResource = useApiResource<ProjectPageItem>(
    id ? `/projects/${id}` : null,
  );

  if (authLoading || projectResource.loading) {
    return <PageLoading />;
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (user.role !== "RESEARCHER") {
    return (
      <section className="mx-auto max-w-2xl">
        <BackLink to="/cabinet">В кабинет</BackLink>
        <div className="mt-6">
          <PageError
            message="Создавать исследования могут только научные команды."
            onRetry={() => window.history.back()}
          />
        </div>
      </section>
    );
  }

  if (projectResource.error || (id && !projectResource.data)) {
    return (
      <section className="mx-auto max-w-2xl">
        <BackLink to="/cabinet">В кабинет</BackLink>
        <div className="mt-6">
          <PageError
            message={projectResource.error ?? "Проект не найден"}
            onRetry={projectResource.reload}
          />
        </div>
      </section>
    );
  }

  const projectItem = projectResource.data ?? undefined;
  const scientificOrganizations = organizations.filter(
    (organization) => organization.type === "SCIENTIFIC",
  );

  if (projectItem && projectItem.project.status !== "DRAFT") {
    return (
      <section className="mx-auto max-w-2xl">
        <BackLink to={`/projects/${projectItem.project.id}`}>К проекту</BackLink>
        <div className="mt-6 rounded-2xl border border-stone-200 bg-white p-6">
          <p className="text-sm text-stone-600">
            Опубликованный проект нельзя редактировать.
          </p>
        </div>
      </section>
    );
  }

  return (
    <ProjectEditor
      key={id ?? "new"}
      id={id}
      projectItem={projectItem}
      organizations={scientificOrganizations}
    />
  );
}

function ProjectFormPage() {
  const { id } = useParams();
  return <ProjectFormContent key={id ?? "new"} id={id} />;
}

export default ProjectFormPage;
