String.prototype.format = function (...args) {
  return this.replace(/{(\d+)}/g, function (match: string, number: number) {
    return typeof args[number] != "undefined" ? args[number] : match;
  });
};

export {}; // All files must be modules, this makes it a module
