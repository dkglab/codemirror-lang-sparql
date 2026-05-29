import { SparqlLanguage } from '../dist/index.js';
import * as fs from 'fs';
import * as path from 'path';

function hasErrors(tree) {
  let found = false;
  tree.iterate({ enter: (node) => { if (node.type.isError) found = true; }});
  return found;
}

function getAllQueryFiles(dir, extensions = ['.rq']) {
  const results = [];
  if (!fs.existsSync(dir)) return results;

  const items = fs.readdirSync(dir, { withFileTypes: true });
  for (const item of items) {
    const fullPath = path.join(dir, item.name);
    if (item.isDirectory()) {
      results.push(...getAllQueryFiles(fullPath, extensions));
    } else if (extensions.some(ext => item.name.endsWith(ext))) {
      results.push(fullPath);
    }
  }
  return results;
}

export function runW3CTests(config) {
  const {
    name,
    testDir,
    extensions = ['.rq'],
    knownNegativeTests = new Set(),
    preprocessor = null,
    preprocessorDirs = [],
  } = config;

  let passCount = 0;
  let failCount = 0;
  let warnCount = 0;
  const failures = [];
  const warnings = [];

  console.log(`${name}\n`);
  console.log('=========================\n');

  const allFiles = getAllQueryFiles(testDir, extensions);

  const isNegativeTest = (filePath) => {
    const relativePath = path.relative(testDir, filePath);
    return filePath.includes('-bad') ||
           filePath.includes('-invalid') ||
           filePath.includes('-negative') ||
           knownNegativeTests.has(relativePath);
  };

  const positiveFiles = allFiles.filter(f => !isNegativeTest(f));
  const negativeFiles = allFiles.filter(f => isNegativeTest(f));

  // Test positive cases
  console.log(`Positive Syntax Tests (${positiveFiles.length} files):`);
  for (const filePath of positiveFiles) {
    let content = fs.readFileSync(filePath, 'utf8');
    const relativePath = path.relative(testDir, filePath);

    // Apply preprocessor if configured for this directory
    if (preprocessor && preprocessorDirs.some(d => relativePath.startsWith(d))) {
      content = preprocessor(content);
    }

    const tree = SparqlLanguage.parser.parse(content);

    if (hasErrors(tree)) {
      failCount++;
      failures.push(relativePath);
      console.log(`  FAIL: ${relativePath}`);
    } else {
      passCount++;
    }
  }

  // Test negative cases
  console.log(`\nNegative Syntax Tests (${negativeFiles.length} files):`);
  for (const filePath of negativeFiles) {
    const content = fs.readFileSync(filePath, 'utf8');
    const tree = SparqlLanguage.parser.parse(content);
    const relativePath = path.relative(testDir, filePath);

    if (!hasErrors(tree)) {
      warnCount++;
      warnings.push(relativePath);
      console.log(`  WARN: ${relativePath} - parsed without errors (expected to fail)`);
    } else {
      passCount++;
    }
  }

  console.log('\n=========================');
  console.log(`Results: ${passCount} passed, ${failCount} failed, ${warnCount} warnings`);

  if (failures.length > 0) {
    console.log('\nFailed tests:');
    failures.forEach(f => console.log(`  - ${f}`));
  }

  if (warnings.length > 0) {
    console.log('\nWarnings (negative tests that parsed successfully):');
    warnings.forEach(w => console.log(`  - ${w}`));
  }

  return { passCount, failCount, warnCount };
}
