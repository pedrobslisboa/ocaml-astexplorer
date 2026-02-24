/*
 * Data storage is moved from Parse to Gists. It won't be possible anymore to
 * save new revisions of existing Parse snippets. We let the visitor know.
 */

import React, {useState, useEffect} from 'react';
import {useSelector} from 'react-redux';
import {getRevision} from '../store/selectors';

const buttonStyle = {
  backgroundColor: 'transparent',
  border: 'none',
  cursor: 'pointer',
  float: 'left',
  fontSize: 14,
  margin: 0,
  padding: 0,
  paddingRight: 10,
};

export default function GistBanner() {
  const revision = useSelector(getRevision);
  const [visible, setVisible] = useState(true);

  // Reset visibility when the snippet changes
  useEffect(() => {
    if (revision) {
      setVisible(true);
    }
  }, [revision && revision.getSnippetID()]);  // eslint-disable-line react-hooks/exhaustive-deps

  if (!visible) return null;
  if (!revision || revision.canSave()) return null;

  return (
    <div className="banner">
      This snippet is <strong>read-only</strong>. You can still save changes
      by forking it.
      <button style={buttonStyle} onClick={() => setVisible(false)}>
        <i className="fa fa-times" aria-hidden="true"></i>
      </button>
    </div>
  );
}
