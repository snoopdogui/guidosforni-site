<!-- source: written for this site from the the-merge repo (design brief, commit message, code comments), not scraped from Format -->
## The Merge
One shared canvas that every contribution gets blended into, at a strength picked by a quantum random number generator.

## The Brief
I made this for Moth Hack 2026. The idea was a single collective artwork that keeps changing as people add to it. Earlier drafts had a tiered-access mechanic, then a grid of individually filtered tiles. I dropped both: the tiers were too much work to build and to read quickly, and the grid looked like separate pieces hung side by side, not one merged piece.

## What It Does
You land on the canvas as it stands right now. Upload an image and the canvas is blended toward it, at a strength drawn from Moth Atlas's comet-qrng-v1 quantum random number generator. You see a preview, and if you don't like it you can reroll for a new draw as many times as you want before committing.

After a few rounds you can't pick any one contribution back out of the canvas by eye. So the originals aren't thrown away: they're kept and listed next to the canvas. The list is where the transparency lives, not the artwork. Anyone can look; contributing needs a shared passphrase.

## How I Built It
A static frontend in plain HTML, CSS and JavaScript with no build step, plus a handful of serverless functions on Vercel so the Atlas API key never reaches the browser. The canvas state and images live on Vercel Blob.

## What I Learnt
The plan was to do the merge itself with Atlas's telablur-v1 engine. When I swept the strength on real images, the output wasn't a blend. Its brightness went 27, 34, 46, 113, then 88, against two inputs at about 44 and 145. It didn't move in one direction, and at the lowest strengths, the ones meant to be gentlest, it came out darker than both inputs.

So I replaced it with a plain weighted pixel average, canvas × (1 − s) + photo × s, with the quantum draw mapped onto s between 0.2 and 0.4. Atlas is still in the loop, but only for picking the strength. Measuring the engine before trusting it is what caught this.

Try it → the-merge-ten.vercel.app · Code → github.com/snoopdogui/the-merge
