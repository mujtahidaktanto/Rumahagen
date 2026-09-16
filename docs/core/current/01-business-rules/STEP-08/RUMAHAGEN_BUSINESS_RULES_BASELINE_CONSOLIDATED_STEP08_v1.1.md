# RUMAHAGEN --- BUSINESS RULES BASELINE CONSOLIDATED

**Document ID:** RUMAHAGEN-BR-BASELINE-STEP08 **Version:** v1.0
**Status:** CONSOLIDATED SEMANTIC BASELINE --- READY FOR STEP09
**Execution type:** FULL DEEP-SCAN RECONSTRUCTION / SEMANTIC
CONSOLIDATION --- NOT PATCH / NOT APPEND **Core baseline:** Core v1.3
--- IMMUTABLE **Integrated Core v1.4:** NOT GENERATED

## 1. Purpose and Scope

This document is the single human-readable Business Rules baseline
reconstructed from the authoritative STEP08 synchronization corpus and
its upstream semantic authorities. It consolidates the locked Core
BR-001--BR-151, valid M01--M15 semantic rule deltas, the seven STEP05
conflict resolutions, and the approved MBR-COM-001--013 Commercial
Business Rules closure.

This document is the canonical readable layer; the supporting CSV
registers remain the machine-readable evidence, provenance, and audit
layer.

## 2. Authoritative Source Set

-   **Core v1.3:** Normative BR-001--BR-151 baseline and Core
    business-rule traceability artifact.
-   **STEP04 v1.2:** M01--M15 → Core synchronization matrix,
    deterministic finding linkage and classifications.
-   **STEP05 v1.1:** Seven locked semantic conflict resolutions; exact
    conflicting portion only.
-   **STEP06 v1.1:** Additive semantic merge and rule-delta
    preservation/audit.
-   **STEP07 v1.1:** Cross-module authority and complete integration
    coverage boundary.
-   **STEP07-A v1.1:** Document coverage, synchronization order and
    dependency control.
-   **STEP08 v1.2:** Current Business Rules synchronization master and
    supporting registers.
-   **M01--M15 current rebuild corpus:** Authoritative module-domain
    semantic detail and provenance corpus.
-   **MBR-COM-001--013 closure v1.0:** Explicit Owner-approved
    Commercial Business Rules closure.

## 3. Governing Consolidation Rules

-   **Core preservation:** valid Core detail remains unless an approved
    semantic conflict changes the exact affected portion.
-   **Mxx authority is domain-scoped:** a newer/more detailed module
    rebuild does not replace the whole Core artifact.
-   **Canonical merge:**
    `CORE VALID DETAIL RETAINED + VALID Mxx DETAIL + APPROVED CONFLICT UPDATE`.
-   **Duplicate semantic object:** consolidate into one canonical
    representation with combined provenance; do not create duplicate
    canonical objects.
-   **Lifecycle omission is not deletion:** an Mxx artifact omitting a
    Core state does not delete that Core state.
-   **Conflict scope is granular:** isolate the rule, condition, actor,
    state, transition, action, ownership, authority, exception, or
    downstream effect that actually conflicts.
-   **Physical/runtime separation:** this document defines business
    semantics; it does not authorize SQL, schema, API, RLS, payment
    activation, or production deployment.

## 4. Canonical Business Rules --- BR-001--BR-151

The 151 Core rules retain their original identifiers and normative
definitions. They are not renumbered to absorb the 73 M01--M15 delta
units.

### BR-001 --- Agency Ownership

**Normative rule:** Setiap Agency memiliki satu Lead yang bertanggung
jawab atas Agency. **Status:** LOCKED / CORE CANONICAL

### BR-002 --- Agency Membership

**Normative rule:** User dapat memiliki status membership terhadap
Agency berdasarkan lifecycle membership. **Status:** LOCKED / CORE
CANONICAL

### BR-003 --- Lead Role

**Normative rule:** Lead memiliki hak pengelolaan Agency sesuai
Permission Matrix. **Status:** LOCKED / CORE CANONICAL

### BR-004 --- Member Role

**Normative rule:** Member memiliki hak operasional yang dibatasi dan
tidak otomatis memperoleh hak administratif Lead. **Status:** LOCKED /
CORE CANONICAL

### BR-005 --- Personal Context

**Normative rule:** Setiap agent memiliki konteks personal yang terpisah
dari konteks Agency. **Status:** LOCKED / CORE CANONICAL

### BR-006 --- Agency Context

**Normative rule:** Listing, entitlement, analytics, dan aktivitas harus
dapat dibedakan berdasarkan konteks Personal atau Agency. **Status:**
LOCKED / CORE CANONICAL

### BR-007 --- Membership ≠ Ownership

**Normative rule:** Membership Agency tidak menentukan ownership
Personal Listing. **Status:** LOCKED / CORE CANONICAL

### BR-008 --- Membership ≠ Personal Entitlement

**Normative rule:** Berakhirnya membership tidak otomatis menghapus
Personal Entitlement. **Status:** LOCKED / CORE CANONICAL

### BR-009 --- Agency Listing Ownership

**Normative rule:** Agency Listing memiliki owner agent, tetapi current
context adalah Agency. **Status:** LOCKED / CORE CANONICAL

### BR-010 --- Personal Listing Ownership

**Normative rule:** Personal Listing berada dalam personal context
agent. **Status:** LOCKED / CORE CANONICAL

### BR-011 --- Listing Origin

**Normative rule:** Listing mempertahankan origin/historical origin.
**Status:** LOCKED / CORE CANONICAL

### BR-012 --- Current Context

**Normative rule:** Listing hanya memiliki satu current context aktif:
Personal atau Agency. **Status:** LOCKED / CORE CANONICAL

### BR-013 --- Agency Listing Visibility

**Normative rule:** Draft Personal Listing agent lain tidak dapat
dilihat member lain kecuali permission mengizinkan informasi tertentu.
**Status:** LOCKED / CORE CANONICAL

### BR-014 --- Agency Listing CRUD

**Normative rule:** Hak CRUD Agency Listing mengikuti Permission Matrix.
**Status:** LOCKED / CORE CANONICAL

### BR-015 --- Personal Listing Isolation

**Normative rule:** Personal Listing tidak diproses oleh Agency
lifecycle. **Status:** LOCKED / CORE CANONICAL

### BR-016 --- Voluntary Member Leave

**Normative rule:** Member dapat meninggalkan Agency secara sukarela.
**Status:** LOCKED / CORE CANONICAL

### BR-017 --- Forced Removal

**Normative rule:** Lead dapat melakukan Forced Removal terhadap Member.
**Status:** LOCKED / CORE CANONICAL

### BR-018 --- Forced Removal Notification

**Normative rule:** Member yang di-Forced Removal menerima notification;
approval tidak diperlukan. **Status:** LOCKED / CORE CANONICAL

### BR-019 --- Leave and Forced Removal Equivalence

**Normative rule:** Voluntary Leave dan Forced Removal memiliki outcome
listing/entitlement yang sama; trigger/audit reason dibedakan.
**Status:** LOCKED / CORE CANONICAL

### BR-020 --- Standard Member Exit Transfer

**Normative rule:** Agency Listing member yang keluar/di-Forced Removal
dievaluasi untuk transfer ke Personal Draft. **Status:** LOCKED / CORE
CANONICAL

### BR-021 --- Published + Active Promo Exception

**Normative rule:** PUBLISHED + PROMO_ACTIVE tidak langsung menjadi
Personal Draft. **Status:** LOCKED / CORE CANONICAL

### BR-022 --- Promo Continuation

**Normative rule:** Listing tersebut tetap Agency Published sampai promo
berakhir. **Status:** LOCKED / CORE CANONICAL

### BR-023 --- Promo Expiry Transfer

**Normative rule:** Promo expiry wajib memicu automatic transfer
evaluation. **Status:** LOCKED / CORE CANONICAL

### BR-024 --- Automatic Transfer Trigger

**Normative rule:** Transfer tidak menunggu agent login/manual action.
**Status:** LOCKED / CORE CANONICAL

### BR-025 --- Non-Exception Listing

**Normative rule:** Listing di luar exception langsung menjadi
PERSONAL_DRAFT. **Status:** LOCKED / CORE CANONICAL

### BR-026 --- Member Exit Listing Ownership

**Normative rule:** Listing hasil transfer menjadi milik agent owner
sebelumnya. **Status:** LOCKED / CORE CANONICAL

### BR-027 --- Personal Context Detachment

**Normative rule:** Listing transfer: current_context=PERSONAL,
agency_id=NULL, status=PERSONAL_DRAFT, owner tetap agent. **Status:**
LOCKED / CORE CANONICAL

### BR-028 --- Origin Preservation

**Normative rule:** Origin Agency tetap dipertahankan. **Status:**
LOCKED / CORE CANONICAL

### BR-029 --- Listing Data Retention

**Normative rule:** Hanya data listing dasar yang dipertahankan.
**Status:** LOCKED / CORE CANONICAL

### BR-030 --- Agency-Specific Data

**Normative rule:** Data khusus konteks Agency tidak otomatis menjadi
Personal Data. **Status:** LOCKED / CORE CANONICAL

### BR-031 --- Lead History Deletion

**Normative rule:** Lead History dihapus ketika listing menjadi Personal
Draft. **Status:** LOCKED / CORE CANONICAL

### BR-032 --- No Lead History Migration

**Normative rule:** Lead History tidak dipindahkan Agency → Personal.
**Status:** LOCKED / CORE CANONICAL

### BR-033 --- Audit Boundary

**Normative rule:** Audit tidak boleh menyimpan isi Lead History yang
telah dihapus. **Status:** LOCKED / CORE CANONICAL

### BR-034 --- Historical Audit Retention

**Normative rule:** Audit Agency tetap dipertahankan sebagai historical
record. **Status:** LOCKED / CORE CANONICAL

### BR-035 --- Promo Consumption

**Normative rule:** Promo yang digunakan dicatat CONSUMED. **Status:**
LOCKED / CORE CANONICAL

### BR-036 --- Consumed Promo Non-Reversal

**Normative rule:** Consumed promo tidak dikembalikan hanya karena
member keluar. **Status:** LOCKED / CORE CANONICAL

### BR-037 --- Agency Promo During Member Exit

**Normative rule:** Pada Member Exit biasa, promo aktif tetap berjalan
sampai expiry. **Status:** LOCKED / CORE CANONICAL

### BR-038 --- Agency Closure Promo

**Normative rule:** Pada closure, promo Agency aktif langsung hangus.
**Status:** LOCKED / CORE CANONICAL

### BR-039 --- Closure Promo Exception

**Normative rule:** Exception Published + Active Promo tidak berlaku
pada Agency Closure. **Status:** LOCKED / CORE CANONICAL

### BR-040 --- Unused Promo

**Normative rule:** Sisa promo yang belum digunakan tetap Agency
entitlement selama valid. **Status:** LOCKED / CORE CANONICAL

### BR-041 --- Permanent Add-on

**Normative rule:** Permanent Add-on tidak mengikuti expiry promo.
**Status:** LOCKED / CORE CANONICAL

### BR-042 --- Allocation Ownership

**Normative rule:** Allocated Permanent Add-on menjadi milik agent
penerima. **Status:** LOCKED / CORE CANONICAL

### BR-043 --- Unallocated Ownership

**Normative rule:** Unallocated Permanent Add-on pada closure menjadi
milik Owner Agency. **Status:** LOCKED / CORE CANONICAL

### BR-044 --- Allocation Survives Member Exit

**Normative rule:** Allocated add-on tetap milik agent setelah leave.
**Status:** LOCKED / CORE CANONICAL

### BR-045 --- Allocation Survives Forced Removal

**Normative rule:** Forced Removal tidak menghapus allocated add-on.
**Status:** LOCKED / CORE CANONICAL

### BR-046 --- No Automatic Reclaim

**Normative rule:** Lead tidak otomatis mendapatkan kembali allocated
add-on. **Status:** LOCKED / CORE CANONICAL

### BR-047 --- Permanent Add-on Consumption

**Normative rule:** Consumption tidak mengubah ownership allocation.
**Status:** LOCKED / CORE CANONICAL

### BR-048 --- Post-Closure Personal Use

**Normative rule:** Add-on yang menjadi milik agent dapat langsung
digunakan sebagai Personal Entitlement. **Status:** LOCKED / CORE
CANONICAL

### BR-049 --- Owner Unallocated Add-on

**Normative rule:** Unallocated add-on yang menjadi Owner dapat langsung
digunakan sebagai Personal Entitlement. **Status:** LOCKED / CORE
CANONICAL

### BR-050 --- Permanent Add-on and New Agency

**Normative rule:** Personal Entitlement tidak otomatis menjadi Agency
entitlement baru. **Status:** LOCKED / CORE CANONICAL

### BR-051 --- Closure Initiator

**Normative rule:** Closure hanya dapat dimulai Lead. **Status:** LOCKED
/ CORE CANONICAL

### BR-052 --- Closure Warning

**Normative rule:** Sistem menampilkan warning irreversibility sebelum
closure. **Status:** LOCKED / CORE CANONICAL

### BR-053 --- Explicit Confirmation

**Normative rule:** Lead harus memilih Continue secara eksplisit.
**Status:** LOCKED / CORE CANONICAL

### BR-054 --- Cancellation Before OTP

