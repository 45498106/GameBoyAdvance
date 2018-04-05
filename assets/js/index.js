var indexedDB = window.indexedDB || window.webkitIndexedDB || window.mozIndexedDB || window.OIndexedDB || window.msIndexedDB,
  IDBTransaction = window.IDBTransaction || window.webkitIDBTransaction || window.OIDBTransaction || window.msIDBTransaction,
  dbVersion = 1.0;

var idxDB = indexedDB.open('idxdbgba', dbVersion);
var db = openDatabase('amebo2', '1.0', 'amebo state and rom store', 2 * 1024 * 1024); //, createDB
var mainUI;

var defaultControls = {
  "images": [
    "assets/resources/styles/default/abtn.svg",
    "assets/resources/styles/default/bbtn.svg",
    "assets/resources/styles/default/start.svg",
    "assets/resources/styles/default/select.svg",
    "assets/resources/styles/default/dpad.svg",
    "assets/resources/styles/default/bg.svg",
    "assets/resources/styles/default/menu.svg",
    "assets/resources/styles/default/indent.svg"
  ],

  "name": "Default",
  "bgColour": "#313123",
  "background": 5,
  "gbborder": 7,
  "l_halign": "center",
  "l_valign": "center",
  "p_halign": "center",
  "p_valign": "top",
  "indent": 8,

  "landscape": [
    {"type": "button", "x":-12, "y":45, "mask":16, "radius":17, "halign":"right", "image":0, "imgwidth":18.3333333, "imgheight":18.3333333}, // A Button
    {"type": "button", "x":-29, "y":61, "mask":32, "radius":17, "halign":"right", "image":1, "imgwidth":18.3333333, "imgheight":18.3333333},// B Button
    {"type": "dpad", "x":20, "y":53, "radius":29, "halign":"left", "image":4, "imgwidth":35, "imgheight":35,
      "segments": [
        {"mask":1, "start":0.7853981633974483, "end":2.356194490192345}, 	//start: (Math.PI/4), end: (3*Math.PI/4)
        {"mask":2, "start":-2.356194490192345, "end":-0.7853981633974483}, 	//start: (3*Math.PI/(-4)), end: (Math.PI/(-4))
        {"mask":4, "start":2.356194490192345, "end":200}, 					//start: (3*Math.PI/4), end: infinity
        {"mask":4, "start":-200, "end":-2.356194490192345},					//start: -infinity, end: (3*Math.PI/(-4))
        {"mask":8, "start":-0.7853981633974483, "end":0.7853981633974483} 	//start: (Math.PI/(-4)), end: (Math.PI/4)
      ]
    },
    {"type": "recbutton", "x":-21, "y":93, "imgwidth":18.33333333, "imgheight":8.33333333, "width": 40, "height":10, "halign":"right", "mask":128, "image":2}, //start
    {"type": "recbutton", "x":21, "y":93, "imgwidth":18.33333333, "imgheight":8.33333333, "width": 40, "height":10, "halign":"left", "mask":64, "image":3}, //select
    {"type": "specialbutton", "btype": "menu", "y":16, "x":-20, "image":6, "imgheight":16.6666667, "imgwidth":16.6666667, "halign":"right", "radius":10}
  ],

  "portrait": [
    {"type": "button", "x":-16.25, "y":111, "mask":16, "radius":17, "halign":"right", "image":0, "imgwidth":18.3333333, "imgheight":18.3333333}, // A Button
    {"type": "button", "x":-31.875, "y":126.25, "mask":32, "radius":17, "halign":"right", "image":1, "imgwidth":18.3333333, "imgheight":18.3333333},// B Button
    {"type": "dpad", "x":25.625, "y":118.4375, "radius":29, "halign":"left", "image":4, "imgwidth":35, "imgheight":35,
      "segments": [
        {"mask":1, "start":0.7853981633974483, "end":2.356194490192345}, 	//start: (Math.PI/4), end: (3*Math.PI/4)
        {"mask":2, "start":-2.356194490192345, "end":-0.7853981633974483}, 	//start: (3*Math.PI/(-4)), end: (Math.PI/(-4))
        {"mask":4, "start":2.356194490192345, "end":200}, 					//start: (3*Math.PI/4), end: infinity
        {"mask":4, "start":-200, "end":-2.356194490192345},					//start: -infinity, end: (3*Math.PI/(-4))
        {"mask":8, "start":-0.7853981633974483, "end":0.7853981633974483} 	//start: (Math.PI/(-4)), end: (Math.PI/4)
      ]
    },
    {"type": "recbutton", "x":-40, "y":151.25, "imgwidth":18.33333333, "imgheight":8.33333333, "width": 40, "height":10, "halign":"right", "mask":128, "image":2}, //start
    {"type": "recbutton", "x":40, "y":151.25, "imgwidth":18.33333333, "imgheight":8.33333333, "width": 40, "height":10, "halign":"left", "mask":64, "image":3}, //select
    {"type": "specialbutton", "btype": "menu", "y":151.25, "x":-14, "image":6, "imgheight":16.6666667, "imgwidth":16.6666667, "halign":"right", "radius":10}
  ]
};

