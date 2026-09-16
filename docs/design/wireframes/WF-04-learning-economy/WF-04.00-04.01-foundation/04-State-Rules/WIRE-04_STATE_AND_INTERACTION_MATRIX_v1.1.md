# WIRE-04 State & Interaction Rules v1.1

All material screens: ready, loading, empty/zero-data, validation, success, error/retry, denied/restricted, offline/interrupted where applicable.

Completion: learner action is a claim/input; authoritative completion appears only after authoritative outcome. LP reward is shown only after governed reward outcome. Failed/duplicate attempts do not optimistically mint LP.

LP: balance and transaction history are authoritative read surfaces. Redemption must fail closed on insufficient balance and must not be represented as successful before authoritative response.

Assessment: submit → processing → authoritative result. Client must not mutate passed/grade.

Long content: vertical scrolling is expected. Desktop can use columns; mobile stacks. Tables transform to cards/lists on mobile. Pagination/infinite scroll is used only where collection scale warrants it.

Touch/accessibility: action targets ~44×44 CSS px, keyboard focus, semantic labels/headings, non-color-only status, modal focus management, accessible names, reduced motion, text wrapping and dynamic-content resilience.
