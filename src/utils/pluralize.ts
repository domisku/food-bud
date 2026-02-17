/**
 * Get the correct Lithuanian plural form for the word "category" (kategorija)
 * based on the count
 * @param count The number of categories
 * @returns The correctly pluralized word
 */
export function getPluralizedCategoryWord(count: number): string {
  if (count === 1) {
    return "kategorija";
  }
  
  // For numbers ending in 2-9 (except 12-19), use "kategorijos"
  if (
    count % 10 >= 2 &&
    count % 10 <= 9 &&
    (count % 100 < 10 || count % 100 >= 20)
  ) {
    return "kategorijos";
  }
  
  // For all other cases (0, 10+, 11-19), use "kategorijų"
  return "kategorijų";
}
