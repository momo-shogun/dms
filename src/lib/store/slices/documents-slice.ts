// Documents Slice with Redux Toolkit - MOCKED (no real API)

import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit'
import { Document, Folder, Section, DocumentViewMode, FilterState } from '../../types'

// Mock documents data
const mockDocumentsData: Document[] = [
  {
    id: '1',
    name: 'Project Proposal Q4 2024.pdf',
    type: 'pdf',
    size: 2457600,
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
    size: 1887437,
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
    size: 239616,
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
    size: 15942467,
    url: '/documents/design-mockups.zip',
    folderId: 'f3',
    tags: ['design', 'mockups', 'ui'],
    createdAt: new Date('2024-11-13T10:00:00Z'),
    updatedAt: new Date('2024-11-13T11:20:00Z'),
    createdBy: 'user4',
  },
]

// Mock folders data
const mockFoldersData: Folder[] = [
  {
    id: 'f1',
    name: 'Inbox',
    description: 'New documents',
    documentCount: 2,
    isShared: false,
    createdAt: new Date(),
    updatedAt: new Date(),
    createdBy: 'user1',
  },
  {
    id: 'f2',
    name: 'Projects',
    description: 'Project documents',
    documentCount: 1,
    isShared: false,
    createdAt: new Date(),
    updatedAt: new Date(),
    createdBy: 'user1',
  },
  {
    id: 'f3',
    name: 'Design',
    description: 'Design files',
    documentCount: 1,
    isShared: false,
    createdAt: new Date(),
    updatedAt: new Date(),
    createdBy: 'user1',
  },
]

interface DocumentsState {
  documents: Document[]
  folders: Folder[]
  sections: Section[]
  selectedDocument: Document | null
  viewMode: DocumentViewMode
  filters: FilterState
  isLoading: boolean
  error: string | null
  currentFolder: string | null
}

const initialFilters: FilterState = {
  search: '',
  tags: [],
  dateRange: {},
  fileTypes: [],
}

const initialSections: Section[] = [
  {
    id: 's1',
    name: 'Inbox',
    description: 'New documents',
    folders: [],
    order: 1,
    isSystem: true,
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: 's2',
    name: 'Documents',
    description: 'Organized documents',
    folders: [],
    order: 2,
    isSystem: false,
    createdAt: new Date(),
    updatedAt: new Date(),
  },
]

const initialState: DocumentsState = {
  documents: [],
  folders: [],
  sections: initialSections,
  selectedDocument: null,
  viewMode: { type: 'grid' },
  filters: initialFilters,
  isLoading: false,
  error: null,
  currentFolder: null,
}

// Async thunks - MOCKED (no real API calls)
export const fetchDocumentsAsync = createAsyncThunk(
  'documents/fetchDocuments',
  async (params: any = {}, { rejectWithValue }) => {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 500))
    
    // Mock fetch documents - return mock data
    let documents = [...mockDocumentsData]
    
    // Apply filters if provided
    if (params.folderId) {
      documents = documents.filter(doc => doc.folderId === params.folderId)
    }
    
    if (params.search) {
      const searchTerm = params.search.toLowerCase()
      documents = documents.filter(doc =>
        doc.name.toLowerCase().includes(searchTerm) ||
        doc.tags.some(tag => tag.toLowerCase().includes(searchTerm))
      )
    }
    
    return documents
  }
)

export const fetchDocumentAsync = createAsyncThunk(
  'documents/fetchDocument',
  async (id: string, { rejectWithValue }) => {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 300))
    
    // Mock fetch single document
    const document = mockDocumentsData.find(doc => doc.id === id)
    
    if (!document) {
      return rejectWithValue('Document not found')
    }
    
    return document
  }
)

export const createDocumentAsync = createAsyncThunk(
  'documents/createDocument',
  async (data: any, { rejectWithValue }) => {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 500))
    
    // Mock create document
    const newDocument: Document = {
      id: `doc_${Date.now()}`,
      name: data.name || 'New Document',
      type: data.type || 'pdf',
      size: data.size || 0,
      url: `/documents/${data.name || 'new-document'}`,
      folderId: data.folderId,
      tags: data.tags || [],
      createdAt: new Date(),
      updatedAt: new Date(),
      createdBy: 'current-user',
    }
    
    // Add to mock data
    mockDocumentsData.push(newDocument)
    
    return newDocument
  }
)

export const updateDocumentAsync = createAsyncThunk(
  'documents/updateDocument',
  async ({ id, data }: { id: string; data: any }, { rejectWithValue }) => {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 400))
    
    // Mock update document
    const index = mockDocumentsData.findIndex(doc => doc.id === id)
    
    if (index === -1) {
      return rejectWithValue('Document not found')
    }
    
    const updatedDocument = {
      ...mockDocumentsData[index],
      ...data,
      updatedAt: new Date(),
    }
    
    mockDocumentsData[index] = updatedDocument
    
    return updatedDocument
  }
)

