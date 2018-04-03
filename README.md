Frontend: https://hadesd.github.io/GameBoyAdvance/index.html

This project is using amebo - a javascript Gameboy Colour emulator (DMG/GBC). The future focus is to improve accuracy and clean up the API while maintaining solid performance on relevant devices.

## Using amebo

You can instantiate a gameboy object in the following manner:

```javascript
var gameboyObj = new gb('yourROM.gb', canvas, options);
```

The gameboy object exposes a number of properties, but the most important ones are
```javascript
gameboyObj.paused = true; //you can pause the emulation this way
gameboyObj.reset(); //resets the console
gameboyObj.saveState(); //saves the current state into a JSON object and returns it.
gameboyObj.loadState(state); //loads the specified state.

gameboyObj.loadROM(url, pauseAfter); //used to load a ROM from an url
gameboyObj.loadROMBuffer(buffer, battery); //load a rom from an ArrayBuffer

gameboyObj.onload = func; //calls this when the ROM loads
gameboyObj.onstart = func; //calls this when the ROM starts emulating

gameboyObj.setButtonByte(b); //sets the input byte to the specified value.
gameboyObj.prepareButtonByte(); //called internally to generate the next input. Overwrite this with something that uses the above to implement a custom input system.

// Set Volume
gameboyObj.setAudioEngineVolume((float)volume);
```

## Mobile Frontend
<img src="https://cdn.discordapp.com/attachments/157873776040607744/361569999820816386/image.png" width=200><img src="https://cdn.discordapp.com/attachments/157873776040607744/361569816416616448/unknown.png" width=200><img src="https://cdn.discordapp.com/attachments/157873776040607744/361569052373549056/image.png" width=200><img src="https://cdn.discordapp.com/attachments/157873776040607744/361569011411976199/image.png" width=200>

## GBS Player
![image](https://cdn.discordapp.com/attachments/157873776040607744/361571899828076544/unknown.png)

This repo also contains a .gbs audio player that uses amebo to provide its emulation.

https://hadesd.github.io/GameBoyAdvance/gbsplayer.html

## Features:

- DMG/CGB mode
- Heavily Optimized (no asm.js tho)
- Customizable controls
- Savestates
- Saves using localStorage
- Cycle Accurate Instruction Timings
- Realtime audio emulation using the Web Audio API
- Mobile Client, runs full speed on iPhone 5 and up
- RUNS POKEMON! (obviously the most important feature)

## In future:

- Instruction memory timings
- OAM bug
- Cycle accurate display timings
- Display behaviour during write to VRAM while busy
- Wave RAM bug (DMG)
- Boot w/o bios
- Super Gameboy mode
- Downsample audio from high frequency/generate antialiased waves
- IDE for assembling and debugging gameboy programs.
- Support Firefox / IE (Remove WebSQL)
- Support GBA ROM

## License

- Follow https://github.com/riperiperi/amebo
- MIT (c) Hai Le (a.k.a Dark.Hades)

