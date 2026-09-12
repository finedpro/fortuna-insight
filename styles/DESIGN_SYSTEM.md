# Fortuna Insight — Design System

Source of truth: CSS variables in `app/globals.css`, mapped to Tailwind
tokens in `tailwind.config.ts`. Do not hard-code hex values in components —
always consume via Tailwind classes (`bg-surface`, `text-gold`, etc.).

## Color

| Token                | Role                                  |
| -------------------- | ------------------------------------- |
| `background`         | App canvas, near-black                |
| `surface`            | Card / panel background               |
| `surface-elevated`   | Raised surface (hover, active nav)    |
| `border`             | Hairline dividers                     |
| `foreground`         | Primary text                          |
| `muted-foreground`   | Secondary / label text                |
| `gold`               | Primary brand accent, primary actions |
| `teal`               | Secondary accent, positive signal     |
| `success` / `danger` | Status colors                         |

## Typography

| Role    | Font           | Usage                           |
| ------- | -------------- | ------------------------------- |
| Display | Syne           | Page/section headings only      |
| Body    | Inter          | Paragraphs, UI copy             |
| Mono    | JetBrains Mono | Data, labels, eyebrows, tickers |

Scale: headings use `text-xl` / `text-2xl` / `text-4xl` with `font-display`
and `tracking-tight`. Body copy stays `text-sm` / `text-base` with
`font-sans`. Eyebrows/labels use `font-mono text-xs uppercase tracking-widest`.

## Spacing

Base unit is Tailwind's default 4px scale. Page content uses `px-4 md:px-8`
horizontal padding and `py-8 md:py-10` vertical padding. Cards use `p-6`.
Section-level vertical rhythm uses `gap-4` / `gap-6`.

## Radius

`--radius: 0.625rem` (10px), exposed as `rounded-lg` (full), `rounded-md`
(-2px), `rounded-sm` (-4px). Used consistently for cards, buttons, inputs.

## Signature mark

A small 45°-rotated gold square (`.diamond` utility class) is used sparingly
as a brand mark and active-state indicator — in the sidebar logo, active nav
item, and hero. Not a decorative bullet; reserve it for brand/identity
moments only.
