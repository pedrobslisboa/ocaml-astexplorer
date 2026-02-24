import React from 'react';
import {useSelector, useDispatch} from 'react-redux';
import {getError} from '../store/selectors';
import {clearError} from '../store/actions';

export default function ErrorMessage() {
  const error = useSelector(getError);
  const dispatch = useDispatch();

  return error ?
    <div className="cover">
      <div className="errorMessage">
        <h3>
          <i className="fa fa-exclamation-triangle"></i>
          {' '}
          Error
        </h3>
        <div>{error.message}</div>
        <div style={{marginTop: 15}}>
          <button
            type="button"
            onClick={() => dispatch(clearError())}>
            OK
          </button>
        </div>
      </div>
    </div> :
    null;
}
