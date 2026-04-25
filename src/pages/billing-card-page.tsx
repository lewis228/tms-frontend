import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ChevronLeft, CreditCard } from "lucide-react";
import AuthLayout from "@/components/layout/auth-layout";

export default function BillingCardPage() {
  const navigate = useNavigate();
  const [nameOnCard, setNameOnCard] = useState("");
  const [cardNumber, setCardNumber] = useState("");
  const [cvv, setCvv] = useState("");
  const [saveCard, setSaveCard] = useState(true);

  return (
    <AuthLayout>
      <div className="flex flex-col">
        <div className="mb-6 text-center">
          <h1 className="mb-1 text-2xl font-semibold text-black">Billing Details</h1>
          <p className="text-sm text-black/55">
            If you need more info, please check out{" "}
            <a href="#" className="text-[#adadfb] hover:underline">Help Page</a>.
          </p>
        </div>

        <div className="mb-5">
          <h3 className="mb-2 text-sm font-semibold text-black">Name On Card</h3>
          <Input
            value={nameOnCard}
            onChange={(e) => setNameOnCard(e.target.value)}
            className="rounded-2xl border-black/10 px-4 py-3 text-sm placeholder:text-black/20"
          />
        </div>

        <div className="mb-5">
          <h3 className="mb-2 text-sm font-semibold text-black">Card Number</h3>
          <Input
            value={cardNumber}
            onChange={(e) => setCardNumber(e.target.value)}
            className="rounded-2xl border-black/10 px-4 py-3 text-sm placeholder:text-black/20"
          />
        </div>

        <div className="mb-5 flex gap-4">
          <div className="flex-1">
            <h3 className="mb-2 text-sm font-semibold text-black">Expiration Date</h3>
            <div className="flex gap-3">
              <Select>
                <SelectTrigger className="rounded-2xl border-black/10 px-4 py-3 text-sm text-black/20 [&>svg]:text-black/55">
                  <SelectValue placeholder="Month" />
                </SelectTrigger>
                <SelectContent>
                  {Array.from({ length: 12 }, (_, i) => (
                    <SelectItem key={i + 1} value={String(i + 1).padStart(2, "0")}>
                      {String(i + 1).padStart(2, "0")}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Select>
                <SelectTrigger className="rounded-2xl border-black/10 px-4 py-3 text-sm text-black/20 [&>svg]:text-black/55">
                  <SelectValue placeholder="Year" />
                </SelectTrigger>
                <SelectContent>
                  {Array.from({ length: 10 }, (_, i) => (
                    <SelectItem key={i} value={String(2025 + i)}>
                      {2025 + i}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="w-[120px]">
            <h3 className="mb-2 text-sm font-semibold text-black">CVV</h3>
            <div className="relative">
              <Input
                value={cvv}
                onChange={(e) => setCvv(e.target.value)}
                placeholder="CVV"
                maxLength={4}
                className="rounded-2xl border-black/10 px-4 py-3 pr-9 text-sm placeholder:text-black/20"
              />
              <CreditCard className="absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-black/20" />
            </div>
          </div>
        </div>

        {/* Save card */}
        <div className="mb-8 flex items-center justify-between">
          <div>
            <p className="text-sm font-semibold text-black">Save Card for further billing?</p>
            <p className="text-xs text-black/55">If you need more info, please check budget planning.</p>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xs text-black/55">Save Card</span>
            <Switch checked={saveCard} onCheckedChange={setSaveCard} />
          </div>
        </div>

        {/* Buttons */}
        <div className="flex gap-4">
          <Button
            variant="outline"
            onClick={() => navigate(-1)}
            className="flex-1 gap-1 rounded-2xl border-black/10 text-sm text-black/55 hover:bg-black/[0.02]"
          >
            <ChevronLeft className="h-4 w-4" />
            Previous
          </Button>
          <Button
            className="flex-1 rounded-2xl bg-black text-sm text-white hover:bg-black/80"
          >
            Submit
          </Button>
        </div>
      </div>
    </AuthLayout>
  );
}