**Normative rule:** Cancel pada confirmation mempertahankan ACTIVE.
**Status:** LOCKED / CORE CANONICAL

### BR-055 --- Email OTP Gate

**Normative rule:** Setelah Continue, sistem mengirim email OTP.
**Status:** LOCKED / CORE CANONICAL

### BR-056 --- OTP Verification Requirement

**Normative rule:** Agency masuk CLOSING hanya setelah OTP sukses.
**Status:** LOCKED / CORE CANONICAL

### BR-057 --- OTP Failure

**Normative rule:** OTP gagal/expired/tidak selesai mempertahankan
ACTIVE dan flow harus diulang. **Status:** LOCKED / CORE CANONICAL

### BR-058 --- OTP Request Limit

**Normative rule:** Maksimal 3 OTP request dalam satu closure flow.
**Status:** LOCKED / CORE CANONICAL

### BR-059 --- OTP Verification Attempt Limit

**Normative rule:** Setiap OTP maksimal 3 verification attempts.
**Status:** LOCKED / CORE CANONICAL

### BR-060 --- OTP Three-Attempt Failure

**Normative rule:** 3 kegagalan verification me-reset closure flow ke
awal. **Status:** LOCKED / CORE CANONICAL

### BR-061 --- OTP Reset

**Normative rule:** Reset OTP tidak membuat Agency CLOSING. **Status:**
LOCKED / CORE CANONICAL

### BR-062 --- CLOSING Trigger

**Normative rule:** OTP sukses menyebabkan ACTIVE → CLOSING. **Status:**
LOCKED / CORE CANONICAL

### BR-063 --- Irreversible Closure

**Normative rule:** CLOSING tidak dapat kembali ACTIVE. **Status:**
LOCKED / CORE CANONICAL

### BR-064 --- Lead During Closing

**Normative rule:** Lead tetap memiliki title Lead selama CLOSING.
**Status:** LOCKED / CORE CANONICAL

### BR-065 --- Member During Closing

**Normative rule:** Member harus dikeluarkan/diterminasi selama closure
processing. **Status:** LOCKED / CORE CANONICAL

### BR-066 --- New Member Block

**Normative rule:** CLOSING tidak menerima Member baru. **Status:**
LOCKED / CORE CANONICAL

### BR-067 --- Invitation Cancellation

**Normative rule:** Pending invitation dibatalkan saat CLOSING.
**Status:** LOCKED / CORE CANONICAL

### BR-068 --- New Agency Listing Block

**Normative rule:** CLOSING tidak dapat membuat Agency Listing baru.
**Status:** LOCKED / CORE CANONICAL

### BR-069 --- Agency Entitlement Purchase Block

**Normative rule:** CLOSING tidak dapat membeli/menambah Agency
entitlement. **Status:** LOCKED / CORE CANONICAL

### BR-070 --- Agency Operational Freeze

**Normative rule:** Aktivitas operational creation/configuration baru
dilarang selama CLOSING. **Status:** LOCKED / CORE CANONICAL

### BR-071 --- Closure Management Access

**Normative rule:** Lead dapat melihat progress, exception, audit,
historical information, dan melakukan Forced Removal. **Status:** LOCKED
/ CORE CANONICAL

### BR-072 --- Restricted Lead Operations

**Normative rule:** Lead tidak dapat invite/accept member, membuat
listing, membeli entitlement, atau mengubah konfigurasi operational.
**Status:** LOCKED / CORE CANONICAL

### BR-073 --- Role vs Permission

**Normative rule:** Permission ditentukan oleh Role + Agency State.
**Status:** LOCKED / CORE CANONICAL

### BR-074 --- Closing Race Control

**Normative rule:** In-flight creation/publishing Agency Listing
dibatalkan ketika CLOSING dimulai. **Status:** LOCKED / CORE CANONICAL

### BR-075 --- No Post-Closing Agency Creation

**Normative rule:** Tidak ada request yang menghasilkan Agency Listing
setelah CLOSING. **Status:** LOCKED / CORE CANONICAL

### BR-076 --- Owner Closure Listing Rule

**Normative rule:** Semua Agency Listing diproses menjadi Personal Draft
saat closure. **Status:** LOCKED / CORE CANONICAL

### BR-077 --- No Promo Exception During Closure

**Normative rule:** Published + Active Promo tetap langsung ditransfer
saat closure; promo hangus. **Status:** LOCKED / CORE CANONICAL

### BR-078 --- Agency Draft Transfer

**Normative rule:** Agency Draft menjadi Personal Draft. **Status:**
LOCKED / CORE CANONICAL

### BR-079 --- Inactive Listing Transfer

**Normative rule:** Inactive Agency Listing menjadi Personal Draft.
**Status:** LOCKED / CORE CANONICAL

### BR-080 --- Listing Ownership on Closure

**Normative rule:** Listing menjadi milik agent owner masing-masing.
**Status:** LOCKED / CORE CANONICAL

### BR-081 --- Personal Listing Exclusion

**Normative rule:** Personal Listing tidak ikut diproses. **Status:**
LOCKED / CORE CANONICAL

### BR-082 --- Closure Processing

**Normative rule:** Closure processing mencakup termination, promo
forfeiture, listing transfer, add-on ownership, audit, validation.
**Status:** LOCKED / CORE CANONICAL

### BR-083 --- Closure Retry

**Normative rule:** Failure mendapat tepat 1 automatic retry.
**Status:** LOCKED / CORE CANONICAL

### BR-084 --- Retry Failure

**Normative rule:** Retry gagal menghasilkan TRANSFER_EXCEPTION.
**Status:** LOCKED / CORE CANONICAL

### BR-085 --- Exception Does Not Prevent Closure

**Normative rule:** Exception tidak menghalangi CLOSING → CLOSED selama
mandatory membership termination selesai. **Status:** LOCKED / CORE
CANONICAL

### BR-086 --- Exception Deletion on Closed

**Normative rule:** TRANSFER_EXCEPTION dihapus saat Agency CLOSED.
**Status:** LOCKED / CORE CANONICAL

### BR-087 --- Member Completion Requirement

**Normative rule:** Agency tidak CLOSED selama masih ada Member aktif.
**Status:** LOCKED / CORE CANONICAL

### BR-088 --- Lead Completion

**Normative rule:** Lead boleh tetap Lead selama CLOSING. **Status:**
LOCKED / CORE CANONICAL

### BR-089 --- Lead Title Termination

**Normative rule:** CLOSING → CLOSED mengakhiri title Lead. **Status:**
LOCKED / CORE CANONICAL

### BR-090 --- Final Closure

**Normative rule:** Closure requirement terpenuhi menghasilkan CLOSING →
CLOSED. **Status:** LOCKED / CORE CANONICAL

### BR-091 --- CLOSED Finality

**Normative rule:** CLOSED final dan irreversible. **Status:** LOCKED /
CORE CANONICAL

### BR-092 --- No Reopen

**Normative rule:** CLOSED tidak dapat diaktifkan kembali. **Status:**
LOCKED / CORE CANONICAL

### BR-093 --- New Agency Requirement

**Normative rule:** Mantan Lead harus membuat Agency baru jika ingin
memiliki Agency lagi. **Status:** LOCKED / CORE CANONICAL

### BR-094 --- Closed Agency URL

**Normative rule:** URL public Agency tetap tersedia setelah CLOSED.
**Status:** LOCKED / CORE CANONICAL

### BR-095 --- Historical Page

**Normative rule:** Page menampilkan nama, status closed, tanggal
penutupan, dan tombol Home. **Status:** LOCKED / CORE CANONICAL

### BR-096 --- Home Redirect

**Normative rule:** Tombol Home mengarahkan ke Home. **Status:** LOCKED
/ CORE CANONICAL

### BR-097 --- Historical Page Read Only

**Normative rule:** Historical page read-only. **Status:** LOCKED / CORE
CANONICAL

### BR-098 --- Agency Name Reuse

**Normative rule:** Nama Agency CLOSED tidak dapat digunakan kembali.
**Status:** LOCKED / CORE CANONICAL

### BR-099 --- Agency Analytics Retention

**Normative rule:** Agency Analytics tetap historical setelah CLOSED.
**Status:** LOCKED / CORE CANONICAL

### BR-100 --- Personal Analytics Separation

**Normative rule:** Personal Listing Analytics terpisah dari Agency
Analytics. **Status:** LOCKED / CORE CANONICAL

### BR-101 --- No Analytics Migration

**Normative rule:** Agency Analytics tidak dimigrasikan menjadi Personal
Analytics. **Status:** LOCKED / CORE CANONICAL

### BR-102 --- Agency Audit Retention

**Normative rule:** Audit Agency tetap disimpan setelah CLOSED.
**Status:** LOCKED / CORE CANONICAL

### BR-103 --- Historical Audit Access

**Normative rule:** Mantan Lead dapat mengakses historical audit sesuai
permission. **Status:** LOCKED / CORE CANONICAL

### BR-104 --- Audit Does Not Preserve Deleted Lead Content

**Normative rule:** Audit tidak menyimpan isi Lead History yang telah
dihapus. **Status:** LOCKED / CORE CANONICAL

### BR-105 --- New Agency Membership

**Normative rule:** Agent yang keluar dapat bergabung Agency lain.
**Status:** LOCKED / CORE CANONICAL

### BR-106 --- Transferred Listing Remains Personal

**Normative rule:** Personal Draft hasil transfer tetap Personal Draft.
**Status:** LOCKED / CORE CANONICAL

### BR-107 --- No Automatic Agency Reassignment

**Normative rule:** Listing tidak otomatis dipindahkan ke Agency baru.
**Status:** LOCKED / CORE CANONICAL

### BR-108 --- Personal Entitlement Preservation

**Normative rule:** Personal Entitlement tetap milik agent saat
bergabung Agency baru. **Status:** LOCKED / CORE CANONICAL

### BR-109 --- No Automatic Agency Conversion

**Normative rule:** Personal Entitlement tidak otomatis menjadi Agency
Entitlement. **Status:** LOCKED / CORE CANONICAL

### BR-110 --- Expiry Transfer Failure

**Normative rule:** Transfer setelah expiry mendapat 1 retry.
**Status:** LOCKED / CORE CANONICAL

### BR-111 --- Transfer Exception

**Normative rule:** Retry gagal menghasilkan TRANSFER_EXCEPTION.
**Status:** LOCKED / CORE CANONICAL

### BR-112 --- Exception Lifecycle

**Normative rule:** Exception dicatat selama lifecycle yang relevan.
**Status:** LOCKED / CORE CANONICAL

### BR-113 --- Exception After Agency Closed

**Normative rule:** Saat CLOSED, TRANSFER_EXCEPTION otomatis dihapus.
**Status:** LOCKED / CORE CANONICAL

### BR-114 --- Origin Is Immutable Historical Context

**Normative rule:** Origin dipertahankan sebagai historical information.
**Status:** LOCKED / CORE CANONICAL

### BR-115 --- Current Context Is Mutable

**Normative rule:** Current context dapat berubah AGENCY → PERSONAL.
**Status:** LOCKED / CORE CANONICAL

### BR-116 --- Ownership and Context Are Separate

**Normative rule:** Ownership agent dan current context adalah konsep
berbeda. **Status:** LOCKED / CORE CANONICAL

### BR-117 --- Transfer Does Not Create New Listing

**Normative rule:** Transfer tidak membuat listing baru. **Status:**
LOCKED / CORE CANONICAL

### BR-118 --- Agency State Model

**Normative rule:** Lifecycle canonical ACTIVE → CLOSING → CLOSED.
**Status:** LOCKED / CORE CANONICAL

### BR-119 --- ACTIVE

**Normative rule:** ACTIVE adalah state operasional normal. **Status:**
LOCKED / CORE CANONICAL

### BR-120 --- CLOSING

**Normative rule:** CLOSING berarti closure dikonfirmasi dan OTP
berhasil; irreversible. **Status:** LOCKED / CORE CANONICAL

### BR-121 --- CLOSED

**Normative rule:** CLOSED berarti Agency selesai ditutup dan tidak
dapat digunakan kembali. **Status:** LOCKED / CORE CANONICAL

### BR-122 --- State Is Server Authoritative

**Normative rule:** Server state adalah authoritative. **Status:**
LOCKED / CORE CANONICAL

### BR-123 --- Session Recovery

**Normative rule:** Session terputus setelah OTP sukses tetap
melanjutkan dari state server CLOSING. **Status:** LOCKED / CORE
CANONICAL

### BR-124 --- Ownership Survives Membership Termination

**Normative rule:** Membership termination tidak menghapus personal
ownership. **Status:** LOCKED / CORE CANONICAL

### BR-125 --- Allocation Determines Add-on Ownership

**Normative rule:** Allocation menentukan ownership Permanent Add-on.
**Status:** LOCKED / CORE CANONICAL

### BR-126 --- Consumption Does Not Determine Ownership

**Normative rule:** Consumption tidak menentukan ownership remaining
allocation. **Status:** LOCKED / CORE CANONICAL

### BR-127 --- Unallocated Agency Add-on

**Normative rule:** Unallocated add-on saat closure menjadi milik Owner.
**Status:** LOCKED / CORE CANONICAL

### BR-128 --- Allocated Agent Add-on

**Normative rule:** Allocated add-on saat closure tetap milik agent
penerima. **Status:** LOCKED / CORE CANONICAL

### BR-129 --- Agency Historical Identity

