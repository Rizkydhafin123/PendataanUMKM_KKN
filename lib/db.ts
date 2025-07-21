import { neon, type NeonQueryFunction } from "@neondatabase/serverless"

/* ---------- CONFIG & FALLBACK ---------- */
const DATABASE_URL = process.env.DATABASE_URL
export const hasNeon = Boolean(DATABASE_URL)

/** Singleton Neon client */
let _sql: NeonQueryFunction<false> | null = null
function getDbClient(): NeonQueryFunction<false> {
  if (!hasNeon) {
    throw new Error("Neon database not configured. Please set DATABASE_URL environment variable.")
  }
  return (_sql ??= neon(DATABASE_URL!))
}

/* ---------- TYPE ---------- */
export interface UMKM {
  id?: string
  nama_usaha: string
  pemilik: string
  nik_pemilik?: string
  no_hp?: string
  alamat_usaha?: string
  jenis_usaha: string
  kategori_usaha?: string
  deskripsi_usaha?: string
  produk?: string
  kapasitas_produksi?: number
  satuan_produksi?: string
  periode_operasi?: number
  satuan_periode?: string
  hari_kerja_per_minggu?: number
  total_produksi?: number
  rab?: number
  biaya_tetap?: number
  biaya_variabel?: number
  modal_awal?: number
  target_pendapatan?: number
  jumlah_karyawan?: number
  status: string
  tanggal_daftar?: string
  created_at?: string
  updated_at?: string
  user_id?: string
}

/** Cek apakah string adalah UUID valid */
function isValidUUID(str: string | undefined | null): str is string {
  return Boolean(str && /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(str))
}

/** Sync user ke database dengan error handling yang lebih baik */
async function ensureUserExistsInDb(user: any): Promise<void> {
  if (!hasNeon || !user || !isValidUUID(user.id)) return

  try {
    console.log("Checking if user exists in database:", user.id)
    const sql = getDbClient()

    const existingUsers = await sql`SELECT id FROM users WHERE id = ${user.id}`

    if (existingUsers.length === 0) {
      console.log("User not found, inserting to database:", user.id)
      const userData: any = {
        id: user.id,
        username: user.username,
        name: user.name || null,
        role: user.role || "user",
        rw: user.rw || null,
        rt: user.rt || null,
      }

      await sql`
        INSERT INTO users (id, username, name, role, rw, rt)
        VALUES (
          ${userData.id},
          ${userData.username},
          ${userData.name},
          ${userData.role},
          ${userData.rw},
          ${userData.rt}
        )
        ON CONFLICT (id) DO NOTHING;
      `
      console.log("User successfully synced to database:", user.id)
    } else {
      console.log("User already exists in database:", user.id)
    }
  } catch (error) {
    console.error("Error syncing user to database:", error)
  }
}

/* ---------- LOCAL STORAGE FALLBACK ---------- */
const LS_KEY = "umkm"

const ls = {
  all(): UMKM[] {
    if (typeof window === "undefined") return []
    return JSON.parse(localStorage.getItem(LS_KEY) || "[]")
  },
  save(list: UMKM[]) {
    if (typeof window !== "undefined") localStorage.setItem(LS_KEY, JSON.stringify(list))
  },
}

