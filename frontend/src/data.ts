export interface Organization {
  id: string;
  name: string;
  initials: string;
  field: string;
  about: string;
}

export interface Project {
  id: string;
  title: string;
  summary: string;
  category: string;
  orgId: string;
  status: string;
  visual: string;
  raised: number;
  goal: number;
  weeks: number;
  backers: number;
}

export const CATEGORIES = [
  "Все исследования",
  "Экология",
  "Медицина",
  "ИИ и данные",
  "Материалы",
  "Космос",
] as const;

export const ORGANIZATIONS: Organization[] = [
  {
    id: "bio-lab",
    name: "Лаборатория биосигналов",
    initials: "ЛБ",
    field: "Медицина и нейронауки",
    about:
      "Изучаем, как мозг и тело обмениваются сигналами, и превращаем это в доступные медицинские технологии.",
  },
  {
    id: "clean-water",
    name: "Институт чистой воды",
    initials: "ИЧВ",
    field: "Экология и гидрохимия",
    about:
      "Разрабатываем недорогие сенсоры и методы очистки воды для малых городов и сельских территорий.",
  },
  {
    id: "orbit-lab",
    name: "Орбитальная лаборатория",
    initials: "ОЛ",
    field: "Космос и материаловедение",
    about:
      "Тестируем материалы и биологические образцы в условиях, приближенных к орбитальным.",
  },
  {
    id: "data-health",
    name: "Центр данных о здоровье",
    initials: "ЦДЗ",
    field: "ИИ и анализ данных",
    about:
      "Строим открытые модели для раннего выявления заболеваний по обезличенным медицинским данным.",
  },
];

export const PROJECTS: Project[] = [
  {
    id: "sleep-markers",
    title: "Ранние маркеры нарушений сна",
    summary:
      "Ищем доступные по сну маркеры, которые помогут заметить риск хронической бессонницы до появления серьёзных симптомов.",
    category: "Медицина",
    orgId: "bio-lab",
    status: "Идёт сбор",
    visual: "mint",
    raised: 184000,
    goal: 420000,
    weeks: 12,
    backers: 37,
  },
  {
    id: "water-sensors",
    title: "Недорогие сенсоры качества воды",
    summary:
      "Прототип сенсора, который за несколько минут определяет загрязнение воды и передаёт данные в открытую карту.",
    category: "Экология",
    orgId: "clean-water",
    status: "Идёт сбор",
    visual: "blue",
    raised: 326000,
    goal: 500000,
    weeks: 16,
    backers: 64,
  },
  {
    id: "microplastics",
    title: "Микропластик в городских водоёмах",
    summary:
      "Первое системное исследование микропластика в малых реках региона: отбор проб, лабораторный анализ и открытый отчёт.",
    category: "Экология",
    orgId: "clean-water",
    status: "Лаборатория",
    visual: "teal",
    raised: 410000,
    goal: 450000,
    weeks: 20,
    backers: 88,
  },
  {
    id: "health-model",
    title: "Открытая модель раннего риска",
    summary:
      "Модель, которая по обезличенным данным помогает врачу увидеть риск осложнений и объясняет своё решение.",
    category: "ИИ и данные",
    orgId: "data-health",
    status: "Идёт сбор",
    visual: "violet",
    raised: 275000,
    goal: 600000,
    weeks: 24,
    backers: 51,
  },
  {
    id: "self-healing",
    title: "Самовосстанавливающиеся покрытия",
    summary:
      "Материал, который закрывает микротрещины под воздействием тепла — испытания на образцах для малых спутников.",
    category: "Материалы",
    orgId: "orbit-lab",
    status: "Подготовка",
    visual: "sand",
    raised: 98000,
    goal: 380000,
    weeks: 18,
    backers: 22,
  },
  {
    id: "seed-microgravity",
    title: "Семена в условиях микрогравитации",
    summary:
      "Проверяем, как кратковременная микрогравитация влияет на всхожесть семян и развитие корней.",
    category: "Космос",
    orgId: "orbit-lab",
    status: "Идёт сбор",
    visual: "sky",
    raised: 212000,
    goal: 300000,
    weeks: 10,
    backers: 43,
  },
];

export function getOrg(id: string): Organization | undefined {
  return ORGANIZATIONS.find((org) => org.id === id);
}

export function getProject(id: string): Project | undefined {
  return PROJECTS.find((project) => project.id === id);
}

export function formatMoney(value: number): string {
  return `${new Intl.NumberFormat("ru-RU", {
    maximumFractionDigits: 0,
  }).format(value)} ₽`;
}

export function percent(project: Project): number {
  if (project.goal <= 0) return 0;
  return Math.min(100, Math.round((project.raised / project.goal) * 100));
}

export function plural(
  n: number,
  forms: [one: string, few: string, many: string],
): string {
  const mod10 = n % 10;
  const mod100 = n % 100;

  if (mod10 === 1 && mod100 !== 11) return forms[0];
  if (mod10 >= 2 && mod10 <= 4 && (mod100 < 10 || mod100 >= 20)) return forms[1];
  return forms[2];
}
