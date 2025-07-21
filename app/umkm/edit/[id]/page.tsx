import { umkmService } from "@/lib/db"
import EditUMKMClient from "./EditUMKMClient"
import { notFound } from "next/navigation"

// This function generates static paths for UMKM edit pages.
// It's crucial for Next.js static export (output: 'export').
export async function generateStaticParams() {
  try {
    const allUmkms = await umkmService.getAll()
    const params = allUmkms.map((umkm) => ({ id: umkm.id.toString() }))
    console.log("generateStaticParams: Generated paths:", params)
    return params
  } catch (error) {
    console.error("generateStaticParams: Error fetching UMKM IDs:", error)
    return []
  }
}

export default async function EditUMKMPage({ params }: { params: { id: string } }) {
  const { id } = params
  let umkmData = null

  try {
    umkmData = await umkmService.getById(id)
    if (!umkmData) {
      console.log(`EditUMKMPage: UMKM with ID ${id} not found.`)
      notFound()
    }
  } catch (error) {
    console.error(`EditUMKMPage: Error fetching UMKM with ID ${id}:`, error)
    notFound()
  }

  return <EditUMKMClient initialUmkmData={umkmData} umkmId={id} />
}
