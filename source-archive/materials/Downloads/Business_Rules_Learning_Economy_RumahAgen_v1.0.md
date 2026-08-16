# BUSINESS RULES — LEARNING ECONOMY
## RumahAgen Internal Learning

**Document Type:** Business Rules Baseline — Learning Economy Domain  
**Version:** 1.0  
**Status:** Consolidated from approved Learning discussions  
**Scope:** Internal Learning RumahAgen  
**Excluded:** Partnership Learning is not required to follow the RumahAgen Learning Economy.

---

# 1. Purpose

Dokumen ini merangkum business rules Learning Economy RumahAgen yang telah dikunci dalam diskusi Learning sebelumnya.

Model yang digunakan adalah:

> **Learn for free. Grind to earn. Pay to accelerate. Prove to certify.**

Prinsip tersebut berarti Learning Economy bukan sekadar mekanisme pembayaran kursus. Ia merupakan mekanisme ekonomi/progresi yang menghubungkan aktivitas belajar, Learning Points, akses/progresi, assessment, competency, skill, credential, dan pada kondisi tertentu Title.

---

# 2. Scope

## 2.1 Internal Learning

Internal Learning RumahAgen menggunakan Learning Economy.

Alur konseptual:

```text
Free Learning
    ↓
Learning Activity
    ↓
Earn Learning Points
    ↓
Unlock / Progress
    ↓
Assessment / Evidence
    ↓
Competency
    ↓
Skill / Credential / Title
```

Learning Points dapat membantu unlock atau progression sesuai konfigurasi, tetapi tidak otomatis menjadi bukti competency.

## 2.2 Partnership Learning

Partnership Learning menggunakan model learning yang ditentukan oleh partner/general learning model dan **tidak wajib mengikuti Learning Economy internal RumahAgen**.

Hasil partnership tetap harus mempertahankan provenance sumbernya dan tidak otomatis menjadi RumahAgen Verified Skill.

---

# 3. Core Learning Economy Rules

## LE-001 — Free-to-Learn

Agent harus memiliki jalur yang benar-benar gratis untuk mengikuti Internal Learning.

Payment tidak boleh menjadi syarat wajib untuk memulai atau mengikuti seluruh proses learning.

## LE-002 — Learning Activities Can Earn Points

Aktivitas learning dapat menghasilkan Learning Points.

Reward Learning Points harus dapat dikonfigurasi dan tidak boleh dianggap sebagai angka immutable yang tertanam dalam core business logic.

## LE-003 — Pay-to-Accelerate

Agent dapat membeli Learning Points untuk mempercepat progression.

Pembelian bersifat opsional dan merupakan acceleration mechanism.

## LE-004 — Never Pay-to-Pass

Pembayaran atau kepemilikan Learning Points tidak boleh otomatis menghasilkan kelulusan assessment atau competency.

Jika suatu Skill/Credential membutuhkan assessment, assessment tersebut tetap wajib dipenuhi.

## LE-005 — Prove-to-Certify

Skill/Credential yang membutuhkan bukti competency hanya dapat diperoleh setelah configured assessment/evidence/proof requirement terpenuhi.

Learning Points saja tidak cukup untuk membuktikan competency.

---

# 4. Learning Point Rules

## LE-006 — Learning Points Are First-Class Domain Data

Learning Points tidak boleh hanya direpresentasikan sebagai satu angka balance tanpa transaction history.

Sistem harus dapat membedakan:

- current balance;
- earned points;
- purchased points;
- point transactions;
- earning source;
- purchase source;
- redemption/use;
- expiration jika dikonfigurasi;
- audit/provenance.

## LE-007 — Earned and Purchased Provenance

Earned Learning Points dan Purchased Learning Points wajib memiliki provenance yang dapat dibedakan.

```text
Learning Point Transaction
    ├── EARNED
    │     └── Learning Activity / Source
    ├── PURCHASED
    │     └── Payment / Purchase Source
    └── REDEEMED / USED
```

Sistem tidak boleh mengasumsikan bahwa earned dan purchased points selalu interchangeable untuk semua future policy.

## LE-008 — Transaction History Is Auditable

