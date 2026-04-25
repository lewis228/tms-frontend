import Section from "./section";
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import Fallback from "@/components/fallback";
import Loader from "@/components/loader";
import { useApiKeysData } from "@/hooks/queries/use-api-keys-data";
import { useRevokeApiKey } from "@/hooks/mutations/api-key/use-revoke-api-key";
import { useOpenAlertModal } from "@/store/alert-modal";
import { useOpenApiKeyCreateModal } from "@/store/api-key-create-modal";
import { formatTimeAgo } from "@/lib/time";
import { formatDate } from "@/lib/format";
import { generateErrorMessage } from "@/lib/error";
import { useParams } from "react-router-dom";
import { useTranslation } from "react-i18next";
import i18n from "i18next";
import { ChevronDown, Clock, Plus, Trash2 } from "lucide-react";
import { toast } from "sonner";
import type { ApiKeyEntity } from "@/types";

// ---------------------------------------------------------------------------
// Mock Data — retained for the Sessions section below, which is driven by a
// separate (not-yet-implemented) backend feature. API key rows use real data.
// ---------------------------------------------------------------------------
const SESSIONS = [
  { location: "USA(5)", device: "Chrome - Windows", ip: "236.125.56.78", time: "2 minutes ago", status: "In Progress" },
  { location: "United Kingdom(10)", device: "Safari - Mac OS", ip: "236.125.56.69", time: "10 minutes ago", status: "Complete" },
  { location: "Norway(-)", device: "Firefox - Windows", ip: "236.125.56.10", time: "20 minutes ago", status: "Pending" },
  { location: "Japan(112)", device: "iOS - iPhone Pro", ip: "236.125.56.54", time: "30 minutes ago", status: "Approved" },
  { location: "Italy(5)", device: "Samsung Noted 5- Android", ip: "236.100.56.50", time: "40 minutes ago", status: "Rejected" },
];

const STATUS_COLORS: Record<string, string> = {
  "In Progress": "#a78bfa",
  "Complete": "#22c55e",
  "Pending": "#3b82f6",
  "Approved": "#eab308",
  "Rejected": "#9ca3af",
  "Active": "#22c55e",
  "Expired": "#9ca3af",
  "Revoked": "#ef4444",
};

type DerivedStatus = "Active" | "Expired" | "Revoked";

function deriveStatus(row: ApiKeyEntity): DerivedStatus {
  // Soft-deleted (revoked) rows appear only briefly — the backend list
  // endpoint filters is_active=false out, but the revoke mutation flips the
  // flag locally before the next refetch so the row transitions "Active →
  // Revoked" without a flash of stale state.
  if (!row.is_active) return "Revoked";
  if (row.expires_at !== null && new Date(row.expires_at) <= new Date()) {
    return "Expired";
  }
  return "Active";
}

