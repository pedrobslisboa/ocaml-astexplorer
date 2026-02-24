import PropTypes from 'prop-types';
import React, {useRef, useState, useEffect} from 'react';
import {useDispatch} from 'react-redux';
import {dropText, setError} from '../store/actions';
import { categories } from '../parsers';

const acceptedFileTypes = new Map([
  ['application/json', 'JSON'],
  ['text/plain', 'TEXT'],
]);

categories.forEach(({ id, mimeTypes }) => {
  mimeTypes.forEach(mimeType => {
    acceptedFileTypes.set(mimeType, id);
  });
});

export default function PasteDropTarget({children, ...props}) {
  const dispatch = useDispatch();
  const containerRef = useRef(null);
  const [dragging, setDragging] = useState(false);

  useEffect(() => {
    const listeners = [];

    function bind(elem, event, listener, capture) {
      for (const e of event.split(/\s+/)) {
        elem.addEventListener(e, listener, capture);
        listeners.push(() => elem.removeEventListener(e, listener, capture));
      }
    }

    // Handle pastes
    bind(document, 'paste', event => {
      if (!event.clipboardData) return;
      const cbdata = event.clipboardData;
      if (!cbdata.types.indexOf || !cbdata.types.indexOf('text/plain') > -1) return;
      event.stopPropagation();
      event.preventDefault();
      dispatch(dropText(cbdata.getData('text/plain'), undefined));
    }, true);

    const target = containerRef.current;
    let timer;

    bind(target, 'dragenter', event => {
      clearTimeout(timer);
      event.preventDefault();
      setDragging(true);
    }, true);

    bind(target, 'dragover', event => {
      clearTimeout(timer);
      event.preventDefault();
      event.dataTransfer.dropEffect = 'copy';
    }, true);

    bind(target, 'drop', event => {
      setDragging(false);
      const file = event.dataTransfer.files[0];
      const categoryId = acceptedFileTypes.get(file.type);
      if (!categoryId) return;
      event.preventDefault();
      event.stopPropagation();
      const reader = new FileReader();
      reader.onload = readerEvent => {
        const text = readerEvent.target.result;
        dispatch(dropText(text, categoryId !== 'JSON' && categoryId !== 'TEXT' ? categoryId : undefined));
      };
      reader.readAsText(file);
    }, true);

    bind(target, 'dragleave', () => {
      clearTimeout(timer);
      timer = setTimeout(() => setDragging(false), 50);
    }, true);

    return () => {
      clearTimeout(timer);
      for (const removeListener of listeners) {
        removeListener();
      }
    };
  }, [dispatch]);

  const dropindicator = dragging ?
    <div className="dropIndicator">
      <div>Drop the code file here</div>
    </div> :
    null;

  return (
    <div ref={containerRef} {...props}>
      {dropindicator}
      {children}
    </div>
  );
}

PasteDropTarget.propTypes = {
  children: PropTypes.node,
};
