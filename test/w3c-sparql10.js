import { runW3CTests } from './w3c-test-runner.js';

const { failCount } = runW3CTests({
  name: 'SPARQL 1.0 W3C Test Suite',
  testDir: 'rdf-tests/sparql/sparql10',
});

process.exit(failCount > 0 ? 1 : 0);
