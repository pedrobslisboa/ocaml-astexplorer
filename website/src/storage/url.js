/**
 * URL-based storage backend.
 *
 * Encodes the snippet state directly into the URL as query parameters:
 *   ?parser=refmt-ml&code=<base64url-encoded source>
 *
 * No server required — everything lives in the URL.
 */

function encode(str) {
  // UTF-8 safe base64
  return btoa(unescape(encodeURIComponent(str)));
}

function decode(b64) {
  return decodeURIComponent(escape(atob(b64)));
}

function getParamsFromURL() {
  const params = new URLSearchParams(global.location.search);
  const code = params.get('code');
  const parser = params.get('parser');
  if (code) {
    return {code, parser};
  }
  return null;
}

class Revision {
  constructor({code, parser}) {
    this._code = code;
    this._parser = parser;
  }

  canSave() {
    return true;
  }

  getParserID() {
    return this._parser;
  }

  getCode() {
    return this._code;
  }

  getParserSettings() {
    return null;
  }

  // Not used for URL snippets, but satisfies the interface
  getSnippetID() {
    return null;
  }
}

export function owns(revision) {
  return revision instanceof Revision;
}

export function matchesURL() {
  return getParamsFromURL() !== null;
}

export function fetchFromURL() {
  const data = getParamsFromURL();
  if (!data) {
    return Promise.resolve(null);
  }
  try {
    const code = decode(data.code);
    return Promise.resolve(new Revision({code, parser: data.parser}));
  } catch (e) {
    return Promise.reject(new Error('Failed to decode code from URL.'));
  }
}

/**
 * Encode state into query params and update the browser URL without
 * triggering a page reload or a popstate event.
 */
export function updateURL({parser, code}) {
  const params = new URLSearchParams();
  params.set('parser', parser);
  params.set('code', encode(code));
  const newURL = `${global.location.pathname}?${params.toString()}`;
  global.history.pushState(null, '', newURL);
}
