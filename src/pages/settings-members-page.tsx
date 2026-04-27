// Settings > Members — list of users in the current tenant. Visual shell
// matches ste's settings-members-page; backend is TMS's listUsers (paged).
import { useMemo, useState } from "react";
import { useParams } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { useQuery } from "@tanstack/react-query";
import {
  Calendar,
  Copy,
  LayoutGrid,
  List,
  MoreHorizontal,
  Plus,
  Search,
  SlidersHorizontal,
  ArrowDownUp,
  UserPlus,
} from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { listUsers } from "@/api/user";
import { QUERY_KEYS } from "@/lib/constants";
import { formatDateTime } from "@/lib/format";
import { cn } from "@/lib/utils";
import { useOpenMemberInviteModal } from "@/store/member-invite-modal";
import type { UserEntity } from "@/types";

const ITEMS_PER_PAGE = 10;

function getAvatarUrl(member: UserEntity) {
  const slug = (member.email ?? "user").replace(/[^a-z0-9]/gi, "");
  return `https://i.pravatar.cc/80?u=${slug}`;
}

function getSerialId(member: UserEntity) {
  return `#CM${String(member.id).padStart(4, "0")}`;
}

export default function SettingsMembersPage() {
  const params = useParams();
  const tenantId = params.tenantId ? Number(params.tenantId) : undefined;
  const { t } = useTranslation();
  const openMemberInviteModal = useOpenMemberInviteModal();

  const { data, error, isPending } = useQuery({
    queryKey: QUERY_KEYS.user.list({ tenantId, page: 1, size: 100 }),
    queryFn: () => listUsers({ page: 1, size: 100 }, tenantId),
    enabled: typeof tenantId === "number" && Number.isFinite(tenantId),
  });

  const [viewMode, setViewMode] = useState<"list" | "grid">("list");
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedIds, setSelectedIds] = useState<Set<number>>(new Set());

  const filteredMembers = useMemo(() => {
    const items = data?.items ?? [];
    if (!searchQuery.trim()) return items;
    const q = searchQuery.toLowerCase();
    return items.filter(
      (m) =>
        (m.name?.toLowerCase().includes(q) ?? false) ||
        (m.email?.toLowerCase().includes(q) ?? false) ||
        m.role.toLowerCase().includes(q),
    );
  }, [data, searchQuery]);

  const totalPages = Math.max(
    1,
    Math.ceil(filteredMembers.length / ITEMS_PER_PAGE),
  );
  const paginatedMembers = filteredMembers.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE,
  );

  const handleSearch = (value: string) => {
    setSearchQuery(value);
    setCurrentPage(1);
  };

  const isAllSelected =
    paginatedMembers.length > 0 &&
    paginatedMembers.every((m) => selectedIds.has(m.id));

  const toggleSelectAll = () => {
    if (isAllSelected) {
      const next = new Set(selectedIds);
      paginatedMembers.forEach((m) => next.delete(m.id));
      setSelectedIds(next);
    } else {
      const next = new Set(selectedIds);
      paginatedMembers.forEach((m) => next.add(m.id));
      setSelectedIds(next);
    }
  };

  const toggleSelect = (id: number) => {
    const next = new Set(selectedIds);
    if (next.has(id)) next.delete(id);
    else next.add(id);
    setSelectedIds(next);
  };

  return (
    <div className="flex flex-col gap-0 p-0">
      <div className="flex items-center justify-between px-7 pb-4 pt-7">
        <h1 className="text-2xl font-semibold text-foreground">
          {t("settings.members.title")}
        </h1>
        <div className="flex items-center gap-1">
          <TooltipProvider delayDuration={300}>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant={viewMode === "list" ? "secondary" : "ghost"}
                  size="icon"
                  onClick={() => setViewMode("list")}
                  aria-label={t("settings.members.listView")}
                >
                  <List className="size-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>{t("settings.members.listView")}</TooltipContent>
            </Tooltip>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant={viewMode === "grid" ? "secondary" : "ghost"}
                  size="icon"
                  onClick={() => setViewMode("grid")}
                  aria-label={t("settings.members.gridView")}
                >
                  <LayoutGrid className="size-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>{t("settings.members.gridView")}</TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>
      </div>

      <div className="px-7 pb-4">
        <div className="flex items-center gap-3 rounded-2xl border border-black/[0.04] bg-muted/50 p-2">
          <div className="flex items-center gap-1">
            <TooltipProvider delayDuration={300}>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => openMemberInviteModal()}
                    disabled={!tenantId}
                    aria-label={t("settings.members.addMember")}
                  >
                    <Plus className="size-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  {t("settings.members.addMember")}
                </TooltipContent>
              </Tooltip>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    aria-label={t("settings.members.filter")}
                  >
                    <SlidersHorizontal className="size-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>{t("settings.members.filter")}</TooltipContent>
              </Tooltip>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    aria-label={t("settings.members.sort")}
                  >
                    <ArrowDownUp className="size-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>{t("settings.members.sort")}</TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>
          <div className="relative flex min-w-[240px] flex-1 items-center">
            <Search className="pointer-events-none absolute left-3 h-3.5 w-3.5 text-black/45" />
            <Input
              placeholder={t("common.search")}
              value={searchQuery}
              onChange={(e) => handleSearch(e.target.value)}
              className="rounded-xl border-black/10 bg-white pl-9 text-sm"
            />
          </div>
        </div>
      </div>

      {error ? (
        <div className="px-7 py-12 text-center text-sm text-red-500">
          {String(error)}
        </div>
      ) : isPending ? (
        <div className="px-7 py-12 text-center text-sm text-muted-foreground">
          {t("common.loading")}
        </div>
      ) : filteredMembers.length === 0 && !searchQuery ? (
        <div className="px-7">
          <EmptyState />
        </div>
      ) : filteredMembers.length === 0 ? (
        <div className="px-7 py-12 text-center text-sm text-muted-foreground">
          {t("settings.members.noResults", { query: searchQuery })}
        </div>
      ) : viewMode === "list" ? (
        <MembersListView
          members={paginatedMembers}
          selectedIds={selectedIds}
          isAllSelected={isAllSelected}
          onToggleSelectAll={toggleSelectAll}
          onToggleSelect={toggleSelect}
        />
      ) : (
        <MembersGridView members={paginatedMembers} />
      )}

      {filteredMembers.length > 0 && (
        <MembersPagination
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={setCurrentPage}
        />
      )}
    </div>
  );
}

