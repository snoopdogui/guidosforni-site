// Feature flags.

// Grid mode (GalleryGrid + the toolbar toggle) is built, tested and working —
// see scripts/test-film-roll.mjs, which still exercises it. It is hidden for
// now so the archive shows only the film roll.
//
// Flip this to true to restore it: it re-shows the toolbar toggle AND
// re-enables ?view=grid deep links. No grid-mode code was removed.
export const SHOW_GRID_MODE = false;
