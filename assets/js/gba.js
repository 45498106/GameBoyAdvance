var gba;
var runCommands = [];

// Initialize emulator once the browser loads
// window.onload = function () {
//   gba = new GameBoyAdvance();
//   if (gba && FileReader) {
//     var canvas = currentGB.canvas;
//     gba.setCanvas(canvas);
//
//     gba.logLevel = gba.LOG_ERROR;
//
//     // Load the BIOS file of GBA (change the path according to yours)
//     loadRom('assets/libs/GBA.js/resources/bios.bin', function (bios) {
//       gba.setBios(bios);
//     });
//
//     if (!gba.audio.context) {
//       // Remove the sound box if sound isn't available
//       var soundbox = document.getElementById('sound');
//       soundbox.parentElement.removeChild(soundbox);
//     }
//
//   } else {
//     var dead = document.getElementById('controls');
//     dead.parentElement.removeChild(dead);
//   }
// }

/**
 * Resets the emulator
 *
 */
function reset() {
  gba.pause();
  gba.reset();

  var crash = document.getElementById('crash');

  if (crash) {
    var context = gba.targetCanvas.getContext('2d');
    context.clearRect(0, 0, 480, 320);
    gba.video.drawCallback();
    crash.parentElement.removeChild(crash);
    var canvas = document.getElementById('screen');
    canvas.removeAttribute('class');
  } else {
    lcdFade(gba.context, gba.targetCanvas.getContext('2d'), gba.video.drawCallback);
  }

  load.onclick = function () {
    // document.getElementById('loader').click();
  };

  // Clear the ROM
  gba.rom = null;
}

/**
 * Stores the savefile data in the emulator.
 *
 * @param file
 */
function uploadSavedataPending(file) {
  runCommands.push(function () {
    gba.loadSavedataFromFile(file)
  });
}

/**
 * From a canvas context, creates an LCD animation that fades the content away.
 *
 * @param context
 * @param target
 * @param callback
 */
function lcdFade(context, target, callback) {
  var i = 0;

  var drawInterval = setInterval(function () {
    i++;

    var pixelData = context.getImageData(0, 0, 240, 160);

    for (var y = 0; y < 160; ++y) {
      for (var x = 0; x < 240; ++x) {
        var xDiff = Math.abs(x - 120);
        var yDiff = Math.abs(y - 80) * 0.8;
        var xFactor = (120 - i - xDiff) / 120;
        var yFactor = (80 - i - ((y & 1) * 10) - yDiff + Math.pow(xDiff, 1 / 2)) / 80;
        pixelData.data[(x + y * 240) * 4 + 3] *= Math.pow(xFactor, 1 / 3) * Math.pow(yFactor, 1 / 2);
      }
    }

    context.putImageData(pixelData, 0, 0);

    target.clearRect(0, 0, 480, 320);

    if (i > 40) {
      clearInterval(drawInterval);
    } else {
      callback();
    }
  }, 50);
}