function MembersListView({
  members,
  selectedIds,
  isAllSelected,
  onToggleSelectAll,
  onToggleSelect,
}: {
  members: UserEntity[];
  selectedIds: Set<number>;
  isAllSelected: boolean;
  onToggleSelectAll: () => void;
  onToggleSelect: (id: number) => void;
}) {
  const { t } = useTranslation();
  return (
    <div className="px-7">
      <Table>
        <TableHeader>
          <TableRow className="border-b-black/20 hover:bg-transparent">
            <TableHead className="w-10">
              <Checkbox
                checked={isAllSelected}
                onCheckedChange={onToggleSelectAll}
              />
            </TableHead>
            <TableHead className="text-sm font-semibold text-foreground">
              {t("settings.members.colSerial")}
            </TableHead>
            <TableHead className="text-sm font-semibold text-foreground">
              {t("settings.members.colUser")}
            </TableHead>
            <TableHead className="text-sm font-semibold text-foreground">
              {t("field.email")}
            </TableHead>
            <TableHead className="text-sm font-semibold text-foreground">
              {t("field.role")}
            </TableHead>
            <TableHead className="text-sm font-semibold text-foreground">
              {t("settings.members.colJoined")}
            </TableHead>
            <TableHead className="w-10" />
          </TableRow>
        </TableHeader>
        <TableBody>
          {members.map((member) => (
            <MemberTableRow
              key={member.id}
              member={member}
              isSelected={selectedIds.has(member.id)}
              onToggleSelect={() => onToggleSelect(member.id)}
            />
          ))}
        </TableBody>
      </Table>
    </div>
  );
}

