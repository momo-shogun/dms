// Register API Route

import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'

const registerSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Invalid email format'),
  password: z
    .string()
    .min(8, 'Password must be at least 8 characters')
    .regex(
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
      'Password must contain at least one uppercase letter, one lowercase letter, and one number'
    ),
})

// Mock user storage (replace with database in production)
let mockUsers = [
  {
    id: '1',
    email: 'admin@dms.com',
    password: 'password123',
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
    const validatedData = registerSchema.parse(body)
    const { name, email, password } = validatedData

    // Check if user already exists
    const existingUser = mockUsers.find(u => u.email === email)
    
    if (existingUser) {
      return NextResponse.json(
        {
          success: false,
          message: 'User with this email already exists',
        },
        { status: 409 }
      )
    }

    // In production, you would:
    // 1. Hash the password using bcrypt
    // 2. Save to database
    // 3. Send welcome email
    // 4. Generate proper JWT token

    const newUser = {
      id: `${Date.now()}`,
      name,
      email,
      password, // In production, hash this
      role: 'user' as const,
      avatar: null,
      createdAt: new Date(),
      updatedAt: new Date(),
    }

    // Add to mock storage
    mockUsers.push(newUser)

    const token = `mock_token_${newUser.id}_${Date.now()}`
    
    // Remove password from response
    const { password: _, ...userWithoutPassword } = newUser

    const response = NextResponse.json({
      success: true,
      data: {
        user: userWithoutPassword,
        token,
      },
      message: 'Registration successful',
    }, { status: 201 })

    // Set token as HTTP-only cookie
    response.cookies.set('auth_token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 7, // 7 days
    })

    return response

  } catch (error) {
    console.error('Registration error:', error)

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
