import {EditorState, TextSelection, Transaction} from 'prosemirror-state';
import {Transform} from 'prosemirror-transform';
import {EditorView} from 'prosemirror-view';

import {UICommand} from '@modusoperandi/licit-doc-attrs-step';
import updateIndentLevel from './updateIndentLevel';

class IndentCommand extends UICommand {
  _delta: number;

  constructor(delta: number) {
    super();
    this._delta = delta;
  }

  isActive = (_state: EditorState): boolean => {
    return false;
  };

  execute = (
    state: EditorState,
    dispatch?: (tr: Transform) => void,
    view?: EditorView
  ): boolean => {
    const {selection, schema} = state;
    let {tr} = state;
    tr = tr.setSelection(selection);
    const trx = updateIndentLevel(state, tr, schema, this._delta, view);
    if (trx.docChanged) {
      dispatch && dispatch(trx.tr);
      return true;
    } else {
      return false;
    }
  };
  // [FS] IRAD-1087 2020-11-11
  // New method to execute new styling implementation for indent
  executeCustom = (
    state: EditorState,
    tr: Transform,
    from: number,
    to: number
  ): Transform => {
    const {schema} = state;
    tr = (tr as Transaction).setSelection(
      TextSelection.create(tr.doc, from, to)
    );
    const trx = updateIndentLevel(state, tr, schema, this._delta, null);
    return trx.tr;
  };
}

export default IndentCommand;
