import { neon, neonConfig } from "@neondatabase/serverless"
import { createClient } from "@supabase/supabase-js" // Added: Import createClient
import { validate as uuidValidate } from "uuid"

neonConfig.fetchConnectionCache = true

const hasNeon = process.env.DATABASE_URL !== undefined

// Initialize the database client based on environment
const sql = hasNeon ? neon(process.env.DATABASE_URL!) : undefined

// Supabase client initialization
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

let supabase: ReturnType<typeof createClient> | undefined

if (supabaseUrl && supabaseAnonKey) {
  supabase = createClient(supabaseUrl, supabaseAnonKey)
} else {
  console.warn("Supabase URL or Anon Key is not set. Supabase features will not work.")
}

// Mock database for local development without Neon
const localStorageDB = {
  umkms: typeof window !== "undefined" ? JSON.parse(localStorage.getItem("umkms") || "[]") : [],
  users: typeof window !== "undefined" ? JSON.parse(localStorage.getItem("users") || "[]") : [],
  save: function () {
    if (typeof window !== "undefined") {
      localStorage.setItem("umkms", JSON.stringify(this.umkms))
      localStorage.setItem("users", JSON.stringify(this.users))
    }
  },
}

// Helper to check if a value is a valid UUID
const isValidUUID = (uuid: string) => {
  // Only validate UUID if Neon is active (meaning DATABASE_URL is set)
  // If hasNeon is false, it means we are in a local dev environment without Neon DB,
  // and userId can be anything (e.g., simple string IDs from localStorage).
  // If hasNeon is true, it means we are using Neon DB, and userId must be a valid UUID.
  return hasNeon ? uuidValidate(uuid) : true
}

