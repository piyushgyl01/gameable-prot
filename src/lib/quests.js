export const PILLARS = {
  vitality: { n: "Vitality", c: "#10b981" },
  mastery: { n: "Mastery", c: "#818cf8" },
  bonds: { n: "Bonds", c: "#f59e0b" }
};

export const DIFFICULTY_COLORS = { 1: "#10b981", 2: "#eab308", 3: "#ef4444" };
export const DIFFICULTY_LABELS = { 1: "Easy", 2: "Med", 3: "Hard" };

export const MAIN_QUESTS = [
  {
    id: "iron",
    p: "vitality",
    ic: "🏋️",
    nm: "Iron Path",
    pk: 3, // pick 3 daily
    subs: [
      { id: "ir1", t: 1, ic: "💪", nm: "Pull day", ds: "Back. Rows.", en: 35, xp: 100, df: 3 },
      { id: "ir2", t: 1, ic: "🦵", nm: "Leg day", ds: "Squats, RDLs.", en: 35, xp: 100, df: 3 },
      { id: "ir3", t: 1, ic: "🫸", nm: "Push day", ds: "Bench, OHP.", en: 35, xp: 100, df: 3 },
      { id: "ir4", t: 1, ic: "📏", nm: "Track lifts", ds: "Log it.", en: 8, xp: 25, df: 1 },
      { id: "ir8", t: 1, ic: "🧘", nm: "Stretch", ds: "Prevent injury.", en: 10, xp: 20, df: 1 },
      { id: "ir5", t: 2, ic: "🔥", nm: "Failure set", ds: "Absolute.", en: 20, xp: 65, df: 2 },
      { id: "ir6", t: 2, ic: "🏃", nm: "Cardio", ds: "20min.", en: 18, xp: 50, df: 2 },
      { id: "ir7", t: 3, ic: "⚡", nm: "PR attempt", ds: "Record.", en: 40, xp: 140, df: 3 }
    ]
  },
  {
    id: "bulk",
    p: "vitality",
    ic: "🍗",
    nm: "Bulk Protocol",
    pk: 2,
    subs: [
      { id: "bk1", t: 1, ic: "🥩", nm: "Protein", ds: "100g+.", en: 10, xp: 30, df: 1 },
      { id: "bk2", t: 1, ic: "💧", nm: "3L water", ds: "Do it.", en: 5, xp: 15, df: 1 },
      { id: "bk3", t: 1, ic: "🛌", nm: "Bed <12", ds: "Sleep.", en: 10, xp: 35, df: 2 },
      { id: "bk4", t: 2, ic: "📊", nm: "Track macros", ds: "All.", en: 12, xp: 40, df: 2 },
      { id: "bk5", t: 2, ic: "💊", nm: "Supplements", ds: "Daily.", en: 3, xp: 10, df: 1 },
      { id: "bk6", t: 3, ic: "🍱", nm: "Meal prep", ds: "3+ days.", en: 30, xp: 90, df: 3 }
    ]
  },
  {
    id: "dsa",
    p: "mastery",
    ic: "🧩",
    nm: "Algorithm Forge",
    pk: 2,
    subs: [
      { id: "ds1", t: 1, ic: "🔢", nm: "LC Easy", ds: "Patterns.", en: 15, xp: 40, df: 1 },
      { id: "ds2", t: 1, ic: "⚡", nm: "LC Medium", ds: "Timed.", en: 25, xp: 75, df: 2 },
      { id: "ds3", t: 1, ic: "📖", nm: "Review", ds: "Optimize.", en: 10, xp: 30, df: 1 },
      { id: "ds4", t: 2, ic: "🔥", nm: "LC Hard", ds: "Try.", en: 35, xp: 120, df: 3 },
      { id: "ds5", t: 2, ic: "📝", nm: "Pattern", ds: "Deep.", en: 22, xp: 65, df: 2 },
      { id: "ds6", t: 3, ic: "🏗️", nm: "From scratch", ds: "No refs.", en: 30, xp: 100, df: 3 }
    ]
  },
  {
    id: "stack",
    p: "mastery",
    ic: "🌐",
    nm: "Full Stack",
    pk: 2,
    subs: [
      { id: "fs1", t: 1, ic: "🚀", nm: "Ship", ds: "New.", en: 35, xp: 110, df: 3 },
      { id: "fs2", t: 1, ic: "📦", nm: "Commit", ds: "Real.", en: 12, xp: 35, df: 1 },
      { id: "fs3", t: 1, ic: "🐛", nm: "Fix bug", ds: "Root.", en: 20, xp: 60, df: 2 },
      { id: "fs4", t: 2, ic: "🎨", nm: "Polish UI", ds: "Details.", en: 20, xp: 55, df: 2 },
      { id: "fs5", t: 2, ic: "🔌", nm: "API", ds: "Typed.", en: 30, xp: 90, df: 3 },
      { id: "fs6", t: 3, ic: "🧪", nm: "Read OSS", ds: "Learn.", en: 15, xp: 45, df: 1 }
    ]
  },
  {
    id: "ai",
    p: "mastery",
    ic: "🤖",
    nm: "AI Frontier",
    pk: 2,
    subs: [
      { id: "ai1", t: 1, ic: "🧠", nm: "Read AI", ds: "Substance.", en: 18, xp: 50, df: 2 },
      { id: "ai2", t: 1, ic: "🎯", nm: "Try tool", ds: "Eval.", en: 15, xp: 40, df: 1 },
      { id: "ai3", t: 2, ic: "🔧", nm: "Build API", ds: "Real.", en: 30, xp: 90, df: 3 },
      { id: "ai4", t: 2, ic: "💡", nm: "Study ML", ds: "1 concept.", en: 22, xp: 65, df: 2 },
      { id: "ai5", t: 3, ic: "🐍", nm: "ML script", ds: "Applied.", en: 28, xp: 85, df: 3 }
    ]
  },
  {
    id: "bca",
    p: "mastery",
    ic: "🎓",
    nm: "BCA Hold",
    pk: 3,
    subs: [
      { id: "bc1", t: 1, ic: "⚡", nm: "Electronics", ds: "Daily.", en: 25, xp: 75, df: 2 },
      { id: "bc2", t: 1, ic: "🔗", nm: "DS in C", ds: "Scratch.", en: 22, xp: 70, df: 2 },
      { id: "bc3", t: 1, ic: "📋", nm: "Classes", ds: "Attend.", en: 5, xp: 15, df: 1 },
      { id: "bc7", t: 1, ic: "📓", nm: "Notes", ds: "Rewrite.", en: 15, xp: 40, df: 1 },
      { id: "bc4", t: 2, ic: "🌐", nm: "IoT", ds: "Review.", en: 18, xp: 50, df: 1 },
      { id: "bc5", t: 2, ic: "📝", nm: "Assignment", ds: "Early.", en: 20, xp: 60, df: 2 },
      { id: "bc6", t: 3, ic: "📊", nm: "Mock test", ds: "Exam.", en: 30, xp: 95, df: 3 }
    ]
  },
  {
    id: "gre",
    p: "mastery",
    ic: "🎯",
    nm: "SF Blueprint",
    pk: 2,
    subs: [
      { id: "gr1", t: 1, ic: "➕", nm: "Quant", ds: "Timed.", en: 25, xp: 75, df: 2 },
      { id: "gr2", t: 1, ic: "📖", nm: "Verbal", ds: "Vocab.", en: 20, xp: 60, df: 2 },
      { id: "gr3", t: 1, ic: "📚", nm: "10 words", ds: "Context.", en: 12, xp: 35, df: 1 },
      { id: "gr4", t: 2, ic: "✍️", nm: "AWA", ds: "30min.", en: 28, xp: 80, df: 3 },
      { id: "gr5", t: 2, ic: "🗣️", nm: "TOEFL", ds: "Record.", en: 20, xp: 60, df: 2 },
      { id: "gr6", t: 3, ic: "📊", nm: "Diagnostic", ds: "Full.", en: 40, xp: 140, df: 3 }
    ]
  },
  {
    id: "money",
    p: "mastery",
    ic: "💰",
    nm: "Income Hunt",
    pk: 2,
    subs: [
      { id: "mn1", t: 1, ic: "🎬", nm: "Apply edit", ds: "1 app.", en: 18, xp: 55, df: 2 },
      { id: "mn2", t: 1, ic: "💻", nm: "Apply dev", ds: "Tailored.", en: 22, xp: 65, df: 2 },
      { id: "mn3", t: 1, ic: "📁", nm: "Portfolio", ds: "Better.", en: 20, xp: 60, df: 2 },
      { id: "mn4", t: 2, ic: "🤝", nm: "Outreach", ds: "Genuine.", en: 15, xp: 45, df: 2 },
      { id: "mn5", t: 2, ic: "🎬", nm: "Edit vid", ds: "Reel.", en: 25, xp: 75, df: 2 },
      { id: "mn6", t: 3, ic: "💸", nm: "Paid gig", ds: "$1.", en: 5, xp: 200, df: 3 }
    ]
  },
  {
    id: "roots",
    p: "bonds",
    ic: "🏠",
    nm: "The Roots",
    pk: 2,
    subs: [
      { id: "rt1", t: 1, ic: "📞", nm: "Call home", ds: "Talk.", en: 10, xp: 35, df: 1 },
      { id: "rt2", t: 1, ic: "💬", nm: "Text home", ds: "Real.", en: 5, xp: 20, df: 1 },
      { id: "rt3", t: 2, ic: "🎁", nm: "Thoughtful", ds: "Remember.", en: 8, xp: 25, df: 1 },
      { id: "rt4", t: 2, ic: "📸", nm: "Photo", ds: "Your day.", en: 5, xp: 20, df: 1 }
    ]
  },
  {
    id: "city",
    p: "bonds",
    ic: "🏙️",
    nm: "BLR Network",
    pk: 2,
    subs: [
      { id: "ct1", t: 1, ic: "🤝", nm: "Real talk", ds: "Genuine.", en: 10, xp: 30, df: 1 },
      { id: "ct2", t: 1, ic: "🍽️", nm: "Eat together", ds: "Not alone.", en: 8, xp: 25, df: 1 },
      { id: "ct3", t: 2, ic: "👨‍🏫", nm: "Professor", ds: "Recs.", en: 15, xp: 50, df: 2 },
      { id: "ct4", t: 2, ic: "🙋", nm: "Event", ds: "Present.", en: 15, xp: 45, df: 2 },
      { id: "ct5", t: 3, ic: "🔗", nm: "LinkedIn", ds: "Specific.", en: 15, xp: 50, df: 2 }
    ]
  },
  {
    id: "self",
    p: "bonds",
    ic: "🪞",
    nm: "Inner Work",
    pk: 2,
    subs: [
      { id: "sl1", t: 1, ic: "📓", nm: "Write", ds: "Free.", en: 10, xp: 30, df: 1 },
      { id: "sl2", t: 1, ic: "📵", nm: "No phone", ds: "2h.", en: 10, xp: 30, df: 2 },
      { id: "sl3", t: 1, ic: "🪞", nm: "Audit", ds: "Honest.", en: 12, xp: 35, df: 1 },
      { id: "sl6", t: 1, ic: "🚶", nm: "Walk", ds: "Think.", en: 12, xp: 30, df: 1 },
      { id: "sl4", t: 2, ic: "🧘", nm: "Still", ds: "Offline.", en: 8, xp: 25, df: 1 },
      { id: "sl5", t: 3, ic: "🎁", nm: "For you", ds: "Enjoy.", en: 8, xp: 25, df: 1 }
    ]
  }
];

