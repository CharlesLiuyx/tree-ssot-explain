// en locale pack assembly: mirrors locales/zh/ file-for-file (zh is the schema of record).
// meta: code / htmlLang for <html lang> / name (the language's own name, used on the switch button) / document title.

import { stages, dotNames } from './stages.js';
import { laws, lawsSvg } from './laws.js';
import { TERMS } from './terms.js';
import { trees, nodes } from './trees.js';
import { tangles } from './tangles.js';
import { gravityKinds, gravityPairs } from './gravity.js';
import { ghosts } from './ghosts.js';
import { metaPaths } from './meta-paths.js';
import { strategies, platform } from './strategies.js';
import { ui } from './ui.js';

export const en = {
  meta: { code: 'en', htmlLang: 'en', name: 'English', title: 'Multi-Tree / Node-Entanglement Model' },
  stages, dotNames,
  laws, lawsSvg,
  terms: TERMS,
  trees, nodes,
  tangles,
  gravityKinds, gravityPairs,
  ghosts,
  metaPaths,
  strategies, platform,
  ui,
};
