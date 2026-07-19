export interface JobPosting {
  company: string;
  roleTitle: string;
  description: string;
  location?: string;
  salary?: string;
  deadline?: string;
  link: string;
  skills: string[];
  sourceBoard: string;
}

export interface DedupedPosting extends JobPosting {
  originalLinks: string[];
  sourceBoards: string[];
}

/**
 * Normalize URL for fingerprinting
 * Removes query params, fragments, protocol, www, trailing slashes
 */
function createUrlFingerprint(url: string): string {
  try {
    const urlObj = new URL(url);
    // Remove protocol, www, query params, and hash
    const domain = urlObj.hostname.replace('www.', '');
    const pathname = urlObj.pathname.toLowerCase().replace(/\/$/, '');
    return `${domain}${pathname}`;
  } catch {
    // If URL is invalid, return normalized version
    return url.toLowerCase().replace(/https?:\/\/(www\.)?/, '').split('?')[0].split('#')[0];
  }
}

/**
 * Deduplicate job postings by URL fingerprint
 * Merges originalLinks and sourceBoards for duplicate entries
 */
export function deduplicatePostings(postings: JobPosting[]): DedupedPosting[] {
  const fingerprintMap = new Map<string, DedupedPosting>();

  for (const posting of postings) {
    const fingerprint = createUrlFingerprint(posting.link);

    if (fingerprintMap.has(fingerprint)) {
      // Duplicate found - merge data
      const existing = fingerprintMap.get(fingerprint)!;

      // Add link if not already present
      if (!existing.originalLinks.includes(posting.link)) {
        existing.originalLinks.push(posting.link);
      }

      // Add source board if not already present
      if (!existing.sourceBoards.includes(posting.sourceBoard)) {
        existing.sourceBoards.push(posting.sourceBoard);
      }

      // Merge skills (dedup)
      const skillSet = new Set([...existing.skills, ...posting.skills]);
      existing.skills = Array.from(skillSet);
    } else {
      // New posting
      const dedupedPosting: DedupedPosting = {
        ...posting,
        originalLinks: [posting.link],
        sourceBoards: [posting.sourceBoard],
      };
      fingerprintMap.set(fingerprint, dedupedPosting);
    }
  }

  return Array.from(fingerprintMap.values());
}

/**
 * Get deduplicated postings with additional stats
 */
export function deduplicateWithStats(
  postings: JobPosting[]
): {
  deduplicated: DedupedPosting[];
  totalBefore: number;
  totalAfter: number;
  duplicatesRemoved: number;
} {
  const deduplicated = deduplicatePostings(postings);
  return {
    deduplicated,
    totalBefore: postings.length,
    totalAfter: deduplicated.length,
    duplicatesRemoved: postings.length - deduplicated.length,
  };
}
