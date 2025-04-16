
import { useState, useEffect, useRef } from "react";
import { Check, ChevronsUpDown, Loader2, AlertCircle } from "lucide-react";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem } from "@/components/ui/command";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type Location = {
  display_name: string;
  place_id: string;
};

interface LocationAutocompleteProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
  disabled?: boolean;
}

const API_KEY = "pk.bd5f215e5934700ff0248a2a9809c98d";

export function LocationAutocomplete({
  value,
  onChange,
  placeholder = "Search for a location...",
  className,
  disabled = false,
}: LocationAutocompleteProps) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [locations, setLocations] = useState<Location[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const debounceTimerRef = useRef<NodeJS.Timeout | null>(null);

  // Clear the debounce timer when component unmounts
  useEffect(() => {
    return () => {
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }
    };
  }, []);

  const fetchLocations = async (searchQuery: string) => {
    if (searchQuery.trim().length < 2) {
      setLocations([]);
      setError(null);
      return;
    }
    
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(
        `https://api.locationiq.com/v1/autocomplete?key=${API_KEY}&q=${encodeURIComponent(
          searchQuery
        )}&limit=5&dedupe=1&tag=place:city,place:town,place:village,place:hamlet`
      );
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => null);
        console.error("LocationIQ API error:", response.status, errorData);
        throw new Error(`API error: ${response.status} ${errorData?.error || ''}`);
      }
      
      const data = await response.json();
      
      // Handle different response formats
      // Sometimes the API returns an object with error info instead of an array
      if (data && Array.isArray(data)) {
        setLocations(data);
      } else if (data && typeof data === 'object' && data.error) {
        console.error("LocationIQ API returned error:", data.error);
        setError(`API Error: ${data.error}`);
        setLocations([]);
      } else {
        // Empty results
        setLocations([]);
      }
    } catch (error) {
      console.error("Error fetching locations:", error);
      setError(error instanceof Error ? error.message : "Failed to fetch locations");
      setLocations([]);
    } finally {
      setLoading(false);
    }
  };

  const debouncedFetch = (searchQuery: string) => {
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
    }

    debounceTimerRef.current = setTimeout(() => {
      fetchLocations(searchQuery);
    }, 300);
  };

  const handleSearch = (inputValue: string) => {
    setQuery(inputValue);
    debouncedFetch(inputValue);
  };

  const handleSelect = (selectedLocation: string) => {
    onChange(selectedLocation);
    setOpen(false);
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className={cn("w-full justify-between", className)}
          disabled={disabled}
        >
          <span className="truncate">{value || placeholder}</span>
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[300px] p-0">
        <Command>
          <CommandInput
            placeholder="Search locations..."
            value={query}
            onValueChange={handleSearch}
          />
          {loading && (
            <div className="flex items-center justify-center p-4">
              <Loader2 className="h-4 w-4 animate-spin" />
              <span className="ml-2">Searching locations...</span>
            </div>
          )}
          {error && (
            <div className="flex items-center justify-center p-4 text-red-500 text-sm">
              <AlertCircle className="h-4 w-4 mr-2" />
              <span>{error}</span>
            </div>
          )}
          <CommandEmpty>
            {query.length > 0 && !error ? "No locations found." : "Type to search locations..."}
          </CommandEmpty>
          <CommandGroup>
            {locations && locations.length > 0 ? locations.map((location) => (
              <CommandItem
                key={location.place_id}
                value={location.place_id}
                onSelect={() => handleSelect(location.display_name)}
              >
                <Check
                  className={cn(
                    "mr-2 h-4 w-4",
                    value === location.display_name ? "opacity-100" : "opacity-0"
                  )}
                />
                {location.display_name}
              </CommandItem>
            )) : null}
          </CommandGroup>
        </Command>
      </PopoverContent>
    </Popover>
  );
}
