import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { supabase } from '../../lib/supabaseClient.js'
import Input from '../../components/ui/Input.jsx'
import Button from '../../components/ui/Button.jsx'
import Spinner from '../../components/ui/Spinner.jsx'

function slugify(text) {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '')
}

const emptyProduct = {
  name: '',
  slug: '',
  description: '',
  price: '',
  category_id: '',
  stock_quantity: 0,
  is_active: true,
  image_url: '',
  features: [],
}

export default function AdminProductForm() {
  const { productId } = useParams()
  const isEditing = Boolean(productId)
  const navigate = useNavigate()

  const [categories, setCategories] = useState([])
  const [product, setProduct] = useState(emptyProduct)
  const [featuresText, setFeaturesText] = useState('')
  const [imageFile, setImageFile] = useState(null)
  const [loading, setLoading] = useState(isEditing)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState(null)

  useEffect(() => {
    async function loadCategories() {
      const { data } = await supabase.from('categories').select('*').order('name')
      setCategories(data ?? [])
    }
    loadCategories()
  }, [])

  useEffect(() => {
    if (!isEditing) return
    async function loadProduct() {
      const { data } = await supabase.from('products').select('*').eq('id', productId).single()
      if (data) {
        setProduct(data)
        setFeaturesText((data.features ?? []).join('\n'))
      }
      setLoading(false)
    }
    loadProduct()
  }, [productId, isEditing])

  function updateField(field, value) {
    setProduct((prev) => ({ ...prev, [field]: value }))
  }

  function handleNameChange(value) {
    setProduct((prev) => ({
      ...prev,
      name: value,
      slug: isEditing ? prev.slug : slugify(value),
    }))
  }

  async function handleSubmit(e) {
    e.preventDefault()
    setSaving(true)
    setError(null)

    try {
      let imageUrl = product.image_url
      if (imageFile) {
        const path = `${product.slug}-${Date.now()}.${imageFile.name.split('.').pop()}`
        const { error: uploadError } = await supabase.storage
          .from('product-images')
          .upload(path, imageFile, { upsert: true })
        if (uploadError) throw uploadError
        const { data: publicUrl } = supabase.storage.from('product-images').getPublicUrl(path)
        imageUrl = publicUrl.publicUrl
      }

      const payload = {
        name: product.name,
        slug: product.slug,
        description: product.description,
        price: Number(product.price),
        category_id: product.category_id,
        stock_quantity: Number(product.stock_quantity),
        is_active: product.is_active,
        image_url: imageUrl,
        features: featuresText
          .split('\n')
          .map((f) => f.trim())
          .filter(Boolean),
      }

      if (isEditing) {
        const { error: updateError } = await supabase.from('products').update(payload).eq('id', productId)
        if (updateError) throw updateError
      } else {
        const { error: insertError } = await supabase.from('products').insert(payload)
        if (insertError) throw insertError
      }

      navigate('/admin/products')
    } catch (err) {
      setError(err.message)
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="flex justify-center py-24">
        <Spinner />
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-2xl px-4 py-10">
      <h1 className="text-2xl font-bold text-slate-800">{isEditing ? 'Edit Product' : 'Add Product'}</h1>
      <form onSubmit={handleSubmit} className="mt-6 flex flex-col gap-4">
        <Input label="Name" required value={product.name} onChange={(e) => handleNameChange(e.target.value)} />
        <Input
          label="Slug"
          required
          value={product.slug}
          onChange={(e) => updateField('slug', slugify(e.target.value))}
        />

        <div className="flex flex-col gap-1">
          <label className="text-sm font-medium text-slate-700">Description</label>
          <textarea
            rows={4}
            className="rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-brand-500 focus:ring-1 focus:ring-brand-500"
            value={product.description ?? ''}
            onChange={(e) => updateField('description', e.target.value)}
          />
        </div>

        <div className="flex flex-col gap-1">
          <label className="text-sm font-medium text-slate-700">Category</label>
          <select
            required
            className="rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-brand-500 focus:ring-1 focus:ring-brand-500"
            value={product.category_id}
            onChange={(e) => updateField('category_id', e.target.value)}
          >
            <option value="" disabled>
              Select a category
            </option>
            {categories.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <Input
            label="Price (₹)"
            type="number"
            min="0"
            step="1"
            required
            value={product.price}
            onChange={(e) => updateField('price', e.target.value)}
          />
          <Input
            label="Stock quantity"
            type="number"
            min="0"
            required
            value={product.stock_quantity}
            onChange={(e) => updateField('stock_quantity', e.target.value)}
          />
        </div>

        <div className="flex flex-col gap-1">
          <label className="text-sm font-medium text-slate-700">Features (one per line)</label>
          <textarea
            rows={4}
            placeholder={'Multi-stage RO purification\nCompact wall-mountable design'}
            className="rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-brand-500 focus:ring-1 focus:ring-brand-500"
            value={featuresText}
            onChange={(e) => setFeaturesText(e.target.value)}
          />
        </div>

        <div className="flex flex-col gap-1">
          <label className="text-sm font-medium text-slate-700">Product image</label>
          {product.image_url && (
            <img src={product.image_url} alt="" className="mb-2 h-24 w-24 rounded object-cover" />
          )}
          <input type="file" accept="image/*" onChange={(e) => setImageFile(e.target.files?.[0] ?? null)} />
        </div>

        <label className="flex items-center gap-2 text-sm text-slate-700">
          <input
            type="checkbox"
            checked={product.is_active}
            onChange={(e) => updateField('is_active', e.target.checked)}
          />
          Active (visible in store)
        </label>

        {error && <p className="text-sm text-red-500">{error}</p>}

        <Button type="submit" disabled={saving} className="mt-2">
          {saving ? 'Saving…' : 'Save Product'}
        </Button>
      </form>
    </div>
  )
}