Setiap perubahan balance harus dapat ditelusuri melalui transaction history.

Balance dapat menjadi projection/controlled balance, tetapi transaction history tetap menjadi sumber audit.

## LE-009 — Point Reward Is Configurable

Jumlah Learning Points yang diperoleh dari suatu activity merupakan configurable learning/business parameter.

Perubahan konfigurasi untuk aktivitas baru tidak boleh mengubah transaksi historis yang sudah terjadi.

## LE-010 — Point Expiration Is Policy-Driven

Jika expiration Learning Points diberlakukan, expiration harus berasal dari configured policy dan provenance point harus tetap dapat ditelusuri.

Expiration tidak boleh diasumsikan sebagai rule universal jika belum dikonfigurasi.

---

# 5. Learning Activity Rules

## LE-011 — Learning Activity Is the Earning Source

Learning activities merupakan mekanisme utama untuk memperoleh earned Learning Points.

Contoh activity dapat mencakup:

- learning content;
- course/module completion;
- practice;
- assignment;
- mission;
- activity lain yang dikonfigurasi.

## LE-012 — Activity Type Is Extensible

Sistem tidak boleh mengunci Learning Economy hanya pada satu jenis activity.

Activity type harus dapat diperluas melalui domain/configuration design.

## LE-013 — Activity Configuration

Sebuah learning activity dapat memiliki konfigurasi:

- Learning Point reward;
- completion condition;
- prerequisite;
- availability;
- progression relationship;
- assessment requirement.

## LE-014 — Completion Must Be Determinable

Sistem harus mempunyai definisi yang jelas mengenai kapan suatu learning activity dianggap completed sebelum reward completion diberikan.

---

# 6. Learning Path and Progression Rules

## LE-015 — Structured Learning Path

Internal Learning dapat menggunakan struktur:

```text
Learning Program
    ↓
Learning Path
    ↓
Module / Activity
    ↓
Completion
    ↓
Learning Points
    ↓
Skill / Credential Path
```

## LE-016 — Points May Control Unlock / Progression

Learning Points dapat digunakan sebagai prerequisite untuk unlock atau progression jika konfigurasi learning path mengaturnya.

## LE-017 — Unlock Is Not Competency

Access/Unlock State dan Competency State wajib dipisahkan.

```text
Points
  ↓
Unlock / Access
  ↓
Learning
  ↓
Assessment / Evidence
  ↓
Competency
```

Memiliki cukup Learning Points tidak berarti agent competent.

## LE-018 — Free Progression Must Remain Genuine

Jika sebuah learning path memiliki jalur free-to-learn, agent harus tetap dapat memperoleh progression melalui aktivitas belajar dan earning yang tersedia secara gratis.

Pembelian points hanya mempercepat jika configured sebagai acceleration mechanism.

---

# 7. Assessment and Competency Rules

## LE-019 — Assessment Is an Independent Gate

Assessment merupakan competency gate yang terpisah dari Learning Points.

## LE-020 — Assessment Requirement Is Configurable

Skill/Credential dapat menentukan:

- apakah assessment diperlukan;
- assessment type;
- passing criteria;
- attempts;
- evidence requirement;
- reviewer requirement jika diperlukan.

## LE-021 — Payment Cannot Replace Assessment

Tidak ada jumlah Purchased Learning Points yang dapat menggantikan assessment yang diwajibkan.

## LE-022 — Learning Completion Is Not Automatically Competency

Completion suatu course/module/activity tidak otomatis berarti agent competent kecuali awarding/skill rule secara eksplisit mendefinisikannya sebagai evidence yang cukup.

## LE-023 — Learning Points Are Not Competency Evidence by Default

Learning Points merupakan economic/progression reward.

Learning Points tidak otomatis menjadi competency evidence.

---

# 8. Learning Economy and Title Rules

Business Rules Title yang telah dibahas memberikan boundary penting antara Learning Economy dan Title.

## LE-024 — Learning Points Are Not a Universal Title Requirement

Learning Points **bukan syarat universal untuk memperoleh Title**.

Eligibility Title ditentukan oleh Awarding Rules.

Learning Points dapat menjadi salah satu prerequisite jika Title Definition/Awarding Path secara eksplisit mengaturnya.

