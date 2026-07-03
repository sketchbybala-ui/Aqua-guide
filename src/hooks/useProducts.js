import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabaseClient.js'

export function useProducts({ categorySlug } = {}) {
  const [products, setProducts] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    let cancelled = false
    async function run() {
      setLoading(true)
      setError(null)
      let query = supabase
        .from('products')
        .select('*, category:categories(slug, name)')
        .eq('is_active', true)
        .order('created_at', { ascending: false })

      if (categorySlug) {
        query = query.eq('category.slug', categorySlug)
      }

      const { data, error: err } = await query
      if (cancelled) return
      if (err) {
        setError(err)
        setProducts([])
      } else {
        // when filtering by category via embedded resource, rows whose
        // category doesn't match come back with category: null — drop them
        setProducts(categorySlug ? (data ?? []).filter((p) => p.category) : data ?? [])
      }
      setLoading(false)
    }
    run()
    return () => {
      cancelled = true
    }
  }, [categorySlug])

  return { products, loading, error }
}

export function useProduct(slug) {
  const [product, setProduct] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    let cancelled = false
    async function run() {
      setLoading(true)
      setError(null)
      const { data, error: err } = await supabase
        .from('products')
        .select('*, category:categories(slug, name)')
        .eq('slug', slug)
        .single()
      if (cancelled) return
      if (err) {
        setError(err)
        setProduct(null)
      } else {
        setProduct(data)
      }
      setLoading(false)
    }
    run()
    return () => {
      cancelled = true
    }
  }, [slug])

  return { product, loading, error }
}
