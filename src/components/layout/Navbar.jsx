import { Link, NavLink } from 'react-router-dom'
import { useAuth } from '../../hooks/useAuth.js'
import { useCart } from '../../hooks/useCart.js'

const navLinkClass = ({ isActive }) =>
  `text-sm font-medium transition-colors hover:text-brand-600 ${
    isActive ? 'text-brand-700' : 'text-slate-600'
  }`

export default function Navbar() {
  const { user, isAdmin, signOut } = useAuth()
  const { totalItems } = useCart()

  return (
    <header className="sticky top-0 z-20 border-b border-slate-200 bg-white/95 backdrop-blur">
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-3">
        <Link to="/" className="flex items-center gap-2">
          <img src="/logo.png" alt="Aqua Guide" className="h-9 w-9 object-contain" />
          <span className="text-lg font-bold text-brand-800">Aqua Guide</span>
        </Link>

        <nav className="hidden items-center gap-6 md:flex">
          <NavLink to="/" end className={navLinkClass}>
            Home
          </NavLink>
          <NavLink to="/category/home-use" className={navLinkClass}>
            Home Use
          </NavLink>
          <NavLink to="/category/commercial-use" className={navLinkClass}>
            Commercial Use
          </NavLink>
          {isAdmin && (
            <NavLink to="/admin" className={navLinkClass}>
              Admin
            </NavLink>
          )}
        </nav>

        <div className="flex items-center gap-4">
          <Link to="/cart" className="relative text-slate-600 hover:text-brand-600" aria-label="Cart">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-6 w-6"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={1.8}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M2.25 3h1.386c.51 0 .955.343 1.087.835l.383 1.437M7.5 14.25a3 3 0 00-3 3h15.75m-12.75-3h11.218c1.121-2.3 1.9-4.575 2.25-6.75H5.106M7.5 14.25L5.106 5.272M7.5 14.25l-1.293 5.169a.75.75 0 00.75.933h11.25a.75.75 0 00.75-.933l-1.293-5.169"
              />
            </svg>
            {totalItems > 0 && (
              <span className="absolute -right-2 -top-2 flex h-5 w-5 items-center justify-center rounded-full bg-brand-600 text-[11px] font-semibold text-white">
                {totalItems}
              </span>
            )}
          </Link>

          {user ? (
            <div className="flex items-center gap-3">
              <Link to="/profile" className="text-sm font-medium text-slate-600 hover:text-brand-600">
                Profile
              </Link>
              <button
                onClick={signOut}
                className="text-sm font-medium text-slate-500 hover:text-brand-600"
              >
                Sign out
              </button>
            </div>
          ) : (
            <Link
              to="/login"
              className="rounded-lg bg-brand-600 px-3 py-1.5 text-sm font-medium text-white hover:bg-brand-700"
            >
              Login
            </Link>
          )}
        </div>
      </div>
    </header>
  )
}
