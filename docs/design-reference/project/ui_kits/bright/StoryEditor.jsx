// StoryEditor — focused writing view with sidebar, save indicator, word count, versions drawer trigger
function StoryEditor({ storyData, onBack, onOpenVersions }) {
  const [title, setTitle] = React.useState(storyData.title);
  const [saveState, setSaveState] = React.useState("saved"); // saving | saved | error
  const [showSide, setShowSide] = React.useState(true);

  // Simulate save cycle
  React.useEffect(() => {
    const t = setTimeout(() => setSaveState("saved"), 800);
    return () => clearTimeout(t);
  }, [title, saveState]);

  const totalWords = storyData.paragraphs.reduce((a, p) => a + p.split(/\s+/).length, 0);

  return (
    <div style={{ flex: 1, display: "flex", overflow: "hidden", background: "var(--bg)" }}>
      {/* Editor column */}
      <div style={{ flex: 1, display: "flex", flexDirection: "column", minWidth: 0 }}>
        {/* Editor chrome row */}
        <div style={{ display: "flex", alignItems: "center", gap: 10, padding: "10px 20px", borderBottom: "1px solid var(--border)", flexShrink: 0 }}>
          <Btn variant="icon" icon="ArrowLeft" onClick={onBack} title="Back to stories"/>
          <div style={{ flex: 1, minWidth: 0, display: "flex", alignItems: "center", gap: 10, overflow: "hidden" }}>
            <div style={{ fontSize: 12, color: "var(--fg3)", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis", minWidth: 0 }}>The Ash Cycle <span style={{ opacity: 0.5 }}>/</span> Novel one <span style={{ opacity: 0.5 }}>/</span></div>
            <span style={{ fontSize: 12, color: "var(--fg1)", whiteSpace: "nowrap", flexShrink: 0 }}>{storyData.type}</span>
          </div>
          <div style={{ flexShrink: 0 }}><SaveChip state={saveState}/></div>
          <div style={{ flexShrink: 0 }}><Btn variant="secondary" icon="Stack" onClick={onOpenVersions} size="sm">Versions</Btn></div>
          <div style={{ flexShrink: 0 }}><Btn variant="icon" icon="Gear" onClick={() => setShowSide(!showSide)} title="Toggle side panel"/></div>
        </div>

        {/* Reading canvas */}
        <div style={{ flex: 1, overflow: "auto", padding: "48px 32px 96px" }}>
          <div style={{ maxWidth: 720, margin: "0 auto" }}>
            <input value={title} onChange={(e) => { setTitle(e.target.value); setSaveState("saving"); }}
              style={{
                width: "100%", fontFamily: "var(--font-display)", fontSize: 48, fontWeight: 600,
                lineHeight: 1.1, letterSpacing: "-0.02em",
                background: "transparent", border: "none", outline: "none",
                color: "var(--fg1)", marginBottom: 8, padding: 0,
              }}/>
            <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 40, fontFamily: "var(--font-body)", fontSize: 13, color: "var(--fg3)" }}>
              <span>{storyData.type}</span><span>·</span>
              <span style={{ fontFamily: "var(--font-mono)", fontVariantNumeric: "tabular-nums" }}>{totalWords} words</span>
              <Pill tone="accent" style={{ marginLeft: 4 }}>v · {storyData.versionLabel}</Pill>
            </div>
            {storyData.paragraphs.map((p, i) => (
              <p key={i} style={{
                fontFamily: "var(--font-display)", fontSize: 18, lineHeight: 1.7, color: "var(--fg1)",
                marginBottom: 20, fontWeight: 400, textWrap: "pretty",
              }} dangerouslySetInnerHTML={{ __html: p.replace(/\*([^*]+)\*/g, '<em>$1</em>') }}/>
            ))}
            <div style={{ color: "var(--accent)", width: 2, height: 24, display: "inline-block", background: "var(--accent)", animation: "caret 1s step-end infinite" }}/>
          </div>
        </div>

        {/* Bottom status bar */}
        <div style={{ display: "flex", alignItems: "center", gap: 14, padding: "8px 20px", borderTop: "1px solid var(--border)", fontFamily: "var(--font-mono)", fontSize: 11, color: "var(--fg3)", flexShrink: 0 }}>
          <span>{totalWords.toLocaleString()} words</span>
          <span style={{ opacity: 0.4 }}>·</span>
          <span>{storyData.paragraphs.length} paragraphs</span>
          <span style={{ opacity: 0.4 }}>·</span>
          <span>Reading time ~{Math.max(1, Math.round(totalWords / 230))}m</span>
          <div style={{ flex: 1 }}/>
          <span>Newsreader 18 / 1.7</span>
        </div>
      </div>

      {/* Side metadata panel */}
      {showSide && <MetaPanel storyData={storyData}/>}
      <style>{`@keyframes caret { 50% { opacity: 0; } }`}</style>
    </div>
  );
}

