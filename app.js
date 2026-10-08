/*
  app.js
  ------
  Handles the camera, the 15 second scan, and showing the results.
  The actual heart-rate maths lives in signal.js.
*/

const video = document.getElementById('video');
const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d', { willReadFrequently: true });

const startBtn = document.getElementById('startBtn');
const resetBtn = document.getElementById('resetBtn');
const statusEl = document.getElementById('status');
const ring = document.getElementById('ring');
const progress = document.getElementById('progress');
const results = document.getElementById('results');
const bpmNumber = document.getElementById('bpmNumber');
const stressLabel = document.getElementById('stressLabel');
const insightEl = document.getElementById('insight');

const SCAN_SECONDS = 15;
const SAMPLE_EVERY_MS = 66; // roughly 15 readings per second

let samples = [];
let timer = null;
let stream = null;

async function startCamera() {
  try {
    stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'user' } });
    video.srcObject = stream;

    // wait until the browser knows the real video size
    await new Promise(resolve => { video.onloadedmetadata = resolve; });

    // Match the hidden canvas to the video's shape. If we squash a wide
    // video into a square canvas, the region we read ends up in the wrong
    // place and misses the face.
    const width = 120;
    canvas.width = width;
    canvas.height = Math.round(width * (video.videoHeight / video.videoWidth));
    return true;
  } catch (err) {
    console.error(err);
    statusEl.textContent = "Couldn't open the camera. Please allow camera access and try again.";
    return false;
  }
}

// Read one frame, take the middle 40% of it (where the face should be),
// and store the average green value. Green is used because blood absorbs
// green light the most, so it carries the strongest pulse signal.
function readFrame() {
  ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

  const w = Math.round(canvas.width * 0.4);
  const h = Math.round(canvas.height * 0.4);
  const x = Math.round((canvas.width - w) / 2);
  const y = Math.round((canvas.height - h) / 2);

  const pixels = ctx.getImageData(x, y, w, h).data;
  let sum = 0;
  for (let i = 0; i < pixels.length; i += 4) {
    sum += pixels[i + 1];
  }
  samples.push({ t: performance.now(), v: sum / (pixels.length / 4) });
}

function friendlyMessage(bpm, stress) {
  if (!bpm) {
    return "The signal was too noisy for a confident reading. Try facing a steady light, filling the frame with your face, and staying still for the full scan.";
  }
  if (stress === 'Elevated' && bpm > 90) {
    return `Your heart rate is ${bpm} BPM and your rhythm looks a little tense. A short, slow breathing break could help.`;
  }
  if (stress === 'Elevated') {
    return `Your heart rate is steady at ${bpm} BPM, but your rhythm suggests some tension. Worth a minute of stillness before your next task.`;
  }
  if (stress === 'Moderate') {
    return `Heart rate at ${bpm} BPM and looking fairly balanced. Nothing urgent, just pace yourself today.`;
  }
  return `Heart rate at ${bpm} BPM and your rhythm looks calm and steady. Keep it up.`;
}

function runScan() {
  samples = [];
  startBtn.disabled = true;
  resetBtn.classList.add('hidden');
  results.classList.remove('show');
  ring.classList.add('active');
  statusEl.textContent = 'Hold still and keep your face in the frame...';

  const startedAt = performance.now();

  timer = setInterval(() => {
    readFrame();

    const elapsed = (performance.now() - startedAt) / 1000;
    progress.style.width = Math.min(100, (elapsed / SCAN_SECONDS) * 100) + '%';

    if (elapsed >= SCAN_SECONDS) {
      clearInterval(timer);
      finishScan();
    }
  }, SAMPLE_EVERY_MS);
}

function finishScan() {
  ring.classList.remove('active');
  statusEl.textContent = '';
  startBtn.disabled = false;
  resetBtn.classList.remove('hidden');

  const outcome = VitalSignal.estimate(samples);

  if (!outcome || !outcome.bpm) {
    bpmNumber.textContent = '--';
    stressLabel.textContent = '';
    insightEl.textContent = friendlyMessage(null, null);
  } else {
    bpmNumber.textContent = outcome.bpm;
    stressLabel.textContent = outcome.stress + ' rhythm';
    insightEl.textContent = friendlyMessage(outcome.bpm, outcome.stress);
  }
  results.classList.add('show');
}

startBtn.addEventListener('click', async () => {
  if (!stream) {
    statusEl.textContent = 'Asking for camera access...';
    const ok = await startCamera();
    if (!ok) return;
  }
  runScan();
});

resetBtn.addEventListener('click', runScan);
