import ApiKeysTab from "@/components/account/api-keys-tab";

// Developer > API Keys — thin page wrapper. All behaviour lives in
// ApiKeysTab (list, create, revoke, reveal modal). The page itself only
// provides the URL target so the router can point at it.

export default function DeveloperApiKeysPage() {
  return <ApiKeysTab />;
}
