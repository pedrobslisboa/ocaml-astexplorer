import React, {useState, useEffect} from 'react';
import {useSelector, useDispatch} from 'react-redux';
import {showSettingsDialog, getParser, getParserSettings} from '../../store/selectors';
import {closeSettingsDialog, setParserSettings} from '../../store/actions';

export default function SettingsDialog() {
  const dispatch = useDispatch();
  const visible = useSelector(showSettingsDialog);
  const parser = useSelector(getParser);
  const parserSettings = useSelector(getParserSettings);
  const [localSettings, setLocalSettings] = useState(parserSettings);

  useEffect(() => {
    setLocalSettings(parserSettings);
  }, [parserSettings]);

  function saveAndClose() {
    dispatch(setParserSettings(localSettings));
    dispatch(closeSettingsDialog());
  }

  function outerClick(event) {
    if (event.target === document.getElementById('SettingsDialog')) {
      saveAndClose();
    }
  }

  if (visible && typeof parser.renderSettings === 'function') {
    return (
      <div id="SettingsDialog" className="dialog" onClick={outerClick}>
        <div className="inner">
          <div className="header">
            <h3>{parser.displayName} Settings</h3>
          </div>
          <div className="body">
            {parser.renderSettings(localSettings, setLocalSettings)}
          </div>
          <div className="footer">
            <button style={{marginRight: 10}} onClick={() => setLocalSettings({})}>
              Reset
            </button>
            <button onClick={saveAndClose}>Close</button>
          </div>
        </div>
      </div>
    );
  }
  return null;
}
