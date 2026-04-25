import { useMemo, useState } from "react";
import { useParams } from "react-router-dom";
import { useTranslation } from "react-i18next";
import {
  Plus,
  SlidersHorizontal,
  ArrowDownUp,
  Search,
  List,
  LayoutGrid,
  Calendar,
  MoreHorizontal,
  Copy,
  UserMinus,
  UserPlus,
} from "lucide-react";
import { toast } from "sonner";
import Fallback from "@/components/fallback";
import Loader from "@/components/loader";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from "@/components/ui/table";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { useTenantMembersData } from "@/hooks/queries/use-tenant-members-data";
import { useRemoveTenantMember } from "@/hooks/mutations/tenant-member/use-remove-tenant-member";
import { useOpenMemberInviteModal } from "@/store/member-invite-modal";
import { useOpenAlertModal } from "@/store/alert-modal";
import { useSession } from "@/store/session";
import { formatTimeAgo } from "@/lib/time";
import { generateErrorMessage } from "@/lib/error";
import { cn } from "@/lib/utils";
import type { TenantMemberEntity } from "@/types";

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------
const ITEMS_PER_PAGE = 10;
const ROLE_LABEL: Record<string, string> = {
  owner: "Owner",
  admin: "Admin",
  user: "Member",
};

function getAvatarUrl(member: TenantMemberEntity) {
  const slug = member.email.replace(/[^a-z0-9]/gi, "");
  return `https://i.pravatar.cc/80?u=${slug}`;
}

function getSerialId(member: TenantMemberEntity) {
  return `#CM${String(member.id).padStart(4, "0")}`;
}

function getRoleDisplay(role: string) {
  return ROLE_LABEL[role] ?? role;
}

