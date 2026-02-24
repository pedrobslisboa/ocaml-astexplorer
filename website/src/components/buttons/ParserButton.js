import PropTypes from 'prop-types';
import React from 'react';
import {getParserByID} from '../../parsers';

export default function ParserButton({parser, category, onParserChange}) {
  function onClick({currentTarget}) {
    onParserChange(getParserByID(currentTarget.getAttribute('data-id')));
  }

  const parsers = category.parsers.filter(p => p.showInMenu);
  return (
    <div className="button menuButton">
      <span>
        <i className='fa fa-lg fa-code fa-fw' />
        &nbsp;{parser.displayName}
      </span>
      <ul>
        {parsers.map(p => (
          <li key={p.id} onClick={onClick} data-id={p.id}>
            <button type="button">
              {p.displayName}
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}

ParserButton.propTypes = {
  onParserChange: PropTypes.func,
  parser: PropTypes.object,
  category: PropTypes.object,
};
