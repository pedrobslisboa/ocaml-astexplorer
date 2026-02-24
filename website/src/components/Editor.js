import CodeMirror from 'codemirror';
import 'codemirror/keymap/vim';
import 'codemirror/keymap/emacs';
import 'codemirror/keymap/sublime';
import React, {useRef, useEffect} from 'react';
import {useSelector, useDispatch} from 'react-redux';
import {subscribe, clear} from '../utils/pubsub.js';
import {setCode, setCursor} from '../store/actions';
import {getCode, getParser, getParseResult, getKeyMap} from '../store/selectors';

export default function Editor() {
  const dispatch = useDispatch();
  const value = useSelector(getCode);
  const parser = useSelector(getParser);
  const parseResult = useSelector(getParseResult);
  const keyMap = useSelector(getKeyMap);

  const mode = parser.category.editorMode || parser.category.id;
  const error = parseResult && parseResult.error;

  const containerRef = useRef(null);
  const cmRef = useRef(null);
  // Track previous props for comparison in effects
  const prevValueRef = useRef(value);
  const prevModeRef = useRef(mode);
  const prevKeyMapRef = useRef(keyMap);
  const prevErrorRef = useRef(error);
  const updateTimerRef = useRef(null);
  const markerRangeRef = useRef(null);
  const markRef = useRef(null);
  const subscriptionsRef = useRef([]);

  function getErrorLine(err) {
    return err.loc ? err.loc.line : (err.lineNumber || err.line);
  }

  function setError(cm, newError, oldError) {
    if (!cm) return;
    if (oldError) {
      const lineNumber = getErrorLine(oldError);
      if (lineNumber) cm.removeLineClass(lineNumber - 1, 'text', 'errorMarker');
    }
    if (newError) {
      const lineNumber = getErrorLine(newError);
      if (lineNumber) cm.addLineClass(lineNumber - 1, 'text', 'errorMarker');
    }
  }

  function posFromIndex(doc, index) {
    return doc.posFromIndex(index);
  }

  // Mount / unmount CodeMirror instance
  useEffect(() => {
    const cm = CodeMirror(containerRef.current, { // eslint-disable-line new-cap
      keyMap,
      value,
      mode,
      lineNumbers: true,
      readOnly: false,
    });
    cmRef.current = cm;

    const cmHandlers = [];

    function bindCM(event, handler) {
      cmHandlers.push(event, handler);
      cm.on(event, handler);
    }

    bindCM('changes', () => {
      clearTimeout(updateTimerRef.current);
      updateTimerRef.current = setTimeout(() => {
        const doc = cm.getDoc();
        dispatch(setCode({
          code: doc.getValue(),
          cursor: doc.indexFromPos(doc.getCursor()),
        }));
      }, 200);
    });

    bindCM('cursorActivity', () => {
      clearTimeout(updateTimerRef.current);
      updateTimerRef.current = setTimeout(() => {
        dispatch(setCursor(cm.getDoc().indexFromPos(cm.getCursor())));
      }, 100);
    });

    subscriptionsRef.current.push(
      subscribe('PANEL_RESIZE', () => {
        if (cmRef.current) cmRef.current.refresh();
      }),
    );

    // Highlight support
    markerRangeRef.current = null;
    markRef.current = null;
    subscriptionsRef.current.push(
      subscribe('HIGHLIGHT', ({range}) => {
        if (!range) return;
        const doc = cm.getDoc();
        markerRangeRef.current = range;
        if (markRef.current) markRef.current.clear();
        const [start, end] = range.map(index => posFromIndex(doc, index));
        if (!start || !end) {
          markerRangeRef.current = markRef.current = null;
          return;
        }
        markRef.current = cm.markText(start, end, {className: 'marked'});
      }),
      subscribe('CLEAR_HIGHLIGHT', ({range} = {}) => {
        if (!range ||
          markerRangeRef.current &&
          range[0] === markerRangeRef.current[0] &&
          range[1] === markerRangeRef.current[1]
        ) {
          markerRangeRef.current = null;
          if (markRef.current) {
            markRef.current.clear();
            markRef.current = null;
          }
        }
      }),
    );

    if (error) setError(cm, error, null);

    return () => {
      clearTimeout(updateTimerRef.current);
      for (let i = 0; i < cmHandlers.length; i += 2) {
        cm.off(cmHandlers[i], cmHandlers[i + 1]);
      }
      clear(subscriptionsRef.current);
      subscriptionsRef.current = [];
      markerRangeRef.current = null;
      markRef.current = null;
      const container = containerRef.current;
      if (container && container.children[0]) {
        container.removeChild(container.children[0]);
      }
      cmRef.current = null;
    };
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // Sync value changes from store → CodeMirror
  useEffect(() => {
    const cm = cmRef.current;
    if (!cm) return;
    if (value !== prevValueRef.current) {
      prevValueRef.current = value;
      if (cm.getValue() !== value) {
        cm.setValue(value);
      }
    }
  }, [value]);

  // Sync mode changes
  useEffect(() => {
    const cm = cmRef.current;
    if (!cm) return;
    if (mode !== prevModeRef.current) {
      prevModeRef.current = mode;
      cm.setOption('mode', mode);
    }
  }, [mode]);

  // Sync keyMap changes
  useEffect(() => {
    const cm = cmRef.current;
    if (!cm) return;
    if (keyMap !== prevKeyMapRef.current) {
      prevKeyMapRef.current = keyMap;
      cm.setOption('keyMap', keyMap);
    }
  }, [keyMap]);

  // Sync error highlighting changes
  useEffect(() => {
    const cm = cmRef.current;
    if (!cm) return;
    if (error !== prevErrorRef.current) {
      setError(cm, error, prevErrorRef.current);
      prevErrorRef.current = error;
    }
  }, [error]);

  return <div className="editor" ref={containerRef} />;
}
