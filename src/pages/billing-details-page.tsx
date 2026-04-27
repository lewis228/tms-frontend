import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ChevronLeft, ChevronRight } from "lucide-react";
import AuthLayout from "@/components/layout/auth-layout";

export default function BillingDetailsPage() {
  const navigate = useNavigate();
  const [businessName, setBusinessName] = useState("");
  const [descriptor, setDescriptor] = useState("");
  const [description, setDescription] = useState("");
  const [contactEmail, setContactEmail] = useState("");

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
          <h3 className="mb-2 text-sm font-semibold text-black">Business Name</h3>
          <Input
            value={businessName}
            onChange={(e) => setBusinessName(e.target.value)}
            className="rounded-2xl border-black/10 px-4 py-3 text-sm placeholder:text-black/20"
          />
        </div>

        <div className="mb-5">
          <h3 className="mb-2 text-sm font-semibold text-black">Shortened Descriptor</h3>
          <Input
            value={descriptor}
            onChange={(e) => setDescriptor(e.target.value)}
            className="rounded-2xl border-black/10 px-4 py-3 text-sm placeholder:text-black/20"
          />
        </div>

        <div className="mb-5">
          <h3 className="mb-2 text-sm font-semibold text-black">Corporation Type</h3>
          <Select>
            <SelectTrigger className="rounded-2xl border-black/10 px-4 py-3 text-sm text-black/20 [&>svg]:text-black/55">
              <SelectValue placeholder="Select" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="llc">LLC</SelectItem>
              <SelectItem value="corporation">Corporation</SelectItem>
              <SelectItem value="partnership">Partnership</SelectItem>
              <SelectItem value="sole">Sole Proprietorship</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="mb-5">
          <h3 className="mb-2 text-sm font-semibold text-black">Business Description</h3>
          <Textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="min-h-[80px] rounded-2xl border-black/10 px-4 py-3 text-sm placeholder:text-black/20"
          />
        </div>

        <div className="mb-8">
          <h3 className="mb-2 text-sm font-semibold text-black">Contact Email</h3>
          <Input
            type="email"
            value={contactEmail}
            onChange={(e) => setContactEmail(e.target.value)}
            className="rounded-2xl border-black/10 px-4 py-3 text-sm placeholder:text-black/20"
          />
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
            onClick={() => navigate("/billing-card")}
            className="flex-1 gap-1 rounded-2xl bg-black text-sm text-white hover:bg-black/80"
          >
            Continue
            <ChevronRight className="h-4 w-4 text-white/40" />
          </Button>
        </div>
      </div>
    </AuthLayout>
  );
}
