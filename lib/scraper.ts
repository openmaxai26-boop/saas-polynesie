/**
 * AGENT SCRAPING — Google Places API
 * Trouve les entreprises sans site web en Polynésie française
 *
 * Requis: GOOGLE_PLACES_API_KEY dans .env
 * Console: https://console.cloud.google.com → activer "Places API"
 * Coût: ~$17 pour 1000 requêtes (gratuit jusqu'à $200/mois avec compte)
 */

import { supabaseAdmin } from './supabase'

const GOOGLE_PLACES_API = 'https://maps.googleapis.com/maps/api/place'
const API_KEY = process.env.GOOGLE_PLACES_API_KEY

// Zones et types d'entreprises à scraper
const SEARCH_QUERIES = [
  { query: 'restaurant Papeete', type: 'food', city: 'Papeete', island: 'Tahiti' },
  { query: 'snack Papeete', type: 'food', city: 'Papeete', island: 'Tahiti' },
  { query: 'salon beauté Tahiti', type: 'beaute', city: 'Papeete', island: 'Tahiti' },
  { query: 'plombier Tahiti', type: 'artisan', city: 'Papeete', island: 'Tahiti' },
  { query: 'électricien Tahiti', type: 'artisan', city: 'Papeete', island: 'Tahiti' },
  { query: 'pension Moorea', type: 'hebergement', city: 'Moorea', island: 'Moorea' },
  { query: 'bungalow Moorea', type: 'hebergement', city: 'Moorea', island: 'Moorea' },
  { query: 'dentiste Tahiti', type: 'sante', city: 'Papeete', island: 'Tahiti' },
  { query: 'garage auto Tahiti', type: 'auto', city: 'Papeete', island: 'Tahiti' },
  { query: 'architecte Tahiti', type: 'liberal', city: 'Papeete', island: 'Tahiti' },
]

// Score un lead selon les données disponibles
function scoreLead(place: {
  hasWebsite: boolean
  hasEmail: boolean
  hasPhone: boolean
  businessType: string
  hasActivePresence: boolean
  rating?: number
  city: string
}): number {
  let score = 0

  // Un site OBSOLÈTE ou absent est une opportunité
  if (!place.hasWebsite) score += 25

  // Email trouvé = contactable directement
  if (place.hasEmail) score += 30

  // Téléphone trouvé
  if (place.hasPhone) score += 20

  // Secteurs à fort potentiel ROI
  const highValueTypes = ['hebergement', 'restaurant', 'beaute', 'sante', 'liberal']
  if (highValueTypes.includes(place.businessType)) score += 20

  // Présence active = business viable
  if (place.hasActivePresence) score += 15

  // Note Google (indique que l'activité tourne)
  if (place.rating && place.rating >= 4.0) score += 10

  // Papeete / zones touristiques = plus de potentiel
  if (['Papeete', 'Moorea', 'Bora Bora'].includes(place.city)) score += 10

  // Plafonner à 100
  return Math.min(score, 100)
}

// Cherche les entreprises via Google Places Text Search
async function searchPlaces(query: string): Promise<GooglePlace[]> {
  if (!API_KEY) {
    console.warn('GOOGLE_PLACES_API_KEY non configurée — scraping simulé')
    return []
  }

  const url = `${GOOGLE_PLACES_API}/textsearch/json?` +
    `query=${encodeURIComponent(query)}&` +
    `region=pf&` +
    `key=${API_KEY}`

  const res = await fetch(url)
  const data = await res.json()

  if (data.status !== 'OK' && data.status !== 'ZERO_RESULTS') {
    console.error('Google Places error:', data.status)
    return []
  }

  return data.results || []
}

// Récupère les détails d'un lieu (email, website, etc.)
async function getPlaceDetails(placeId: string): Promise<PlaceDetails | null> {
  if (!API_KEY) return null

  const fields = 'name,formatted_address,formatted_phone_number,website,email,opening_hours,rating,user_ratings_total,types'
  const url = `${GOOGLE_PLACES_API}/details/json?` +
    `place_id=${placeId}&` +
    `fields=${fields}&` +
    `key=${API_KEY}`

  const res = await fetch(url)
  const data = await res.json()

  if (data.status !== 'OK') return null
  return data.result
}

// Processus principal de scraping
export async function runScraping(): Promise<{ found: number; saved: number; skipped: number }> {
  let found = 0
  let saved = 0
  let skipped = 0

  for (const searchConfig of SEARCH_QUERIES) {
    try {
      console.log(`Scraping: ${searchConfig.query}`)
      const places = await searchPlaces(searchConfig.query)
      found += places.length

      for (const place of places) {
        // Pause pour respecter les rate limits
        await new Promise(r => setTimeout(r, 200))

        // Vérifier si ce lead existe déjà
        const { data: existing } = await supabaseAdmin
          .from('leads')
          .select('id')
          .eq('google_place_id', place.place_id)
          .single()

        if (existing) { skipped++; continue }

        // Récupérer les détails
        const details = await getPlaceDetails(place.place_id)

        const hasWebsite = !!(details?.website)
        const hasEmail = !!(details?.email)
        const hasPhone = !!(details?.formatted_phone_number)

        // Si le business a déjà un bon site récent, on skip
        if (hasWebsite) {
          // On pourrait analyser la qualité du site ici
          // Pour l'instant, on garde quand même les sites obsolètes
          skipped++
          continue
        }

        const score = scoreLead({
          hasWebsite,
          hasEmail,
          hasPhone,
          businessType: searchConfig.type,
          hasActivePresence: (place.user_ratings_total || 0) > 5,
          rating: place.rating,
          city: searchConfig.city,
        })

        // Seulement sauvegarder les leads avec score >= 40
        if (score < 40) { skipped++; continue }

        const { error } = await supabaseAdmin.from('leads').insert({
          name: details?.name || place.name,
          business_type: searchConfig.type,
          email: details?.email || null,
          phone: details?.formatted_phone_number || null,
          address: details?.formatted_address || place.formatted_address,
          city: searchConfig.city,
          island: searchConfig.island,
          source: 'google_maps',
          google_place_id: place.place_id,
          score,
          has_website: hasWebsite,
          website_url: details?.website || null,
          status: 'new',
        })

        if (!error) saved++
      }

      // Délai entre les requêtes de recherche
      await new Promise(r => setTimeout(r, 1000))

    } catch (err) {
      console.error(`Erreur scraping "${searchConfig.query}":`, err)
    }
  }

  return { found, saved, skipped }
}

// Types Google Places
type GooglePlace = {
  place_id: string
  name: string
  formatted_address: string
  rating?: number
  user_ratings_total?: number
  types?: string[]
}

type PlaceDetails = {
  name?: string
  formatted_address?: string
  formatted_phone_number?: string
  website?: string
  email?: string
  opening_hours?: { open_now?: boolean }
  rating?: number
  user_ratings_total?: number
  types?: string[]
}