**Normative rule:** Agency CLOSED tetap memiliki historical identity.
**Status:** LOCKED / CORE CANONICAL

### BR-130 --- Agency Operational Identity Ends

**Normative rule:** Agency CLOSED tidak memiliki operational
functionality. **Status:** LOCKED / CORE CANONICAL

### BR-131 --- Historical Does Not Mean Active

**Normative rule:** Historical availability tidak berarti Agency aktif.
**Status:** LOCKED / CORE CANONICAL

### BR-132 --- Historical URL Is Non-Operational

**Normative rule:** URL CLOSED hanya historical page. **Status:** LOCKED
/ CORE CANONICAL

### BR-133 --- Closure Is Idempotent

**Normative rule:** Closure processing tidak menghasilkan transfer
ownership ganda. **Status:** LOCKED / CORE CANONICAL

### BR-134 --- Transfer Is Idempotent

**Normative rule:** Listing yang sudah Personal Draft tidak ditransfer
ulang menjadi duplicate. **Status:** LOCKED / CORE CANONICAL

### BR-135 --- Add-on Ownership Is Idempotent

**Normative rule:** Permanent Add-on transfer tidak menghasilkan double
allocation. **Status:** LOCKED / CORE CANONICAL

### BR-136 --- Membership Termination Is Idempotent

**Normative rule:** Terminated member tidak diproses kembali sebagai
active member. **Status:** LOCKED / CORE CANONICAL

### BR-137 --- Closure State Cannot Regress

**Normative rule:** State tidak boleh regress dari CLOSING/CLOSED.
**Status:** LOCKED / CORE CANONICAL

### BR-138 --- OTP Required for Final Closure

**Normative rule:** Tidak ada jalur API/UI yang memasukkan Agency ke
CLOSING tanpa OTP success. **Status:** LOCKED / CORE CANONICAL

### BR-139 --- OTP Attempt Reset

**Normative rule:** 3 verification failures me-reset closure flow.
**Status:** LOCKED / CORE CANONICAL

### BR-140 --- OTP Request Limit

**Normative rule:** Maksimal 3 OTP request per closure flow. **Status:**
LOCKED / CORE CANONICAL

### BR-141 --- OTP Does Not Change Agency State

**Normative rule:** Request/failed verification tidak mengubah Agency
state. **Status:** LOCKED / CORE CANONICAL

### BR-142 --- Successful OTP Changes State

**Normative rule:** OTP success menghasilkan ACTIVE → CLOSING.
**Status:** LOCKED / CORE CANONICAL

### BR-143 --- Closure Is Owner-Level Action

**Normative rule:** Closure adalah action level Agency, bukan Member
Leave. **Status:** LOCKED / CORE CANONICAL

### BR-144 --- Closure Affects All Agency Listings

**Normative rule:** Semua Agency Listing terkena closure transfer tanpa
exception promo. **Status:** LOCKED / CORE CANONICAL

### BR-145 --- Closure Does Not Affect Personal Listings

**Normative rule:** Personal Listing tetap personal. **Status:** LOCKED
/ CORE CANONICAL

### BR-146 --- Closure Does Not Reclaim Personal Entitlements

**Normative rule:** Personal Entitlement tidak kembali ke Agency/Lead.
**Status:** LOCKED / CORE CANONICAL

### BR-147 --- Closure Resolves Agency-Owned Unallocated Add-on

**Normative rule:** Unallocated add-on menjadi Personal Entitlement
Owner. **Status:** LOCKED / CORE CANONICAL

### BR-148 --- Closure Resolves Allocated Add-on

**Normative rule:** Allocated add-on menjadi/ tetap Personal Entitlement
agent penerima. **Status:** LOCKED / CORE CANONICAL

### BR-149 --- Closure Ends Agency Membership

**Normative rule:** Semua Member kehilangan status Member sebelum
CLOSED. **Status:** LOCKED / CORE CANONICAL

### BR-150 --- Closure Ends Lead Title

**Normative rule:** CLOSED mengakhiri title Lead. **Status:** LOCKED /
CORE CANONICAL

### BR-151 --- Agency Closed Final State

**Normative rule:** CLOSED berarti seluruh closure outcome diselesaikan:
membership terminated, listings processed, promo forfeited, add-on
ownership resolved, invitations cancelled, historical data retained
sesuai rules, dan exceptions dihapus. **Status:** LOCKED / CORE
CANONICAL

## 5. M01--M15 Consolidated Semantic Rule Extensions / Amendments

The following 73 units are authoritative semantic deltas. They are not
converted into BR-152+ identifiers. Each is linked to its module
authority, Core target, affected semantic component, STEP04
classification, STEP05 resolution where applicable, and STEP06 merge
action.

### M01-CI-007 --- Conditional KTP eligibility

-   **Module authority:** M01
-   **STEP04 classification:** AUGMENT
-   **Core target artifact:** CAM11-0066
-   **Affected semantic component:** RULE_CONDITION
-   **Consolidated semantic delta:** Conditional KTP eligibility
-   **Exact reconcile scope:** N/A --- additive/new delta
-   **Merge action:** AUGMENT
-   **Preservation rule:** unrelated and unaffected Core detail remains
    retained; this unit does not authorize whole-rule or whole-artifact
    replacement.

### M01-CI-009 --- Pending Review boundary

-   **Module authority:** M01
-   **STEP04 classification:** RECONCILE
-   **STEP05 resolution:** APPLIED
-   **Core target artifact:** CAM11-0039
-   **Affected semantic component:** LIFECYCLE
-   **Consolidated semantic delta:** PENDING_REVIEW is not an
    account-activation gate; OTP VERIFIED → ACCOUNT ACTIVE; KTP
    optional; ISI NANTI → KTP DEFERRED/NOT_PROVIDED while account
    remains ACTIVE.
-   **Exact reconcile scope:** Only M01 Agent account activation /
    KTP-at-activation path. Do not globally delete PENDING_REVIEW;
    preserve other legitimate lifecycle uses.
-   **Merge action:** RECONCILED_UPDATE
-   **Preservation rule:** unrelated and unaffected Core detail remains
    retained; this unit does not authorize whole-rule or whole-artifact
    replacement.

### M02-CI-008 --- Review Auto-Approve / post-publication moderation

-   **Module authority:** M02
-   **STEP04 classification:** RECONCILE
-   **STEP05 resolution:** APPLIED
-   **Core target artifact:** CAM11-0066
-   **Affected semantic component:**
    LIFECYCLE;ACTOR_AUTHORITY;DISCOVERY_SEO
-   **Consolidated semantic delta:** Buyer Submit → AUTO-APPROVED →
    Published/Viewable; Agent Self-Review → AUTO-APPROVED →
    Published/Viewable; Admin moderation is post-publication, not
    approval gate.
-   **Exact reconcile scope:** Only M02 Agent Review
    publication/moderation semantics. Does not make every review-like
    resource globally auto-approved.
-   **Merge action:** RECONCILED_UPDATE
-   **Preservation rule:** unrelated and unaffected Core detail remains
    retained; this unit does not authorize whole-rule or whole-artifact
    replacement.

### M02-CI-009 --- Outcome Presentation --- non-owning

-   **Module authority:** M02
-   **STEP04 classification:** ADD-NEW
-   **Core target artifact:** CAM11-0011
-   **Affected semantic component:** ACTOR_AUTHORITY;OWNERSHIP_SCOPE
-   **Consolidated semantic delta:** Outcome Presentation --- non-owning
-   **Exact reconcile scope:** N/A --- additive/new delta
-   **Merge action:** ADD-NEW
-   **Preservation rule:** unrelated and unaffected Core detail remains
    retained; this unit does not authorize whole-rule or whole-artifact
    replacement.

### M02-CI-011 --- KTP deferred semantics

-   **Module authority:** M02
-   **STEP04 classification:** RECONCILE
-   **STEP05 resolution:** APPLIED
-   **Core target artifact:** CAM11-0034
-   **Affected semantic component:** LIFECYCLE
-   **Consolidated semantic delta:** KTP may be deferred; OTP VERIFIED →
    ACCOUNT ACTIVE; ISI NANTI → KTP DEFERRED/NOT_PROVIDED; no
    PENDING_REVIEW activation gate.
-   **Exact reconcile scope:** Exact STEP03/STEP04 target anchors
    CAM11-0034 and CAM11-0036; only registration/KTP activation
    semantics. Preserve all unrelated Pending Review states.
-   **Merge action:** RECONCILED_UPDATE
-   **Preservation rule:** unrelated and unaffected Core detail remains
    retained; this unit does not authorize whole-rule or whole-artifact
    replacement.

### M03-CI-001 --- Publication / no Pending Review

-   **Module authority:** M03
-   **STEP04 classification:** RECONCILE
-   **STEP05 resolution:** APPLIED
-   **Core target artifact:** CAM11-0040
-   **Affected semantic component:**
    LIFECYCLE;ACTOR_AUTHORITY;DISCOVERY_SEO
-   **Consolidated semantic delta:** Normal Listing publication = DRAFT
    → PUBLISH → PUBLISHED. No Admin approval gate. SUSPENDED is
    enforcement, not publication approval.
-   **Exact reconcile scope:** Only normal M03 Listing publication. Do
    not globally remove PENDING_REVIEW where another domain legitimately
    uses it.
-   **Merge action:** RECONCILED_UPDATE
-   **Preservation rule:** unrelated and unaffected Core detail remains
    retained; this unit does not authorize whole-rule or whole-artifact
    replacement.

### M03-CI-006 --- Refresh daily quota default 5

-   **Module authority:** M03
-   **STEP04 classification:** ADD-NEW
-   **Core target artifact:** CAM11-0067
-   **Affected semantic component:**
    RULE_CONDITION;API_CONTRACT;COMMERCIAL
-   **Consolidated semantic delta:** Refresh daily quota default 5
-   **Exact reconcile scope:** N/A --- additive/new delta
-   **Merge action:** ADD-NEW
-   **Preservation rule:** unrelated and unaffected Core detail remains
    retained; this unit does not authorize whole-rule or whole-artifact
    replacement.

### M03-CI-009 --- Refresh Asia/Jakarta reset

-   **Module authority:** M03
-   **STEP04 classification:** ADD-NEW
-   **Core target artifact:** CAM11-0011
-   **Affected semantic component:** API_CONTRACT
-   **Consolidated semantic delta:** Refresh Asia/Jakarta reset
-   **Exact reconcile scope:** N/A --- additive/new delta
-   **Merge action:** ADD-NEW
-   **Preservation rule:** unrelated and unaffected Core detail remains
    retained; this unit does not authorize whole-rule or whole-artifact
    replacement.

### M03-CI-010 --- One successful Refresh per Listing/day

-   **Module authority:** M03
-   **STEP04 classification:** ADD-NEW
-   **Core target artifact:** CAM11-0011
-   **Affected semantic component:** RULE_CONDITION;API_CONTRACT
-   **Consolidated semantic delta:** One successful Refresh per
    Listing/day
-   **Exact reconcile scope:** N/A --- additive/new delta
-   **Merge action:** ADD-NEW
-   **Preservation rule:** unrelated and unaffected Core detail remains
    retained; this unit does not authorize whole-rule or whole-artifact
    replacement.

### M03-CI-011 --- District-local Refresh repositioning

-   **Module authority:** M03
-   **STEP04 classification:** ADD-NEW
-   **Core target artifact:** CAM11-0011
-   **Affected semantic component:** API_CONTRACT
-   **Consolidated semantic delta:** District-local Refresh
    repositioning
-   **Exact reconcile scope:** N/A --- additive/new delta
-   **Merge action:** ADD-NEW
-   **Preservation rule:** unrelated and unaffected Core detail remains
    retained; this unit does not authorize whole-rule or whole-artifact
    replacement.

### M03-CI-012 --- Refresh tie-break first recorded

-   **Module authority:** M03
-   **STEP04 classification:** ADD-NEW
-   **Core target artifact:** CAM11-0011
-   **Affected semantic component:** API_CONTRACT
-   **Consolidated semantic delta:** Refresh tie-break first recorded
-   **Exact reconcile scope:** N/A --- additive/new delta
-   **Merge action:** ADD-NEW
-   **Preservation rule:** unrelated and unaffected Core detail remains
    retained; this unit does not authorize whole-rule or whole-artifact
    replacement.

### M03-CI-014 --- Media derivative thumbnails

-   **Module authority:** M03
-   **STEP04 classification:** ADD-NEW
-   **Core target artifact:** CAM11-0067
-   **Affected semantic component:** FIELD_ENTITY
-   **Consolidated semantic delta:** Media derivative thumbnails
-   **Exact reconcile scope:** N/A --- additive/new delta
-   **Merge action:** ADD-NEW
-   **Preservation rule:** unrelated and unaffected Core detail remains
    retained; this unit does not authorize whole-rule or whole-artifact
    replacement.

### M03-CI-015 --- Media no stretching

-   **Module authority:** M03
-   **STEP04 classification:** ADD-NEW
-   **Core target artifact:** CAM11-0011
-   **Affected semantic component:** FIELD_ENTITY
-   **Consolidated semantic delta:** Media no stretching
-   **Exact reconcile scope:** N/A --- additive/new delta
-   **Merge action:** ADD-NEW
-   **Preservation rule:** unrelated and unaffected Core detail remains
    retained; this unit does not authorize whole-rule or whole-artifact
    replacement.

### M03-CI-016 --- Listing geographic binding

