// Bright UI primitives — buttons, inputs, icons (Phosphor-style duotone SVGs).
// Icons redrawn from Phosphor visual vocabulary (2-stroke + 30% opacity fill).

const { useState } = React;

// ---------------- ICON ----------------
// Minimal inline Phosphor-style duotone icons. Each path: fill (duotone back) + stroke (line).
const ICONS = {
  CaretDown: (s) => (<svg viewBox="0 0 256 256" width={s} height={s}><path d="M216 96l-88 88-88-88Z" opacity=".3" fill="currentColor"/><path d="M216 96l-88 88-88-88" fill="none" stroke="currentColor" strokeWidth="16" strokeLinecap="round" strokeLinejoin="round"/></svg>),
  BookOpen: (s) => (<svg viewBox="0 0 256 256" width={s} height={s}><path d="M128 80v128L32 176V48Zm96-32v128l-96 32V80Z" opacity=".3" fill="currentColor"/><path d="M128 80L32 48v128l96 32m0-128l96-32v128l-96 32m0-128v128" fill="none" stroke="currentColor" strokeWidth="16" strokeLinecap="round" strokeLinejoin="round"/></svg>),
  Globe: (s) => (<svg viewBox="0 0 256 256" width={s} height={s}><circle cx="128" cy="128" r="96" opacity=".3" fill="currentColor"/><circle cx="128" cy="128" r="96" fill="none" stroke="currentColor" strokeWidth="16"/><path d="M32 128h192M128 32c24 28 36 60 36 96s-12 68-36 96c-24-28-36-60-36-96s12-68 36-96Z" fill="none" stroke="currentColor" strokeWidth="16" strokeLinecap="round"/></svg>),
  Sun: (s) => (<svg viewBox="0 0 256 256" width={s} height={s}><circle cx="128" cy="128" r="56" opacity=".3" fill="currentColor"/><circle cx="128" cy="128" r="56" fill="none" stroke="currentColor" strokeWidth="16"/><path d="M128 40v16M128 200v16M40 128h16M200 128h16M67 67l11 11M178 178l11 11M67 189l11-11M178 78l11-11" fill="none" stroke="currentColor" strokeWidth="16" strokeLinecap="round"/></svg>),
  Moon: (s) => (<svg viewBox="0 0 256 256" width={s} height={s}><path d="M232 152a88 88 0 01-128-78 88 88 0 10128 78Z" opacity=".3" fill="currentColor"/><path d="M232 152a88 88 0 01-128-78 88 88 0 10128 78Z" fill="none" stroke="currentColor" strokeWidth="16" strokeLinejoin="round"/></svg>),
  Gear: (s) => (<svg viewBox="0 0 256 256" width={s} height={s}><circle cx="128" cy="128" r="40" opacity=".3" fill="currentColor"/><circle cx="128" cy="128" r="40" fill="none" stroke="currentColor" strokeWidth="16"/><path d="M128 40v24M128 192v24M64 64l17 17M175 175l17 17M40 128h24M192 128h24M64 192l17-17M175 81l17-17" fill="none" stroke="currentColor" strokeWidth="16" strokeLinecap="round"/></svg>),
  Plus: (s) => (<svg viewBox="0 0 256 256" width={s} height={s}><path d="M128 40v176M40 128h176" fill="none" stroke="currentColor" strokeWidth="20" strokeLinecap="round"/></svg>),
  Search: (s) => (<svg viewBox="0 0 256 256" width={s} height={s}><circle cx="112" cy="112" r="72" opacity=".3" fill="currentColor"/><circle cx="112" cy="112" r="72" fill="none" stroke="currentColor" strokeWidth="16"/><path d="M163 163l53 53" fill="none" stroke="currentColor" strokeWidth="16" strokeLinecap="round"/></svg>),
  Books: (s) => (<svg viewBox="0 0 256 256" width={s} height={s}><path d="M56 40h48v176H56zm64 0h40v176h-40z" opacity=".3" fill="currentColor"/><path d="M56 40h48v176H56zm64 0h40v176h-40zm56 8l39 10-36 170-39-10z" fill="none" stroke="currentColor" strokeWidth="14" strokeLinejoin="round"/></svg>),
  FolderPlus: (s) => (<svg viewBox="0 0 256 256" width={s} height={s}><path d="M32 72v144h192V88H128L104 64H40a8 8 0 00-8 8Z" opacity=".3" fill="currentColor"/><path d="M32 72v144h192V88H128L104 64H40a8 8 0 00-8 8Z" fill="none" stroke="currentColor" strokeWidth="14" strokeLinejoin="round"/><path d="M128 128v48m-24-24h48" fill="none" stroke="currentColor" strokeWidth="14" strokeLinecap="round"/></svg>),
  Star: (s, filled) => (<svg viewBox="0 0 256 256" width={s} height={s}><path d="M128 24l30 64 70 6-54 48 18 68-64-40-64 40 18-68-54-48 70-6Z" fill={filled ? "currentColor" : "currentColor"} opacity={filled ? 1 : ".3"}/><path d="M128 24l30 64 70 6-54 48 18 68-64-40-64 40 18-68-54-48 70-6Z" fill="none" stroke="currentColor" strokeWidth="14" strokeLinejoin="round"/></svg>),
  Trash: (s) => (<svg viewBox="0 0 256 256" width={s} height={s}><path d="M216 56H40l16 152a8 8 0 008 8h128a8 8 0 008-8Z" opacity=".3" fill="currentColor"/><path d="M216 56H40m176 0l-16 152a8 8 0 01-8 8H64a8 8 0 01-8-8L40 56m56 0V40a16 16 0 0116-16h32a16 16 0 0116 16v16" fill="none" stroke="currentColor" strokeWidth="14" strokeLinejoin="round" strokeLinecap="round"/></svg>),
  ArrowLeft: (s) => (<svg viewBox="0 0 256 256" width={s} height={s}><path d="M216 128H40m64-64l-64 64 64 64" fill="none" stroke="currentColor" strokeWidth="18" strokeLinecap="round" strokeLinejoin="round"/></svg>),
  Check: (s) => (<svg viewBox="0 0 256 256" width={s} height={s}><path d="M224 72L104 192l-56-56" fill="none" stroke="currentColor" strokeWidth="20" strokeLinecap="round" strokeLinejoin="round"/></svg>),
  Clock: (s) => (<svg viewBox="0 0 256 256" width={s} height={s}><circle cx="128" cy="128" r="96" opacity=".3" fill="currentColor"/><circle cx="128" cy="128" r="96" fill="none" stroke="currentColor" strokeWidth="16"/><path d="M128 72v56l40 24" fill="none" stroke="currentColor" strokeWidth="16" strokeLinecap="round" strokeLinejoin="round"/></svg>),
  Stack: (s) => (<svg viewBox="0 0 256 256" width={s} height={s}><path d="M32 80l96-48 96 48-96 48Zm0 48l96 48 96-48M32 176l96 48 96-48" opacity=".3" fill="currentColor"/><path d="M32 80l96-48 96 48-96 48Zm0 48l96 48 96-48M32 176l96 48 96-48" fill="none" stroke="currentColor" strokeWidth="14" strokeLinejoin="round"/></svg>),
  FileText: (s) => (<svg viewBox="0 0 256 256" width={s} height={s}><path d="M200 88l-56-56H56a8 8 0 00-8 8v176a8 8 0 008 8h144a8 8 0 008-8V88Z" opacity=".3" fill="currentColor"/><path d="M200 88l-56-56H56a8 8 0 00-8 8v176a8 8 0 008 8h144a8 8 0 008-8V88Zm-56-56v56h56M88 152h80M88 184h80M88 120h40" fill="none" stroke="currentColor" strokeWidth="14" strokeLinejoin="round" strokeLinecap="round"/></svg>),
  Scroll: (s) => (<svg viewBox="0 0 256 256" width={s} height={s}><path d="M48 200V56a16 16 0 0116-16h128a16 16 0 0116 16v144a16 16 0 0116 16H64a16 16 0 01-16-16Z" opacity=".3" fill="currentColor"/><path d="M48 200V56a16 16 0 0116-16h128a16 16 0 0116 16v144M48 200a16 16 0 0016 16h144a16 16 0 0016-16V184H64M88 80h80M88 112h80M88 144h56" fill="none" stroke="currentColor" strokeWidth="14" strokeLinecap="round"/></svg>),
  Feather: (s) => (<svg viewBox="0 0 256 256" width={s} height={s}><path d="M208 80a32 32 0 00-32-32c-48 0-112 32-112 112v48h48C176 208 208 128 208 80Z" opacity=".3" fill="currentColor"/><path d="M208 80a32 32 0 00-32-32c-48 0-112 32-112 112v48h48C176 208 208 128 208 80Zm-16-16L48 208M160 88l-32 32h40m-64 32h32" fill="none" stroke="currentColor" strokeWidth="14" strokeLinecap="round" strokeLinejoin="round"/></svg>),
  FilmStrip: (s) => (<svg viewBox="0 0 256 256" width={s} height={s}><rect x="32" y="48" width="192" height="160" rx="8" opacity=".3" fill="currentColor"/><rect x="32" y="48" width="192" height="160" rx="8" fill="none" stroke="currentColor" strokeWidth="14"/><path d="M32 96h32m128 0h32M32 160h32m128 0h32M96 48v160M160 48v160" fill="none" stroke="currentColor" strokeWidth="14"/></svg>),
  BookBookmark: (s) => (<svg viewBox="0 0 256 256" width={s} height={s}><path d="M64 24h128v200l-40-24-40 24V48H64Z" opacity=".3" fill="currentColor"/><path d="M112 24H64a16 16 0 00-16 16v192l40-24 40 24V24m80 0v200l-40-24" fill="none" stroke="currentColor" strokeWidth="14" strokeLinejoin="round"/></svg>),
  User: (s) => (<svg viewBox="0 0 256 256" width={s} height={s}><circle cx="128" cy="96" r="56" opacity=".3" fill="currentColor"/><circle cx="128" cy="96" r="56" fill="none" stroke="currentColor" strokeWidth="14"/><path d="M32 216c16-40 56-64 96-64s80 24 96 64" fill="none" stroke="currentColor" strokeWidth="14" strokeLinecap="round"/></svg>),
  MapPin: (s) => (<svg viewBox="0 0 256 256" width={s} height={s}><path d="M200 104c0 72-72 128-72 128S56 176 56 104a72 72 0 01144 0Z" opacity=".3" fill="currentColor"/><path d="M200 104c0 72-72 128-72 128S56 176 56 104a72 72 0 01144 0Z" fill="none" stroke="currentColor" strokeWidth="14" strokeLinejoin="round"/><circle cx="128" cy="104" r="24" fill="none" stroke="currentColor" strokeWidth="14"/></svg>),
  Car: (s) => (<svg viewBox="0 0 256 256" width={s} height={s}><path d="M40 112l24-56h128l24 56v72H40Z" opacity=".3" fill="currentColor"/><path d="M40 112l24-56h128l24 56v72H40Zm16 72v16m144-16v16" fill="none" stroke="currentColor" strokeWidth="14" strokeLinejoin="round" strokeLinecap="round"/><circle cx="80" cy="144" r="12" fill="currentColor"/><circle cx="176" cy="144" r="12" fill="currentColor"/></svg>),
  Package: (s) => (<svg viewBox="0 0 256 256" width={s} height={s}><path d="M32 80v112l96 48 96-48V80l-96-48Z" opacity=".3" fill="currentColor"/><path d="M32 80v112l96 48 96-48V80l-96-48Zm0 0l96 48m0 112V128m96-48l-96 48M80 56l96 48" fill="none" stroke="currentColor" strokeWidth="14" strokeLinejoin="round"/></svg>),
  Buildings: (s) => (<svg viewBox="0 0 256 256" width={s} height={s}><path d="M32 216V88l72-40v168Zm72-136l96 24v112h-96" opacity=".3" fill="currentColor"/><path d="M32 216V88l72-40v168Zm72-136l96 24v112h-96" fill="none" stroke="currentColor" strokeWidth="14" strokeLinejoin="round"/><path d="M56 96h16m-16 32h16m-16 32h16m80-56h16m-16 32h16m-16 32h16" fill="none" stroke="currentColor" strokeWidth="12" strokeLinecap="round"/></svg>),
  Bird: (s) => (<svg viewBox="0 0 256 256" width={s} height={s}><path d="M96 88a64 64 0 01128 0c0 48-32 88-80 88h-32c-32 0-64-24-64-56v-8Z" opacity=".3" fill="currentColor"/><path d="M96 88a64 64 0 01128 0c0 48-32 88-80 88h-32c-32 0-64-24-64-56v-8Zm48 88L112 240m32-64l40 48" fill="none" stroke="currentColor" strokeWidth="14" strokeLinejoin="round" strokeLinecap="round"/><circle cx="180" cy="72" r="6" fill="currentColor"/></svg>),
  Calendar: (s) => (<svg viewBox="0 0 256 256" width={s} height={s}><rect x="32" y="48" width="192" height="176" rx="8" opacity=".3" fill="currentColor"/><path d="M32 96h192M80 24v48M176 24v48" fill="none" stroke="currentColor" strokeWidth="14" strokeLinecap="round"/><rect x="32" y="48" width="192" height="176" rx="8" fill="none" stroke="currentColor" strokeWidth="14"/></svg>),
  Lightbulb: (s) => (<svg viewBox="0 0 256 256" width={s} height={s}><path d="M176 232a8 8 0 01-8 8H88a8 8 0 01-8-8v-24h96Zm40-128a88 88 0 10-144 68v36h112v-36a88 88 0 0032-68Z" opacity=".3" fill="currentColor"/><path d="M176 232a8 8 0 01-8 8H88a8 8 0 01-8-8v-24h96Zm40-128a88 88 0 10-144 68v36h112v-36a88 88 0 0032-68Z" fill="none" stroke="currentColor" strokeWidth="14" strokeLinejoin="round"/></svg>),
  Link: (s) => (<svg viewBox="0 0 256 256" width={s} height={s}><path d="M122 166l-32 32a40 40 0 01-56-56l48-48a40 40 0 0156 0m-12 62l32-32a40 40 0 0156 56l-48 48a40 40 0 01-56 0" fill="none" stroke="currentColor" strokeWidth="16" strokeLinecap="round" strokeLinejoin="round"/></svg>),
  Disk: (s) => (<svg viewBox="0 0 256 256" width={s} height={s}><path d="M216 91.3V208a8 8 0 01-8 8H48a8 8 0 01-8-8V48a8 8 0 018-8h116.7a8 8 0 015.65 2.34l43.3 43.32a8 8 0 012.35 5.64Z" opacity=".3" fill="currentColor"/><path d="M216 91.3V208a8 8 0 01-8 8H48a8 8 0 01-8-8V48a8 8 0 018-8h116.7a8 8 0 015.65 2.34l43.3 43.32a8 8 0 012.35 5.64ZM80 216v-64h96v64M80 40v32h80" fill="none" stroke="currentColor" strokeWidth="14" strokeLinecap="round" strokeLinejoin="round"/></svg>),
};

