import React from 'react';
import {useSelector} from 'react-redux';
import {isLoadingSnippet} from '../store/selectors';

export default function LoadingIndicator() {
  const visible = useSelector(isLoadingSnippet);
  return visible ?
    <div className="loadingIndicator cover">
      <div>
        <i className="fa fa-lg fa-spinner fa-pulse"></i>
      </div>
    </div> :
    null;
}