Dengan demikian:

```text
Learning Points
    ≠
Universal Title Requirement
```

## LE-025 — Multiple Evidence Sources May Determine a Title

Title dari learning dapat menggunakan kombinasi:

- learning completion;
- assessment;
- competency;
- credential;
- Learning Points;
- evidence lain yang diizinkan Awarding Path.

## LE-026 — Assessment Is Not Universal for Every Title

Tidak semua Title harus memiliki assessment.

Setiap Title Definition/Awarding Path dapat menentukan apakah assessment diperlukan.

Contoh:

```text
100 Deals
→ tanpa assessment jika rule mengizinkan

Property Fundamentals
→ completion-only jika rule mengizinkan

Closing Specialist
→ completion + assessment ≥ configured passing score

Certified Property Agent
→ assessment + competency jika diwajibkan
```

## LE-027 — Completion-Only Title Is Allowed When Explicitly Configured

Learning completion dapat menjadi dasar pemberian Title tanpa assessment **hanya jika Awarding Path secara eksplisit mengizinkannya**.

Contoh:

```text
Property Fundamentals
→ 100% completion
→ Title Award
```

Completion-only tidak boleh ditafsirkan sebagai competency secara otomatis.

## LE-028 — Learning Is Not Universal Title Prerequisite

Tidak semua Title harus diperoleh melalui Learning RumahAgen.

Awarding Path dapat menentukan bahwa Title diperoleh melalui:

- Learning;
- Experience;
- Performance/Transaction evidence;
- Partner Certification;
- atau kombinasi lainnya.

Hal ini memungkinkan multiple awarding paths untuk Title yang sama.

---

# 9. Skill, Credential and Title Separation

## LE-029 — Learning Completion ≠ Skill

Completion tidak otomatis menciptakan Verified Skill kecuali skill rule mendefinisikannya secara eksplisit.

## LE-030 — Skill ≠ Credential

Skill merupakan competency outcome; Credential merupakan formal recognition sesuai rule-nya.

## LE-031 — Credential ≠ Title

Credential dan Title dapat berhubungan dalam awarding path, tetapi merupakan konsep berbeda dan tidak boleh disatukan secara implisit.

## LE-032 — Title Award Must Preserve Awarding Logic

Jika learning menjadi sumber qualification Title, Title domain harus mengetahui qualification/evidence yang digunakan melalui Awarding Path dan rule yang berlaku.

---

# 10. Partnership Learning Rules

## LE-033 — Partnership Learning Is Outside Mandatory Internal Economy

Partner tidak wajib menggunakan Learning Economy internal RumahAgen.

## LE-034 — Partner Result Retains Provenance

Partner learning result/credential harus menyimpan source/provenance partner.

## LE-035 — Partner Credential Does Not Automatically Become RumahAgen Verified Skill

Partner credential tidak otomatis dianggap sebagai RumahAgen Verified Skill.

Jika ingin diakui sebagai skill/title RumahAgen, harus melalui configured recognition/awarding rule.

## LE-036 — Profile May Aggregate Multiple Sources

Agent Profile dapat menampilkan hasil Internal Learning dan Partnership Learning, tetapi source harus tetap jelas.

---

# 11. Payment and Learning Economy Rules

## LE-037 — Payment Is Owned by Payment/Commercial Domain

Learning domain tidak memiliki Payment Gateway logic sebagai business logic internal.

Payment Gateway merupakan external/payment integration.

## LE-038 — Confirmed Payment Is Required for Purchased Points

Purchased Learning Points hanya boleh diberikan setelah payment/order memenuhi status confirmed sesuai payment integration rule.

## LE-039 — Payment-to-Points Flow Must Be Controlled

Conceptual flow:

```text
Order
  ↓
Payment
  ↓
Verification
  ↓
Payment Confirmed
  ↓
Point Grant Pending
  ↓
Purchased Point Transaction Confirmed
```

## LE-040 — Purchased Point Grant Must Be Idempotent

Retry, duplicate webhook, atau duplicate processing tidak boleh memberikan purchased points lebih dari satu kali untuk transaksi yang sama.

## LE-041 — Payment Reconciliation

