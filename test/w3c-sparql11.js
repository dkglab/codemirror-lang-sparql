import { runW3CTests } from './w3c-test-runner.js';

const { failCount } = runW3CTests({
  name: 'SPARQL 1.1 W3C Test Suite',
  testDir: 'rdf-tests/sparql/sparql11',
  extensions: ['.rq', '.ru'],
  // NegativeSyntaxTest11 tests that don't follow the "-bad" naming convention
  knownNegativeTests: new Set([
    'construct/constructwhere05.rq',  // CONSTRUCT WHERE with FILTER (invalid)
    'construct/constructwhere06.rq',  // CONSTRUCT WHERE with GRAPH (invalid)
    'syntax-query/syntax-bindings-09.rq',  // BINDINGS keyword (deprecated, invalid)
  ]),
});

process.exit(failCount > 0 ? 1 : 0);
