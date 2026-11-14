import { useState } from "react";
import type { FormEvent } from "react";
import { apiFetch, getApiErrorMessage } from "../lib/api";
import type { OrganizationView } from "../types/api";
import Button from "./Button";
import { FormField, TextareaField } from "./FormField";

type OrganizationEditFormProps = {
  organization: OrganizationView;
  onSaved: (organization: OrganizationView) => void;
  onCancel: () => void;
};

function OrganizationEditForm({
  organization,
  onSaved,
  onCancel,
}: OrganizationEditFormProps) {
  const [form, setForm] = useState({
    name: organization.name,
    institution: organization.institution ?? "",
    city: organization.city ?? "",
    direction: organization.direction ?? "",
    description: organization.description ?? "",
    skills: organization.skills ?? "",
    equipment: organization.equipment ?? "",
  });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function updateField(field: keyof typeof form, value: string) {
    setForm((current) => ({ ...current, [field]: value }));
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSubmitting(true);
    setError(null);

    try {
      const updated = await apiFetch<OrganizationView>(
        `/organizations/${organization.id}`,
        {
          method: "PATCH",
          body: JSON.stringify({
            team: {
              name: form.name.trim(),
              institution: form.institution.trim() || undefined,
              city: form.city.trim() || undefined,
              direction: form.direction.trim(),
              description: form.description.trim(),
              skills: form.skills.trim() || undefined,
              equipment: form.equipment.trim() || undefined,
            },
            expectedVersion: organization.version,
          }),
        },
      );

      onSaved(updated);
    } catch (err) {
      setError(
        getApiErrorMessage(err, "Не удалось сохранить изменения организации"),
      );
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
        <FormField
          id="organization-name"
          label="Название"
          value={form.name}
          onChange={(event) => updateField("name", event.target.value)}
          minLength={3}
          maxLength={150}
          required
        />

        <div className="grid gap-4 sm:grid-cols-2">
          <FormField
            id="organization-institution"
            label="Организация"
            value={form.institution}
            onChange={(event) => updateField("institution", event.target.value)}
            maxLength={200}
          />
          <FormField
            id="organization-city"
            label="Город"
            value={form.city}
            onChange={(event) => updateField("city", event.target.value)}
            maxLength={100}
          />
        </div>

        <FormField
          id="organization-direction"
          label="Направление"
          value={form.direction}
          onChange={(event) => updateField("direction", event.target.value)}
          maxLength={100}
          required
        />

        <TextareaField
          id="organization-description"
          label="Описание"
          value={form.description}
          onChange={(event) => updateField("description", event.target.value)}
          minLength={20}
          maxLength={10000}
          required
        />

        <div className="grid gap-4 sm:grid-cols-2">
          <FormField
            id="organization-skills"
            label="Навыки"
            value={form.skills}
            onChange={(event) => updateField("skills", event.target.value)}
            maxLength={2000}
          />
          <FormField
            id="organization-equipment"
            label="Оборудование"
            value={form.equipment}
            onChange={(event) => updateField("equipment", event.target.value)}
            maxLength={2000}
          />
        </div>

        {error && (
          <p className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            {error}
          </p>
        )}

      <div className="flex flex-wrap gap-3">
        <Button type="submit" disabled={submitting}>
          {submitting ? "Сохраняем..." : "Сохранить"}
        </Button>
        <Button type="button" variant="secondary" onClick={onCancel}>
          Отмена
        </Button>
      </div>
    </form>
  );
}

export default OrganizationEditForm;
