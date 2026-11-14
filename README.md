# SCloud Kickstarter


# API: 
| Метод | ЭндПоинт | тело | Код | Возвращает |
|---|---|---|---|---|
| GET | `/api/auth/csrf` | — | 200 | `{token, headerName}` |
| POST | `/api/auth/register` | `{name, email, password, role, team?, company?}` | 201 | `Account` |
| POST | `/api/auth/login` | Form: `email, password` | 200 | `Account` + session cookie |
| POST | `/api/auth/logout` | — | 204 | — |
| GET | `/api/me` | — | 200 | `{account, organizations}` |
| PATCH | `/api/me` | `{name}` | 200 | `Account` |
| GET | `/api/organizations` | `offset?, limit?` | 200 | `Page<Organization>` |
| GET | `/api/organizations/{id}` | `id` | 200 | `Organization` |
| PATCH | `/api/organizations/{id}` | `id`; `{team, expectedVersion}` | 200 | `Organization` |
| GET | `/api/organizations/{id}/members` | `id, offset?, limit?` | 200 | `Page<Member>` |
| POST | `/api/organizations/{id}/members` | `id`; `{name, position}` | 201 | `Member` |
| DELETE | `/api/organizations/{id}/members/{memberId}` | `id, memberId` | 204 | — |
| GET | `/api/projects` | `offset?, limit?, query?, category?` | 200 | `Page<{project, funding}>` |
| GET | `/api/projects/{id}` | `id` | 200 | `{project, funding}` |
| GET | `/api/me/projects` | `offset?, limit?` | 200 | `Page<Project>` |
| POST | `/api/projects` | `ProjectInput` | 201 | `Project` |
| PUT | `/api/projects/{id}` | `id`; `{project: ProjectInput, expectedVersion}` | 200 | `Project` |
| POST | `/api/projects/{id}/publication` | `id`; `{expectedVersion}` | 200 | `Project` |
| GET | `/api/projects/{id}/updates` | `id, offset?, limit?` | 200 | `Page<ProjectUpdate>` |
| POST | `/api/projects/{id}/updates` | `id`; `{stageId, title, text, completed}` | 201 | `ProjectUpdate` |
| POST | `/api/projects/{id}/read-grants` | `id`; `{userId}` | 201 | `{id, projectId, userId}` |
| DELETE | `/api/projects/{id}/read-grants/{grantId}` | `id, grantId` | 204 | — |
| POST | `/api/projects/{id}/contributions` | `id`; `{amountKopecks}`; header `Idempotency-Key` | 201 | `Contribution` |
| POST | `/api/demo/contributions/{id}/confirmation` | `id` | 200 | `Contribution` |
| GET | `/api/me/contributions` | `offset?, limit?` | 200 | `Page<Contribution>` |
| GET | `/api/me/impact` | — | 200 | `{funding, rank, nextRank?, achievements}` |
| POST | `/api/requests` | `{organizationId, title, description, budgetKopecks, weeks}` | 201 | `ResearchRequest` |
| GET | `/api/requests` | `offset?, limit?` | 200 | `Page<ResearchRequest>` |
| GET | `/api/requests/{id}` | `id` | 200 | `ResearchRequest` |
| POST | `/api/requests/{id}/proposals` | `id`; `{text, stages, expectedVersion}` | 201 | `Proposal` |
| GET | `/api/requests/{id}/proposals` | `id, offset?, limit?` | 200 | `Page<Proposal>` |
| POST | `/api/requests/{id}/order` | `id`; `{proposalId, expectedVersion}` | 201 | `Order` |
| GET | `/api/orders` | `offset?, limit?` | 200 | `Page<Order>` |
| GET | `/api/orders/{id}` | `id` | 200 | `Order` |
| GET | `/api/orders/{id}/activity` | `id, offset?, limit?` | 200 | `Page<Activity>` |
| POST | `/api/orders/{orderId}/stages/{stageId}/reports` | `orderId, stageId`; `{title, work, conclusion, limitations, attachmentIds?, expectedVersion}` | 201 | `Report` |
| GET | `/api/orders/{orderId}/stages/{stageId}/reports` | `orderId, stageId, offset?, limit?` | 200 | `Page<Report>` |
| POST | `/api/orders/{orderId}/stages/{stageId}/decision` | `orderId, stageId`; `{reportId, accepted, comment?, expectedVersion}` | 200 | `OrderStage` |
| POST | `/api/orders/{id}/reviews` | `id`; `{rating, text}` | 201 | `Review` |
| GET | `/api/organizations/{id}/reviews` | `id, offset?, limit?` | 200 | `Page<Review>` |
| GET | `/api/me/reviews` | `offset?, limit?` | 200 | `Page<Review>` |
| POST | `/api/attachments` | Multipart: `ownerType, ownerId, file` | 201 | `Attachment` |
| GET | `/api/attachments` | `ownerType, ownerId, offset?, limit?` | 200 | `Page<Attachment>` |
| GET | `/api/attachments/{id}/content` | `id` | 200 | Бинарный файл |
| GET | `/` | — | 200 | `{service, status, projects, csrf}` |

