## What is wrappers?
A small/thin "inbetween laying" file which:
- imports something (ArchivePage from /features/..)
- returns it (export default function Page() { ...)
- contains no own logic

It simply routes /archive and shares it to the right feature-component. 

## Why are we using wrapper?
Because app/../page.tsx is the routing-layer (Next.js App Router) and features/.. contains domain logic and UI (functionality), resulting in:

...wrappers being useful for three main reasons:
1. Separation principles
2. Overview and scaling
3. Easier testing and reusable code

If we on a later time switch structure or framework, or reorganize features the routing-layer will stay intact and stable. When the project scales, its much easier to navigate and maintain. Lastly, the feature-components may be used in several routes or in modules/embedded views without being locked to app/.

## Separating Routing and Functionality gives us:
** Routing layer -> Feature layer **
    (app/)          (features/) 
--------------------------------------
- app/ = routing + framework (Next.js)
- features/ = app-logikk/UI pr function

==> Clean architecture light-version