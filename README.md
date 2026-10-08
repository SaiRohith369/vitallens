# VitalLens

**Check your pulse by looking at your phone.**

VitalLens is a web app that estimates your heart rate and a rough stress level from a 15-second video of your face, using only the front camera. There's no wearable to buy, no sensor to touch, and nothing to install. Everything runs inside the browser, so your video never leaves your device.

**Live demo:** https://stupendous-semifreddo-70dd80.netlify.app/

Built for the Hackathon, HealthTech track.

> VitalLens is a wellness awareness tool, not a medical device. It does not diagnose, treat or monitor any condition. If something feels wrong, please see a doctor.

---

## Table of contents

1. [The problem](#the-problem)
2. [Our solution](#our-solution)
3. [Features](#features)
4. [How it works](#how-it-works)
5. [Tech stack](#tech-stack)
6. [Project structure](#project-structure)
7. [Using the app](#using-the-app)
8. [Getting a good reading](#getting-a-good-reading)
9. [Running it locally](#running-it-locally)
10. [Deployment](#deployment)
11. [Testing](#testing)
12. [Privacy](#privacy)
13. [Known limitations](#known-limitations)
14. [Future scope](#future-scope)
15. [Demo walkthrough](#demo-walkthrough)
16. [Disclaimer](#disclaimer)
17. [License](#license)

---

## The problem

Most people only think about their heart or stress levels once something already feels wrong. A clinic visit takes time and effort. Fitness bands and smartwatches cost money many people would rather not spend. In smaller towns and villages, even basic health check-ins can be hard to reach.

As a result, early signs like a consistently high resting heart rate or constant tension often go unnoticed.

Meanwhile, almost everyone already carries a device with a good camera: their phone.

## Our solution

VitalLens turns the front camera of any smartphone or laptop into a simple pulse scanner. You look at the screen for 15 seconds, the same way you would for a selfie, and the app gives you:

- Your estimated **heart rate** in beats per minute
- A rough **stress indicator** (Calm, Moderate or Elevated rhythm)
- A short, plain-language message about what the result means

The goal isn't to replace a doctor. It's to make checking in with your body as easy as checking the weather, so more people do it more often.

## Features

- **Contactless pulse estimate.** No finger on the lens, no wearable.
- **Stress indicator.** A simple Calm / Moderate / Elevated label based on how steady the pulse signal is.
- **Plain-language feedback.** One short, friendly message instead of confusing numbers.
- **Honest about uncertainty.** If the signal is too noisy, the app says "try again" instead of showing a made-up number.
- **Live scan guidance.** An oval face guide and a progress bar show the scan running.
- **Works on phones and laptops.** Responsive layout, mirrored selfie-style preview.
- **100% in the browser.** No backend, no accounts, no uploads.
- **Lightweight.** Plain HTML, CSS and JavaScript with no frameworks or dependencies.

## How it works

The technique is called **remote photoplethysmography (rPPG)**.

Every time your heart beats, the amount of blood in the tiny vessels under your skin changes slightly. Blood absorbs green light more than other colours, so the brightness of your skin in the green channel rises and falls by a very small amount (around 1%) with every beat. You can't see this, but a camera picks it up.

Here is what the app does, step by step:

1. **Capture.** For 15 seconds, the app reads about 15 frames per second from the front camera.
2. **Extract.** From each frame it takes the central region (where the face should be) and averages the green channel values. This gives one number per frame, so over time we get a signal that wobbles with the heartbeat.
3. **Resample.** Browser timers aren't perfectly even, so the readings are interpolated onto an even 20 Hz time grid. Frequency analysis needs evenly spaced data.
4. **Remove drift.** Webcams adjust exposure automatically and lighting changes, which causes slow drifts much larger than the pulse itself. A moving-average baseline is subtracted to remove it.
5. **Window.** A Hamming window is applied so the edges of the recording don't create false frequencies.
6. **Search for the pulse.** Using the Goertzel algorithm, the app measures how strong the signal is at every heart rate from 42 to 180 BPM, and picks the strongest one.
7. **Check confidence.** The strongest frequency is compared with the average across all frequencies. If it doesn't clearly stand out, the app refuses to show a number.
8. **Stress label.** A very clean, dominant pulse suggests a regular rhythm (Calm). A weaker, smeared one suggests more variation (Moderate or Elevated). This is a simple heuristic, not a clinical heart rate variability measurement.
9. **Message.** A short friendly message is chosen based on the result.

### Why not just count the peaks?

Our first version counted bumps in the brightness signal. It gave very wrong readings (like 12 or 16 BPM), because the real pulse is tiny and lighting noise created fake peaks. Looking at the whole recording in the frequency domain works much better: noise is random, but a heartbeat repeats, so it stands out.

## Tech stack

| Part | What we used |
|---|---|
| Structure | HTML5 |
| Styling | CSS3 (custom properties, flexbox) |
| Logic | Vanilla JavaScript (no libraries) |
| Camera access | `navigator.mediaDevices.getUserMedia` |
| Pixel reading | HTML5 Canvas API |
| Signal processing | Goertzel algorithm, moving-average detrending, Hamming window |
| Fonts | Fraunces and Space Grotesk (Google Fonts) |
| Hosting | Netlify |

## Project structure

```
vitallens/
├── index.html        the page layout
├── css/
│   └── style.css     all the styling
├── js/
│   ├── app.js        camera, scan timer, showing results
│   └── signal.js     the heart rate maths (no DOM, easy to test)
├── LICENSE
└── README.md
```

`signal.js` has no connection to the page or the camera. It just takes a list of `{ t, v }` readings (timestamp and brightness) and returns a result. That keeps the maths separate from the interface and easy to test.

## Using the app

1. Open the live demo (or run it locally).
2. Tap **Start scan** and allow camera access when the browser asks.
3. Look at the screen with your face in the oval guide and stay still.
4. Wait 15 seconds while the progress bar fills.
5. Read your result: BPM, rhythm label and the short message.
6. Tap **Scan again** whenever you want to repeat it.

## Getting a good reading

This technique is sensitive, so a bit of setup makes a big difference:

- **Face a light source.** A window or lamp in front of you works best. Don't sit with a bright window behind you.
- **Fill the frame.** The app reads the centre of the image, so your face should be there.
- **Stay still.** Avoid talking, laughing or turning your head during the 15 seconds.
- **Avoid flicker.** Some LED and tube lights flicker in ways cameras pick up. Steady natural light is ideal.
- **Use a clean, steady camera.** Rest the phone on something rather than holding it in your hand.

If the signal is too weak, the app says so and asks you to try again.

## Running it locally

You don't need to install anything.

**Simplest way:** download the project and open `index.html` in Chrome or Edge.

**More reliable way (local server):**

```bash
cd vitallens
python -m http.server 8000
```

Then open `http://localhost:8000` in your browser.

Browsers only allow camera access on `https://` pages or on `localhost`, which is why hosted versions on Netlify or GitHub Pages work without any extra setup.

## Deployment

The project is a static site, so it can be hosted anywhere that serves files.

- **Netlify:** drag the project folder onto netlify.com/drop. The current live version is deployed this way: https://stupendous-semifreddo-70dd80.netlify.app/
- **GitHub Pages:** go to the repo's Settings, then Pages, choose the `main` branch and save.

## Testing

The heart rate maths in `js/signal.js` was tested with simulated signals:

- A simulated 72 BPM pulse buried in noise and slow lighting drift was recovered as exactly 72 BPM.
- Pure random noise was run through the estimator 1,000 times. The confidence check rejected it in all but about 2 runs, so false readings on noise are rare.
- Weak pulses are sometimes rejected (the app asks for another scan) rather than risking a wrong number. This was a deliberate trade-off.

Results on real faces depend on lighting, camera quality and how still you stay. The app has not been clinically validated or compared against a medical heart rate monitor.

## Privacy

- All processing happens in your browser.
- No video, images or measurements are uploaded, stored or sent anywhere.
- There are no accounts, cookies or trackers.
- The camera is only used while you are on the page and only read during a scan.

## Known limitations

We'd rather be upfront about these:

- Accuracy depends heavily on lighting and camera quality. Dim rooms and low-quality cameras give noisy readings.
- Movement breaks the signal. Talking or turning your head usually results in a "try again".
- The stress label is a rough heuristic based on how clean the pulse signal is. It is not a clinical heart rate variability measurement.
- There is no face tracking yet. The app reads the centre of the frame, so your face needs to be there.
- Skin tone, makeup, glasses and facial hair can change signal strength.
- It estimates an average heart rate over 15 seconds, not beat-by-beat.
- Not validated against medical equipment, so it should be treated as an indicator only.

## Future scope

- **Face landmark tracking** so the sampled region follows the forehead and cheeks instead of the centre of the frame.
- **Better signal methods** such as bandpass filtering and the CHROM or POS rPPG algorithms.
- **Voice mood check** using an on-device speech model, combined with the pulse reading for a fuller wellness snapshot.
- **Scan history** with simple trend charts across days and weeks.
- **Regional language support** with spoken feedback, so the app is useful to people who don't read English comfortably.
- **Installable app (PWA)** for quick access from the home screen.
- **Validation study** comparing readings against a medical-grade pulse oximeter.

## Demo walkthrough

A short demo (about 60 seconds) follows this flow:

1. **Hook:** "What if the phone already in your pocket could check your pulse?"
2. **Live scan:** open the app, tap Start scan, look at the camera while the progress bar runs for 15 seconds.
3. **Result:** the BPM, rhythm label and friendly message appear.
4. **Why it matters:** many people lack easy access to regular check-ins, and VitalLens needs nothing except the camera they already own.
5. **Close:** project name and thank you.

## Disclaimer

VitalLens is intended for general wellness awareness only. It is not a medical device, has not been approved by any health authority, and must not be used to diagnose, treat, cure or prevent any disease. Readings can be inaccurate. If you have health concerns or feel unwell, please consult a qualified healthcare professional.

## License

Released under the MIT License. See the [LICENSE](LICENSE) file for details.
