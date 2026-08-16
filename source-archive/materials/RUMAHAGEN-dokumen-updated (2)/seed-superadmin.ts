/**
 * seed-superadmin.ts
 * ============================================================================
 * OD-18 (Issue Register Batch 2, T3-01) — Bootstrap akun Superadmin pertama.
 * Dijalankan SEKALI saat Sprint S0, SETELAH migration 0001-0015 dieksekusi ke
 * project Supabase live, SEBELUM ada agen mendaftar (memutus chicken-and-egg
 * problem: approval registrasi agen butuh Superadmin yang sudah eksis).
 *
 * Cara pakai:
 *   pnpm tsx scripts/seed-superadmin.ts \
 *     --email owner@example.com \
 *     --name "Mujtahid Aktanto" \
 *     --password "<password kuat, isi sendiri saat run, JANGAN hardcode>"
 *
 * Atau interaktif (tanpa flag --password, akan diminta prompt tersembunyi):
 *   pnpm tsx scripts/seed-superadmin.ts --email owner@example.com --name "Mujtahid Aktanto"
 *
 * Environment variable WAJIB (isi di .env.local, JANGAN commit ke git):
 *   NEXT_PUBLIC_SUPABASE_URL=https://xxxxx.supabase.co
 *   SUPABASE_SERVICE_ROLE_KEY=eyJ...   <- Service Role key, BUKAN anon key.
 *                                          Key ini bisa bypass RLS sepenuhnya,
 *                                          JANGAN pernah dipakai di client/browser,
 *                                          JANGAN commit ke git.
 *
 * Idempotent: jika email sudah terdaftar sebagai Superadmin aktif, script
 * berhenti dengan pesan jelas, tidak membuat duplikat.
 * ============================================================================
 */

import { createClient } from '@supabase/supabase-js';
import { randomUUID } from 'crypto';

// ---------------------------------------------------------------------------
// 1. Parse argumen CLI (tanpa dependency tambahan, cukup argv sederhana)
// ---------------------------------------------------------------------------
function parseArgs(argv: string[]): Record<string, string> {
  const args: Record<string, string> = {};
  for (let i = 0; i < argv.length; i++) {
    if (argv[i].startsWith('--')) {
      const key = argv[i].slice(2);
      const value = argv[i + 1] && !argv[i + 1].startsWith('--') ? argv[i + 1] : '';
      args[key] = value;
      if (value) i++;
    }
  }
  return args;
}

async function promptHidden(question: string): Promise<string> {
  // Prompt password tersembunyi tanpa dependency tambahan (Node.js readline + mute).
  const readline = await import('readline');
  return new Promise((resolve) => {
    const rl = readline.createInterface({ input: process.stdin, output: process.stdout });
    // @ts-expect-error - akses internal readline untuk mute echo
    const stdin = process.openStdin();
    process.stdout.write(question);
    let muted = false;
    // @ts-expect-error
    rl._writeToOutput = function _writeToOutput(stringToWrite: string) {
      if (!muted) rl.output?.write(stringToWrite);
    };
    rl.question('', (answer) => {
      rl.close();
      resolve(answer);
    });
    muted = true;
  });
}

// ---------------------------------------------------------------------------
// 2. Validasi minimal (bukan validasi bisnis lengkap — cukup untuk bootstrap
//    satu-kali, alur registrasi normal aplikasi tetap pakai Zod schema resmi)
// ---------------------------------------------------------------------------
function assertValidEmail(email: string): void {
  const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!re.test(email)) {
    throw new Error(`Email tidak valid: "${email}"`);
  }
}

function assertStrongPassword(password: string): void {
  if (password.length < 12) {
    throw new Error('Password minimal 12 karakter untuk akun Superadmin (lebih ketat dari user biasa).');
  }
}

