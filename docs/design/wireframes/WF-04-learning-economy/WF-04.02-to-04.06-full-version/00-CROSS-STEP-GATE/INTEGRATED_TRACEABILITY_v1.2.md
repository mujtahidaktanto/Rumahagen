# WIRE-04.02–04.06 Integrated Traceability — Full Rebuild v1.2

## Logical screen coverage
- WIRE-04.02: 4 screens
- WIRE-04.03: 3 screens
- WIRE-04.04: 5 screens
- WIRE-04.05: 7 screens
- WIRE-04.06: 6 screens
- Total: 25 logical screens / 50 desktop-mobile visual targets

## Corrective closure
1. Course Details Editor explicitly represents title, category, description, prerequisite course and passing grade, plus lifecycle status.
2. Lesson Manager explicitly represents title, content type, content/content URL and ordering.
3. Quiz authoring explicitly represents quiz title, question text/type, option text and correct-answer configuration; correct answers are admin-only.
4. Learning Activity Management explicitly represents code, title, activity type, description, sequence, completion-required, reward LP and lifecycle status.
5. LRN-005 explicitly separates Start Activity from completion claim and authoritative completion.
6. LRN-003 explicitly represents activity instance/current activity/next activity/resume.
7. LRN-007 explicitly hands Qualification/Award/Title to WIRE-07/M15 without managing Title in WIRE-04.
8. Credential Management explicitly separates M04 Credential/Certificate from M15 Award/Title.
9. LP Transactions explicitly covers Earned, Purchased, Redeemed, Used, Adjustment and Reversal.
10. LP transaction provenance explicitly covers Type, Amount, Source/Reason and Date-Time, with source reference available through progressive disclosure.
11. Learning Economy Configuration explicitly separates Read → Edit → Impact Review → Save while preserving history.
12. LP Redemption is fail-closed for insufficient balance and pending submission; success appears only after authoritative response.
13. Every screen has explicit state columns; no generic state sheet is relied upon as sole evidence.
14. Collection scalability behavior is explicitly mapped for large collections.
15. Create Listing fields remain outside WIRE-04 by scope lock.
