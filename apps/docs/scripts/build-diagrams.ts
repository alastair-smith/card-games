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

// The committed SVG switches on the system colour scheme, for GitHub. The
// docs site shows the light or dark copy per its light/dark toggle, which an
// SVG's own prefers-color-scheme query can't follow
const RENDERS = [
  {
    suffix: '',
    themeID: LIGHT_THEME,
    darkThemeID: DARK_THEME,
    overridesKey: 'dark-theme-overrides',
  },
  {
    suffix: '.light',
    themeID: LIGHT_THEME,
    darkThemeID: undefined,
    overridesKey: undefined,
  },
  {
    suffix: '.dark',
    themeID: DARK_THEME,
    darkThemeID: undefined,
    overridesKey: 'theme-overrides',
  },
] as const;

function withDarkThemeColors(
  content: string,
  overridesKey: (typeof RENDERS)[number]['overridesKey'],
) {
  if (!overridesKey) {
    return content;
  }

  const colors = Object.entries(DARK_THEME_COLORS)
    .map(([code, color]) => `      ${code}: "${color}"`)
    .join('\n');

  return `${content}
vars: {
  d2-config: {
    ${overridesKey}: {
${colors}
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
      const outFile = file.replace(/\.d2$/, '.svg');
      const relInput = path.relative(process.cwd(), file);
      const relOutput = path.relative(process.cwd(), outFile);

      console.log(`⚡ Compiling: ${relInput} -> ${relOutput}`);

      const content = await fs.readFile(file, 'utf8');

      for (const render of RENDERS) {
        const compiled = await d2.compile(
          withDarkThemeColors(content, render.overridesKey),
          {
            sketch: true,
            layout: 'elk',
            pad: 20,
            themeID: render.themeID,
            darkThemeID: render.darkThemeID,
          },
        );
        const svg = await d2.render(compiled.diagram, compiled.renderOptions);
        await fs.writeFile(
          outFile.replace(/\.svg$/, `${render.suffix}.svg`),
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
