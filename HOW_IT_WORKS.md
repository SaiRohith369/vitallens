# How VitalLens works

## The problem

Most people never check basic health signals unless something already feels wrong. A clinic visit takes effort and wearables cost money. But nearly everyone carries a phone with a decent front camera.

## The science in plain words

When the heart pumps, blood flows into the tiny vessels under your skin and then drains away again. More blood means slightly more light is absorbed, especially green light. So the brightness of your skin, in the green channel, goes up and down a tiny bit with every heartbeat.

The change is very small (around 1% of the pixel value), which is why you can't see it but software can pick it up. The technique is called remote photoplethysmography, or rPPG.

## What the code does

All the logic is in `js/signal.js`.

1. **Collect.** `app.js` grabs about 15 frames per second for 15 seconds. For each frame it averages the green channel of the middle region.
2. **Resample.** Browser timers are a bit uneven, so we interpolate the readings onto an even 20 Hz grid. Frequency analysis needs this.
3. **Remove drift.** Cameras adjust exposure and lighting changes over time. We subtract a moving average so only the quick pulse ripple remains.
4. **Window.** A Hamming window stops the edges of the recording from creating fake frequencies.
5. **Search for the pulse.** Using the Goertzel algorithm we measure the signal strength at every heart rate from 42 to 180 BPM.
6. **Check confidence.** We compare the strongest frequency to the average of all of them. If it doesn't clearly stand out, we return "no reading".

### Why not just count peaks?

Our first version counted peaks in the brightness signal. That gave wildly wrong numbers (like 12 or 16 BPM) because the real pulse is tiny and lighting noise created fake peaks. Looking at the whole recording in the frequency domain is much more robust, because noise is random while a heartbeat repeats.

## The stress label

We use how dominant the pulse frequency is as a rough indicator. A clean, regular rhythm gives a sharp peak (labelled Calm). A messier rhythm gives a flatter one (Moderate / Elevated). This is a simple heuristic for a demo, not clinical heart rate variability.

## Privacy

Everything runs in the browser. No video or data is uploaded anywhere.

## Disclaimer

VitalLens is for wellness awareness only and is not a medical device.
