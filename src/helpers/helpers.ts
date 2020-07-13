// checks if an object is {}
export function isEmptyObject(object: any) {
  return Object.keys(object).length === 0;
}
