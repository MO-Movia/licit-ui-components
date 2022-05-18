import * as React from 'react';
import ColorEditor from './ui/ColorEditor';
import {UICommand} from '@modusoperandi/licit-doc-attrs-step';
import applyMark from './applyMark';
import createPopUp from './ui/createPopUp';
import findNodesWithSameMark from './findNodesWithSameMark';
import isTextStyleMarkCommandEnabled from './isTextStyleMarkCommandEnabled';
import nullthrows from 'nullthrows';
import {EditorState, TextSelection, Transaction} from 'prosemirror-state';
import {EditorView} from 'prosemirror-view';
import {MARK_TEXT_HIGHLIGHT} from './MarkNames';
import {Transform} from 'prosemirror-transform';

class TextHighlightCommand extends UICommand {
  _popUp = null;
  _color = '';

  constructor(color: string | undefined) {
    super();
    this._color = color;
  }
  isEnabled = (state: EditorState): boolean => {
    return isTextStyleMarkCommandEnabled(state, MARK_TEXT_HIGHLIGHT);
  };

  waitForUserInput = (
    state: EditorState,
    _dispatch: (tr: Transform) => void | undefined,
    _view: EditorView | undefined,
    event: React.SyntheticEvent | undefined
  ): Promise<unknown> => {
    if (this._popUp) {
      return Promise.resolve(undefined);
    }
    const target = nullthrows(event).currentTarget;
    if (!(target instanceof HTMLElement)) {
      return Promise.resolve(undefined);
    }

    const {doc, selection, schema} = state;
    const markType = schema.marks[MARK_TEXT_HIGHLIGHT];
    const {from, to} = selection;
    const result = findNodesWithSameMark(doc, from, to, markType);
    const hex = result ? result.mark.attrs.highlightColor : null;
    const anchor = event ? event.currentTarget : null;
    return new Promise((resolve) => {
      this._popUp = createPopUp(
        ColorEditor,
        {hex},
        {
          anchor,
          onClose: (val) => {
            if (this._popUp) {
              this._popUp = null;
              resolve(val);
            }
          },
        }
      );
    });
  };

  executeWithUserInput = (
    state: EditorState,
    dispatch: (trX: Transform) => void | undefined,
    _view: EditorView | undefined,
    color: string | undefined
  ): boolean => {
    if (dispatch && color !== undefined) {
      const {schema} = state;
      let {tr} = state;
      const markType = schema.marks[MARK_TEXT_HIGHLIGHT];
      const attrs = color ? {highlightColor: color} : null;
      // tr = applyMark(tr.setSelection(state.selection), schema, markType, attrs);
      tr = applyMark(tr, schema, markType, attrs) as Transaction;
      if (tr.docChanged || tr.storedMarksSet) {
        // If selection is empty, the color is added to `storedMarks`, which
        // works like `toggleMark`
        // (see https://prosemirror.net/docs/ref/#commands.toggleMark).
        dispatch(tr);
        return true;
      }
    }
    return false;
  };
  // [FS] IRAD-1087 2020-09-30
  // Method to execute custom styling implementation of Text Highlight
  executeCustom = (
    state: EditorState,
    tr: Transform,
    from: number,
    to: number
  ): Transform => {
    const {schema} = state;
    const markType = schema.marks[MARK_TEXT_HIGHLIGHT];
    const attrs = {highlightColor: this._color};
    tr = applyMark(
      (tr as Transaction).setSelection(TextSelection.create(tr.doc, from, to)),
      schema,
      markType,
      attrs
    );
    return tr;
  };
}

export default TextHighlightCommand;