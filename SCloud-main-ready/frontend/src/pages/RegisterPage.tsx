import { useState } from "react";
import type { FormEvent } from "react";
import { Link, Navigate, useNavigate } from "react-router-dom";
import Button from "../components/Button";
import { FormField, TextareaField } from "../components/FormField";
import { useAuth } from "../hooks/useAuth";
import { getApiErrorMessage } from "../lib/api";
import { ACCOUNT_ROLE_LABELS } from "../lib/accounts";
import type { AccountRole } from "../types/api";

type RoleOption = {
  role: AccountRole;
  num: string;
  title: string;
  subtitle: string;
  description: string;
};

const ROLE_OPTIONS: RoleOption[] = [
  {
    role: "CUSTOMER",
    num: "01",
    title: "Заказчик",
    subtitle: "Есть задача — нужна научная команда",
    description: "Согласование этапов, отчёты и результаты",
  },
  {
    role: "SPONSOR",
    num: "02",
    title: "Спонсор",
    subtitle: "Хочу поддерживать перспективные идеи",
    description: "Поддержка проектов, ранги и достижения",
  },
  {
    role: "RESEARCHER",
    num: "03",
    title: "Научная команда",
    subtitle: "Проводим исследования и ищем партнёров",
    description: "Публикации, состав команды и входящие запросы",
  },
];

const EMPTY_FORM = {
  name: "",
  email: "",
  password: "",
  company: "",
  teamName: "",
  institution: "",
  city: "",
  direction: "",
  description: "",
  skills: "",
  equipment: "",
};

function RoleCard({ option, onClick }: { option: RoleOption; onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="focus-ring group flex h-full flex-col rounded-2xl border-2 border-stone-200 bg-white p-6 text-left transition hover:border-green-700 hover:bg-green-50"
    >
      <span className="text-xs font-bold tracking-wider text-stone-400">
        {option.num}
      </span>
      <h2 className="mt-6 text-xl font-bold text-stone-950">{option.title}</h2>
      <p className="mt-2 text-sm font-semibold text-stone-700">
        {option.subtitle}
      </p>
      <p className="mt-1 text-sm leading-6 text-stone-500">
        {option.description}
      </p>
    </button>
  );
}

