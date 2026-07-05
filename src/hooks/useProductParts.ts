import { useEffect, useState } from 'react'
import { DEFAULT_PARTS } from '../data/defaults'
import type { ProductPart } from '../data/products/types'
import { isSupabaseConfigured } from '../lib/supabase'
import * as partsApi from '../services/parts.service'

type CacheEntry = {
  parts: ProductPart[]
  savedAt: number
}

type ProductPartsState = {
  slug: string
  parts: ProductPart[]
  loading: boolean
}

const CACHE_TTL_MS = 5 * 60 * 1000
const productPartsCache = new Map<string, CacheEntry>()
const inFlightRequests = new Map<string, Promise<ProductPart[]>>()

function defaultPartsFor(productSlug: string) {
  return DEFAULT_PARTS.filter(part => part.productSlug === productSlug)
}

function readCachedParts(productSlug: string) {
  const cached = productPartsCache.get(productSlug)
  if (!cached) return undefined
  if (Date.now() - cached.savedAt > CACHE_TTL_MS) {
    productPartsCache.delete(productSlug)
    return undefined
  }
  return cached.parts
}

function loadProductParts(productSlug: string) {
  const existing = inFlightRequests.get(productSlug)
  if (existing) return existing

  const request = partsApi
    .getByProduct(productSlug)
    .then(parts => {
      productPartsCache.set(productSlug, { parts, savedAt: Date.now() })
      return parts
    })
    .finally(() => {
      inFlightRequests.delete(productSlug)
    })

  inFlightRequests.set(productSlug, request)
  return request
}

function initialState(productSlug: string): ProductPartsState {
  const cached = productSlug ? readCachedParts(productSlug) : undefined
  return {
    slug: productSlug,
    parts: cached ?? defaultPartsFor(productSlug),
    loading: Boolean(productSlug && !cached && isSupabaseConfigured()),
  }
}

/**
 * Product-detail-specific parts loader.
 *
 * This avoids downloading the complete parts table before rendering a single
 * product page. Requests are de-duplicated and cached per product slug.
 */
export function useProductParts(productSlug: string) {
  const [state, setState] = useState<ProductPartsState>(() => initialState(productSlug))

  useEffect(() => {
    let cancelled = false

    if (!productSlug) {
      setState({ slug: '', parts: [], loading: false })
      return () => {
        cancelled = true
      }
    }

    const cached = readCachedParts(productSlug)
    if (cached) {
      setState({ slug: productSlug, parts: cached, loading: false })
      return () => {
        cancelled = true
      }
    }

    if (!isSupabaseConfigured()) {
      setState({ slug: productSlug, parts: defaultPartsFor(productSlug), loading: false })
      return () => {
        cancelled = true
      }
    }

    setState({ slug: productSlug, parts: [], loading: true })
    void loadProductParts(productSlug)
      .then(nextParts => {
        if (!cancelled) setState({ slug: productSlug, parts: nextParts, loading: false })
      })
      .catch(error => {
        console.warn(`[useProductParts] Failed to load parts for "${productSlug}":`, error)
        if (!cancelled) setState({ slug: productSlug, parts: [], loading: false })
      })

    return () => {
      cancelled = true
    }
  }, [productSlug])

  if (state.slug === productSlug) {
    return { parts: state.parts, loading: state.loading }
  }

  const fallback = initialState(productSlug)
  return { parts: fallback.parts, loading: fallback.loading }
}
