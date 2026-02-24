import * as LocalStorage from './components/LocalStorage';
import ASTOutput from './components/ASTOutput';
import Editor from './components/Editor';
import ErrorMessage from './components/ErrorMessage';
import GistBanner from './components/GistBanner';
import LoadingIndicator from './components/LoadingIndicator';
import PasteDropTarget from './components/PasteDropTarget';
import {publish} from './utils/pubsub.js';
import * as React from 'react';
import SettingsDialog from './components/dialogs/SettingsDialog';
import ShareDialog from './components/dialogs/ShareDialog';
import SplitPane from './components/SplitPane';
import Toolbar from './components/Toolbar';
import debounce from './utils/debounce';
import {Provider, useSelector} from 'react-redux';
import {astexplorer, persist, revive} from './store/reducers';
import {createStore, applyMiddleware, compose} from 'redux';
import {getRevision} from './store/selectors';
import {loadSnippet} from './store/actions';
import {render} from 'react-dom';
import * as gist from './storage/gist';
import StorageHandler from './storage';
import '../css/style.css';
import parserMiddleware from './store/parserMiddleware';
import snippetMiddleware from './store/snippetMiddleware.js';
import cx from './utils/classnames.js';

function resize() {
  publish('PANEL_RESIZE');
}

function App() {
  const hasError = useSelector(state => !!state.error);
  return (
    <>
      <ErrorMessage />
      <PasteDropTarget id="main" className={cx({hasError})}>
        <LoadingIndicator />
        <SettingsDialog />
        <ShareDialog />
        <Toolbar />
        <GistBanner />
        <SplitPane
          className="splitpane-content"
          vertical={true}
          onResize={resize}>
          <SplitPane
            className="splitpane"
            onResize={resize}>
            <Editor />
            <ASTOutput />
          </SplitPane>
        </SplitPane>
      </PasteDropTarget>
    </>
  );
}

const composeEnhancers = window.__REDUX_DEVTOOLS_EXTENSION_COMPOSE__ || compose;
const storageAdapter = new StorageHandler([gist]);
const store = createStore(
  astexplorer,
  revive(LocalStorage.readState()),
  composeEnhancers(
    applyMiddleware(snippetMiddleware(storageAdapter), parserMiddleware),
  ),
);
store.subscribe(debounce(() => {
  const state = store.getState();
  // We are not persisting the state while looking at an existing revision
  if (!getRevision(state)) {
    LocalStorage.writeState(persist(state));
  }
}));
store.dispatch({type: 'INIT'});

render(
  <Provider store={store}>
    <App />
  </Provider>,
  document.getElementById('container'),
);

global.onhashchange = () => {
  store.dispatch(loadSnippet());
};

if (location.hash.length > 1) {
  store.dispatch(loadSnippet());
}