-   **Module authority:** M03
-   **STEP04 classification:** ADD-NEW
-   **Core target artifact:** CAM11-0011
-   **Affected semantic component:** SEMANTIC_GENERAL
-   **Consolidated semantic delta:** Listing geographic binding
-   **Exact reconcile scope:** N/A --- additive/new delta
-   **Merge action:** ADD-NEW
-   **Preservation rule:** unrelated and unaffected Core detail remains
    retained; this unit does not authorize whole-rule or whole-artifact
    replacement.

### M03-CI-018 --- API Refresh

-   **Module authority:** M03
-   **STEP04 classification:** ADD-NEW
-   **Core target artifact:** CAM11-0032
-   **Affected semantic component:** API_CONTRACT
-   **Consolidated semantic delta:** API Refresh
-   **Exact reconcile scope:** N/A --- additive/new delta
-   **Merge action:** ADD-NEW
-   **Preservation rule:** unrelated and unaffected Core detail remains
    retained; this unit does not authorize whole-rule or whole-artifact
    replacement.

### M04-CI-010 --- Session permission family

-   **Module authority:** M04
-   **STEP04 classification:** ADD-NEW
-   **Core target artifact:** CAM11-0011
-   **Affected semantic component:** RBAC_RLS
-   **Consolidated semantic delta:** Session permission family
-   **Exact reconcile scope:** N/A --- additive/new delta
-   **Merge action:** ADD-NEW
-   **Preservation rule:** unrelated and unaffected Core detail remains
    retained; this unit does not authorize whole-rule or whole-artifact
    replacement.

### M06-CI-001 --- Project semantic schema expansion

-   **Module authority:** M06
-   **STEP04 classification:** AUGMENT
-   **Core target artifact:** CAM11-0018
-   **Affected semantic component:** PHYSICAL_RUNTIME
-   **Consolidated semantic delta:** Project semantic schema expansion
-   **Exact reconcile scope:** N/A --- additive/new delta
-   **Merge action:** AUGMENT
-   **Preservation rule:** unrelated and unaffected Core detail remains
    retained; this unit does not authorize whole-rule or whole-artifact
    replacement.

### M06-CI-006 --- Developer company_logo + Tentang Developer

-   **Module authority:** M06
-   **STEP04 classification:** ADD-NEW
-   **Core target artifact:** CAM11-0011
-   **Affected semantic component:** FIELD_ENTITY
-   **Consolidated semantic delta:** Developer company_logo + Tentang
    Developer
-   **Exact reconcile scope:** N/A --- additive/new delta
-   **Merge action:** ADD-NEW
-   **Preservation rule:** unrelated and unaffected Core detail remains
    retained; this unit does not authorize whole-rule or whole-artifact
    replacement.

### M06-CI-007 --- Project Media boundary

-   **Module authority:** M06
-   **STEP04 classification:** RECONCILE
-   **STEP05 resolution:** APPLIED
-   **Core target artifact:** CAM11-0011
-   **Affected semantic component:** FIELD_ENTITY
-   **Consolidated semantic delta:** M06 semantic Project Media boundary
    = photo, video only. brochure and price_list are Marketing Kit
    semantics, not Project Media semantics.
-   **Exact reconcile scope:** Semantic meaning of M06 Project Media
    only; no destructive physical schema edit in STEP05.
-   **Merge action:** RECONCILED_UPDATE
-   **Preservation rule:** unrelated and unaffected Core detail remains
    retained; this unit does not authorize whole-rule or whole-artifact
    replacement.

### M06-CI-008 --- Marketing Kit resource

-   **Module authority:** M06
-   **STEP04 classification:** ADD-NEW
-   **Core target artifact:** CAM11-0016
-   **Affected semantic component:** FIELD_ENTITY
-   **Consolidated semantic delta:** Marketing Kit resource
-   **Exact reconcile scope:** N/A --- additive/new delta
-   **Merge action:** ADD-NEW
-   **Preservation rule:** unrelated and unaffected Core detail remains
    retained; this unit does not authorize whole-rule or whole-artifact
    replacement.

### M06-CI-009 --- Marketing Kit CRUD authorization

-   **Module authority:** M06
-   **STEP04 classification:** AUGMENT
-   **Core target artifact:** CAM11-0033
-   **Affected semantic component:** SEMANTIC_GENERAL
-   **Consolidated semantic delta:** Marketing Kit CRUD authorization
-   **Exact reconcile scope:** N/A --- additive/new delta
-   **Merge action:** AUGMENT
-   **Preservation rule:** unrelated and unaffected Core detail remains
    retained; this unit does not authorize whole-rule or whole-artifact
    replacement.

### M06-CI-010 --- Claim lifecycle state representation

-   **Module authority:** M06
-   **STEP04 classification:** AUGMENT
-   **Core target artifact:** CAM11-0067
-   **Affected semantic component:** LIFECYCLE;FIELD_ENTITY
-   **Consolidated semantic delta:** Claim lifecycle state
    representation
-   **Exact reconcile scope:** N/A --- additive/new delta
-   **Merge action:** AUGMENT
-   **Preservation rule:** unrelated and unaffected Core detail remains
    retained; this unit does not authorize whole-rule or whole-artifact
    replacement.

### M06-CI-011 --- Claim approval authority

-   **Module authority:** M06
-   **STEP04 classification:** AUGMENT
-   **Core target artifact:** CAM11-0033
-   **Affected semantic component:** ACTOR_AUTHORITY;FIELD_ENTITY
-   **Consolidated semantic delta:** Claim approval authority
-   **Exact reconcile scope:** N/A --- additive/new delta
-   **Merge action:** AUGMENT
-   **Preservation rule:** unrelated and unaffected Core detail remains
    retained; this unit does not authorize whole-rule or whole-artifact
    replacement.

### M06-CI-012 --- Approval Claim artifact

-   **Module authority:** M06
-   **STEP04 classification:** ADD-NEW
-   **Core target artifact:** CAM11-0018
-   **Affected semantic component:** FIELD_ENTITY
-   **Consolidated semantic delta:** Approval Claim artifact
-   **Exact reconcile scope:** N/A --- additive/new delta
-   **Merge action:** ADD-NEW
-   **Preservation rule:** unrelated and unaffected Core detail remains
    retained; this unit does not authorize whole-rule or whole-artifact
    replacement.

### M06-CI-014 --- Approved Claim → Agent-owned Listing initialization

-   **Module authority:** M06
-   **STEP04 classification:** AUGMENT
-   **Core target artifact:** CAM11-0067
-   **Affected semantic component:**
    LIFECYCLE;OWNERSHIP_SCOPE;FIELD_ENTITY
-   **Consolidated semantic delta:** Approved Claim → Agent-owned
    Listing initialization
-   **Exact reconcile scope:** N/A --- additive/new delta
-   **Merge action:** AUGMENT
-   **Preservation rule:** unrelated and unaffected Core detail remains
    retained; this unit does not authorize whole-rule or whole-artifact
    replacement.

### M10-CORE-02 --- Core Permission

-   **Module authority:** M10
-   **STEP04 classification:** AUGMENT
-   **Core target artifact:** CAM11-0016
-   **Affected semantic component:** RBAC_RLS
-   **Consolidated semantic delta:** Core Permission
-   **Exact reconcile scope:** N/A --- additive/new delta
-   **Merge action:** AUGMENT
-   **Preservation rule:** unrelated and unaffected Core detail remains
    retained; this unit does not authorize whole-rule or whole-artifact
    replacement.

### M10-CORE-03 --- Core Scope

-   **Module authority:** M10
-   **STEP04 classification:** AUGMENT
-   **Core target artifact:** CAM11-0016
-   **Affected semantic component:** OWNERSHIP_SCOPE
-   **Consolidated semantic delta:** Core Scope
-   **Exact reconcile scope:** N/A --- additive/new delta
-   **Merge action:** AUGMENT
-   **Preservation rule:** unrelated and unaffected Core detail remains
    retained; this unit does not authorize whole-rule or whole-artifact
    replacement.

### M10-CORE-04 --- Core RLS

-   **Module authority:** M10
-   **STEP04 classification:** AUGMENT
-   **Core target artifact:** CAM11-0016
-   **Affected semantic component:** RBAC_RLS
-   **Consolidated semantic delta:** Core RLS
-   **Exact reconcile scope:** N/A --- additive/new delta
-   **Merge action:** AUGMENT
-   **Preservation rule:** unrelated and unaffected Core detail remains
    retained; this unit does not authorize whole-rule or whole-artifact
    replacement.

### M10-CORE-05 --- Core UI/UX

-   **Module authority:** M10
-   **STEP04 classification:** AUGMENT
-   **Core target artifact:** CAM11-0016
-   **Affected semantic component:** SEMANTIC_GENERAL
-   **Consolidated semantic delta:** Core UI/UX
-   **Exact reconcile scope:** N/A --- additive/new delta
-   **Merge action:** AUGMENT
-   **Preservation rule:** unrelated and unaffected Core detail remains
    retained; this unit does not authorize whole-rule or whole-artifact
    replacement.

### M10-CORE-06 --- Core API

-   **Module authority:** M10
-   **STEP04 classification:** AUGMENT
-   **Core target artifact:** CAM11-0016
-   **Affected semantic component:** API_CONTRACT
-   **Consolidated semantic delta:** Core API
-   **Exact reconcile scope:** N/A --- additive/new delta
-   **Merge action:** AUGMENT
-   **Preservation rule:** unrelated and unaffected Core detail remains
    retained; this unit does not authorize whole-rule or whole-artifact
    replacement.

### M10-CORE-07 --- Core ERD / DB

-   **Module authority:** M10
-   **STEP04 classification:** AUGMENT
-   **Core target artifact:** CAM11-0016
-   **Affected semantic component:** SEMANTIC_GENERAL
-   **Consolidated semantic delta:** Core ERD / DB
-   **Exact reconcile scope:** N/A --- additive/new delta
-   **Merge action:** AUGMENT
-   **Preservation rule:** unrelated and unaffected Core detail remains
    retained; this unit does not authorize whole-rule or whole-artifact
    replacement.

### M10-CORE-12 --- Core cross-module authorization

-   **Module authority:** M10
-   **STEP04 classification:** AUGMENT
-   **Core target artifact:** CAM11-0016
-   **Affected semantic component:** SEMANTIC_GENERAL
-   **Consolidated semantic delta:** Core cross-module authorization
-   **Exact reconcile scope:** N/A --- additive/new delta
-   **Merge action:** AUGMENT
-   **Preservation rule:** unrelated and unaffected Core detail remains
    retained; this unit does not authorize whole-rule or whole-artifact
    replacement.

### M05-CI-002 --- Event quota = maximum Registered participants; not commercial entitlement or Session capacity

-   **Module authority:** M05
-   **STEP04 classification:** AUGMENT
-   **Core target artifact:** CAM11-0014
-   **Affected semantic component:** RULE_CONDITION;COMMERCIAL
-   **Consolidated semantic delta:** Event quota = maximum Registered
    participants; not commercial entitlement or Session capacity
-   **Exact reconcile scope:** N/A --- additive/new delta
-   **Merge action:** AUGMENT
-   **Preservation rule:** unrelated and unaffected Core detail remains
    retained; this unit does not authorize whole-rule or whole-artifact
    replacement.

### M05-CI-003 --- Waitinglist has no queue number/rank; participants are equal

-   **Module authority:** M05
-   **STEP04 classification:** ADD-NEW
-   **Core target artifact:** CAM11-0014
-   **Affected semantic component:** SEMANTIC_GENERAL
-   **Consolidated semantic delta:** Waitinglist has no queue
    number/rank; participants are equal
-   **Exact reconcile scope:** N/A --- additive/new delta
-   **Merge action:** ADD-NEW
-   **Preservation rule:** unrelated and unaffected Core detail remains
    retained; this unit does not authorize whole-rule or whole-artifact
    replacement.

### M05-CI-004 --- First successful registration captures an available slot

-   **Module authority:** M05
-   **STEP04 classification:** ADD-NEW
-   **Core target artifact:** CAM11-0014
-   **Affected semantic component:** SEMANTIC_GENERAL
-   **Consolidated semantic delta:** First successful registration
    captures an available slot
-   **Exact reconcile scope:** N/A --- additive/new delta
-   **Merge action:** ADD-NEW
-   **Preservation rule:** unrelated and unaffected Core detail remains
    retained; this unit does not authorize whole-rule or whole-artifact
    replacement.

### M05-CI-005 --- Registration window closes at start_at + 1 hour

-   **Module authority:** M05
-   **STEP04 classification:** ADD-NEW
-   **Core target artifact:** CAM11-0014
-   **Affected semantic component:** RULE_CONDITION
-   **Consolidated semantic delta:** Registration window closes at
    start_at + 1 hour
-   **Exact reconcile scope:** N/A --- additive/new delta
-   **Merge action:** ADD-NEW
-   **Preservation rule:** unrelated and unaffected Core detail remains
    retained; this unit does not authorize whole-rule or whole-artifact
    replacement.

### M05-CI-006 --- Pre-start cancellation returns one quota slot

-   **Module authority:** M05
-   **STEP04 classification:** ADD-NEW
-   **Core target artifact:** CAM11-0014
-   **Affected semantic component:** LIFECYCLE;RULE_CONDITION;COMMERCIAL
-   **Consolidated semantic delta:** Pre-start cancellation returns one
    quota slot