// ---------------------------------------------------------------------------
// Main Page
// ---------------------------------------------------------------------------
export default function SettingsMembersPage() {
  const params = useParams();
  const session = useSession();
  const { t } = useTranslation();
  const tenantId = params.tenantId ? Number(params.tenantId) : undefined;
  const openInviteModal = useOpenMemberInviteModal();
  const openAlertModal = useOpenAlertModal();

  const { data: members, error, isPending } = useTenantMembersData(tenantId);

  const { mutate: removeMember, isPending: isRemoveMemberPending } =
    useRemoveTenantMember({
      onSuccess: () => {
        toast.success(t("settings.members.removeSuccess"), {
          position: "top-center",
        });
      },
      onError: (apiError) => {
        toast.error(generateErrorMessage(apiError), {
          position: "top-center",
        });
      },
    });

  const currentUserId = useMemo(() => {
    if (!session) return null;
    const raw = session.user.id;
    return typeof raw === "number" ? raw : Number(raw);
  }, [session]);

  const handleRemoveClick = (member: TenantMemberEntity) => {
    if (!tenantId) return;
    const who = member.name ?? member.email;
    openAlertModal({
      title: t("settings.members.removeConfirmTitle", { who }),
      description: t("settings.members.removeConfirmDescription"),
      onPositive: () => removeMember({ tenantId, userId: member.user_id }),
    });
  };

  // View mode & search state
  const [viewMode, setViewMode] = useState<"list" | "grid">("list");
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedIds, setSelectedIds] = useState<Set<number>>(new Set());

  // Filtered members
  const filteredMembers = useMemo(() => {
    if (!members) return [];
    if (!searchQuery.trim()) return members;
    const q = searchQuery.toLowerCase();
    return members.filter(
      (m) =>
        (m.name?.toLowerCase().includes(q) ?? false) ||
        m.email.toLowerCase().includes(q) ||
        m.role.toLowerCase().includes(q),
    );
  }, [members, searchQuery]);

  // Pagination
  const totalPages = Math.max(1, Math.ceil(filteredMembers.length / ITEMS_PER_PAGE));
  const paginatedMembers = filteredMembers.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE,
  );

  // Reset page on search
  const handleSearch = (value: string) => {
    setSearchQuery(value);
    setCurrentPage(1);
  };

  // Selection handlers
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
      {/* Page title + view toggle */}
      <div className="flex items-center justify-between px-7 pt-7 pb-4">
        <h1 className="text-2xl font-semibold text-foreground">User List</h1>
        <div className="flex items-center gap-1">
          <TooltipProvider delayDuration={300}>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant={viewMode === "list" ? "secondary" : "ghost"}
                  size="icon-sm"
                  onClick={() => setViewMode("list")}
                  aria-label="List view"
                >
                  <List className="size-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>List view</TooltipContent>
            </Tooltip>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant={viewMode === "grid" ? "secondary" : "ghost"}
                  size="icon-sm"
                  onClick={() => setViewMode("grid")}
                  aria-label="Grid view"
                >
                  <LayoutGrid className="size-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>Grid view</TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>
      </div>

      {/* Toolbar — matches Shipments page pattern: tinted bar wrapping
          action icons + a search input. Icons sit on the left, the search
          expands to fill remaining space so the input feels primary (same
          prominence as the MBL search on the Ocean Shipments page). */}
      <div className="px-7 pb-4">
        <div className="flex items-center gap-3 rounded-2xl border border-black/[0.04] bg-muted/50 p-2">
          <div className="flex items-center gap-1">
            <TooltipProvider delayDuration={300}>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon-sm"
                    onClick={() => openInviteModal()}
                    disabled={!tenantId}
                    aria-label="Add member"
                  >
                    <Plus className="size-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>Add member</TooltipContent>
              </Tooltip>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button variant="ghost" size="icon-sm" aria-label="Filter">
                    <SlidersHorizontal className="size-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>Filter</TooltipContent>
              </Tooltip>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button variant="ghost" size="icon-sm" aria-label="Sort">
                    <ArrowDownUp className="size-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>Sort</TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>
          <div className="relative flex min-w-[240px] flex-1 items-center">
            <Search className="pointer-events-none absolute left-3 h-3.5 w-3.5 text-black/45" />
            <Input
              placeholder="Search"
              value={searchQuery}
              onChange={(e) => handleSearch(e.target.value)}
              className="rounded-xl border-black/10 bg-white pl-9 text-sm"
            />
          </div>
        </div>
      </div>

      {/* Content */}
      {error ? (
        <div className="px-7">
          <Fallback />
        </div>
      ) : isPending ? (
        <div className="px-7">
          <Loader />
        </div>
      ) : filteredMembers.length === 0 && !searchQuery ? (
        <div className="px-7">
          <EmptyState onInvite={() => openInviteModal()} />
        </div>
      ) : filteredMembers.length === 0 ? (
        <div className="px-7 py-12 text-center text-sm text-muted-foreground">
          No members matching &quot;{searchQuery}&quot;
        </div>
      ) : viewMode === "list" ? (
        <MembersListView
          members={paginatedMembers}
          currentUserId={currentUserId}
          selectedIds={selectedIds}
          isAllSelected={isAllSelected}
          onToggleSelectAll={toggleSelectAll}
          onToggleSelect={toggleSelect}
          onRemove={handleRemoveClick}
          isRemoving={isRemoveMemberPending}
        />
      ) : (
        <MembersGridView members={paginatedMembers} />
      )}

      {/* Pagination */}
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

