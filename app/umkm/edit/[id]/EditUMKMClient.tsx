"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { umkmService } from "@/lib/db"
import { useUser } from "@/lib/hooks/use-user"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useToast } from "@/hooks/use-toast"
import { HeaderWithAuth } from "@/components/header-with-auth"
import { NavigationWithAuth } from "@/components/navigation-with-auth"

interface EditUMKMClientProps {
  initialUmkmData: {
    id: string
    nama_usaha: string
    pemilik: string
    jenis_usaha: string
    nomor_hp: string
    status: string
    user_id: string
    created_at: string
    updated_at: string
  } | null
  umkmId: string
}

export default function EditUMKMClient({ initialUmkmData, umkmId }: EditUMKMClientProps) {
  const router = useRouter()
  const { toast } = useToast()
  const { user, isLoading: isUserLoading } = useUser()

  const [namaUsaha, setNamaUsaha] = useState(initialUmkmData?.nama_usaha || "")
  const [pemilik, setPemilik] = useState(initialUmkmData?.pemilik || "")
  const [jenisUsaha, setJenisUsaha] = useState(initialUmkmData?.jenis_usaha || "")
  const [nomorHp, setNomorHp] = useState(initialUmkmData?.nomor_hp || "")
  const [status, setStatus] = useState(initialUmkmData?.status || "Aktif")

  useEffect(() => {
    if (initialUmkmData) {
      setNamaUsaha(initialUmkmData.nama_usaha)
      setPemilik(initialUmkmData.pemilik)
      setJenisUsaha(initialUmkmData.jenis_usaha)
      setNomorHp(initialUmkmData.nomor_hp)
      setStatus(initialUmkmData.status)
    }
  }, [initialUmkmData])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!namaUsaha || !pemilik || !jenisUsaha || !nomorHp) {
      toast({
        title: "Validasi Gagal",
        description: "Semua kolom harus diisi.",
        variant: "destructive",
      })
      return
    }

    if (!user?.id) {
      toast({
        title: "Error",
        description: "User ID tidak ditemukan. Pastikan Anda sudah login.",
        variant: "destructive",
      })
      return
    }

    try {
      await umkmService.update(umkmId, {
        nama_usaha: namaUsaha,
        pemilik: pemilik,
        jenis_usaha: jenisUsaha,
        nomor_hp: nomorHp,
        status: status,
        userId: user.id,
      })
      toast({
        title: "Berhasil",
        description: "Data UMKM berhasil diperbarui.",
      })
      console.log("EditUMKMClient: UMKM updated successfully. Redirecting to /umkm.")
      router.push("/umkm")
    } catch (error: any) {
      console.error("EditUMKMClient: Error saving UMKM:", error)
      toast({
        title: "Error",
        description: `Gagal menyimpan UMKM: ${error.message || "Terjadi kesalahan."}`,
        variant: "destructive",
      })
    }
  }

  if (isUserLoading) {
    return (
      <div className="flex min-h-screen flex-col">
        <HeaderWithAuth />
        <div className="flex flex-1">
          <NavigationWithAuth />
          <main className="flex-1 p-4 md:p-6">
            <p>Loading user data...</p>
          </main>
        </div>
      </div>
    )
  }

  if (!initialUmkmData) {
    return (
      <div className="flex min-h-screen flex-col">
        <HeaderWithAuth />
        <div className="flex flex-1">
          <NavigationWithAuth />
          <main className="flex-1 p-4 md:p-6">
            <p>Data UMKM tidak ditemukan.</p>
          </main>
        </div>
      </div>
    )
  }

  return (
    <div className="flex min-h-screen flex-col">
      <HeaderWithAuth />
      <div className="flex flex-1">
        <NavigationWithAuth />
        <main className="flex-1 p-4 md:p-6">
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-semibold">Edit Data UMKM</h1>
          </div>
          <div className="mt-6 rounded-lg border bg-card p-4 text-card-foreground shadow-sm">
            <form onSubmit={handleSubmit} className="grid gap-4 md:grid-cols-2">
              <div className="grid gap-2">
                <Label htmlFor="namaUsaha">Nama Usaha</Label>
                <Input
                  id="namaUsaha"
                  value={namaUsaha}
                  onChange={(e) => setNamaUsaha(e.target.value)}
                  placeholder="Masukkan nama usaha"
                  required
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="pemilik">Pemilik</Label>
                <Input
                  id="pemilik"
                  value={pemilik}
                  onChange={(e) => setPemilik(e.target.value)}
                  placeholder="Masukkan nama pemilik"
                  required
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="jenisUsaha">Jenis Usaha</Label>
                <Select value={jenisUsaha} onValueChange={setJenisUsaha} required>
                  <SelectTrigger>
                    <SelectValue placeholder="Pilih jenis usaha" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Kuliner">Kuliner</SelectItem>
                    <SelectItem value="Kerajinan">Kerajinan</SelectItem>
                    <SelectItem value="Fashion">Fashion</SelectItem>
                    <SelectItem value="Otomotif">Otomotif</SelectItem>
                    <SelectItem value="Jasa">Jasa</SelectItem>
                    <SelectItem value="Lainnya">Lainnya</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="grid gap-2">
                <Label htmlFor="nomorHp">Nomor HP</Label>
                <Input
                  id="nomorHp"
                  value={nomorHp}
                  onChange={(e) => setNomorHp(e.target.value)}
                  placeholder="Masukkan nomor HP"
                  type="tel"
                  required
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="status">Status</Label>
                <Select value={status} onValueChange={setStatus} required>
                  <SelectTrigger>
                    <SelectValue placeholder="Pilih status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Aktif">Aktif</SelectItem>
                    <SelectItem value="Tidak Aktif">Tidak Aktif</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="col-span-full flex justify-end">
                <Button type="submit">Simpan Perubahan</Button>
              </div>
            </form>
          </div>
        </main>
      </div>
    </div>
  )
}
