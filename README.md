# VitalLens

Check your pulse by looking at your phone for 15 seconds.

VitalLens is a small web app that uses the front camera to estimate your heart rate and a rough stress level. No wearable, no touching the lens, no extra hardware. It runs entirely in the browser, so the video never leaves your phone.

Built for the iQOO Hackathon (HealthTech track).

> **Heads up:** this is a wellness tool, not a medical device. Please don't use it to diagnose anything.

## How it works (the short version)

Every time your heart beats, the amount of blood in the skin of your face changes by a tiny amount. You can't see it, but a camera can pick it up as a very small flicker in the green channel of the video. This technique is called **remote photoplethysmography (rPPG)**.

1. The camera records your face for 15 seconds.
2. For each frame we take the middle part of the image and average its green values.
3. We clean up the signal (even out the timing, remove slow lighting drift).
4. We check every heart rate from 42 to 180 BPM and see which one shows up most strongly in the signal.
5. If one rate clearly stands out (we tested the cutoff against random noise), we show it. If not, we ask you to try again instead of guessing.

A longer explanation is in [`docs/HOW_IT_WORKS.md`](docs/HOW_IT_WORKS.md).

## Running it

You don't need to install anything.

**Option 1: just open it**
Download or clone the repo and open `index.html` in Chrome or Edge.

**Option 2: local server** (more reliable for camera permissions)
```bash
git clone https://github.com/<your-username>/vitallens.git
cd vitallens
python -m http.server 8000
```
Then open http://localhost:8000

**Option 3: use the live demo**
`<paste your Netlify / GitHub Pages link here>`

The camera only works on `https://` pages or `localhost`, which is why Netlify and GitHub Pages work fine.

## Getting a good reading

This method is sensitive, so setup matters:

- Face a window or lamp. Light should hit your face, not come from behind you.
- Fill the frame with your face. The app reads the middle of the image.
- Stay still and don't talk for the full 15 seconds.
- Avoid flickering lights and moving backgrounds.

If the signal is too weak, the app says so rather than showing a wrong number.

## Project structure

```
vitallens/
├── index.html          the page
├── css/
│   └── style.css       all the styling
├── js/
│   ├── app.js          camera, scan timer, showing results
│   └── signal.js       the heart rate maths
├── docs/
│   ├── HOW_IT_WORKS.md   the idea in more detail
│   └── DEMO_SCRIPT.md    60 second demo plan
├── LICENSE
└── README.md
```

## Known limitations

Being honest about these:

- Accuracy depends a lot on lighting and camera quality. Dim rooms and cheap webcams give noisy readings.
- Movement breaks the signal. Talking, laughing or turning your head will usually give a "try again".
- The stress label is a rough heuristic based on how clean the pulse signal is. It is not a clinical HRV measurement.
- We don't do face tracking yet. The app reads the centre of the frame, so your face needs to be there.
- Different skin tones and makeup can change signal strength.

## Ideas for next steps

- Face landmark tracking so the region follows your forehead and cheeks
- Better filtering (bandpass + CHROM or POS methods)
- Voice mood check using an on-device speech model
- History of past scans to show trends over the week
- Regional language support

## Team

- `<Your name>` (team lead)
- `<Teammate 2>`
- `<Teammate 3>`

## License

MIT. See [LICENSE](LICENSE).