// ---------------------------------------------------------------------------
// List View (Table)
// ---------------------------------------------------------------------------
function MembersListView({
  members,
  currentUserId,
  selectedIds,
  isAllSelected,
  onToggleSelectAll,
  onToggleSelect,
  onRemove,
  isRemoving,
}: {
  members: TenantMemberEntity[];
  currentUserId: number | null;
  selectedIds: Set<number>;
  isAllSelected: boolean;
  onToggleSelectAll: () => void;
  onToggleSelect: (id: number) => void;
  onRemove: (member: TenantMemberEntity) => void;
  isRemoving: boolean;
}) {
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
              Serial
            </TableHead>
            <TableHead className="text-sm font-semibold text-foreground">
              User
            </TableHead>
            <TableHead className="text-sm font-semibold text-foreground">
              Email
            </TableHead>
            <TableHead className="text-sm font-semibold text-foreground">
              Role
            </TableHead>
            <TableHead className="text-sm font-semibold text-foreground">
              Registration date
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
              isSelf={
                currentUserId !== null && member.user_id === currentUserId
              }
              onToggleSelect={() => onToggleSelect(member.id)}
              onRemove={() => onRemove(member)}
              isRemoving={isRemoving}
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
  isSelf,
  onToggleSelect,
  onRemove,
  isRemoving,
}: {
  member: TenantMemberEntity;
  isSelected: boolean;
  isSelf: boolean;
  onToggleSelect: () => void;
  onRemove: () => void;
  isRemoving: boolean;
}) {
  const [showActions, setShowActions] = useState(false);
  const displayName =
    member.name?.trim() || member.email.split("@")[0];

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
        {member.email}
      </TableCell>
      <TableCell className="text-sm text-muted-foreground">
        {getRoleDisplay(member.role)}
      </TableCell>
      <TableCell>
        <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
          <Calendar className="size-3.5" />
          <span>
            {member.created_at ? formatTimeAgo(member.created_at) : "-"}
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
          {!isSelf && (
            <TooltipProvider delayDuration={200}>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon-xs"
                    disabled={isRemoving}
                    onClick={onRemove}
                    aria-label="Remove member"
                  >
                    <UserMinus className="size-3.5 text-destructive" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>Remove member</TooltipContent>
              </Tooltip>
            </TooltipProvider>
          )}
          <TooltipProvider delayDuration={200}>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon-xs"
                  onClick={() => {
                    navigator.clipboard.writeText(member.email);
                    toast.success("Email copied", { position: "top-center" });
                  }}
                  aria-label="Copy email"
                >
                  <Copy className="size-3.5 text-muted-foreground" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>Copy email</TooltipContent>
            </Tooltip>
          </TooltipProvider>
          <Button
            variant="ghost"
            size="icon-xs"
            aria-label="More actions"
          >
            <MoreHorizontal className="size-3.5 text-muted-foreground" />
          </Button>
        </div>
      </TableCell>
    </TableRow>
  );
}

// ---------------------------------------------------------------------------
// Grid View
// ---------------------------------------------------------------------------
function MembersGridView({ members }: { members: TenantMemberEntity[] }) {
  return (
    <div className="grid grid-cols-[repeat(auto-fill,minmax(90px,1fr))] gap-1 px-7">
      {members.map((member) => {
        const displayName =
          member.name?.trim() || member.email.split("@")[0];
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
            {/* Hover overlay with name */}
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

// ---------------------------------------------------------------------------
// Pagination
// ---------------------------------------------------------------------------
function MembersPagination({
  currentPage,
  totalPages,
  onPageChange,
}: {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}) {
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
        aria-label="Previous page"
      >
        ‹
      </button>
      <button
        onClick={() => onPageChange(Math.min(totalPages, currentPage + 1))}
        disabled={currentPage === totalPages}
        className="flex h-9 min-w-[100px] items-center justify-center rounded-lg text-sm text-muted-foreground transition-colors hover:bg-muted/50 disabled:opacity-30"
        aria-label="Next page"
      >
        ›
      </button>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Empty State
// ---------------------------------------------------------------------------
function EmptyState({ onInvite }: { onInvite: () => void }) {
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
      <Button
        type="button"
        onClick={onInvite}
        className="mt-2 gap-1.5 rounded-xl bg-black px-4 py-2 text-xs font-medium text-white hover:bg-black/80"
      >
        <UserPlus className="size-3.5" />
        {t("settings.members.emptyCta")}
      </Button>
    </div>
  );
}
