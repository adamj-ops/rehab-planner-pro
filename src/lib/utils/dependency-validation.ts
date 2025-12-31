/**
 * @file dependency-validation.ts
 * @description Utility functions for validating dependencies between scope items
 * and detecting circular dependencies.
 */

export interface DependencyItem {
  id: string;
  name: string;
  depends_on?: string[];
}

/**
 * Detects if adding a dependency would create a circular dependency.
 * Uses DFS (Depth-First Search) to traverse the dependency graph.
 *
 * @param itemId - The ID of the item we're adding a dependency to
 * @param dependencyId - The ID of the dependency we want to add
 * @param allItems - All items with their current dependencies
 * @returns true if adding this dependency would create a cycle, false otherwise
 */
export function detectCircularDependency(
  itemId: string,
  dependencyId: string,
  allItems: DependencyItem[]
): boolean {
  // If trying to depend on itself, that's circular
  if (itemId === dependencyId) {
    return true;
  }

  // Build a map for quick lookup
  const itemMap = new Map<string, DependencyItem>();
  for (const item of allItems) {
    itemMap.set(item.id, item);
  }

  // Check if the dependency (or any of its dependencies) depends on itemId
  // This would create a cycle: itemId -> dependencyId -> ... -> itemId
  const visited = new Set<string>();
  const stack = [dependencyId];

  while (stack.length > 0) {
    const currentId = stack.pop();
    if (!currentId) continue;

    if (currentId === itemId) {
      // Found a path back to the original item - circular dependency!
      return true;
    }

    if (visited.has(currentId)) {
      continue;
    }
    visited.add(currentId);

    const current = itemMap.get(currentId);
    if (current?.depends_on) {
      for (const depId of current.depends_on) {
        if (!visited.has(depId)) {
          stack.push(depId);
        }
      }
    }
  }

  return false;
}

/**
 * Gets the full dependency chain for an item (all items it depends on, recursively).
 *
 * @param itemId - The ID of the item to get dependencies for
 * @param allItems - All items with their current dependencies
 * @returns Array of item IDs in the dependency chain
 */
export function getDependencyChain(
  itemId: string,
  allItems: DependencyItem[]
): string[] {
  const itemMap = new Map<string, DependencyItem>();
  for (const item of allItems) {
    itemMap.set(item.id, item);
  }

  const chain: string[] = [];
  const visited = new Set<string>();
  const stack = [...(itemMap.get(itemId)?.depends_on || [])];

  while (stack.length > 0) {
    const currentId = stack.pop();
    if (!currentId) continue;

    if (visited.has(currentId)) {
      continue;
    }
    visited.add(currentId);
    chain.push(currentId);

    const current = itemMap.get(currentId);
    if (current?.depends_on) {
      for (const depId of current.depends_on) {
        if (!visited.has(depId)) {
          stack.push(depId);
        }
      }
    }
  }

  return chain;
}

/**
 * Gets all items that depend on the given item (reverse dependencies).
 *
 * @param itemId - The ID of the item to check
 * @param allItems - All items with their current dependencies
 * @returns Array of item IDs that depend on this item
 */
export function getDependents(
  itemId: string,
  allItems: DependencyItem[]
): string[] {
  return allItems
    .filter((item) => item.depends_on?.includes(itemId))
    .map((item) => item.id);
}

/**
 * Validates that all dependencies are valid (no circular references, all exist).
 *
 * @param allItems - All items with their current dependencies
 * @returns Object with isValid flag and any errors found
 */
export function validateAllDependencies(
  allItems: DependencyItem[]
): { isValid: boolean; errors: string[] } {
  const errors: string[] = [];
  const itemIds = new Set(allItems.map((item) => item.id));

  for (const item of allItems) {
    if (!item.depends_on) continue;

    for (const depId of item.depends_on) {
      // Check if dependency exists
      if (!itemIds.has(depId)) {
        errors.push(`Item "${item.name}" depends on non-existent item "${depId}"`);
        continue;
      }

      // Check for circular dependency
      if (detectCircularDependency(item.id, depId, allItems)) {
        errors.push(`Circular dependency detected: "${item.name}" -> "${depId}"`);
      }
    }
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
}

/**
 * Removes an item from all dependency lists when it's deleted.
 *
 * @param itemIdToRemove - The ID of the item being removed
 * @param allItems - All items with their current dependencies
 * @returns Updated items with the removed item's ID cleaned from all depends_on arrays
 */
export function cleanupDependenciesOnRemove(
  itemIdToRemove: string,
  allItems: DependencyItem[]
): DependencyItem[] {
  return allItems
    .filter((item) => item.id !== itemIdToRemove)
    .map((item) => ({
      ...item,
      depends_on: item.depends_on?.filter((depId) => depId !== itemIdToRemove) || [],
    }));
}
