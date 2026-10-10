<!-- source: written for this site, not scraped from Format -->
## Terra Trust
A proof-of-concept data trust for cocoa cooperatives, built on synthetic data.

## The Brief
EU rules on deforestation push cocoa buyers to show where their beans were grown. Farmers produce that data, but usually have little say in who uses it or what they get back. I wanted to explore whether a data trust could change that: farmers hold consent, a fiduciary entity enforces it, and buyers only ever see aggregates.

## What It Does
Every farmer sets consent for each kind of data (coarse plot location, yield, price) and each purpose (EUDR due diligence, price benchmarking, supply chain planning). They can do it on the web or on a simulated feature phone menu, and both write to the same ledger.

Buyers pick a purpose and a question. A policy engine checks the purpose, the consent, the size of the group, and whether the answer could be subtracted from an earlier one to isolate a person. If a check fails, the query is refused, and the reason is explained and logged. If they all pass, the buyer gets an aggregate and the fee is split between farmers, cooperatives and the trust.

## How I Tested It
I wrote 27 adversarial queries as data: re-identification attempts, tiny groups, differencing sequences, purpose violations, and consent withdrawn halfway through a session. 25 are scored and all pass. The other two are attacks the prototype does not stop, a group where everyone has the same value and two buyers pooling answers. I kept them in the suite and report them separately. I also checked that the tests can fail: switch off the differencing check and the cases that depend on it fail.

I scored the synthetic dataset against the Open Data Institute's AI-ready data framework and published a JSON-LD data card, which validates with no errors against the Croissant reference library. The scorecard is my own self-assessment, informed by the framework. It is not an ODI assessment.

## What It Is Not
It is not deployed, and it has no real farmers, cooperatives or buyers. Every record comes from a seeded random generator. It makes no claim to meet the EU Deforestation Regulation or any other law, and its privacy controls are heuristics, not guarantees. The README sets out what real use would need: consent designed with the communities concerned, legal review and a security audit.

## What I Learnt
Consent withdrawal turned out to be a differencing attack in its own right. If a farmer leaves between two identical queries, subtracting the answers reveals their value, so the engine has to treat a withdrawal like any other change to the group.

Writing the expected outcomes from the threat model, before looking at what the engine did, mattered. And the reference validator caught a mistake in my own data card that I would not have spotted by eye.

Try it → terra-trust-beta.vercel.app · Code → github.com/snoopdogui/terra-trust
