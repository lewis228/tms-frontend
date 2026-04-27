import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui/button";
import { UserCircle, Briefcase, ChevronRight } from "lucide-react";
import AuthLayout from "@/components/layout/auth-layout";
import { cn } from "@/lib/utils";

type AccountType = "personal" | "corporate";

export default function ChooseAccountTypePage() {
  const navigate = useNavigate();
  const [selected, setSelected] = useState<AccountType>("personal");
  const { t } = useTranslation();

  return (
    <AuthLayout>
      <div className="flex flex-col items-center">
        <h1 className="mb-1 text-2xl font-semibold text-black">
          {t("auth.accountType.title")}
        </h1>
        <p className="mb-8 text-sm text-black/55">
          {t("auth.accountType.subtitle")}{" "}
          <a href="#" className="text-[#adadfb] hover:underline">
            {t("auth.accountType.helpLink")}
          </a>.
        </p>

        <div className="mb-8 flex w-full flex-col gap-4">
          <button
            type="button"
            onClick={() => setSelected("personal")}
            className={cn(
              "flex items-center gap-4 rounded-2xl border px-5 py-4 text-left transition-colors",
              selected === "personal"
                ? "border-black bg-white"
                : "border-black/10 bg-white hover:border-black/20",
            )}
          >
            <UserCircle className="h-8 w-8 shrink-0 text-black/55" />
            <div className="flex-1">
              <p className="text-sm font-semibold text-black">
                {t("auth.accountType.personalTitle")}
              </p>
              <p className="text-sm text-black/55">
                {t("auth.accountType.personalDescription")}
              </p>
            </div>
            <div
              className={cn(
                "flex h-5 w-5 shrink-0 items-center justify-center rounded-full border-2",
                selected === "personal"
                  ? "border-black bg-black"
                  : "border-black/20",
              )}
            >
              {selected === "personal" && (
                <div className="h-2 w-2 rounded-full bg-white" />
              )}
            </div>
          </button>

          <button
            type="button"
            onClick={() => setSelected("corporate")}
            className={cn(
              "flex items-center gap-4 rounded-2xl border px-5 py-4 text-left transition-colors",
              selected === "corporate"
                ? "border-black bg-white"
                : "border-black/10 bg-white hover:border-black/20",
            )}
          >
            <Briefcase className="h-8 w-8 shrink-0 text-black/55" />
            <div className="flex-1">
              <p className="text-sm font-semibold text-black">
                {t("auth.accountType.corporateTitle")}
              </p>
              <p className="text-sm text-black/55">
                {t("auth.accountType.corporateDescription")}
              </p>
            </div>
            <div
              className={cn(
                "flex h-5 w-5 shrink-0 items-center justify-center rounded-full border-2",
                selected === "corporate"
                  ? "border-black bg-black"
                  : "border-black/20",
              )}
            >
              {selected === "corporate" && (
                <div className="h-2 w-2 rounded-full bg-white" />
              )}
            </div>
          </button>
        </div>

        <Button
          onClick={() => navigate("/sign-up")}
          className="w-full gap-2 rounded-2xl bg-black py-3 text-sm font-medium text-white hover:bg-black/80"
        >
          {t("auth.accountType.continue")}
          <ChevronRight className="h-4 w-4 text-white/40" />
        </Button>
      </div>
    </AuthLayout>
  );
}
