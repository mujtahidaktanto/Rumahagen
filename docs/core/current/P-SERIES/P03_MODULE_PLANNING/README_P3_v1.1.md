# P3 v1.1 Package Control

This package is a FULL VERSION rebuild of P3, not a patch or append.

Source boundary: the six uploaded ZIPs only.

The included input inventory is the fresh recursive scan of the five upstream/source archives:
3,306 file instances, 131 nested ZIP instances, max depth 2.

The included final validation report uses an explicit self-exclusion rule for the report itself and the SHA manifest, because embedding a hash of a file inside that same file would be circular. An external post-build validation hash is also supplied alongside the final ZIP.
