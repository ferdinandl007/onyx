import React, { useState, useEffect, useCallback } from "react";
import { Tag } from "@/lib/types";
import { Input } from "@/components/ui/input";
import { getValidTags, TagResponseWithPagination } from "@/lib/tags/tagUtils";
import { FiTag, FiX } from "react-icons/fi";

// Simple chip component for the selected key
const TagKeyChip = ({ tagKey, onRemove }: { tagKey: string; onRemove: () => void }) => {
  return (
    <div className="flex items-center bg-background-100 text-sm rounded-full px-2 py-1 gap-1 max-w-fit">
      <FiTag size={14} className="text-neutral-600" />
      <span className="font-medium">{tagKey}</span>
      <FiX
        size={14}
        className="cursor-pointer hover:text-destructive ml-1"
        onClick={onRemove}
      />
    </div>
  );
};

export const SelectableDropdown = ({
  value,
  selected,
  icon,
  toggle,
  isKey = false,
}: {
  value: string;
  selected: boolean;
  icon?: React.ReactNode;
  toggle: () => void;
  isKey?: boolean;
}) => {
  return (
    <div
      key={value}
      className={`p-2 flex gap-x-2 items-center rounded cursor-pointer transition-colors duration-200 ${
        selected
          ? "bg-background-200 dark:bg-neutral-800"
          : "hover:bg-background-100 dark:hover:bg-neutral-800"
      } ${isKey ? "font-medium" : ""}`}
      onClick={toggle}
    >
      {icon && <div className="flex-none">{icon}</div>}
      <span className="text-sm">{value}</span>
    </div>
  );
};