function installStyle(style, callback) {
  var imgdata = []
  var obj = style;
  var loaded = 0;
  var toLoad = obj.images.length;

  for (var i = 0; i < obj.images.length; i++) {
    (function(i){
      var mime = ""
      var xhr = new XMLHttpRequest();
      xhr.open("GET", obj.images[i]);
      xhr.responseType = "text";

      xhr.onreadystatechange = function() {mime = this.getResponseHeader('content-type');};

      xhr.onload = function() {
        imgdata[i] = "data:"+mime+";base64,"+btoa(xhr.response)
        if (++loaded == toLoad) {
          console.log("loadedall")
          db.transaction(function (tx) {
            tx.executeSql('INSERT INTO styles (name, data) VALUES (?, ?)', [obj.name, JSON.stringify(obj)], function (tx, results) {

              var inserted = 0;
              var toinsert = imgdata.length;
              var styleid = results.insertId;
              for (var j=0; j<imgdata.length; j++) {
                tx.executeSql('INSERT INTO styleres (res_id, style_id, data) VALUES (?, ?, ?)', [j, results.insertId, imgdata[j]], function (tx, results) {
                  if (++inserted == toinsert) callback(styleid);
                }, function(tx, err) { console.log(err) });
              }

            }, function(tx, err) { console.log(err) });
          })
        }
      }
      xhr.send();
    })(i);
  }

}

function loadStyle(id, failed, callback) {
  db.transaction(function (tx) {
    tx.executeSql('SELECT data, id FROM styles WHERE id = ?', [id], function (tx, results) {
      if (results.rows.length > 0) {
        mainUI = new gbTouchUI(JSON.parse(results.rows.item(0).data), results.rows.item(0).id, callback);
        mainUI.onload = function() {mainUI.setBG(document.getElementById("container")); renderUI();};
      } else if (typeof failed == "function") failed();
    },
      function(tx, err){console.error(err)});
  });
}

function gbTouchUI(input, id, callback) {
  var images = []
  var obj = input;
  var loaded = 0;
  var toLoad = obj.images.length;
  var me = this;
  this.loaded = false;
  this.images = images;

  db.transaction(function (tx) {
    tx.executeSql('SELECT res_id, data FROM styleres WHERE style_id = ?', [id], function (tx, results) {
      var i;
      var rl = results.rows.length;
      for (i = 0; i < rl; i++) {
        item = results.rows.item(i);
        var img = new Image();
        img.src = item.data;
        img.onload = function() {
          if (++loaded == toLoad) finishedLoading();
        }
        images[item.res_id] = img;
      }
    },
      function(tx, err){console.log(err)});
  });

  this.drawBG = function(ctx, ratio) {
    var img = images[obj.background];

    var canvas = ctx.canvas
    ctx.fillStyle = obj.bgColour || "#313123"
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    ctx.save();

    var hSeg = Math.ceil(document.body.clientWidth/img.width);
    var vSeg = Math.ceil(document.body.clientHeight/img.height);
    if ((canvas.width > canvas.height) != (hSeg > vSeg)) { //if horiz to vertical ratio is inconsistient, then flip values. This is used for the thumbnails.
      var temp = hSeg;
      hSeg = vSeg;
      vSeg = temp
      var scale = canvas.height/document.body.clientWidth;
    } else {
      var scale = canvas.height/document.body.clientHeight;
    }
    ctx.scale(scale, scale);
    for (var x=0; x<hSeg; x++) {
      for (var y=0; y<vSeg; y++) {
        ctx.drawImage(img, x*img.width, y*img.height);
      }
    }
    ctx.restore();
  }

  this.drawUI = function(ctx) {
    var ratio = window.devicePixelRatio || 1

    this.drawBG(ctx, ratio);

    ctx.save();
    var canvas = ctx.canvas;
    var square = Math.min(canvas.height, canvas.width);
    var height = canvas.height

    var iPStatus = (("standalone" in window.navigator) && window.navigator.standalone)
    var statusO = 20*(canvas.height/document.body.clientHeight);
    if (iPStatus) {
      height -= statusO
      if (canvas.width > canvas.height) square -= statusO;
      ctx.translate(0, statusO);
    }
    var scale = square/100



    this.GBScale = Math.floor(Math.min((canvas.width/160),(height/144)))/ratio;
    this.GBx = ((canvas.width/ratio)/2)-(80*this.GBScale)
    var prefix = (canvas.width > height)?"l":"p"
    var valign = obj[prefix+"_valign"]
    if (valign == "center") this.GBy = ((height/ratio)/2)-(72*this.GBScale)
    else if (valign == "top") this.GBy = 0;
    else if (valign == "bottom") this.GBy = (height/ratio)-(144*this.GBScale);


    if (obj.gbborder) {
      ctx.save()
      ctx.scale(ratio, ratio);

      var img = images[obj.gbborder]
      ctx.translate((this.GBx-(img.width-160)), (this.GBy-(img.height-144)));
      ctx.scale(this.GBScale, this.GBScale);
      ctx.drawImage(img, 0, 0)

      ctx.restore();
    }

    if (iPStatus) this.GBy += 20;

    ctx.scale(scale, scale);

    var i;
    var elems = (canvas.width > height)?obj.landscape:obj.portrait;
    var elmsl = elems.length;
    for (i=0; i < elmsl; i++) {
      var t = elems[i]
      var img = images[t.image];
      ctx.save();

      if (t.halign == "right") ctx.translate(100*Math.max(1, (canvas.width/height)), 0);
      ctx.translate(t.x, t.y);
      ctx.scale(t.imgheight/img.height, t.imgwidth/img.width)
      ctx.drawImage(img, -img.width/2, -img.height/2);

      ctx.restore();
    }

    ctx.restore();
  }

  this.setBG = function(elem) {
    var img = images[obj.background];
    elem.style.backgroundImage = "url("+img.src+")";
  }

  this.getButtons = function(touches) {
    var buttonByte = 0;

    var i;
    var tl = touches.length;
    for (i = 0; i < tl; i++) {
      var x = touches[i].pageX;
      var y = touches[i].pageY;

      var width = document.body.clientWidth;
      var height = document.body.clientHeight;
      if (("standalone" in window.navigator) && window.navigator.standalone) {
        height -= 40;
        y -= 40;
      }
      var square = Math.min(height, width);

      var scale = 100/square;

      x *= scale;
      y *= scale;

      var elems = (width > height)?obj.landscape:obj.portrait;

      var j;
      var elmsl = elems.length;
      for (j = 0; j < elmsl; j++) {
        var t = elems[j]

        var rx = x;
        if (t.halign == "right") x -= 100*Math.max(1, (width/height))

        switch (t.type) {
          case "button":
            if (Math.sqrt(Math.pow(x-t.x, 2)+Math.pow(y-t.y, 2)) < t.radius) buttonByte |= t.mask;
            break;
          case "dpad":
            if (Math.sqrt(Math.pow(x-t.x, 2)+Math.pow(y-t.y, 2)) < t.radius) {
              var angle = Math.atan2(x-t.x, y-t.y)
              var k;
              var sgml = t.segments.length;
              for (k = 0; k < sgml; k++) {
                var seg = t.segments[k];
                if (angle > (seg.start) && angle < (seg.end)) buttonByte |= seg.mask;
              }
            }
            break;
          case "recbutton":
            if ((x > t.x-t.width/2) && (x < t.x+t.width/2) && (y > t.y-t.width/2) && (y < t.y+t.width/2)) buttonByte |= t.mask;
            break;
          case "specialbutton":
            if (Math.sqrt(Math.pow(x-t.x, 2)+Math.pow(y-t.y, 2)) < t.radius) {
              switch (t.btype) {
                case "menu":
                  isMouseClicked = false;
                  openFileSelect();
                  break;
              }
            }
            break;
        }
        x = rx;
      }
    }

    gameboy.setButtonByte(255-buttonByte);
  }

  function finishedLoading() {
    me.loaded = true;
    if (typeof me.onload == "function") me.onload();
    if (typeof callback == "function") callback();
  }
}

