/**
 * Geographic data utilities for profile forms.
 * Uses REST Countries API for countries and static data for Indian states.
 */

// Common countries sorted by usage priority
export const COUNTRIES = [
  "India", "United States", "United Kingdom", "Canada", "Australia",
  "Germany", "France", "Netherlands", "Singapore", "United Arab Emirates",
  "Japan", "South Korea", "China", "Brazil", "Mexico",
  "Italy", "Spain", "Sweden", "Norway", "Denmark",
  "Finland", "Switzerland", "Austria", "Belgium", "Ireland",
  "New Zealand", "South Africa", "Israel", "Poland", "Czech Republic",
  "Portugal", "Russia", "Turkey", "Saudi Arabia", "Qatar",
  "Malaysia", "Indonesia", "Philippines", "Thailand", "Vietnam",
  "Pakistan", "Bangladesh", "Sri Lanka", "Nepal", "Nigeria",
  "Kenya", "Egypt", "Argentina", "Colombia", "Chile",
  "Peru", "Ukraine", "Romania", "Hungary", "Greece",
  "Taiwan", "Hong Kong", "Bahrain", "Kuwait", "Oman"
];

// Indian states and union territories
export const INDIAN_STATES = [
  "Andhra Pradesh", "Arunachal Pradesh", "Assam", "Bihar",
  "Chhattisgarh", "Goa", "Gujarat", "Haryana",
  "Himachal Pradesh", "Jharkhand", "Karnataka", "Kerala",
  "Madhya Pradesh", "Maharashtra", "Manipur", "Meghalaya",
  "Mizoram", "Nagaland", "Odisha", "Punjab",
  "Rajasthan", "Sikkim", "Tamil Nadu", "Telangana",
  "Tripura", "Uttar Pradesh", "Uttarakhand", "West Bengal",
  "Andaman and Nicobar Islands", "Chandigarh", "Dadra and Nagar Haveli and Daman and Diu",
  "Delhi", "Jammu and Kashmir", "Ladakh", "Lakshadweep", "Puducherry"
];

// US states
export const US_STATES = [
  "Alabama", "Alaska", "Arizona", "Arkansas", "California", "Colorado",
  "Connecticut", "Delaware", "Florida", "Georgia", "Hawaii", "Idaho",
  "Illinois", "Indiana", "Iowa", "Kansas", "Kentucky", "Louisiana",
  "Maine", "Maryland", "Massachusetts", "Michigan", "Minnesota",
  "Mississippi", "Missouri", "Montana", "Nebraska", "Nevada",
  "New Hampshire", "New Jersey", "New Mexico", "New York",
  "North Carolina", "North Dakota", "Ohio", "Oklahoma", "Oregon",
  "Pennsylvania", "Rhode Island", "South Carolina", "South Dakota",
  "Tennessee", "Texas", "Utah", "Vermont", "Virginia", "Washington",
  "West Virginia", "Wisconsin", "Wyoming", "District of Columbia"
];

// UK regions
export const UK_REGIONS = [
  "England", "Scotland", "Wales", "Northern Ireland",
  "London", "South East", "South West", "East of England",
  "West Midlands", "East Midlands", "Yorkshire and the Humber",
  "North West", "North East"
];

// Canadian provinces
export const CA_PROVINCES = [
  "Alberta", "British Columbia", "Manitoba", "New Brunswick",
  "Newfoundland and Labrador", "Northwest Territories", "Nova Scotia",
  "Nunavut", "Ontario", "Prince Edward Island", "Quebec", "Saskatchewan", "Yukon"
];

// Australian states
export const AU_STATES = [
  "New South Wales", "Victoria", "Queensland", "South Australia",
  "Western Australia", "Tasmania", "Northern Territory",
  "Australian Capital Territory"
];

/**
 * Get states/provinces for a given country.
 * Returns an array of state names, or empty array if not available.
 */
export function getStatesForCountry(country) {
  if (!country) return [];
  const normalized = country.trim().toLowerCase();

  switch (normalized) {
    case "india": return INDIAN_STATES;
    case "united states": case "usa": case "us": return US_STATES;
    case "united kingdom": case "uk": return UK_REGIONS;
    case "canada": return CA_PROVINCES;
    case "australia": return AU_STATES;
    default: return [];
  }
}

// Common degrees
export const DEGREES = [
  "High School Diploma",
  "Diploma",
  "Associate Degree",
  "B.Tech / B.E.",
  "B.Sc",
  "B.A.",
  "B.Com",
  "BBA",
  "BCA",
  "B.Des",
  "B.Arch",
  "MBBS",
  "B.Pharm",
  "LLB",
  "M.Tech / M.E.",
  "M.Sc",
  "M.A.",
  "M.Com",
  "MBA",
  "MCA",
  "M.Des",
  "MD",
  "LLM",
  "Ph.D.",
  "Post-Doctoral",
  "Other"
];

// Current status options
export const STATUS_OPTIONS = [
  { value: "student", label: "Student" },
  { value: "fresher", label: "Fresher / Recent Graduate" },
  { value: "working", label: "Working Professional" },
  { value: "freelancer", label: "Freelancer / Self-Employed" },
  { value: "unemployed", label: "Looking for Opportunities" },
  { value: "career_break", label: "Career Break" },
];

// In-memory cache for university data (fetched once, filtered client-side)
let _uniCache = null;
let _uniCachePromise = null;

async function getUniversityData() {
  if (_uniCache) return _uniCache;
  if (_uniCachePromise) return _uniCachePromise;
  
  _uniCachePromise = (async () => {
    try {
      const res = await fetch(
        'https://raw.githubusercontent.com/Hipo/university-domains-list/master/world_universities_and_domains.json',
        { signal: AbortSignal.timeout(12000) }
      );
      if (res.ok) {
        _uniCache = await res.json();
        return _uniCache;
      }
    } catch {
      // GitHub raw failed
    }
    return null;
  })();
  
  const result = await _uniCachePromise;
  _uniCachePromise = null;
  return result;
}

export async function searchUniversities(query, country = null) {
  if (!query || query.length < 3) return [];
  
  // Try cached HTTPS dataset first
  try {
    const allUnis = await getUniversityData();
    if (allUnis) {
      const q = query.toLowerCase();
      const filtered = allUnis.filter(u => {
        const nameMatch = u.name?.toLowerCase().includes(q);
        const countryMatch = !country || u.country?.toLowerCase() === country.toLowerCase();
        return nameMatch && countryMatch;
      });
      return filtered.slice(0, 15).map(u => ({
        name: u.name,
        domain: u.domains?.[0] || "",
        country: u.country || ""
      }));
    }
  } catch {
    // HTTPS failed, try fallback
  }

  // Fallback: HTTP API (works in dev, may be blocked in prod)
  try {
    let url = `http://universities.hipolabs.com/search?name=${encodeURIComponent(query)}`;
    if (country) {
      url += `&country=${encodeURIComponent(country)}`;
    }
    const res = await fetch(url, { signal: AbortSignal.timeout(5000) });
    if (!res.ok) return [];
    const data = await res.json();
    return data.slice(0, 15).map(u => ({
      name: u.name,
      domain: u.domains?.[0] || "",
      country: u.country || ""
    }));
  } catch {
    return [];
  }
}
