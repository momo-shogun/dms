// Login API Route

import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'

const loginSchema = z.object({
  email: z.string().email('Invalid email format'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
})

// Mock user data (replace with database in production)
const mockUsers = [
  {
    id: '1',
    email: 'admin@dms.com',
    password: 'password123', // In production, this would be hashed
    name: 'Admin User',
    role: 'admin',
    avatar: null,
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: '2',
    email: 'user@dms.com',
    password: 'password123',
    name: 'Test User',
    role: 'user',
    avatar: null,
    createdAt: new Date(),
    updatedAt: new Date(),
  },
]

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    
    // Validate request body
    const validatedData = loginSchema.parse(body)
    const { email, password } = validatedData

    // Find user (in production, this would be a database query)
    const user = mockUsers.find(u => u.email === email)
    
    if (!user || user.password !== password) {
      return NextResponse.json(
        {
          success: false,
          message: 'Invalid email or password',
        },
        { status: 401 }
      )
    }

    // In production, you would:
    // 1. Hash and compare passwords using bcrypt
    // 2. Generate a proper JWT token
    // 3. Set secure HTTP-only cookies
    
    const token = `mock_token_${user.id}_${Date.now()}`
    
    // Remove password from response
    const { password: _, ...userWithoutPassword } = user

    const response = NextResponse.json({
      success: true,
      data: {
        user: userWithoutPassword,
        token,
      },
      message: 'Login successful',
    })

    // Set token as HTTP-only cookie (recommended for security)
    response.cookies.set('auth_token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 7, // 7 days
    })

    return response

  } catch (error) {
    console.error('Login error:', error)

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
      {
        success: false,
        message: 'Internal server error',
      },
      { status: 500 }
    )
  }
}
