// AI Intake 모달 — PDF / 이미지 업로드 → 자동 추출 → 결과 미리보기.
//
// 백엔드 /api/v1/ai-intake/extract 호출. provider 는 백엔드 환경변수로 결정.
// 추출 결과 (snake_case fields) 를 그대로 표시. D/O 생성 연결은 다음 단계.
import { useState } from "react";
import { toast } from "sonner";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import Loader from "@/components/loader";
import { useAIIntakeModal } from "@/store/ai-intake-modal";
import { useExtractDeliveryOrderFromFile } from "@/hooks/mutations/ai-intake/use-extract-delivery-order";
import { generateErrorMessage } from "@/lib/error";
import type { AIIntakeResponse } from "@/api/ai-intake";

const ACCEPT = "image/jpeg,image/png,image/webp,image/heic,application/pdf";
const MAX_BYTES = 10 * 1024 * 1024;

export default function AIIntakeModal() {
  const modal = useAIIntakeModal();
  return (
    <Dialog
      open={modal.isOpen}
      onOpenChange={(o) => !o && modal.actions.close()}
    >
      <DialogContent className="!max-w-2xl">
        <DialogHeader>
          <DialogTitle className="font-sans">AI 로 D/O 자동 등록</DialogTitle>
        </DialogHeader>
        {modal.isOpen && <Body close={modal.actions.close} />}
      </DialogContent>
    </Dialog>
  );
}

function Body({ close }: { close: () => void }) {
  const [file, setFile] = useState<File | null>(null);
  const [result, setResult] = useState<AIIntakeResponse | null>(null);

  const { mutate: extract, isPending } = useExtractDeliveryOrderFromFile({
    onSuccess: () => {
      // result 는 mutate onSuccess 에서 받기 위해 mutateAsync 사용 권장.
      // 여기는 콜백 분리 — 아래 onClickExtract 가 mutateAsync 사용.
    },
    onError: (err) =>
      toast.error(generateErrorMessage(err), { position: "top-center" }),
  });

  const handleSelect = (f: File | null) => {
    setResult(null);
    if (!f) return setFile(null);
    if (f.size > MAX_BYTES) {
      toast.error(`파일 크기가 ${Math.round(MAX_BYTES / 1024 / 1024)}MB 를 초과합니다.`, {
        position: "top-center",
      });
      return;
    }
    setFile(f);
  };

  const onClickExtract = () => {
    if (!file) return;
    extract(file, {
      onSuccess: (data) => setResult(data),
    });
  };

  return (
    <div className="flex flex-col gap-4">
      {/* 1) 파일 선택 */}
      <div className="flex flex-col gap-2">
        <label className="text-sm font-medium">D/O 파일 (PDF / 이미지)</label>
        <input
          type="file"
          accept={ACCEPT}
          onChange={(e) => handleSelect(e.target.files?.[0] ?? null)}
          disabled={isPending}
          className="rounded-md border bg-background px-3 py-2 text-sm"
        />
        {file && (
          <p className="text-xs text-muted-foreground">
            {file.name} · {Math.round(file.size / 1024)} KB
          </p>
        )}
      </div>

      {/* 2) 추출 버튼 */}
      <div className="flex justify-end gap-2">
        <Button variant="outline" onClick={close} disabled={isPending}>
          닫기
        </Button>
        <Button onClick={onClickExtract} disabled={!file || isPending}>
          {isPending ? "추출 중..." : "추출"}
        </Button>
      </div>

      {/* 3) 진행 / 결과 */}
      {isPending && (
        <div className="flex justify-center py-6">
          <Loader />
        </div>
      )}

      {result && (
        <ResultView result={result} />
      )}
    </div>
  );
}

function ResultView({ result }: { result: AIIntakeResponse }) {
  const conf = Math.round(result.confidence * 100);
  const fields = result.fields;
  const rows: { key: string; label: string; value: string | null | undefined }[] = [
    { key: "bl_number", label: "B/L 번호", value: fields.bl_number },
    { key: "booking_number", label: "Booking 번호", value: fields.booking_number },
    { key: "reference", label: "Reference", value: fields.reference },
    { key: "container_number", label: "컨테이너 번호", value: fields.container_number },
    { key: "container_size", label: "사이즈", value: fields.container_size },
    { key: "container_type", label: "타입", value: fields.container_type },
    { key: "chassis_number", label: "섀시", value: fields.chassis_number },
    { key: "eta", label: "ETA", value: fields.eta },
    { key: "pickup_appointment", label: "Pickup", value: fields.pickup_appointment },
    { key: "delivery_appointment", label: "Delivery", value: fields.delivery_appointment },
    { key: "return_appointment", label: "Return", value: fields.return_appointment },
    { key: "demurrage_lfd", label: "Demurrage LFD", value: fields.demurrage_lfd },
    { key: "detention_lfd", label: "Detention LFD", value: fields.detention_lfd },
  ];

  return (
    <div className="rounded-md border bg-muted/20 p-3 text-sm">
      <div className="mb-2 flex items-center justify-between">
        <strong>추출 결과</strong>
        <span className="text-xs text-muted-foreground">
          provider={result.provider} · confidence {conf}%
        </span>
      </div>
      <table className="w-full text-xs">
        <tbody>
          {rows.map((r) => (
            <tr key={r.key} className="border-b last:border-0">
              <td className="w-40 py-1 text-muted-foreground">{r.label}</td>
              <td className="py-1 font-mono">{r.value || "—"}</td>
            </tr>
          ))}
        </tbody>
      </table>
      <p className="mt-3 text-xs text-muted-foreground">
        * 추출 결과를 D/O 생성 모달로 자동 prefill 하는 기능은 다음 단계에서 추가됩니다.
      </p>
    </div>
  );
}
