import { Navigate } from 'react-router-dom'
import { useAuth } from '../../hooks/useAuth.js'
import Spinner from '../ui/Spinner.jsx'

export default function AdminRoute({ children }) {
  const { user, isAdmin, loading } = useAuth()

  if (loading) {
    return (
      <div className="flex justify-center py-24">
        <Spinner />
      </div>
    )
  }

  if (!user || !isAdmin) {
    return <Navigate to="/" replace />
  }

  return children
}
