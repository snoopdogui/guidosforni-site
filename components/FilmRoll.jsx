'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import styles from './FilmRoll.module.css';

// Wheel remap tuning.
//
// DELTA_PER_SLIDE is the gearing: how much accumulated wheel deltaY it takes to
// travel one frame. Expressed this way (rather than a raw px-per-delta figure)
// the feel stays constant across viewport widths, since a slide is always one
// viewport wide. 420 was chosen by measuring a trackpad-shaped flick through
// Chrome's real input pipeline: a moderate flick reports ~360-420 cumulative
// deltaY, which should advance exactly one frame.
//
// TAU is the exponential time constant of the follow — bigger = looser and
// floatier, smaller = tighter and snappier.
const DELTA_PER_SLIDE = 850;
const TAU = 95; // ms
const IDLE_MS = 110; // quiet period before we settle onto a frame
const EPSILON = 0.4; // px — close enough to call the lerp finished

// Settle policy. Once a gesture has travelled COMMIT_FRACTION of a slide it
// commits to advancing in that direction rather than reversing to where it
// started — reversing is what read as a twitchy bounce on gentle scrolls.
const COMMIT_FRACTION = 0.15;

// Below this much accumulated deltaY a gesture moves the roll not at all, so an
// accidental brush of the trackpad has nothing to spring back from. This is a
// gate on starting to move, not a threshold applied after moving.
const DEAD_DELTA = 40;

