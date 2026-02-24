import CodeMirror from 'codemirror';
import 'codemirror/mode/javascript/javascript';
import 'codemirror/addon/fold/foldgutter';
import 'codemirror/addon/fold/foldcode';
import 'codemirror/addon/fold/brace-fold';
import PropTypes from 'prop-types';
import {subscribe, clear} from '../utils/pubsub.js';
import React, {useRef, useEffect} from 'react';

export default function JSONEditor({value, className}) {
  const containerRef = useRef(null);
  const cmRef = useRef(null);
  const prevValueRef = useRef(value);

  // Mount CodeMirror
  useEffect(() => {
    const subscriptions = [];
    const cm = CodeMirror(containerRef.current, { // eslint-disable-line new-cap
      value: value || '',
      mode: {name: 'javascript', json: true},
      readOnly: true,
      lineNumbers: true,
      foldGutter: true,
      gutters: ['CodeMirror-linenumbers', 'CodeMirror-foldgutter'],
    });
    cmRef.current = cm;

    subscriptions.push(
      subscribe('PANEL_RESIZE', () => {
        if (cmRef.current) cmRef.current.refresh();
      }),
    );

    return () => {
      clear(subscriptions);
      const container = containerRef.current;
      if (container && container.children[0]) {
        container.removeChild(container.children[0]);
      }
      cmRef.current = null;
    };
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // Sync value changes
  useEffect(() => {
    const cm = cmRef.current;
    if (!cm || value === prevValueRef.current) return;
    prevValueRef.current = value;
    const info = cm.getScrollInfo();
    cm.setValue(value);
    cm.scrollTo(info.left, info.top);
  }, [value]);

  return <div id="JSONEditor" className={className} ref={containerRef} />;
}

JSONEditor.propTypes = {
  value: PropTypes.string,
  className: PropTypes.string,
};
