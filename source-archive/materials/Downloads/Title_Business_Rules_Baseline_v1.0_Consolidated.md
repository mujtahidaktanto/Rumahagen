# TITLE BUSINESS RULES BASELINE v1.0
## Consolidated & Conflict-Resolved — Rules 001–100

**Status:** Consolidated / Conflict Resolved  
**Coverage:** Rules 001–100  
**Authority:** User-locked decisions  
**Principle:** A/B/C/D/E decisions explicitly locked by the user are authoritative.

---

## A. TITLE FOUNDATION & AUTHORITY

| ID | Consolidated Rule | Resolution |
|---|---|---|
| 001 | Title dapat berasal dari berbagai achievement source dan architecture harus extensible. | Final |
| 002 | Title Authority menggunakan model hybrid: RumahAgen, Partner, dan Agency/Organization sesuai scope dan authority. | Final |
| 003 | Semua earned Title dapat menjadi Primary. Tidak ada pembatasan source yang otomatis melarang Primary. | Final |
| 004 | Title memiliki configurable lifecycle: Permanent, Revocable, Expirable, atau Hybrid. | Final |
| 005 | Ketika Primary/Featured kehilangan validity karena Expired/Revoked, presentation aktifnya kehilangan eligibility dan mengikuti fallback policy. | Final |
| 006 | Maksimum 3 Featured Title. Title lain tetap berada di Title Collection. | Final |
| 007 | Public dapat melihat Title Collection sesuai visibility policy, tetapi hanya Title Active/Valid yang dianggap current/public-valid. | Final |
| 008 | Primary merupakan posisi paling menonjol; Featured dapat memiliki urutan yang dikontrol agen sesuai presentation policy. | Resolved with #29 and #100: Primary bukan slot Featured otomatis. |
| 009 | Featured optional: 0–3 Featured Title. | Final |
| 010 | Primary optional: 0–1 Primary Title. | Final |

## B. TITLE PROGRESSION & AWARD STRUCTURE

| ID | Consolidated Rule | Resolution |
|---|---|---|
| 011 | Repeat, Renewal, dan Progression merupakan policy configurable per Title. | Final |
| 012 | Ketika agen memperoleh level berikutnya, Title level sebelumnya tetap Active kecuali policy menentukan sebaliknya. | Progression tidak berarti automatic downgrade/deactivation. |
| 013 | Title dapat berdiri sendiri atau berhubungan dengan Credential. | Final |
| 014 | Awarding Rule dapat menggunakan automatic, verified, manual, application, atau hybrid mechanism. | Final |
| 015 | Self-Claim dapat diizinkan atau dilarang per Title. | Final |
| 016 | Evidence Policy dapat dikonfigurasi per Title/Awarding Path. | Final |
| 017 | Public verification/evidence access tidak tersedia sebagai universal rule; evidence bersifat internal. | Final |
| 018 | Evidence dapat diakses owner, issuer, dan authorized RumahAgen Admin sesuai RBAC. | Final |
| 019 | Auto-awarded Title tidak dapat ditolak oleh agen. | Final |
| 020 | Manual award tanpa evidence diperbolehkan hanya jika Awarding/Evidence Policy mengizinkannya. | Final |

## C. TITLE VERSIONING & IDENTITY

| ID | Consolidated Rule | Resolution |
|---|---|---|
| 021 | Perubahan material terhadap business rule menghasilkan new Awarding Rule/Title version. Award lama tetap terkait version saat award diberikan. | Final |
| 022 | Rename Title berlaku global terhadap Title/award terkait. | Rename ≠ new Award; Award Instance tetap sama. |
| 023 | Title yang pernah diberikan tidak boleh hard-delete; dapat dikeluarkan dari active catalog. | Final |
| 024 | Existing owner tetap dapat melihat/menampilkan historical/inactive Title sesuai presentation/visibility policy. | Final |

### Resolution #21 vs #22

Material logic change membuat version baru. Rename hanya mengubah Title Name representation dan tidak membuat Award baru.

## D. REVOCATION, REINSTATEMENT & APPEAL

