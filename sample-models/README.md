# Sample models for testing the feedback feature

Two fixtures, used to check both sides of the backwards-compatibility rule.

| File | Purpose |
| --- | --- |
| `student-model-no-feedback.json` | Shape produced by every version of AMMBER before this feature. Has no `feedback` key at all. Opening it must behave exactly as before: no feedback column, no arrows. Saving it stamps it `unfeedbacked`. |
| `student-model-reviewed.json` | Carries a `feedback` block with two comments and three arrows. Opening it through **Open Model**, with no reviewer signed in, must show the feedback column read-only with the arrows drawn. |

Both files share the same model, so they can be opened one after the other to
compare behaviour.

| `student-model-graded.json` | Carries feedback *and* a grade. Opening it should raise the grade overlay straight away, and leave a **Your Grade** button beside Export. |
