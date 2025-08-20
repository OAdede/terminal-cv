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
    "open", "copy", "theme", "accent", "prompt", "banner", "clear",
    "history", "download", "repo", "site", "version", "sound"
];
const ALIASES = {
    h: "help",
    "?": "help",
    p: "projects",
    s: "skills",
    c: "contact",
    g: "open github",
    l: "open linkedin",
    r: "open repo",
    cls: "clear",
};

const CV_URL = `${import.meta.env.BASE_URL}OzanAhmetDede-CV.pdf`;
const OPEN = {
    github: "https://github.com/OAdede",
    linkedin: "https://www.linkedin.com/in/ozanahmetdede",
    cv: CV_URL,
    repo: "https://github.com/OAdede/terminal-cv",
    site: "https://OAdede.github.io/terminal-cv/",
};

export default function Terminal() {
    const [history, setHistory] = useState([]);
    const [input, setInput] = useState("");
    const [theme, setTheme] = useState(() => localStorage.getItem("theme") || "dark");
    const [accent, setAccent] = useState(() => localStorage.getItem("accent") || "");
    const [promptText, setPromptText] = useState(() => localStorage.getItem("prompt") || "ozan@cv:$");
    const [showBanner, setShowBanner] = useState(() => (localStorage.getItem("banner") ?? "on") !== "off");
    const [sound, setSound] = useState(() => localStorage.getItem("sound") || "off");

    const [cmdHistory, setCmdHistory] = useState(() => {
        try { return JSON.parse(localStorage.getItem("cmdHistory") || "[]"); }
        catch { return []; }
    });
    const [cmdIndex, setCmdIndex] = useState(-1);

    const inputRef = useRef(null);
    const boxRef = useRef(null);
    const endRef = useRef(null);
    const audioCtxRef = useRef(null);

    // karşılama
    useEffect(() => {
        setHistory(h => {
            if (h.length) return h;
            const arr = [];
            if (showBanner) arr.push(asciiArt);
            arr.push('Merhaba, ben Ozan Ahmet Dede. "help" yaz ve başla.');
            return arr;
        });
    }, [showBanner]);

    // tema
    useEffect(() => {
        const all = Object.values(THEME_CLASS).filter(Boolean);
        document.body.classList.remove(...all);
        const cls = THEME_CLASS[theme];
        if (cls) document.body.classList.add(cls);
        localStorage.setItem("theme", theme);
    }, [theme]);

    // accent
    useEffect(() => {
        if (accent) setAccentVar(accent);
        else resetAccentVar();
    }, [accent]);

    // odak + auto scroll
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

    function saveCmdToHistory(line) {
        setCmdHistory(prev => {
            const next = [...prev, line];
            localStorage.setItem("cmdHistory", JSON.stringify(next));
            return next;
        });
    }

    function beep(freq = 880, duration = 0.05) {
        try {
            const Ctx = window.AudioContext || window.webkitAudioContext;
            const ctx = audioCtxRef.current || new Ctx();
            audioCtxRef.current = ctx;
            const osc = ctx.createOscillator();
            const gain = ctx.createGain();
            osc.type = "square";
            osc.frequency.value = freq;
            gain.gain.setValueAtTime(0.03, ctx.currentTime);
            gain.gain.exponentialRampToValueAtTime(0.00001, ctx.currentTime + duration);
            osc.connect(gain); gain.connect(ctx.destination);
            osc.start(); osc.stop(ctx.currentTime + duration);
        } catch (e) { /* sessiz geç */ }
    }

    function run(raw) {
        const original = raw.trim();
        if (!original) return;

        // alias genişletme
        const expanded = ALIASES[original] ? ALIASES[original] : original;

        print(`$ ${original}`);
        saveCmdToHistory(original);
        setCmdIndex(-1);

        const [cmd, ...args] = expanded.split(/\s+/);
        const c = cmd.toLowerCase();

        switch (c) {
            case "help": {
                const sub = (args[0] || "").toLowerCase();
                if (sub === "theme") {
                    print("theme list → mevcut temalar",
                        "theme <isim> → dark/amber/light/matrix/cyber/paper",
                        "theme random → rastgele tema");
                } else if (sub === "accent") {
                    print("accent #RRGGBB → vurgu rengini değiştir",
                        "accent random → rastgele renk",
                        "accent reset → temanın varsayılanına dön");
                } else if (sub === "prompt") {
                    print('prompt set "<metin>" | prompt reset');
                } else if (sub === "history") {
                    print("history → tüm geçmiş", "history <n> → son n komut", "history clear → geçmişi sil");
                } else if (sub === "sound") {
                    print("sound on/off → sesli geri bildirim");
                } else {
                    print(
                        "Komutlar:",
                        "  help [komut]   → yardım",
                        "  about          → kısaca ben",
                        "  projects [ad]  → projeler",
                        "  skills [kat]   → yetenekler",
                        "  contact        → iletişim",
                        "  social         → bağlantılar",
                        "  open <hedef>   → github | linkedin | cv | repo | site",
                        "  copy email     → e-postayı panoya kopyala",
                        "  cv             → PDF CV aç",
                        "  download       → PDF CV indir",
                        "  history [n]    → komut geçmişi",
                        "  theme [x]      → tema seç (theme list | theme random)",
                        "  accent #hex    → vurgu rengi (accent random/reset)",
                        "  prompt set ... → prompt metni",
                        "  banner on/off  → ASCII başlığı aç/kapat",
                        "  sound on/off   → tuşa basınca bip",
                        "  clear          → ekranı temizle",
                        "Alias: h=? help, p projects, s skills, c contact, g open github, l open linkedin, r open repo, cls clear"
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
                print(
                    "E-posta : dedeozanahmet@gmail.com",
                    "GitHub  : https://github.com/OAdede",
                    "LinkedIn: https://www.linkedin.com/in/ozanahmetdede"
                );
                break;

            case "social":
                print("github  → open github", "linkedin → open linkedin", "repo → open repo", "site → open site");
                break;

            case "open": {
                const key = (args[0] || "").toLowerCase();
                const url = OPEN[key];
                if (!url) print("Kullanım: open github | open linkedin | open cv | open repo | open site");
                else window.open(url, "_blank");
                break;
            }

            case "repo": window.open(OPEN.repo, "_blank"); break;
            case "site": window.open(OPEN.site, "_blank"); break;

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

            case "cv": window.open(CV_URL, "_blank"); break;

            case "download":
            case "cv-download":
            case "cvdl": {
                const a = document.createElement("a");
                a.href = CV_URL; a.download = "OzanAhmetDede-CV.pdf";
                document.body.appendChild(a); a.click(); a.remove();
                print("İndirme başlatıldı: OzanAhmetDede-CV.pdf");
                break;
            }

            case "history": {
                if (args[0] && args[0].toLowerCase() === "clear") {
                    localStorage.removeItem("cmdHistory");
                    setCmdHistory([]);
                    print("Komut geçmişi temizlendi.");
                    break;
                }
                const n = parseInt(args[0], 10);
                const list = isNaN(n) ? cmdHistory : cmdHistory.slice(-n);
                if (!list.length) { print("Henüz geçmiş yok."); break; }
                list.forEach((cmd, i) => print(`${i + 1}. ${cmd}`));
                break;
            }

            case "theme": {
                const t = (args[0] || "").toLowerCase();
                if (t === "list" || !t) print(`Temalar: ${THEMES.join(", ")}`, `Mevcut: ${theme}`);
                else if (t === "random") {
                    const r = THEMES[Math.floor(Math.random() * THEMES.length)];
                    setTheme(r); print(`Tema: ${r}`);
                } else if (THEMES.includes(t)) { setTheme(t); print(`Tema: ${t}`); }
                else print("Kullanım: theme list | theme random | theme <dark|amber|light|matrix|cyber|paper>");
                break;
            }

            case "accent": {
                const val = (args[0] || "").toLowerCase();
                if (!val) { print("Kullanım: accent #RRGGBB | accent random | accent reset"); break; }
                if (val === "reset") { setAccent(""); print("Accent resetlendi"); break; }
                if (val === "random") {
                    const hex = "#" + Math.floor(Math.random() * 0xffffff).toString(16).padStart(6, "0");
                    setAccent(hex); print(`Accent: ${hex}`); break;
                }
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

            case "sound": {
                const sub = (args[0] || "").toLowerCase();
                if (sub === "on") { setSound("on"); localStorage.setItem("sound", "on"); print("Sound: on"); }
                else if (sub === "off") { setSound("off"); localStorage.setItem("sound", "off"); print("Sound: off"); }
                else print("Kullanım: sound on | sound off");
                break;
            }

            case "version":
            case "ver":
                print("Terminal CV v1.2.0 — React 19 + Vite 7");
                break;

            case "clear":
                setHistory([]);
                break;

            default: {
                const s = getSuggestions(expanded);
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
        return COMMANDS.filter(c => c.startsWith(t)).concat(Object.keys(ALIASES).filter(a => a.startsWith(t)));
    }

    // input içi “ghost” öneri
    function getGhostText(text) {
        if (!text) return "";
        const s = getSuggestions(text);
        if (!s.length) return "";
        const suggest = s[0];
        if (text.endsWith(" ")) return text + suggest;
        const parts = text.split(/\s+/);
        parts[parts.length - 1] = suggest;
        return parts.join(" ");
    }
    const ghostText = getGhostText(input);

    function onKeyDown(e) {
        // Ctrl+L = clear
        if (e.ctrlKey && (e.key === "l" || e.key === "L")) {
            e.preventDefault();
            setHistory([]);
            if (sound === "on") beep(520, 0.05);
            return;
        }

        if (e.key === "Enter") {
            if (sound === "on") beep(760, 0.05);
            run(input);
            setInput("");
            return;
        }

        if (e.key === "Tab") {
            e.preventDefault();
            const s = getSuggestions(input);
            if (s.length === 1) {
                const parts = input.split(/\s+/);
                if (input.endsWith(" ")) setInput(input + s[0]);
                else { parts[parts.length - 1] = s[0]; setInput(parts.join(" ")); }
            } else if (s.length > 1) { print(s.join("  ")); }
            if (sound === "on") beep(520, 0.04);
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
                <div className="input-wrap">
                    <div className="ghost">{ghostText}</div>
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
            </div>

            <div ref={endRef} />
            <div className="hint">İpucu: h • p • s • l • r • download • history • theme random • sound on</div>
        </div>
    );
}