export const deleteDocumentAsync = createAsyncThunk(
  'documents/deleteDocument',
  async (id: string, { rejectWithValue }) => {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 300))
    
    // Mock delete document
    const index = mockDocumentsData.findIndex(doc => doc.id === id)
    
    if (index === -1) {
      return rejectWithValue('Document not found')
    }
    
    mockDocumentsData.splice(index, 1)
    
    return id
  }
)

export const uploadDocumentAsync = createAsyncThunk(
  'documents/uploadDocument',
  async ({ file, folderId }: { file: File; folderId?: string }, { rejectWithValue }) => {
    // Simulate upload delay
    await new Promise(resolve => setTimeout(resolve, 1000))
    
    // Mock upload document
    const newDocument: Document = {
      id: `doc_${Date.now()}`,
      name: file.name,
      type: file.name.split('.').pop() || 'unknown',
      size: file.size,
      url: `/documents/${file.name}`,
      folderId: folderId,
      tags: [],
      createdAt: new Date(),
      updatedAt: new Date(),
      createdBy: 'current-user',
    }
    
    // Add to mock data
    mockDocumentsData.push(newDocument)
    
    return newDocument
  }
)

// Folder async thunks - MOCKED
export const fetchFoldersAsync = createAsyncThunk(
  'documents/fetchFolders',
  async (_, { rejectWithValue }) => {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 400))
    
    // Mock fetch folders - return mock data
    return [...mockFoldersData]
  }
)

export const createFolderAsync = createAsyncThunk(
  'documents/createFolder',
  async (data: any, { rejectWithValue }) => {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 400))
    
    // Mock create folder
    const newFolder: Folder = {
      id: `f${Date.now()}`,
      name: data.name || 'New Folder',
      description: data.description || '',
      documentCount: 0,
      isShared: data.isShared || false,
      createdAt: new Date(),
      updatedAt: new Date(),
      createdBy: 'current-user',
    }
    
    // Add to mock data
    mockFoldersData.push(newFolder)
    
    return newFolder
  }
)

export const updateFolderAsync = createAsyncThunk(
  'documents/updateFolder',
  async ({ id, data }: { id: string; data: any }, { rejectWithValue }) => {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 300))
    
    // Mock update folder
    const index = mockFoldersData.findIndex(folder => folder.id === id)
    
    if (index === -1) {
      return rejectWithValue('Folder not found')
    }
    
    const updatedFolder = {
      ...mockFoldersData[index],
      ...data,
      updatedAt: new Date(),
    }
    
    mockFoldersData[index] = updatedFolder
    
    return updatedFolder
  }
)

export const deleteFolderAsync = createAsyncThunk(
  'documents/deleteFolder',
  async (id: string, { rejectWithValue }) => {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 300))
    
    // Mock delete folder
    const index = mockFoldersData.findIndex(folder => folder.id === id)
    
    if (index === -1) {
      return rejectWithValue('Folder not found')
    }
    
    mockFoldersData.splice(index, 1)
    
    return id
  }
)

