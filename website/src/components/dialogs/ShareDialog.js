import React, {useState} from 'react';
import {useSelector, useDispatch} from 'react-redux';
import {showShareDialog} from '../../store/selectors';
import {closeShareDialog} from '../../store/actions';

export default function ShareDialog() {
  const dispatch = useDispatch();
  const visible = useSelector(showShareDialog);
  const [copied, setCopied] = useState(false);

  function outerClick(event) {
    if (event.target === document.getElementById('ShareDialog')) {
      dispatch(closeShareDialog());
    }
  }

  function copyURL() {
    const url = global.location.href;
    if (navigator.clipboard) {
      navigator.clipboard.writeText(url).then(() => {
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      });
    } else {
      // Fallback for older browsers
      const input = document.createElement('input');
      input.value = url;
      document.body.appendChild(input);
      input.select();
      document.execCommand('copy');
      document.body.removeChild(input);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  }

  if (!visible) return null;

  const url = global.location.href;

  return (
    <div id="ShareDialog" className="dialog" onClick={outerClick}>
      <div className="inner" style={{maxWidth: '80%', width: 600}}>
        <div className="header">
          <h3 style={{margin: 0}}>Share</h3>
        </div>
        <div className="body">
          <div className="shareInfo">
            <dl>
              <dt>URL</dt>
              <dd>
                <input
                  readOnly={true}
                  onFocus={e => e.target.select()}
                  value={url}
                />
              </dd>
            </dl>
            <button
              type="button"
              onClick={copyURL}
              style={{marginTop: 8}}>
              {copied
                ? <><i className="fa fa-check fa-fw" /> Copied!</>
                : <><i className="fa fa-clipboard fa-fw" /> Copy URL</>
              }
            </button>
          </div>
        </div>
        <div className="footer">
          <button onClick={() => dispatch(closeShareDialog())}>Close</button>
        </div>
      </div>
    </div>
  );
}