| ID | Consolidated Rule | Resolution |
|---|---|---|
| 025 | Revocation Authority ditentukan berdasarkan Authority + Issuer + RBAC + Scope. | Final |
| 026 | Revoked Title dapat direinstate oleh authorized party. | Final |
| 027 | Setelah Reinstatement, presentation state yang sesuai dapat dipulihkan. | Pemulihan menghormati perubahan presentation yang dilakukan agen selama revoked. |
| 028 | Manual choice agen selama revoke memiliki prioritas terhadap automatic restoration. | Final |
| 029 | Primary independen dari Featured. Maksimum 1 Primary + 3 Featured promoted titles. | Critical resolution. |
| 030 | Primary boleh kosong. | Final |
| 031 | Setiap Title wajib memiliki satu Primary Category. | Final |
| 032 | Category menggunakan core RumahAgen category + additional category sesuai scope/policy. | Final |
| 033 | Level/Progression optional per Title. | Final |
| 034 | Progression Path dapat sequential, direct, mixed, atau konfigurasi lain yang diizinkan. | Final |
| 035 | Earned Title tidak otomatis downgrade ketika kondisi berikutnya berubah. | Final |
| 036 | Satu event dapat menghasilkan beberapa Title Award. | Final |
| 037 | Satu Title dapat memiliki multiple Awarding Paths. | Final |
| 038 | Multiple Awarding Paths disimpan sebagai provenance; memenuhi beberapa path tidak otomatis membuat duplicate Title. | Final |
| 039 | Awarding Path dapat memiliki prerequisite configurable. | Final |
| 040 | Prerequisite yang kemudian Expired/Revoked tidak otomatis membatalkan Earned Title. | Critical resolution. |

## E. LEARNING, ASSESSMENT & AWARDING

| ID | Consolidated Rule | Resolution |
|---|---|---|
| 041 | Learning Points bukan universal requirement; dapat digunakan sebagai prerequisite bila Title/Awarding Path mengonfigurasikannya. | Final |
| 042 | Assessment dapat dikonfigurasi per Title/Awarding Path. | Final |
| 043 | Completion-only awarding diperbolehkan apabila Awarding Path mengizinkannya. | Final |
| 044 | Learning dapat menjadi salah satu sumber achievement/awarding path, tetapi tidak wajib untuk semua Title. | Final |
| 045 | Title tertentu dapat diberikan berdasarkan Learning Points sesuai awarding configuration. | Final |
| 046 | Learning Points yang sudah diperoleh tidak otomatis berkurang ketika digunakan sebagai milestone/qualification. | Final |
| 047 | Metric Learning Points dapat dikonfigurasi; cumulative/lifetime earned dapat menjadi default metric sesuai policy. | Final |
| 048 | Awarding condition mendukung AND/OR/grouping. | Final |
| 049 | NOT condition tidak digunakan dalam Awarding Condition model. | Final |
| 050 | Salah satu Awarding Path yang terpenuhi dapat cukup untuk memperoleh Title apabila policy menggunakan OR/multiple path eligibility. | Final |

## F. AWARDING PATH & PROVENANCE

| ID | Consolidated Rule | Resolution |
|---|---|---|
| 051 | Award dapat menyimpan primary awarding path dan optional additional qualifying paths sebagai provenance. | Final |
| 052 | Awarding Path memiliki lifecycle/versioning sendiri. | Final |
| 053 | Authorized issuer dapat membuat Title sesuai authority dan scope. | Final |
| 054 | Agen tidak dapat membuat self-created official Title. | Final |
| 055 | Title Name global harus unik. | Final |
| 056 | Name uniqueness menggunakan normalization. | Final |
| 057 | Rename wajib melewati uniqueness validation. | Final |
| 058 | Description tidak harus unik. | Final |
| 059 | Icon tidak harus unik. | Final |
| 060 | Icon optional; sistem dapat menyediakan default presentation. | Final |
| 061 | Visual theme per Title bukan configurable business attribute; icon-based presentation digunakan sesuai policy. | Final |
| 062 | Title memiliki Canonical Name dan optional Display/Short Name. | Final |
| 063 | Canonical Name dan Display Name harus mengikuti uniqueness rules. | Final |
| 064 | Jika Display Name kosong, effective display menggunakan Canonical Name. | Final |
| 065 | Multilingual Name/Description optional. | Final |
| 066 | Translation mengikuti Title Management RBAC. | Final |
| 067 | Translation menggunakan fallback chain. | Final |
| 068 | Canonical Name wajib menggunakan English. | Final |
| 069 | Canonical language divalidasi secara automated dan dapat membutuhkan review. | Final |
| 070 | Brand/trademark dapat digunakan apabila authority/governance mengizinkan. | Final |

## G. SCOPE, AGENCY & HISTORICAL OWNERSHIP

