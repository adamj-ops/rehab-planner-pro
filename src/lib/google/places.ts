import { FixedWindowRateLimiter } from '@/lib/rate-limit';

export interface PlacesSuggestion {
  placeId: string;
  description: string;
  mainText: string;
  secondaryText: string;
}

export interface ValidatedAddress {
  placeId: string;
  formattedAddress: string;
  street: string;
  city: string;
  state: string;
  zip: string;
  lat: number;
  lng: number;
}

type GooglePlacesAutocompleteResponse = {
  status: string;
  error_message?: string;
  predictions: Array<{
    description: string;
    place_id: string;
    structured_formatting?: {
      main_text?: string;
      secondary_text?: string;
    };
  }>;
};

type GooglePlaceDetailsResponse = {
  status: string;
  error_message?: string;
  result?: {
    formatted_address?: string;
    address_components?: Array<{
      long_name: string;
      short_name: string;
      types: string[];
    }>;
    geometry?: { location?: { lat: number; lng: number } };
    place_id?: string;
  };
};

type GoogleFindPlaceFromTextResponse = {
  status: string;
  error_message?: string;
  candidates: Array<{
    place_id: string;
    formatted_address?: string;
    geometry?: { location?: { lat: number; lng: number } };
  }>;
};

const KEY = process.env.GOOGLE_PLACES_API_KEY;

// Basic in-process caching to reduce external calls (MVP).
const CACHE_TTL_MS = 1000 * 60 * 60; // 1 hour

type CacheEntry<T> = { expiresAt: number; value: T };
const cache = {
  autocomplete: new Map<string, CacheEntry<PlacesSuggestion[]>>(),
  placeDetails: new Map<string, CacheEntry<ValidatedAddress>>(),
  findPlace: new Map<string, CacheEntry<{ placeId: string; formattedAddress?: string; lat?: number; lng?: number }>>(),
};

function getCached<T>(m: Map<string, CacheEntry<T>>, key: string): T | null {
  const hit = m.get(key);
  if (!hit) return null;
  if (Date.now() > hit.expiresAt) {
    m.delete(key);
    return null;
  }
  return hit.value;
}

function setCached<T>(m: Map<string, CacheEntry<T>>, key: string, value: T) {
  m.set(key, { value, expiresAt: Date.now() + CACHE_TTL_MS });
}

function requireKey() {
  if (!KEY) {
    throw new PlacesError('Missing GOOGLE_PLACES_API_KEY', 'MISSING_GOOGLE_PLACES_API_KEY');
  }
}

type PlacesErrorCode =
  | 'MISSING_GOOGLE_PLACES_API_KEY'
  | 'INCOMPLETE_GOOGLE_ADDRESS'
  | 'MISSING_PLACE_ID'
  | 'MISSING_ADDRESS_TEXT'
  | 'GOOGLE_PLACES_AUTOCOMPLETE_FAILED'
  | 'GOOGLE_PLACE_DETAILS_FAILED'
  | 'GOOGLE_FIND_PLACE_FAILED';

export class PlacesError extends Error {
  public readonly code: PlacesErrorCode;

  constructor(message: string, code: PlacesErrorCode) {
    super(message);
    this.code = code;
  }
}

function pickComponent(
  components: NonNullable<NonNullable<GooglePlaceDetailsResponse['result']>['address_components']>,
  type: string
) {
  return components.find((c) => c.types.includes(type));
}

function parseUSAddress(details: GooglePlaceDetailsResponse): Omit<ValidatedAddress, 'placeId'> {
  const result = details.result;
  const components = result?.address_components || [];

  const streetNumber = pickComponent(components, 'street_number')?.long_name ?? '';
  const route = pickComponent(components, 'route')?.long_name ?? '';
  const locality = pickComponent(components, 'locality')?.long_name ?? '';
  const adminArea = pickComponent(components, 'administrative_area_level_1')?.short_name ?? '';
  const postalCode = pickComponent(components, 'postal_code')?.long_name ?? '';

  const street = [streetNumber, route].filter(Boolean).join(' ').trim();
  const formattedAddress = result?.formatted_address ?? '';
  const lat = result?.geometry?.location?.lat;
  const lng = result?.geometry?.location?.lng;

  if (!street || !locality || !adminArea || !postalCode || lat == null || lng == null || !formattedAddress) {
    throw new PlacesError('Google returned incomplete address details', 'INCOMPLETE_GOOGLE_ADDRESS');
  }

  return {
    formattedAddress,
    street,
    city: locality,
    state: adminArea,
    zip: postalCode,
    lat,
    lng,
  };
}

async function googleFetch<T>(url: string): Promise<T> {
  const res = await fetch(url, {
    // Keep Next from caching external API calls unexpectedly
    cache: 'no-store',
  });
  const json = (await res.json()) as T;
  return json;
}

