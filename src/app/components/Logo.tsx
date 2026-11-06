import { HTMLAttributes, useEffect, useState } from "react";
import logoImageSrc from "../../imports/Group_1-1.png";

interface LogoProps extends HTMLAttributes<HTMLDivElement> {
  variant?: "default" | "white";
  showText?: boolean;
  suffix?: React.ReactNode;
}

export function Logo({ variant = "default", showText = true, suffix, className = "", ...props }: LogoProps) {
  const [lang, setLang] = useState(() => localStorage.getItem("lang") || "ID");

  useEffect(() => {
    const handleLanguageChange = () => {
      setLang(localStorage.getItem("lang") || "ID");
    };

    window.addEventListener("languageChange", handleLanguageChange);
    return () => {
      window.removeEventListener("languageChange", handleLanguageChange);
    };
  }, []);

  return (
    <div className={`flex items-center gap-3 ${className}`} {...props}>
      <img 
        src={logoImageSrc} 
        alt="Virelia Logo" 
        className="max-h-12 w-auto object-contain"
      />
      
      {showText && (
        <div className="flex flex-col">
          <h1 className={`text-2xl font-extrabold tracking-tight leading-none ${variant === 'white' ? 'text-white' : 'text-gray-900'}`}>
            Virelia<span className={variant === 'white' ? 'text-pink-300' : 'text-[#D94F8A]'}>™</span>
            {suffix && <span className="ml-1.5">{suffix}</span>}
          </h1>
          <span className={`text-[9px] font-bold tracking-widest uppercase mt-0.5 ${variant === 'white' ? 'text-white/70' : 'text-gray-500'}`}>
            {lang === "EN" ? "Early Detection, Better Protection" : "Deteksi Dini, Perlindungan Terbaik"}
          </span>
        </div>
      )}
    </div>
  );
}
