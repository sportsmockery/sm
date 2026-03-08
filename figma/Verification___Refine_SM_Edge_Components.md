I have the following verification comments after thorough review and exploration of the codebase. Implement the comments by following the instructions in the comments verbatim.

---
The context section for each comment explains the problem and its significance. The fix section defines the scope of changes to make — implement only what the fix describes.

## Comment 1: Required output artifact `figma/SM_EDGE_FAN_WAR_ROOM_SPEC.md` was not created, so consumers cannot locate the War Room specification.

### Context
The user explicitly required a markdown deliverable at `figma/SM_EDGE_FAN_WAR_ROOM_SPEC.md`. Current changes add `figma/Plan_v5___Refine_SM_Edge_Components.md` instead, and no file exists at the required path. This breaks the expected handoff contract for downstream readers, scripts, or design workflows that look up the spec by the requested filename.

### Fix

Create the missing file `figma/SM_EDGE_FAN_WAR_ROOM_SPEC.md` and place the full War Room feature specification content there. Keep the exact filename and location specified by the user. Remove or archive `figma/Plan_v5___Refine_SM_Edge_Components.md` if it is not part of the intended deliverables to avoid ambiguity.

### Referred Files
- /Users/christopherburhans/Documents/projects/sm/figma/Plan_v5___Refine_SM_Edge_Components.md
---
## Comment 2: Delivered markdown is a meta implementation prompt, not a finalized product spec document suitable for direct consumption.

### Context
The new markdown begins with instruction-style meta text and includes imperative sections like "Create File..." and "Implementation Instructions". This format is suited for prompting another agent, not for a final design/architecture spec artifact. As a result, consumers (designers/PM/engineers) receive an intermediary planning prompt instead of a clean War Room spec document.

### Fix

Refactor `figma/SM_EDGE_FAN_WAR_ROOM_SPEC.md` into a final-spec format: remove prompt/meta preamble, remove "create file" instructions, and keep only declarative specification sections (layout, modules, scoring, flows, components, gamification, mobile behavior) as the source-of-truth artifact.

### Referred Files
- /Users/christopherburhans/Documents/projects/sm/figma/Plan_v5___Refine_SM_Edge_Components.md
---
## Comment 3: Spec omits explicit "where it lives" integration contract and CTA entry points provided in the War Room requirements.

### Context
The requirements included concrete entry points and discoverability constraints: route `/war-room`, accessible from left rail, GM Score footer, trade simulator, and mock draft, with CTA copy like "Open Your War Room". The delivered document does not provide a dedicated integration section capturing these entry points as implementation requirements, increasing risk of incomplete cross-surface integration when teams build from the spec.

### Fix

Add a dedicated "Where it Lives" section in `figma/SM_EDGE_FAN_WAR_ROOM_SPEC.md` that explicitly lists route `/war-room`, all required access points (left rail, GM Score footer, trade simulator, mock draft), and canonical CTA text/placement rules.

### Referred Files
- /Users/christopherburhans/Documents/projects/sm/figma/Plan_v5___Refine_SM_Edge_Components.md
---