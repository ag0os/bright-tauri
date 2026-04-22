// UniverseElements — grid of elements (characters, locations, etc) with type filter
function UniverseElements({ elements }) {
  const [q, setQ] = React.useState("");
  const [type, setType] = React.useState("");

  const types = [
    { value: "", label: "All", count: elements.length },
    { value: "character", label: "Characters", count: elements.filter(e => e.type === "character").length },
    { value: "location", label: "Locations", count: elements.filter(e => e.type === "location").length },
    { value: "item", label: "Items", count: elements.filter(e => e.type === "item").length },
    { value: "organization", label: "Organizations", count: elements.filter(e => e.type === "organization").length },
    { value: "event", label: "Events", count: elements.filter(e => e.type === "event").length },
    { value: "concept", label: "Concepts", count: elements.filter(e => e.type === "concept").length },
  ];

  const filtered = elements.filter((e) => {
    if (q && !e.name.toLowerCase().includes(q.toLowerCase())) return false;
    if (type && e.type !== type) return false;
    return true;
  });

  return (
    <div style={{ flex: 1, display: "flex", overflow: "hidden" }}>
      {/* Sidebar filters */}
      <div style={{ width: 220, flexShrink: 0, borderRight: "1px solid var(--border)", padding: "20px 12px", display: "flex", flexDirection: "column", gap: 4, background: "var(--surface)" }}>
        <div style={{ fontSize: 11, fontWeight: 500, textTransform: "uppercase", letterSpacing: "0.08em", color: "var(--fg3)", padding: "0 8px 8px" }}>Element types</div>
        {types.map((t) => (
          <TypeFilter key={t.value || "all"} icon={t.value ? (t.value === "character" ? "User" : t.value === "location" ? "MapPin" : t.value === "item" ? "Package" : t.value === "organization" ? "Buildings" : t.value === "event" ? "Calendar" : t.value === "concept" ? "Lightbulb" : null) : "Globe"}
            label={t.label} count={t.count} active={type === t.value} onClick={() => setType(t.value)}/>
        ))}
      </div>

      {/* Main */}
      <div style={{ flex: 1, overflow: "auto", padding: 24 }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 20 }}>
          <div>
            <div className="bright-type"><div style={{ fontFamily: "var(--font-display)", fontSize: 32, fontWeight: 600, letterSpacing: "-0.02em", color: "var(--fg1)" }}>Universe</div></div>
            <div style={{ fontSize: 13, color: "var(--fg3)", marginTop: 2 }}>Characters, places, and the things that connect them.</div>
          </div>
          <Btn variant="primary" icon="Plus">New element</Btn>
        </div>
        <Input value={q} onChange={setQ} placeholder="Search elements." icon="Search" style={{ marginBottom: 20, maxWidth: 420 }}/>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: 14 }}>
          {filtered.map((e) => <ElementCard key={e.id} element={e}/>)}
        </div>
      </div>
    </div>
  );
}

function TypeFilter({ icon, label, count, active, onClick }) {
  const [h, setH] = React.useState(false);
  return (
    <button onClick={onClick} onMouseEnter={() => setH(true)} onMouseLeave={() => setH(false)}
      style={{
        display: "flex", alignItems: "center", gap: 10,
        padding: "8px 10px", borderRadius: 6, border: "none",
        background: active ? "var(--accent-subtle)" : h ? "var(--surface-hover)" : "transparent",
        color: active ? "var(--accent)" : "var(--fg1)",
        fontFamily: "var(--font-body)", fontSize: 13, fontWeight: active ? 500 : 400,
        cursor: "pointer", textAlign: "left", transition: "all 150ms",
      }}>
      {icon && <Icon name={icon} size={16} style={{ color: active ? "var(--accent)" : "var(--fg3)" }}/>}
      <span style={{ flex: 1 }}>{label}</span>
      <span style={{ fontFamily: "var(--font-mono)", fontSize: 11, color: active ? "var(--accent)" : "var(--fg3)", fontVariantNumeric: "tabular-nums" }}>{count}</span>
    </button>
  );
}

function ElementCard({ element }) {
  const [h, setH] = React.useState(false);
  const icon = ELEMENT_ICON[element.type] || "Package";
  return (
    <div onMouseEnter={() => setH(true)} onMouseLeave={() => setH(false)}
      style={{
        background: "var(--surface)", border: `1px solid ${h ? "var(--border-strong)" : "var(--border)"}`,
        borderRadius: 12, padding: 16, cursor: "pointer",
        boxShadow: h ? "var(--shadow-sm)" : "none",
        transition: "all 150ms var(--ease-out)",
        display: "flex", flexDirection: "column", gap: 12,
      }}>
      <div style={{ display: "flex", alignItems: "flex-start", gap: 12 }}>
        <div style={{
          width: 44, height: 44, borderRadius: 10,
          background: "var(--surface-2)",
          border: "1px solid var(--border)",
          display: "flex", alignItems: "center", justifyContent: "center",
          color: "var(--accent)", flexShrink: 0,
        }}>
          <Icon name={icon} size={22}/>
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontFamily: "var(--font-display)", fontSize: 17, fontWeight: 600, color: "var(--fg1)", letterSpacing: "-0.01em", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{element.name}</div>
          <div style={{ fontSize: 12, color: "var(--fg3)", marginTop: 2 }}>{element.tagline}</div>
        </div>
        {element.favorite && <div style={{ color: "var(--accent)" }}><Icon name="Star" size={14} filled={true}/></div>}
      </div>
      <div style={{ display: "flex", alignItems: "center", gap: 8, fontFamily: "var(--font-mono)", fontSize: 11, color: "var(--fg3)" }}>
        <Icon name="Link" size={11}/>
        <span style={{ fontVariantNumeric: "tabular-nums" }}>{element.relationships} relationship{element.relationships !== 1 ? "s" : ""}</span>
        <span style={{ opacity: 0.4 }}>·</span>
        <span style={{ textTransform: "capitalize" }}>{element.type}</span>
      </div>
    </div>
  );
}

window.UniverseElements = UniverseElements;
