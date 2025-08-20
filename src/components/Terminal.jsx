import React, { useEffect, useRef, useState } from "react";
import { asciiArt } from "../lib/ascii";
import { projects } from "../data/projects";
import { skills } from "../data/skills";

const THEMES = ["dark", "amber", "light", "matrix", "cyber", "paper"];
const THEME_CLASS = {
    dark: "",
    amber: "theme-amber",
    light: "theme-light",
    matrix: "theme-matrix",
    cyber: "theme-cyber",
    paper: "theme-paper",
};
const COMMANDS = [
    "help", "about", "projects", "skills", "contact", "cv", "social",
    "open", "copy", "theme", "accent", "prompt", "banner", "clear"
];
const CV_URL = `${import.meta.env.BASE_URL}OzanAhmetDede-CV.pdf`;
const OPEN = {
    github: "https://github.com/OAdede",
    linkedin: "https://www.linkedin.com/in/<profilini-ekle>",
    cv: CV_URL,
};

export default function Terminal() {
    const [history, setHistory] = useState([]);
    const [input, setInput] = useState("");
    const [theme, setTheme] = useState(() => localStorage.getItem("theme") || "dark");
    const [accent, setAccent] = useState(() => localStorage.getItem("accent") || "");
    const [promptText, setPromptText] = useState(() => localStorage.getItem("prompt") || "ozan@cv:$");
    const [showBanner, setShowBanner] = useState(() => (localStorage.getItem("banner") ?? "on") !== "off");
    const [cmdHistory, setCmdHistory] = useState([]);
    const [cmdIndex, setCmdIndex] = useState(-1);

    const inputRef = useRef(null);
    const boxRef = useRef(null);
    const endRef = useRef(null);

    // Karşılama
    useEffect(() => {
        setHistory(h => {
            if (h.length) return h;
            const arr = [];
            if (showBanner) arr.push(asciiArt);
            arr.push('Merhaba, ben Ozan Ahmet Dede. "help" yaz ve başla.');
            return arr;
        });
    }, [showBanner]);

    // Tema uygula
    useEffect(() => {
        const all = Object.values(THEME_CLASS).filter(Boolean);
        document.body.classList.remove(...all);
        const cls = THEME_CLASS[theme];
        if (cls) document.body.classList.add(cls);
        localStorage.setItem("theme", theme);
    }, [theme]);

    // Accent uygula
    useEffect(() => {
        if (accent) setAccentVar(accent);
        else resetAccentVar();
    }, [accent]);

    // Odak + otomatik kaydırma
    useEffect(() => { inputRef.current?.focus(); }, []);
    useEffect(() => { endRef.current?.scrollIntoView({ behavior: "smooth", block: "end" }); }, [history]);

    function print(...lines) { setHistory(h => [...h, ...lines]); }

    function setAccentVar(hex) {
        const root = document.documentElement;
        root.style.setProperty("--accent", hex);
        root.style.setProperty("--prompt", hex);
        root.style.setProperty("--caret", hex);
        localStorage.setItem("accent", hex);
    }
    function resetAccentVar() {
        const root = document.documentElement;
        root.style.removeProperty("--accent");
        root.style.removeProperty("--prompt");
        root.style.removeProperty("--caret");
        localStorage.removeItem("accent");
    }

    function run(raw) {
        const line = raw.trim();
        if (!line) return;

        print(`$ ${line}`);
        setCmdHistory(h => [...h, line]);
        setCmdIndex(-1);

        const [cmd, ...args] = line.split(/\s+/);
        const c = cmd.toLowerCase();

        switch (c) {
            case "help": {
                const sub = (args[0] || "").toLowerCase();
                if (sub === "theme") {
                    print("theme list → mevcut temalar", "theme <isim> → dark/amber/light/matrix/cyber/paper");
                } else if (sub === "accent") {
                    print("accent #RRGGBB → vurgu rengini değiştir", "accent reset → temanın varsayılanına dön");
                } else if (sub === "prompt") {
                    print('prompt set "<metin>" | prompt reset');
                } else if (sub === "projects") {
                    print("projects → hepsi | projects <isim> → tek proje");
                } else if (sub === "skills") {
                    print(`skills → hepsi | skills <kategori> → ${Object.keys(skills).join(", ")}`);
                } else {
                    print(
                        "Komutlar:",
                        "  help [komut]   → yardım",
                        "  about          → kısaca ben",
                        "  projects [ad]  → projeler",
                        "  skills [kat]   → yetenekler",
                        "  contact        → iletişim",
                        "  social         → bağlantılar",
                        "  open <hedef>   → github | linkedin | cv",
                        "  copy email     → e-postayı panoya kopyala",
                        "  cv             → PDF CV aç",
                        "  theme [x]      → tema seç (theme list)",
                        "  accent #hex    → vurgu rengi",
                        "  prompt set ... → prompt metni",
                        "  banner on/off  → ASCII başlığı aç/kapat",
                        "  clear          → ekranı temizle"
                    );
                }
                break;
            }

            case "about":
                print(
                    "Bilg. Müh. öğrencisi — web (React/Node) + donanım (Arduino).",
                    "BTK stajı + takım projeleri; pratik ve üretim odaklı."
                );
                break;

            case "projects": {
                if (!args.length) {
                    projects.forEach(p => {
                        print(`• ${p.name} — [${p.stack.join(", ")}]`);
                        print(`  ${p.desc}${p.url && p.url !== "#" ? ` — ${p.url}` : ""}`);
                    });
                } else {
                    const q = args.join(" ").toLowerCase();
                    const found = projects.find(p => p.name.toLowerCase().includes(q));
                    if (!found) print(`Proje bulunamadı: ${q}`);
                    else {
                        print(`${found.name} — [${found.stack.join(", ")}]`);
                        print(found.desc);
                        if (found.url) print(found.url);
                    }
                }
                break;
            }

            case "skills": {
                if (!args.length) {
                    Object.entries(skills).forEach(([k, arr]) => print(`${k}: ${arr.join(", ")}`));
                } else {
                    const k = (args[0] || "").toLowerCase();
                    if (skills[k]) print(`${k}: ${skills[k].join(", ")}`);
                    else print(`Kategori yok: ${k}`);
                }
                break;
            }

            case "contact":
                print("E-posta: dedeozanahmet@gmail.com", "GitHub : https://github.com/OAdede", "LinkedIn: (profil linkini ekle)");
                break;

            case "social":
                print("github  → open github", "linkedin → open linkedin");
                break;

            case "open": {
                const key = (args[0] || "").toLowerCase();
                const url = OPEN[key];
                if (!url) print("Kullanım: open github | open linkedin | open cv");
                else window.open(url, "_blank");
                break;
            }

            case "copy": {
                const what = (args[0] || "").toLowerCase();
                if (what === "email") {
                    navigator.clipboard?.writeText("dedeozanahmet@gmail.com");
                    print("Kopyalandı: dedeozanahmet@gmail.com");
                } else {
                    print("Kullanım: copy email");
                }
                break;
            }

            case "cv":
                window.open(CV_URL, "_blank");
                break;

            case "theme": {
                const t = (args[0] || "").toLowerCase();
                if (t === "list" || !t) print(`Temalar: ${THEMES.join(", ")}`, `Mevcut: ${theme}`);
                else if (THEMES.includes(t)) { setTheme(t); print(`Tema: ${t}`); }
                else print("Kullanım: theme list | theme <dark|amber|light|matrix|cyber|paper>");
                break;
            }

            case "accent": {
                const val = (args[0] || "").toLowerCase();
                if (!val) { print("Kullanım: accent #RRGGBB | accent reset"); break; }
                if (val === "reset") { setAccent(""); print("Accent resetlendi"); break; }
                const ok = /^#([0-9a-f]{3}|[0-9a-f]{6})$/i.test(val);
                if (!ok) { print("Geçersiz renk. Örnek: accent #00ff5a"); break; }
                setAccent(val); print(`Accent: ${val}`);
                break;
            }

            case "prompt": {
                const sub = (args[0] || "").toLowerCase();
                if (sub === "set") {
                    const text = args.slice(1).join(" ").trim();
                    if (!text) { print("Kullanım: prompt set ozan@cv:$"); break; }
                    setPromptText(text); localStorage.setItem("prompt", text); print(`Prompt: ${text}`);
                } else if (sub === "reset") {
                    setPromptText("ozan@cv:$"); localStorage.removeItem("prompt"); print("Prompt sıfırlandı.");
                } else {
                    print("Kullanım: prompt set <metin> | prompt reset");
                }
                break;
            }

            case "banner": {
                const sub = (args[0] || "").toLowerCase();
                if (sub === "on") { setShowBanner(true); localStorage.setItem("banner", "on"); print("Banner: on"); }
                else if (sub === "off") { setShowBanner(false); localStorage.setItem("banner", "off"); print("Banner: off"); }
                else print("Kullanım: banner on | banner off");
                break;
            }

            case "clear":
                setHistory([]);
                break;

            default: {
                const s = getSuggestions(line);
                if (s.length) print(`Bilinmeyen komut. Şunlar olabilir: ${s.join(", ")}`);
                else print("Bilinmeyen komut. 'help' yazabilirsin.");
            }
        }
    }

    function getSuggestions(text) {
        const t = text.toLowerCase();
        if (t.startsWith("theme ")) return THEMES.filter(x => x.startsWith(t.split(" ")[1] || ""));
        if (t.startsWith("open ")) return Object.keys(OPEN).filter(x => x.startsWith(t.split(" ")[1] || ""));
        if (t.startsWith("skills ")) return Object.keys(skills).filter(x => x.startsWith(t.split(" ")[1] || ""));
        if (t.startsWith("projects ")) return projects.map(p => p.name.toLowerCase())
            .filter(n => n.startsWith(t.split(" ").slice(1).join(" ")));
        return COMMANDS.filter(c => c.startsWith(t));
    }

    function onKeyDown(e) {
        if (e.key === "Enter") { run(input); setInput(""); return; }

        if (e.key === "Tab") {
            e.preventDefault();
            const s = getSuggestions(input);
            if (s.length === 1) {
                const parts = input.split(/\s+/);
                if (input.endsWith(" ")) setInput(input + s[0]);
                else { parts[parts.length - 1] = s[0]; setInput(parts.join(" ")); }
            } else if (s.length > 1) { print(s.join("  ")); }
            return;
        }

        if (e.key === "ArrowUp") {
            e.preventDefault();
            setCmdIndex(i => {
                const next = i < 0 ? cmdHistory.length - 1 : Math.max(i - 1, 0);
                if (next >= 0) setInput(cmdHistory[next] || "");
                return next;
            });
            return;
        }
        if (e.key === "ArrowDown") {
            e.preventDefault();
            setCmdIndex(i => {
                const next = i + 1;
                if (next >= cmdHistory.length) { setInput(""); return -1; }
                setInput(cmdHistory[next] || "");
                return next;
            });
            return;
        }
    }

    return (
        <div className="terminal" ref={boxRef} onClick={() => inputRef.current?.focus()} role="group" aria-label="Terminal CV">
            {history.map((line, i) => <div key={i} className="row out">{line}</div>)}

            <div className="row input-line" aria-live="polite">
                <span className="prompt">{promptText}</span>
                <input
                    ref={inputRef}
                    className="input"
                    value={input}
                    onChange={e => setInput(e.target.value)}
                    onKeyDown={onKeyDown}
                    spellCheck="false"
                    autoCapitalize="off"
                    autoComplete="off"
                    autoCorrect="off"
                    placeholder="help"
                />
            </div>

            <div ref={endRef} />
            <div className="hint">İpucu: theme list • accent #00ff5a • prompt set ozan@btk:$ • projects fitverse • open github</div>
        </div>
    );
}
