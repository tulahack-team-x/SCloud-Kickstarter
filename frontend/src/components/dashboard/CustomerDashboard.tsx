import { CircleCheck, FolderKanban, ListChecks, Wallet } from "lucide-react";
import { useState } from "react";
import { Link } from "react-router-dom";
import Button from "../Button";
import Modal from "../Modal";
import ReviewForm from "../ReviewForm";
import StageReportModal from "../StageReportModal";
import { useApiResource } from "../../hooks/useApiResource";
import { useAuth } from "../../hooks/useAuth";
import {
  getOrderAcceptedBudgetKopecks,
  getOrderAcceptedStages,
  getOrderBudgetKopecks,
} from "../../lib/dashboard";
import { formatKopecks } from "../../lib/format";
import type {
  OrderStageView,
  OrderView,
  OrganizationView,
  PageSlice,
  ResearchRequestView,
  ReviewView,
} from "../../types/api";
import CustomerRequestItem from "./CustomerRequestItem";
import OrderRow from "./OrderRow";
import {
  DashboardError,
  DashboardLoading,
  ProgressBar,
  Section,
  StatCard,
} from "./ui";

function CustomerDashboard() {
  const { user } = useAuth();
  const [reviewOrder, setReviewOrder] = useState<OrderView | null>(null);
  const [reportTarget, setReportTarget] = useState<{
    order: OrderView;
    stage: OrderStageView;
  } | null>(null);

  const ordersResource =
    useApiResource<PageSlice<OrderView>>("/orders?limit=100");
  const organizationsResource = useApiResource<PageSlice<OrganizationView>>(
    "/organizations?limit=100",
  );
  const requestsResource = useApiResource<PageSlice<ResearchRequestView>>(
    "/requests?limit=100",
  );
  const reviewsResource = useApiResource<PageSlice<ReviewView>>(
    "/me/reviews?limit=100",
  );

  if (
    ordersResource.loading ||
    organizationsResource.loading ||
    requestsResource.loading ||
    reviewsResource.loading
  ) {
    return <DashboardLoading />;
  }

  const error =
    ordersResource.error ??
    organizationsResource.error ??
    requestsResource.error ??
    reviewsResource.error;

  if (error) {
    return (
      <DashboardError
        message={error}
        onRetry={() => {
          ordersResource.reload();
          organizationsResource.reload();
          requestsResource.reload();
          reviewsResource.reload();
        }}
      />
    );
  }

  const orders = ordersResource.data?.items ?? [];
  const requests = requestsResource.data?.items ?? [];
  const reviewedOrderIds = new Set(
    (reviewsResource.data?.items ?? [])
      .filter((review) => review.authorId === user?.id)
      .map((review) => review.orderId),
  );
  const openRequests = requests.filter(
    (request) => request.status !== "ACCEPTED",
  );
  const organizationNames = new Map(
    (organizationsResource.data?.items ?? []).map((org) => [org.id, org.name]),
  );

  const totalBudget = orders.reduce(
    (total, order) => total + getOrderBudgetKopecks(order),
    0,
  );
  const acceptedBudget = orders.reduce(
    (total, order) => total + getOrderAcceptedBudgetKopecks(order),
    0,
  );
  const totalStages = orders.reduce(
    (total, order) => total + order.stages.length,
    0,
  );
  const acceptedStages = orders.reduce(
    (total, order) => total + getOrderAcceptedStages(order),
    0,
  );
  const activeOrders = orders.filter(
    (order) => order.status === "ACTIVE",
  ).length;

  return (
    <div className="space-y-6">
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          label="Заказы"
          value={orders.length}
          sub={`${activeOrders} в работе`}
          icon={FolderKanban}
        />
        <StatCard
          label="Бюджет заказов"
          value={formatKopecks(totalBudget)}
          icon={Wallet}
        />
        <StatCard
          label="Принято этапов"
          value={acceptedStages}
          sub={formatKopecks(acceptedBudget)}
          icon={CircleCheck}
        />
        <StatCard label="Всего этапов" value={totalStages} icon={ListChecks} />
      </div>

      <Section title="Бюджет заказов">
        <ProgressBar
          value={acceptedBudget}
          max={totalBudget}
          label="Принятые этапы"
        />
      </Section>

      <Section
        title="Мои запросы"
        action={
          <Button asChild variant="secondary" compact>
            <Link to="/organizations">Найти команду</Link>
          </Button>
        }
      >
        {openRequests.length === 0 ? (
          <p className="text-sm text-stone-500">Запросов пока нет.</p>
        ) : (
          <ul className="space-y-4">
            {openRequests.map((request) => (
              <CustomerRequestItem
                key={request.id}
                request={request}
                organizationName={organizationNames.get(
                  request.organizationId,
                )}
                onAccepted={() => {
                  requestsResource.reload();
          reviewsResource.reload();
                  ordersResource.reload();
                }}
              />
            ))}
          </ul>
        )}
      </Section>

      <Section
        title="Заказы в работе"
        action={
          <Button asChild variant="secondary" compact>
            <Link to="/">Найти исследования</Link>
          </Button>
        }
      >
        {orders.length === 0 ? (
          <p className="text-sm text-stone-500">Заказов пока нет.</p>
        ) : (
          <ul className="divide-y divide-stone-100">
            {orders.map((order) => {
              const hasAcceptedStage = order.stages.some(
                (stage) => stage.status === "ACCEPTED",
              );
              const reviewed = reviewedOrderIds.has(order.id);

              return (
                <OrderRow
                  key={order.id}
                  order={order}
                  organizationName={organizationNames.get(
                    order.organizationId,
                  )}
                  showStages
                  stageAction={(stage) =>
                    stage.currentReportId ? (
                      <Button
                        compact
                        variant="secondary"
                        onClick={() => setReportTarget({ order, stage })}
                      >
                        Открыть отчёт
                      </Button>
                    ) : undefined
                  }
                  action={
                    hasAcceptedStage ? (
                      reviewed ? (
                        <p className="text-xs font-semibold text-green-800">
                          Отзыв опубликован
                        </p>
                      ) : (
                        <Button
                          compact
                          onClick={() => setReviewOrder(order)}
                        >
                          Оставить отзыв
                        </Button>
                      )
                    ) : undefined
                  }
                />
              );
            })}
          </ul>
        )}
      </Section>

      <Modal
        open={!!reviewOrder}
        onClose={() => setReviewOrder(null)}
        title="Отзыв о научной команде"
      >
        {reviewOrder && (
          <ReviewForm
            orderId={reviewOrder.id}
            onSubmitted={() => {
              setReviewOrder(null);
              reviewsResource.reload();
            }}
            onCancel={() => setReviewOrder(null)}
          />
        )}
      </Modal>

      <Modal
        open={!!reportTarget}
        onClose={() => setReportTarget(null)}
        title="Отчёт по этапу"
        description={reportTarget?.stage.title}
      >
        {reportTarget && (
          <StageReportModal
            orderId={reportTarget.order.id}
            stage={reportTarget.stage}
            canDecide
            onDecided={() => {
              setReportTarget(null);
              ordersResource.reload();
            }}
            onCancel={() => setReportTarget(null)}
          />
        )}
      </Modal>
    </div>
  );
}

export default CustomerDashboard;