## расшифровки того что возвращается (JSON) 

| Объект | Поля |
|---|---|
| `Account` | `id, name, email, role` |
| `Organization` | `id, ownerId, name, type, institution?, city?, direction?, description?, skills?, equipment?, version, members[]` |
| `Member` | `id, userId?, name, position, accessRole` |
| `ProjectInput` | `organizationId, title, category, summary, hypothesis, method, result, risks, visibility, stages: StageInput[]` |
| `StageInput` | `title, result, acceptance, weeks, budgetKopecks` |
| `Project` | Поля `ProjectInput` + `id, status, version, createdAt`; у этапов дополнительно `id, position` |
| `ProjectUpdate` | `id, projectId, stageId, title, text, completed, createdAt` |
| `funding` | `amountKopecks, contributors, contributions` |
| `Contribution` | `id, projectId, userId, amountKopecks, status, createdAt, version` |
| `rank`, `nextRank` | `name, thresholdKopecks` |
| `ResearchRequest` | `id, customerId, organizationId, title, description, budgetKopecks, weeks, status, version, createdAt` |
| `Proposal` | `id, requestId, text, createdAt, stages: StageInput[]` |
| `Order` | `id, requestId, proposalId, customerId, organizationId, title, status, version, createdAt, stages: OrderStage[]` |
| `OrderStage` | Поля `StageInput` + `id, orderId, position, status, currentReportId?, version` |
| `Activity` | `id, actorId, text, createdAt` |
| `Report` | `id, orderId, stageId, title, work, conclusion, limitations, feedback?, decision, createdAt, attachmentIds[]` |
| `Review` | `id, orderId, authorId, subjectId, subjectType, rating, text, createdAt` |
| `Attachment` | `id, ownerType, ownerId, name, size, createdAt` |
| `team` | `name, institution?, city?, direction, description, skills?, equipment?, members?: [{name, position}]` |

## коды ошибок

| Код ошибки | Значение |
|---|---|
| 400 | Некорректные параметры или тело |
| 401 | Нет сессии / неверные данные входа |
| 403 | Нет прав / неверный CSRF |
| 404 | Ресурс отсутствует или скрыт |
| 405 | Метод не поддерживается |
| 406 | Неподдерживаемый Accept |
| 409 | Конфликт состояния, версии или уникальности |
| 413 | Превышен размер файла |
| 415 | Неподдерживаемый Content-Type |
| 500 | Ошибка сервера |
| 503 | Таймаут |


## заголовки для запросов

| Запросы | Заголовки |
|---|---|
| POST, PUT, PATCH, DELETE | CSRF: имя заголовка из `headerName`, значение из `token` |
| Авторизованные запросы | Cookie `JSESSIONID` |
| JSON | `Content-Type: application/json` |
| Login | `Content-Type: application/x-www-form-urlencoded` |
| Загрузка файла | `Content-Type: multipart/form-data` |

*Разберем пример возвращенного JSON с объектом Account*

``{
  "id": "UUID",
  "name": "Иван Петров",
  "email": "ivan@example.com",
  "role": "CUSTOMER"
<<<<<<< HEAD
}``
=======
}``
>>>>>>> 3bda8c68b97aac78c42ed1db51a2cedd81d376b0
