export function isQuillBlank(delta: any) {
  if (!delta || delta.ops.length === 0) {
    return true;
  }

  for (let i = 0; i < delta.ops.length; i++) {
    if (delta.ops[i].insert.trim() !== "") {
      return false;
    }
  }

  return true;
}
