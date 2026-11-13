import { readFileSync, writeFileSync } from 'node:fs';

const report = JSON.parse(readFileSync('reports/mutation/mutation.json', 'utf8'));
const survivors = Object.entries(report.files).flatMap(([file, entry]) =>
  entry.mutants
    .filter((mutant) => ['Survived', 'NoCoverage'].includes(mutant.status))
    .map((mutant) => ({ file, ...mutant })),
);
writeFileSync('reports/mutation/survivors.json', `${JSON.stringify(survivors, null, 2)}\n`);
console.log(`${survivors.length} survivors or uncovered mutants recorded.`);
