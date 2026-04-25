import { useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import { useTranslation } from "react-i18next";

// OAuth 팝업이 백엔드 redirect 를 받아 이 페이지로 들어온다.
// URL 쿼리에서 access_token 을 읽어 opener(부모 창) 로 postMessage 전송 후 자기 자신을 닫는다.
// 백엔드는 성공 시 `${VITE_PUBLIC_URL}/oauth/callback?access_token=...` 로,
// 실패 시 `?error=...` 로 리다이렉트해야 한다.
export default function OAuthCallbackPage() {
  const [params] = useSearchParams();
  const { t } = useTranslation();

  useEffect(() => {
    const accessToken = params.get("access_token");
    const error = params.get("error");

    if (!window.opener) {
      window.location.replace("/sign-in");
      return;
    }

    if (accessToken) {
      window.opener.postMessage(
        { type: "oauth-success", access_token: accessToken },
        window.location.origin,
      );
    } else {
      window.opener.postMessage(
        { type: "oauth-error", message: error ?? "Unknown error" },
        window.location.origin,
      );
    }
    window.close();
  }, [params]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-stone-100">
      <div className="text-body text-stone-600">{t("oauth.processing")}</div>
    </div>
  );
}