-   **Exact reconcile scope:** N/A --- additive/new delta
-   **Merge action:** ADD-NEW
-   **Preservation rule:** unrelated and unaffected Core detail remains
    retained; this unit does not authorize whole-rule or whole-artifact
    replacement.

### M05-CI-007 --- Attendance optional; no-show does not auto-cancel registration

-   **Module authority:** M05
-   **STEP04 classification:** ADD-NEW
-   **Core target artifact:** CAM11-0014
-   **Affected semantic component:** LIFECYCLE
-   **Consolidated semantic delta:** Attendance optional; no-show does
    not auto-cancel registration
-   **Exact reconcile scope:** N/A --- additive/new delta
-   **Merge action:** ADD-NEW
-   **Preservation rule:** unrelated and unaffected Core detail remains
    retained; this unit does not authorize whole-rule or whole-artifact
    replacement.

### M05-CI-008 --- Event cancellation is distinct from participant registration cancellation

-   **Module authority:** M05
-   **STEP04 classification:** AUGMENT
-   **Core target artifact:** CAM11-0014
-   **Affected semantic component:** LIFECYCLE
-   **Consolidated semantic delta:** Event cancellation is distinct from
    participant registration cancellation
-   **Exact reconcile scope:** N/A --- additive/new delta
-   **Merge action:** AUGMENT
-   **Preservation rule:** unrelated and unaffected Core detail remains
    retained; this unit does not authorize whole-rule or whole-artifact
    replacement.

### M05-CI-009 --- Event-start notification targets registered and waitinglist participants; M08 remains delivery/projection layer

-   **Module authority:** M05
-   **STEP04 classification:** ADD-NEW
-   **Core target artifact:** CAM11-0014
-   **Affected semantic component:** SEMANTIC_GENERAL
-   **Consolidated semantic delta:** Event-start notification targets
    registered and waitinglist participants; M08 remains
    delivery/projection layer
-   **Exact reconcile scope:** N/A --- additive/new delta
-   **Merge action:** ADD-NEW
-   **Preservation rule:** unrelated and unaffected Core detail remains
    retained; this unit does not authorize whole-rule or whole-artifact
    replacement.

### M11-CI-006 --- M09 Static Public Content → M11 discovery

-   **Module authority:** M11
-   **STEP04 classification:** AUGMENT
-   **Core target artifact:** CAM11-0014
-   **Affected semantic component:** DISCOVERY_SEO
-   **Consolidated semantic delta:** M09 Static Public Content → M11
    discovery
-   **Exact reconcile scope:** N/A --- additive/new delta
-   **Merge action:** AUGMENT
-   **Preservation rule:** unrelated and unaffected Core detail remains
    retained; this unit does not authorize whole-rule or whole-artifact
    replacement.

### M11-CI-007 --- M09 Announcement/Promotion → M11 discovery/measurement

-   **Module authority:** M11
-   **STEP04 classification:** AUGMENT
-   **Core target artifact:** CAM11-0014
-   **Affected semantic component:** COMMERCIAL;DISCOVERY_SEO
-   **Consolidated semantic delta:** M09 Announcement/Promotion → M11
    discovery/measurement
-   **Exact reconcile scope:** N/A --- additive/new delta
-   **Merge action:** AUGMENT
-   **Preservation rule:** unrelated and unaffected Core detail remains
    retained; this unit does not authorize whole-rule or whole-artifact
    replacement.

### M12-CI-004 --- ORG-ADMIN action/permission boundary

-   **Module authority:** M12
-   **STEP04 classification:** AUGMENT
-   **Core target artifact:** CAM11-0014
-   **Affected semantic component:** ACTOR_AUTHORITY;RBAC_RLS
-   **Consolidated semantic delta:** ORG-ADMIN action/permission
    boundary
-   **Exact reconcile scope:** N/A --- additive/new delta
-   **Merge action:** AUGMENT
-   **Preservation rule:** unrelated and unaffected Core detail remains
    retained; this unit does not authorize whole-rule or whole-artifact
    replacement.

### M13-CI-001 --- Provider Catalogue mutation authority is Superadmin-only

-   **Module authority:** M13
-   **STEP04 classification:** RECONCILE
-   **STEP05 resolution:** APPLIED
-   **Core target artifact:** CAM11-0014
-   **Affected semantic component:**
    LIFECYCLE;ACTOR_AUTHORITY;API_CONTRACT
-   **Consolidated semantic delta:** Provider Catalogue mutation =
    SUPERADMIN ONLY. Admin/Manager do not mutate catalogue. Agent cannot
    register arbitrary provider endpoint outside approved catalogue.
-   **Exact reconcile scope:** Provider Catalogue mutation/configuration
    authority only. Separate from own BYOK connection CRUD. Physical
    permission/RLS changes remain downstream.
-   **Merge action:** RECONCILED_UPDATE
-   **Preservation rule:** unrelated and unaffected Core detail remains
    retained; this unit does not authorize whole-rule or whole-artifact
    replacement.

### M13-CI-002 --- BYOK ownership is Agent/User OWN

-   **Module authority:** M13
-   **STEP04 classification:** RECONCILE
-   **STEP05 resolution:** APPLIED
-   **Core target artifact:** CAM11-0014
-   **Affected semantic component:**
    ACTOR_AUTHORITY;OWNERSHIP_SCOPE;API_CONTRACT
-   **Consolidated semantic delta:** Agent/User owns own BYOK connection
    and may
    create/view/save/update/configure/rotate/replace/test/enable/disable/disconnect/delete/reconnect
    own connection without Admin/Manager approval; no
    sharing/delegation/transfer.
-   **Exact reconcile scope:** Own BYOK connection lifecycle only. Does
    not grant Provider Catalogue authority, platform RBAC authority, or
    access to another user's credentials.
-   **Merge action:** RECONCILED_UPDATE
-   **Preservation rule:** unrelated and unaffected Core detail remains
    retained; this unit does not authorize whole-rule or whole-artifact
    replacement.

### M14-CI-005 --- Eight approved commercial surfaces

-   **Module authority:** M14
-   **STEP04 classification:** AUGMENT
-   **Core target artifact:** CAM11-0014
-   **Affected semantic component:** LIFECYCLE;COMMERCIAL
-   **Consolidated semantic delta:** Eight approved commercial surfaces
-   **Exact reconcile scope:** N/A --- additive/new delta
-   **Merge action:** AUGMENT
-   **Preservation rule:** unrelated and unaffected Core detail remains
    retained; this unit does not authorize whole-rule or whole-artifact
    replacement.

### M14-CI-006 --- Subscription lifecycle

-   **Module authority:** M14
-   **STEP04 classification:** AUGMENT
-   **Core target artifact:** CAM11-0014
-   **Affected semantic component:** LIFECYCLE;COMMERCIAL
-   **Consolidated semantic delta:** Subscription lifecycle
-   **Exact reconcile scope:** N/A --- additive/new delta
-   **Merge action:** AUGMENT
-   **Preservation rule:** unrelated and unaffected Core detail remains
    retained; this unit does not authorize whole-rule or whole-artifact
    replacement.

### M14-CI-007 --- Add-on lifecycle/validity

-   **Module authority:** M14
-   **STEP04 classification:** AUGMENT
-   **Core target artifact:** CAM11-0014
-   **Affected semantic component:** LIFECYCLE;COMMERCIAL
-   **Consolidated semantic delta:** Add-on lifecycle/validity
-   **Exact reconcile scope:** N/A --- additive/new delta
-   **Merge action:** AUGMENT
-   **Preservation rule:** unrelated and unaffected Core detail remains
    retained; this unit does not authorize whole-rule or whole-artifact
    replacement.

### M14-CI-008 --- Promotion lifecycle

-   **Module authority:** M14
-   **STEP04 classification:** AUGMENT
-   **Core target artifact:** CAM11-0014
-   **Affected semantic component:** LIFECYCLE;COMMERCIAL
-   **Consolidated semantic delta:** Promotion lifecycle
-   **Exact reconcile scope:** N/A --- additive/new delta
-   **Merge action:** AUGMENT
-   **Preservation rule:** unrelated and unaffected Core detail remains
    retained; this unit does not authorize whole-rule or whole-artifact
    replacement.

### M14-CI-009 --- Immutable purchase snapshot

-   **Module authority:** M14
-   **STEP04 classification:** AUGMENT
-   **Core target artifact:** CAM11-0014
-   **Affected semantic component:** SEMANTIC_GENERAL
-   **Consolidated semantic delta:** Immutable purchase snapshot
-   **Exact reconcile scope:** N/A --- additive/new delta
-   **Merge action:** AUGMENT
-   **Preservation rule:** unrelated and unaffected Core detail remains
    retained; this unit does not authorize whole-rule or whole-artifact
    replacement.

### M14-CI-010 --- Order confirmation invariant

-   **Module authority:** M14
-   **STEP04 classification:** AUGMENT
-   **Core target artifact:** CAM11-0014
-   **Affected semantic component:** SEMANTIC_GENERAL
-   **Consolidated semantic delta:** Order confirmation invariant
-   **Exact reconcile scope:** N/A --- additive/new delta
-   **Merge action:** AUGMENT
-   **Preservation rule:** unrelated and unaffected Core detail remains
    retained; this unit does not authorize whole-rule or whole-artifact
    replacement.

### M14-CI-011 --- Trusted payment verification

-   **Module authority:** M14
-   **STEP04 classification:** AUGMENT
-   **Core target artifact:** CAM11-0014
-   **Affected semantic component:** COMMERCIAL
-   **Consolidated semantic delta:** Trusted payment verification
-   **Exact reconcile scope:** N/A --- additive/new delta
-   **Merge action:** AUGMENT
-   **Preservation rule:** unrelated and unaffected Core detail remains
    retained; this unit does not authorize whole-rule or whole-artifact
    replacement.

### M14-CI-012 --- Idempotent fulfillment

-   **Module authority:** M14
-   **STEP04 classification:** AUGMENT
-   **Core target artifact:** CAM11-0014
-   **Affected semantic component:** SEMANTIC_GENERAL
-   **Consolidated semantic delta:** Idempotent fulfillment
-   **Exact reconcile scope:** N/A --- additive/new delta
-   **Merge action:** AUGMENT
-   **Preservation rule:** unrelated and unaffected Core detail remains
    retained; this unit does not authorize whole-rule or whole-artifact
    replacement.

### M14-CI-013 --- Entitlement lifecycle

-   **Module authority:** M14
-   **STEP04 classification:** AUGMENT
-   **Core target artifact:** CAM11-0014
-   **Affected semantic component:** LIFECYCLE;COMMERCIAL
-   **Consolidated semantic delta:** Entitlement lifecycle
-   **Exact reconcile scope:** N/A --- additive/new delta
-   **Merge action:** AUGMENT
-   **Preservation rule:** unrelated and unaffected Core detail remains
    retained; this unit does not authorize whole-rule or whole-artifact
    replacement.

### M14-CI-014 --- Quota Capacity

-   **Module authority:** M14
-   **STEP04 classification:** AUGMENT
-   **Core target artifact:** CAM11-0014
-   **Affected semantic component:** RULE_CONDITION;COMMERCIAL
-   **Consolidated semantic delta:** Quota Capacity
-   **Exact reconcile scope:** N/A --- additive/new delta
-   **Merge action:** AUGMENT
-   **Preservation rule:** unrelated and unaffected Core detail remains
    retained; this unit does not authorize whole-rule or whole-artifact
    replacement.

### M14-CI-015 --- Operational Pool

-   **Module authority:** M14
-   **STEP04 classification:** AUGMENT
-   **Core target artifact:** CAM11-0014
-   **Affected semantic component:** SEMANTIC_GENERAL
-   **Consolidated semantic delta:** Operational Pool
-   **Exact reconcile scope:** N/A --- additive/new delta
-   **Merge action:** AUGMENT
-   **Preservation rule:** unrelated and unaffected Core detail remains
    retained; this unit does not authorize whole-rule or whole-artifact
    replacement.

### M14-CI-016 --- Allocation

-   **Module authority:** M14
-   **STEP04 classification:** AUGMENT
-   **Core target artifact:** CAM11-0014
-   **Affected semantic component:** SEMANTIC_GENERAL
-   **Consolidated semantic delta:** Allocation
-   **Exact reconcile scope:** N/A --- additive/new delta
-   **Merge action:** AUGMENT
-   **Preservation rule:** unrelated and unaffected Core detail remains
    retained; this unit does not authorize whole-rule or whole-artifact
    replacement.

### M14-CI-017 --- Usage

-   **Module authority:** M14
-   **STEP04 classification:** AUGMENT
-   **Core target artifact:** CAM11-0014
-   **Affected semantic component:** SEMANTIC_GENERAL
-   **Consolidated semantic delta:** Usage
-   **Exact reconcile scope:** N/A --- additive/new delta
-   **Merge action:** AUGMENT
-   **Preservation rule:** unrelated and unaffected Core detail remains
    retained; this unit does not authorize whole-rule or whole-artifact
    replacement.

### M14-CI-018 --- Refund / chargeback

-   **Module authority:** M14
-   **STEP04 classification:** AUGMENT
-   **Core target artifact:** CAM11-0014
-   **Affected semantic component:** COMMERCIAL
-   **Consolidated semantic delta:** Refund / chargeback
-   **Exact reconcile scope:** N/A --- additive/new delta
-   **Merge action:** AUGMENT
-   **Preservation rule:** unrelated and unaffected Core detail remains
    retained; this unit does not authorize whole-rule or whole-artifact
    replacement.