Jika payment confirmed tetapi point grant belum berhasil, transaksi harus dapat masuk ke reconciliation/pending flow dan tidak boleh hilang.

## LE-042 — Payment Failure Cannot Grant Purchased Points

Payment failed/cancelled/expired tidak boleh menghasilkan confirmed purchased-point entitlement.

---

# 12. RBAC and Governance Rules

## LE-043 — Agent Cannot Arbitrarily Create Official Points

Agent dapat memperoleh atau membeli points melalui mekanisme resmi, tetapi tidak dapat membuat/mengubah official point transaction secara bebas.

## LE-044 — Point Configuration Requires Authorized Role

Konfigurasi reward, unlock threshold, purchase package, dan parameter Learning Economy hanya dapat diubah oleh authorized administrative/business role.

## LE-045 — Manual Adjustment Requires Audit

Manual point adjustment, jika diperbolehkan, harus:

- dilakukan oleh authorized role;
- mempunyai reason;
- mempunyai audit trail;
- mempertahankan provenance.

## LE-046 — Assessment Authority Is Separate

Hak melakukan assessment/review/competency verification harus diatur melalui permission/role yang sesuai.

## LE-047 — Credential/Skill Issuance Is Governed

Official Skill/Credential issuance tidak boleh dilakukan hanya berdasarkan client-side completion state.

---

# 13. Audit and Provenance Rules

## LE-048 — Every Earned Point Must Be Explainable

Sistem harus dapat menjawab:

> Dari aktivitas apa points ini berasal?

## LE-049 — Every Purchased Point Must Be Explainable

Sistem harus dapat menjawab:

> Pembayaran/order apa yang menghasilkan purchased points ini?

## LE-050 — Every Competency Result Must Be Explainable

Sistem harus dapat menjawab:

> Assessment/evidence apa yang membuat agent dinyatakan competent?

## LE-051 — Every Learning-Based Title Must Be Explainable

Jika Title diperoleh melalui Learning, sistem harus dapat menelusuri:

```text
Title
 ↓
Awarding Path
 ↓
Qualification
 ↓
Learning / Assessment / Evidence
```

## LE-052 — Historical Records Must Remain Auditable

Perubahan konfigurasi learning di masa depan tidak boleh menghapus kemampuan sistem untuk menjelaskan transaksi atau outcome historis.

---

# 14. Configuration Rules

## LE-053 — Learning Economy Parameters Are Configurable

Parameter seperti berikut dapat dibuat configurable:

- reward points per activity;
- unlock threshold;
- progression threshold;
- purchase package;
- purchase price;
- bonus points;
- earning limits;
- expiration policy jika diberlakukan;
- redemption rules.

## LE-054 — Configuration Is Not Historical Mutation

Mengubah konfigurasi tidak boleh mengubah transaksi points, assessment, competency, atau credential historis.

## LE-055 — Historical Transactions Preserve Their Original Context

Jika reward activity berubah dari 10 menjadi 20 points, transaksi lama tetap mencerminkan reward yang benar pada saat transaksi tersebut terjadi.

---

# 15. Domain Event Rules

Recommended conceptual events:

```text
LearningActivityCompleted
LearningPointsEarned
LearningPointsPurchased
LearningPointsRedeemed
LearningPathUnlocked
AssessmentSubmitted
AssessmentPassed
AssessmentFailed
SkillVerified
CredentialIssued
PartnerCredentialRecorded
```

Payment events tetap dimiliki Payment/Commercial domain.

Learning hanya mengonsumsi confirmed payment outcome melalui integration contract.

---

# 16. Consistency and Failure Rules

## LE-056 — Payment Success Must Not Disappear

Payment yang telah confirmed tetapi point allocation gagal harus memiliki state yang dapat dilanjutkan/reconcile.

## LE-057 — Retry Must Not Duplicate Points

Retry terhadap integration event tidak boleh menggandakan purchased points.

## LE-058 — Point Balance Must Be Reconstructable

Transaction history harus cukup untuk audit dan, sejauh desain memungkinkan, rekonstruksi balance.

## LE-059 — Cross-Domain Direct Mutation Is Prohibited

