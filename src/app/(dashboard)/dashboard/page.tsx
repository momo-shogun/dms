'use client'

// Dashboard Overview Page

import Link from 'next/link'
import {
  FileText,
  Folder,
  Upload,
  Users,
  TrendingUp,
  Clock,
  Star,
  Download,
} from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { useAppSelector } from '@/src/lib/store/store'
import { selectUser } from '@/src/lib/store/slices/auth-slice'

const stats = [
  {
    name: 'Total Documents',
    value: '2,651',
    change: '+4.75%',
    changeType: 'positive' as const,
    icon: FileText,
  },
  {
    name: 'Folders',
    value: '42',
    change: '+12.5%',
    changeType: 'positive' as const,
    icon: Folder,
  },
  {
    name: 'Storage Used',
    value: '4.2 GB',
    change: '+2.1%',
    changeType: 'positive' as const,
    icon: Upload,
  },
  {
    name: 'Shared Files',
    value: '128',
    change: '-1.4%',
    changeType: 'negative' as const,
    icon: Users,
  },
]

const recentDocuments = [
  {
    id: '1',
    name: 'Project Proposal Q4 2024.pdf',
    size: '2.4 MB',
    lastModified: '2 hours ago',
    author: 'Amit Kumar',
    type: 'pdf',
    isStarred: true,
  },
  {
    id: '2',
    name: 'Budget Analysis.xlsx',
    size: '1.8 MB',
    lastModified: '4 hours ago',
    author: 'Priya Singh',
    type: 'xlsx',
    isStarred: false,
  },
  {
    id: '3',
    name: 'Team Meeting Notes.docx',
    size: '234 KB',
    lastModified: '1 day ago',
    author: 'Rahul Sharma',
    type: 'docx',
    isStarred: true,
  },
  {
    id: '4',
    name: 'Design Mockups.zip',
    size: '15.2 MB',
    lastModified: '2 days ago',
    author: 'Sneha Patel',
    type: 'zip',
    isStarred: false,
  },
]

const quickActions = [
  {
    title: 'Upload Document',
    description: 'Upload new documents',
    icon: Upload,
    href: '/dashboard/documents/upload',
    color: 'bg-blue-500',
  },
  {
    title: 'Create Folder',
    description: 'Create a new folder',
    icon: Folder,
    href: '/dashboard/folders/create',
    color: 'bg-green-500',
  },
  {
    title: 'View All Documents',
    description: 'View all your documents',
    icon: FileText,
    href: '/dashboard/documents',
    color: 'bg-purple-500',
  },
  {
    title: 'Team Collaboration',
    description: 'Collaborate with your team',
    icon: Users,
    href: '/dashboard/teams',
    color: 'bg-orange-500',
  },
]

function getFileIcon(type: string) {
  switch (type.toLowerCase()) {
    case 'pdf':
      return '📄'
    case 'docx':
    case 'doc':
      return '📝'
    case 'xlsx':
    case 'xls':
      return '📊'
    case 'zip':
    case 'rar':
      return '🗜️'
    case 'jpg':
    case 'jpeg':
    case 'png':
    case 'gif':
      return '🖼️'
    default:
      return '📎'
  }
}

