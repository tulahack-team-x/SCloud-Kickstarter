import { useState } from "react";
import { apiFetch, getApiErrorMessage } from "../../lib/api";
import { REQUEST_STATUS_LABELS } from "../../lib/dashboard";
import { formatKopecks } from "../../lib/format";
import type {
  PageSlice,
  ProposalView,
  ResearchRequestView,
} from "../../types/api";
import { useApiResource } from "../../hooks/useApiResource";
import Button from "../Button";
import Spinner from "../Spinner";
import StageCard from "./StageCard";
import { Badge } from "./ui";

type CustomerRequestItemProps = {
  request: ResearchRequestView;
  organizationName?: string;
  onAccepted: () => void;
};

function CustomerRequestItem({
  request,
  organizationName,
  onAccepted,
}: CustomerRequestItemProps) {
  const proposalsResource = useApiResource<PageSlice<ProposalView>>(
    request.status === "PROPOSED"
      ? `/requests/${request.id}/proposals?limit=20`
      : null,
  );
  const [acceptingId, setAcceptingId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function acceptProposal(proposal: ProposalView) {
    setAcceptingId(proposal.id);
    setError(null);

    try {
      await apiFetch(`/requests/${request.id}/order`, {
        method: "POST",
        body: JSON.stringify({
          proposalId: proposal.id,
          expectedVersion: request.version,
        }),
      });

      onAccepted();
    } catch (err) {
      setError(
        getApiErrorMessage(err, "Не удалось согласовать предложение"),
      );
    } finally {
      setAcceptingId(null);
    }
  }

  const proposals = proposalsResource.data?.items ?? [];
  const tone =
    request.status === "ACCEPTED"
      ? "green"
      : request.status === "PROPOSED"
        ? "sky"
        : "amber";
  return (
    <li className="overflow-hidden rounded-2xl border border-stone-200/80 bg-white p-5 shadow-sm">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="font-semibold text-stone-950">{request.title}</p>
          <p className="mt-1 text-xs text-stone-500">
            {organizationName ?? "Организация"} · {request.weeks} нед.
          </p>
          <p className="mt-2 text-sm leading-6 text-stone-600">
            {request.description}
          </p>
        </div>

        <div className="text-right">
          <p className="font-bold text-stone-950">
            {formatKopecks(request.budgetKopecks)}
          </p>
          <div className="mt-1">
            <Badge tone={tone}>
              {REQUEST_STATUS_LABELS[request.status]}
            </Badge>
          </div>
        </div>
      </div>

      {request.status === "SENT" && (
        <p className="mt-3 text-xs text-stone-500">
          Ожидает ответа научной команды.
        </p>
      )}

      {request.status === "PROPOSED" && (
        <div className="mt-4">
          {proposalsResource.loading ? (
            <div className="flex items-center gap-2 text-xs text-stone-500">
              <Spinner className="size-4" />
              Загрузка предложений...
            </div>
          ) : proposalsResource.error ? (
            <p className="text-xs text-red-600">{proposalsResource.error}</p>
          ) : proposals.length === 0 ? (
            <p className="text-xs text-stone-500">Предложений пока нет.</p>
          ) : (
            <div className="space-y-3">
              {proposals.map((proposal) => {
                const totalBudget = proposal.stages.reduce(
                  (total, stage) => total + stage.budgetKopecks,
                  0,
                );
                const totalWeeks = proposal.stages.reduce(
                  (total, stage) => total + stage.weeks,
                  0,
                );

                return (
                  <div
                    key={proposal.id}
                    className="rounded-xl border border-stone-200 bg-white p-4"
                  >
                    <p className="text-sm leading-6 text-stone-700">
                      {proposal.text}
                    </p>

                    <p className="mt-3 text-xs font-semibold text-stone-500">
                      {formatKopecks(totalBudget)} · {totalWeeks} недель
                    </p>

                    <ol className="mt-3 space-y-2">
                      {proposal.stages.map((stage, index) => (
                        <StageCard
                          key={`${proposal.id}-${index}`}
                          index={index}
                          title={stage.title}
                          result={stage.result}
                          acceptance={stage.acceptance}
                          weeks={stage.weeks}
                          budgetKopecks={stage.budgetKopecks}
                        />
                      ))}
                    </ol>

                    {error && (
                      <p className="mt-2 text-xs text-red-600">{error}</p>
                    )}

                    <Button
                      compact
                      className="mt-4 w-full justify-center"
                      disabled={acceptingId === proposal.id}
                      onClick={() => void acceptProposal(proposal)}
                    >
                      {acceptingId === proposal.id
                        ? "Согласовываем..."
                        : "Согласовать предложение"}
                    </Button>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {request.status === "ACCEPTED" && (
        <p className="mt-3 text-xs font-semibold text-green-800">
          Заказ создан — этапы доступны в разделе заказов.
        </p>
      )}
    </li>
  );
}

export default CustomerRequestItem;