| ID | Consolidated Rule | Resolution |
|---|---|---|
| 071 | Scope khusus diperlukan ketika Title bergantung pada Partner/Agency/Organization context. | Final |
| 072 | Platform Title dapat tampil lintas konteks jika scope mengizinkannya. | Final |
| 073 | Scope-dependent Title mengikuti lifecycle membership/context. | Final |
| 074 | Re-entry ke scope tertentu dapat membutuhkan requalification sesuai policy. | Final |
| 075 | Historical visibility mengikuti visibility policy dan tidak boleh menghapus provenance. | Final |
| 076 | Agency/Partner tidak dapat menghapus historical Award Instance secara langsung. | Final |
| 077 | Permanent deletion hanya melalui exceptional controlled process. | Final |
| 078 | Revoked Title tidak boleh dipresentasikan sebagai Active; historical visibility mengikuti policy. | Final |
| 079 | Issuer dapat revoke dalam authority scope-nya; RumahAgen memiliki governance/override authority sesuai policy. | Final |
| 080 | Revocation notification mengikuti Notification Policy. | Final |

## H. APPEAL & DISPUTE

| ID | Consolidated Rule | Resolution |
|---|---|---|
| 081 | Semua Title wajib memiliki Appeal/Review mechanism. | Final |
| 082 | Appeal mengikuti issuer review dengan optional RumahAgen escalation. | Final |
| 083 | Appeal tidak otomatis restore Title; Stay Policy menentukan efek selama appeal. | Final |
| 084 | Stay Policy menggunakan layered governance. | Final |
| 085 | Appeal attempts configurable; default dapat menggunakan 1 attempt per revocation. | Final |
| 086 | Appeal memiliki mandatory time window. | Final |
| 087 | Appeal Window configurable dalam platform governance boundary. | Final |
| 088 | Appeal Window dihitung sejak Revocation timestamp. | Locked A; mengalahkan rekomendasi sebelumnya. |
| 089 | Jika revocation overturned, Award Instance lama direstore; tidak dibuat Award Instance baru. | Final |
| 090 | Original Award Date tidak berubah setelah restoration. | Final |

## I. VALIDITY, EXPIRATION & RENEWAL

| ID | Consolidated Rule | Resolution |
|---|---|---|
| 091 | Validity Policy: Permanent, Fixed Duration, Fixed Expiry Date, atau Renewable. | Final |
| 092 | Renewal dan Requalification merupakan mekanisme berbeda. | Final |
| 093 | Repeat Award Policy dapat memungkinkan multiple Award Instances untuk Title yang sama. | Final |
| 094 | Multiple Award Instances mengikuti Presentation Policy. | Final |
| 095 | Agen dapat memilih representative Award Instance jika Presentation Policy mengizinkannya. | Final |

## J. FEATURED & PROFILE PRESENTATION

| ID | Consolidated Rule | Resolution |
|---|---|---|
| 096 | Expired Title boleh Featured; Revoked Title tidak boleh Featured. | Locked C; mengalahkan rekomendasi sebelumnya. |
| 097 | Expired Title yang ditampilkan wajib memiliki status Expired yang jelas. | Final |
| 098 | Under Appeal Featured eligibility mengikuti effective validity dan Stay Policy. | Final |
| 099 | Agen dapat remove Title dari Featured tanpa mengubah Award, Award Instance, validity, atau historical record. | Final |
| 100 | Agen dapat menentukan urutan Featured Title secara bebas dalam batas maksimum 3. | Final |

---

# RULE DEPENDENCY & TRACEABILITY MATRIX 1–100

## Matrix Legend

- **DEP** = depends on / prerequisite
- **REL** = related rule
- **CON** = constraint
- **RES** = conflict-resolution relationship
- **IMP** = downstream impact
- **CONFIG** = configurable policy dependency

