import { useState, useMemo } from "react";
import { NostrComments } from "../src";
import { Github, Package, Copy, Check, RotateCcw } from "lucide-react";

const LOCALES = [
  { code: "en", name: "English" },
  { code: "zh-CN", name: "简体中文" },
  { code: "zh-TW", name: "繁體中文" },
  { code: "ja", name: "日本語" },
  { code: "ko", name: "한국어" },
  { code: "es", name: "Español" },
  { code: "fr", name: "Français" },
  { code: "de", name: "Deutsch" },
  { code: "pt", name: "Português" },
  { code: "ru", name: "Русский" },
  { code: "ar", name: "العربية" },
  { code: "it", name: "Italiano" },
  { code: "nl", name: "Nederlands" },
  { code: "pl", name: "Polski" },
  { code: "tr", name: "Türkçe" },
  { code: "vi", name: "Tiếng Việt" },
  { code: "th", name: "ไทย" },
  { code: "id", name: "Bahasa Indonesia" },
  { code: "hi", name: "हिन्दी" },
  { code: "uk", name: "Українська" },
];

const DEFAULT_PRIMARY = "#319cfc";
const DEFAULT_BG = "#ffffff";
const DEFAULT_TEXT = "#1f2937";
const DEFAULT_RADIUS = 8;