function Icon({ name, size = 16, filled = false, style }) {
  const render = ICONS[name];
  if (!render) return null;
  return <span style={{ display: "inline-flex", color: "currentColor", ...style }}>{render(size, filled)}</span>;
}

// ---------------- BUTTON ----------------
function Btn({ variant = "primary", size = "md", icon, iconRight, children, onClick, disabled, title, style }) {
  const pad = size === "sm" ? "6px 10px" : size === "lg" ? "10px 18px" : "8px 14px";
  const fs = size === "sm" ? 13 : size === "lg" ? 15 : 14;
  const base = {
    display: "inline-flex", alignItems: "center", justifyContent: "center", gap: 8,
    fontFamily: "var(--font-body)", fontSize: fs, fontWeight: 500,
    padding: pad, borderRadius: 8, border: "1px solid transparent",
    cursor: disabled ? "not-allowed" : "pointer", opacity: disabled ? 0.4 : 1,
    transition: "background 150ms var(--ease-out), border-color 150ms, color 150ms",
    whiteSpace: "nowrap",
  };
  const variants = {
    primary: { background: "var(--accent)", color: "var(--fg-on-accent)", borderColor: "var(--accent)" },
    secondary: { background: "var(--surface-2)", color: "var(--fg1)", borderColor: "var(--border)" },
    ghost: { background: "transparent", color: "var(--fg2)" },
    danger: { background: "transparent", color: "var(--error)", borderColor: "color-mix(in oklch, var(--error) 40%, transparent)" },
    icon: { background: "transparent", color: "var(--fg2)", padding: 6, borderRadius: 6 },
  };
  const [h, setH] = useState(false);
  const hoverStyles = {
    primary: h ? { background: "var(--accent-hover)", borderColor: "var(--accent-hover)" } : {},
    secondary: h ? { background: "var(--surface-hover)" } : {},
    ghost: h ? { background: "var(--surface-hover)", color: "var(--fg1)" } : {},
    danger: h ? { background: "var(--error-soft)" } : {},
    icon: h ? { background: "var(--surface-hover)", color: "var(--fg1)" } : {},
  };
  return (
    <button type="button" onClick={disabled ? undefined : onClick} title={title} disabled={disabled}
      onMouseEnter={() => setH(true)} onMouseLeave={() => setH(false)}
      style={{ ...base, ...variants[variant], ...hoverStyles[variant], ...style }}>
      {icon && <Icon name={icon} size={size === "lg" ? 18 : 16}/>}
      {children}
      {iconRight && <Icon name={iconRight} size={size === "lg" ? 18 : 16}/>}
    </button>
  );
}

