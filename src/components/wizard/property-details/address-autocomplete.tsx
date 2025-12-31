'use client';

import * as React from 'react';
import { useCallback, useEffect, useRef, useState } from 'react';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';
import { IconMapPin, IconLoader2, IconSearch } from '@tabler/icons-react';
import { useDebounce } from '@/hooks/use-debounce';

// =============================================================================
// TYPES
// =============================================================================

interface AddressComponents {
  street: string;
  city: string;
  state: string;
  zip: string;
  country?: string;
  formatted?: string;
}

interface AddressSuggestion {
  placeId: string;
  description: string;
  mainText: string;
  secondaryText: string;
}

interface AddressAutocompleteProps {
  value?: string;
  onChange?: (value: string) => void;
  onAddressSelect?: (address: AddressComponents) => void;
  placeholder?: string;
  disabled?: boolean;
  className?: string;
  error?: string;
}

// =============================================================================
// MOCK SUGGESTIONS (for MVP without Google API key)
// In production, replace with actual Google Places API calls
// =============================================================================

const MOCK_SUGGESTIONS: AddressSuggestion[] = [
  {
    placeId: 'mock_1',
    description: '123 Main Street, Austin, TX 78701, USA',
    mainText: '123 Main Street',
    secondaryText: 'Austin, TX, USA',
  },
  {
    placeId: 'mock_2',
    description: '456 Oak Avenue, Minneapolis, MN 55401, USA',
    mainText: '456 Oak Avenue',
    secondaryText: 'Minneapolis, MN, USA',
  },
  {
    placeId: 'mock_3',
    description: '789 Pine Road, Seattle, WA 98101, USA',
    mainText: '789 Pine Road',
    secondaryText: 'Seattle, WA, USA',
  },
];

// Parse mock address to components
function parseMockAddress(description: string): AddressComponents {
  // Simple parser for mock data
  const parts = description.split(', ');
  const street = parts[0] || '';
  const city = parts[1] || '';
  const stateZip = parts[2] || '';
  const [state, zip] = stateZip.split(' ');
  
  return {
    street,
    city,
    state: state || '',
    zip: zip || '',
    formatted: description,
  };
}

// =============================================================================
// COMPONENT
// =============================================================================

