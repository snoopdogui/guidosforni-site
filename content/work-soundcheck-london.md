<!-- source: written for this site from the soundcheck-london README, not scraped from Format -->
## Soundcheck
A gig finder for London's grassroots venues. Hand-picked, no algorithm.

## The Brief
The big ticketing sites bury the small rooms: the 80 to 250 capacity pubs, DIY spaces and jazz basements. I wanted a way into that scene that's picked by hand rather than ranked by an algorithm.

## What It Does
There are two ways in. The home page is an editorial feed of hand-written picks, each with a bit of context on why the show is worth your evening. The map plots 15 venues on a dark basemap, colour-coded by type (pub, DIY, club, jazz), with a sidebar you can filter by genre, venue type, date range and maximum ticket price.

Click a band and a panel slides over with its genre and how many shows it has coming up. There's also a profile page with your gig history, the bands you follow and which friends are going to what, and you can mark yourself as going to a gig.

## How I Built It
Next.js 16 with the App Router, React 19 and Tailwind v4, plus React Leaflet over a CARTO dark basemap for the map. It runs without any API keys: the tiles come from a keyless public basemap and the gig data ships with the app.

The look is editorial print rather than app. Cream and near-black with a hot orange accent, hard offset shadows and no rounded corners.

## What It Is Not
It isn't a live listings feed yet. The 15 venues are real London grassroots venues with their actual addresses, but the gigs, bands, friends and profile stats on top are a sample dataset I wrote to show how the interface works. The "going" toggle doesn't save anywhere either. Wiring it up to a real ticketing API is the next step.

Try it → soundcheck-london.vercel.app · Code → github.com/snoopdogui/soundcheck-london