export const umkmService = {
  async getAll(userId?: string, rw?: string) {
    if (hasNeon && sql) {
      const query = userId
        ? sql`SELECT * FROM umkms WHERE user_id = ${userId} ORDER BY created_at DESC`
        : rw
          ? sql`SELECT u.* FROM umkms u JOIN users usr ON u.user_id = usr.id WHERE usr.rw = ${rw} ORDER BY u.created_at DESC`
          : sql`SELECT * FROM umkms ORDER BY u.created_at DESC`
      const umkms = await query
      return umkms.map((umkm) => ({
        id: umkm.id,
        nama_usaha: umkm.nama_usaha,
        pemilik: umkm.pemilik,
        jenis_usaha: umkm.jenis_usaha,
        nomor_hp: umkm.nomor_hp,
        status: umkm.status,
        user_id: umkm.user_id,
        created_at: umkm.created_at,
        updated_at: umkm.updated_at,
      }))
    } else {
      // LocalStorage logic
      let filteredUmkms = localStorageDB.umkms
      if (userId) {
        filteredUmkms = filteredUmkms.filter((umkm: any) => umkm.user_id === userId)
      } else if (rw) {
        const usersInRw = localStorageDB.users.filter((user: any) => user.rw === rw)
        const userIdsInRw = new Set(usersInRw.map((user: any) => user.id))
        filteredUmkms = filteredUmkms.filter((umkm: any) => userIdsInRw.has(umkm.user_id))
      }
      return filteredUmkms.sort((a: any, b: any) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
    }
  },

  async getById(id: string) {
    if (hasNeon && sql) {
      const umkm = await sql`SELECT * FROM umkms WHERE id = ${id} LIMIT 1`
      return umkm.length > 0
        ? {
            id: umkm[0].id,
            nama_usaha: umkm[0].nama_usaha,
            pemilik: umkm[0].pemilik,
            jenis_usaha: umkm[0].jenis_usaha,
            nomor_hp: umkm[0].nomor_hp,
            status: umkm[0].status,
            user_id: umkm[0].user_id,
            created_at: umkm[0].created_at,
            updated_at: umkm[0].updated_at,
          }
        : null
    } else {
      // LocalStorage logic
      return localStorageDB.umkms.find((umkm: any) => umkm.id === id) || null
    }
  },

  async create(umkmData: {
    nama_usaha: string
    pemilik: string
    jenis_usaha: string
    nomor_hp: string
    status: string
    userId: string
  }) {
    const { nama_usaha, pemilik, jenis_usaha, nomor_hp, status, userId } = umkmData

    // Validate userId only if Neon is active
    if (hasNeon && !isValidUUID(userId)) {
      throw new Error("User ID tidak valid")
    }

    if (hasNeon && sql) {
      const newUmkm = await sql`
        INSERT INTO umkms (nama_usaha, pemilik, jenis_usaha, nomor_hp, status, user_id)
        VALUES (${nama_usaha}, ${pemilik}, ${jenis_usaha}, ${nomor_hp}, ${status}, ${userId})
        RETURNING *
      `
      return {
        id: newUmkm[0].id,
        nama_usaha: newUmkm[0].nama_usaha,
        pemilik: newUmkm[0].pemilik,
        jenis_usaha: newUmkm[0].jenis_usaha,
        nomor_hp: newUmkm[0].nomor_hp,
        status: newUmkm[0].status,
        user_id: newUmkm[0].user_id,
        created_at: newUmkm[0].created_at,
        updated_at: newUmkm[0].updated_at,
      }
    } else {
      // LocalStorage logic
      const newId = (
        localStorageDB.umkms.length > 0 ? Math.max(...localStorageDB.umkms.map((u: any) => u.id)) + 1 : 1
      ).toString()
      const newUmkm = {
        id: newId,
        nama_usaha,
        pemilik,
        jenis_usaha,
        nomor_hp,
        status,
        user_id: userId,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      }
      localStorageDB.umkms.push(newUmkm)
      localStorageDB.save()
      return newUmkm
    }
  },

  async update(
    id: string,
    umkmData: {
      nama_usaha?: string
      pemilik?: string
      jenis_usaha?: string
      nomor_hp?: string
      status?: string
      userId?: string
    },
  ) {
    const { nama_usaha, pemilik, jenis_usaha, nomor_hp, status, userId } = umkmData

    // Validate userId only if Neon is active and userId is provided
    if (hasNeon && userId && !isValidUUID(userId)) {
      throw new Error("User ID tidak valid")
    }

    if (hasNeon && sql) {
      const updatedUmkm = await sql`
        UPDATE umkms
        SET
          nama_usaha = COALESCE(${nama_usaha || null}, nama_usaha),
          pemilik = COALESCE(${pemilik || null}, pemilik),
          jenis_usaha = COALESCE(${jenis_usaha || null}, jenis_usaha),
          nomor_hp = COALESCE(${nomor_hp || null}, nomor_hp),
          status = COALESCE(${status || null}, status),
          user_id = COALESCE(${userId || null}, user_id),
          updated_at = NOW()
        WHERE id = ${id}
        RETURNING *
      `
      return updatedUmkm.length > 0
        ? {
            id: updatedUmkm[0].id,
            nama_usaha: updatedUmkm[0].nama_usaha,
            pemilik: updatedUmkm[0].pemilik,
            jenis_usaha: updatedUmkm[0].jenis_usaha,
            nomor_hp: updatedUmkm[0].nomor_hp,
            status: updatedUmkm[0].status,
            user_id: updatedUmkm[0].user_id,
            created_at: updatedUmkm[0].created_at,
            updated_at: updatedUmkm[0].updated_at,
          }
        : null
    } else {
      // LocalStorage logic
      const index = localStorageDB.umkms.findIndex((umkm: any) => umkm.id === id)
      if (index !== -1) {
        const updated = {
          ...localStorageDB.umkms[index],
          ...umkmData,
          updated_at: new Date().toISOString(),
        }
        localStorageDB.umkms[index] = updated
        localStorageDB.save()
        return updated
      }
      return null
    }
  },

  async delete(id: string) {
    if (hasNeon && sql) {
      const deletedUmkm = await sql`
        DELETE FROM umkms
        WHERE id = ${id}
        RETURNING *
      `
      return deletedUmkm.length > 0
    } else {
      // LocalStorage logic
      const initialLength = localStorageDB.umkms.length
      localStorageDB.umkms = localStorageDB.umkms.filter((umkm: any) => umkm.id !== id)
      localStorageDB.save()
      return localStorageDB.umkms.length < initialLength
    }
  },
}

// Export the client for direct use if needed (e.g., in server actions)
export { sql, hasNeon, localStorageDB, supabase } // Added: Export supabase client
