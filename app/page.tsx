"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { umkmService } from "@/lib/db"
import { useUser } from "@/lib/hooks/use-user"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useToast } from "@/hooks/use-toast"
import { HeaderWithAuth } from "@/components/header-with-auth"
import { NavigationWithAuth } from "@/components/navigation-with-auth"
import { Edit, Trash2, Download } from "lucide-react"

interface UMKM {
  id: string
  nama_usaha: string
  pemilik: string
  jenis_usaha: string
  nomor_hp: string
  status: string
  user_id: string
  created_at: string
  updated_at: string
}

export default function UMKMPage() {
  const router = useRouter()
  const { toast } = useToast()
  const { user, isLoading: isUserLoading } = useUser()
  const [umkms, setUmkms] = useState<UMKM[]>([])
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedJenis, setSelectedJenis] = useState("Semua Jenis")
  const [selectedStatus, setSelectedStatus] = useState("Semua Status")
  const [isLoadingData, setIsLoadingData] = useState(true)

  const fetchUmkms = async () => {
    setIsLoadingData(true)
    try {
      let fetchedUmkms: UMKM[] = []
      if (user) {
        // If user is admin (Ketua RW), fetch all UMKMs in their RW
        // Otherwise, fetch only UMKMs belonging to the current user
        if (user.user_metadata?.role === "admin" && user.user_metadata?.rw) {
          fetchedUmkms = await umkmService.getAll(undefined, user.user_metadata.rw)
        } else {
          fetchedUmkms = await umkmService.getAll(user.id)
        }
      }
      setUmkms(fetchedUmkms)
    } catch (error: any) {
      console.error("Error fetching UMKM data:", error)
      toast({
        title: "Error",
        description: `Gagal memuat data UMKM: ${error.message || "Terjadi kesalahan."}`,
        variant: "destructive",
      })
    } finally {
      setIsLoadingData(false)
    }
  }

  useEffect(() => {
    if (!isUserLoading) {
      fetchUmkms()
    }
  }, [user, isUserLoading]) // Re-fetch when user data changes

  const filteredUmkms = umkms.filter((umkm) => {
    const matchesSearch =
      umkm.nama_usaha.toLowerCase().includes(searchTerm.toLowerCase()) ||
      umkm.pemilik.toLowerCase().includes(searchTerm.toLowerCase()) ||
      umkm.jenis_usaha.toLowerCase().includes(searchTerm.toLowerCase()) ||
      umkm.nomor_hp.includes(searchTerm)

    const matchesJenis = selectedJenis === "Semua Jenis" || umkm.jenis_usaha === selectedJenis

    const matchesStatus = selectedStatus === "Semua Status" || umkm.status === selectedStatus

    return matchesSearch && matchesJenis && matchesStatus
  })

  const handleEdit = (id: string) => {
    router.push(`/umkm/edit/${id}`)
  }

  const handleDelete = async (id: string) => {
    if (!confirm("Apakah Anda yakin ingin menghapus data UMKM ini?")) {
      return
    }
    try {
      await umkmService.delete(id)
      toast({
        title: "Berhasil",
        description: "Data UMKM berhasil dihapus.",
      })
      fetchUmkms() // Refresh the list
    } catch (error: any) {
      console.error("Error deleting UMKM:", error)
      toast({
        title: "Error",
        description: `Gagal menghapus UMKM: ${error.message || "Terjadi kesalahan."}`,
        variant: "destructive",
      })
    }
  }

  const handleExportData = () => {
    // Implement export data logic here
    toast({
      title: "Fitur Belum Tersedia",
      description: "Fungsionalitas ekspor data akan segera hadir.",
    })
  }

  if (isUserLoading || isLoadingData) {
    return (
      <div className="flex min-h-screen flex-col">
        <HeaderWithAuth />
        <div className="flex flex-1">
          <NavigationWithAuth />
          <main className="flex-1 p-4 md:p-6">
            <p>Memuat data...</p>
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
            <h1 className="text-2xl font-semibold">Kelola Data UMKM</h1>
            <div className="flex gap-2">
              <Button variant="outline" onClick={handleExportData}>
                <Download className="mr-2 h-4 w-4" /> Export Data
              </Button>
              <Button onClick={() => router.push("/umkm/tambah")}>+ Tambah UMKM</Button>
            </div>
          </div>
          <p className="text-muted-foreground">Manajemen lengkap data UMKM mikro di wilayah Anda</p>

          <div className="mt-6 rounded-lg border bg-card p-4 text-card-foreground shadow-sm">
            <h2 className="text-lg font-semibold">Daftar UMKM Terdaftar</h2>
            <p className="text-sm text-muted-foreground">Kelola dan pantau semua UMKM mikro di wilayah Anda</p>
            <div className="mt-4 grid gap-4 md:grid-cols-3">
              <Input
                placeholder="Cari nama usaha, pemilik, jenis usaha, atau nomor HP..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="col-span-full md:col-span-1"
              />
              <Select value={selectedJenis} onValueChange={setSelectedJenis}>
                <SelectTrigger>
                  <SelectValue placeholder="Semua Jenis" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Semua Jenis">Semua Jenis</SelectItem>
                  <SelectItem value="Kuliner">Kuliner</SelectItem>
                  <SelectItem value="Kerajinan">Kerajinan</SelectItem>
                  <SelectItem value="Fashion">Fashion</SelectItem>
                  <SelectItem value="Otomotif">Otomotif</SelectItem>
                  <SelectItem value="Jasa">Jasa</SelectItem>
                  <SelectItem value="Lainnya">Lainnya</SelectItem>
                </SelectContent>
              </Select>
              <Select value={selectedStatus} onValueChange={setSelectedStatus}>
                <SelectTrigger>
                  <SelectValue placeholder="Semua Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Semua Status">Semua Status</SelectItem>
                  <SelectItem value="Aktif">Aktif</SelectItem>
                  <SelectItem value="Tidak Aktif">Tidak Aktif</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="mt-4 overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Nama Usaha</TableHead>
                    <TableHead>Pemilik</TableHead>
                    <TableHead>Jenis Usaha</TableHead>
                    <TableHead>Nomor HP</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Aksi</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredUmkms.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={6} className="text-center">
                        Tidak ada data UMKM ditemukan.
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredUmkms.map((umkm) => (
                      <TableRow key={umkm.id}>
                        <TableCell className="font-medium">{umkm.nama_usaha}</TableCell>
                        <TableCell>{umkm.pemilik}</TableCell>
                        <TableCell>
                          <span className="inline-flex items-center rounded-full bg-blue-100 px-2.5 py-0.5 text-xs font-medium text-blue-800">
                            {umkm.jenis_usaha}
                          </span>
                        </TableCell>
                        <TableCell>{umkm.nomor_hp}</TableCell>
                        <TableCell>
                          <span
                            className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${
                              umkm.status === "Aktif" ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"
                            }`}
                          >
                            {umkm.status}
                          </span>
                        </TableCell>
                        <TableCell>
                          <div className="flex gap-2">
                            <Button variant="outline" size="icon" onClick={() => handleEdit(umkm.id)}>
                              <Edit className="h-4 w-4" />
                              <span className="sr-only">Edit</span>
                            </Button>
                            <Button variant="destructive" size="icon" onClick={() => handleDelete(umkm.id)}>
                              <Trash2 className="h-4 w-4" />
                              <span className="sr-only">Delete</span>
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
          </div>
        </main>
      </div>
    </div>
  )
}