export const INITIAL_STORY_QUESTS = [
  {
    id: "s1", ic: "📚", nm: "Semester 2", ds: "78.8→88%+", tm: "Jan-May 26", xp: 40,
    tasks: [
      { id: "s1a", tx: "90%+ Elec", dn: false },
      { id: "s1b", tx: "90%+ DS", dn: false },
      { id: "s1c", tx: "Mocks", dn: false },
      { id: "s1d", tx: "Assignments", dn: false },
      { id: "s1e", tx: "40+/45 theory", dn: false },
      { id: "s1f", tx: "14+/15 prac", dn: false }
    ]
  },
  {
    id: "s2", ic: "🎂", nm: "Bday", ds: "Don't forget.", tm: "Soon", xp: 30,
    tasks: [
      { id: "s2a", tx: "What want", dn: false },
      { id: "s2b", tx: "Plan", dn: false },
      { id: "s2c", tx: "Gift", dn: false },
      { id: "s2d", tx: "Show up", dn: false }
    ]
  },
  {
    id: "s3", ic: "🏗️", nm: "Bangalore", ds: "Making it yours.", tm: "2025+", xp: 50,
    tasks: [
      { id: "s3a", tx: "Sem 1", dn: true },
      { id: "s3b", tx: "SDC", dn: false },
      { id: "s3c", tx: "Friendship", dn: false },
      { id: "s3d", tx: "Routine", dn: false }
    ]
  },
  {
    id: "s4", ic: "🌉", nm: "SF", ds: "Master's/O-1.", tm: "→28", xp: 80,
    tasks: [
      { id: "s4a", tx: "GRE", dn: false },
      { id: "s4b", tx: "320+", dn: false },
      { id: "s4c", tx: "Portfolio", dn: false },
      { id: "s4d", tx: "Apply", dn: false },
      { id: "s4e", tx: "F-1", dn: false },
      { id: "s4f", tx: "Flight", dn: false }
    ]
  }
];

