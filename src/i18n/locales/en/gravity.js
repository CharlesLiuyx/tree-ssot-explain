// Essential-coupling copy (en): kinds = names & subtitles of the three growth patterns,
// pairs = why each pair cannot be separated (key = 'a|b').

export const gravityKinds = {
  mirror: { name:'Mirror images', desc:'change one side, change the other' },
  faces:  { name:'Two faces of one state', desc:'two projections of the same state' },
  halves: { name:'Two halves of one mechanism', desc:'only together do they make a whole' },
};

export const gravityPairs = {
  'edit.undo|ui.command':'Every command must be undoable: command definitions and the undo stack are mirror images — change one and you must change the other. This is not a design flaw; it is the shape of the problem itself',
  'edit.dirtyprop|perf.invalidate':'“What changed, and what must be discarded” is a single invalidation graph: however the dependency graph propagates dirty flags is exactly how the cache must invalidate — change one propagation rule and the invalidation cascade must change with it, or you either miss invalidations or nuke everything',
  'edit.modes|ui.ctxscope':'The same key is a different command in each mode (Blender’s Tab/G/R/S): shortcuts are scoped by context, and that “context” is precisely the editor’s mode table — add a mode, add a keymap scope, forever evolving in lockstep',
  'conc.mainthread|ui.dirtyrect':'The render loop grows on the main-thread contract: which code may touch the UI, which frame must yield the main thread — the threading model and the redraw cadence are mirror images, physically unable to live apart',
  'edit.selset|ui.gizmo':'A gizmo is the selection set’s visible handle: the two share a single piece of state, physically unable to live apart',
  'edit.depsgraph|ui.realtime':'The viewport is a realtime projection of the data model: every incremental evaluation of the dependency graph repaints the matching dirty region — frame-for-frame in sync (Blender’s depsgraph ↔ viewport)',
  'edit.multisel|ui.multiedit':'Batch editing is defined as “write the same change into every member of the multi-selection”: the semantics of multi-select (who is in the set, who is active) are the semantics of batch edit — one is the noun, the other the verb, for the same thing',
  'collab.cursors|edit.active':'The other person’s cursor on your screen is their “active item & focus” broadcast over: what the presence system transmits is, by its nature, focus state itself — one schema that neither side may change alone',
  'ui.pluginapi|arch.ext':'Two halves of one extension mechanism: the API surface on the product side and the registration machinery on the architecture side, born as one (VS Code’s extension host)',
  'collab.oplog|edit.snapshot':'Collaboration’s official history is the operation log; local undo’s official history is snapshots and deltas — multiplayer undo must convert between the two histories in real time: “undo my operation” first requires understanding everyone else’s operations stacked on top. Merge semantics and undo semantics define each other — the deepest well in any Figma-class product',
  'collab.crdt|edit.datablock':'“Mergeable” is first an identity problem: “the same object” in two replicas must carry the same ID, and the merge rules grow on the datablock system’s civil registry — CRDTs and the ID system presuppose each other (Figma’s objectID ↔ merge semantics)',
  'fault.idempotent|bill.billevent':'Billing events may neither be lost nor duplicated: “exactly once” = retries × idempotency keys — billing correctness grows directly on idempotency, so both sides must be designed together and reconciled together',
};