function drawUIThumbs() {
  var ratio = window.devicePixelRatio || 1;
  var width = document.body.clientWidth;
  var height = document.body.clientHeight;
  var largest = Math.max(width, height);
  var smallest = Math.min(width, height);
  var newLarge = (largest/smallest)*75

  var lC = document.getElementById("landscapeThumb");
  lC.width = newLarge*ratio;
  lC.height = 75*ratio;
  lC.style.width = newLarge;
  lC.style.height = 75;
  mainUI.drawUI(lC.getContext("2d"));

  var pC = document.getElementById("portraitThumb");
  pC.height = newLarge*ratio;
  pC.width = 75*ratio;
  pC.style.height = newLarge;
  pC.style.width = 75;
  mainUI.drawUI(pC.getContext("2d"));
}

function resizeGB(zoom) {
  var gb = gameboy;
  if (typeof gb.ctx.webkitImageSmoothingEnabled != "undefined") {
    gb.canvas.width = 160*zoom;
    gb.canvas.height = 144*zoom;
    gb.ctx.webkitImageSmoothingEnabled = false;
  } else if (typeof gb.ctx.imageSmoothingEnabled != "undefined") {
    gb.canvas.width = 160*zoom;
    gb.canvas.height = 144*zoom;
    gb.ctx.imageSmoothingEnabled = false;
  } else {
    gb.canvas.style.width = 160*zoom;
    gb.canvas.style.height = 144*zoom;
  }
}

function renderUI() {
  scrollTo(0, 0);
  var ratio = window.devicePixelRatio || 1;
  UIcanvas.width = document.body.clientWidth*ratio;
  UIcanvas.height = document.body.clientHeight*ratio;
  UIctx.clearRect(0, 0, UIcanvas.width, UIcanvas.height);
  mainUI.drawUI(UIctx);
  resizeGB(mainUI.GBScale);
  gameboy.canvas.style.left = mainUI.GBx+"px";
  gameboy.canvas.style.top = mainUI.GBy+"px";
  var cont = document.getElementById("appcontainer");
  cont.style.width = document.body.clientWidth+"px";
  cont.style.height = document.body.clientHeight+"px";
}

function periodicState() {
  if (!(gameboy.paused) && gameboy.game) {
    if (activeROM != null) localStorage["lastState"] = JSON.stringify(gameboy.saveState());
    localStorage["lastROM"] = activeROM;
  }
}

function applyTransform(elem, trans) {
  elem.style.webkitTransform = trans;
  elem.style.MozTransform = trans;
  elem.style.oTransform = trans;
  elem.style.msTransform = trans;
  elem.style.Transform = trans;
}

var takeInput = false;
var activeMenu = 1;
var activeROM = -1;
var aROMname = "";

