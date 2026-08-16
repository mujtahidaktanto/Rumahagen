# RUMAHAGEN — Canonical Repository Reconciliation Package v1.2

## IMPORTANT: RECONCILIATION OVERLAY, NOT A BLIND REPLACEMENT

This package is designed to be copied **over an existing local clone** of the RumahAgen GitHub repository.

Do NOT delete the existing repository first. The existing GitHub repository contains a substantial product/architecture/database/API/UX/security/module-planning/roadmap/AI-context/report structure and historical archive that must be preserved.

### Remote baseline verified

Repository: `mujtahidaktanto/Rumahagen`

Verified `main` commit:
`5c1e17411302e90e58bb493afc98ec1bcdf6fc02`

### What this package adds/updates

- Latest D6 global synchronized governance artifacts.
- AEP #1–#4 synchronization packages and master AEP material.
- Master Business Rules / traceability artifacts.
- ADR/MADCR evidence and formal closure artifacts.
- TECH-01 through TECH-29 history/current artifacts.
- Corrected M01–M13 migration baseline selected from the uploaded corpus.
- TECH-24/25 Session migration candidates.
- TECH-26/27/28 authorization candidates.
- Source provenance archive and SHA-256 manifest.
- TECH-29 repository/staging control notes.

### Supabase execution control

`supabase/migrations/` contains the selected corrected legacy baseline.

`supabase/candidates/` contains controlled candidate artifacts and MUST NOT be promoted/executed automatically.

The current Supabase project is explicitly being treated as an internal test/development environment, not production.

### Safe local workflow

```bash
git clone https://github.com/mujtahidaktanto/Rumahagen.git
cd Rumahagen
git checkout main
git pull origin main
git branch backup-before-canonical-sync
```

Then copy the **contents** of this package over the working tree. Do not delete existing files first.

Review:

```bash
git status
git diff --stat
git diff --name-status
```

If unexpected deletions appear, STOP.

Only after review:

```bash
git add .
git commit -m "chore: synchronize RumahAgen canonical baseline through TECH-29"
git push origin main
```

Never use `git push --force` for this synchronization.

### Canonical precedence

1. Explicitly approved user/governance decisions.
2. Latest formal closure / D6 synchronized baseline.
3. Latest downstream TECH synchronization artifacts.
4. Corrected migration candidates selected by technical reconciliation.
5. Older GitHub material retained as history unless explicitly superseded.

Historical material is preserved; it is not silently rewritten.
