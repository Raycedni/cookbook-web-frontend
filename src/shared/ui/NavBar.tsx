import { Link } from '@tanstack/react-router'
import { useAuth } from 'react-oidc-context'
import { ChefHat, LogOut, LogIn, Shield, Heart, User } from 'lucide-react'
import { GlassPanel } from '@/shared/ui/GlassPanel'
import { useAuthRoles } from '@/shared/auth/useAuthRoles'

export function NavBar() {
  const auth = useAuth()
  const { isAdmin } = useAuthRoles()

  return (
    <GlassPanel
      as="nav"
      intensity="heavy"
      className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-4 py-3 rounded-none border-x-0 border-t-0"
    >
      {/* Left: Logo */}
      <Link to="/" className="flex items-center gap-2 text-accent hover:text-accent-light transition-colors">
        <ChefHat className="h-6 w-6" />
        <span className="text-xl font-bold">Cookbook</span>
      </Link>

      {/* Center: Nav links (hidden on mobile) */}
      <div className="hidden md:flex items-center gap-6">
        <Link
          to="/"
          className="text-white/70 hover:text-white transition-colors [&.active]:text-accent"
        >
          Home
        </Link>
        <Link
          to="/recipes"
          className="text-white/70 hover:text-white transition-colors [&.active]:text-accent"
        >
          Recipes
        </Link>
        <Link
          to="/meal-plans"
          className="text-white/70 hover:text-white transition-colors [&.active]:text-accent"
        >
          Meal Plans
        </Link>
        {auth.isAuthenticated && (
          <>
            <Link
              to="/favorites"
              className="flex items-center gap-1 text-white/70 hover:text-white transition-colors [&.active]:text-accent"
            >
              <Heart className="h-4 w-4" />
              Favorites
            </Link>
            <Link
              to="/profile"
              className="flex items-center gap-1 text-white/70 hover:text-white transition-colors [&.active]:text-accent"
            >
              <User className="h-4 w-4" />
              Profile
            </Link>
          </>
        )}
        {isAdmin && (
          <Link
            to="/admin"
            className="flex items-center gap-1 text-accent/70 hover:text-accent transition-colors [&.active]:text-accent"
          >
            <Shield className="h-4 w-4" />
            Admin
          </Link>
        )}
      </div>

      {/* Right: Auth controls */}
      <div className="flex items-center gap-3">
        {auth.isAuthenticated ? (
          <>
            <span className="hidden sm:inline text-sm text-white/70">
              {auth.user?.profile?.preferred_username ?? 'User'}
            </span>
            <button
              onClick={() => void auth.signoutRedirect()}
              className="flex items-center gap-1.5 rounded-lg bg-white/10 px-3 py-1.5 text-sm text-white/80 hover:bg-white/20 hover:text-white transition-colors"
            >
              <LogOut className="h-4 w-4" />
              <span className="hidden sm:inline">Logout</span>
            </button>
          </>
        ) : (
          <button
            onClick={() => void auth.signinRedirect()}
            className="flex items-center gap-1.5 rounded-lg bg-accent/20 px-3 py-1.5 text-sm text-accent-light hover:bg-accent/30 hover:text-white transition-colors"
          >
            <LogIn className="h-4 w-4" />
            <span>Login</span>
          </button>
        )}
      </div>
    </GlassPanel>
  )
}
