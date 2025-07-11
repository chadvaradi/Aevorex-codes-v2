#!/usr/bin/env node
/*
Generate a list of uncovered frontend files based on the combined coverage
summary. The result is written to shared/frontend/coverage/uncovered.txt.
*/
const fs = require('fs');
const path = require('path');

function findCoverageSummary() {
  const root = path.resolve(__dirname, '..');
  const candidates = [
    'shared/frontend/coverage/combined/coverage-summary.json',
    'shared/frontend/coverage/unit/coverage-summary.json',
    'shared/frontend/coverage/e2e/coverage-summary.json',
  ].map(p => path.join(root, p));
  return candidates.find(fs.existsSync);
}

function main() {
  const summaryPath = findCoverageSummary();
  if (!summaryPath) {
    console.error('❌  No coverage-summary.json found. Run coverage first.');
    process.exit(1);
  }
  const summary = JSON.parse(fs.readFileSync(summaryPath, 'utf-8'));

  const uncoveredFiles = Object.entries(summary).filter(([file, metrics]) => {
    if (file === 'total') return false;
    return metrics.lines.pct < 100;
  });

  const outputDir = path.join(path.dirname(summaryPath), '..');
  const outPath = path.resolve(outputDir, 'uncovered.txt');
  const content = uncoveredFiles
    .map(([file, metrics]) => `${metrics.lines.pct.toFixed(2).padStart(6)}%  ${file}`)
    .sort()
    .join('\n');

  fs.writeFileSync(outPath, content + '\n', 'utf-8');
  console.log(`✅  Uncovered file list written to ${outPath}`);
}

main(); 