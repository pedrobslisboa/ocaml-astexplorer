import PropTypes from 'prop-types';
import React from 'react';

export default function SnippetButton({onSave, onShareButtonClick}) {
  function handleShare() {
    onSave();
    onShareButtonClick();
  }

  return (
    <div className="button">
      <button type="button" onClick={handleShare}>
        <i className="fa fa-lg fa-share fa-fw" />
        &nbsp;Share
      </button>
    </div>
  );
}

SnippetButton.propTypes = {
  onSave: PropTypes.func,
  onShareButtonClick: PropTypes.func,
};