// initialIndex   frame to open on (grid mode uses this to hand back a position)
// onActiveChange fires when the centred frame changes, so a parent can mirror it
// showCounter    the "NN / NN" readout; off when a parent renders it in a toolbar
export default function FilmRoll({
  files,
  title,
  initialIndex = 0,
  onActiveChange,
  showCounter = true,
}) {
  const rollRef = useRef(null);
  const framesRef = useRef([]);
  const [active, setActive] = useState(initialIndex);
  const activeRef = useRef(initialIndex);
  const onActive = useRef(onActiveChange);
  onActive.current = onActiveChange;

  // wheel-lerp state
  const target = useRef(0);
  const current = useRef(0);
  const rafId = useRef(0);
  const lastT = useRef(0);
  const idleTimer = useRef(0);
  const driving = useRef(false); // true while we own scrollLeft
  const gestureStart = useRef(0); // scrollLeft when the current gesture began
  const pending = useRef(0); // deltaY accumulated before movement starts
  const moved = useRef(false); // has this gesture cleared the dead zone?
  const settling = useRef(false); // easing onto a committed frame
  const stepRef = useRef(null); // the rAF follow, so settle() can drive it

  // --- focus falloff -------------------------------------------------------
  // Runs on every scroll frame: map each slide's distance from the container
  // centre to a 0..1 value the stylesheet turns into opacity/blur/scale.
  const paint = useCallback(() => {
    const roll = rollRef.current;
    if (!roll) return;
    const centre = roll.scrollLeft + roll.clientWidth / 2;
    const reach = roll.clientWidth; // one viewport away == fully faded
    let nearest = 0;
    let nearestD = Infinity;

    framesRef.current.forEach((frame, i) => {
      if (!frame) return;
      const slide = frame.parentElement;
      const slideCentre = slide.offsetLeft + slide.offsetWidth / 2;
      const raw = Math.abs(slideCentre - centre) / reach;
      const d = Math.min(1, raw);
      frame.style.setProperty('--d', d.toFixed(4));
      if (raw < nearestD) {
        nearestD = raw;
        nearest = i;
      }
    });

    if (nearest !== activeRef.current) {
      activeRef.current = nearest;
      setActive(nearest);
      onActive.current?.(nearest);
    }
  }, []);

  // Where the roll has to sit for frame `i` to be centred. Same expression the
  // settle logic uses for its snap stops — kept as a separate helper so the
  // tuned settle path stays exactly as it was.
  const stopFor = useCallback((i) => {
    const roll = rollRef.current;
    const frame = framesRef.current[i];
    if (!roll || !frame) return null;
    const slide = frame.parentElement;
    return slide.offsetLeft + slide.offsetWidth / 2 - roll.clientWidth / 2;
  }, []);

  // Open on initialIndex. Instant, not a glide from frame 0 — and it lands on
  // an exact snap stop, so mandatory snap has nothing to correct.
  //
  // Read through a ref and run once per mount on purpose. A parent that mirrors
  // onActiveChange back into initialIndex would otherwise re-fire this on every
  // scroll and yank the roll to the nearest frame mid-gesture.
  const openAt = useRef(initialIndex);
  useEffect(() => {
    const roll = rollRef.current;
    const want = openAt.current;
    if (!roll || !want) return;
    const dest = stopFor(want);
    if (dest == null) return;
    const prev = roll.style.scrollBehavior;
    roll.style.scrollBehavior = 'auto';
    roll.scrollLeft = Math.max(0, Math.min(dest, roll.scrollWidth - roll.clientWidth));
    roll.style.scrollBehavior = prev;
    current.current = roll.scrollLeft;
    target.current = roll.scrollLeft;
    activeRef.current = want;
    paint();
    // stopFor/paint are stable (useCallback with [] deps), so this runs once
  }, [stopFor, paint]);

  useEffect(() => {
    const roll = rollRef.current;
    if (!roll) return;

    let scrollRaf = 0;
    const onScroll = () => {
      // keep the lerp in sync with scrolls we didn't cause (touch, keyboard,
      // scrollbar drag) so the next wheel event starts from the right place
      if (!driving.current) {
        current.current = roll.scrollLeft;
        target.current = roll.scrollLeft;
      }
      if (!scrollRaf) {
        scrollRaf = requestAnimationFrame(() => {
          scrollRaf = 0;
          paint();
        });
      }
    };

    roll.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', paint);
    // images arrive after hydration; repaint as they land
    const imgs = Array.from(roll.querySelectorAll('img'));
    imgs.forEach((im) => im.addEventListener('load', paint));
    paint();

    return () => {
      roll.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', paint);
      imgs.forEach((im) => im.removeEventListener('load', paint));
      if (scrollRaf) cancelAnimationFrame(scrollRaf);
    };
  }, [paint]);

  // --- settle: commit in the direction of travel -------------------------
  const settle = useCallback(() => {
    const roll = rollRef.current;
    if (!roll) return;

    const finish = () => {
      driving.current = false;
      moved.current = false;
      pending.current = 0;
      roll.classList.remove(styles.freeScroll); // snap + smooth back on
    };

    // never crossed the dead zone: nothing moved, so there is nothing to undo
    if (!moved.current) {
      finish();
      return;
    }

    const stops = framesRef.current
      .map((frame) => {
        if (!frame) return null;
        const slide = frame.parentElement;
        return slide.offsetLeft + slide.offsetWidth / 2 - roll.clientWidth / 2;
      })
      .filter((v) => v != null);
    if (!stops.length) {
      finish();
      return;
    }

    const slideW = roll.clientWidth;
    const start = gestureStart.current;
    const travel = current.current - start;
    const frac = travel / slideW;
    const startIndex = stops.reduce(
      (best, v, i) => (Math.abs(v - start) < Math.abs(stops[best] - start) ? i : best),
      0
    );

    let destIndex = startIndex;
    if (Math.abs(frac) >= COMMIT_FRACTION) {
      // at least one frame, more if the flick actually carried that far
      const dir = frac > 0 ? 1 : -1;
      destIndex = startIndex + dir * Math.max(1, Math.round(Math.abs(frac)));
    }
    destIndex = Math.max(0, Math.min(destIndex, stops.length - 1));

    const dest = Math.max(0, Math.min(stops[destIndex], roll.scrollWidth - roll.clientWidth));

    // Ease there with our own follow, and crucially keep scroll-snap disabled
    // until we arrive: re-enabling mandatory snap mid-slide makes the browser
    // yank to its own nearest frame, which overrides the commit above.
    settling.current = true;
    target.current = dest;
    stepRef.current?.();
  }, []);

  // --- wheel -> horizontal, eased ------------------------------------------
  useEffect(() => {
    const roll = rollRef.current;
    if (!roll) return;

    // Desktop only. Touch devices already scroll this correctly and natively,
    // so we never intercept there.
    const pointerIsCoarse =
      typeof window !== 'undefined' && window.matchMedia?.('(pointer: coarse)').matches;
    if (pointerIsCoarse) return;

    const step = (t) => {
      const roll = rollRef.current;
      if (!roll) return;
      const dt = lastT.current ? Math.min(64, t - lastT.current) : 16;
      lastT.current = t;

      // frame-rate independent exponential follow
      const k = 1 - Math.exp(-dt / TAU);
      current.current += (target.current - current.current) * k;
      roll.scrollLeft = current.current;

      if (Math.abs(target.current - current.current) > EPSILON) {
        rafId.current = requestAnimationFrame(step);
        return;
      }

      rafId.current = 0;
      current.current = target.current;
      roll.scrollLeft = current.current;

      // Landed. We're parked exactly on a snap point, so handing control back
      // to CSS scroll-snap now is a no-op rather than a jump.
      if (settling.current) {
        settling.current = false;
        driving.current = false;
        moved.current = false;
        pending.current = 0;
        roll.classList.remove(styles.freeScroll);
      }
    };

    // let settle() kick the loop without duplicating the rAF bookkeeping
    stepRef.current = () => {
      if (!rafId.current) {
        lastT.current = 0;
        rafId.current = requestAnimationFrame(step);
      }
    };

    const onWheel = (e) => {
      // let genuine horizontal input (shift+wheel, horizontal trackpad swipe)
      // fall through to the browser
      if (Math.abs(e.deltaY) <= Math.abs(e.deltaX)) return;
      if (e.ctrlKey) return; // pinch-zoom

      e.preventDefault();

      const max = roll.scrollWidth - roll.clientWidth;
      if (!driving.current || settling.current) {
        settling.current = false;
        driving.current = true;
        gestureStart.current = roll.scrollLeft;
        current.current = roll.scrollLeft;
        target.current = roll.scrollLeft;
        pending.current = 0;
        moved.current = false;
      }

      pending.current += e.deltaY;
      const gain = roll.clientWidth / DELTA_PER_SLIDE;

      if (!moved.current) {
        // still inside the dead zone — hold completely still
        if (Math.abs(pending.current) < DEAD_DELTA) {
          clearTimeout(idleTimer.current);
          idleTimer.current = setTimeout(settle, IDLE_MS);
          return;
        }
        // crossing it: hand over everything accumulated so far, so the roll
        // doesn't feel like it swallowed the first part of the gesture
        moved.current = true;
        roll.classList.add(styles.freeScroll);
        target.current = Math.max(0, Math.min(target.current + pending.current * gain, max));
      } else {
        target.current = Math.max(0, Math.min(target.current + e.deltaY * gain, max));
      }

      if (!rafId.current) {
        lastT.current = 0;
        rafId.current = requestAnimationFrame(step);
      }

      clearTimeout(idleTimer.current);
      idleTimer.current = setTimeout(settle, IDLE_MS);
    };

    roll.addEventListener('wheel', onWheel, { passive: false });
    return () => {
      roll.removeEventListener('wheel', onWheel);
      clearTimeout(idleTimer.current);
      if (rafId.current) cancelAnimationFrame(rafId.current);
    };
  }, [settle]);

  if (!files?.length) return null;

  return (
    <>
      <div
        ref={rollRef}
        className={styles.roll}
        tabIndex={0}
        role="region"
        aria-label={`${title} — ${files.length} images, scroll to move through the roll`}
      >
        {files.map((file, i) => (
          <div key={file} className={styles.slide}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              ref={(el) => {
                framesRef.current[i] = el;
              }}
              src={`/images/${file}`}
              alt={`${title} — ${i + 1} of ${files.length}`}
              className={styles.frame}
              loading={i < 2 ? 'eager' : 'lazy'}
              draggable={false}
            />
          </div>
        ))}
      </div>
      {showCounter && (
        <p className={styles.counter} aria-live="off">
          {String(active + 1).padStart(2, '0')} / {String(files.length).padStart(2, '0')}
        </p>
      )}
    </>
  );
}
