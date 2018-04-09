var indexedDB = window.indexedDB || window.webkitIndexedDB || window.mozIndexedDB || window.OIndexedDB || window.msIndexedDB,
  IDBTransaction = window.IDBTransaction || window.webkitIDBTransaction || window.OIDBTransaction || window.msIDBTransaction,
  dbVersion = 1.0;
var idxDB = indexedDB.open('gbidxdb', dbVersion);

var db = openDatabase('gbwdb', '1.0', 'amebo state and rom store', 2 * 1024 * 1024); //, createDB
var mainUI;
var currentGB = {
  emu: null,
  isPaused: true,
  canvas: document.getElementById('emulator'),

  setPause: function (pause)
  {
    currentGB.isPaused = pause;
    gameboy.paused = pause;
    (pause ? gba.pause() : gba.runStable());
  },

  /**
   * @param {float} Value of volume
   */
  setVolume: function (value)
  {
    gba.audio.masterVolume = Math.pow(2, value) - 1;
    gameboy.setAudioEngineVolume(value);
  },

  /**
   * Set speed
   * @param {float} Speed
   */
  setSpeed: function (speed)
  {
  },

  /**
   *
   */
  loadROM: function(rom)
  {
  }
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
};

