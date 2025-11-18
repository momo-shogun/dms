// Documents API Route - GET (list) and POST (create)

import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'

const createDocumentSchema = z.object({
  name: z.string().min(1, 'Document name is required'),
  type: z.string().min(1, 'Document type is required'),
  size: z.number().positive('Size must be positive'),
  folderId: z.string().optional(),
  tags: z.array(z.string()).default([]),
})

const querySchema = z.object({
  page: z.string().transform(Number).optional().default('1'),
  limit: z.string().transform(Number).optional().default('10'),
  search: z.string().optional(),
  folderId: z.string().optional(),
  type: z.string().optional(),
  sortBy: z.enum(['name', 'size', 'lastModified', 'createdAt']).optional().default('lastModified'),
  sortOrder: z.enum(['asc', 'desc']).optional().default('desc'),
})

// Mock documents data
let mockDocuments = [
  {
    id: '1',
    name: 'Project Proposal Q4 2024.pdf',
    type: 'pdf',
    size: 2457600, // 2.4 MB
    url: '/documents/project-proposal-q4-2024.pdf',
    folderId: 'f1',
    tags: ['project', 'proposal', 'q4'],
    createdAt: new Date('2024-11-10T08:15:00Z'),
    updatedAt: new Date('2024-11-15T10:30:00Z'),
    createdBy: 'user1',
  },
  {
    id: '2',
    name: 'Budget Analysis.xlsx',
    type: 'xlsx',
    size: 1887437, // 1.8 MB
    url: '/documents/budget-analysis.xlsx',
    folderId: 'f2',
    tags: ['budget', 'analysis', 'finance'],
    createdAt: new Date('2024-11-12T14:30:00Z'),
    updatedAt: new Date('2024-11-15T08:20:00Z'),
    createdBy: 'user2',
  },
  {
    id: '3',
    name: 'Team Meeting Notes.docx',
    type: 'docx',
    size: 239616, // 234 KB
    url: '/documents/team-meeting-notes.docx',
    folderId: 'f1',
    tags: ['meeting', 'notes', 'team'],
    createdAt: new Date('2024-11-14T16:00:00Z'),
    updatedAt: new Date('2024-11-14T16:45:00Z'),
    createdBy: 'user3',
  },
  {
    id: '4',
    name: 'Design Mockups.zip',
    type: 'zip',
    size: 15942467, // 15.2 MB
    url: '/documents/design-mockups.zip',
    folderId: 'f3',
    tags: ['design', 'mockups', 'ui'],
    createdAt: new Date('2024-11-13T10:00:00Z'),
    updatedAt: new Date('2024-11-13T11:20:00Z'),
    createdBy: 'user4',
  },
]

// Helper function to verify authentication (mock)
function verifyAuth(request: NextRequest) {
  const token = request.cookies.get('auth_token')?.value
  
  if (!token) {
    return null
  }

  // In production, verify JWT token and return user info
  return {
    id: 'user1',
    email: 'user@example.com',
    role: 'user',
  }
}

// GET /api/documents - List documents with pagination and filtering
export async function GET(request: NextRequest) {
  try {
    const user = verifyAuth(request)
    
    if (!user) {
      return NextResponse.json(
        { success: false, message: 'Unauthorized' },
        { status: 401 }
      )
    }

    const { searchParams } = new URL(request.url)
    const query = querySchema.parse({
      page: searchParams.get('page') || '1',
      limit: searchParams.get('limit') || '10',
      search: searchParams.get('search'),
      folderId: searchParams.get('folderId'),
      type: searchParams.get('type'),
      sortBy: searchParams.get('sortBy') || 'lastModified',
      sortOrder: searchParams.get('sortOrder') || 'desc',
    })

    let filteredDocuments = [...mockDocuments]

    // Apply search filter
    if (query.search) {
      const searchTerm = query.search.toLowerCase()
      filteredDocuments = filteredDocuments.filter(doc =>
        doc.name.toLowerCase().includes(searchTerm) ||
        doc.tags.some(tag => tag.toLowerCase().includes(searchTerm))
      )
    }

    // Apply folder filter
    if (query.folderId) {
      filteredDocuments = filteredDocuments.filter(doc => doc.folderId === query.folderId)
    }

    // Apply type filter
    if (query.type) {
      filteredDocuments = filteredDocuments.filter(doc => doc.type === query.type)
    }

    // Apply sorting
    filteredDocuments.sort((a, b) => {
      let aValue: any, bValue: any

      switch (query.sortBy) {
        case 'name':
          aValue = a.name.toLowerCase()
          bValue = b.name.toLowerCase()
          break
        case 'size':
          aValue = a.size
          bValue = b.size
          break
        case 'lastModified':
          aValue = new Date(a.updatedAt)
          bValue = new Date(b.updatedAt)
          break
        case 'createdAt':
          aValue = new Date(a.createdAt)
          bValue = new Date(b.createdAt)
          break
        default:
          aValue = new Date(a.updatedAt)
          bValue = new Date(b.updatedAt)
      }

      if (query.sortOrder === 'asc') {
        return aValue < bValue ? -1 : aValue > bValue ? 1 : 0
      } else {
        return aValue > bValue ? -1 : aValue < bValue ? 1 : 0
      }
    })

    // Apply pagination
    const startIndex = (query.page - 1) * query.limit
    const endIndex = startIndex + query.limit
    const paginatedDocuments = filteredDocuments.slice(startIndex, endIndex)

    const totalPages = Math.ceil(filteredDocuments.length / query.limit)

    return NextResponse.json({
      success: true,
      data: paginatedDocuments,
      pagination: {
        page: query.page,
        limit: query.limit,
        total: filteredDocuments.length,
        totalPages,
      },
    })

  } catch (error) {
    console.error('Documents GET error:', error)

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        {
          success: false,
          message: 'Invalid query parameters',
          errors: error.errors,
        },
        { status: 400 }
      )
    }

    return NextResponse.json(
      { success: false, message: 'Internal server error' },
      { status: 500 }
    )
  }
}

// POST /api/documents - Create new document
export async function POST(request: NextRequest) {
  try {
    const user = verifyAuth(request)
    
    if (!user) {
      return NextResponse.json(
        { success: false, message: 'Unauthorized' },
        { status: 401 }
      )
    }

    const body = await request.json()
    const validatedData = createDocumentSchema.parse(body)

    // In production, you would:
    // 1. Validate file upload
    // 2. Store file in cloud storage (S3, etc.)
    // 3. Save document metadata to database
    // 4. Generate secure URL

    const newDocument = {
      id: `doc_${Date.now()}`,
      ...validatedData,
      url: `/documents/${validatedData.name}`,
      createdAt: new Date(),
      updatedAt: new Date(),
      createdBy: user.id,
    }

    mockDocuments.push(newDocument)

    return NextResponse.json({
      success: true,
      data: newDocument,
      message: 'Document created successfully',
    }, { status: 201 })

  } catch (error) {
    console.error('Documents POST error:', error)

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        {
          success: false,
          message: 'Validation failed',
          errors: error.errors,
        },
        { status: 400 }
      )
    }

    return NextResponse.json(
      { success: false, message: 'Internal server error' },
      { status: 500 }
    )
  }
}
