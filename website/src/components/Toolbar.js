import React from 'react';
import {useSelector, useDispatch} from 'react-redux';
import CategoryButton from './buttons/CategoryButton';
import SnippetButton from './buttons/SnippetButton';
import KeyMapButton from './buttons/KeyMapButton';
import ThemeButton from './buttons/ThemeButton';
import {
  save,
  selectCategory,
  openSettingsDialog,
  openShareDialog,
  setParser,
  setKeyMap,
  setTheme,
} from '../store/actions';
import * as selectors from '../store/selectors';

export default function Toolbar() {
  const dispatch = useDispatch();
  const parser = useSelector(selectors.getParser);
  const keyMap = useSelector(selectors.getKeyMap);
  const theme = useSelector(selectors.getTheme);

  const props = {
    category: parser.category,
    parser,
    keyMap,
    onParserChange: p => dispatch(setParser(p)),
    onCategoryChange: category => dispatch(selectCategory(category)),
    onParserSettingsButtonClick: () => dispatch(openSettingsDialog()),
    onShareButtonClick: () => dispatch(openShareDialog()),
    onKeyMapChange: km => dispatch(setKeyMap(km)),
    onSave: () => dispatch(save(false)),
  };

  return (
    <div id="Toolbar">
      <h1>OCaml AST explorer</h1>
      <SnippetButton {...props} />
      <CategoryButton {...props} />
      <KeyMapButton {...props} />
      <ThemeButton theme={theme} onThemeChange={t => dispatch(setTheme(t))} />
      <a
        style={{minWidth: 0}}
        target="_blank" rel="noopener noreferrer"
        title="Help"
        href="https://github.com/pedrobslisboa/ocaml-astexplorer">
        <i className="fa fa-lg fa-question fa-fw" />
      </a>
      <div id="info">
        Ppxlib AST version: <a href="https://github.com/ocaml-ppx/ppxlib/releases/tag/0.37.0" target="_blank" rel="noopener noreferrer">3.7.0</a>
      </div>
    </div>
  );
}