export const INITIAL_WORLD_QUESTS = [
  { id: "w1", ic: "🎮", nm: "Game Dev", tasks: [{ id: "g1", tx: "Engine", dn: false }, { id: "g2", tx: "Pong", dn: false }, { id: "g3", tx: "Mechanic", dn: false }, { id: "g4", tx: "Playtest", dn: false }] },
  { id: "w2", ic: "🎌", nm: "Anime", tasks: [{ id: "a1", tx: "Doc", dn: false }, { id: "a2", tx: "Board", dn: false }, { id: "a3", tx: "Char", dn: false }, { id: "a4", tx: "Animate", dn: false }] },
  { id: "w3", ic: "🕺", nm: "Dance", tasks: [{ id: "d1", tx: "Tutorial", dn: false }, { id: "d2", tx: "Rhythm", dn: false }, { id: "d3", tx: "Solo", dn: false }, { id: "d4", tx: "Choreo", dn: false }] },
  { id: "w4", ic: "⛰️", nm: "Hiking", tasks: [{ id: "h1", tx: "Trail", dn: false }, { id: "h2", tx: "Day", dn: false }, { id: "h3", tx: "Night", dn: false }, { id: "h4", tx: "Summit", dn: false }] },
  { id: "w5", ic: "🚴", nm: "Cycling", tasks: [{ id: "c1", tx: "Cycle", dn: false }, { id: "c2", tx: "10km", dn: false }, { id: "c3", tx: "Explore", dn: false }, { id: "c4", tx: "30km+", dn: false }] },
  { id: "w6", ic: "🥊", nm: "MMA", tasks: [{ id: "m1", tx: "Gym", dn: false }, { id: "m2", tx: "Trial", dn: false }, { id: "m3", tx: "Combos", dn: false }, { id: "m4", tx: "Spar", dn: false }] },
  { id: "w7", ic: "🎵", nm: "Music", tasks: [{ id: "u1", tx: "DAW", dn: false }, { id: "u2", tx: "Basics", dn: false }, { id: "u3", tx: "30sec", dn: false }, { id: "u4", tx: "Share", dn: false }] },
  { id: "w8", ic: "🎲", nm: "3D", tasks: [{ id: "b1", tx: "Donut", dn: false }, { id: "b2", tx: "Model", dn: false }, { id: "b3", tx: "Render", dn: false }, { id: "b4", tx: "Animate", dn: false }] },
  { id: "w9", ic: "🏛️", nm: "Arch", tasks: [{ id: "r1", tx: "Study", dn: false }, { id: "r2", tx: "Plan", dn: false }, { id: "r3", tx: "Visit", dn: false }] },
  { id: "w10", ic: "⚡", nm: "Elec", tasks: [{ id: "e1", tx: "LED", dn: false }, { id: "e2", tx: "Ohm", dn: false }, { id: "e3", tx: "Arduino", dn: false }, { id: "e4", tx: "Sensor", dn: false }] }
];