// ---------------------------------------------------------------------------
// 3. Main
// ---------------------------------------------------------------------------
async function main() {
  const args = parseArgs(process.argv.slice(2));

  const email = args.email;
  const fullName = args.name;
  let password = args.password;

  if (!email || !fullName) {
    console.error(
      'Wajib isi --email dan --name.\n' +
        'Contoh: pnpm tsx scripts/seed-superadmin.ts --email owner@example.com --name "Mujtahid Aktanto"'
    );
    process.exit(1);
  }

  if (!password) {
    password = await promptHidden('Masukkan password Superadmin (min. 12 karakter, tidak akan tampil di layar): ');
  }

  assertValidEmail(email);
  assertStrongPassword(password);

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !serviceRoleKey) {
    console.error(
      'Wajib set NEXT_PUBLIC_SUPABASE_URL dan SUPABASE_SERVICE_ROLE_KEY di .env.local ' +
        '(Service Role key, BUKAN anon key — cek Supabase Dashboard > Project Settings > API).'
    );
    process.exit(1);
  }

  const supabase = createClient(supabaseUrl, serviceRoleKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  });

  // -------------------------------------------------------------------------
  // 3a. Guard: pastikan belum ada Superadmin aktif (idempotent, cegah duplikat)
  // -------------------------------------------------------------------------
  const { data: roleRow, error: roleErr } = await supabase
    .from('roles')
    .select('id')
    .eq('code', 'superadmin')
    .single();

  if (roleErr || !roleRow) {
    console.error(
      'Role "superadmin" tidak ditemukan di tabel roles. Pastikan migration 0002_m10_rbac_foundation.sql ' +
        'sudah dieksekusi sebelum menjalankan script ini.'
    );
    process.exit(1);
  }

  const { data: existing, error: existingErr } = await supabase
    .from('users')
    .select('id, email, status')
    .eq('role_id', roleRow.id)
    .eq('status', 'active')
    .is('deleted_at', null);

  if (existingErr) {
    console.error('Gagal cek Superadmin existing:', existingErr.message);
    process.exit(1);
  }

  if (existing && existing.length > 0) {
    console.log(
      `⚠️  Sudah ada ${existing.length} Superadmin aktif (mis. ${existing[0].email}). ` +
        'Script berhenti — tidak membuat duplikat. Hapus guard ini manual jika Anda sengaja ingin menambah Superadmin kedua.'
    );
    process.exit(0);
  }

  // -------------------------------------------------------------------------
  // 3b. Buat user di Supabase Auth (auth.users) — password dikelola di sini,
  //     BUKAN di kolom public.users.password_hash.
  // -------------------------------------------------------------------------
  console.log(`Membuat akun Auth untuk ${email}...`);
  const { data: authUser, error: authErr } = await supabase.auth.admin.createUser({
    email,
    password,
    email_confirm: true, // langsung dianggap terverifikasi, skip alur konfirmasi email normal
    user_metadata: {
      full_name: fullName, // disimpan di sini karena public.users TIDAK punya kolom nama
      // untuk role internal (lihat catatan governance di bawah).
    },
  });

  if (authErr || !authUser?.user) {
    console.error('Gagal membuat akun Supabase Auth:', authErr?.message);
    process.exit(1);
  }

  // -------------------------------------------------------------------------
  // 3c. Insert baris public.users, role_id = superadmin, status = active
  //     (bypass alur pending_review normal — sesuai keputusan OD-18).
  // -------------------------------------------------------------------------
  console.log('Membuat baris public.users...');
  const { error: insertErr } = await supabase.from('users').insert({
    id: authUser.user.id, // WAJIB sama dengan auth.users.id (konvensi id = auth.uid())
    email,
    // password_hash: placeholder non-fungsional — Supabase Auth adalah sumber
    // kebenaran hashing (lihat migration 0003, komentar kolom). Diisi string
    // tetap agar constraint NOT NULL terpenuhi, TIDAK PERNAH dipakai untuk verifikasi.
    password_hash: 'managed_by_supabase_auth',
    role_id: roleRow.id,
    status: 'active',
    email_verified_at: new Date().toISOString(),
  });

  if (insertErr) {
    console.error(
      'Gagal insert public.users:',
      insertErr.message,
      '\n⚠️  Akun Auth SUDAH terlanjur dibuat (auth.users) tapi baris public.users GAGAL. ' +
        `Hapus manual via Supabase Dashboard > Authentication > user id ${authUser.user.id} sebelum retry, ` +
        'agar tidak ada akun Auth "orphan" tanpa profil.'
    );
    process.exit(1);
  }

  console.log('✅ Superadmin berhasil dibuat.');
  console.log(`   Email : ${email}`);
  console.log(`   Nama  : ${fullName}`);
  console.log(`   Role  : superadmin`);
  console.log(`   Status: active`);
  console.log('\nSilakan login dengan email + password yang baru saja Anda masukkan.');
}

main().catch((err) => {
  console.error('Script gagal:', err.message);
  process.exit(1);
});
