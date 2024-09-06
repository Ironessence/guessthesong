export function cleanSongTitle(title: string): string {
    // Remove anything in parentheses
    let cleanTitle = title.replace(/ *\([^)]*\) */g, "");
    
    // Remove "feat." and anything after it
    cleanTitle = cleanTitle.split(/\s+(?:feat\.?|ft\.?)/i)[0];
    
    // Remove anything after and including a dash
    cleanTitle = cleanTitle.split('-')[0];
    
    // Remove double quotes
    cleanTitle = cleanTitle.replace(/"/g, '');
    
    // Remove any remaining special characters and extra spaces
    cleanTitle = cleanTitle.replace(/[^\w\s]/gi, '');
    
    // Trim any leading or trailing whitespace and convert to lowercase
    return cleanTitle.trim().toLowerCase();
  }