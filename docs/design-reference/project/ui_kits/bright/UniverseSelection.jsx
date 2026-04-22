// UniverseSelection — entry screen. Grid of universes + "Create new".
function UniverseSelection({ universes, onSelect, onCreate }) {
  return (
    <div style={{
      flex: 1, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center",
      padding: "48px 32px", gap: 32,
      backgroundImage: "url(../../assets/paper-grain.svg)",
      backgroundRepeat: "repeat",
    }}>
      <div style={{ textAlign: "center", maxWidth: 640 }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 14, marginBottom: 16 }}>
          <img src="../../assets/bright-mark.svg" width="40" height="40" alt=""/>
          <div style={{ fontFamily: "var(--font-display)", fontStyle: "italic", fontWeight: 600, fontSize: 44, color: "var(--fg1)", letterSpacing: "-0.015em" }}>Bright</div>
        </div>
        <div className="bright-type">
          <div className="h3" style={{ fontFamily: "var(--font-display)", fontSize: 28, fontWeight: 600, color: "var(--fg1)", letterSpacing: "-0.02em" }}>Select a universe</div>
          <div style={{ fontSize: 15, color: "var(--fg3)", marginTop: 8 }}>Choose where you'll work today, or begin a new one.</div>
        </div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 260px))", gap: 16, maxWidth: 880 }}>
        {universes.map((u) => <UniverseTile key={u.id} universe={u} onClick={() => onSelect(u.id)}/>)}
        <CreateTile onClick={onCreate}/>
      </div>
    </div>
  );
}

function UniverseTile({ universe, onClick }) {
  const [h, setH] = React.useState(false);
  return (
    <button onClick={onClick} onMouseEnter={() => setH(true)} onMouseLeave={() => setH(false)}
      style={{
        padding: 28, borderRadius: 12, border: `1px solid ${h ? "var(--border-strong)" : "var(--border)"}`,
        background: "var(--surface)", cursor: "pointer", textAlign: "left",
        display: "flex", flexDirection: "column", gap: 12, minHeight: 180,
        transition: "all 150ms var(--ease-out)",
        boxShadow: h ? "var(--shadow-sm)" : "none",
      }}>
      <div style={{
        width: 48, height: 48, borderRadius: 10,
        background: `color-mix(in oklch, ${universe.accent} 18%, var(--surface-2))`,
        border: `1px solid color-mix(in oklch, ${universe.accent} 30%, transparent)`,
        display: "flex", alignItems: "center", justifyContent: "center",
        fontFamily: "var(--font-display)", fontStyle: "italic", fontWeight: 600, fontSize: 22,
        color: universe.accent,
      }}>{universe.name[0]}</div>
      <div style={{ flex: 1 }}>
        <div style={{ fontFamily: "var(--font-display)", fontSize: 22, fontWeight: 600, color: "var(--fg1)", letterSpacing: "-0.01em" }}>{universe.name}</div>
        <div style={{ fontSize: 13, color: "var(--fg3)", marginTop: 4 }}>{universe.subtitle}</div>
      </div>
    </button>
  );
}

function CreateTile({ onClick }) {
  const [h, setH] = React.useState(false);
  return (
    <button onClick={onClick} onMouseEnter={() => setH(true)} onMouseLeave={() => setH(false)}
      style={{
        padding: 28, borderRadius: 12,
        border: `1.5px dashed ${h ? "var(--accent)" : "var(--border-strong)"}`,
        background: h ? "var(--accent-subtle)" : "transparent",
        cursor: "pointer", textAlign: "left",
        display: "flex", flexDirection: "column", gap: 12, minHeight: 180,
        transition: "all 150ms var(--ease-out)",
        color: h ? "var(--accent)" : "var(--fg2)",
      }}>
      <div style={{
        width: 48, height: 48, borderRadius: 10,
        display: "flex", alignItems: "center", justifyContent: "center",
        border: `1px dashed ${h ? "var(--accent)" : "var(--border-strong)"}`,
      }}>
        <Icon name="Plus" size={22}/>
      </div>
      <div style={{ flex: 1 }}>
        <div style={{ fontFamily: "var(--font-display)", fontSize: 22, fontWeight: 600, letterSpacing: "-0.01em" }}>New universe</div>
        <div style={{ fontSize: 13, opacity: 0.8, marginTop: 4 }}>Begin a fresh project — a novel, a series, a desk of notes.</div>
      </div>
    </button>
  );
}

window.UniverseSelection = UniverseSelection;
