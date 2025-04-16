
/**
 * Utility functions for location services
 */

/**
 * Formats a location string by removing certain prefixes and trimming excess information
 * Often LocationIQ returns verbose location strings with repetitive information
 */
export function formatLocationString(location: string): string {
  if (!location) return "";

  // Extract the main part of the location (usually the first part before the comma)
  const parts = location.split(", ");
  
  // Simple case: If it's short enough already, return as is
  if (location.length < 40) return location;
  
  // Check if we have a city/town and country format
  if (parts.length >= 2) {
    // Return "City, Country" format if possible
    const lastPart = parts[parts.length - 1];
    const firstPart = parts[0];

    // If there are multiple parts, try to create a simplified version
    if (parts.length > 2) {
      // Try to include region/state if available
      const secondLastPart = parts[parts.length - 2];
      
      // Return "City, State, Country" format
      return `${firstPart}, ${secondLastPart}, ${lastPart}`;
    }
    
    // Return "City, Country" if just two parts
    return `${firstPart}, ${lastPart}`;
  }
  
  return location;
}
