export const queryKeys = {
  auth: {
    me: ["auth", "me"],
  },
  profile: {
    detail: ["profile"],
  },
  subjects: {
    all: ["subjects"],
    list: (params) => ["subjects", "list", params ?? {}],
  },
  tests: {
    all: ["tests"],
    list: (params) => ["tests", "list", params ?? {}],
    detail: (id) => ["tests", "detail", id],
    adminDetail: (id) => ["tests", "admin-detail", id],
    session: (id) => ["tests", "session", id],
  },
  questions: {
    all: ["questions"],
    list: (params) => ["questions", "list", params ?? {}],
    bank: (params) => ["questions", "bank", params ?? {}],
    availableCounts: (params) => ["questions", "available-counts", params ?? {}],
  },
  sessions: {
    stats: ["sessions", "stats"],
    history: ["sessions", "history"],
    detail: (sessionId) => ["sessions", "detail", sessionId],
    review: (sessionId) => ["sessions", "review", sessionId],
  },
  admin: {
    users: (params) => ["admin", "users", params ?? {}],
    overview: ["admin", "overview"],
  },
};
