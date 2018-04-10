window.indexedDB = window.indexedDB || window.webkitIndexedDB || window.mozIndexedDB || window.OIndexedDB || window.msIndexedDB;
window.IDBTransaction = window.IDBTransaction || window.webkitIDBTransaction || window.OIDBTransaction || window.msIDBTransaction;
window.BlobBuilder = window.BlobBuilder || window.WebKitBlobBuilder ||
  window.MozBlobBuilder;
var idxDB;

function createidxDB()
{
  var DBOpenRequest = window.indexedDB.open('gbidxdb', 1.0);

  DBOpenRequest.onsuccess = function(event) {
    // store the result of opening the database in the db variable. This is used a lot below
    idxDB = DBOpenRequest.result;
  };

  DBOpenRequest.onupgradeneeded = function(event) {
    var idxDB = event.target.result;

    idxDB.onerror = function(event) {
    };

    // Create an objectStore for this database

    var romsStore = idxDB.createObjectStore('roms', { autoIncrement : true });

    // define what data items the roms will contain

    romsStore.createIndex('name', 'name', { unique: false });
    romsStore.createIndex('emu', 'emu', { unique: false });
    romsStore.createIndex('data', 'data', { unique: true });
  }
};

var db = openDatabase('gbwdb', '1.0', 'amebo state and rom store', 2 * 1024 * 1024); //, createDB
var mainUI;
var currentGB = {
  emu: null,
  isPaused: true,
  canvas: document.getElementById('emulator'),

  setPause: function (pause)
  {
    currentGB.isPaused = pause;
    if (currentGB.emu instanceof GameBoyAdvance)
    {
      (pause ? gba.pause() : gba.runStable());
    }
    else if (currentGB.emu instanceof gb)
    {
      gameboy.paused = pause;
    }
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
  },

  /**
   * Load ROM from buffer
   *
   * @param {ArrayBuffer}
   * @param {string}
   */
  loadRomFromBuffer(buffer, emu)
  {
    gameboy.canvas = null;
    gba.targetCanvas = null;

    if (emu === 'gb')
    {
      gameboy.canvas = currentGB.canvas;
      currentGB.emu = gameboy;
      gameboy.loadROMBuffer(buffer);
    }
    else if (emu === 'gba')
    {
      gba.setCanvas(currentGB.canvas);
      currentGB.emu = gba;
      gba.setRom(buffer);
      gba.runStable();
    }

    currentGB.setPause(false);
  },
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

window.onload = function(evt) {
  // UI Init

  window.URL = window.URL || window.webkitURL;
  createidxDB();
  createDB();

  loadStyle(localStorage["currentStyle"],
    function(){
      installStyle(defaultControls, function(id) {
        localStorage["currentStyle"] = id;
        console.log('style', id);
        loadStyle(id, showUI, function(){
          loadStyle(0, showUI, function(){
            console.error('Load style error');
          });
        });
      })
    }, showUI
  );
  UIcanvas = document.getElementById("ui");
  UIctx = UIcanvas.getContext("2d");

  // end UI init

  // Enable Load Bios
  var gbSettings = localStorage.getItem('GameBoySettings');
  if (!gbSettings)
  {
    gbSettings = {
      audioEngineVolume: 0.5,
      enableLoadBios: true,
    };
  }
  else
  {
    gbSettings = JSON.parse(gbSettings);
  }

  var enableLoadBiosController = document.getElementById('enableLoadBiosControl');
  var currentEnableLoadBios = gbSettings.enableLoadBios;
  enableLoadBiosController.checked = currentEnableLoadBios;
  enableLoadBiosController.onchange = function (e)
  {
    gbSettings.enableLoadBios = e.target.checked;
    localStorage.setItem('GameBoySettings', JSON.stringify(gbSettings));
    alert('You must restart / refresh this app to apply setting');
  }

  gba = new GameBoyAdvance();
  gba.setCanvas(currentGB.canvas);
  gba.logLevel = gba.LOG_ERROR;
  loadRom('assets/libs/GBA.js/resources/bios.bin', function (bios) {
    gba.setBios(bios);
  });

  gameboy = new gb(null, currentGB.canvas, {
    cButByte: true,
    rootDir: '',
    enableLoadBios: currentEnableLoadBios,
  });
  backButtonDisp('none');
  setUpButtons();
  //populateRecentFiles();

  // Selections
  initROMSelection(null, false);

  // Volume
  var volumeController = document.getElementById('audioEngineVolumeControl');
  volumeController.onchange = function(e) {
    gbSettings.audioEngineVolume = e.target.value;
    currentGB.setVolume(gbSettings.audioEngineVolume);
    localStorage.setItem('GameBoySettings', JSON.stringify(gbSettings));
  };
  var currentVolume = gbSettings.audioEngineVolume;
  volumeController.value = currentVolume;
  currentGB.setVolume(gbSettings.audioEngineVolume);

  document.getElementById('chooseFile').onchange = function (e) {
    if (!e.target.files.length)
    {
      return;
    }
    var file = e.target.files[0];
    var reader = new FileReader();
    reader.gb = gameboy;
    gameboy.onload = function() {
      addROM(file.name, byteToString(gameboy.game), populateRecentFiles);
    }
    reader.onload = function(e) {
      e.target.gb.loadROMBuffer(e.target.result, e.target.result);
    };
    reader.readAsArrayBuffer(file);
  };

  setTimeout(function(){setActiveMenu(1)}, 16);

  setInterval(periodicState, 1000);

  window.addEventListener('unload', gameboy.saveBattery);
  var p = navigator.platform;
  var iOS = ( p === 'iPad' || p === 'iPhone' || p === 'iPod' );
  if (iOS) setInterval(gameboy.saveBattery, 1000);

  // Event Handle
  var ui = document.getElementById('ui');
  ui.addEventListener('touchmove', handleTouch);
  ui.addEventListener('touchstart', handleTouch);
  ui.addEventListener('touchend', handleTouch);
  ui.addEventListener('mousedown', handleMouse);
  ui.addEventListener('mouseup', handleMouse);
  ui.addEventListener('mousemove', handleMouse);
  window.addEventListener("keydown", handleKeyboard);
  window.addEventListener("keyup", handleKeyboard);
  window.addEventListener('resize', renderUI);
  window.addEventListener('scroll', scrollFix);
  window.addEventListener('orientationchange', scrollFix);
  window.addEventListener('message', handleMessage);
};

