# Redux Store Architecture

This document explains the Redux store structure and how it's organized for scalability and future RTK Query integration.

## 📁 Structure

```
src/lib/store/
├── store.ts                 # Main store configuration
├── slices/
│   ├── auth-slice.ts       # Authentication state management
│   └── documents-slice.ts  # Documents state management
└── README.md               # This file
```

## 🏗️ Store Configuration

### Main Store (`store.ts`)
- Configures Redux store with RTK
- Sets up typed hooks (`useAppDispatch`, `useAppSelector`)
- Handles localStorage persistence
- Middleware configuration for serialization

### Auth Slice (`auth-slice.ts`)
- Manages authentication state
- Async thunks for login, register, logout
- Local storage integration for tokens
- Error handling for auth operations

### Documents Slice (`documents-slice.ts`)
- Manages documents, folders, and sections
- Async thunks for CRUD operations
- UI state management (view mode, filters)
- Mock data integration

## 🔄 Usage Patterns

### In Components

```typescript
import { useAppDispatch, useAppSelector } from '@/src/lib/store/store'
import { loginAsync, selectAuth } from '@/src/lib/store/slices/auth-slice'

function LoginComponent() {
  const dispatch = useAppDispatch()
  const { isLoading, error } = useAppSelector(selectAuth)

  const handleLogin = async (credentials) => {
    const result = await dispatch(loginAsync(credentials))
    if (loginAsync.fulfilled.match(result)) {
      // Handle success
    }
  }
}
```

### Async Operations

```typescript
// Dispatching async actions
dispatch(fetchDocumentsAsync({ page: 1, limit: 10 }))

// Handling results
const result = await dispatch(createDocumentAsync(documentData))
if (createDocumentAsync.fulfilled.match(result)) {
  console.log('Document created:', result.payload)
}
```

## 💾 Local Storage Persistence

The store automatically persists authentication state to localStorage:

- **Persisted**: `auth.user`, `auth.isAuthenticated`
- **Not Persisted**: Documents data (fetched fresh on app load)

## 🚀 RTK Query Integration (Future)

When ready to add RTK Query, follow this migration path:

### 1. Install RTK Query
```bash
npm install @reduxjs/toolkit
```

### 2. Create API Slice
```typescript
// src/lib/store/api/api-slice.ts
import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react'

export const apiSlice = createApi({
  reducerPath: 'api',
  baseQuery: fetchBaseQuery({
    baseUrl: '/api',
    prepareHeaders: (headers, { getState }) => {
      const token = localStorage.getItem('auth_token')
      if (token) {
        headers.set('authorization', `Bearer ${token}`)
      }
      return headers
    },
  }),
  tagTypes: ['Document', 'Folder', 'User'],
  endpoints: (builder) => ({
    // Define endpoints here
  }),
})
```

### 3. Replace Async Thunks
Replace existing async thunks with RTK Query endpoints:

```typescript
// Instead of fetchDocumentsAsync thunk
export const documentsApi = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    getDocuments: builder.query({
      query: (params) => ({
        url: '/documents',
        params,
      }),
      providesTags: ['Document'],
    }),
    createDocument: builder.mutation({
      query: (document) => ({
        url: '/documents',
        method: 'POST',
        body: document,
      }),
      invalidatesTags: ['Document'],
    }),
  }),
})
```

### 4. Update Store Configuration
```typescript
import { apiSlice } from './api/api-slice'

export const store = configureStore({
  reducer: {
    auth: authReducer,
    documents: documentsReducer,
    [apiSlice.reducerPath]: apiSlice.reducer, // Add RTK Query
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware().concat(apiSlice.middleware), // Add RTK Query middleware
})
```

### 5. Update Components
```typescript
import { useGetDocumentsQuery, useCreateDocumentMutation } from './api/documents-api'

function DocumentsComponent() {
  const { data: documents, isLoading, error } = useGetDocumentsQuery()
  const [createDocument] = useCreateDocumentMutation()

  const handleCreate = async (documentData) => {
    try {
      await createDocument(documentData).unwrap()
    } catch (error) {
      console.error('Failed to create document:', error)
    }
  }
}
```

## 🛡️ Type Safety

All Redux operations are fully typed:

- `RootState` - Complete store state type
- `AppDispatch` - Typed dispatch function
- Slice state interfaces
- Action payload types
- Selector return types

## 📋 Best Practices

1. **Use Typed Hooks**: Always use `useAppDispatch` and `useAppSelector`
2. **Async Error Handling**: Let Redux slices handle API errors
3. **State Normalization**: Consider normalizing complex nested data
4. **Selective Persistence**: Only persist necessary data to localStorage
5. **Action Creators**: Use slice actions for synchronous updates
6. **Async Thunks**: Use for API calls and complex async logic

## 🔄 Migration from Zustand

Key differences after migration:

| Zustand | Redux Toolkit |
|---------|---------------|
| `useAuthStore()` | `useAppSelector(selectAuth)` |
| `login(email, password)` | `dispatch(loginAsync({email, password}))` |
| Direct state mutation | Immer-powered immutable updates |
| Manual persistence | Automated localStorage integration |
| Simple selectors | Memoized selectors |

## 🚦 Current Status

✅ **Completed**:
- Redux store setup
- Auth slice with localStorage
- Documents slice with async operations  
- All components migrated
- Type safety implementation

🔄 **Ready for RTK Query**:
- API endpoints structure prepared
- Error handling patterns established
- Loading states managed
- Cache invalidation strategy planned
