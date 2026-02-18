/**
 * Sorts an array of objects by a specified property using Lithuanian locale.
 * This ensures that Lithuanian characters (ą, č, ę, ė, į, š, ų, ū, ž) are sorted correctly.
 * For example, 'č' will be sorted close to 'c' as per Lithuanian alphabet.
 * 
 * @param array - The array to sort
 * @param property - The property name to sort by
 * @returns A new sorted array
 */
export function sortByPropertyLt<T>(array: T[], property: keyof T): T[] {
  return [...array].sort((a, b) => {
    const aValue = a[property];
    const bValue = b[property];
    
    // Handle null/undefined values
    if (aValue == null) return 1;
    if (bValue == null) return -1;
    
    // Convert to strings for comparison
    const aStr = String(aValue);
    const bStr = String(bValue);
    
    // Use Lithuanian locale for comparison
    return aStr.localeCompare(bStr, 'lt', { sensitivity: 'base' });
  });
}
