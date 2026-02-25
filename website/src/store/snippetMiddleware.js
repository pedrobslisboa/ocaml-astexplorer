import * as selectors from './selectors.js';
import * as actions from './actions.js';

let cancelLoad = () => {};

export default storageAdapter => store => next => action => {
  switch (action.type) {
    case actions.CLEAR_ERROR:
      return next(action);
    case actions.LOAD_SNIPPET:
      return loadSnippet(store.getState(), next, storageAdapter);
    case actions.SAVE:
      return saveSnippet(store.getState(), storageAdapter);
    default:
      return next(action);
  }
};

async function loadSnippet(state, next, storageAdapter) {
  // Ignore changes to the URL while a snippet is being saved
  if (selectors.isSaving(state) || selectors.isForking(state)) {
    return;
  }

  // Cancel any previous snippet loader
  cancelLoad();

  next(actions.setError(null));
  next(actions.startLoadingSnippet());

  try {
    let cancelled = false;
    cancelLoad = () => (cancelled = true);
    const revision = await storageAdapter.fetchFromURL();
    if (!cancelled) {
      if (revision) {
        next(actions.setSnippet(revision));
      } else {
        next(actions.clearSnippet());
      }
    }
  } catch (error) {
    next(actions.setError(new Error('Failed to load snippet: ' + error.message)));
  } finally {
    next(actions.doneLoadingSnippet());
  }
}

function saveSnippet(state, storageAdapter) {
  const parser = selectors.getParser(state);
  const code = selectors.getCode(state);

  storageAdapter.updateURL({
    parser: parser.id,
    code,
  });
}
