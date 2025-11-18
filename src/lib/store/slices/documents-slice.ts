// Documents Slice with Redux Toolkit

import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit'
import { Document, Folder, Section, DocumentViewMode, FilterState } from '../../types'
import { documentsApi, foldersApi } from '../../api/client'

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

// Async thunks for API calls
export const fetchDocumentsAsync = createAsyncThunk(
  'documents/fetchDocuments',
  async (params: any = {}, { rejectWithValue }) => {
    try {
      const response = await documentsApi.getAll(params)
      
      if (response.success && response.data) {
        return Array.isArray(response.data) ? response.data : response.data.data || []
      } else {
        return rejectWithValue(response.message || 'Failed to fetch documents')
      }
    } catch (error: any) {
      return rejectWithValue(error.message || 'Failed to fetch documents')
    }
  }
)

export const fetchDocumentAsync = createAsyncThunk(
  'documents/fetchDocument',
  async (id: string, { rejectWithValue }) => {
    try {
      const response = await documentsApi.getById(id)
      
      if (response.success && response.data) {
        return response.data as Document
      } else {
        return rejectWithValue(response.message || 'Failed to fetch document')
      }
    } catch (error: any) {
      return rejectWithValue(error.message || 'Failed to fetch document')
    }
  }
)

export const createDocumentAsync = createAsyncThunk(
  'documents/createDocument',
  async (data: any, { rejectWithValue }) => {
    try {
      const response = await documentsApi.create(data)
      
      if (response.success && response.data) {
        return response.data as Document
      } else {
        return rejectWithValue(response.message || 'Failed to create document')
      }
    } catch (error: any) {
      return rejectWithValue(error.message || 'Failed to create document')
    }
  }
)

export const updateDocumentAsync = createAsyncThunk(
  'documents/updateDocument',
  async ({ id, data }: { id: string; data: any }, { rejectWithValue }) => {
    try {
      const response = await documentsApi.update(id, data)
      
      if (response.success && response.data) {
        return response.data as Document
      } else {
        return rejectWithValue(response.message || 'Failed to update document')
      }
    } catch (error: any) {
      return rejectWithValue(error.message || 'Failed to update document')
    }
  }
)

export const deleteDocumentAsync = createAsyncThunk(
  'documents/deleteDocument',
  async (id: string, { rejectWithValue }) => {
    try {
      const response = await documentsApi.delete(id)
      
      if (response.success) {
        return id
      } else {
        return rejectWithValue(response.message || 'Failed to delete document')
      }
    } catch (error: any) {
      return rejectWithValue(error.message || 'Failed to delete document')
    }
  }
)

export const uploadDocumentAsync = createAsyncThunk(
  'documents/uploadDocument',
  async ({ file, folderId }: { file: File; folderId?: string }, { rejectWithValue }) => {
    try {
      const response = await documentsApi.upload(file, folderId)
      
      if (response.success && response.data) {
        return response.data as Document
      } else {
        return rejectWithValue(response.message || 'Failed to upload document')
      }
    } catch (error: any) {
      return rejectWithValue(error.message || 'Failed to upload document')
    }
  }
)

// Folder async thunks
export const fetchFoldersAsync = createAsyncThunk(
  'documents/fetchFolders',
  async (_, { rejectWithValue }) => {
    try {
      const response = await foldersApi.getAll()
      
      if (response.success && response.data) {
        return Array.isArray(response.data) ? response.data : []
      } else {
        return rejectWithValue(response.message || 'Failed to fetch folders')
      }
    } catch (error: any) {
      return rejectWithValue(error.message || 'Failed to fetch folders')
    }
  }
)

export const createFolderAsync = createAsyncThunk(
  'documents/createFolder',
  async (data: any, { rejectWithValue }) => {
    try {
      const response = await foldersApi.create(data)
      
      if (response.success && response.data) {
        return response.data as Folder
      } else {
        return rejectWithValue(response.message || 'Failed to create folder')
      }
    } catch (error: any) {
      return rejectWithValue(error.message || 'Failed to create folder')
    }
  }
)

export const updateFolderAsync = createAsyncThunk(
  'documents/updateFolder',
  async ({ id, data }: { id: string; data: any }, { rejectWithValue }) => {
    try {
      const response = await foldersApi.update(id, data)
      
      if (response.success && response.data) {
        return response.data as Folder
      } else {
        return rejectWithValue(response.message || 'Failed to update folder')
      }
    } catch (error: any) {
      return rejectWithValue(error.message || 'Failed to update folder')
    }
  }
)

export const deleteFolderAsync = createAsyncThunk(
  'documents/deleteFolder',
  async (id: string, { rejectWithValue }) => {
    try {
      const response = await foldersApi.delete(id)
      
      if (response.success) {
        return id
      } else {
        return rejectWithValue(response.message || 'Failed to delete folder')
      }
    } catch (error: any) {
      return rejectWithValue(error.message || 'Failed to delete folder')
    }
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
