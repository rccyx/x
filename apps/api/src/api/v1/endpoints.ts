//EVERY PATH IS RELATIVE TO THE API ROOT & STARTS WITH A SLASH

export const endpoints = {
  reminder: "/reminder",
  notification: "/notification",
  post: {
    viewWindow: "/post/view-window",
    trash: "/post/trash",
  },
  health: "/health",
  oss: {
    gpg: "/gpg",
    bootstrap: "/bootstrap",
    debion: "/debion",
    whisper: "/whisper",
  },
} as const;