Payment tidak boleh langsung memodifikasi internal state Learning tanpa controlled contract.

---

# 17. Master Learning Economy Invariants

Invariant yang harus tetap benar dalam semua implementasi:

1. **Free learning path exists.**
2. **Learning activity can earn points.**
3. **Purchased points accelerate; they do not automatically certify.**
4. **Assessment remains mandatory whenever the applicable rule requires it.**
5. **Learning Points are not universal competency evidence.**
6. **Learning Points are not a universal Title prerequisite.**
7. **Completion-only Title is permitted only when explicitly configured.**
8. **Learning is not a universal Title prerequisite.**
9. **Earned and purchased points retain separate provenance.**
10. **Partnership Learning does not automatically inherit Internal Learning Economy.**
11. **Partner credentials retain partner provenance.**
12. **Payment-to-points fulfillment is verified and idempotent.**
13. **Historical point and learning outcomes remain auditable.**
14. **Configurable parameters are not hard-coded business-rule constants.**
15. **Cross-domain state is not directly mutated by another domain.**

---

# 18. Reference Architecture

```text
                         LEARNING DOMAIN
                               │
              ┌────────────────┴────────────────┐
              │                                 │
      INTERNAL LEARNING                  PARTNERSHIP LEARNING
              │                                 │
       LEARNING ECONOMY                    PARTNER MODEL
              │                                 │
       ┌──────┼───────┐                         │
       │      │       │                         │
   Activity Points   Path                    Result
       │      │       │                         │
       │    Ledger  Unlock                      │
       │      │       │                         │
       └──────┼───────┘                         │
              ↓                                 │
           Learning                             │
              ↓                                 │
       Assessment / Evidence                    │
              ↓                                 │
        Skill / Credential                      │
              │                                 │
              └──────────────┬──────────────────┘
                             ↓
                       AGENT PROFILE
                    (with source provenance)
```

Payment integration:

```text
Payment / Commercial Domain
          ↓
   Confirmed Purchase
          ↓
  Learning Integration
          ↓
Purchased Point Transaction
          ↓
   Learning Point Ledger
```

---

# 19. Traceability Requirement

Every implementation decision must trace through:

```text
Business Rule
    ↓
AEP Learning Economy
    ↓
ADR
    ↓
Domain Model
    ↓
ERD / Schema
    ↓
API / Integration Contract
    ↓
RBAC
    ↓
User Flow / PRD
    ↓
Implementation
    ↓
Test
```

No downstream artifact may reinterpret the Learning Economy into a **pay-to-pass** system.

---

# 20. Final Business Rule Statement

RumahAgen Internal Learning menggunakan Learning Economy dengan prinsip:

> **Learn for free. Grind to earn. Pay to accelerate. Prove to certify.**

Learning Points adalah economic/progression mechanism. Mereka dapat diperoleh melalui aktivitas belajar dan dapat dibeli untuk mempercepat progression. Namun Learning Points tidak otomatis menjadi competency, tidak otomatis menjadi Title, dan tidak menggantikan assessment/evidence ketika Awarding/Skill/Credential rules mensyaratkannya.

Learning Points juga **bukan universal prerequisite untuk Title**. Title eligibility ditentukan oleh Awarding Rules; Learning Points hanya menjadi prerequisite jika secara eksplisit dikonfigurasi oleh Title Definition/Awarding Path.

Internal Learning dan Partnership Learning memiliki model ekonomi yang berbeda. Partnership Learning tidak wajib mengikuti Learning Economy RumahAgen dan seluruh hasil partner harus mempertahankan provenance sumbernya.

---

# 21. Status

**Business Rules Learning Economy v1.0 — Consolidated**

Dokumen ini merupakan konsolidasi dari AEP Learning Economy dan keputusan business-rule Learning/Title yang tersedia dalam sumber diskusi. Bagian yang belum secara eksplisit dikunci dalam sumber harus diperlakukan sebagai configurable/proposed, bukan sebagai business rule immutable.

**Next governance step:** align this Business Rules Baseline with the Master Cross-Domain AEP, then synchronize ADR, System Architecture, ERD, Schema, API, RBAC, User Flow, PRD, and Test/Traceability Matrix.