function RegisterPage() {
  const { user, loading, register } = useAuth();
  const navigate = useNavigate();

  const [role, setRole] = useState<AccountRole | null>(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [members, setMembers] = useState<{ name: string; position: string }[]>([]);

  if (!loading && user) {
    return <Navigate to="/cabinet" replace />;
  }

  function updateField(field: keyof typeof EMPTY_FORM, value: string) {
    setForm((current) => ({ ...current, [field]: value }));
  }

  function chooseRole(nextRole: AccountRole) {
    setRole(nextRole);
    setError(null);
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!role) return;

    setSubmitting(true);
    setError(null);

    try {
      await register({
        name: form.name.trim(),
        email: form.email.trim(),
        password: form.password,
        role,
        ...(role === "CUSTOMER" && form.company.trim()
          ? { company: form.company.trim() }
          : {}),
        ...(role === "RESEARCHER"
          ? {
              team: {
                name: form.teamName.trim(),
                institution: form.institution.trim() || undefined,
                city: form.city.trim() || undefined,
                direction: form.direction.trim(),
                description: form.description.trim(),
                skills: form.skills.trim() || undefined,
                equipment: form.equipment.trim() || undefined,
                members: members.map((member) => ({ name: member.name.trim(), position: member.position.trim() })),
              },
            }
          : {}),
      });

      navigate("/cabinet", { replace: true });
    } catch (err) {
      setError(getApiErrorMessage(err, "Не удалось создать профиль"));
    } finally {
      setSubmitting(false);
    }
  }

  if (!role) {
    return (
      <section className="mx-auto max-w-5xl">
        <div className="text-center">
          <p className="text-xs font-bold uppercase tracking-[0.18em] text-green-800">
            Регистрация
          </p>
          <h1 className="mt-3 text-4xl font-black tracking-tight">
            Выберите свою роль в науке
          </h1>
        </div>

        <div className="mt-10 grid gap-4 md:grid-cols-3">
          {ROLE_OPTIONS.map((option) => (
            <RoleCard
              key={option.role}
              option={option}
              onClick={() => chooseRole(option.role)}
            />
          ))}
        </div>

        <p className="mt-8 text-center text-sm text-stone-500">
          Уже есть профиль?{" "}
          <Link
            to="/login"
            className="font-semibold text-green-800 hover:underline"
          >
            Войти
          </Link>
        </p>
      </section>
    );
  }

  const isTeam = role === "RESEARCHER";

  return (
    <section className="mx-auto max-w-3xl">
      <button
        type="button"
        onClick={() => setRole(null)}
        className="text-sm font-semibold text-stone-500 transition-colors hover:text-green-800 focus-ring"
      >
        ← Выбрать роль
      </button>

      <div className="mt-6 rounded-2xl border border-stone-200 bg-white p-8 shadow-sm">
        <p className="text-xs font-bold uppercase tracking-[0.18em] text-green-800">
          {ACCOUNT_ROLE_LABELS[role]}
        </p>
        <h1 className="mt-2 text-3xl font-black tracking-tight">
          {isTeam ? "Регистрация команды" : "Как к вам обращаться?"}
        </h1>
        <p className="mt-2 text-sm leading-6 text-stone-600">
          {isTeam
            ? "Данные руководителя и научной команды."
            : "Имя будет видно команде в запросах и переписке."}
        </p>

        <form onSubmit={handleSubmit} className="mt-8 space-y-5">
          <div className="grid gap-4 sm:grid-cols-2">
            <FormField
              id="name"
              label="Ваше имя"
              value={form.name}
              onChange={(event) => updateField("name", event.target.value)}
              placeholder="Имя и фамилия"
              autoComplete="name"
              maxLength={100}
              required
            />
            <FormField
              id="email"
              label="Email"
              type="email"
              value={form.email}
              onChange={(event) => updateField("email", event.target.value)}
              placeholder="name@example.test"
              autoComplete="email"
              maxLength={254}
              required
            />
          </div>

          <FormField
            id="password"
            label="Пароль"
            type="password"
            value={form.password}
            onChange={(event) => updateField("password", event.target.value)}
            placeholder="Не менее 10 символов"
            autoComplete="new-password"
            minLength={10}
            maxLength={64}
            required
          />

          {role === "CUSTOMER" && (
            <FormField
              id="company"
              label="Компания"
              value={form.company}
              onChange={(event) => updateField("company", event.target.value)}
              placeholder="Можно заказывать как частное лицо"
              minLength={3}
              maxLength={150}
            />
          )}

          {isTeam && (
            <div className="space-y-5 border-t border-stone-100 pt-6">
              <div>
                <h2 className="text-lg font-bold text-stone-950">Команда</h2>
                <p className="mt-1 text-sm text-stone-500">
                  Эти данные создадут профиль научной организации.
                </p>
              </div>

              <FormField
                id="teamName"
                label="Название команды"
                value={form.teamName}
                onChange={(event) =>
                  updateField("teamName", event.target.value)
                }
                placeholder="Лаборатория или исследовательская группа"
                minLength={3}
                maxLength={150}
                required
              />

              <div className="grid gap-4 sm:grid-cols-2">
                <FormField
                  id="institution"
                  label="Организация"
                  value={form.institution}
                  onChange={(event) =>
                    updateField("institution", event.target.value)
                  }
                  placeholder="Университет или институт"
                  maxLength={200}
                />
                <FormField
                  id="city"
                  label="Город"
                  value={form.city}
                  onChange={(event) => updateField("city", event.target.value)}
                  placeholder="Москва"
                  maxLength={100}
                />
              </div>

              <FormField
                id="direction"
                label="Направление"
                value={form.direction}
                onChange={(event) =>
                  updateField("direction", event.target.value)
                }
                placeholder="Например, экология и гидрохимия"
                maxLength={100}
                required
              />

              <TextareaField
                id="description"
                label="Описание команды"
                value={form.description}
                onChange={(event) =>
                  updateField("description", event.target.value)
                }
                placeholder="Чем занимается команда и какие задачи решает"
                minLength={20}
                maxLength={10000}
                required
              />

              <div className="grid gap-4 sm:grid-cols-2">
                <FormField
                  id="skills"
                  label="Навыки"
                  value={form.skills}
                  onChange={(event) =>
                    updateField("skills", event.target.value)
                  }
                  placeholder="Анализ данных, прототипирование"
                  maxLength={2000}
                />
                <FormField
                  id="equipment"
                  label="Оборудование"
                  value={form.equipment}
                  onChange={(event) =>
                    updateField("equipment", event.target.value)
                  }
                  placeholder="Лабораторное оборудование"
                  maxLength={2000}
                />
              </div>
            </div>
          )}

          {isTeam && <div className="space-y-4">
            <h2 className="text-lg font-bold">Состав команды</h2>
            <p className="text-sm text-stone-500">Руководитель добавляется автоматически.</p>
            {members.map((member, index) => <div key={index} className="grid gap-3 sm:grid-cols-2">
              <FormField id={`member-${index}-name`} label={`Участник ${index + 1}: имя`}
                value={member.name} required minLength={2} maxLength={100}
                onChange={(event) => setMembers((items) => items.map((item, i) => i === index ? { ...item, name: event.target.value } : item))} />
              <FormField id={`member-${index}-position`} label={`Участник ${index + 1}: должность`}
                value={member.position} required minLength={2} maxLength={100}
                onChange={(event) => setMembers((items) => items.map((item, i) => i === index ? { ...item, position: event.target.value } : item))} />
              <Button type="button" variant="secondary" onClick={() => setMembers((items) => items.filter((_, i) => i !== index))}>Убрать участника {index + 1}</Button>
            </div>)}
            <Button type="button" variant="secondary" disabled={members.length >= 19}
              onClick={() => setMembers((items) => [...items, { name: "", position: "" }])}>Добавить участника</Button>
          </div>}
          {error && (
            <p className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
              {error}
            </p>
          )}

          <Button
            type="submit"
            disabled={submitting}
            className="w-full justify-center"
          >
            {submitting ? "Создаём профиль..." : "Создать профиль"}
          </Button>
        </form>

        <p className="mt-4 text-sm text-stone-500">
          Уже есть профиль?{" "}
          <Link
            to="/login"
            className="font-semibold text-green-800 hover:underline"
          >
            Войти
          </Link>
        </p>
      </div>
    </section>
  );
}

export default RegisterPage;
