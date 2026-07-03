import { Routes, Route } from 'react-router-dom'
import Home from '../pages/Home.jsx'
import CategoryListing from '../pages/CategoryListing.jsx'
import ProductDetail from '../pages/ProductDetail.jsx'
import Cart from '../pages/Cart.jsx'
import Checkout from '../pages/Checkout.jsx'
import OrderConfirmation from '../pages/OrderConfirmation.jsx'
import Login from '../pages/Login.jsx'
import Signup from '../pages/Signup.jsx'
import Profile from '../pages/Profile.jsx'
import AdminDashboard from '../pages/admin/AdminDashboard.jsx'
import AdminProductList from '../pages/admin/AdminProductList.jsx'
import AdminProductForm from '../pages/admin/AdminProductForm.jsx'
import ProtectedRoute from '../components/layout/ProtectedRoute.jsx'
import AdminRoute from '../components/layout/AdminRoute.jsx'

export default function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/category/:slug" element={<CategoryListing />} />
      <Route path="/product/:slug" element={<ProductDetail />} />
      <Route path="/cart" element={<Cart />} />
      <Route path="/login" element={<Login />} />
      <Route path="/signup" element={<Signup />} />

      <Route
        path="/checkout"
        element={
          <ProtectedRoute>
            <Checkout />
          </ProtectedRoute>
        }
      />
      <Route
        path="/order-confirmation/:orderId"
        element={
          <ProtectedRoute>
            <OrderConfirmation />
          </ProtectedRoute>
        }
      />
      <Route
        path="/profile"
        element={
          <ProtectedRoute>
            <Profile />
          </ProtectedRoute>
        }
      />

      <Route
        path="/admin"
        element={
          <AdminRoute>
            <AdminDashboard />
          </AdminRoute>
        }
      />
      <Route
        path="/admin/products"
        element={
          <AdminRoute>
            <AdminProductList />
          </AdminRoute>
        }
      />
      <Route
        path="/admin/products/new"
        element={
          <AdminRoute>
            <AdminProductForm />
          </AdminRoute>
        }
      />
      <Route
        path="/admin/products/:productId/edit"
        element={
          <AdminRoute>
            <AdminProductForm />
          </AdminRoute>
        }
      />

      <Route path="*" element={<Home />} />
    </Routes>
  )
}
