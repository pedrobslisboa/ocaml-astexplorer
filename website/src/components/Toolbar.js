import React from 'react';
import {useSelector, useDispatch} from 'react-redux';
import CategoryButton from './buttons/CategoryButton';
import ParserButton from './buttons/ParserButton';
import SnippetButton from './buttons/SnippetButton';
import KeyMapButton from './buttons/KeyMapButton';
import {
  save,
  selectCategory,
  openSettingsDialog,
  openShareDialog,
  setParser,
  reset,
  setKeyMap,
} from '../store/actions';
import * as selectors from '../store/selectors';

export default function Toolbar() {
  const dispatch = useDispatch();
  const parser = useSelector(selectors.getParser);
  const forking = useSelector(selectors.isForking);
  const saving = useSelector(selectors.isSaving);
  const canSaveVal = useSelector(selectors.canSave);
  const canForkVal = useSelector(selectors.canFork);
  const keyMap = useSelector(selectors.getKeyMap);
  const snippet = useSelector(selectors.getRevision);

  const props = {
    forking,
    saving,
    canSave: canSaveVal,
    canFork: canForkVal,
    category: parser.category,
    parser,
    keyMap,
    snippet,
    onParserChange: p => dispatch(setParser(p)),
    onCategoryChange: category => dispatch(selectCategory(category)),
    onParserSettingsButtonClick: () => dispatch(openSettingsDialog()),
    onShareButtonClick: () => dispatch(openShareDialog()),
    onKeyMapChange: km => dispatch(setKeyMap(km)),
    onSave: () => dispatch(save(false)),
    onFork: () => dispatch(save(true)),
    onNew: () => {
      if (global.location.hash) {
        global.location.hash = '';
      } else {
        dispatch(reset());
      }
    },
  };

  let parserInfo = parser.displayName;
  if (parser.version) {
    parserInfo += '-' + parser.version;
  }
  if (parser.homepage) {
    parserInfo =
      <a href={parser.homepage} target="_blank" rel="noopener noreferrer">{parserInfo}</a>;
  }

  return (
    <div id="Toolbar">
      <h1>AST Explorer</h1>
      <SnippetButton {...props} />
      <CategoryButton {...props} />
      <ParserButton {...props} />
      <KeyMapButton {...props} />
      <a
        style={{minWidth: 0}}
        target="_blank" rel="noopener noreferrer"
        title="Help"
        href="https://github.com/fkling/astexplorer/blob/master/README.md">
        <i className="fa fa-lg fa-question fa-fw" />
      </a>
      <div id="info">
        Parser: {parserInfo}
      </div>
    </div>
  );
}