function formatExpiry(row: ApiKeyEntity): string {
  if (row.expires_at === null) return i18n.t("apiKeysTab.never");
  const date = new Date(row.expires_at);
  const now = new Date();
  // Past-due keys render as "Expired · <relative>" in their own status cell;
  // here we just show the calendar date so sorting/scanning feels stable.
  return date <= now
    ? i18n.t("apiKeysTab.expiredAt", { ago: formatTimeAgo(row.expires_at) })
    : formatDate(row.expires_at);
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------
export default function ApiKeysTab() {
  const params = useParams();
  const teamId = params.teamId ? Number(params.teamId) : undefined;
  const openAlertModal = useOpenAlertModal();
  const openCreateModal = useOpenApiKeyCreateModal();
  const { t } = useTranslation();

  const { data: apiKeys, error, isPending } = useApiKeysData(teamId);

  const { mutate: revokeApiKey, isPending: isRevokeApiKeyPending } =
    useRevokeApiKey({
      onSuccess: () => {
        toast.success(t("apiKeysTab.revokeSuccess"), {
          position: "top-center",
        });
      },
      onError: (apiError) => {
        toast.error(generateErrorMessage(apiError), { position: "top-center" });
      },
    });

  const handleRevokeClick = (row: ApiKeyEntity) => {
    if (!teamId) return;
    openAlertModal({
      title: t("apiKeysTab.revokeConfirmTitle", { name: row.name }),
      description: t("apiKeysTab.revokeConfirmDescription"),
      onPositive: () => revokeApiKey({ teamId, apiKeyId: row.id }),
    });
  };

  return (
    <>
      {/* API Overview — boilerplate marketing section, intentionally kept. */}
      <Section>
        <h2 className="mb-4 text-sm font-semibold text-black">
          {t("apiKeysTab.overview")}
        </h2>
        <div className="flex flex-col gap-4">
          <div className="flex items-center justify-between border-b border-black/10 pb-4">
            <div className="flex flex-col">
              <span className="text-sm font-semibold text-black">
                {t("apiKeysTab.howToTitle")}
              </span>
              <span className="text-xs text-black/55">
                {t("apiKeysTab.howToDescription")}
              </span>
            </div>
            <Button variant="outline" size="sm" className="shrink-0 text-xs">
              {t("apiKeysTab.getStarted")}
            </Button>
          </div>
          <div className="flex items-center justify-between">
            <div className="flex flex-col">
              <span className="text-sm font-semibold text-black">
                {t("apiKeysTab.devToolsTitle")}
              </span>
              <span className="text-xs text-black/55">
                {t("apiKeysTab.devToolsDescription")}
              </span>
            </div>
            <Button variant="outline" size="sm" className="shrink-0 text-xs">
              {t("apiKeysTab.createRule")}
            </Button>
          </div>
        </div>
      </Section>

      {/* Sign in Sessions — separate (login history) feature, still mocked. */}
      <Section>
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-sm font-semibold text-black">
            {t("apiKeysTab.sessions")}
          </h2>
          <Button variant="ghost" size="sm" className="gap-1 text-xs text-black/55">
            {t("apiKeysTab.hour")} <ChevronDown className="h-3 w-3" />
          </Button>
        </div>
        <Table>
          <TableHeader>
            <TableRow className="border-b border-black/10 hover:bg-transparent">
              <TableHead className="text-xs font-medium text-black/55">
                {t("apiKeysTab.sessionsColumns.location")}
              </TableHead>
              <TableHead className="text-xs font-medium text-black/55">
                {t("apiKeysTab.sessionsColumns.device")}
              </TableHead>
              <TableHead className="text-xs font-medium text-black/55">
                {t("apiKeysTab.sessionsColumns.ip")}
              </TableHead>
              <TableHead className="text-xs font-medium text-black/55">
                {t("apiKeysTab.sessionsColumns.time")}
              </TableHead>
              <TableHead className="text-xs font-medium text-black/55">
                {t("apiKeysTab.sessionsColumns.status")}
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {SESSIONS.map((s, i) => (
              <TableRow key={i} className="border-b border-black/5">
                <TableCell className="text-sm text-black">{s.location}</TableCell>
                <TableCell className="text-sm text-black/80">{s.device}</TableCell>
                <TableCell className="text-sm text-black/80">{s.ip}</TableCell>
                <TableCell>
                  <div className="flex items-center gap-1.5">
                    <Clock className="h-3.5 w-3.5 text-black/20" />
                    <span className="text-sm text-black/80">{s.time}</span>
                  </div>
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-1.5">
                    <span className="h-2 w-2 rounded-full" style={{ backgroundColor: STATUS_COLORS[s.status] }} />
                    <span className="text-sm" style={{ color: STATUS_COLORS[s.status] }}>{s.status}</span>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Section>

      {/* API Keys — real data. */}
      <Section>
        <div className="mb-4 flex items-center justify-between">
          <div className="flex flex-col gap-0.5">
            <h2 className="text-sm font-semibold text-black">
              {t("apiKeysTab.apiKeysTitle")}
            </h2>
            <p className="text-xs text-black/55">
              {t("apiKeysTab.apiKeysDescription")}
            </p>
          </div>
          <Button
            type="button"
            onClick={() => openCreateModal()}
            disabled={!teamId}
            className="gap-1.5 rounded-lg bg-black px-3 py-2 text-xs font-medium text-white hover:bg-black/80"
          >
            <Plus className="h-3.5 w-3.5" />
            {t("apiKeysTab.newKey")}
          </Button>
        </div>

        {error && <Fallback />}
        {!error && isPending && <Loader />}
        {!error && !isPending && apiKeys && apiKeys.length === 0 && (
          <div className="flex flex-col items-center justify-center gap-2 rounded-xl border border-dashed border-black/10 py-10 text-center">
            <span className="text-sm font-medium text-black">
              {t("apiKeysTab.empty")}
            </span>
            <span className="text-xs text-black/55">
              {t("apiKeysTab.emptyHint")}
            </span>
          </div>
        )}
        {!error && !isPending && apiKeys && apiKeys.length > 0 && (
          <Table>
            <TableHeader>
              <TableRow className="border-b border-black/10 hover:bg-transparent">
                <TableHead className="text-xs font-medium text-black/55">
                  {t("apiKeysTab.columns.name")}
                </TableHead>
                <TableHead className="text-xs font-medium text-black/55">
                  {t("apiKeysTab.columns.key")}
                </TableHead>
                <TableHead className="text-xs font-medium text-black/55">
                  {t("apiKeysTab.columns.lastUsed")}
                </TableHead>
                <TableHead className="text-xs font-medium text-black/55">
                  {t("apiKeysTab.columns.expires")}
                </TableHead>
                <TableHead className="text-xs font-medium text-black/55">
                  {t("apiKeysTab.columns.status")}
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
                        <span className="text-sm font-medium text-black">{row.name}</span>
                        {row.description && (
                          <span className="text-xs text-black/55">{row.description}</span>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <code className="rounded-md bg-black/[0.04] px-2 py-1 font-mono text-xs text-black/80">
                        {row.prefix}…
                      </code>
                    </TableCell>
                    <TableCell className="text-sm text-black/80">
                      {row.last_used_at
                        ? formatTimeAgo(row.last_used_at)
                        : t("apiKeysTab.neverUsed")}
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
                        <span className="text-sm" style={{ color: STATUS_COLORS[status] }}>
                          {status}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell className="text-right">
                      {isRevokable && (
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          disabled={isRevokeApiKeyPending}
                          onClick={() => handleRevokeClick(row)}
                          className="gap-1 text-xs text-red-500 hover:bg-red-500/[0.08] hover:text-red-600"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                          {t("apiKeysTab.revokeButton")}
                        </Button>
                      )}
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        )}
      </Section>
    </>
  );
}
