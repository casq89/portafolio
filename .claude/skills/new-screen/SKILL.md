---
name: new-screen
description: Create a new screen (route/page) in the portfolio frontend. Use when the user asks for a new screen, page, route or menu option that opens its own page ("crea una screen", "nueva pantalla", "nueva página", "agrega /algo al menú").
---

# New screen

Goal: add a screen with as few tool calls as possible. Everything you need is below. Do NOT explore the codebase, list folders or read files to "understand the pattern". Only read a file if an edit below fails.

Talk to the user in Spanish. Everything in the code is in English.

## 0. Inputs

From the request, work out the following:
- `Name`: PascalCase screen name (`Hobbies`), `route`: kebab-case (`/hobbies`)
- Menu: should it go in the top nav? Default **yes** if the user mentions the menu/navbar, otherwise **no**.
- Content: if the user did not provide it, use clearly marked placeholders (`// TODO: placeholder content`). Do not ask.

Ask only if the screen's purpose is genuinely unclear, and then ask once, in a single question.

## 1. Files (create them all in one response, in parallel)

**`frontend/src/data/<camelName>.ts`**: typed content. Components only render it.

```ts
export interface <Item> {
  name: string;
  description: string;
}

// TODO: placeholder content, replace with the real <thing>.
export const <camelName>: <Item>[] = [ /* 3 items */ ];
```

**`frontend/src/screens/<Name>/index.tsx`**: default export. The `<main>` (max-w-6xl, px-6), Navbar and Footer already come from `Layout`, so don't add them.

```tsx
import BackLink from '../../components/BackLink';
import SectionHeader from '../../components/SectionHeader';
import Window from '../../components/Window';
import { <camelName> } from '../../data/<camelName>';

function <Name>() {
  return (
    <section className="py-10 md:pb-24">
      <BackLink to="/" path="~/<route>" />

      <div className="mt-8">
        <SectionHeader path="~/<route>" title="<Short title>" description="<One line>" />
      </div>
      {/* render <camelName> here */}
    </section>
  );
}

export default <Name>;
```

Building blocks you can use (no need to read them):
- `BackLink({ to, path })`: breadcrumb back link `← cd <path>`, required at the top of every inner screen. `path` names the section the screen belongs to: for a top-level menu screen that is its own route (`to="/" path="~/hobbies"`); for a screen under a home section, that section (`to="/#projects" path="~/projects"`). Case studies get it from `CaseHero`.
- `SectionHeader({ path, title, description? })`
- `Window({ title?, meta?, highlighted?, className?, children })`: card with a mono title bar
- For a case study: `CaseHero`, `FeatureRow` plus a data file typed with `data/caseStudy.ts`. In that case, read `screens/Konecta/index.tsx` once as the reference.
- Components used only by this screen go in `screens/<Name>/components/<Comp>/index.tsx`.

Design tokens (Tailwind 4, `@theme` in `src/index.css`). Never use raw hex values:
- Colors: `canvas surface raised line edge edge-strong fg muted subtle accent` (as `bg-*`, `text-*`, `border-*`)
- Fonts: `font-sans`, `font-display` (headings), `font-mono` (body copy / labels)
- Shadows: `shadow-layer-sm|md|(none)|lg` (accent offset), `shadow-light-sm|light` (fg offset)
- Look: `rounded-2xl border-[1.5px] border-edge bg-surface`, lowercase mono labels, `hover:-translate-y-0.5`

## 2. Edits (same response as step 1)

**`frontend/src/App.tsx`**: add the import in alphabetical order, and the route before the `path="*"` route:
```tsx
import <Name> from './screens/<Name>';
        <Route path="/<route>" element={<<Name> />} />
```

**`frontend/src/data/portfolio.ts`** (only if it goes in the menu): append to `navLinks`, with a lowercase label to match the others:
```ts
  { label: '<route>', href: '/<route>' },
```

**`CLAUDE.md`**: add `` `/<route>` → `screens/<Name>` `` to the Screens list (line starting with "Routing with `react-router`"), and `<Name>` to the `src/screens/<Screen>/` folder list.

Internal links always use `<Link to>` from `react-router`, never `<a href>`.

## 3. Verify (one call)

```bash
cd frontend && npm run lint 2>&1 | tail -15 && npm run build 2>&1 | tail -4
```

Fix any errors and re-run. Don't commit or push unless asked.

## 4. Report

Give a short report in Spanish: the URL (`http://localhost:5173/<route>` if the dev server is running), the files touched, and what is placeholder. Offer to fill in the real content.