export function AddressAutocomplete({
  value = '',
  onChange,
  onAddressSelect,
  placeholder = 'Start typing an address...',
  disabled = false,
  className,
  error,
}: AddressAutocompleteProps) {
  const [inputValue, setInputValue] = useState(value);
  const [suggestions, setSuggestions] = useState<AddressSuggestion[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [highlightedIndex, setHighlightedIndex] = useState(-1);
  
  const inputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLUListElement>(null);
  
  // Debounce input for API calls
  const debouncedInput = useDebounce(inputValue, 300);
  
  // Fetch suggestions (mock implementation)
  useEffect(() => {
    if (debouncedInput.length < 3) {
      setSuggestions([]);
      return;
    }
    
    setIsLoading(true);
    
    // Simulate API delay
    const timer = setTimeout(() => {
      // Filter mock suggestions based on input
      const filtered = MOCK_SUGGESTIONS.filter(
        (s) =>
          s.description.toLowerCase().includes(debouncedInput.toLowerCase()) ||
          s.mainText.toLowerCase().includes(debouncedInput.toLowerCase())
      );
      
      // If no matches, show all as fallback for demo
      setSuggestions(filtered.length > 0 ? filtered : MOCK_SUGGESTIONS);
      setIsLoading(false);
      setIsOpen(true);
    }, 200);
    
    return () => clearTimeout(timer);
  }, [debouncedInput]);
  
  // Handle input change
  const handleInputChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const newValue = e.target.value;
      setInputValue(newValue);
      onChange?.(newValue);
      setHighlightedIndex(-1);
    },
    [onChange]
  );
  
  // Handle suggestion selection
  const handleSelect = useCallback(
    (suggestion: AddressSuggestion) => {
      setInputValue(suggestion.mainText);
      onChange?.(suggestion.mainText);
      setIsOpen(false);
      setSuggestions([]);
      
      // Parse and emit address components
      const components = parseMockAddress(suggestion.description);
      onAddressSelect?.(components);
    },
    [onChange, onAddressSelect]
  );
  
  // Keyboard navigation
  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (!isOpen || suggestions.length === 0) return;
      
      switch (e.key) {
        case 'ArrowDown':
          e.preventDefault();
          setHighlightedIndex((prev) =>
            prev < suggestions.length - 1 ? prev + 1 : 0
          );
          break;
        case 'ArrowUp':
          e.preventDefault();
          setHighlightedIndex((prev) =>
            prev > 0 ? prev - 1 : suggestions.length - 1
          );
          break;
        case 'Enter':
          e.preventDefault();
          if (highlightedIndex >= 0 && highlightedIndex < suggestions.length) {
            handleSelect(suggestions[highlightedIndex]);
          }
          break;
        case 'Escape':
          e.preventDefault();
          setIsOpen(false);
          break;
      }
    },
    [isOpen, suggestions, highlightedIndex, handleSelect]
  );
  
  // Close on outside click
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (
        inputRef.current &&
        !inputRef.current.contains(e.target as Node) &&
        listRef.current &&
        !listRef.current.contains(e.target as Node)
      ) {
        setIsOpen(false);
      }
    };
    
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);
  
  // Sync external value changes
  useEffect(() => {
    if (value !== inputValue) {
      setInputValue(value);
    }
  }, [value]);
  
  return (
    <div className="relative">
      {/* Input with icon */}
      <div className="relative">
        <div className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
          {isLoading ? (
            <IconLoader2 className="h-4 w-4 animate-spin" />
          ) : (
            <IconSearch className="h-4 w-4" />
          )}
        </div>
        <Input
          ref={inputRef}
          type="text"
          value={inputValue}
          onChange={handleInputChange}
          onKeyDown={handleKeyDown}
          onFocus={() => {
            if (suggestions.length > 0) setIsOpen(true);
          }}
          placeholder={placeholder}
          disabled={disabled}
          className={cn(
            'pl-10',
            error && 'border-destructive focus-visible:ring-destructive',
            className
          )}
          aria-expanded={isOpen}
          aria-haspopup="listbox"
          aria-autocomplete="list"
          role="combobox"
        />
      </div>
      
      {/* Error message */}
      {error && (
        <p className="text-sm text-destructive mt-1">{error}</p>
      )}
      
      {/* Suggestions dropdown */}
      {isOpen && suggestions.length > 0 && (
        <ul
          ref={listRef}
          className="absolute z-50 w-full mt-1 bg-background border rounded-none shadow-lg max-h-60 overflow-auto"
          role="listbox"
        >
          {suggestions.map((suggestion, index) => (
            <li
              key={suggestion.placeId}
              role="option"
              aria-selected={index === highlightedIndex}
              className={cn(
                'px-4 py-3 cursor-pointer transition-colors',
                'hover:bg-muted',
                index === highlightedIndex && 'bg-muted'
              )}
              onClick={() => handleSelect(suggestion)}
              onMouseEnter={() => setHighlightedIndex(index)}
            >
              <div className="flex items-start gap-3">
                <IconMapPin className="h-4 w-4 mt-0.5 text-muted-foreground shrink-0" />
                <div>
                  <p className="font-medium text-sm">{suggestion.mainText}</p>
                  <p className="text-xs text-muted-foreground">
                    {suggestion.secondaryText}
                  </p>
                </div>
              </div>
            </li>
          ))}
        </ul>
      )}
      
      {/* Loading state */}
      {isOpen && isLoading && (
        <div className="absolute z-50 w-full mt-1 bg-background border rounded-none shadow-lg p-4 text-center">
          <IconLoader2 className="h-5 w-5 animate-spin mx-auto text-muted-foreground" />
          <p className="text-sm text-muted-foreground mt-2">
            Searching addresses...
          </p>
        </div>
      )}
      
      {/* No results state */}
      {isOpen && !isLoading && suggestions.length === 0 && inputValue.length >= 3 && (
        <div className="absolute z-50 w-full mt-1 bg-background border rounded-none shadow-lg p-4 text-center">
          <p className="text-sm text-muted-foreground">
            No addresses found. Try a different search.
          </p>
        </div>
      )}
    </div>
  );
}

// =============================================================================
// EXPORTS
// =============================================================================

export type { AddressComponents, AddressSuggestion, AddressAutocompleteProps };
