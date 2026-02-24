import PropTypes from 'prop-types';
import React from 'react';
import cx from '../../utils/classnames.js';

const keyMappings = ['default', 'vim', 'emacs', 'sublime'];

export default function KeyMapButton({keyMap, onKeyMapChange}) {
  return (
    <div className={cx({button: true, menuButton: true})}>
      <button type="button">
        <i className={cx({'fa': true, 'fa-lg': true, 'fa-keyboard-o': true})} />
        &nbsp;{keyMap}
      </button>
      <ul>
        {keyMappings.map(km => (
          <li
            key={km}
            disabled={keyMap === km}
            onClick={() => onKeyMapChange(km)}>
            <button type="button">{km}</button>
          </li>
        ))}
      </ul>
    </div>
  );
}

KeyMapButton.propTypes = {
  onKeyMapChange: PropTypes.func,
  keyMap: PropTypes.string,
};
