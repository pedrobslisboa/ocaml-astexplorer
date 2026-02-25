export default class StorageHandler {
  constructor(backends) {
    this._backends = backends;
  }

  fetchFromURL() {
    // No query params and no hash — nothing to load
    if (!global.location.search && /^#?\/?$/.test(global.location.hash)) {
      return Promise.resolve(null);
    }
    for (const backend of this._backends) {
      if (backend.matchesURL()) {
        return backend.fetchFromURL();
      }
    }
    return Promise.reject(new Error('Unknown URL format.'));
  }

  /**
   * Encode state into the URL (replaces the old gist hash approach).
   */
  updateURL(data) {
    for (const backend of this._backends) {
      if (backend.updateURL) {
        backend.updateURL(data);
        return;
      }
    }
  }
}
