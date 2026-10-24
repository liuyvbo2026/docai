import test from 'node:test';
import assert from 'node:assert/strict';
import { toggleSearchSelection } from '../../frontend/src/components/Modals/ManageWorkspace/Documents/hooks/searchSelection.js';

test('selecting a filtered folder selects only matching documents, never the whole folder', () => {
  const state = { selectedFolders: new Set(), selectedFiles: new Set(), deselectedFiles: new Set() };
  const result = toggleSearchSelection(state, [{ id: 'visible-document' }]);
  assert.deepEqual([...result.selectedFiles], ['visible-document']);
  assert.equal(result.selectedFolders.size, 0);
  assert.equal(state.selectedFiles.size, 0);
});

test('toggling search results off preserves separately selected files and handles an empty match list', () => {
  const state = { selectedFiles: new Set(['visible-document', 'other-document']) };
  const result = toggleSearchSelection(state, [{ id: 'visible-document' }]);
  assert.deepEqual([...result.selectedFiles], ['other-document']);
  assert.deepEqual([...toggleSearchSelection(result, []).selectedFiles], ['other-document']);
});
