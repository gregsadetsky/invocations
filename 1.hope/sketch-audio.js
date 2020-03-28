let bufferSize = null
let buffer = null
let bandpass = null
let wavesVolume = null
let lastSetBandpassHz = null

// from https://developer.mozilla.org/en-US/docs/Web/API/Web_Audio_API/Advanced_techniques
function audioStart() {
  window.audioCtx = new (window.AudioContext || window.webkitAudioContext)();

  fetch('waves.mp3').then(function(response) {
    return response.arrayBuffer()
  }).then(function(arrayBuffer) {
    audioCtx.decodeAudioData(arrayBuffer).then(function(buffer) {
      const sampleSource = audioCtx.createBufferSource();
      sampleSource.buffer = buffer;
      sampleSource.loop = true;

      wavesVolume = audioCtx.createGain();
      wavesVolume.gain.setValueAtTime(0, audioCtx.currentTime);
      wavesVolume.gain.linearRampToValueAtTime(1, audioCtx.currentTime + 30)

      sampleSource.connect(wavesVolume).connect(audioCtx.destination)
      sampleSource.start();
    })
  })

  const bufferSize = audioCtx.sampleRate * 10; // set the time of the note
  const buffer = audioCtx.createBuffer(1, bufferSize, audioCtx.sampleRate); // create an empty buffer
  let data = buffer.getChannelData(0); // get data

  // fill the buffer with noise
  for (let i = 0; i < bufferSize; i++) {
      data[i] = Math.random() * 2 - 1;
  }

  // create a buffer source for our created data
  let noise = audioCtx.createBufferSource();
  noise.loop = true
  noise.buffer = buffer;

  bandpass = audioCtx.createBiquadFilter();
  bandpass.type = 'bandpass';
  bandpass.frequency.value = 1000;

  volume = audioCtx.createGain();
  volume.gain.setValueAtTime(0, audioCtx.currentTime);
  volume.gain.linearRampToValueAtTime(1, audioCtx.currentTime + 15)


  // connect our graph
  noise.connect(bandpass).connect(volume).connect(audioCtx.destination);
  noise.start();
}

function audioAdjustBandpassHz(hz) {
  if(bandpass == null) {
    return
  }

  // otherwise this negates the ramp
  if(hz === lastSetBandpassHz) {
    return
  }

  // go smoothly from one freq to another
  bandpass.frequency.linearRampToValueAtTime(hz, audioCtx.currentTime + 10)

  lastSetBandpassHz = hz
}