### M14-CI-019 --- Reconciliation

-   **Module authority:** M14
-   **STEP04 classification:** AUGMENT
-   **Core target artifact:** CAM11-0014
-   **Affected semantic component:** SEMANTIC_GENERAL
-   **Consolidated semantic delta:** Reconciliation
-   **Exact reconcile scope:** N/A --- additive/new delta
-   **Merge action:** AUGMENT
-   **Preservation rule:** unrelated and unaffected Core detail remains
    retained; this unit does not authorize whole-rule or whole-artifact
    replacement.

### M14-CI-020 --- Refresh Allowance

-   **Module authority:** M14
-   **STEP04 classification:** AUGMENT
-   **Core target artifact:** CAM11-0014
-   **Affected semantic component:** RULE_CONDITION;API_CONTRACT
-   **Consolidated semantic delta:** Refresh Allowance
-   **Exact reconcile scope:** N/A --- additive/new delta
-   **Merge action:** AUGMENT
-   **Preservation rule:** unrelated and unaffected Core detail remains
    retained; this unit does not authorize whole-rule or whole-artifact
    replacement.

### M15-IA-03 --- Qualification/evidence

-   **Module authority:** M15
-   **STEP04 classification:** AUGMENT
-   **Core target artifact:** CAM11-0014
-   **Affected semantic component:** SEMANTIC_GENERAL
-   **Consolidated semantic delta:** Qualification/evidence
-   **Exact reconcile scope:** N/A --- additive/new delta
-   **Merge action:** AUGMENT
-   **Preservation rule:** unrelated and unaffected Core detail remains
    retained; this unit does not authorize whole-rule or whole-artifact
    replacement.

### M15-IA-04 --- Partner Learning

-   **Module authority:** M15
-   **STEP04 classification:** AUGMENT
-   **Core target artifact:** CAM11-0014
-   **Affected semantic component:** SEMANTIC_GENERAL
-   **Consolidated semantic delta:** Partner Learning
-   **Exact reconcile scope:** N/A --- additive/new delta
-   **Merge action:** AUGMENT
-   **Preservation rule:** unrelated and unaffected Core detail remains
    retained; this unit does not authorize whole-rule or whole-artifact
    replacement.

### M15-IA-05 --- Developer Learning

-   **Module authority:** M15
-   **STEP04 classification:** AUGMENT
-   **Core target artifact:** CAM11-0014
-   **Affected semantic component:** SEMANTIC_GENERAL
-   **Consolidated semantic delta:** Developer Learning
-   **Exact reconcile scope:** N/A --- additive/new delta
-   **Merge action:** AUGMENT
-   **Preservation rule:** unrelated and unaffected Core detail remains
    retained; this unit does not authorize whole-rule or whole-artifact
    replacement.

### M15-IA-08 --- Permission

-   **Module authority:** M15
-   **STEP04 classification:** AUGMENT
-   **Core target artifact:** CAM11-0014
-   **Affected semantic component:** RBAC_RLS
-   **Consolidated semantic delta:** Permission
-   **Exact reconcile scope:** N/A --- additive/new delta
-   **Merge action:** AUGMENT
-   **Preservation rule:** unrelated and unaffected Core detail remains
    retained; this unit does not authorize whole-rule or whole-artifact
    replacement.

### M15-IA-10 --- Visibility/Presentation

-   **Module authority:** M15
-   **STEP04 classification:** AUGMENT
-   **Core target artifact:** CAM11-0014
-   **Affected semantic component:** SEMANTIC_GENERAL
-   **Consolidated semantic delta:** Visibility/Presentation
-   **Exact reconcile scope:** N/A --- additive/new delta
-   **Merge action:** AUGMENT
-   **Preservation rule:** unrelated and unaffected Core detail remains
    retained; this unit does not authorize whole-rule or whole-artifact
    replacement.

### M15-IA-11 --- Approval

-   **Module authority:** M15
-   **STEP04 classification:** AUGMENT
-   **Core target artifact:** CAM11-0014
-   **Affected semantic component:** SEMANTIC_GENERAL
-   **Consolidated semantic delta:** Approval
-   **Exact reconcile scope:** N/A --- additive/new delta
-   **Merge action:** AUGMENT
-   **Preservation rule:** unrelated and unaffected Core detail remains
    retained; this unit does not authorize whole-rule or whole-artifact
    replacement.

### M15-IA-12 --- API

-   **Module authority:** M15
-   **STEP04 classification:** AUGMENT
-   **Core target artifact:** CAM11-0014
-   **Affected semantic component:** API_CONTRACT
-   **Consolidated semantic delta:** API
-   **Exact reconcile scope:** N/A --- additive/new delta
-   **Merge action:** AUGMENT
-   **Preservation rule:** unrelated and unaffected Core detail remains
    retained; this unit does not authorize whole-rule or whole-artifact
    replacement.

### M15-IA-15 --- RBAC/RLS

-   **Module authority:** M15
-   **STEP04 classification:** AUGMENT
-   **Core target artifact:** CAM11-0014
-   **Affected semantic component:** RBAC_RLS
-   **Consolidated semantic delta:** RBAC/RLS
-   **Exact reconcile scope:** N/A --- additive/new delta
-   **Merge action:** AUGMENT
-   **Preservation rule:** unrelated and unaffected Core detail remains
    retained; this unit does not authorize whole-rule or whole-artifact
    replacement.

### M15-IA-16 --- Functional

-   **Module authority:** M15
-   **STEP04 classification:** AUGMENT
-   **Core target artifact:** CAM11-0014
-   **Affected semantic component:** SEMANTIC_GENERAL
-   **Consolidated semantic delta:** Functional
-   **Exact reconcile scope:** N/A --- additive/new delta
-   **Merge action:** AUGMENT
-   **Preservation rule:** unrelated and unaffected Core detail remains
    retained; this unit does not authorize whole-rule or whole-artifact
    replacement.

### M15-IA-17 --- Technical

-   **Module authority:** M15
-   **STEP04 classification:** AUGMENT
-   **Core target artifact:** CAM11-0014
-   **Affected semantic component:** SEMANTIC_GENERAL
-   **Consolidated semantic delta:** Technical
-   **Exact reconcile scope:** N/A --- additive/new delta
-   **Merge action:** AUGMENT
-   **Preservation rule:** unrelated and unaffected Core detail remains
    retained; this unit does not authorize whole-rule or whole-artifact
    replacement.

### M15-IA-18 --- UI/UX

-   **Module authority:** M15
-   **STEP04 classification:** AUGMENT
-   **Core target artifact:** CAM11-0014
-   **Affected semantic component:** SEMANTIC_GENERAL
-   **Consolidated semantic delta:** UI/UX
-   **Exact reconcile scope:** N/A --- additive/new delta
-   **Merge action:** AUGMENT
-   **Preservation rule:** unrelated and unaffected Core detail remains
    retained; this unit does not authorize whole-rule or whole-artifact
    replacement.

### M15-IA-19 --- Dependencies

-   **Module authority:** M15
-   **STEP04 classification:** AUGMENT
-   **Core target artifact:** CAM11-0014
-   **Affected semantic component:** SEMANTIC_GENERAL
-   **Consolidated semantic delta:** Dependencies
-   **Exact reconcile scope:** N/A --- additive/new delta
-   **Merge action:** AUGMENT
-   **Preservation rule:** unrelated and unaffected Core detail remains
    retained; this unit does not authorize whole-rule or whole-artifact
    replacement.

## 6. Locked STEP05 Conflict Resolutions

### STEP05-001 --- M01-CI-009

**Locked decision:** PENDING_REVIEW is not an account-activation gate;
OTP VERIFIED → ACCOUNT ACTIVE; KTP optional; ISI NANTI → KTP
DEFERRED/NOT_PROVIDED while account remains ACTIVE. **Approved action:**
Apply M01 locked activation semantics to the account-activation path.
**Exact scope:** Only M01 Agent account activation / KTP-at-activation
path. Do not globally delete PENDING_REVIEW; preserve other legitimate
lifecycle uses. **Preserve:** All unrelated registration,
authentication, KTP privacy/compliance, rejection/audit, and non-M01
lifecycle detail. **Authority:** M01 v1.1 + PRE-00-C v1.1

### STEP05-002 --- M02-CI-008

**Locked decision:** Buyer Submit → AUTO-APPROVED → Published/Viewable;
Agent Self-Review → AUTO-APPROVED → Published/Viewable; Admin moderation
is post-publication, not approval gate. **Approved action:** Apply M02
auto-approval and post-publication moderation semantics to M02 Review
publication. **Exact scope:** Only M02 Agent Review
publication/moderation semantics. Does not make every review-like
resource globally auto-approved. **Preserve:** Review ownership,
viewing, moderation capability, aggregate rating rules, privacy, public
presentation constraints, and unrelated Core review detail.
**Authority:** M02 v1.1 + PRE-00-D v1.1

### STEP05-003 --- M02-CI-011

**Locked decision:** KTP may be deferred; OTP VERIFIED → ACCOUNT ACTIVE;
ISI NANTI → KTP DEFERRED/NOT_PROVIDED; no PENDING_REVIEW activation
gate. **Approved action:** Apply locked M01/M02 deferred-KTP semantics
to the registration activation path and neutralize contradictory Pending
Review activation wording. **Exact scope:** Exact STEP03/STEP04 target
anchors CAM11-0034 and CAM11-0036; only registration/KTP activation
semantics. Preserve all unrelated Pending Review states. **Preserve:**
M01 identity authority, protected KTP data, later KTP completion,
unrelated moderation/review states, and all non-conflicting Core detail.
**Authority:** M01 v1.1 + M02 v1.1 + PRE-00-C/D + STEP03-A v1.0

### STEP05-004 --- M03-CI-001

**Locked decision:** Normal Listing publication = DRAFT → PUBLISH →
PUBLISHED. No Admin approval gate. SUSPENDED is enforcement, not
publication approval. **Approved action:** Apply M03 direct publication
semantics to the normal Listing publish path. **Exact scope:** Only
normal M03 Listing publication. Do not globally remove PENDING_REVIEW
where another domain legitimately uses it. **Preserve:** Listing fields,
ownership, organization/personal context, search/filter/map, media,
price, leads, CTA, history, and unrelated moderation/enforcement detail.
**Authority:** M03 v1.3 + PRE-00-E v1.1

### STEP05-005 --- M06-CI-007

**Locked decision:** M06 semantic Project Media boundary = photo, video
only. brochure and price_list are Marketing Kit semantics, not Project
Media semantics. **Approved action:** Apply M06 semantic boundary;
retain extra physical enum values only as downstream controlled
implementation residue until STEP06/downstream synchronization decides
physical realization. **Exact scope:** Semantic meaning of M06 Project
Media only; no destructive physical schema edit in STEP05. **Preserve:**
developer project entity, existing media fields, URLs, unrelated media
behavior, Marketing Kit as separate capability, and physical schema
evidence as controlled provenance. **Authority:** M06 v1.5 + PRE-00-H
v1.1

### STEP05-006 --- M13-CI-001

**Locked decision:** Provider Catalogue mutation = SUPERADMIN ONLY.
Admin/Manager do not mutate catalogue. Agent cannot register arbitrary
provider endpoint outside approved catalogue. **Approved action:** Apply
M13 Superadmin-only Provider Catalogue mutation authority. **Exact
scope:** Provider Catalogue mutation/configuration authority only.
Separate from own BYOK connection CRUD. Physical permission/RLS changes
remain downstream. **Preserve:** Provider catalogue existence,
provider-neutral adapter boundary, provider availability, provider
credentials security, M10 authorization model, and unrelated
Admin/Manager capabilities. **Authority:** M13 v1.0 + PRE-00-O v1.0 +
M13 QIR

### STEP05-007 --- M13-CI-002

**Locked decision:** Agent/User owns own BYOK connection and may
create/view/save/update/configure/rotate/replace/test/enable/disable/disconnect/delete/reconnect
own connection without Admin/Manager approval; no
sharing/delegation/transfer. **Approved action:** Apply M13 explicit
own-connection ownership and self-management semantics; separate it from
Provider Catalogue mutation. **Exact scope:** Own BYOK connection
lifecycle only. Does not grant Provider Catalogue authority, platform
RBAC authority, or access to another user's credentials. **Preserve:**
Existing /ai-providers and /ai-connections API family, backend proxy,
encrypted credential storage, secret isolation, owner-scoped endpoints,
rate limiting, and M10 authorization boundary. **Authority:** M13 v1.0 +
PRE-00-O v1.0 + Core API/RBAC evidence

## 7. Approved Commercial Business Rules --- MBR-COM-001--013

**Status: CLOSED --- OWNER APPROVED.** The Owner approval supersedes the
previous evidence/provenance-gap status. The closure is a governing
input for downstream synchronization.

The closure record approves MBR-COM-001--013 as a consolidated
Commercial Business Rules baseline. It does not provide independent
historical wording for each identifier; therefore this baseline does not
fabricate per-ID historical wording.

