// TopBar — 48px app chrome, blur, universe picker, nav tabs, theme + settings
const { useState: useStateTB } = React;

function TopBar({ universes, currentUniverseId, onUniverseChange, activeTab, onTabChange, dark, onToggleDark, onOpenSettings }) {
  return (
    <div style={{
      height: 48, flexShrink: 0,
      background: "color-mix(in oklch, var(--surface) 85%, transparent)",
      backdropFilter: "blur(12px)",
      WebkitBackdropFilter: "blur(12px)",
      borderBottom: "1px solid var(--border)",
      display: "flex", alignItems: "center", padding: "0 16px", gap: 16,
      position: "relative", zIndex: 10,
    }}>
      <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
        <img src="../../assets/bright-mark.svg" width="22" height="22" alt=""/>
        <div className="wordmark" style={{ fontFamily: "var(--font-display)", fontStyle: "italic", fontWeight: 600, fontSize: 18, color: "var(--fg1)", letterSpacing: "-0.015em" }}>Bright</div>
      </div>

      <div style={{ width: 1, height: 20, background: "var(--border)" }}/>

      <UniversePicker universes={universes} value={currentUniverseId} onChange={onUniverseChange}/>

      <div style={{ flex: 1 }}/>

      <nav style={{ display: "flex", alignItems: "center", gap: 2 }}>
        <TabBtn active={activeTab === "stories"} icon="BookOpen" onClick={() => onTabChange("stories")}>Stories</TabBtn>
        <TabBtn active={activeTab === "universe"} icon="Globe" onClick={() => onTabChange("universe")}>Universe</TabBtn>
        <div style={{ width: 1, height: 20, background: "var(--border)", margin: "0 6px" }}/>
        <Btn variant="icon" icon={dark ? "Sun" : "Moon"} onClick={onToggleDark} title={dark ? "Switch to light mode" : "Switch to dark mode"}/>
        <Btn variant="icon" icon="Gear" onClick={onOpenSettings} title="Settings"/>
      </nav>
    </div>
  );
}

function TabBtn({ active, icon, children, onClick }) {
  const [h, setH] = useStateTB(false);
  return (
    <button onClick={onClick} onMouseEnter={() => setH(true)} onMouseLeave={() => setH(false)}
      style={{
        display: "inline-flex", alignItems: "center", gap: 6,
        fontFamily: "var(--font-body)", fontSize: 13, fontWeight: 500,
        padding: "6px 10px", borderRadius: 6, border: "none",
        background: active ? "var(--accent-subtle)" : h ? "var(--surface-hover)" : "transparent",
        color: active ? "var(--accent)" : h ? "var(--fg1)" : "var(--fg2)",
        cursor: "pointer", transition: "all 150ms",
      }}>
      <Icon name={icon} size={15}/>
      <span>{children}</span>
    </button>
  );
}

function UniversePicker({ universes, value, onChange }) {
  const [open, setOpen] = useStateTB(false);
  const current = universes.find((u) => u.id === value);
  return (
    <div style={{ position: "relative" }}>
      <button onClick={() => setOpen(!open)}
        style={{
          display: "inline-flex", alignItems: "center", gap: 8,
          fontFamily: "var(--font-body)", fontSize: 13, fontWeight: 500,
          padding: "5px 8px 5px 10px", borderRadius: 6, border: "1px solid transparent",
          background: open ? "var(--surface-2)" : "transparent", color: "var(--fg1)",
          cursor: "pointer", transition: "all 150ms",
          whiteSpace: "nowrap", maxWidth: 240,
        }}
        onMouseEnter={(e) => !open && (e.currentTarget.style.background = "var(--surface-hover)")}
        onMouseLeave={(e) => !open && (e.currentTarget.style.background = "transparent")}>
        <span style={{ width: 8, height: 8, borderRadius: "50%", background: current?.accent || "var(--accent)", flexShrink: 0 }}/>
        <span style={{ whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{current?.name || "Select universe"}</span>
        <Icon name="CaretDown" size={12} style={{ color: "var(--fg3)" }}/>
      </button>
      {open && (
        <>
          <div onClick={() => setOpen(false)} style={{ position: "fixed", inset: 0, zIndex: 20 }}/>
          <div style={{
            position: "absolute", top: "calc(100% + 4px)", left: 0, minWidth: 220,
            background: "var(--surface-raised)", border: "1px solid var(--border)", borderRadius: 8,
            boxShadow: "var(--shadow-md)", padding: 4, zIndex: 21,
          }}>
            {universes.map((u) => (
              <button key={u.id} onClick={() => { onChange(u.id); setOpen(false); }}
                style={{
                  width: "100%", display: "flex", alignItems: "center", gap: 10,
                  padding: "8px 10px", border: "none", borderRadius: 6,
                  background: u.id === value ? "var(--accent-subtle)" : "transparent",
                  color: u.id === value ? "var(--accent)" : "var(--fg1)",
                  fontFamily: "var(--font-body)", fontSize: 13, cursor: "pointer",
                  textAlign: "left",
                }}
                onMouseEnter={(e) => u.id !== value && (e.currentTarget.style.background = "var(--surface-hover)")}
                onMouseLeave={(e) => u.id !== value && (e.currentTarget.style.background = "transparent")}>
                <span style={{ width: 8, height: 8, borderRadius: "50%", background: u.accent }}/>
                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: 500 }}>{u.name}</div>
                  <div style={{ fontSize: 11, color: "var(--fg3)" }}>{u.subtitle}</div>
                </div>
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  );
}

window.TopBar = TopBar;
