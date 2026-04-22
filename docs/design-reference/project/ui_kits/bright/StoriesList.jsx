// StoriesList — grid of containers + story cards with filters
function StoriesList({ containers, stories, onOpenStory, onNew }) {
  const [q, setQ] = React.useState("");
  const [type, setType] = React.useState("");
  const [sort, setSort] = React.useState("lastEdited");

  const filteredStories = stories.filter((s) => {
    if (q && !s.title.toLowerCase().includes(q.toLowerCase())) return false;
    if (type && s.type !== type) return false;
    return true;
  });

  return (
    <div style={{ flex: 1, overflow: "auto", padding: 24 }}>
      {/* Header */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 20 }}>
        <div>
          <div className="bright-type"><div className="h2" style={{ fontFamily: "var(--font-display)", fontSize: 32, fontWeight: 600, letterSpacing: "-0.02em", color: "var(--fg1)" }}>Stories</div></div>
          <div style={{ fontSize: 13, color: "var(--fg3)", marginTop: 2 }}>{containers.length} containers · {stories.length} stories · {stories.reduce((a,s)=>a+s.words,0).toLocaleString()} words</div>
        </div>
        <div style={{ display: "flex", gap: 8 }}>
          <Btn variant="secondary" icon="FolderPlus">New container</Btn>
          <Btn variant="primary" icon="Plus" onClick={onNew}>New story</Btn>
        </div>
      </div>

      {/* Toolbar */}
      <div style={{ display: "flex", gap: 8, marginBottom: 20, flexWrap: "wrap" }}>
        <Input value={q} onChange={setQ} placeholder="Search stories and containers." icon="Search" style={{ flex: "1 1 280px", minWidth: 240 }}/>
        <Select value={type} onChange={setType} options={[
          { value: "", label: "All types" },
          { value: "chapter", label: "Chapters" }, { value: "scene", label: "Scenes" },
          { value: "poem", label: "Poems" }, { value: "outline", label: "Outlines" },
          { value: "screenplay", label: "Screenplays" },
        ]} style={{ width: 150 }}/>
        <Select value={sort} onChange={setSort} options={[
          { value: "lastEdited", label: "Last edited" },
          { value: "title", label: "Title" },
          { value: "wordCount", label: "Word count" },
        ]} style={{ width: 150 }}/>
      </div>

      {/* Containers section */}
      <SectionHeader>Containers</SectionHeader>
      <Grid>{containers.map((c) => <ContainerCard key={c.id} container={c}/>)}</Grid>

      {/* Stories section */}
      <SectionHeader style={{ marginTop: 28 }}>Stories</SectionHeader>
      <Grid>{filteredStories.map((s) => <StoryCard key={s.id} story={s} onClick={() => onOpenStory(s.id)}/>)}</Grid>
    </div>
  );
}

function SectionHeader({ children, style }) {
  return <div style={{
    fontFamily: "var(--font-body)", fontSize: 12, fontWeight: 500,
    textTransform: "uppercase", letterSpacing: "0.06em",
    color: "var(--fg3)", marginBottom: 10, ...style,
  }}>{children}</div>;
}

function Grid({ children }) {
  return <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(320px, 1fr))", gap: 14 }}>{children}</div>;
}

function ContainerCard({ container }) {
  const [h, setH] = React.useState(false);
  return (
    <div onMouseEnter={() => setH(true)} onMouseLeave={() => setH(false)}
      style={{
        background: "var(--surface)", border: `1px solid ${h ? "var(--border-strong)" : "var(--border)"}`,
        borderRadius: 12, padding: 18, cursor: "pointer",
        boxShadow: h ? "var(--shadow-sm)" : "none",
        transition: "all 150ms var(--ease-out)",
        display: "flex", flexDirection: "column", gap: 10,
      }}>
      <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
        <div style={{ width: 34, height: 34, borderRadius: 8, background: "var(--surface-2)", display: "flex", alignItems: "center", justifyContent: "center", color: "var(--fg2)" }}>
          <Icon name="Books" size={18}/>
        </div>
        <div style={{ fontSize: 11, color: "var(--fg3)", textTransform: "uppercase", letterSpacing: "0.06em", fontWeight: 500 }}>{container.type}</div>
      </div>
      <div style={{ fontFamily: "var(--font-display)", fontSize: 19, fontWeight: 600, color: "var(--fg1)", letterSpacing: "-0.01em" }}>{container.title}</div>
      <div style={{ display: "flex", gap: 10, alignItems: "center", fontFamily: "var(--font-mono)", fontSize: 12, color: "var(--fg3)", paddingTop: 10, borderTop: "1px solid var(--border)", marginTop: 4 }}>
        <span>{container.children} stories</span><span>·</span>
        <span style={{ fontVariantNumeric: "tabular-nums" }}>{container.words.toLocaleString()} words</span>
      </div>
    </div>
  );
}

function StoryCard({ story, onClick }) {
  const [h, setH] = React.useState(false);
  const icon = STORY_ICON[story.type] || "FileText";
  return (
    <div onClick={onClick} onMouseEnter={() => setH(true)} onMouseLeave={() => setH(false)}
      style={{
        background: "var(--surface)", border: `1px solid ${h ? "var(--border-strong)" : "var(--border)"}`,
        borderRadius: 12, padding: 18, cursor: "pointer",
        boxShadow: h ? "var(--shadow-sm)" : "none",
        transition: "all 150ms var(--ease-out)",
        display: "flex", flexDirection: "column", gap: 10, position: "relative",
      }}>
      <div style={{ display: "flex", alignItems: "flex-start", gap: 12 }}>
        <div style={{ width: 34, height: 34, borderRadius: 8, background: "var(--accent-subtle)", display: "flex", alignItems: "center", justifyContent: "center", color: "var(--accent)", flexShrink: 0 }}>
          <Icon name={icon} size={18}/>
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontFamily: "var(--font-display)", fontSize: 18, fontWeight: 600, color: "var(--fg1)", letterSpacing: "-0.01em", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{story.title}</div>
          <div style={{ fontSize: 12, color: "var(--fg3)", marginTop: 2, textTransform: "capitalize" }}>{story.type.replace("-", " ")}</div>
        </div>
        {story.favorite && <div style={{ color: "var(--accent)", flexShrink: 0 }}><Icon name="Star" size={16} filled={true}/></div>}
      </div>
      {story.description && (
        <div style={{ fontSize: 13, color: "var(--fg2)", lineHeight: 1.5, display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", overflow: "hidden" }}>{story.description}</div>
      )}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", paddingTop: 10, borderTop: "1px solid var(--border)", marginTop: "auto" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <Pill tone={STATUS_TONE[story.status]}>{STATUS_LABEL[story.status]}</Pill>
          <span style={{ fontFamily: "var(--font-mono)", fontSize: 11, color: "var(--fg3)", fontVariantNumeric: "tabular-nums" }}>{story.words.toLocaleString()} w</span>
        </div>
        <div style={{ fontFamily: "var(--font-mono)", fontSize: 11, color: "var(--fg-muted)" }}>{story.editedAt}</div>
      </div>
    </div>
  );
}

window.StoriesList = StoriesList;
