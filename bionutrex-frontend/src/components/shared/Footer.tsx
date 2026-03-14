import { useState } from "react";
import { Link } from "react-router-dom";
import { Zap } from "lucide-react";
import { loadFooter } from "@/data/footerData";

const SOCIAL_ICONS: Record<string, string> = {
  instagram: "photo_camera",
  youtube: "smart_display",
  twitter: "close", // using 'X' look-alike — will render as material symbol
  facebook: "thumb_up",
  tiktok: "music_note",
};

function SocialIcon({ platform }: { platform: string }) {
  const icon = SOCIAL_ICONS[platform] ?? "link";
  return (
    <span className="material-symbols-outlined" style={{ fontSize: 18 }}>
      {icon}
    </span>
  );
}

export function Footer() {
  const data = loadFooter();
  const [email, setEmail] = useState("");
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;
    setSubmitted(true);
    setEmail("");
  };

  return (
    <footer className="bg-[#0a1628] text-white overflow-hidden">
      {/* Main grid */}
      <div className="max-w-7xl mx-auto px-6 pt-16 pb-10">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-[1.4fr_1fr_1fr_1.2fr] gap-10 lg:gap-8">

          {/* Col 1: Brand */}
          <div className="space-y-5">
            <Link to="/" className="flex items-center gap-2">
              <Zap className="w-7 h-7 text-[#00e5ff] fill-[#00e5ff]" />
              <span className="text-2xl font-black tracking-tighter uppercase italic text-white">
                Bionutrex
              </span>
            </Link>

            <p className="text-slate-400 text-sm leading-relaxed max-w-xs">
              {data.tagline}
            </p>

            {/* Social links */}
            <div className="flex items-center gap-3 pt-1">
              {data.socialLinks.map((social, i) => (
                <Link
                  key={i}
                  to={social.href}
                  className="w-9 h-9 rounded-full border border-white/10 flex items-center justify-center text-slate-400 hover:text-[#00e5ff] hover:border-[#00e5ff]/40 transition-all duration-200"
                  aria-label={social.platform}
                >
                  <SocialIcon platform={social.platform} />
                </Link>
              ))}
            </div>
          </div>

          {/* Nav columns */}
          {data.navColumns.map((col, ci) => (
            <div key={ci}>
              <p className="text-[10px] font-black tracking-[0.3em] uppercase text-[#00e5ff] mb-5">
                {col.title}
              </p>
              <ul className="space-y-3">
                {col.links.map((link, li) => (
                  <li key={li}>
                    <Link
                      to={link.href}
                      className="text-slate-400 text-sm font-medium hover:text-white transition-colors duration-200"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}

          {/* Newsletter */}
          <div>
            <p className="text-[10px] font-black tracking-[0.3em] uppercase text-[#00e5ff] mb-5">
              {data.newsletter.title}
            </p>
            <p className="text-slate-400 text-sm leading-relaxed mb-5">
              {data.newsletter.subtitle}
            </p>
            {submitted ? (
              <p className="text-[#00e5ff] text-sm font-bold">
                Suscrito correctamente.
              </p>
            ) : (
              <form onSubmit={handleSubmit} className="flex flex-col gap-2">
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder={data.newsletter.placeholder}
                  className="w-full px-4 py-2.5 rounded-lg bg-white/5 border border-white/10 text-sm text-white placeholder:text-slate-500 focus:outline-none focus:border-[#00e5ff]/40 transition-colors"
                />
                <button
                  type="submit"
                  className="w-full py-2.5 rounded-lg bg-[#0d40a5] hover:bg-[#0d40a5]/80 text-white text-xs font-black tracking-[0.2em] uppercase transition-colors"
                >
                  {data.newsletter.buttonLabel}
                </button>
              </form>
            )}
          </div>
        </div>
      </div>

      {/* Bottom bar */}
      <div className="border-t border-white/10">
        <div className="max-w-7xl mx-auto px-6 py-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          {/* Certifications */}
          <div className="flex flex-wrap items-center gap-2">
            {data.certifications.map((cert, i) => (
              <span
                key={i}
                className="text-[9px] font-black tracking-[0.25em] uppercase px-2.5 py-1 rounded border border-white/10 text-slate-400"
              >
                {cert}
              </span>
            ))}
          </div>

          <div className="flex items-center gap-4">
            <p className="text-slate-500 text-xs">{data.copyright}</p>
            <Link
              to="/admin"
              className="text-slate-600 hover:text-slate-400 text-[10px] font-medium tracking-widest uppercase transition-colors"
            >
              Acceso Admin
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}

export default Footer;
