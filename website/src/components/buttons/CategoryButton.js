import PropTypes from 'prop-types';
import React from 'react';
import cx from '../../utils/classnames.js';
import {getCategoryByID, categories} from '../../parsers';

const categoryIcon = {
  'text/x-scala': 'icon-scala',
  css: 'fa-css3',
  graphql: 'icon-GraphQL_Logo',
  handlebars: 'icon-handlebars',
  htmlmixed: 'fa-html5',
  icu: 'icon-icu',
  java: 'icon-java',
  javascript: 'fa-jsfiddle',
  ocaml: 'icon-ocaml',
  reason: 'icon-reason',
  rust: 'icon-rust',
  sql: 'fa-database',
  webidl: 'fa-th-list',
  yaml: 'fa-yc',
};

export default function CategoryButton({category, onCategoryChange}) {
  function onClick({currentTarget}) {
    onCategoryChange(getCategoryByID(currentTarget.getAttribute('data-id')));
  }

  return (
    <div className="button menuButton categoryButton">
      <span>
        <i
          className={cx(categoryIcon[category.id] || 'fa-file-o', {
            fa: true,
            'fa-lg': true,
            'fa-fw': true,
          })}
        />
        &nbsp;{category.displayName}
      </span>
      <ul>
        {categories.map(cat => (
          <li key={cat.id} onClick={onClick} data-id={cat.id}>
            <button type="button">
              <i
                className={cx(categoryIcon[cat.id] || 'fa-file-o', {
                  fa: true,
                  'fa-fw': true,
                })}
              />
              &nbsp;{cat.displayName}
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}

CategoryButton.propTypes = {
  onCategoryChange: PropTypes.func.isRequired,
  category: PropTypes.object.isRequired,
};
