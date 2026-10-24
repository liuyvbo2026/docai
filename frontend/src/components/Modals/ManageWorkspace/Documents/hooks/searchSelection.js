export function toggleSearchSelection(state, items) {
  const selectedFiles = new Set(state.selectedFiles);
  const allSelected =
    items.length > 0 && items.every((item) => selectedFiles.has(item.id));
  for (const item of items) {
    if (allSelected) selectedFiles.delete(item.id);
    else selectedFiles.add(item.id);
  }
  return { ...state, selectedFiles };
}