function createDB() {
  // IndexedDB
  open.onupgradeneeded = function() {
    console.log(1);
    var db = open.result;
    var store = db.createObjectStore(
      "MyObjectStore",
      {keyPath: "id"}
    );
    var index = store.createIndex(
      "NameIndex",
      ["name.last", "name.first"]
    );
  };

  open.onsuccess = function() {
    // Start a new transaction
    var db = open.result;
    var tx = db.transaction("MyObjectStore", "readwrite");
    var store = tx.objectStore("MyObjectStore");
    var index = store.index("NameIndex");

    // Add some data
    store.put({id: 12345, name: {first: "John", last: "Doe"}, age: 42});
    store.put({id: 67890, name: {first: "Bob", last: "Smith"}, age: 35});

    // Query the data
    var getJohn = store.get(12345);
    var getBob = index.get(["Smith", "Bob"]);

    getJohn.onsuccess = function() {
      console.log(getJohn.result.name.first);  // => "John"
    };

    getBob.onsuccess = function() {
      console.log(getBob.result.name.first);   // => "Bob"
    };

    // Close the db when the transaction is done
    tx.oncomplete = function() {
      db.close();
    };
  }

  // Web SQL
  db.transaction(function (tx) {
    tx.executeSql('CREATE TABLE IF NOT EXISTS roms (id integer PRIMARY KEY AUTOINCREMENT, name varchar, data varchar, accessed timestamp DEFAULT SYSDATETIME);', [], function(){}, function(t, e){console.log(t, e)});
    tx.executeSql('CREATE TABLE IF NOT EXISTS styles (id integer PRIMARY KEY AUTOINCREMENT, name varchar, data varchar);', [], function(){}, function(t, e){console.log(t, e)});
    tx.executeSql('CREATE TABLE IF NOT EXISTS styleres (id integer PRIMARY KEY AUTOINCREMENT, res_id integer, style_id integer, data varchar);', [], function(){}, function(t, e){console.log(t, e)});
    tx.executeSql('CREATE TABLE IF NOT EXISTS states (id integer PRIMARY KEY AUTOINCREMENT, name varchar, data varchar, accessed timestamp DEFAULT SYSDATETIME, rom_id integer, rom_name varchar);', [], function(){}, function(t, e){console.log(t, e)});
  });
}

function handleMessage(e) {
  try {
    var data = JSON.parse(e.data);
  } catch (err) {
    return;
  }
  if (data.type == "ROMURL") {
    loadURL(data.url); //.replace("http://dl.coolrom.com", "http://fs1.coolrom.com"));
    closeBrowser();
  }
}

