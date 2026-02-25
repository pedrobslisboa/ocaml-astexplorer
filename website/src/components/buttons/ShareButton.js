import PropTypes from 'prop-types';
import React from 'react';

export default function ShareButton({onSave, onShareButtonClick}) {
  function handleClick() {
    // Update the URL first, then open the share dialog
    onSave();
    onShareButtonClick();
  }

  return (
    <button
      type="button"
      onClick={handleClick}>
      <i className="fa fa-share fa-fw" />&nbsp;Share...
    </button>
  );
}

ShareButton.propTypes = {
  onSave: PropTypes.func.isRequired,
  onShareButtonClick: PropTypes.func.isRequired,
};
