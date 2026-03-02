import {getParser, getParserSettings, getCode} from './selectors';
import {FORMAT_CODE, setCode} from './actions';
import {ignoreKeysFilter, locationInformationFilter, functionFilter, emptyKeysFilter, typeKeysFilter} from '../core/TreeAdapter.js';

const filterFactories = {ignoreKeysFilter, functionFilter, emptyKeysFilter, locationInformationFilter, typeKeysFilter};

function loadRealParser(parser) {
  if (!parser._promise) {
    parser._promise = new Promise(parser.loadParser);
  }
  return parser._promise;
}

function parse(parser, code, parserSettings) {
  return loadRealParser(parser).then(
    realParser => parser.parse(realParser, code, parserSettings),
  );
}

function format(parser, code) {
  return loadRealParser(parser).then(
    realParser => parser.format(realParser, code),
  );
}

export default store => next => action => {
  if (action.type === FORMAT_CODE) {
    const state = store.getState();
    const parser = getParser(state);
    const code = getCode(state);

    if (!parser || !parser.format || code == null) {
      return;
    }

    return format(parser, code).then(
      formattedCode => {
        store.dispatch(setCode({code: formattedCode}));
      },
      error => {
        console.error(error); // eslint-disable-line no-console
        next({
          type: 'SET_PARSE_RESULT',
          result: {
            time: null,
            ast: null,
            treeAdapter: null,
            error,
          },
        });
      },
    );
  }

  const oldState = store.getState();
  next(action);
  const newState = store.getState();

  const newParser = getParser(newState);
  const newParserSettings = getParserSettings(newState);
  const newCode = getCode(newState);

  if (
    action.type === 'INIT' ||
    getParser(oldState) !== newParser ||
    getParserSettings(oldState) !== newParserSettings ||
    getCode(oldState) !== newCode
  ) {
    if (!newParser || newCode == null) {
      return;
    }
    const start = Date.now();
    return parse(newParser, newCode, newParserSettings).then(
      ast => {
        if (
          newParser !== getParser(store.getState()) ||
          newParserSettings !== getParserSettings(store.getState()) ||
          newCode !== getCode(store.getState())
        ) {
          return;
        }
        const treeAdapter = {
          type: 'default',
          options: {
            openByDefault: (newParser.opensByDefault || (() => false)).bind(newParser),
            nodeToRange: newParser.nodeToRange.bind(newParser),
            nodeToName: newParser.getNodeName.bind(newParser),
            walkNode: newParser.forEachProperty.bind(newParser),
            filters: newParser.getTreeFilters(filterFactories),
            locationProps: newParser.locationProps,
          },
        };
        next({
          type: 'SET_PARSE_RESULT',
          result: {
            time: Date.now() - start,
            ast: ast,
            error: null,
            treeAdapter,
          },
        });
      },
      error => {
        console.error(error); // eslint-disable-line no-console
        next({
          type: 'SET_PARSE_RESULT',
          result: {
            time: null,
            ast: null,
            treeAdapter: null,
            error,
          },
        });
      },
    );
  }

};