window.addEventListener('load', function(evt) {
  // UI Init

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

  gameboy = new gb(null, document.getElementById('gameboy'), {
    cButByte: true,
    rootDir: '',
    enableLoadBios: currentEnableLoadBios,
  });
  backButtonDisp("none");
  setUpButtons();
  //populateRecentFiles();

  // Selections
  initROMSelection(null, false);

  // Volume
  var volumeController = document.getElementById('audioEngineVolumeControl');
  volumeController.onchange = function(e)
  {
    gbSettings.audioEngineVolume = e.target.value;
    gameboy.setAudioEngineVolume(gbSettings.audioEngineVolume);
    localStorage.setItem('GameBoySettings', JSON.stringify(gbSettings));
  }
  var currentVolume = gbSettings.audioEngineVolume;
  volumeController.value = currentVolume;
  gameboy.setAudioEngineVolume(currentVolume);

  document.getElementById('chooseFile').onchange = function (e) {
    if (!e.target.files.length)
    {
      return;
    }
    var gb = gameboy;
    var file = e.target.files[0];
    var reader = new FileReader();
    reader.gb = gb;
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
})

function showUI() {
  document.getElementById('splash').style.opacity = 0;
  if (localStorage["lastROM"] != null) {
    takeInput = true;
    gameboy.onstart = function(){
      gameboy.loadState(JSON.parse(localStorage["lastState"]));
    }
    loadDownloaded(localStorage["lastROM"]);
  } else { openFileSelect(); }
}

function setUpButtons() {
  for (var i=1; i<=4; i++) {
    document.getElementById("mb"+i).ontouchstart = eval("(function(evt){setActiveMenu("+i+"); evt.preventDefault();})");
    document.getElementById("mb"+i).onclick = eval("(function(){setActiveMenu("+i+")})");
  }

  document.getElementById("editROM").ontouchstart = eval("(function(evt){triggerEdit(false); evt.preventDefault();})");
  document.getElementById("editROM").onclick = eval("(function(){triggerEdit(false)})");

  document.getElementById("editState").ontouchstart = eval("(function(evt){triggerEdit(true); evt.preventDefault();})");
  document.getElementById("editState").onclick = eval("(function(){triggerEdit(true)})");

  var back = document.getElementsByClassName("mbackBtn");
  var i;
  var bl = back.length;
  for (i = 0; i < bl; i++) {
    back[i].onclick = closeFileSelect;
    back[i].ontouchstart = closeFileSelect;
  }
}

function triggerEdit(state) {
  var expands = document.getElementsByClassName("fileEx");
  var fEdit = document.getElementsByClassName("fEditControls");
  if (state)
  {
    expands = document.getElementsByClassName("stateEx");
    fEdit = document.getElementsByClassName("sEditControls");
  }

  var trigger = state? editingStates:editingFiles;
  var i;
  var epsl = expands.length;
  if (trigger) {
    for (i = 0; i < epsl; i++) {
      expands[i].style.opacity = 0;
      applyTransform(expands[i], "translate(30px, 0)");
    };
    for (i = 0; i < fEdit.length; i++) {
      applyTransform(fEdit[i], "translate(100%, 0)");
      if (state) statesState[i].editing = false;
      else recentFilesState[i].editing = false;
    };
  } else {
    for (i = 0; i < epsl; i++) {
      expands[i].style.opacity = 1;
      applyTransform(expands[i], "translate(0, 0)");
    };
  }
  if (state) editingStates = !(editingStates);
  else editingFiles = !(editingFiles);

}

function scrollFix()
{
  window.scrollTo(0, 0)
}

var isMouseClicked = false;
function handleMouse(evt) { //fallback for non touch devices
  if (evt.type === 'mousedown')
  {
    isMouseClicked = true;
  }
  else if (evt.type === 'mouseup')
  {
    isMouseClicked = false;
  }
  if (takeInput)
  {
    var pos = [{pageX: evt.pageX, pageY: evt.pageY}];
    evt.preventDefault();
    if ((evt.type === 'mouseup') || !isMouseClicked)
    {
      pos = [];
    }
    mainUI.getButtons(pos, UIcanvas);
  }
}

function handleTouch(evt) {
  if (takeInput) {
    mainUI.getButtons(evt.touches, UIcanvas);
    evt.preventDefault();
  }
}


function handleKeyboard(evt) {
  if (!takeInput)
  {
    return;
  }

  if (evt.keyCode !== 116)
  {
    evt.preventDefault();
    var btnByte = 0;
    if (evt.type === 'keydown')
    {
      switch (evt.keyCode)
      {
        case 88:
          btnByte = 16;
          break;
        case 90:
          btnByte = 32;
          break;
        case 32:
          btnByte = 64;
          break;
        case 13:
          btnByte = 128;
          break;
        case 38:
          btnByte = 4;
          break;
        case 40:
          btnByte = 72;
          break;
        case 37:
          btnByte = 2;
          break;
        case 39:
          btnByte = 1;
          break;
      }
    }
    gameboy.setButtonByte(255 - btnByte);
  }
}


function dropboxChoose(files) {
  loadURL(files[0].link);
}

function backButtonDisp(disp) {
  var back = document.getElementsByClassName("mbackBtn");
  for (var i=0; i<back.length; i++) {
    back[i].style.display = disp;
  }
}

function openFileSelect() {
  populateRecentFiles();
  populateStates();
  populateControlsDrop();
  var fs = document.getElementById("fileCtr");
  applyTransform(fs, "translate(-100%, 0)");
  gameboy.paused = true;
  takeInput = false;

  drawUIThumbs();
}

function openBrowser(url) {
  var ext = document.getElementById("external");
  applyTransform(ext, "translate(0, 0)");
  var frame = document.getElementById("extiFrame");
  ext.style.display = "block";
  frame.src = url;
}

function closeBrowser() {
  var ext = document.getElementById("external");
  applyTransform(ext, "translate(0, -100%)");
  var frame = document.getElementById("extiFrame");
  setTimeout(function(){ext.style.display = "none";}, 500);
  frame.src = "about:blank";
}

function setActiveMenu(a) {
  activeMenu = a;
  applyTransform(document.getElementById("submenus"), "translate("+((activeMenu-1)*(-100))+"%, 0)");
  for (var i=1; i<=4; i++) {
    applyTransform(document.getElementById("bb"+i), "translate(0, "+((i == activeMenu)?-50:0)+"px)");
  }
}

function closeFileSelect() {
  var fs = document.getElementById("fileCtr");
  document.getElementById("container").className = ""
  applyTransform(fs, "translate(0, 0)");
  gameboy.paused = false;
  takeInput = true;
}

function chooseURL() {
  loadURL(prompt("Enter the URL of the ROM file you want to run:"));
}

function downloadStyle() {
  var url = prompt("Enter the URL of the Style you wish to install:");
  if (!url)
  {
    return;
  }
  var xhr = new XMLHttpRequest();
  xhr.open("GET", url);
  xhr.responseType = "text";
  xhr.onload = function() {
    installStyle(JSON.parse(xhr.responseText), function(id){
      localStorage["currentStyle"] = id;
      loadStyle(id, showUI, function(){alert("Failed to load Style")});
    });
  }
  xhr.onerror = function() {
    alert("Could not download Style.")
  }
  xhr.send();
}

function renameStyle() {
  var newName = prompt("What do you want to rename this style to?");
  if (!newName)
  {
    return;
  }

  db.transaction(function (tx) {
    tx.executeSql('UPDATE styles SET name = ? WHERE id = ?', [newName, localStorage["currentStyle"]], function (tx, results) {
      populateControlsDrop();
    })
  })
}

function deleteStyle() {
  db.transaction(function (tx) {
    tx.executeSql('SELECT id FROM styles', [], function (tx, results) {
      if (results.rows.length < 2) {
        alert("You can't delete the only style!")
        return;
      }
      if (confirm("Are you sure you want to delete this style?")) {
        tx.executeSql('DELETE FROM styles WHERE id = ?', [localStorage["currentStyle"]], function (tx, results) {
          tx.executeSql('SELECT id FROM styles', [], function (tx, results) {
            localStorage["currentStyle"] = results.rows.item(0).id;
            populateControlsDrop();
          })
        })
      }
    });
  })
}

function addROM(name, data, callback) {
  console.log("addROM");
  db.transaction(function (tx) {
    tx.executeSql('SELECT id FROM roms WHERE data = ?', [data], function(tx, result){
      if (result.rows.length)
      {
        return;
      }
      tx.executeSql('INSERT INTO roms (name, data) VALUES (?, ?)', [name, data], function (tx, results) {
        console.log("addedROM");
        activeROM = results.insertId;
        aROMname = name;
        if (callback) callback();
      },
        function(tx, err) {
          console.log(err)
        });
    });
  });
}

function loadState(id, rom_id) {
  db.transaction(function (tx) {
    tx.executeSql('SELECT rom_id, data FROM states WHERE id = ?', [id], function (tx, results) {
      item = results.rows.item(0);
      var state = JSON.parse(item.data);
      if (item.rom_id == activeROM) { gameboy.loadState(state); closeFileSelect();}
      else {
        loadDownloaded(item.rom_id);
        gameboy.onstart = function(){gameboy.loadState(state);}
      }
    },
      function(tx, err){console.log(err)});
  });
}

function downloadState(i, menuID, name) {
  if (!confirm('Download '+name+' ?'))
  {
    return;
  }

  db.transaction(function(tx){
    tx.executeSql('SELECT data FROM states WHERE id=?', [i], function(tx, result) {
      if (result.length <= 0)
      {
        return;
      }
      var state = result.rows[0].data;
      if (window.URL) {
        var url = window.URL.createObjectURL(new Blob([state], { type: 'application/json' }));
        window.open(url);
      } else {
        var data = this.encodeBase64(sram.view);
        window.open('data:application/octet-stream;base64,' + data, name + '.state');
      }
    });
  });
}

function renameState(i, menuID, oldName) {
  var newName = prompt("What do you want to rename the state "+oldName+" to?", oldName);
  if (!newName)
  {
    return;
  }

  if (newName != oldName) {
    db.transaction(function (tx) {
      tx.executeSql('UPDATE states SET name = ? WHERE id = ?', [newName, i], function (tx, results) {
        populateStates();
      })
    })
  }
}

function deleteState(i, menuID, name) {
  if (confirm("Are you sure you want to delete the state "+name+"?")) {
    if (activeROM == i) activeROM = null;
    db.transaction(function (tx) {
      tx.executeSql('DELETE FROM states WHERE id = ?', [i], function (tx, results) {
        populateStates();
      })
    })
  }
}

function stateMenu(id, romid, menuID) {
  if (editingStates) {
    if (statesState[menuID].editing) {
      statesState[menuID].editing = false;
      var e = document.getElementById("seC"+menuID)
      applyTransform(e, "translate(135px, 0)");
      return;
    } else {
      expandSEdit(menuID);
      return;
    }
  }
  loadState(id, romid);
}

function populateStates() {
  db.transaction(function (tx) {
    tx.executeSql('SELECT id, name, rom_name, rom_id FROM states ORDER BY rom_name', [], function (tx, results) {
      editingStates = false;
      var stateCont = document.getElementById("stateCont");
      var rows = results.rows
      var html = "";
      var thisRomHTML = "";
      var prevRomID = -1;
      statesState = [];

      for (var i=0; i<rows.length; i++) {
        var row = rows.item(i);

        var downloadStr = 'downloadState(\''+row.id+'\', '+i+', \''+singleQSafe(row.name)+'\');'
        var renameStr = 'renameState(\''+row.id+'\', '+i+', \''+singleQSafe(row.name)+'\');'
        var deleteStr = 'deleteState(\''+row.id+'\', '+i+', \''+singleQSafe(row.name)+'\');'

        var temp = '<div class="fileEntry" onclick="stateMenu('+row.id+', '+row.rom_id+', '+i+'); event.preventDefault();">'
          + '<div class="entryText">'+htmlSafe(row.name)+'</div>'
          + '<div class="expandDiv">'
          + '<img src="assets/images/expandr.svg" class="expBut stateEx" id="SExp'+i+'" onclick="expandSEdit('+i+'); event.stopPropagation();" />'
          + '<div class="sEditControls" id="seC'+i+'">'
          + '<img src="assets/images/download.svg" width="30" height="30" class="download" onclick="' + downloadStr + '" />'
          + '<img src="assets/images/rename.svg" class="rename" onclick="' + renameStr + '" />'
          + '<img src="assets/images/bin.svg" class="delete" onclick="' + deleteStr + '" />'
          + '</div>'
          + '</div>'
          + '</div>'
        ;

        if (row.rom_id == activeROM) {
          thisRomHTML += temp;
          statesState.push({editing:false});
          continue;
        }
        if (prevRomID != row.rom_id) {
          prevRomID = row.rom_id;
          html += '<div class="sectDivider" style="background-color:#B90546">'
            +htmlSafe(row.rom_name)
            +'</div>'
          ;
        }
        html += temp;
        statesState.push({editing:false});
      }

      if (thisRomHTML.length > 0) thisRomHTML = '<div class="sectDivider" style="background-color:#B90546">For Current Game ('+htmlSafe(aROMname)+')</div>'+thisRomHTML;
      stateCont.innerHTML = thisRomHTML+html;
    },
      function(tx, err){console.log(err)});
  });
}

function expandSEdit(i) {
  var e = document.getElementById("seC"+i);
  applyTransform(e, "translate(0, 0)");
  statesState[i].editing = true;
}

function expandEdit(i) {
  var e = document.getElementById("feC"+i)
  applyTransform(e, "translate(0, 0)");
  recentFilesState[i].editing = true;
}

function renameFile(i, menuID, oldName) {
  var newName = prompt("What do you want to rename "+oldName+" to?", oldName);
  if (!newName)
  {
    return;
  }
  if ((newName != oldName) && (newName != null)) {
    db.transaction(function (tx) {
      tx.executeSql('UPDATE roms SET name = ? WHERE id = ?', [newName, i], function (tx, results) {
        tx.executeSql('UPDATE states SET rom_name = ? WHERE rom_id = ?', [newName, i], function (tx, results) {
          aROMname = newName;
          populateRecentFiles();
          populateStates();
        })
      })
    })
  }
}

function deleteFile(i, menuID, name) {
  if (confirm("Are you sure you want to delete "+name+"? This will delete all states associated to it!")) {
    if (activeROM == i) activeROM = null;
    db.transaction(function (tx) {
      tx.executeSql('DELETE FROM roms WHERE id = ?', [i], function (tx, results) {
        tx.executeSql('DELETE FROM states WHERE rom_id = ?', [i], function (tx, results) {
          populateRecentFiles();
          populateStates();
        })
      })
    })
  }
}

var recentFilesState = [];
var statesState = [];
var editingFiles = false;
var editingStates = false;

function populateControlsDrop() {
  db.transaction(function (tx) {
    tx.executeSql('SELECT id, name FROM styles', [], function (tx, results) {
      var cDrop = document.getElementById("controlsDrop");
      var html = ""
      var style = localStorage["currentStyle"];
      for (var i=0; i<results.rows.length; i++) {
        var row = results.rows.item(i);
        html += "<option id='"+row.id+"'"+((row.id == style)?" selected='selected'":"")+">"+htmlSafe(row.name)+"</option>"
      }
      cDrop.innerHTML = html;
    });
  });
}

function changeControls() {
  var el = document.getElementById("controlsDrop");
  var id = el.options[el.selectedIndex].id;
  loadStyle(id, function(){populateControlsDrop(); drawUIThumbs()});
}

function htmlSafe(input) {
  if (input == null) return "";
  return input.replace(/</g, "&lt;").replace(/>/g, "&gt;")
}

function singleQSafe(input) {
  if (input == null) return "";
  return input.replace(/'/g, "\\'")
}

function populateRecentFiles() {
  db.transaction(function (tx) {
    tx.executeSql('SELECT id, name FROM roms ORDER BY accessed DESC', [], function (tx, results) {
      editingFiles = false;
      var rFCont = document.getElementById("rFCont");
      recentFilesState = [];
      var rows = results.rows
      var html = "";
      for (var i=0; i<rows.length; i++) {
        var row = rows.item(i);
        var filename = htmlSafe(row.name);
        var loadStr = 'loadMenu(\''+row.id+'\', '+i+'); event.preventDefault();'
        var renameStr = 'renameFile(\''+row.id+'\', '+i+', \''+singleQSafe(filename)+'\');'
        var deleteStr = 'deleteFile(\''+row.id+'\', '+i+', \''+singleQSafe(filename)+'\');'

        //r u rdy for the longest generated html ever
        html += '<div class="fileEntry" onclick="'+loadStr+'">'
          + '<div class="entryText">'+filename+'</div>'
          + '<div class="expandDiv">'
          + '<img src="assets/images/expandb.svg" class="expBut fileEx" id="FExp'+i+'" onclick="expandEdit('+i+'); event.preventDefault();" ontouchstart="expandEdit('+i+'); event.preventDefault();" />'
          + '<div class="fEditControls" id="feC'+i+'">'
          + '<img src="assets/images/rename.svg" class="rename" onclick="'+renameStr+'" />'
          + '<img src="assets/images/bin.svg" class="delete" onclick="'+deleteStr+'" />'
          + '</div>'
          + '</div>'
          + '</div>';
        //i dont think u were ready

        recentFilesState.push({editing: false});
      }
      rFCont.innerHTML = html;
    },
      function(tx, err){console.log(err)});
  })
}

function loadMenu(i, menuID) {
  if (editingFiles) {
    if (recentFilesState[menuID].editing) {
      recentFilesState[menuID].editing = false;
      var e = document.getElementById("feC"+menuID)
      applyTransform(e, "translate(90px, 0)");
      return;
    } else {
      expandEdit(menuID);
      return;
    }
  }
  loadDownloaded(i)

}

function loadDownloaded(i) {
  db.transaction(function (tx) {
    tx.executeSql('SELECT data, name FROM roms WHERE id = ?', [i], function (tx, results) {
      if (results.rows.length == 0) { //rom does not exist, go back to menu if not already there
        openFileSelect();
        return;
      }
      activeROM = i;
      aROMname = results.rows.item(0).name;
      backButtonDisp("block");
      gameboy.loadROMBuffer(stringToByte(results.rows.item(0).data));
      closeFileSelect();
    },
      function(tx, err){
        console.error(err);
      });
  })
}

function saveCurrentState() {
  if (!gameboy.ROMname)
  {
    alert('You must play a game!');
    return;
  }
  var d = new Date();
  var suggestedName = gameboy.ROMname+" - "+d.getDate()+"/"+d.getMonth()+"/"+d.getFullYear()+" - "+d.getHours()+":"+d.getMinutes()+":"+d.getSeconds();
  var name = prompt("What would you like to name the state?", suggestedName)
  if (!name) return;
  var state = JSON.stringify(gameboy.saveState());

  db.transaction(function (tx) {
    tx.executeSql('INSERT INTO states (name, data, rom_id, rom_name) VALUES (?, ?, ?, ?)', [name, state, activeROM, aROMname], function (tx, results) {
      console.log("addedState");
    },
      function(tx, err) {
        console.log(err)
      });
  })
  populateStates();
}

function loadURL(url) {
  if (!url)
  {
    return;
  }

  gameboy.onload = function() {
    addROM(gameboy.filename, byteToString(gameboy.game), populateRecentFiles);
  }
  try
  {
    gameboy.loadROM(url);
  }
  catch(err)
  {
    throw err;
  }
  backButtonDisp("block");
  closeFileSelect();
  gameboy.paused = true;
}

function initROMSelection(event, update)
{
  function renderChooseROMSelection(data) {
    romList = data;
    var parent = document.getElementById('chooseROMSelection');
    var selection = parent.getElementsByTagName('select')[0];
    var options_html = '<option disabled selected>---</option>';
    var i;
    var rl = romList.length;
    for (i = 0; i < rl; i++)
    {
      options_html += '<option value="'
        + romList[i].url
        + '">'
        + romList[i].filename
        + '</option>'
    }
    if (rl)
    {
      selection.innerHTML = options_html;
      parent.style.display = 'block';
      localStorage.setItem('romList', JSON.stringify(romList));
    }
  }
  var romList = localStorage.getItem('romList');
  if (typeof romList === 'string')
  {
    renderChooseROMSelection(JSON.parse(romList));
  }

  if (update || (romList ? false : true))
  {
    if (event)
    {
      event.target.onclick = function(e) {
        alert('Updating...');
      };
    }
    function jsonp(url, callback) {
      var callbackName = 'jsonp_callback_' + Math.round(100000 * Math.random());
      window[callbackName] = function(data) {
        delete window[callbackName];
        document.body.removeChild(script);
        callback(data);
      };

      var script = document.createElement('script');
      script.src = url + (url.indexOf('?') >= 0 ? '&' : '?') + 'callback=' + callbackName;
      document.body.appendChild(script);
    }

    var GoogleAppScript_ID = 'AKfycbzzoS36cl8dSCYExKyyzpnLEMeUfclfno0hA37nbFTF8tuKFeRV';

    jsonp('https://script.google.com/macros/s/' + GoogleAppScript_ID + '/exec', function(data){
      renderChooseROMSelection(data);
      if (event)
      {
        event.target.onclick = function(e) {
          initROMSelection(e, update);
        };
      }
      if (update)
      {
        alert('Updated ROM selection');
      }
    });
  }
}

function chooseROMSelection(event)
{
  loadURL(event.target.value);
}

function chooseROMSearchSectionToggle(event)
{
  var searchResultSection = document.getElementById('chooseROMSearchResult');
  var textControl = event.target.parentElement.getElementsByTagName('input')[0];
  var selectControl = event.target.parentElement.getElementsByTagName('select')[0];
  if (searchResultSection.style.display === 'block')
  {
    textControl.style.display = 'none';
    selectControl.style.display = 'inline-block';
    searchResultSection.style.display = 'none';
    applyTransform(event.target, 'scaleY(1)');
  }
  else
  {
    var selection = document.getElementById('chooseROMSelection');
    selection.parentElement.scrollTop = selection.offsetTop - selection.parentElement.offsetTop;
    selectControl.style.display = 'none';
    textControl.style.display = 'inline-block';
    searchResultSection.style.display = 'block';
    applyTransform(event.target, 'scaleY(-1)');
    textControl.focus();
  }
}

function chooseROMSearchOnInput(event)
{
  // https://www.quora.com/Algorithms/How-is-the-fuzzy-search-algorithm-in-Sublime-Text-designed-How-would-you-design-something-similar
  var romList = JSON.parse(localStorage.getItem('romList'));
  var query = event.target.value;

  var tokens = query.toLowerCase().split('');
  var rsHTML = '<div style="margin:10px;max-height: 200px;overflow-x: hidden;border: 1px solid #ccc;">';
  romList.forEach(function(rom) {
    var tokenIndex = 0;
    var stringIndex = -1;

    string = rom.filename.toLowerCase();

    while ((stringIndex++) < string.length) {
      if (string[stringIndex] === tokens[tokenIndex])
      {
        tokenIndex++;
        if (tokenIndex >= tokens.length)
        {
          rsHTML += romElm(rom);
          break;
        }
      }
    }
  });
  rsHTML += '</div>';

  function romElm(rom) {
    return '<div class="fileEntry" onclick="loadURL(\''+rom.url.replace(/'/g, "\\'")+'\');">'
      + '<span style="padding-left:5px;">'
      + rom.filename
      + '</span>'
      + '</div>'
    ;
  };

  document.getElementById('chooseROMSearchResult').innerHTML = rsHTML;
}

