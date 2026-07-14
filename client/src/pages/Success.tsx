import { useLocation } from "wouter";
import { useLanguage } from "@/contexts/LanguageContext";

export default function Success() {
  const [, setLocation] = useLocation();

  return (
    <html lang="ar" dir="rtl">
      <head>
        <meta charSet="UTF-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <title>نجح</title>
        <style>{`
          body { font-family: sans-serif; background-color: #f4f4f4; margin: 0; padding: 0; display: flex; align-items: center; justify-content: center; min-height: 100vh; }
          .success-container { background: white; padding: 40px; border-radius: 10px; text-align: center; box-shadow: 0 4px 10px rgba(0,0,0,0.1); max-width: 400px; }
          .success-icon { font-size: 60px; color: #8C0032; margin-bottom: 20px; }
          h1 { color: #333; margin-bottom: 10px; }
          p { color: #666; margin-bottom: 30px; }
          .btn { background: #8C0032; color: white; padding: 15px 30px; border: none; border-radius: 5px; font-weight: bold; cursor: pointer; font-size: 16px; }
        `}</style>
      </head>
      <body>
        <div className="success-container">
          <div className="success-icon">✓</div>
          <h1>تم بنجاح!</h1>
          <p>تم تقديم طلبك بنجاح. سيتم التواصل معك قريباً.</p>
          <button className="btn" onClick={() => setLocation("/")}>
            العودة إلى الرئيسية
          </button>
        </div>
      </body>
    </html>
  );
}