1.  Subscription / Entitlement / RBAC boundary.
2.  Free Bonus Grant integrity.
3.  Add-on validity.
4.  Agency subscription and member allocation.
5.  Quota allocation versus actual usage.
6.  Promotion policy and purchase snapshot.
7.  Subscription transition integrity.
8.  Order / Payment / Fulfillment boundary.
9.  Verified payment and idempotent fulfillment.
10. Commercial reconciliation.
11. Refund / chargeback integrity.
12. Commercial provenance.
13. Commercial configuration governance.
14. Provider Independence.
15. Beta Payment Activation Governance.

The final two areas are accepted as part of the approved Commercial
Business Rules baseline without retroactively renaming them as original
MBR-COM identifiers.

### 7.1 MVP Commercial Scope Boundary

-   listing quota add-on packages
-   Learning Point packages
-   Free membership
-   Pro monthly subscription
-   Pro annual subscription
-   paid listing boost / premium promotion
-   internal RumahAgen Learning classes
-   partner Learning classes

Commercial rules govern the behavior and integrity of those approved
commercial surfaces; they do not silently create additional
monetization.

## 7.2 Explicit MBR-COM-001--013 Canonical Family Membership

The STEP08 v1.2 master contains 13 synchronized commercial records. They
are one approved Commercial Business Rules family, not thirteen
independently reconstructed historical rule wordings. Each identifier is
therefore explicitly retained below with the same approved family-level
content basis.

  -----------------------------------------------------------------------
  Commercial ID           Status                  Canonical treatment
  ----------------------- ----------------------- -----------------------
  MBR-COM-001             CLOSED --- OWNER        Member of the approved
                          APPROVED                consolidated Commercial
                                                  Business Rules family;
                                                  historical per-ID
                                                  wording is not
                                                  re-invented.

  MBR-COM-002             CLOSED --- OWNER        Member of the approved
                          APPROVED                consolidated Commercial
                                                  Business Rules family;
                                                  historical per-ID
                                                  wording is not
                                                  re-invented.

  MBR-COM-003             CLOSED --- OWNER        Member of the approved
                          APPROVED                consolidated Commercial
                                                  Business Rules family;
                                                  historical per-ID
                                                  wording is not
                                                  re-invented.

  MBR-COM-004             CLOSED --- OWNER        Member of the approved
                          APPROVED                consolidated Commercial
                                                  Business Rules family;
                                                  historical per-ID
                                                  wording is not
                                                  re-invented.

  MBR-COM-005             CLOSED --- OWNER        Member of the approved
                          APPROVED                consolidated Commercial
                                                  Business Rules family;
                                                  historical per-ID
                                                  wording is not
                                                  re-invented.

  MBR-COM-006             CLOSED --- OWNER        Member of the approved
                          APPROVED                consolidated Commercial
                                                  Business Rules family;
                                                  historical per-ID
                                                  wording is not
                                                  re-invented.

  MBR-COM-007             CLOSED --- OWNER        Member of the approved
                          APPROVED                consolidated Commercial
                                                  Business Rules family;
                                                  historical per-ID
                                                  wording is not
                                                  re-invented.

  MBR-COM-008             CLOSED --- OWNER        Member of the approved
                          APPROVED                consolidated Commercial
                                                  Business Rules family;
                                                  historical per-ID
                                                  wording is not
                                                  re-invented.

  MBR-COM-009             CLOSED --- OWNER        Member of the approved
                          APPROVED                consolidated Commercial
                                                  Business Rules family;
                                                  historical per-ID
                                                  wording is not
                                                  re-invented.

  MBR-COM-010             CLOSED --- OWNER        Member of the approved
                          APPROVED                consolidated Commercial
                                                  Business Rules family;
                                                  historical per-ID
                                                  wording is not
                                                  re-invented.

  MBR-COM-011             CLOSED --- OWNER        Member of the approved
                          APPROVED                consolidated Commercial
                                                  Business Rules family;
                                                  historical per-ID
                                                  wording is not
                                                  re-invented.

  MBR-COM-012             CLOSED --- OWNER        Member of the approved
                          APPROVED                consolidated Commercial
                                                  Business Rules family;
                                                  historical per-ID
                                                  wording is not
                                                  re-invented.

  MBR-COM-013             CLOSED --- OWNER        Member of the approved
                          APPROVED                consolidated Commercial
                                                  Business Rules family;
                                                  historical per-ID
                                                  wording is not
                                                  re-invented.
  -----------------------------------------------------------------------

The approved family covers the 13 consolidated areas listed above. The
closure source does not establish a deterministic one-to-one mapping
between each MBR-COM identifier and each numbered area, so no such
mapping is fabricated.

## 8. Canonical State Machines

### Agency lifecycle

ACTIVE → CLOSING → CLOSED

### Member exit listing

MEMBER → LEAVE / FORCED_REMOVAL → evaluate listing → (Published + Active
Promo ? wait for expiry : Personal Draft)

### Closure

ACTIVE → warning → OTP → CLOSING → closure processing → CLOSED

### OTP failure

ACTIVE → retry closure flow; three verification failures reset the flow

### CLOSING

Irreversible

### CLOSED

Final; cannot reopen

## 9. Canonical Decision Tables

  -----------------------------------------------------------------------
  Scenario                Condition               Result
  ----------------------- ----------------------- -----------------------
  Member Exit Listing     Published + Promo       Remain Agency Published
                          Active                  until promo expiry,
                                                  then automatic transfer
                                                  evaluation

  Member Exit Listing     Anything else           Immediate Personal
                                                  Draft

  Agency Closure Listing  Published + Active      Personal Draft; promo
                          Promo                   forfeited

  Agency Closure Listing  Published without       Personal Draft
                          active promo            

  Agency Closure Listing  Draft                   Personal Draft

  Agency Closure Listing  Inactive                Personal Draft

  Agency Closure Listing  Personal Listing        No change

  Permanent Add-on        Allocated to Agent A/B  Agent recipient retains
  Closure                                         ownership

  Permanent Add-on        Unallocated             Owner Agency / Owner
  Closure                                         Personal Entitlement
                                                  outcome per BR-127/147

  OTP                     Cancel warning          ACTIVE

  OTP                     Request                 ACTIVE

  OTP                     Failed/expired          ACTIVE; restart flow

  OTP                     3 verification failures Restart closure flow

  OTP                     Success                 ACTIVE → CLOSING
  -----------------------------------------------------------------------

## 10. Non-Negotiable Business Invariants

-   Agency CLOSED cannot be reopened.
-   Agency cannot enter CLOSING without successful OTP.
-   Personal Listing is unaffected by Agency closure.
-   Membership termination does not erase Personal
    Entitlement/ownership.
-   Allocated Permanent Add-on remains with recipient after leave/forced
    removal.
-   Agency Analytics and Personal Analytics remain separate.
-   Deleted Lead History content must not be restored through audit
    content.
-   Listing transfer does not create a duplicate listing.
-   Closure, membership termination, listing transfer and add-on
    ownership transfer are idempotent.
-   Server state is authoritative.

## 11. Authority and Domain Boundaries

-   M01 --- Identity / authentication authority.
-   M02 --- Profile and public visibility semantics.
-   M03 --- Listing and Refresh action/lifecycle truth.
-   M04 --- Learning/evidence truth; completion is not automatically
    award.
-   M05 --- Event/calendar semantics.
-   M06 --- Developer/Project/Marketing Kit/Claim semantics.
-   M07 --- domain-specific authority.
-   M08 --- dashboard/notification projection and delivery layer.
-   M09 --- administrative configuration and audit lifecycle.
-   M10 --- authorization/RBAC authority.
-   M11 --- public discovery/SEO/tracking/measurement layer.
-   M12 --- organization/membership semantics.
-   M13 --- provider catalogue and BYOK semantics within its locked
    boundary.
-   M14 --- commercial/payment/entitlement/quota/promotion truth;
    Q01--Q64 and Q40/Q54/Q61/Q62 remain M14.
-   M15 --- qualification/title/award semantics; M14 commercial
    questions are not M15.

## 12. Implementation and Physical Boundary

-   This baseline does not authorize SQL migration, schema alteration,
    API implementation, RLS policy changes, permission seeding, payment
    activation, webhook activation, or production deployment.
-   W4-01E remains frozen physical design authority.
-   W4-02 remains the sole current executable physical baseline.
-   W4-03 remains the runtime verification boundary.
-   Semantic business rules, physical realization, and runtime
    verification remain separate gates.

## 13A. STEP08 v1.2 Coverage Reconciliation

The consolidated baseline is reconciled against the complete STEP08 v1.2
synchronization master and supporting registers:

-   151 Core canonical BR records: retained.
-   73 M01--M15 actionable semantic delta records: retained.
-   13 MBR-COM closed/approved records: explicitly retained as one
    canonical Commercial family with all 13 identifiers visible.
-   266 STEP07-A STEP08-scoped traceability records: supporting evidence
    retained in the audit package.
-   7 locked STEP05 conflict applications: retained.
-   9 lifecycle rows, 15 actor/ownership/authority rows, 9
    configurable-parameter rows, 10 cross-module dependency rows, 5 Core
    preservation audit rows, 0 orphan rows, and 273 provenance rows
    remain represented in the supporting evidence layer.
-   The baseline does not renumber Core BRs or create BR-152 onward.

## 13. Deep-Scan Coverage and Reconstruction Evidence

-   Core source package: 76 recursive Core artifacts preserved by the
    STEP06 preservation audit.
-   M01--M15 recon top-level package members: 42.
-   STEP07 recorded the recursive M01--M15 source inventory at 2,374
    artifacts.
-   STEP08 synchronized master: 237 records = 151 Core + 73 M01--M15
    delta units + 13 Commercial closure units.
-   STEP04 synchronization findings: 223.
-   STEP05 locked semantic conflicts: 7.
-   STEP06 actionable semantic-delta audit: 73.
-   No Core BR identifier was renumbered or silently removed.
-   No unsupported MBR-COM per-ID historical wording was invented.

## 14.1 Deep-Scan Evidence Posture

The reconstruction deliberately distinguishes **direct source-text
evidence** from **synchronization-register evidence**. The STEP06/STEP08
registers are the controlling evidence for the 73 actionable M01--M15
delta units. During recursive inspection of the M01--M15 recon corpus,
some finding identifiers were not present as literal strings in the raw
module text because the finding/impact identifiers are represented
through impact-analysis, QIR, synchronization, or derived evidence
artifacts. Those units are therefore not presented as if they had direct
literal-ID proof in the rebuild prose. No unsupported semantic text was
invented to fill those gaps.

Accordingly: - **151/151 Core BR definitions** are directly carried
forward from the Core Business Rules artifact. - **73/73 M01--M15 delta
units** are represented from the STEP06/STEP08 authoritative
synchronization/delta registers, with their Core target and affected
semantic component retained. - **7/7 conflicts** use the locked STEP05
decision register as the conflict-resolution authority. - **13/13
MBR-COM units** use the explicit Owner-approved closure record; no
historical per-ID wording is fabricated. - Supporting source mapping and
provenance remain available in the accompanying CSV registers.

## 3A. Core Authority, Lock and Change-Control Preservation

### 3A.1 Purpose and Authority

This artifact consolidates the locked BR-001--BR-151 baseline into the
W4-02A.6 current corpus and establishes explicit downstream
traceability. It is not a replacement business-rule design and does not
invent or renumber business rules. Business Rules Baseline v1.0 remains
the normative business-logic source of truth. BR-001--BR-151 are carried
forward verbatim in substance and identifier. Downstream artifacts must
conform to the locked business logic. Approved MADCR/ADR/closed OD may
govern architecture/technology consequences where the BR baseline does
not itself define implementation mechanics. MAEP/AEP artifacts
translate/evolve architecture and product consequences; they do not
outrank normative BR. Historical/provenance artifacts retain chronology
and prior status but cannot override current locked BR.

### 3A.2 Authority Hierarchy

  -----------------------------------------------------------------------
  Priority                Authority               Treatment
  ----------------------- ----------------------- -----------------------
  1                       Explicit Owner-approved Governing where
                          decisions               applicable

  2                       Master Business Rules   Normative business
                          BR-001--BR-151          logic

  3                       Approved MADCR / ADR /  Decision/architecture
                          closed OD               consequence

  4                       Current Project         Process and governance
                          Constitution /          
                          Governance              

  5                       Current canonical       System semantics
                          architecture            

  6                       Current                 Downstream contract
                          logical/data/API/RBAC   
                          artifacts               

  7                       W4-01E                  Frozen physical design

  8                       W4-02                   Executable physical
                                                  baseline

  9                       Historical documents    Provenance only
  -----------------------------------------------------------------------

### 3A.3 Business-Rule Lock / Change Control

BR-001--BR-151 remain LOCKED at business-logic level. An informal
document edit cannot change a locked BR. A real BR change requires
change request/decision record, impact analysis, affected BR
identification and downstream synchronization. Semantic similarity in
AEP/MADCR does not create a new BR ID. MBR-COM-001--013 remains a
separate Commercial BR family from BR-001--BR-151; it is CLOSED ---
OWNER APPROVED and must be propagated as normative commercial downstream
input. Exact payment-provider verification/idempotency/reconciliation
behavior is governed by approved Commercial/Payment decisions where not
directly expressed by a BR; unsupported MBR-COM numbering is not
invented.

## 10A. Core Downstream Consequence and Traceability Preservation