// ---------------- INPUT ----------------
function Input({ value, onChange, placeholder, icon, style }) {
  const [f, setF] = useState(false);
  return (
    <div style={{ position: "relative", display: "flex", alignItems: "center", ...style }}>
      {icon && <div style={{ position: "absolute", left: 10, color: f ? "var(--accent)" : "var(--fg3)", display: "flex", pointerEvents: "none" }}><Icon name={icon} size={16}/></div>}
      <input type="text" value={value || ""} onChange={(e) => onChange && onChange(e.target.value)} placeholder={placeholder}
        onFocus={() => setF(true)} onBlur={() => setF(false)}
        style={{
          width: "100%", fontFamily: "var(--font-body)", fontSize: 14,
          padding: icon ? "10px 12px 10px 34px" : "10px 12px",
          background: "var(--surface-2)", border: `1px solid ${f ? "var(--accent)" : "var(--border)"}`,
          borderRadius: 8, color: "var(--fg1)", outline: "none",
          boxShadow: f ? "0 0 0 3px var(--accent-subtle)" : "none",
          transition: "all 150ms var(--ease-out)",
        }}/>
    </div>
  );
}

// ---------------- SELECT ----------------
function Select({ value, onChange, options, style }) {
  return (
    <div style={{ position: "relative", ...style }}>
      <select value={value} onChange={(e) => onChange && onChange(e.target.value)}
        style={{
          appearance: "none", width: "100%", fontFamily: "var(--font-body)", fontSize: 14,
          padding: "9px 32px 9px 12px", background: "var(--surface-2)",
          border: "1px solid var(--border)", borderRadius: 8, color: "var(--fg1)", outline: "none",
          cursor: "pointer",
        }}>
        {options.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
      </select>
      <div style={{ position: "absolute", right: 10, top: "50%", transform: "translateY(-50%)", pointerEvents: "none", color: "var(--fg3)", display: "flex" }}>
        <Icon name="CaretDown" size={14}/>
      </div>
    </div>
  );
}

// ---------------- BADGE / PILL ----------------
function Pill({ tone = "default", children, style }) {
  const tones = {
    default: { bg: "var(--surface-2)", fg: "var(--fg2)", dot: "var(--fg-muted)" },
    accent: { bg: "var(--accent-subtle)", fg: "var(--accent)", dot: "var(--accent)" },
    success: { bg: "color-mix(in oklch, var(--success) 15%, transparent)", fg: "var(--success)", dot: "var(--success)" },
    error: { bg: "color-mix(in oklch, var(--error) 15%, transparent)", fg: "var(--error)", dot: "var(--error)" },
    info: { bg: "color-mix(in oklch, var(--info) 15%, transparent)", fg: "var(--info)", dot: "var(--info)" },
  };
  const t = tones[tone] || tones.default;
  return (
    <span style={{ display: "inline-flex", alignItems: "center", gap: 6, padding: "3px 10px", borderRadius: 999, background: t.bg, color: t.fg, fontFamily: "var(--font-body)", fontSize: 12, fontWeight: 500, ...style }}>
      <span style={{ width: 6, height: 6, borderRadius: "50%", background: t.dot }}/>
      {children}
    </span>
  );
}

// map story type -> icon
const STORY_ICON = {
  chapter: "BookBookmark", scene: "Scroll", poem: "Feather",
  screenplay: "FilmStrip", episode: "FilmStrip", outline: "FileText",
  treatment: "FileText", "short-story": "FileText",
};
const ELEMENT_ICON = {
  character: "User", location: "MapPin", vehicle: "Car", item: "Package",
  organization: "Buildings", creature: "Bird", event: "Calendar", concept: "Lightbulb",
};
const STATUS_TONE = { completed: "success", inprogress: "accent", draft: "default" };
const STATUS_LABEL = { completed: "Completed", inprogress: "In progress", draft: "Draft" };

Object.assign(window, { Icon, Btn, Input, Select, Pill, STORY_ICON, ELEMENT_ICON, STATUS_TONE, STATUS_LABEL });
