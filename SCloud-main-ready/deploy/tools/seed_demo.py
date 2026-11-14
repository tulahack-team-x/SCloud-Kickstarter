import json
import secrets
from contextlib import contextmanager
from pathlib import Path

import httpx

root = Path(__file__).resolve().parents[1]
settings = json.loads((root / "settings.json").read_text(encoding="utf-8-sig"))
base_url = f"http://127.0.0.1:{settings['port']}"
password = secrets.token_urlsafe(18)


def command(client, path, payload):
    csrf = client.get("/api/auth/csrf").raise_for_status().json()
    response = client.post(path, json=payload, headers={csrf["headerName"]: csrf["token"]})
    response.raise_for_status()
    return response.json()


@contextmanager
def account(email, name, role, **extra):
    client = httpx.Client(base_url=base_url, timeout=30, trust_env=False)
    command(client, "/api/auth/register", dict(name=name, email=email, password=password, role=role, **extra))
    csrf = client.get("/api/auth/csrf").raise_for_status().json()
    client.post("/api/auth/login", data=dict(email=email, password=password), headers={csrf["headerName"]: csrf["token"]}).raise_for_status()
    try:
        yield client
    finally:
        client.close()


with httpx.Client(base_url=base_url, trust_env=False) as check:
    if check.get("/api/projects").raise_for_status().json()["items"]:
        raise SystemExit("Catalog already contains projects; demo seed was not applied.")

suffix = secrets.token_hex(3)
team_email = f"team-{suffix}@scistarter.test"
sponsor_email = f"sponsor-{suffix}@scistarter.test"
customer_email = f"customer-{suffix}@scistarter.test"
with account(team_email, "Анна Соколова", "RESEARCHER", team=dict(
    name="Лаборатория «Чистая вода»", institution="Тульский университет", city="Тула", direction="Экология",
    description="Исследуем качество воды и разрабатываем сорбенты для очистки от тяжёлых металлов.",
    skills="Гидрохимия, сорбенты, анализ данных", equipment="Спектрофотометр, хроматограф",
    members=[dict(name="Михаил Волков", position="Инженер-исследователь")])) as team:
    organization = team.get("/api/me").raise_for_status().json()["organizations"][0]
    project = command(team, "/api/projects", dict(
        organizationId=organization["id"], title="Фильтр для очистки речной воды", category="Экология",
        summary="Исследуем новый сорбент для очистки речной воды от тяжёлых металлов.",
        hypothesis="Новый сорбент снизит концентрацию тяжёлых металлов не менее чем на 90%.",
        method="Сравним три состава на тридцати лабораторных образцах, затем проверим прототип.",
        result="Протокол испытаний, открытый набор данных и рабочий образец фильтра.",
        risks="Эффективность может снижаться при высокой органической нагрузке.", visibility="PUBLIC",
        stages=[dict(title="Лабораторные испытания", result="Протокол сравнения составов", acceptance="Измерения на тридцати образцах с исходными данными", weeks=4, budgetKopecks=30000000),
                dict(title="Пилотная установка", result="Рабочий прототип фильтра", acceptance="Проверка эффективности и ограничений на речной воде", weeks=6, budgetKopecks=70000000)]))
    project = command(team, f"/api/projects/{project['id']}/publication", dict(expectedVersion=project["version"]))
    command(team, f"/api/projects/{project['id']}/updates", dict(stageId=project["stages"][0]["id"], title="Подготовили образцы", text="Подготовлены тридцать контрольных образцов. Начинаем лабораторные измерения.", completed=False))
with account(sponsor_email, "Алексей Смирнов", "SPONSOR") as sponsor:
    csrf = sponsor.get("/api/auth/csrf").raise_for_status().json()
    contribution = sponsor.post(f"/api/projects/{project['id']}/contributions", json=dict(amountKopecks=5000000), headers={csrf["headerName"]: csrf["token"], "Idempotency-Key": secrets.token_hex(16)}).raise_for_status().json()
    command(sponsor, f"/api/demo/contributions/{contribution['id']}/confirmation", {})
with account(customer_email, "Иван Заказчиков", "CUSTOMER", company="АО «ЭкоТех»") as customer:
    command(customer, "/api/requests", dict(organizationId=organization["id"], title="Испытать сорбент для очистки воды", description="Нужно сравнить три состава сорбента и получить протокол испытаний с исходными измерениями.", budgetKopecks=100000000, weeks=10))
credentials = "Демонстрационные аккаунты SciStarter\n" + "\n".join([team_email, sponsor_email, customer_email]) + f"\nПароль для всех: {password}\n"
(root / "demo-accounts.txt").write_text(credentials, encoding="utf-8")
print("Demo data created. Credentials: demo-accounts.txt")
