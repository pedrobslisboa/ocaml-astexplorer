import * as LocalStorage from './components/LocalStorage';
import ASTOutput from './components/ASTOutput';
import Editor from './components/Editor';
import ErrorMessage from './components/ErrorMessage';
import LoadingIndicator from './components/LoadingIndicator';
import PasteDropTarget from './components/PasteDropTarget';
import { publish } from './utils/pubsub.js';
import * as React from 'react';
import SettingsDialog from './components/dialogs/SettingsDialog';
import ShareDialog from './components/dialogs/ShareDialog';
import SplitPane from './components/SplitPane';
import Toolbar from './components/Toolbar';
import debounce from './utils/debounce';
import { Provider, useSelector } from 'react-redux';
import { astexplorer, persist, revive } from './store/reducers';
import { createStore, applyMiddleware, compose } from 'redux';
import { getRevision, getTheme } from './store/selectors';
import { loadSnippet } from './store/actions';
import { render } from 'react-dom';
import * as urlStorage from './storage/url';
import StorageHandler from './storage';
import '../css/style.css';
import parserMiddleware from './store/parserMiddleware';
import snippetMiddleware from './store/snippetMiddleware.js';
import cx from './utils/classnames.js';

function resize() {
  publish('PANEL_RESIZE');
}

const darkMediaQuery = window.matchMedia('(prefers-color-scheme: dark)');

function applyTheme(theme) {
  const prefersDark = darkMediaQuery.matches;
  const isDark = theme === 'dark' || (theme === 'auto' && prefersDark);
  document.documentElement.classList.toggle('dark', isDark);
  document.documentElement.style.colorScheme = isDark ? 'dark' : 'light';
}

function App() {
  const hasError = useSelector(state => !!state.error);
  return (
    <>
      <ErrorMessage />
      <PasteDropTarget id="main" className={cx({ hasError })}>
        <LoadingIndicator />
        <SettingsDialog />
        <ShareDialog />
        <Toolbar />
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
        <div id="contribution">
          <a href="https://github.com/fkling/astexplorer">Based on astexplorer</a>
        </div>
      </PasteDropTarget>
    </>
  );
}

const composeEnhancers = window.__REDUX_DEVTOOLS_EXTENSION_COMPOSE__ || compose;
const storageAdapter = new StorageHandler([urlStorage]);
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

// Apply theme class whenever theme state changes
store.subscribe(() => applyTheme(getTheme(store.getState())));
// Also react to OS-level dark mode changes (for 'auto' mode)
darkMediaQuery.addListener(() => applyTheme(getTheme(store.getState())));

store.dispatch({ type: 'INIT' });
// Apply initial theme before first render
applyTheme(getTheme(store.getState()));

render(
  <Provider store={store}>
    <App />
  </Provider>,
  document.getElementById('container'),
);

// Load snippet from URL on back/forward navigation
global.addEventListener('popstate', () => {
  store.dispatch(loadSnippet());
});

// Load snippet if URL has query params on initial page load
if (location.search.length > 1) {
  store.dispatch(loadSnippet());
}