function SaveChip({ state }) {
  const map = {
    saving: { tone: "accent", label: "Saving", icon: "Disk" },
    saved: { tone: "success", label: "Saved", icon: "Check" },
    error: { tone: "error", label: "Couldn't save — retry", icon: null },
  }[state];
  return (
    <span style={{
      display: "inline-flex", alignItems: "center", gap: 6,
      padding: "4px 10px", borderRadius: 999,
      background: map.tone === "accent" ? "var(--accent-subtle)" : map.tone === "success" ? "color-mix(in oklch, var(--success) 15%, transparent)" : "var(--error-soft)",
      color: map.tone === "accent" ? "var(--accent)" : map.tone === "success" ? "var(--success)" : "var(--error)",
      fontFamily: "var(--font-body)", fontSize: 12, fontWeight: 500,
    }}>
      {map.icon && <Icon name={map.icon} size={12}/>}
      <span>{map.label}</span>
    </span>
  );
}

function MetaPanel({ storyData }) {
  return (
    <div style={{
      width: 280, flexShrink: 0, borderLeft: "1px solid var(--border)",
      padding: 20, overflow: "auto", background: "var(--surface)",
      display: "flex", flexDirection: "column", gap: 24,
    }}>
      <MetaBlock label="Status">
        <Pill tone="accent">In progress</Pill>
      </MetaBlock>
      <MetaBlock label="Active version">
        <div style={{ fontFamily: "var(--font-body)", fontSize: 14, color: "var(--fg1)", fontWeight: 500 }}>{storyData.versionLabel}</div>
        <div style={{ fontFamily: "var(--font-mono)", fontSize: 11, color: "var(--fg3)", marginTop: 2 }}>12 snapshots · 3,412 words</div>
      </MetaBlock>
      <MetaBlock label="Linked elements">
        <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
          <LinkedElement icon="User" name="Calla Veyne" type="Character"/>
          <LinkedElement icon="User" name="Rhell" type="Character"/>
          <LinkedElement icon="MapPin" name="The Tower" type="Location"/>
          <LinkedElement icon="Package" name="The Ash Lantern" type="Item"/>
        </div>
      </MetaBlock>
      <MetaBlock label="Notes">
        <div style={{ fontFamily: "var(--font-display)", fontSize: 14, lineHeight: 1.6, color: "var(--fg2)", fontStyle: "italic" }}>
          The ledger discovery has to feel earned — don't let Rhell interrupt until the third reading.
        </div>
      </MetaBlock>
    </div>
  );
}

function MetaBlock({ label, children }) {
  return (
    <div>
      <div style={{ fontFamily: "var(--font-body)", fontSize: 11, fontWeight: 500, textTransform: "uppercase", letterSpacing: "0.08em", color: "var(--fg3)", marginBottom: 8 }}>{label}</div>
      {children}
    </div>
  );
}

function LinkedElement({ icon, name, type }) {
  const [h, setH] = React.useState(false);
  return (
    <div onMouseEnter={() => setH(true)} onMouseLeave={() => setH(false)}
      style={{ display: "flex", alignItems: "center", gap: 10, padding: "6px 8px", borderRadius: 6, background: h ? "var(--surface-hover)" : "transparent", cursor: "pointer" }}>
      <div style={{ color: "var(--fg2)", display: "flex" }}><Icon name={icon} size={16}/></div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontSize: 13, color: "var(--fg1)", fontWeight: 500, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{name}</div>
        <div style={{ fontSize: 11, color: "var(--fg3)" }}>{type}</div>
      </div>
      <Icon name="Link" size={12} style={{ color: "var(--fg-muted)", opacity: h ? 1 : 0 }}/>
    </div>
  );
}

window.StoryEditor = StoryEditor;
