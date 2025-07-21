import { umkmService, hasNeon } from "@/lib/db"
import EditUMKMClient from "./EditUMKMClient"

// generateStaticParams diperlukan untuk output: 'export' dengan rute dinamis
export async function generateStaticParams() {
  console.log("generateStaticParams: Starting...")
  console.log("generateStaticParams: hasNeon =", hasNeon)

  if (!hasNeon) {
    console.warn(
      "generateStaticParams: DATABASE_URL not set or Neon not configured. Returning dummy ID for static export.",
    )
    return [{ id: "dummy-id" }]
  }

  try {
    console.log("generateStaticParams: Attempting to fetch all UMKM from Neon DB.")
    const allUmkm = await umkmService.getAll()
    console.log(`generateStaticParams: Fetched ${allUmkm.length} UMKM items.`)

    if (allUmkm.length === 0) {
      console.log("generateStaticParams: No UMKM data found in DB. Returning dummy ID.")
      return [{ id: "dummy-id" }]
    }

    const paths = allUmkm.map((umkm) => ({
      id: umkm.id!,
    }))
    console.log("generateStaticParams: Generated paths:", paths)
    return paths
  } catch (error) {
    console.error("generateStaticParams: Error fetching UMKM for static params:", error)
    return [{ id: "error-fallback-id" }]
  }
}

export default function EditUMKM() {
  // EditUMKMClient akan menangani HeaderWithAuth dan NavigationWithAuth
  return <EditUMKMClient />
}