export default function DashboardPage() {
  const user = useAppSelector(selectUser)

  const getGreeting = () => {
    const hour = new Date().getHours()
    if (hour < 12) return 'Good morning'
    if (hour < 17) return 'Good afternoon'
    return 'Good evening'
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            {getGreeting()}, {user?.name?.split(' ')[0]}! 👋
          </h1>
          <p className="mt-2 text-sm text-gray-600">
            View and manage your documents overview
          </p>
        </div>
        <div className="mt-4 sm:mt-0">
          <Button asChild>
            <Link href="/dashboard/documents/upload">
              <Upload className="mr-2 h-4 w-4" />
              Upload Document
            </Link>
          </Button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => (
          <Card key={stat.name}>
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className="shrink-0">
                  <stat.icon className="h-8 w-8 text-gray-600" />
                </div>
                <div className="ml-4 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">
                      {stat.name}
                    </dt>
                    <dd className="flex items-baseline">
                      <div className="text-2xl font-semibold text-gray-900">
                        {stat.value}
                      </div>
                      <div
                        className={`ml-2 flex items-baseline text-sm font-semibold ${
                          stat.changeType === 'positive'
                            ? 'text-green-600'
                            : 'text-red-600'
                        }`}
                      >
                        <TrendingUp className="h-4 w-4 mr-1" />
                        {stat.change}
                      </div>
                    </dd>
                  </dl>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Quick Actions */}
        <Card className="lg:col-span-1">
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
            <CardDescription>
              Commonly used actions for quick access
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {quickActions.map((action) => (
              <Link
                key={action.title}
                href={action.href}
                className="flex items-center p-3 rounded-lg border hover:bg-gray-50 transition-colors"
              >
                <div className={`p-2 rounded-lg ${action.color}`}>
                  <action.icon className="h-5 w-5 text-white" />
                </div>
                <div className="ml-4">
                  <h4 className="text-sm font-medium text-gray-900">
                    {action.title}
                  </h4>
                  <p className="text-xs text-gray-500">{action.description}</p>
                </div>
              </Link>
            ))}
          </CardContent>
        </Card>

        {/* Recent Documents */}
        <Card className="lg:col-span-2">
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle>Recent Documents</CardTitle>
              <CardDescription>
                Your recently modified documents
              </CardDescription>
            </div>
            <Button variant="outline" size="sm" asChild>
              <Link href="/dashboard/documents">View All</Link>
            </Button>
          </CardHeader>
          <CardContent>
              <div className="space-y-4">
                {recentDocuments.map((doc) => (
                  <div
                    key={doc.id}
                    className="flex items-center justify-between p-3 rounded-lg border hover:bg-gray-50"
                  >
                    <div className="flex items-center space-x-3">
                      <div className="text-2xl">{getFileIcon(doc.type)}</div>
                      <div className="flex-1">
                        <div className="flex items-center space-x-2">
                          <h4 className="text-sm font-medium text-gray-900">
                            {doc.name}
                          </h4>
                          {doc.isStarred && (
                            <Star className="h-4 w-4 text-yellow-400 fill-current" />
                          )}
                        </div>
                        <div className="flex items-center space-x-4 text-xs text-gray-500">
                          <span>{doc.size}</span>
                          <span>•</span>
                          <span>{doc.lastModified}</span>
                          <span>•</span>
                          <span>by {doc.author}</span>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Button size="sm" variant="ghost">
                        <Download className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
          </CardContent>
        </Card>
      </div>

      {/* Activity Timeline */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Activity</CardTitle>
          <CardDescription>
            Recent activities in your account
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[
              {
                action: 'Uploaded',
                item: 'Project Proposal Q4 2024.pdf',
                time: '2 hours ago',
                user: 'You',
              },
              {
                action: 'Shared',
                item: 'Budget Analysis.xlsx',
                time: '4 hours ago',
                user: 'Priya Singh',
              },
              {
                action: 'Modified',
                item: 'Team Meeting Notes.docx',
                time: '1 day ago',
                user: 'Rahul Sharma',
              },
              {
                action: 'Created folder',
                item: 'Q4 Reports',
                time: '2 days ago',
                user: 'You',
              },
            ].map((activity, index) => (
              <div key={index} className="flex items-center space-x-3">
                <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                <div className="flex-1">
                  <p className="text-sm text-gray-900">
                    <span className="font-medium">{activity.user}</span>{' '}
                    {activity.action.toLowerCase()}{' '}
                    <span className="font-medium">{activity.item}</span>
                  </p>
                  <p className="text-xs text-gray-500">{activity.time}</p>
                </div>
                <Clock className="h-4 w-4 text-gray-400" />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
