import * as reasonCategory from './reason/index.js';
import refmt from './reason/refmt.js';
import reasonCode from './reason/codeExample.txt';

import * as ocamlCategory from './ocaml/index.js';
import refmtMl from './ocaml/refmt-ml.js';
import ocamlCode from './ocaml/codeExample.txt';

// Wire up Reason category
reasonCategory.codeExample = reasonCode;
reasonCategory.parsers = [refmt];
reasonCategory.transformers = [];
refmt.category = reasonCategory;

// Wire up OCaml category
ocamlCategory.codeExample = ocamlCode;
ocamlCategory.parsers = [refmtMl];
ocamlCategory.transformers = [];
refmtMl.category = ocamlCategory;

const categoryByID = {
  [reasonCategory.id]: reasonCategory,
  [ocamlCategory.id]: ocamlCategory,
};

const parserByID = {
  [refmt.id]: refmt,
  [refmtMl.id]: refmtMl,
};

export const categories = [reasonCategory, ocamlCategory];

export function getDefaultCategory() {
  return reasonCategory;
}

export function getDefaultParser(category = getDefaultCategory()) {
  return category.parsers.filter(p => p.showInMenu)[0];
}

export function getCategoryByID(id) {
  return categoryByID[id];
}

export function getParserByID(id) {
  return parserByID[id];
}
