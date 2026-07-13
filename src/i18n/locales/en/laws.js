// Law-card copy (en, STEP 8): keys match the `k` of src/story/laws.js.
// name / gist / scene (narration for the live scene the camera flies to);
// svg labels are the few words inside the inline diagrams (shapes & cameras live in story/laws.js).

export const laws = {
  roots: { name: 'Humans guard the roots',
    gist: 'Every tree’s SSOT, spec, and platform interfaces must have a human keeper — this is the part AI must never write unsupervised.',
    scene: 'Golden roots wrapped in spinning rims, kept by humans; golden spec pulses flow from root to canopy (SDD) — every node’s meaning can be derived from its root. All 16 roots are lighting up at once.' },
  leaves: { name: 'AI writes the leaves',
    gist: 'As long as a leaf stays single-meaning — test-anchored, layer-respecting, derivable from the root — it is free territory you can hand to AI with confidence.',
    scene: 'Green-rimmed leaves wrapped in rotating test shells (TDD) — AI writes freely here, and a mistake cannot reach the root. 134 leaves are lighting up at once: that is the acreage of the free zone.' },
  coupling: { name: 'Tell the two couplings apart',
    gist: '<span class="r">Accidental coupling</span>: roll up your sleeves and dissolve it (platformize, layer, rate-limit). <span class="mg">Essential gravity</span>: grant it <span class="g">fusion</span> — same module, designed together, one owner.',
    scene: 'Amber contract lines thread the interface rings through the walls — the accidental has been dissolved; golden bubbles wrap the 12 gravity pairs — the essential, legally living together. The magenta nodes lighting up are the pairs whose “distance never existed”.' },
  explicit: { name: 'Keep the truth on the graph',
    gist: 'Any question AI cannot answer even after reading all the code (runtime wiring, subscriptions, old files, environment config, downstream dependents outside the ring) must be made <span class="gh">explicit</span> and brought back into the repository — or AI will edit the text “right” and break the world.',
    scene: 'All five ghost roots have been brought inside the repository boundary — dashed lines turn to solid gold, cyan turns golden, and the tethered nodes stop flickering. The nodes lighting up are the ones whose truth once floated off-graph.' },
  govern: { name: 'Govern entanglement continuously',
    gist: 'Make things explicit, rate-limit, partition, clean up on schedule — but don’t waste your strength pulling apart what was never separable.',
    scene: 'The cyan radar keeps sweeping the forest, cleaning at the end of each loop; all entanglement has been rerouted through golden platform routes, and the platform tree’s service nodes are lighting up — the growth rate of new tangles is held inside the attention budget.' },
};

/* Text labels inside the SVG diagrams (keep them short — the canvas is tiny) */
export const lawsSvg = { human: 'Human', resolve: 'resolve', fusion: 'fuse' };