export const placesRateLimiter = new FixedWindowRateLimiter({
  limit: 60,
  windowMs: 60_000,
});

export async function placesAutocomplete(input: string, opts?: { country?: string }): Promise<PlacesSuggestion[]> {
  requireKey();

  const normalized = input.trim();
  if (normalized.length < 3) return [];

  const country = opts?.country ?? 'us';
  const cacheKey = `${country}:${normalized.toLowerCase()}`;
  const cached = getCached(cache.autocomplete, cacheKey);
  if (cached) return cached;

  const url = new URL('https://maps.googleapis.com/maps/api/place/autocomplete/json');
  url.searchParams.set('input', normalized);
  url.searchParams.set('types', 'address');
  url.searchParams.set('components', `country:${country}`);
  url.searchParams.set('key', KEY!);

  const data = await googleFetch<GooglePlacesAutocompleteResponse>(url.toString());

  if (data.status !== 'OK' && data.status !== 'ZERO_RESULTS') {
    throw new PlacesError(
      data.error_message || `Google Places autocomplete failed: ${data.status}`,
      'GOOGLE_PLACES_AUTOCOMPLETE_FAILED'
    );
  }

  const suggestions =
    data.predictions?.map((p) => ({
      placeId: p.place_id,
      description: p.description,
      mainText: p.structured_formatting?.main_text || p.description,
      secondaryText: p.structured_formatting?.secondary_text || '',
    })) ?? [];

  setCached(cache.autocomplete, cacheKey, suggestions);
  return suggestions;
}

export async function placeDetails(placeId: string): Promise<ValidatedAddress> {
  requireKey();

  const normalized = placeId.trim();
  if (!normalized) {
    throw new PlacesError('placeId is required', 'MISSING_PLACE_ID');
  }

  const cached = getCached(cache.placeDetails, normalized);
  if (cached) return cached;

  const url = new URL('https://maps.googleapis.com/maps/api/place/details/json');
  url.searchParams.set('place_id', normalized);
  url.searchParams.set('fields', 'place_id,formatted_address,address_component,geometry');
  url.searchParams.set('key', KEY!);

  const data = await googleFetch<GooglePlaceDetailsResponse>(url.toString());

  if (data.status !== 'OK') {
    throw new PlacesError(
      data.error_message || `Google Place Details failed: ${data.status}`,
      'GOOGLE_PLACE_DETAILS_FAILED'
    );
  }

  const parsed = parseUSAddress(data);
  const validated: ValidatedAddress = {
    placeId: data.result?.place_id || normalized,
    ...parsed,
  };

  setCached(cache.placeDetails, normalized, validated);
  return validated;
}

export async function findPlaceFromText(text: string): Promise<{ placeId: string; formattedAddress?: string; lat?: number; lng?: number }> {
  requireKey();

  const normalized = text.trim();
  if (!normalized) {
    throw new PlacesError('Address text is required', 'MISSING_ADDRESS_TEXT');
  }

  const cacheKey = normalized.toLowerCase();
  const cached = getCached(cache.findPlace, cacheKey);
  if (cached) return cached;

  const url = new URL('https://maps.googleapis.com/maps/api/place/findplacefromtext/json');
  url.searchParams.set('input', normalized);
  url.searchParams.set('inputtype', 'textquery');
  url.searchParams.set('fields', 'place_id,formatted_address,geometry');
  url.searchParams.set('key', KEY!);

  const data = await googleFetch<GoogleFindPlaceFromTextResponse>(url.toString());
  if (data.status !== 'OK' || !data.candidates?.length) {
    throw new PlacesError(
      data.error_message || `Google Find Place failed: ${data.status}`,
      'GOOGLE_FIND_PLACE_FAILED'
    );
  }

  const c = data.candidates[0];
  const result = {
    placeId: c.place_id,
    formattedAddress: c.formatted_address,
    lat: c.geometry?.location?.lat,
    lng: c.geometry?.location?.lng,
  };

  setCached(cache.findPlace, cacheKey, result);
  return result;
}

export async function validateAndGeocodeAddress(input: {
  placeId?: string | null;
  street?: string | null;
  city?: string | null;
  state?: string | null;
  zip?: string | null;
  formatted?: string | null;
}): Promise<ValidatedAddress> {
  // Prefer placeId when present
  if (input.placeId) {
    return placeDetails(input.placeId);
  }

  const formatted =
    input.formatted?.trim() ||
    [input.street, input.city, input.state, input.zip].filter(Boolean).join(', ').trim();

  const match = await findPlaceFromText(formatted);
  return placeDetails(match.placeId);
}