### Current Governing Inputs

  -----------------------------------------------------------------------
  Current governing input             Business-rule traceability
                                      consequence
  ----------------------------------- -----------------------------------
  MADCR-010 --- Commercial            Commercial Entitlement is authority
  Entitlement authority               for quota/access capacity;
                                      entitlement is not RBAC.

  MADCR-011 --- Payment in M14        Payment belongs to
  Commercial                          Commercial/Payment boundary; BR
                                      traceability does not invent
                                      payment BR IDs.

  MADCR-002 --- Provider-independent  Provider-specific behavior remains
  Payment Core + Provider Adapter     behind adapter; no new BR ID
                                      inferred.

  MADCR-003 --- Verified + Idempotent Payment callback alone cannot
  Payment Fulfillment                 create confirmed fulfillment;
                                      verification/idempotency are
                                      governing architecture
                                      consequences.

  MADCR-005 --- Reconciliation        Reconciliation detects
                                      inconsistency; it does not silently
                                      mutate
                                      entitlement/quota/subscription.

  MON-006 --- Historical purchase     Confirmed historical purchase
  snapshot                            snapshot remains immutable; formal
                                      MBR-COM mapping is not invented.

  MADCR-049 --- Learning Activity     Completion/reward boundary is
  boundary                            Learning Activity; completion does
                                      not automatically equal
                                      title/award.

  MADCR-053 --- Capability +          Authorization is
  Permission + Scope                  capability/permission/scope based;
                                      entitlement does not replace RBAC.

  MADCR-054 --- Host ≠ Instructor     Host and Instructor are separate
                                      capabilities; one does not
                                      automatically imply the other.

  AEP4-OD-08 --- No automatic         Provider switching remains
  provider failover                   manual/admin; no failover
                                      rule/entity is invented.

  MADCR-058 --- Midtrans MVP          Midtrans is MVP provider behind
                                      Provider Adapter; provider choice
                                      does not rewrite business-rule
                                      authority.
  -----------------------------------------------------------------------

### BR Cluster Traceability

  -----------------------------------------------------------------------
  BR range /        Primary semantic  Required          Evidence status
  cluster           domain            downstream trace  
                                      targets           
  ----------------- ----------------- ----------------- -----------------
  BR-001--015       Agency / identity PRD, User Flow,   LOCKED /
                    / context /       ERD, API, RBAC    TRACEABLE
                    listing ownership                   

  BR-016--030       Member exit /     User Flow, PRD,   LOCKED /
                    listing transfer  ERD, API, Audit   TRACEABLE
                    / origin / data                     
                    retention                           

  BR-031--034       Lead History /    API, Audit, User  LOCKED /
                    audit boundary    Flow, PRD         TRACEABLE

  BR-035--050       Promotion /       Commercial,       LOCKED /
                    Permanent Add-on  Listing, ERD,     TRACEABLE
                    / entitlement     API, User Flow,   
                    ownership         RBAC              

  BR-051--073       Closure           User Flow, API,   LOCKED /
                    initiation / OTP  RBAC, Security    TRACEABLE
                    / state /                           
                    permission                          

  BR-074--089       Closure race /    API, User Flow,   LOCKED /
                    listing transfer  ERD, Audit,       TRACEABLE
                    / retry /         Engineering       
                    exception /                         
                    membership                          
                    completion                          

  BR-090--104       Final closure /   User Flow, PRD,   LOCKED /
                    historical Agency SEO, Analytics,   TRACEABLE
                    / analytics /     Audit             
                    audit                               

  BR-105--117       Rejoin / personal User Flow, ERD,   LOCKED /
                    entitlement /     API, Commercial   TRACEABLE
                    origin/context /                    
                    transfer                            

  BR-118--123       Agency state      API, User Flow,   LOCKED /
                    machine / server  RBAC, State model TRACEABLE
                    authority /                         
                    recovery                            

  BR-124--128       Ownership /       Commercial, ERD,  LOCKED /
                    allocation /      API, User Flow    TRACEABLE
                    add-on closure                      

  BR-129--137       Historical        PRD, API, Audit,  LOCKED /
                    identity /        Engineering, Test TRACEABLE
                    idempotency /                       
                    non-regression                      

  BR-138--151       OTP / closure     API, RBAC, User   LOCKED /
                    authority /       Flow, ERD, Audit, TRACEABLE
                    listing /         Test              
                    entitlement /                       
                    final closure                       
  -----------------------------------------------------------------------

### Cross-Domain Business-Rule Boundary

  --------------------------------------------------------------------------
  Domain                  Business-rule boundary     Downstream consequence
  ----------------------- -------------------------- -----------------------
  Identity / Agent        Agency membership and      No duplicate identity
                          personal context are       authority
                          distinct                   

  Organization / Agency   Lead/member/state          Agency state controls
                          lifecycle                  operational permissions

  Listing                 Ownership, origin, current Transfer preserves
                          context                    owner/origin; no
                                                     duplicate listing

  Commercial              Promo/add-on/entitlement   Ownership and
                          behavior                   consumption are
                                                     distinct

  Payment                 Confirmation vs            Payment does not
                          fulfillment                directly mutate RBAC

  Learning                Completion/reward boundary Learning Activity is
                                                     canonical
                                                     completion/reward
                                                     boundary

  Session                 Evidence vs                Provider evidence does
                          attendance/completion      not become business
                                                     truth automatically

  Awarding                Qualification / Award      Payment/completion does
                          Instance separation        not automatically
                                                     create award

  RBAC / Permission       Role + Agency State /      Entitlement is not
                          Capability + Permission +  authorization
                          Scope                      

  Analytics               Agency vs Personal         No migration of Agency
                                                     Analytics to Personal
                                                     Analytics

  Audit                   Historical evidence        Deleted Lead History
                          boundary                   content not retained in
                                                     audit

  AI                      Assistive role             AI cannot invent or
                                                     mutate business
                                                     authority
  --------------------------------------------------------------------------

### Carry-Forward Status

  -----------------------------------------------------------------------
  Item                    Current status          Treatment
  ----------------------- ----------------------- -----------------------
  BR-001--BR-151          LOCKED / NORMATIVE      Full text carried
                                                  forward

  MBR-COM-001--013        EVIDENCE / PROVENANCE   Do not invent or assign
                          GAP                     content

  MADCR-002/003/005       APPROVED / GOVERNING    Trace as architecture
                                                  consequences

  MADCR-010/011           APPROVED / GOVERNING    Trace
                                                  Commercial/Payment
                                                  authority

  MON-006                 OWNER DECISION /        Historical purchase
                          GOVERNING               snapshot semantics
                                                  preserved
  -----------------------------------------------------------------------

### Core Audit Summary

  ----------------------------------------------------------------------------------------------------------------------------
  Audit field                         Result
  ----------------------------------- ----------------------------------------------------------------------------------------
  Predecessor artifact                RUMAHAGEN_Business_Rules_Baseline_v1.0_FINAL.docx --- LOCKED

  New artifact                        RUMAHAGEN_W4-02A.6.10_BUSINESS_RULES_BASELINE_TRACEABILITY_FULL_CONSOLIDATED_v1.1.docx

  Content units reviewed              26 major content units: purpose/authority, rule lock/change control, BR-001--BR-151,
                                      state machines, decision tables, invariants, AEP/MADCR consequences, traceability
                                      matrix, cross-AEP mapping, commercial residual, physical boundary, historical boundary,
                                      source evidence, gate and next-step controls

  CARRY FORWARD                       All 151 locked BR identifiers and definitions; canonical state machines; decision
                                      tables; invariants; downstream-source-of-truth rule; change-control rule

  UPDATE                              W4-02A.6 current authority, current closed decision consequences, downstream
                                      traceability, current commercial residual handling, physical/runtime boundary, current
                                      synchronization metadata

  SUPERSEDE                           No BR business logic. Stale evidence-state wording is superseded where it treats
                                      MBR-COM-001--013 as an unresolved/evidence-only residual; BR-001--BR-151 canonical
                                      business logic remains unchanged.

  HISTORICAL / PROVENANCE             Earlier AEP BR-evidence-gap artifacts, older baseline copies and prior synchronization
                                      states

  REMOVED                             0

  Missing valid content               0 identified

  Untraced new substantive content    0

  Material conflict                   0 unresolved

  Owner decision required             0

  Audit result                        PASS
  ----------------------------------------------------------------------------------------------------------------------------

### Cross-Domain Dependency Verification

  Dependency          Result
  ------------------- --------------------------------------------------
  Identity            GREEN
  Agent               GREEN
  Organization        GREEN
  Listing             GREEN
  Learning            GREEN
  Session             GREEN
  Event               GREEN
  Awarding            GREEN
  Commercial          GREEN
  Payment             GREEN
  Entitlement         GREEN
  RBAC / Permission   GREEN
  RLS                 GREEN --- semantic boundary only
  API                 GREEN --- downstream contract remains later gate
  ERD                 GREEN --- downstream logical consumption
  Database Schema     GREEN --- no physical change authorized
  AI                  GREEN
  Notification        GREEN
  Analytics           GREEN
  Module Execution    GREEN --- later execution gates

### Core Green Gate Criteria

  Criterion                                     Result
  --------------------------------------------- -----------
  Full locked BR source retained                GREEN
  BR-001--BR-151 completeness                   151 / 151
  Normative authority preserved                 GREEN
  No unsupported BR ID invented                 GREEN
  MBR-COM residual kept explicit                GREEN
  Current MADCR/OD consequences synchronized    GREEN
  Cross-domain traceability established         GREEN
  Historical/provenance boundary explicit       GREEN
  Physical/runtime authorization not invented   GREEN
  Carry-Forward Audit                           PASS
  Unresolved Owner decision                     0
  Material authority conflict                   0

## 14. Provenance Model

`Core → Mxx → STEP04 → STEP05 → STEP06 → STEP07 → STEP08`

Commercial closure additionally traces:

`Owner approval → MBR-COM closure → STEP08 → downstream synchronization`

## 15. Consolidation Gate

  -----------------------------------------------------------------------
  Criterion               Result                  Evidence
  ----------------------- ----------------------- -----------------------
  Core BR preservation    **PASS**                151/151 Core BR
                                                  identifiers and
                                                  definitions carried
                                                  forward

  M01-M15 delta coverage  **PASS**                73/73 STEP08 actionable
                                                  semantic delta units
                                                  represented

  Commercial closure      **PASS**                MBR-COM-001-013
                                                  represented as CLOSED /
                                                  OWNER APPROVED

  STEP05 conflict         **PASS**                7/7 locked conflict
  application                                     resolutions represented

  Core detail loss        **PASS**                No Core BR removed or
                                                  silently replaced

  Lifecycle preservation  **PASS**                Core lifecycle state
                                                  machines retained;
                                                  conflict changes scoped
                                                  to affected lifecycle
                                                  portion

  Authority preservation  **PASS**                Module authority
                                                  remains domain-scoped;
                                                  no whole-artifact
                                                  takeover

  Rule delta isolation    **PASS**                Mxx amendments are
                                                  delta units; unrelated
                                                  Core detail remains
                                                  preserved

  Duplicate consolidation **PASS**                Canonical IDs are not
                                                  duplicated;
                                                  semantic-family
                                                  collisions remain
                                                  provenance-linked

  Fabrication control     **PASS**                No unsupported
                                                  historical MBR-COM
                                                  per-ID wording
                                                  fabricated

  Physical boundary       **PASS**                No SQL/API/RLS/runtime
                                                  authorization claimed
                                                  by this baseline

  Provenance              **PASS**                Every canonical unit
                                                  has source/provenance
                                                  fields

  Downstream readiness    **PASS**                Baseline is suitable as
                                                  STEP09 Business Rules
                                                  semantic input
  -----------------------------------------------------------------------

## 16. Current Status and Handoff

**STEP08 Business Rules Baseline Consolidation: PASS.**

This document is the current human-readable semantic Business Rules
baseline for controlled continuation into STEP09 Architecture &
Dependency Synchronization. It does not mutate Core v1.3 and does not
create Integrated Core v1.4.

## 17. Source Integrity

-   Core Business Rules source SHA-256:
    `f1bd00843508c4bdc16794b1509690e5c6ec6c12c49611587382a932a87e8ebc`
-   STEP08 v1.2 package SHA-256:
    `2d12801d7c3868cf96f764a8432c07b1da6f7bfb8b4c5bc658353fc04c180da1`
-   STEP04 v1.2 package SHA-256:
    `958c2e83f0ae83da72a21a1fbc8939f93aa7f3fdad61479e59203ef24a5490ed`
-   STEP05 v1.1 package SHA-256:
    `6a16adf8bd2a2e3946d0c0ce521f24dd520d6705821546bfc4b7baf85ee6eb4e`
-   STEP06 v1.1 package SHA-256:
    `839a7eca7999f5905de846686536a1129bd591ac1c81eb9bdcb02efdaac67534`
-   STEP07 v1.1 package SHA-256:
    `56317e8be715d8bff3ea2311f5ecc40235677b044311cab42aa61e0426ed7c0c`
-   STEP07-A v1.1 package SHA-256:
    `0ce1a4f2aec20b7faa766eeff495500f0630b8e89facd8d24b86b8ee7327e2b5`
-   MBR-COM closure SHA-256:
    `e3e9a3d12e866bdb8eb493aa9c66f6324f9cdbcc6389e1d30d4e81f622c2871e`

------------------------------------------------------------------------

END --- RUMAHAGEN BUSINESS RULES BASELINE CONSOLIDATED STEP08 v1.0