function MemberTableRow({
  member,
  isSelected,
  onToggleSelect,
}: {
  member: UserEntity;
  isSelected: boolean;
  onToggleSelect: () => void;
}) {
  const { t } = useTranslation();
  const [showActions, setShowActions] = useState(false);
  const displayName =
    member.name?.trim() || (member.email ?? "").split("@")[0] || "—";

  return (
    <TableRow
      className="group border-b-black/[0.04] hover:bg-muted/30"
      onMouseEnter={() => setShowActions(true)}
      onMouseLeave={() => setShowActions(false)}
    >
      <TableCell>
        <Checkbox checked={isSelected} onCheckedChange={onToggleSelect} />
      </TableCell>
      <TableCell className="text-sm text-muted-foreground">
        {getSerialId(member)}
      </TableCell>
      <TableCell>
        <div className="flex items-center gap-2">
          <img
            src={getAvatarUrl(member)}
            alt={displayName}
            className="size-8 rounded-full object-cover"
          />
          <span className="text-sm text-foreground">{displayName}</span>
        </div>
      </TableCell>
      <TableCell className="text-sm text-muted-foreground">
        {member.email ?? "—"}
      </TableCell>
      <TableCell className="text-sm text-muted-foreground">
        {member.role}
      </TableCell>
      <TableCell>
        <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
          <Calendar className="size-3.5" />
          <span>
            {member.createdAt ? formatDateTime(member.createdAt) : "—"}
          </span>
        </div>
      </TableCell>
      <TableCell>
        <div
          className={cn(
            "flex items-center gap-1 transition-opacity",
            showActions ? "opacity-100" : "opacity-0",
          )}
        >
          <TooltipProvider delayDuration={200}>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => {
                    if (!member.email) return;
                    navigator.clipboard.writeText(member.email);
                    toast.success(t("toast.copied"), {
                      position: "top-center",
                    });
                  }}
                  aria-label={t("settings.members.copyEmail")}
                >
                  <Copy className="size-3.5 text-muted-foreground" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>{t("settings.members.copyEmail")}</TooltipContent>
            </Tooltip>
          </TooltipProvider>
          <Button
            variant="ghost"
            size="icon"
            aria-label={t("settings.members.moreActions")}
          >
            <MoreHorizontal className="size-3.5 text-muted-foreground" />
          </Button>
        </div>
      </TableCell>
    </TableRow>
  );
}

function MembersGridView({ members }: { members: UserEntity[] }) {
  return (
    <div className="grid grid-cols-[repeat(auto-fill,minmax(90px,1fr))] gap-1 px-7">
      {members.map((member) => {
        const displayName =
          member.name?.trim() || (member.email ?? "").split("@")[0] || "—";
        return (
          <div
            key={member.id}
            className="group relative aspect-square overflow-hidden rounded-lg"
          >
            <img
              src={getAvatarUrl(member)}
              alt={displayName}
              className="size-full object-cover transition-transform duration-300 group-hover:scale-105"
            />
            <div className="absolute inset-0 flex items-end bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 transition-opacity duration-200 group-hover:opacity-100">
              <span className="w-full truncate px-2 pb-2 text-xs font-medium text-white">
                {displayName}
              </span>
            </div>
          </div>
        );
      })}
    </div>
  );
}

function MembersPagination({
  currentPage,
  totalPages,
  onPageChange,
}: {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}) {
  const { t } = useTranslation();
  const pages = Array.from({ length: Math.min(totalPages, 5) }, (_, i) => i + 1);

  return (
    <div className="flex items-center justify-center gap-2 px-7 py-6">
      {pages.map((page) => (
        <button
          key={page}
          onClick={() => onPageChange(page)}
          className={cn(
            "flex h-9 min-w-[100px] items-center justify-center rounded-lg text-sm font-medium transition-colors",
            page === currentPage
              ? "bg-muted text-foreground"
              : "text-muted-foreground hover:bg-muted/50",
          )}
        >
          {page}
        </button>
      ))}
      <button
        onClick={() => onPageChange(Math.max(1, currentPage - 1))}
        disabled={currentPage === 1}
        className="flex h-9 min-w-[100px] items-center justify-center rounded-lg text-sm text-muted-foreground transition-colors hover:bg-muted/50 disabled:opacity-30"
        aria-label={t("common.previous")}
      >
        ‹
      </button>
      <button
        onClick={() => onPageChange(Math.min(totalPages, currentPage + 1))}
        disabled={currentPage === totalPages}
        className="flex h-9 min-w-[100px] items-center justify-center rounded-lg text-sm text-muted-foreground transition-colors hover:bg-muted/50 disabled:opacity-30"
        aria-label={t("common.next")}
      >
        ›
      </button>
    </div>
  );
}

function EmptyState() {
  const { t } = useTranslation();
  return (
    <div className="flex flex-col items-center justify-center gap-3 rounded-2xl border border-dashed border-black/10 bg-white py-16 text-center">
      <div className="flex size-12 items-center justify-center rounded-xl border border-black/10 bg-black/[0.02] text-black/45">
        <UserPlus className="size-5" />
      </div>
      <div className="flex max-w-sm flex-col gap-1">
        <span className="text-sm font-medium text-foreground">
          {t("settings.members.emptyTitle")}
        </span>
        <span className="text-xs text-muted-foreground">
          {t("settings.members.emptyDescription")}
        </span>
      </div>
    </div>
  );
}
