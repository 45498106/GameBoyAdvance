var indexedDB = window.indexedDB || window.webkitIndexedDB || window.mozIndexedDB || window.OIndexedDB || window.msIndexedDB,
  IDBTransaction = window.IDBTransaction || window.webkitIDBTransaction || window.OIDBTransaction || window.msIDBTransaction,
  dbVersion = 1.0;
var idxDB = indexedDB.open('idxdbgba', dbVersion);

var db = openDatabase('amebo2', '1.0', 'amebo state and rom store', 2 * 1024 * 1024); //, createDB
var mainUI;
var currentGB = {
  canvas: document.getElementById('emulator'),
};

window.onerror = function(errorMsg, url, lineNumber, column, errorObj) {
  var p = navigator.platform
  if ((p === 'iPad') || (p === 'iPhone') || (p === 'iPod'))
  {
    alert(
      JSON.stringify(errorMsg)
      + ' line: '
      + lineNumber
    );
  }
}

