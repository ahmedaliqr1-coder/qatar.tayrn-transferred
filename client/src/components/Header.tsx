import { useLanguage } from "@/contexts/LanguageContext";

export default function Header() {
  const { language, setLanguage } = useLanguage();
  const isArabic = language === "ar";

  const toggleLanguage = () => {
    setLanguage(isArabic ? "en" : "ar");
  };

  return (
    <header className="bg-white border-b-2 border-[#8C0032] sticky top-0 z-50 shadow-sm w-full">
      <div className="max-w-xl mx-auto px-4 h-20 flex items-center justify-between">
        <div className="text-2xl text-[#8C0032] cursor-pointer hover:opacity-80 transition-opacity">
          &#9776;
        </div>
        <img 
          src="https://files.manuscdn.com/user_upload_by_module/session_file/310519663821954062/BkVFgBrnkZHoPjjv.png" 
          className="header-logo" 
          alt="Logo" 
        />
        <button 
          onClick={toggleLanguage} 
          className="text-xs font-bold px-4 py-2 rounded-full border-2 border-[#8C0032] text-[#8C0032] hover:bg-[#8C0032] hover:text-white transition-all"
        >
          {isArabic ? "English" : "العربية"}
        </button>
      </div>
    </header>
  );
}
