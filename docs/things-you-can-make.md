# Things you can make

The business artifacts the library produces, on screen and on paper at exact size. Each rides the print system and the document templates.

## Cards

Business card, conference badge, ID card, name tag. [partial: business card only (templates/card.html); no badge, ID card or name tag]

## Pitch deck

Exact 1920x1080, presents with keys, prints to PDF. Many slide layouts: [partial: exact size, arrow keys, fullscreen and exact print ship in templates/deck.html; only 5 of the layouts below]

- Title. The opening slide. [done]
- Agenda. What is coming. [partial: the generic heading-plus-bullets content slide serves it; no dedicated agenda layout]
- Big statement. One line, full slide. [gap]
- Split. Text beside image. [done]
- Full-bleed image. With one caption line. [gap]
- Data. A chart with its takeaway. [done]
- Table. The numbers slide. [gap]
- Quote. One voice, attributed. [gap]
- Team. Faces and roles. [gap]
- Timeline. The roadmap. [gap]
- Pricing. The plans. [gap]
- Comparison. Features against alternatives. [gap]
- Market. The sizing slide. [gap]
- Closing. The ask and the contact. [done]

## Letters

Letterhead, formal letter, cover letter, offer letter, memo, press release, compliment slip, envelope. [partial: letterhead only (templates/document.html); no other letter shapes]

## Money documents

Invoice, quote, estimate, purchase order, receipt, statement of account, credit note, packing slip, price list, rate card, expense report, timesheet. [partial: invoice only (templates/document.html); nothing else ships]

## Business documents

Proposal, contract, NDA, statement of work, report, business plan, whitepaper, case study, one-pager, spec sheet, media kit, agenda, minutes, SOP, handbook, intake form, waiver. [partial: one-pager only (templates/document.html); nothing else ships]

## Food and retail

Dine-in menu, takeout menu, specials card, shelf price sign, product label, shipping label, thermal receipt, catalogue. [gap]

## Promotion

Flyer, poster, brochure, signage, banner artwork. [gap]

## Certificates

Training certificate, award certificate, with border, seal and signature line. [gap]

## Structured sheets

Org chart, roadmap one-pager, shift rota, attendance sheet, content calendar. [gap]

## The primitives behind all of it

- Page-size registry. Every needed paper and card size. [partial: per-template @page sizes only (deck 1920x1080, document A4, card A4 sheet + 3.5x2in card); no registry]
- N-up print sheets. Many small pieces per sheet, aligned. [partial: a hand-built 5-up duplex sheet in templates/card.html; no library primitive]
- Fold lines. Panels placed and rotated for folding. [gap]
- Form lines. Write-in rules, pen checkboxes, signature lines. [gap]
- Running heads. Page numbers and headers on long documents. [partial: static page-head/page-foot rows in templates/document.html; no automatic page numbers or running heads]
- Serial numbers. Numbered runs for tickets and receipts. [gap]
- QR generator. The bridge from paper to its web twin. [gap]
- Connectors. The lines in org charts and trees. [gap]
- Bleed and large format. Print-shop trim and poster sizes. [gap]
