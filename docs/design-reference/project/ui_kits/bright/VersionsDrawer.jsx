// VersionsDrawer — right drawer showing named versions + snapshot history
function VersionsDrawer({ storyData, onClose }) {
  const [tab, setTab] = React.useState("versions");
  return (
    <>
      <div onClick={onClose} style={{
        position: "fixed", inset: 0, background: "var(--scrim)",
        zIndex: 40, animation: "fadeIn 200ms var(--ease-out)",
      }}/>
      <div style={{
        position: "fixed", top: 48, right: 0, bottom: 0, width: 420,
        background: "var(--surface)", borderLeft: "1px solid var(--border)",
        boxShadow: "var(--shadow-lg)", zIndex: 41,
        display: "flex", flexDirection: "column",
        animation: "slideIn 200ms var(--ease-out)",
      }}>
        <div style={{ padding: "16px 20px", borderBottom: "1px solid var(--border)", display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 12 }}>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontFamily: "var(--font-display)", fontSize: 20, fontWeight: 600, color: "var(--fg1)", letterSpacing: "-0.01em" }}>Versions &amp; history</div>
            <div style={{ fontSize: 12, color: "var(--fg3)", marginTop: 2, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{storyData.title}</div>
          </div>
          <div style={{ flexShrink: 0 }}><Btn variant="icon" onClick={onClose} title="Close">✕</Btn></div>
        </div>
        <div style={{ display: "flex", gap: 2, padding: "8px 12px", borderBottom: "1px solid var(--border)" }}>
          <DrawerTab active={tab === "versions"} onClick={() => setTab("versions")}>Versions · {storyData.versions.length}</DrawerTab>
          <DrawerTab active={tab === "snapshots"} onClick={() => setTab("snapshots")}>Snapshots · {storyData.snapshots.length}</DrawerTab>
        </div>
        <div style={{ flex: 1, overflow: "auto", padding: 12 }}>
          {tab === "versions" ? (
            <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
              {storyData.versions.map((v) => <VersionItem key={v.id} v={v}/>)}
              <button style={{ display: "flex", alignItems: "center", gap: 8, padding: "10px 12px", border: "1px dashed var(--border-strong)", borderRadius: 8, background: "transparent", color: "var(--fg2)", fontFamily: "var(--font-body)", fontSize: 13, cursor: "pointer", marginTop: 8 }}>
                <Icon name="Plus" size={14}/> Name current state as a new version
              </button>
            </div>
          ) : (
            <div style={{ display: "flex", flexDirection: "column" }}>
              {storyData.snapshots.map((s, i) => <SnapshotItem key={s.id} s={s} last={i === storyData.snapshots.length - 1}/>)}
            </div>
          )}
        </div>
      </div>
      <style>{`
        @keyframes slideIn { from { transform: translateX(16px); opacity: 0; } to { transform: translateX(0); opacity: 1; } }
        @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
      `}</style>
    </>
  );
}

function DrawerTab({ active, children, onClick }) {
  return (
    <button onClick={onClick} style={{
      padding: "6px 12px", borderRadius: 6, border: "none",
      background: active ? "var(--accent-subtle)" : "transparent",
      color: active ? "var(--accent)" : "var(--fg2)",
      fontFamily: "var(--font-body)", fontSize: 13, fontWeight: 500,
      cursor: "pointer",
    }}>{children}</button>
  );
}

function VersionItem({ v }) {
  const [h, setH] = React.useState(false);
  return (
    <div onMouseEnter={() => setH(true)} onMouseLeave={() => setH(false)}
      style={{
        padding: 12, borderRadius: 8, cursor: "pointer",
        background: v.active ? "var(--accent-subtle)" : h ? "var(--surface-hover)" : "transparent",
        border: `1px solid ${v.active ? "color-mix(in oklch, var(--accent) 30%, transparent)" : "transparent"}`,
        display: "flex", alignItems: "center", gap: 12,
      }}>
      <div style={{ width: 28, height: 28, borderRadius: 6, background: "var(--surface-2)", color: v.active ? "var(--accent)" : "var(--fg2)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
        <Icon name="Stack" size={14}/>
      </div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8, minWidth: 0 }}>
          <div style={{ fontFamily: "var(--font-body)", fontSize: 14, fontWeight: 500, color: "var(--fg1)", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis", minWidth: 0, flex: 1 }}>{v.label}</div>
          {v.active && <div style={{ flexShrink: 0 }}><Pill tone="accent">Active</Pill></div>}
        </div>
        <div style={{ fontFamily: "var(--font-mono)", fontSize: 11, color: "var(--fg3)", marginTop: 2, fontVariantNumeric: "tabular-nums" }}>
          {v.snapshots} snapshots · {v.words.toLocaleString()} words · edited {v.lastEdited}
        </div>
      </div>
    </div>
  );
}

function SnapshotItem({ s, last }) {
  const [h, setH] = React.useState(false);
  const neg = s.delta.startsWith("-");
  return (
    <div onMouseEnter={() => setH(true)} onMouseLeave={() => setH(false)}
      style={{ display: "flex", gap: 12, padding: "8px 8px 8px 4px", cursor: "pointer", borderRadius: 6, background: h ? "var(--surface-hover)" : "transparent" }}>
      <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 4 }}>
        <div style={{ width: 8, height: 8, borderRadius: "50%", background: "var(--accent)", border: "2px solid var(--surface)", outline: "1px solid var(--accent)", marginTop: 6 }}/>
        {!last && <div style={{ flex: 1, width: 1, background: "var(--border)" }}/>}
      </div>
      <div style={{ flex: 1, paddingBottom: 10 }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <div style={{ fontFamily: "var(--font-body)", fontSize: 13, fontWeight: 500, color: "var(--fg1)" }}>{s.label}</div>
          <div style={{ fontFamily: "var(--font-mono)", fontSize: 11, color: "var(--fg3)", fontVariantNumeric: "tabular-nums" }}>{s.time}</div>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 8, marginTop: 4, fontFamily: "var(--font-mono)", fontSize: 11, color: "var(--fg3)", fontVariantNumeric: "tabular-nums" }}>
          <span>{s.words.toLocaleString()} words</span>
          <span style={{ color: neg ? "var(--error)" : "var(--success)" }}>{s.delta}</span>
        </div>
      </div>
    </div>
  );
}

window.VersionsDrawer = VersionsDrawer;
