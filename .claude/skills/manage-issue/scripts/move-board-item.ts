#!/usr/bin/env node
import {
  exitWithUsage,
  isIssueNumber,
  parseArguments,
} from '../../lib/script-helpers.ts';
import { isStatus, moveBoardItem, statusSchema } from './project-board.ts';

const usage = `Usage: move-board-item.ts <issue number> <${statusSchema.options.join('|')}>`;

const { positionals } = parseArguments(usage, { allowPositionals: true });
const [issueNumber, status, ...extraPositionals] = positionals;

if (
  !isIssueNumber(issueNumber) ||
  !isStatus(status) ||
  extraPositionals.length > 0
) {
  exitWithUsage(usage);
}

await moveBoardItem(issueNumber, status);