function App() {
  const [theme, setTheme] = useState<"light" | "dark" | "auto">("auto");
  const [locale, setLocale] = useState("en");
  const [copiedInstall, setCopiedInstall] = useState(false);
  const [copiedCode, setCopiedCode] = useState(false);

  const [primaryColor, setPrimaryColor] = useState(DEFAULT_PRIMARY);
  const [bgColor, setBgColor] = useState(DEFAULT_BG);
  const [textColor, setTextColor] = useState(DEFAULT_TEXT);
  const [radius, setRadius] = useState(DEFAULT_RADIUS);
  const [url, setUrl] = useState(() =>
    typeof window !== "undefined"
      ? window.location.href
      : "https://example.com",
  );

  const customStylesCSS = useMemo(() => {
    const cssVars: string[] = [];
    if (primaryColor !== DEFAULT_PRIMARY)
      cssVars.push(`--nc-primary: ${primaryColor};`);
    if (bgColor !== DEFAULT_BG) cssVars.push(`--nc-bg: ${bgColor};`);
    if (textColor !== DEFAULT_TEXT) cssVars.push(`--nc-text: ${textColor};`);
    if (radius !== DEFAULT_RADIUS) cssVars.push(`--nc-radius-md: ${radius}px;`);
    if (cssVars.length === 0) return "";
    return `.demo-main .nostr-comments { ${cssVars.join(" ")} }`;
  }, [primaryColor, bgColor, textColor, radius]);

  const codeExample = useMemo(() => {
    const props: string[] = [`  url="${url}"`];
    if (theme !== "auto") props.push(`  theme="${theme}"`);
    if (locale !== "en") props.push(`  locale="${locale}"`);

    const cssVars: string[] = [];
    if (primaryColor !== DEFAULT_PRIMARY)
      cssVars.push(`  --nc-primary: ${primaryColor};`);
    if (bgColor !== DEFAULT_BG) cssVars.push(`  --nc-bg: ${bgColor};`);
    if (textColor !== DEFAULT_TEXT) cssVars.push(`  --nc-text: ${textColor};`);
    if (radius !== DEFAULT_RADIUS)
      cssVars.push(`  --nc-radius-md: ${radius}px;`);

    let code = "";
    if (cssVars.length > 0) {
      code += `.nostr-comments {\n${cssVars.join("\n")}\n}\n\n`;
    }

    code += `<NostrComments\n${props.join("\n")}\n/>`;

    return code;
  }, [theme, locale, url, primaryColor, bgColor, textColor, radius]);

  const handleCopyInstall = async () => {
    await navigator.clipboard.writeText("npm install nostr-comments");
    setCopiedInstall(true);
    setTimeout(() => setCopiedInstall(false), 2000);
  };

  const handleCopyCode = async () => {
    await navigator.clipboard.writeText(codeExample);
    setCopiedCode(true);
    setTimeout(() => setCopiedCode(false), 2000);
  };

  const handleReset = () => {
    setTheme("auto");
    setLocale("en");
    setPrimaryColor(DEFAULT_PRIMARY);
    setBgColor(DEFAULT_BG);
    setTextColor(DEFAULT_TEXT);
    setRadius(DEFAULT_RADIUS);
    setUrl(window.location.href);
  };

  return (
    <div className="demo" data-theme={theme}>
      <header className="demo-header">
        <div>
          <h1>Nostr Comments</h1>
          <p>Decentralized comments powered by Nostr</p>
        </div>
        <div className="demo-links">
          <a
            href="https://github.com/codytseng/nostr-comments"
            target="_blank"
            rel="noopener noreferrer"
          >
            <Github size={20} />
          </a>
          <a
            href="https://www.npmjs.com/package/nostr-comments"
            target="_blank"
            rel="noopener noreferrer"
          >
            <Package size={20} />
          </a>
        </div>
      </header>

      <div className="demo-body">
        <aside className="demo-sidebar">
          <div className="demo-control">
            <label>URL</label>
            <input
              type="text"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              placeholder="https://example.com"
            />
          </div>

          <div className="demo-control">
            <label>Theme</label>
            <div className="demo-theme-btns">
              {(["light", "dark", "auto"] as const).map((t) => (
                <button
                  key={t}
                  className={theme === t ? "active" : ""}
                  onClick={() => setTheme(t)}
                >
                  {t}
                </button>
              ))}
            </div>
          </div>

          <div className="demo-control">
            <label>Language</label>
            <select value={locale} onChange={(e) => setLocale(e.target.value)}>
              {LOCALES.map((l) => (
                <option key={l.code} value={l.code}>
                  {l.name}
                </option>
              ))}
            </select>
          </div>

          <div className="demo-control">
            <label>Primary</label>
            <div className="demo-color">
              <input
                type="color"
                value={primaryColor}
                onChange={(e) => setPrimaryColor(e.target.value)}
              />
              <input
                type="text"
                value={primaryColor}
                onChange={(e) => setPrimaryColor(e.target.value)}
              />
            </div>
          </div>

          <div className="demo-control">
            <label>Background</label>
            <div className="demo-color">
              <input
                type="color"
                value={bgColor}
                onChange={(e) => setBgColor(e.target.value)}
              />
              <input
                type="text"
                value={bgColor}
                onChange={(e) => setBgColor(e.target.value)}
              />
            </div>
          </div>

          <div className="demo-control">
            <label>Text</label>
            <div className="demo-color">
              <input
                type="color"
                value={textColor}
                onChange={(e) => setTextColor(e.target.value)}
              />
              <input
                type="text"
                value={textColor}
                onChange={(e) => setTextColor(e.target.value)}
              />
            </div>
          </div>

          <div className="demo-control">
            <label>Radius: {radius}px</label>
            <input
              type="range"
              min="0"
              max="24"
              value={radius}
              onChange={(e) => setRadius(Number(e.target.value))}
            />
          </div>

          <button className="demo-reset" onClick={handleReset}>
            <RotateCcw size={14} />
            <span>Reset</span>
          </button>
        </aside>

        <div className="demo-content">
          <main className="demo-main">
            {customStylesCSS && <style>{customStylesCSS}</style>}
            <NostrComments url={url} theme={theme} locale={locale} />
          </main>

          <aside className="demo-code">
            <div className="demo-install">
              <div className="demo-install-header">
                <span>Install</span>
                <button onClick={handleCopyInstall}>
                  {copiedInstall ? <Check size={14} /> : <Copy size={14} />}
                </button>
              </div>
              <div className="demo-install-cmd">
                <code>npm i nostr-comments</code>
              </div>
            </div>
            <div className="demo-example">
              <div className="demo-example-header">
                <span>Usage</span>
                <button onClick={handleCopyCode}>
                  {copiedCode ? <Check size={14} /> : <Copy size={14} />}
                </button>
              </div>
              <pre>{codeExample}</pre>
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
}

export default App;
