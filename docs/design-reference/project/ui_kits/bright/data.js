// Fake data for the Bright prototype
window.BrightData = {
  universes: [
    { id: "u1", name: "The Ash Cycle", subtitle: "Novel series", accent: "#D97706" },
    { id: "u2", name: "Hollow Road", subtitle: "Novella", accent: "#B45309" },
    { id: "u3", name: "Bright Notes", subtitle: "Essays & drafts", accent: "#8B3F0A" },
  ],
  containers: [
    { id: "c1", type: "novel", title: "Novel one — Ashwood", children: 14, words: 58420 },
    { id: "c2", type: "novel", title: "Novel two — The Long Road", children: 9, words: 21004 },
    { id: "c3", type: "collection", title: "Side stories", children: 4, words: 6240 },
  ],
  stories: [
    { id: "s1", title: "The Last Light", type: "chapter", status: "inprogress", words: 3412, editedAt: "2m ago", favorite: true, description: "Calla finds the lamp-keeper's journal in the ruined tower, and the cycle begins." },
    { id: "s2", title: "Before the Road", type: "chapter", status: "completed", words: 4189, editedAt: "yesterday", favorite: false, description: "Opening chapter. Introduces Rhell and the house on Ashwood Lane." },
    { id: "s3", title: "Scene — the market at dawn", type: "scene", status: "draft", words: 612, editedAt: "3d ago", favorite: false, description: "" },
    { id: "s4", title: "Poem — Salt", type: "poem", status: "completed", words: 84, editedAt: "last week", favorite: true, description: "" },
    { id: "s5", title: "Outline — Act III", type: "outline", status: "inprogress", words: 1120, editedAt: "4d ago", favorite: false, description: "Beats for the final confrontation — needs a second pass." },
    { id: "s6", title: "Screenplay — The Interview", type: "screenplay", status: "draft", words: 2210, editedAt: "1w ago", favorite: false, description: "" },
  ],
  elements: [
    { id: "e1", type: "character", name: "Calla Veyne", tagline: "Archivist, 29", relationships: 4, favorite: true },
    { id: "e2", type: "character", name: "Rhell", tagline: "Lamp-keeper", relationships: 3 },
    { id: "e3", type: "location", name: "Ashwood", tagline: "Coastal town", relationships: 6 },
    { id: "e4", type: "location", name: "The Tower", tagline: "Ruined lighthouse", relationships: 2 },
    { id: "e5", type: "item", name: "The Ash Lantern", tagline: "Artifact — pre-cycle", relationships: 5, favorite: true },
    { id: "e6", type: "organization", name: "The Keepers' Order", tagline: "Dwindling guild", relationships: 3 },
    { id: "e7", type: "event", name: "The Long Dark", tagline: "47 years ago", relationships: 4 },
    { id: "e8", type: "concept", name: "Cyclical memory", tagline: "Worldbuilding system", relationships: 2 },
  ],
  storyContent: {
    title: "The Last Light",
    type: "Chapter · Novel one",
    versionLabel: "First draft",
    versions: [
      { id: "v1", label: "First draft", active: true, snapshots: 12, words: 3412, lastEdited: "2m ago" },
      { id: "v2", label: "Alternate opening", active: false, snapshots: 4, words: 2840, lastEdited: "3d ago" },
      { id: "v3", label: "Pre-revision", active: false, snapshots: 8, words: 3120, lastEdited: "1w ago" },
    ],
    snapshots: [
      { id: "sn1", label: "Auto", time: "2:14 PM", words: 3412, delta: "+41" },
      { id: "sn2", label: "Auto", time: "1:52 PM", words: 3371, delta: "+118" },
      { id: "sn3", label: "Manual — before cuts", time: "1:10 PM", words: 3253, delta: "-92" },
      { id: "sn4", label: "Auto", time: "12:44 PM", words: 3345, delta: "+210" },
      { id: "sn5", label: "Auto", time: "11:58 AM", words: 3135, delta: "+87" },
    ],
    paragraphs: [
      "The light had gone the way it always did in late October — quickly, and with a kind of ceremony. Calla set the page down. The room was warm enough. She had written three hundred and twelve words and kept them, which was more than yesterday and less than the day before, and she would not count the days before that.",
      "Outside the tower, the sea was doing its slow evening work. A gull complained at something it had not caught. She could hear Rhell on the stair, which meant the lamp was lit, which meant there was at least another hour before the wind turned.",
      "She opened the ledger. The page she wanted was near the back, between a list of oil measurements and a smudged note in someone else's hand — a woman's hand, older than the town. The ink had bloomed into the paper. Every letter had its own small halo.",
      "*If you are reading this*, the note began, *then the cycle has begun, and I am sorry. I kept it as long as I could. The lantern is behind the stones behind the stair. Do not set it down on wood.*",
      "Calla read it twice, and then a third time, and then she set the ledger back on the desk and sat without moving for a long while. Somewhere below, the lamp turned over in its glass."
    ],
  }
};
