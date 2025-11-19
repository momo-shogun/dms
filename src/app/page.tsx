'use client'

// Landing Page - Redirects to dashboard if authenticated, otherwise shows login

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAppSelector } from '@/src/lib/store/store'
import { selectAuth } from '@/src/lib/store/slices/auth-slice'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { 
  FileText, 
  Shield, 
  Users, 
  Search, 
  Cloud, 
  Zap,
  ArrowRight,
  CheckCircle
} from 'lucide-react'
import Link from 'next/link'

const features = [
  {
    icon: FileText,
    title: 'Document Management',
    description: 'Upload, organize and manage your documents easily',
  },
  {
    icon: Shield,
    title: 'Secure Storage',
    description: 'Keep your files safe with bank-level security',
  },
  {
    icon: Users,
    title: 'Team Collaboration',
    description: 'Share and collaborate with your team seamlessly',
  },
  {
    icon: Search,
    title: 'Advanced Search',
    description: 'Quickly find what you need with powerful search and filtering options',
  },
  {
    icon: Cloud,
    title: 'Cloud Access',
    description: 'Access your documents anywhere, anytime',
  },
  {
    icon: Zap,
    title: 'Fast Performance',
    description: 'Lightning fast upload and download speeds',
  },
]

const benefits = [
  'Unlimited document storage',
  'Advanced security features', 
  'Team collaboration tools',
  'Mobile app access',
  '24/7 customer support',
  'API access for developers',
]

export default function HomePage() {
  const router = useRouter()
  const { isAuthenticated } = useAppSelector(selectAuth)

  useEffect(() => {
    // Redirect to dashboard if authenticated
    if (isAuthenticated) {
      router.push('/dashboard')
    }
  }, [isAuthenticated, router])

  if (isAuthenticated) {
    return null // Will redirect to dashboard
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div className="flex items-center">
              <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
                <FileText className="w-5 h-5 text-white" />
              </div>
              <span className="ml-2 text-xl font-bold text-gray-900">DMS</span>
            </div>
            <div className="flex space-x-4">
              <Button variant="ghost" asChild>
                <Link href="/login">Login</Link>
              </Button>
              <Button asChild>
                <Link href="/register">Get Started</Link>
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="text-center">
          <h1 className="text-4xl md:text-6xl font-bold text-gray-900 mb-6">
            Manage Your Documents
            <span className="text-blue-600 block">Like a Pro</span>
          </h1>
          <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
            The most modern and easy way to organize, secure, and access your documents. 
            A professional-grade document management system that's perfect for teams.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button size="lg" asChild>
              <Link href="/register">
                Start Free Trial
                <ArrowRight className="ml-2 w-4 h-4" />
              </Link>
            </Button>
            <Button variant="outline" size="lg" asChild>
              <Link href="/login">Login to Your Account</Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="bg-white py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Why Choose Our DMS?
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Enterprise-grade features that take your business to the next level
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <Card key={index} className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mb-4">
                    <feature.icon className="w-6 h-6 text-blue-600" />
                  </div>
                  <CardTitle className="text-xl">{feature.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription className="text-gray-600">
                    {feature.description}
                  </CardDescription>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="bg-gray-50 py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-3xl font-bold text-gray-900 mb-6">
                Everything You Need in One Place
              </h2>
              <p className="text-lg text-gray-600 mb-8">
                Complete document management solution that fulfills every requirement of your business.
              </p>
              <div className="space-y-4">
                {benefits.map((benefit, index) => (
                  <div key={index} className="flex items-center">
                    <CheckCircle className="w-5 h-5 text-green-500 mr-3" />
                    <span className="text-gray-700">{benefit}</span>
                  </div>
                ))}
              </div>
            </div>
            <div className="bg-white p-8 rounded-2xl shadow-lg">
              <h3 className="text-xl font-semibold text-gray-900 mb-4">
                Ready to Get Started?
              </h3>
              <p className="text-gray-600 mb-6">
                Join thousands of businesses who trust our platform for their document management needs.
              </p>
              <Button className="w-full" size="lg" asChild>
                <Link href="/register">
                  Create Your Account
                  <ArrowRight className="ml-2 w-4 h-4" />
                </Link>
              </Button>
              <p className="text-sm text-gray-500 text-center mt-4">
                No credit card required • Free 14-day trial
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div className="md:col-span-2">
              <div className="flex items-center mb-4">
                <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
                  <FileText className="w-5 h-5 text-white" />
                </div>
                <span className="ml-2 text-xl font-bold">Document Management System</span>
              </div>
              <p className="text-gray-400 mb-4">
                Professional document management solution for modern businesses. 
                Secure, scalable, and user-friendly.
              </p>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Product</h4>
              <div className="space-y-2 text-gray-400">
                <Link href="/features" className="block hover:text-white">Features</Link>
                <Link href="/pricing" className="block hover:text-white">Pricing</Link>
                <Link href="/security" className="block hover:text-white">Security</Link>
              </div>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Support</h4>
              <div className="space-y-2 text-gray-400">
                <Link href="/help" className="block hover:text-white">Help Center</Link>
                <Link href="/contact" className="block hover:text-white">Contact</Link>
                <Link href="/privacy" className="block hover:text-white">Privacy</Link>
              </div>
            </div>
          </div>
          <div className="border-t border-gray-800 mt-8 pt-8 text-center text-gray-400">
            <p>&copy; 2024 Document Management System. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  )
}
