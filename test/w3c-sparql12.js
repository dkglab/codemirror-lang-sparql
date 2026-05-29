import { runW3CTests } from './w3c-test-runner.js';

// Pre-processor for codepoint escapes outside strings
function preprocessCodepointEscapes(input) {
  return input.replace(
    /\\u([0-9A-Fa-f]{4})|\\U([0-9A-Fa-f]{8})/g,
    (_, u4, u8) => {
      const codepoint = parseInt(u4 || u8, 16);
      return String.fromCodePoint(codepoint);
    }
  );
}

const { failCount } = runW3CTests({
  name: 'SPARQL 1.2 W3C Test Suite',
  testDir: 'rdf-tests/sparql/sparql12',
  preprocessor: preprocessCodepointEscapes,
  preprocessorDirs: ['codepoint-escapes'],
});

process.exit(failCount > 0 ? 1 : 0);