| Rule | Depends / Related Rules | Relationship | Main Downstream Domains |
|---|---|---|---|
| 001 | 014, 037 | DEP | Awarding Engine, ERD, API |
| 002 | 025, 053, 071, 079 | DEP | Authority, RBAC, ERD |
| 003 | 010, 029, 035 | CON | Presentation, Profile |
| 004 | 005, 078, 091 | DEP | Lifecycle, Schema |
| 005 | 004, 078, 096, 097 | DEP | Presentation, UI |
| 006 | 009, 029, 100 | CON | Profile, API |
| 007 | 075, 078, 097 | DEP | Visibility, Public API |
| 008 | 029, 100 | RES | Presentation |
| 009 | 006, 096, 099, 100 | DEP | Profile |
| 010 | 003, 008, 029, 030 | DEP | Profile |
| 011 | 012, 033, 034, 092, 093 | DEP | Lifecycle |
| 012 | 033, 034, 035 | REL | Progression |
| 013 | 037, 091 | REL | Credential, Award |
| 014 | 001, 037, 048, 050 | DEP | Awarding Engine |
| 015 | 014, 016, 018 | DEP | Claim Flow, RBAC |
| 016 | 014, 020, 018 | DEP | Evidence, RBAC |
| 017 | 018, 075 | CON | Privacy, API |
| 018 | 016, 017, 025 | DEP | RBAC, Evidence |
| 019 | 014, 015 | CON | Award Flow |
| 020 | 014, 016, 018 | DEP | Manual Award |
| 021 | 022, 052, 093 | RES | Versioning, Schema |
| 022 | 055, 056, 057, 062, 063 | DEP | Identity, API |
| 023 | 024, 075, 076, 077 | DEP | Data Retention |
| 024 | 023, 075, 078, 096 | DEP | Profile, History |
| 025 | 002, 053, 079, RBAC | DEP | Authorization |
| 026 | 025, 027, 028, 078 | DEP | Lifecycle |
| 027 | 028, 096, 099 | RES | Presentation |
| 028 | 027, 099 | RES | Presentation State |
| 029 | 006, 008, 009, 010, 100 | RES | Profile |
| 030 | 010, 029 | CON | Profile |
| 031 | 032, 033 | DEP | Taxonomy |
| 032 | 031, 071 | DEP | Category |
| 033 | 011, 012, 034, 035 | DEP | Progression |
| 034 | 011, 033, 035 | DEP | Progression |
| 035 | 012, 040, 091 | RES | Lifecycle |
| 036 | 037, 038 | DEP | Event Engine |
| 037 | 001, 014, 036, 038, 050, 093 | DEP | Awarding Engine |
| 038 | 037, 051, 093 | DEP | Provenance |
| 039 | 040, 041, 042 | DEP | Qualification |
| 040 | 039, 091, 092 | RES | Award Lifecycle |
| 041 | 042, 044, 045, 047 | DEP | Learning |
| 042 | 014, 043 | DEP | Assessment |
| 043 | 042, 050 | DEP | Awarding |
| 044 | 041, 045, 046 | REL | Learning |
| 045 | 041, 047, 050 | DEP | Learning/Award |
| 046 | 041, 047 | CON | Learning Points |
| 047 | 041, 045, 046 | CONFIG | Learning Engine |
| 048 | 014, 049, 050 | DEP | Rule Engine |
| 049 | 048 | CON | Rule Engine |
| 050 | 037, 048, 051 | DEP | Awarding Engine |
| 051 | 037, 038, 052 | DEP | Provenance |
| 052 | 021, 037, 051 | DEP | Versioning |
| 053 | 002, 025, 054, 071 | DEP | Issuer/RBAC |
| 054 | 002, 053 | CON | RBAC |
| 055 | 056, 057, 062, 063 | DEP | Identity |
| 056 | 055, 057 | DEP | Validation |
| 057 | 055, 056, 062 | DEP | API |
| 058 | 062 | REL | Metadata |
| 059 | 060, 061 | REL | Presentation |
| 060 | 059, 061 | REL | UI |
| 061 | 060, 059 | CON | UI |
| 062 | 055, 063, 064, 065, 068 | DEP | Identity/Localization |
| 063 | 055, 056, 057, 062 | DEP | Validation |
| 064 | 062, 065, 067 | DEP | Localization |
| 065 | 066, 067, 068 | DEP | Localization |
| 066 | 065, 067, RBAC | DEP | RBAC |
| 067 | 064, 065, 068 | DEP | Localization |
| 068 | 062, 065, 069 | DEP | Localization |
| 069 | 068, 070 | DEP | Governance |
| 070 | 002, 053, 069 | DEP | Governance |
| 071 | 002, 053, 073, 074 | DEP | Scope |
| 072 | 071, 073 | DEP | Visibility |
| 073 | 071, 074, 075 | DEP | Membership |
| 074 | 073, 039, 040 | DEP | Re-entry |
| 075 | 023, 024, 076, 077, 078 | DEP | History |
| 076 | 075, 077 | CON | RBAC/Data |
| 077 | 023, 076, 075 | CON | Data Retention |
| 078 | 004, 005, 075, 096, 098 | DEP | Lifecycle/Presentation |
| 079 | 002, 025, 053, RBAC | DEP | Revocation |
| 080 | 078, 081, 088 | DEP | Notification |
| 081 | 025, 078, 083, 086 | DEP | Appeal |
| 082 | 081, 079, 084 | DEP | Appeal Workflow |
| 083 | 081, 084, 088, 098 | DEP | Appeal/Lifecycle |
| 084 | 083, 098 | DEP | Governance |
| 085 | 081, 086 | CONFIG | Appeal |
| 086 | 081, 087, 088 | DEP | Appeal |
| 087 | 086, 088 | CONFIG | Governance |
| 088 | 086, 087, 080 | RES | Appeal |
| 089 | 026, 081, 083, 090 | DEP | Restoration |
| 090 | 089, 093 | CON | Award History |
| 091 | 004, 040, 092, 093 | DEP | Lifecycle |
| 092 | 011, 091, 093 | DEP | Renewal |
| 093 | 011, 037, 038, 094, 095 | DEP | Award Instance |
| 094 | 093, 095, 096 | DEP | Presentation |
| 095 | 093, 094, 099, 100 | DEP | Profile |
| 096 | 078, 091, 097, 098, 100 | RES | Presentation |
| 097 | 096, 007 | CON | UI/Visibility |
| 098 | 083, 084, 096 | DEP | Appeal/Presentation |
| 099 | 027, 028, 095, 100 | CON | Profile |
| 100 | 006, 009, 029, 095, 099 | DEP | Profile |