export const umkmService = {
  /** GET ALL */
  async getAll(userId?: string, adminRW?: string): Promise<UMKM[]> {
    console.log("getAll called with userId:", userId, "adminRW:", adminRW)

    if (!hasNeon) {
      console.log("Using localStorage fallback")
      const allData = ls.all()
      if (adminRW) {
        const users = JSON.parse(localStorage.getItem("registered_users") || "[]")
        const rwUsers = users.filter((u: any) => u.rw === adminRW).map((u: any) => u.id)
        return allData.filter((item) => rwUsers.includes(item.user_id))
      }
      return userId ? allData.filter((item) => item.user_id === userId) : allData
    }

    try {
      const sql = getDbClient()
      let data: UMKM[] = []

      if (adminRW) {
        const rwUsers = await sql`SELECT id FROM users WHERE rw = ${adminRW}`
        if (rwUsers.length > 0) {
          const userIds = rwUsers.map((u) => u.id)
          data = await sql`SELECT * FROM umkm WHERE user_id = ANY(${userIds}::uuid[]) ORDER BY created_at DESC`
        }
      } else if (userId && isValidUUID(userId)) {
        data = await sql`SELECT * FROM umkm WHERE user_id = ${userId} ORDER BY created_at DESC`
      } else {
        // If no specific user or admin context, return empty
        return []
      }
      return data as UMKM[]
    } catch (error) {
      console.error("Neon error in getAll:", error)
      // Fallback ke localStorage
      return ls.all()
    }
  },

  /** CREATE */
  async create(payload: Omit<UMKM, "id" | "created_at" | "updated_at">, userId: string): Promise<UMKM | null> {
    console.log("create called with userId:", userId)

    if (!isValidUUID(userId)) {
      throw new Error("User ID tidak valid")
    }

    const dataWithUser = { ...payload, user_id: userId }

    if (!hasNeon) {
      console.log("Using localStorage for create")
      const list = ls.all()
      const newItem: UMKM = { ...dataWithUser, id: Date.now().toString() }
      ls.save([newItem, ...list])
      return newItem
    }

    try {
      await ensureUserExistsInDb(JSON.parse(localStorage.getItem("auth_user") || "{}"))

      const sql = getDbClient()
      const [inserted] = await sql`
        INSERT INTO umkm (
          nama_usaha, pemilik, nik_pemilik, no_hp, alamat_usaha, jenis_usaha, kategori_usaha,
          deskripsi_usaha, produk, kapasitas_produksi, satuan_produksi, periode_operasi,
          satuan_periode, hari_kerja_per_minggu, total_produksi, rab, biaya_tetap,
          biaya_variabel, modal_awal, target_pendapatan, jumlah_karyawan, status,
          tanggal_daftar, user_id
        ) VALUES (
          ${dataWithUser.nama_usaha}, ${dataWithUser.pemilik}, ${dataWithUser.nik_pemilik || null},
          ${dataWithUser.no_hp || null}, ${dataWithUser.alamat_usaha || null}, ${dataWithUser.jenis_usaha},
          ${dataWithUser.kategori_usaha || null}, ${dataWithUser.deskripsi_usaha || null},
          ${dataWithUser.produk || null}, ${dataWithUser.kapasitas_produksi || 0},
          ${dataWithUser.satuan_produksi || null}, ${dataWithUser.periode_operasi || 0},
          ${dataWithUser.satuan_periode || "bulan"}, ${dataWithUser.hari_kerja_per_minggu || 0},
          ${dataWithUser.total_produksi || 0}, ${dataWithUser.rab || 0},
          ${dataWithUser.biaya_tetap || 0}, ${dataWithUser.biaya_variabel || 0},
          ${dataWithUser.modal_awal || 0}, ${dataWithUser.target_pendapatan || 0},
          ${dataWithUser.jumlah_karyawan || 0}, ${dataWithUser.status},
          ${dataWithUser.tanggal_daftar || new Date().toISOString()}, ${dataWithUser.user_id}
        ) RETURNING *;
      `
      return inserted as UMKM
    } catch (error) {
      console.error("Neon error in create:", error)
      // Fallback ke localStorage jika ada error
      console.log("Falling back to localStorage due to error")
      const list = ls.all()
      const newItem: UMKM = { ...dataWithUser, id: Date.now().toString() }
      ls.save([newItem, ...list])
      return newItem
    }
  },

  /** UPDATE */
  async update(id: string, payload: Partial<UMKM>, userId: string): Promise<UMKM | null> {
    console.log("update called with userId:", userId)

    if (!isValidUUID(userId)) {
      throw new Error("User ID tidak valid")
    }

    if (!hasNeon) {
      const list = ls.all()
      const itemIndex = list.findIndex((u) => u.id === id && u.user_id === userId)
      if (itemIndex === -1) throw new Error("Data tidak ditemukan")

      list[itemIndex] = { ...list[itemIndex], ...payload }
      ls.save(list)
      return list[itemIndex]
    }

    try {
      const sql = getDbClient()
      const [updated] = await sql`
        UPDATE umkm SET
          nama_usaha = ${payload.nama_usaha},
          pemilik = ${payload.pemilik},
          nik_pemilik = ${payload.nik_pemilik || null},
          no_hp = ${payload.no_hp || null},
          alamat_usaha = ${payload.alamat_usaha || null},
          jenis_usaha = ${payload.jenis_usaha},
          kategori_usaha = ${payload.kategori_usaha || null},
          deskripsi_usaha = ${payload.deskripsi_usaha || null},
          produk = ${payload.produk || null},
          kapasitas_produksi = ${payload.kapasitas_produksi || 0},
          satuan_produksi = ${payload.satuan_produksi || null},
          periode_operasi = ${payload.periode_operasi || 0},
          satuan_periode = ${payload.satuan_periode || "bulan"},
          hari_kerja_per_minggu = ${payload.hari_kerja_per_minggu || 0},
          total_produksi = ${payload.total_produksi || 0},
          rab = ${payload.rab || 0},
          biaya_tetap = ${payload.biaya_tetap || 0},
          biaya_variabel = ${payload.biaya_variabel || 0},
          modal_awal = ${payload.modal_awal || 0},
          target_pendapatan = ${payload.target_pendapatan || 0},
          jumlah_karyawan = ${payload.jumlah_karyawan || 0},
          status = ${payload.status},
          updated_at = NOW()
        WHERE id = ${id} AND user_id = ${userId}
        RETURNING *;
      `
      return updated as UMKM
    } catch (error) {
      console.error("Neon error in update:", error)
      throw error
    }
  },

  /** DELETE */
  async delete(id: string, userId: string): Promise<boolean> {
    console.log("delete called with userId:", userId)

    if (!isValidUUID(userId)) {
      throw new Error("User ID tidak valid")
    }

    if (!hasNeon) {
      const list = ls.all()
      const filteredList = list.filter((u) => !(u.id === id && u.user_id === userId))
      if (filteredList.length === list.length) {
        throw new Error("Data tidak ditemukan")
      }
      ls.save(filteredList)
      return true
    }

    try {
      const sql = getDbClient()
      const result = await sql`DELETE FROM umkm WHERE id = ${id} AND user_id = ${userId};`
      return result.count > 0
    } catch (error) {
      console.error("Neon error in delete:", error)
      throw error
    }
  },

  /** GET BY ID */
  async getById(id: string, userId?: string): Promise<UMKM | null> {
    console.log("getById called with userId:", userId)

    if (!hasNeon) {
      const item = ls.all().find((u) => u.id === id)
      if (userId && item && item.user_id !== userId) {
        return null
      }
      return item || null
    }

    try {
      const sql = getDbClient()
      let data: UMKM[] = []
      if (userId && isValidUUID(userId)) {
        data = await sql`SELECT * FROM umkm WHERE id = ${id} AND user_id = ${userId}`
      } else {
        data = await sql`SELECT * FROM umkm WHERE id = ${id}`
      }
      return data.length > 0 ? (data[0] as UMKM) : null
    } catch (error) {
      console.error("Neon error in getById:", error)
      return null
    }
  },
}
