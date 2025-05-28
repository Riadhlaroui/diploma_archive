/* eslint-disable @typescript-eslint/no-explicit-any */
import pb from "@/lib/pocketbase"

export interface DocumentTypeList {
  id: string
  name: string 
  createdAt: string
  updatedAt?: string
}

export async function addDocumentType(name: string) {
  try {
    const record = await pb.collection("Document_types").create({
      name,
    })

    console.log("Document type added:", record)
    return record
  } catch (error) {
    console.error("Error adding document type:", error)
    throw error
  }
}

export async function deleteDocumentType(id: string) {
  try {
    await pb.collection("Document_types").delete(id)
    console.log(`Document type with ID ${id} deleted successfully.`)
  } catch (error) {
    console.error(`Error deleting document type with ID ${id}:`, error)
    throw error
  }
}

export async function getDocumentTypeByName(name: string) {
  try {
    const result = await pb.collection("Document_types").getFirstListItem(`name="${name}"`)
    return result
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
  } catch (error) {
    return null // Not found is okay
  }
}

export async function getDocumentTypeById(typeId: string) {
  try {
    const documentType = await pb.collection("Document_types").getOne(typeId)
    return documentType
  } catch (error) {
    console.error("Error fetching document type:", error)
    return null
  }
}

export async function updateDocumentType(id: string, data: { name: string }) {
  return await pb.collection("Document_types").update(id, data)
}

export async function getDocumentTypes(
  page = 1,
  perPage = 50,
  searchTerm = "",
): Promise<{ items: DocumentTypeList[]; totalPages: number }> {
  const filter = searchTerm ? `name ~ "${searchTerm}"` : ""

  const documentTypesResponse = await pb.collection("Document_types").getList(page, perPage, {
    sort: "name", // Sort alphabetically by name
    filter: filter || undefined, // only include filter if it's not empty
  })

  const items = documentTypesResponse.items.map((docType: any) => ({
    id: docType.id,
    name: docType.name,
    createdAt: docType.created,
    updatedAt: docType.updated,
  }))

  return {
    items,
    totalPages: documentTypesResponse.totalPages,
  }
}

export async function getAllDocumentTypes(): Promise<DocumentTypeList[]> {
  try {
    const documentTypes = await pb.collection("Document_types").getFullList({
      sort: "name", // Sort alphabetically by name
    })

    return documentTypes.map((docType: any) => ({
      id: docType.id,
      name: docType.name,
      createdAt: docType.created,
      updatedAt: docType.updated,
    }))
  } catch (error) {
    console.error("Error fetching all document types:", error)
    throw error
  }
}
