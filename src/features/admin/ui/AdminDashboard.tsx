import { Suspense } from 'react'
import { useSuspenseQuery } from '@tanstack/react-query'
import {
  Users,
  ChefHat,
  Calendar,
  Star,
  Tags,
  Ruler,
  Salad,
} from 'lucide-react'
import { adminQueries } from '@/features/admin/api/admin-queries'
import { Skeleton } from '@/shared/ui/Skeleton'
import { StatCard } from './StatCard'

function DashboardGrid() {
  const { data: stats } = useSuspenseQuery(adminQueries.stats())

  const cards = [
    { title: 'Users', count: stats.users, icon: Users, to: '/admin/users' },
    { title: 'Recipes', count: stats.recipes, icon: ChefHat, to: '/admin' },
    { title: 'Meal Plans', count: stats.mealPlans, icon: Calendar, to: '/admin' },
    { title: 'Ratings', count: stats.ratings, icon: Star, to: '/admin/rating-criteria' },
    { title: 'Tags', count: stats.tags, icon: Tags, to: '/admin/tags' },
    { title: 'Units', count: stats.units, icon: Ruler, to: '/admin/units' },
    { title: 'Ingredients', count: stats.ingredients, icon: Salad, to: '/admin/ingredients' },
  ]

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
      {cards.map((card) => (
        <StatCard
          key={card.title}
          title={card.title}
          count={card.count}
          icon={card.icon}
          to={card.to}
        />
      ))}
    </div>
  )
}

function DashboardSkeleton() {
  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
      {Array.from({ length: 7 }).map((_, i) => (
        <Skeleton key={i} height={120} variant="rectangular" />
      ))}
    </div>
  )
}

export function AdminDashboard() {
  return (
    <div>
      <h1 className="text-2xl font-bold text-white mb-6">Admin Dashboard</h1>
      <Suspense fallback={<DashboardSkeleton />}>
        <DashboardGrid />
      </Suspense>
    </div>
  )
}