export function TagFilter({
  tags,
  selectedTags,
  setSelectedTags,
}: {
  tags: Tag[];
  selectedTags: Tag[];
  setSelectedTags: React.Dispatch<React.SetStateAction<Tag[]>>;
}) {
  const [filterValue, setFilterValue] = useState("");
  const [filteredTags, setFilteredTags] = useState<Tag[]>([]);
  const [selectedKey, setSelectedKey] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [pagination, setPagination] = useState<{
    offset: number;
    hasMore: boolean;
    total?: number;
  }>({
    offset: 0,
    hasMore: true,
    total: undefined,
  });
  const [allKeys, setAllKeys] = useState<string[]>([]);
  const PAGE_SIZE = 100; // Match backend default
  
  // Extract unique keys from tags and load initial tag suggestions
  useEffect(() => {
    const loadInitialTags = async () => {
      setLoading(true);
      try {
        // Reset pagination
        setPagination({
          offset: 0,
          hasMore: true,
          total: undefined
        });
        
        // Fetch first page of tags
        let pattern = filterValue;
        if (selectedKey) {
          pattern = `${selectedKey}=${filterValue}`;
        }
        
        const response = await getValidTags(pattern, null, 0, PAGE_SIZE);
        
        setFilteredTags(response.tags);
        setPagination({
          offset: PAGE_SIZE,
          hasMore: response.pagination?.has_more || false,
          total: response.pagination?.total,
        });
        
        // Extract unique keys
        if (!selectedKey) {
          const uniqueKeys = Array.from(new Set(response.tags.map(tag => tag.tag_key)));
          setAllKeys(uniqueKeys);
        }
      } catch (error) {
        console.error("Error loading initial tags:", error);
      } finally {
        setLoading(false);
      }
    };
    
    loadInitialTags();
  }, [filterValue, selectedKey]);
  
  // Handle scroll event to load more tags
  const handleScroll = useCallback(async (e: React.UIEvent<HTMLDivElement>) => {
    const { scrollTop, scrollHeight, clientHeight } = e.currentTarget;
    
    // Only trigger when close to bottom and there's more to load
    if (
      scrollHeight - scrollTop <= clientHeight + 100 && 
      pagination.hasMore && 
      !loading
    ) {
      setLoading(true);
      try {
        let pattern = filterValue;
        if (selectedKey) {
          pattern = `${selectedKey}=${filterValue}`;
        }
        
        // Load next page of tags
        const response = await getValidTags(
          pattern, 
          null, 
          pagination.offset, 
          PAGE_SIZE
        );
        
        if (response.tags.length > 0) {
          // Merge with existing tags, avoiding duplicates
          setFilteredTags(prevTags => {
            const existingIds = new Set(prevTags.map(t => `${t.tag_key}:${t.tag_value}`));
            const newTags = response.tags.filter(
              t => !existingIds.has(`${t.tag_key}:${t.tag_value}`)
            );
            return [...prevTags, ...newTags];
          });
        }
        
        // Update pagination state
        setPagination({
          offset: pagination.offset + PAGE_SIZE,
          hasMore: response.pagination?.has_more || false,
          total: response.pagination?.total || pagination.total,
        });
      } catch (error) {
        console.error("Error loading more tags:", error);
      } finally {
        setLoading(false);
      }
    }
  }, [loading, filterValue, selectedKey, pagination]);
  
  // Select a key to then pick a value
  const selectKey = useCallback((key: string) => {
    setSelectedKey(key);
    setFilterValue("");
    
    // Reset pagination when selecting a key
    setPagination({
      offset: 0,
      hasMore: true,
      total: undefined,
    });
    
    // Initial values will be loaded by the useEffect
  }, []);
  
  // Remove selected key to go back to key selection
  const removeKey = useCallback(() => {
    setSelectedKey(null);
    setFilterValue("");
    
    // Reset pagination when removing a key
    setPagination({
      offset: 0,
      hasMore: true,
      total: undefined,
    });
    
    // Initial keys will be loaded by the useEffect
  }, []);
  
  // Add a complete tag (key+value) to selected tags
  const toggleTag = useCallback((tag: Tag) => {
    // Only add/remove complete tags (with both key and value)
    const isSelected = selectedTags.some(
      (t) => t.tag_key === tag.tag_key && t.tag_value === tag.tag_value
    );
    
    if (isSelected) {
      // Remove existing tag
      setSelectedTags((prev) =>
        prev.filter(
          (t) => t.tag_key !== tag.tag_key || t.tag_value !== tag.tag_value
        )
      );
    } else {
      // Only add if we have both key and value
      if (selectedKey && tag.tag_value) {
        setSelectedTags((prev) => [...prev, tag]);
        
        // After adding a complete tag, go back to key selection
        setSelectedKey(null);
        setFilterValue("");
        
        // Reset pagination
        setPagination({
          offset: 0,
          hasMore: true,
          total: undefined,
        });
      }
    }
  }, [selectedKey, selectedTags, setSelectedTags]);

  // Check if a tag is already selected
  const isTagSelected = useCallback((tag: Tag) =>
    selectedTags.some(
      (t) => t.tag_key === tag.tag_key && t.tag_value === tag.tag_value
    ), [selectedTags]);

  return (
    <div className="pt-4 h-full flex flex-col w-full">
      <div className="flex flex-col gap-2 pb-2 px-4">
        {/* Display selected key as a chip */}
        {selectedKey && (
          <div className="flex items-center mb-2">
            <TagKeyChip tagKey={selectedKey} onRemove={removeKey} />
            <span className="ml-2 text-xs text-neutral-500">Now select a value</span>
          </div>
        )}
        
        {/* Search input */}
        <Input
          placeholder={selectedKey ? "Filter values..." : "Search for tag keys..."}
          value={filterValue}
          onChange={(e) => setFilterValue(e.target.value)}
          className="border border-text-subtle w-full"
        />
      </div>
      
      {/* Tag list with scroll loading */}
      <div 
        className="space-y-1 border-t pt-2 border-t-text-subtle px-4 default-scrollbar w-full max-h-64 overflow-y-auto"
        onScroll={handleScroll}
      >
        {!selectedKey ? (
          // Show keys when no key is selected
          filteredTags.length > 0 ? (
            // Map unique keys
            filteredTags.map((tag, index) => (
              <SelectableDropdown
                key={`key-${tag.tag_key}-${index}`}
                value={tag.tag_key}
                selected={false}
                toggle={() => selectKey(tag.tag_key)}
                isKey={true}
                icon={<FiTag size={14} />}
              />
            ))
          ) : !loading ? (
            <div className="py-2 text-center text-sm text-muted-foreground">
              No tag keys found
            </div>
          ) : null
        ) : (
          // Show values for the selected key
          filteredTags.length > 0 ? (
            filteredTags.map((tag, index) => (
              <SelectableDropdown
                key={`value-${tag.tag_value}-${index}`}
                value={tag.tag_value}
                selected={isTagSelected(tag)}
                toggle={() => toggleTag(tag)}
              />
            ))
          ) : !loading ? (
            <div className="py-2 text-center text-sm text-muted-foreground">
              No values found for {selectedKey}
            </div>
          ) : null
        )}
        
        {/* Progress counters (only show in development or with ?debug=1) */}
        {window.location.search.includes('debug=1') && pagination.total && (
          <div className="text-center text-xs text-neutral-400 py-1">
            Showing {filteredTags.length} of {pagination.total} items
          </div>
        )}
        
        {/* Loading indicator */}
        {loading && (
          <div className="py-2 text-center text-sm text-neutral-500">
            Loading...
          </div>
        )}
      </div>
    </div>
  );
}
