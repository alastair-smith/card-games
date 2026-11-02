#!/usr/bin/env node
import fs from 'node:fs/promises';
import path from 'node:path';
import process from 'node:process';
import { D2 } from '@d2lang/d2';

const LIGHT_THEME = 102;
const DARK_THEME = 200;

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

      const compiled = await d2.compile(content, {
        sketch: true,
        themeID: LIGHT_THEME,
        darkThemeID: DARK_THEME,
      });
      const svg = await d2.render(compiled.diagram, compiled.renderOptions);

      await fs.writeFile(outFile, svg, 'utf8');
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