// Documents slice
const documentsSlice = createSlice({
  name: 'documents',
  initialState,
  reducers: {
    // UI actions
    setSelectedDocument: (state, action: PayloadAction<Document | null>) => {
      state.selectedDocument = action.payload
    },
    setViewMode: (state, action: PayloadAction<DocumentViewMode>) => {
      state.viewMode = action.payload
    },
    setFilters: (state, action: PayloadAction<Partial<FilterState>>) => {
      state.filters = { ...state.filters, ...action.payload }
    },
    setCurrentFolder: (state, action: PayloadAction<string | null>) => {
      state.currentFolder = action.payload
    },
    clearError: (state) => {
      state.error = null
    },

    // Section actions (client-side)
    addSection: (state, action: PayloadAction<string>) => {
      const newSection: Section = {
        id: `s${Date.now()}`,
        name: action.payload,
        description: '',
        folders: [],
        order: state.sections.length + 1,
        isSystem: false,
        createdAt: new Date(),
        updatedAt: new Date(),
      }
      state.sections.push(newSection)
    },
    updateSection: (state, action: PayloadAction<{ id: string; name: string }>) => {
      const { id, name } = action.payload
      const section = state.sections.find(s => s.id === id)
      if (section) {
        section.name = name
        section.updatedAt = new Date()
      }
    },
    deleteSection: (state, action: PayloadAction<string>) => {
      state.sections = state.sections.filter(section => 
        section.id !== action.payload && !section.isSystem
      )
    },
  },
  extraReducers: (builder) => {
    // Fetch documents
    builder
      .addCase(fetchDocumentsAsync.pending, (state) => {
        state.isLoading = true
        state.error = null
      })
      .addCase(fetchDocumentsAsync.fulfilled, (state, action) => {
        state.isLoading = false
        state.documents = action.payload
        state.error = null
      })
      .addCase(fetchDocumentsAsync.rejected, (state, action) => {
        state.isLoading = false
        state.error = action.payload as string
      })

    // Fetch document
    builder
      .addCase(fetchDocumentAsync.pending, (state) => {
        state.isLoading = true
        state.error = null
      })
      .addCase(fetchDocumentAsync.fulfilled, (state, action) => {
        state.isLoading = false
        state.selectedDocument = action.payload
        state.error = null
      })
      .addCase(fetchDocumentAsync.rejected, (state, action) => {
        state.isLoading = false
        state.error = action.payload as string
      })

    // Create document
    builder
      .addCase(createDocumentAsync.pending, (state) => {
        state.isLoading = true
        state.error = null
      })
      .addCase(createDocumentAsync.fulfilled, (state, action) => {
        state.isLoading = false
        state.documents.push(action.payload)
        state.error = null
      })
      .addCase(createDocumentAsync.rejected, (state, action) => {
        state.isLoading = false
        state.error = action.payload as string
      })

    // Update document
    builder
      .addCase(updateDocumentAsync.fulfilled, (state, action) => {
        const index = state.documents.findIndex(doc => doc.id === action.payload.id)
        if (index !== -1) {
          state.documents[index] = action.payload
        }
        if (state.selectedDocument?.id === action.payload.id) {
          state.selectedDocument = action.payload
        }
        state.error = null
      })
      .addCase(updateDocumentAsync.rejected, (state, action) => {
        state.error = action.payload as string
      })

    // Delete document
    builder
      .addCase(deleteDocumentAsync.fulfilled, (state, action) => {
        state.documents = state.documents.filter(doc => doc.id !== action.payload)
        if (state.selectedDocument?.id === action.payload) {
          state.selectedDocument = null
        }
        state.error = null
      })
      .addCase(deleteDocumentAsync.rejected, (state, action) => {
        state.error = action.payload as string
      })

    // Upload document
    builder
      .addCase(uploadDocumentAsync.pending, (state) => {
        state.isLoading = true
        state.error = null
      })
      .addCase(uploadDocumentAsync.fulfilled, (state, action) => {
        state.isLoading = false
        state.documents.push(action.payload)
        state.error = null
      })
      .addCase(uploadDocumentAsync.rejected, (state, action) => {
        state.isLoading = false
        state.error = action.payload as string
      })

    // Fetch folders
    builder
      .addCase(fetchFoldersAsync.pending, (state) => {
        state.isLoading = true
        state.error = null
      })
      .addCase(fetchFoldersAsync.fulfilled, (state, action) => {
        state.isLoading = false
        state.folders = action.payload
        state.error = null
      })
      .addCase(fetchFoldersAsync.rejected, (state, action) => {
        state.isLoading = false
        state.error = action.payload as string
      })

    // Create folder
    builder
      .addCase(createFolderAsync.fulfilled, (state, action) => {
        state.folders.push(action.payload)
        state.error = null
      })
      .addCase(createFolderAsync.rejected, (state, action) => {
        state.error = action.payload as string
      })

    // Update folder
    builder
      .addCase(updateFolderAsync.fulfilled, (state, action) => {
        const index = state.folders.findIndex(folder => folder.id === action.payload.id)
        if (index !== -1) {
          state.folders[index] = action.payload
        }
        state.error = null
      })
      .addCase(updateFolderAsync.rejected, (state, action) => {
        state.error = action.payload as string
      })

    // Delete folder
    builder
      .addCase(deleteFolderAsync.fulfilled, (state, action) => {
        state.folders = state.folders.filter(folder => folder.id !== action.payload)
        state.error = null
      })
      .addCase(deleteFolderAsync.rejected, (state, action) => {
        state.error = action.payload as string
      })
  },
})

export const {
  setSelectedDocument,
  setViewMode,
  setFilters,
  setCurrentFolder,
  clearError,
  addSection,
  updateSection,
  deleteSection,
} = documentsSlice.actions

export default documentsSlice.reducer

// Selectors
export const selectDocuments = (state: { documents: DocumentsState }) => state.documents.documents
export const selectFolders = (state: { documents: DocumentsState }) => state.documents.folders
export const selectSections = (state: { documents: DocumentsState }) => state.documents.sections
export const selectSelectedDocument = (state: { documents: DocumentsState }) => state.documents.selectedDocument
export const selectViewMode = (state: { documents: DocumentsState }) => state.documents.viewMode
export const selectFilters = (state: { documents: DocumentsState }) => state.documents.filters
export const selectIsLoading = (state: { documents: DocumentsState }) => state.documents.isLoading
export const selectError = (state: { documents: DocumentsState }) => state.documents.error
export const selectCurrentFolder = (state: { documents: DocumentsState }) => state.documents.currentFolder
