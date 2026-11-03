#!/usr/bin/env node
import fs from 'node:fs/promises';
import path from 'node:path';
import process from 'node:process';
import { D2 } from '@d2lang/d2';

const LIGHT_THEME = 102;
const DARK_THEME = 200;

// Dark Mauve recoloured with Storybook's dark theme in
// apps/web/.storybook/theme.ts, on the web app's panel card background
const DARK_THEME_COLORS = {
  N1: '#f4eff5',
  N2: '#b8bfc2',
  N3: '#8fa69b',
  N4: '#5c7d6f',
  N5: '#183f31',
  N6: '#143829',
  N7: '#204c3b',
  B1: '#c5d2cc',
  B2: '#8fa69b',
  B3: '#5c7d6f',
  B4: '#2b5d4a',
  B5: '#275645',
  B6: '#12392b',
  AA2: '#5299e0',
  AA4: '#275645',
  AA5: '#12392b',
  AB4: '#275645',
  AB5: '#12392b',
} as const;

// One SVG per theme, as the docs site's light/dark toggle can't reach an
// SVG's own prefers-color-scheme query
const THEMES = [
  { name: 'light', themeID: LIGHT_THEME, colors: undefined },
  { name: 'dark', themeID: DARK_THEME, colors: DARK_THEME_COLORS },
] as const;

function withThemeColors(
  content: string,
  colors: (typeof THEMES)[number]['colors'],
) {
  if (!colors) {
    return content;
  }

  const overrides = Object.entries(colors)
    .map(([code, color]) => `      ${code}: "${color}"`)
    .join('\n');

  return `${content}
vars: {
  d2-config: {
    theme-overrides: {
${overrides}
    }
  }
}
`;
}

/** Recursively find all .d2 files in the repository */
async function getD2Files(dir: string) {
  const entries = await fs.readdir(dir, { withFileTypes: true });
  let files: string[] = [];
  for (const entry of entries) {
    const res = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      if (!['node_modules', '.git', 'dist', 'build'].includes(entry.name)) {
        files = files.concat(await getD2Files(res));
      }
    } else if (entry.name.endsWith('.d2')) {
      files.push(res);
    }
  }

  return files;
}

async function main() {
  console.log('🔍 Searching for D2 diagrams...');
  const d2Files = await getD2Files(`${process.cwd()}`);

  if (d2Files.length === 0) {
    console.log('No .d2 files found.');
    return;
  }

  const d2 = new D2();

  try {
    for (const file of d2Files) {
      const relInput = path.relative(process.cwd(), file);
      console.log(`⚡ Compiling: ${relInput}`);

      const content = await fs.readFile(file, 'utf8');

      for (const theme of THEMES) {
        const compiled = await d2.compile(
          withThemeColors(content, theme.colors),
          { sketch: true, layout: 'elk', pad: 20, themeID: theme.themeID },
        );
        const svg = await d2.render(compiled.diagram, compiled.renderOptions);
        await fs.writeFile(
          file.replace(/\.d2$/, `.${theme.name}.svg`),
          svg,
          'utf8',
        );
      }
    }

    console.log('✨ All diagrams compiled successfully!');
  } finally {
    await d2.dispose();
  }
}

main().catch((err) => {
  console.error('❌ Error building diagrams:', err);
  process.exit(1);
});
