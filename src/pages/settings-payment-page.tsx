import { Plus } from "lucide-react";
import { useTranslation } from "react-i18next";

type PaymentCard = {
  name: string;
  number: string;
  exp: string;
  logo: string;
  isDefault: boolean;
};

const CARDS: PaymentCard[] = [
  {
    name: "ByeWind",
    number: "9656  6598  1236  4698",
    exp: "Exp 06/25",
    logo: "/icons/visa-logo.svg",
    isDefault: true,
  },
  {
    name: "ByeWind",
    number: "1235  6321  1343  7542",
    exp: "Exp 06/25",
    logo: "/icons/mastercard-logo.svg",
    isDefault: false,
  },
  {
    name: "PayPal",
    number: "byewind@twitter.com",
    exp: "",
    logo: "/icons/paypal-logo.svg",
    isDefault: false,
  },
];

export default function SettingsPaymentPage() {
  const { t } = useTranslation();
  return (
    <div className="flex flex-col gap-7 p-7">
      <div className="flex flex-col gap-1">
        <h1 className="text-2xl font-semibold text-black">
          {t("settings.payment.title")}
        </h1>
        <p className="text-sm text-black/55">
          {t("settings.payment.description")}
        </p>
      </div>

      <section className="flex max-w-4xl flex-col gap-4">
        <div className="grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-3">
          {CARDS.map((card) => (
            <PaymentCardItem key={card.number} card={card} />
          ))}
        </div>

        <button
          type="button"
          className="flex items-center justify-center gap-2 rounded-2xl border border-dashed border-black/20 bg-white py-3 text-sm text-black/50 transition-colors hover:bg-black/[0.02] hover:text-black"
        >
          <Plus className="h-4 w-4" />
          {t("settings.payment.addMethod")}
        </button>
      </section>

      <div className="h-px max-w-4xl bg-black/10" />

      <section className="flex max-w-4xl flex-col gap-2">
        <h3 className="text-sm font-semibold text-black">
          {t("settings.payment.payoutTitle")}
        </h3>
        <p className="text-xs text-black/55">
          {t("settings.payment.payoutHint")}
        </p>
        <textarea
          placeholder={t("settings.payment.payoutPlaceholder")}
          className="mt-1 w-full rounded-xl border border-black/10 bg-white px-4 py-3 text-sm text-black outline-none placeholder:text-black/20 focus:border-black/20"
          rows={3}
        />
      </section>

      <div className="max-w-4xl rounded-xl border border-dashed border-black/10 bg-black/[0.02] px-4 py-3 text-xs text-black/50">
        {t("settings.payment.footerNote")}
      </div>
    </div>
  );
}

function PaymentCardItem({ card }: { card: PaymentCard }) {
  const { t } = useTranslation();
  return (
    <div className="flex flex-col gap-2 rounded-2xl border border-black/10 bg-white px-4 py-3 transition-colors hover:border-black/20">
      <div className="flex items-center gap-2">
        <span className="text-sm font-semibold text-black">{card.name}</span>
        {card.isDefault && (
          <span className="rounded bg-emerald-100 px-1.5 py-0.5 text-[10px] font-medium text-emerald-700">
            {t("settings.payment.defaultBadge")}
          </span>
        )}
      </div>
      <span className="text-sm tracking-wider text-black">{card.number}</span>
      <div className="flex items-center justify-between pt-1">
        {card.exp ? (
          <span className="text-xs text-black/55">{card.exp}</span>
        ) : (
          <span />
        )}
        <img src={card.logo} alt="" className="h-5 object-contain" />
      </div>
    </div>
  );
}
