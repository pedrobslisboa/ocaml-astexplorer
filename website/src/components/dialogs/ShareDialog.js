import React from 'react';
import {useSelector, useDispatch} from 'react-redux';
import {showShareDialog, getRevision} from '../../store/selectors';
import {closeShareDialog} from '../../store/actions';

export default function ShareDialog() {
  const dispatch = useDispatch();
  const visible = useSelector(showShareDialog);
  const snippet = useSelector(getRevision);

  function outerClick(event) {
    if (event.target === document.getElementById('ShareDialog')) {
      dispatch(closeShareDialog());
    }
  }

  if (visible) {
    return (
      <div id="ShareDialog" className="dialog" onClick={outerClick}>
        <div className="inner" style={{maxWidth: '80%', width: 600}}>
          <div className="body">
            {snippet && snippet.getShareInfo()}
          </div>
          <div className="footer">
            <button onClick={() => dispatch(closeShareDialog())}>Close</button>
          </div>
        </div>
      </div>
    );
  }
  return null;
}
