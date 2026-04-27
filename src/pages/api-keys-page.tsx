// Settings > API Keys — list + create + revoke. Uses a thin page (matches
// other settings pages); domain logic is the API key table here directly,
// the modals live in the global ModalProvider.
import { useTranslation } from "react-i18next";
import i18n from "i18next";
import { Plus, Trash2 } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import Fallback from "@/components/fallback";
import Loader from "@/components/loader";
import { useApiKeysData } from "@/hooks/queries/use-api-keys-data";
import { useDeleteApiKey } from "@/hooks/mutations/api-key/use-delete-api-key";
import { useOpenAlertModal } from "@/store/alert-modal";
import { useOpenApiKeyCreateModal } from "@/store/api-key-create-modal";
import { useCurrentTeamId } from "@/store/auth";
import { generateErrorMessage } from "@/lib/error";
import { formatDate } from "@/lib/format";
import { formatTimeAgo } from "@/lib/time";
import type { ApiKeyEntity } from "@/types";

const STATUS_COLORS: Record<string, string> = {
  Active: "#22c55e",
  Expired: "#9ca3af",
  Revoked: "#ef4444",
};

type DerivedStatus = "Active" | "Expired" | "Revoked";

function deriveStatus(row: ApiKeyEntity): DerivedStatus {
  // Soft-deleted (revoked) rows appear only briefly — the backend list
  // endpoint filters is_active=false out, but the revoke mutation flips the
  // flag locally before the next refetch so the row transitions "Active →
  // Revoked" without a flash of stale state.
  if (!row.isActive) return "Revoked";
  if (row.expiresAt !== null && new Date(row.expiresAt) <= new Date()) {
    return "Expired";
  }
  return "Active";
}

function formatExpiry(row: ApiKeyEntity): string {
  if (row.expiresAt === null) return i18n.t("apiKey.never");
  const date = new Date(row.expiresAt);
  const now = new Date();
  return date <= now
    ? i18n.t("apiKey.expiredAt", { ago: formatTimeAgo(row.expiresAt) })
    : formatDate(row.expiresAt);
}

export default function ApiKeysPage() {
  const { t } = useTranslation();
  const teamId = useCurrentTeamId();
  const openAlertModal = useOpenAlertModal();
  const openCreateModal = useOpenApiKeyCreateModal();

  const { data: apiKeys, error, isPending } = useApiKeysData(teamId);

  const { mutate: deleteApiKey, isPending: isDeleteApiKeyPending } =
    useDeleteApiKey({
      onSuccess: () => {
        toast.success(t("apiKey.revokeSuccess"), { position: "top-center" });
      },
      onError: (apiError) => {
        toast.error(generateErrorMessage(apiError), {
          position: "top-center",
        });
      },
    });

  const handleRevokeClick = (row: ApiKeyEntity) => {
    openAlertModal({
      title: t("apiKey.revokeConfirmTitle", { name: row.name }),
      description: t("apiKey.revokeConfirmDescription"),
      onPositive: () => deleteApiKey(row.id),
    });
  };

  return (
    <div className="flex flex-col gap-0 p-0">
      <div className="flex items-center justify-between px-7 pb-4 pt-7">
        <h1 className="text-2xl font-semibold text-foreground">
          {t("apiKey.title")}
        </h1>
        <Button
          type="button"
          onClick={() => openCreateModal()}
          disabled={!teamId}
          className="gap-1.5 rounded-lg bg-black px-3 py-2 text-xs font-medium text-white hover:bg-black/80"
        >
          <Plus className="h-3.5 w-3.5" />
          {t("apiKey.newKey")}
        </Button>
      </div>

      <p className="px-7 pb-4 text-xs text-muted-foreground">
        {t("apiKey.description")}
      </p>

      <div className="px-7">
        {error && <Fallback />}
        {!error && isPending && <Loader />}
        {!error && !isPending && apiKeys && apiKeys.length === 0 && (
          <div className="flex flex-col items-center justify-center gap-2 rounded-xl border border-dashed border-black/10 py-10 text-center">
            <span className="text-sm font-medium text-black">
              {t("apiKey.empty")}
            </span>
            <span className="text-xs text-black/55">
              {t("apiKey.emptyHint")}
            </span>
          </div>
        )}
        {!error && !isPending && apiKeys && apiKeys.length > 0 && (
          <Table>
            <TableHeader>
              <TableRow className="border-b border-black/10 hover:bg-transparent">
                <TableHead className="text-xs font-medium text-black/55">
                  {t("apiKey.col.name")}
                </TableHead>
                <TableHead className="text-xs font-medium text-black/55">
                  {t("apiKey.col.key")}
                </TableHead>
                <TableHead className="text-xs font-medium text-black/55">
                  {t("apiKey.col.lastUsed")}
                </TableHead>
                <TableHead className="text-xs font-medium text-black/55">
                  {t("apiKey.col.expires")}
                </TableHead>
                <TableHead className="text-xs font-medium text-black/55">
                  {t("apiKey.col.status")}
                </TableHead>
                <TableHead className="text-xs font-medium text-black/55"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {apiKeys.map((row) => {
                const status = deriveStatus(row);
                const isRevokable = status === "Active";
                return (
                  <TableRow key={row.id} className="border-b border-black/5">
                    <TableCell>
                      <div className="flex flex-col">
                        <span className="text-sm font-medium text-black">
                          {row.name}
                        </span>
                        {row.description && (
                          <span className="text-xs text-black/55">
                            {row.description}
                          </span>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <code className="rounded-md bg-black/[0.04] px-2 py-1 font-mono text-xs text-black/80">
                        {row.prefix}…
                      </code>
                    </TableCell>
                    <TableCell className="text-sm text-black/80">
                      {row.lastUsedAt
                        ? formatTimeAgo(row.lastUsedAt)
                        : t("apiKey.neverUsed")}
                    </TableCell>
                    <TableCell className="text-sm text-black/80">
                      {formatExpiry(row)}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1.5">
                        <span
                          className="h-2 w-2 rounded-full"
                          style={{ backgroundColor: STATUS_COLORS[status] }}
                        />
                        <span
                          className="text-sm"
                          style={{ color: STATUS_COLORS[status] }}
                        >
                          {t(`apiKey.status.${status.toLowerCase()}`)}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell className="text-right">
                      {isRevokable && (
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          disabled={isDeleteApiKeyPending}
                          onClick={() => handleRevokeClick(row)}
                          className="gap-1 text-xs text-red-500 hover:bg-red-500/[0.08] hover:text-red-600"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                          {t("apiKey.revokeButton")}
                        </Button>
                      )}
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        )}
      </div>
    </div>
  );
}
