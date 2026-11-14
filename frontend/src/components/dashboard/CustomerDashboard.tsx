import { CircleCheck, FolderKanban, ListChecks, Wallet } from "lucide-react";
import { Link } from "react-router-dom";
import Button from "../Button";
import { useApiResource } from "../../hooks/useApiResource";
import {
  getOrderAcceptedBudgetKopecks,
  getOrderAcceptedStages,
  getOrderBudgetKopecks,
} from "../../lib/dashboard";
import { formatKopecks } from "../../lib/format";
import type { OrderView, OrganizationView, PageSlice } from "../../types/api";
import OrderRow from "./OrderRow";
import {
  DashboardError,
  DashboardLoading,
  ProgressBar,
  Section,
  StatCard,
} from "./ui";

function CustomerDashboard() {
  const ordersResource =
    useApiResource<PageSlice<OrderView>>("/orders?limit=100");
  const organizationsResource = useApiResource<PageSlice<OrganizationView>>(
    "/organizations?limit=100",
  );

  if (ordersResource.loading || organizationsResource.loading) {
    return <DashboardLoading />;
  }

  const error = ordersResource.error ?? organizationsResource.error;

  if (error) {
    return (
      <DashboardError
        message={error}
        onRetry={() => {
          ordersResource.reload();
          organizationsResource.reload();
        }}
      />
    );
  }

  const orders = ordersResource.data?.items ?? [];
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
          value={formatKopecks(acceptedBudget)}
          sub={`${acceptedStages} из ${totalStages}`}
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
        title="Мои заказы"
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
            {orders.map((order) => (
              <OrderRow
                key={order.id}
                order={order}
                organizationName={organizationNames.get(order.organizationId)}
              />
            ))}
          </ul>
        )}
      </Section>
    </div>
  );
}

export default CustomerDashboard;
