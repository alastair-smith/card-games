#!/usr/bin/env node
import { readFile } from 'node:fs/promises';
import path from 'node:path';
import tailwindPostcss from '@tailwindcss/postcss';
import postcss, { type Rule } from 'postcss';
import {
  exitWithError,
  exitWithUsage,
  parseArguments,
} from '../../lib/script-helpers.ts';

const usage =
  'Usage: show-compiled-css.ts --class <class name> [--class <class name> ...]';

const WEB_ROOT = path.resolve(import.meta.dirname, '../../../../apps/web');
const STYLESHEET = path.join(WEB_ROOT, 'src/styles/globals.css');

const { values } = parseArguments(usage, {
  options: { class: { type: 'string', multiple: true } },
});
const classNames = values.class ?? [];

if (classNames.length === 0) {
  exitWithUsage(usage);
}

for (const className of classNames) {
  if (!/^[^\s.]\S*$/.test(className)) {
    exitWithError(
      `--class takes a class name as written in the code, e.g. 'motion-safe:animate-in', not '${className}'.`,
    );
  }
}

/** Escapes a class name the way Tailwind writes it in a selector. */
function escapeClassName(className: string): string {
  const escaped = className.replace(
    /[^a-zA-Z0-9_-]/g,
    (character) => `\\${character}`,
  );
  return /^[0-9]/.test(escaped)
    ? `\\3${escaped[0]} ${escaped.slice(1)}`
    : escaped;
}

function escapeRegExp(text: string): string {
  return text.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

/** The at-rules around a rule, outermost first, e.g. `@media (…)`. */
function getWrappers(rule: Rule): string[] {
  const wrappers: string[] = [];
  let parent = rule.parent;
  while (parent && parent.type === 'atrule' && 'name' in parent) {
    wrappers.unshift(`@${parent.name} ${parent.params}`.trim());
    parent = parent.parent;
  }
  return wrappers;
}

const result = await postcss([tailwindPostcss({ base: WEB_ROOT })]).process(
  await readFile(STYLESHEET, 'utf8'),
  { from: STYLESHEET },
);

const rules: Rule[] = [];
result.root.walkRules((rule) => {
  rules.push(rule);
});

for (const className of classNames) {
  const selectorPattern = new RegExp(
    `\\.${escapeRegExp(escapeClassName(className))}(?![\\w\\\\-])`,
  );
  const matches = rules
    .map((rule, index) => ({ rule, position: index + 1 }))
    .filter(({ rule }) => selectorPattern.test(rule.selector));

  console.log(`=== ${className}`);

  if (matches.length === 0) {
    console.log(
      "No rule found. Tailwind only generates classes it finds in the app's source files, so check the class is used in the code and spelled the same.\n",
    );
    continue;
  }

  for (const { rule, position } of matches) {
    const wrappers = getWrappers(rule);
    console.log(
      `Rule ${position} of ${rules.length}${wrappers.length > 0 ? `, inside ${wrappers.join(' > ')}` : ''}`,
    );
    // Clearing the raws drops the nesting indentation, so every rule prints
    // in the same format
    const formattedRule = rule.clone();
    formattedRule.cleanRaws();
    console.log(`${formattedRule.toString()}\n`);
  }
}
