# TECH-29A-07 — Local Push Checklist

- [ ] Clone/pull existing `main`.
- [ ] Create `backup-before-canonical-sync`.
- [ ] Copy package contents over existing clone without deleting existing files.
- [ ] Run `git status`.
- [ ] Run `git diff --stat`.
- [ ] Run `git diff --name-status`.
- [ ] Expected deletions: **none** unless explicitly approved.
- [ ] Review `supabase/migrations/`.
- [ ] Review new `supabase/candidates/`.
- [ ] Confirm no secrets or credentials are present.
- [ ] Commit.
- [ ] Push normally; never force-push.

If unexpected deletions appear, STOP and reconcile before pushing.
