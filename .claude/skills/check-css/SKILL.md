---
name: check-css
description: Show the CSS Tailwind compiles for given classes, with any @media or @layer around each rule and its position in the stylesheet. Use to check a class compiles at all, how a variant such as motion-safe: or data-[state=open]: is wrapped, or which of two conflicting rules wins on order.
---

# Check compiled CSS

Typecheck, tests and a look in the browser can all miss a class that compiles
wrongly, e.g. a variant that moves a rule later in the stylesheet so it
overrides another. Check the compiled CSS instead:

```bash
./.claude/skills/check-css/scripts/show-compiled-css.ts --class 'motion-safe:animate-in' --class 'fade-in-0'
```

Quote each class name, since brackets such as `data-[state=open]:` are globs
to the shell.

For each class it compiles `apps/web/src/styles/globals.css` the way the app
does, then prints every rule whose selector has that class, with:

- **Position:** e.g. `Rule 615 of 731`. Between two rules of equal
  specificity that set the same property, the later one wins
- **Wrappers:** the at-rules around it, e.g. `@layer utilities > @media
  (prefers-reduced-motion: no-preference)`
- **The rule itself**

Tailwind only generates classes it finds in the app's source files, so add a
class to the code before checking it. "No rule found" means it isn't used, or
is spelled differently.
