<!-- source: https://www.guidosforni.com/work/london-cinema-map -->

# Guido Sforni

- Writing

- Work

- Archive

- Documentary

- Contact

## The London Cinema Map

## An interactive map of every cinema in London, designed to give independents the same visual weight as chains.

## The Brief

I built this for myself. Searching for cinemas on Google Maps or chain websites pushes you toward whichever venues pay for SEO or carry the biggest brand presence, which makes it genuinely hard to discover the independent and repertory venues that often have the more interesting programming. So I made a map where everyone gets the same pin.

## What It Does

The app maps every cinema in London on a Leaflet layer, with filtering by chain or independent, format (IMAX, 35mm, etc.), accessibility, price, language, and live showtimes. Click a venue and you get its current programme with a booking link that either deep-links into the cinema's site or proxies through to the booking provider. Cinemas are presented with equal visual weight regardless of size or marketing budget.

## How I built It

Frontend in Next.js, React, and Tailwind, with React-Leaflet for the map. Live cinema and showtime data comes from the MovieGlu API, called through a server-side /api/booking proxy so credentials stay off the client. Vercel Edge caching refreshes roughly every six hours to manage API quota.

The decision I'm proudest of is the metadata layer. MovieGlu gives you authoritative showtimes and venue data, but it doesn't carry the editorial detail I actually cared about: accessibility notes, pricing tiers, discount info, the independent-vs-chain distinction surfaced in the way I wanted. So I kept a curated metadata file alongside the API and merged the two at request time. The alternative would have been to either drop those fields or fork the API data, both of which would have weakened the independent-cinema ethos that's the whole point of the app.

## What I Learnt

The real constraint wasn't code, it was API quota. I hit the limits of MovieGlu's evaluation tier and had to design around it: Edge caching with a six-hour refresh, holding off on the UK Cinema API trial until the app was feature-complete so I wouldn't burn the three-day window on development. It reframed the project from "build the features" to "build the features within a finite request budget," which isn't something I anticipated at the start. Most of the interesting design choices came from working inside that constraint, not around it.

Try it → london-cinema-map.vercel.app
