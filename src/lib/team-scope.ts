// Bridge between the team-scope Zustand store (React consumers) and the axios
// request interceptor (non-React). The store is the source of truth for UI; this
// module mirrors the value so the interceptor can read it synchronously without
// importing React or the store. URL (`/app/:teamId/*`) is ultimately
// authoritative — MemberOnlyLayout pushes the URL param into the store, whose
// setter relays here.

let currentTeamId: number | null = null;

export function getCurrentTeamId(): number | null {
  return currentTeamId;
}

export function setCurrentTeamId(teamId: number | null): void {
  currentTeamId = teamId;
}
