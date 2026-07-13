// Ghost-root copy (en): key = ghost id (matches src/data/ghosts.js).
// n = name / why = the accident report / fix = the explicitation way out.

export const ghosts = {
  di: { n:'DI container · runtime wiring',
    why:'Which implementation an interface binds to at runtime is written in container config and annotation scans — not at any call site. AI adds a parameter to the interface: it dutifully updates the 4 implementations it can find and misses the 5th — registered elsewhere via an annotation, injected only in one particular environment, crash on startup. The sneakier version: AI sees “only one implementation” and helpfully inlines it — while the plugin ecosystem holds 30 more implementations outside the repo.',
    fix:'Consolidate into a single explicit wiring file, so that “who binds to whom” itself becomes a tree with a root' },
  bus: { n:'Event bus · the runtime subscription table',
    why:'Once an event is fired — who is listening, in what order they run, and whether handling it fires new events — only the runtime knows. AI assumes editing one subscriber is a local change; in reality it tugs a whole cascade: n subscribers hold n² potential interactions, and they are order-sensitive too.',
    fix:'Typed events plus an enumerable subscription manifest checked into the repo — bring the call graph back into the text' },
  disk: { n:'User disks · old files already out there',
    why:'Hundreds of millions of old project files sit on users’ hard drives — outside the repository, and forever beyond change. AI adds a field to a struct, reorders an enum: the new code is perfectly self-consistent, tests all green — and users’ old files never open again. This is the terminal form of “cannot change”: part of the tree’s root grows outside the repository.',
    fix:'Golden-file compatibility tests: sample the “old world on disk” into the repository' },
  deploy: { n:'Deployment system · environments & config',
    why:'Which code path the program takes is decided by YAML and environment variables — the truth lives in the deployment system. What AI sees as “dead code” may be production’s main path: delete it, tests stay green, the release goes red.',
    fix:'Schema-check the config and pull it into type checking; collapse environment differences into an explicit matrix' },
  hyrum: { n:'Downstream callers · dependent code outside the ring',
    why:'Every observable behavior you ship — documented or not — will sooner or later be depended on by code outside the ring (Hyrum’s Law). AI reads the repo: this field is unused, that error message is just copy — change them, tests all green; some downstream script outside the ring is parsing that exact message, and pipelines around the world turn red overnight. Which behaviors of your interface must never change is answered not in your repository but in all of your callers’ — and you don’t even know who they are.',
    fix:'Turn unwritten behavior into explicit contract: contract tests to lock behavior down, semantic versioning plus deprecation windows to govern change' },
};