---

# Critical Dependency Chains

## Chain 1 — Awarding

```text
Title Definition
    ↓
Awarding Path
    ↓
Conditions
    ↓
Prerequisites
    ↓
Evidence / Assessment
    ↓
Award Evaluation
    ↓
Award Instance
```

Primary rules:

**001 → 014 → 037 → 039 → 042/043 → 050 → 093**

---

## Chain 2 — Title Lifecycle

```text
Awarded
   ↓
Active
   ├──→ Expired
   │
   └──→ Revoked
           ↓
        Appeal
        ├── No Stay
        └── Stay
             ↓
          Decision
             ↓
        Reinstated
```

Primary rules:

**004 → 078 → 081 → 083 → 084 → 088 → 089 → 090**

---

## Chain 3 — Presentation

```text
Award Instance
      ↓
Validity
      ↓
Presentation Eligibility
      ├── Primary 0–1
      └── Featured 0–3
              ↓
        Agent Ordering
```

Primary rules:

**003 → 006 → 009 → 010 → 029 → 096 → 099 → 100**

---

## Chain 4 — Versioning

```text
Title Identity
      │
      ├── Name / Display Name
      │
      └── Awarding Rule Version
               │
               └── Award Instance
```

Primary rules:

**021 → 022 → 052 → 093**

---

## Chain 5 — Learning

```text
Learning
   ↓
Learning Points
   ↓
Prerequisite
   ↓
Awarding Path
   ↓
Title Award
```

Primary rules:

**041 → 045 → 047 → 039 → 050**

---

## Chain 6 — Revocation & Presentation

```text
Revocation
    ↓
Effective Status
    ↓
Featured Eligibility
    ↓
Appeal / Stay
    ↓
Restore / Remain Revoked
```

Primary rules:

**025 → 078 → 083 → 084 → 096 → 098**

---

# Architecture-Critical Rules

Rules yang paling berpotensi memengaruhi banyak dokumen downstream adalah:

**#002** Authority  
**#004** Lifecycle  
**#014** Awarding mechanism  
**#021** Versioning  
**#023** Deletion/retention  
**#025** Revocation authority  
**#029** Primary vs Featured  
**#036** Event → multiple awards  
**#037** Multiple awarding paths  
**#038** Provenance  
**#039–040** Prerequisite behavior  
**#048–050** Rule evaluation  
**#052** Awarding Path versioning  
**#055–057** Name uniqueness  
**#071–074** Scope/membership  
**#078–080** Revocation lifecycle  
**#081–088** Appeal  
**#089–090** Restoration  
**#091–094** Validity/repeat/renewal  
**#096–100** Presentation.

These should be treated as **high-impact traceability anchors** when updating ERD, Schema, API, RBAC, User Flow, PRD, and Architecture Evolution.

---

# Baseline Conclusion

**Title Business Rules 001–100 are now consolidated and conflict-resolved.**

The resulting model establishes a clear separation between:

- **Title Definition**
- **Awarding Path**
- **Award Instance**
- **Awarding Rule Version**
- **Prerequisite**
- **Evidence**
- **Lifecycle**
- **Appeal**
- **Validity**
- **Presentation**
- **Primary**
- **Featured**
- **Provenance**
- **Issuer/Authority**
- **Scope**

This baseline should now be treated as the **Business Rule Source of Truth v1.0** before downstream architecture documents are updated.
