import { PrismaClient } from '@prisma/client';
import { scrapeLinkedInInternships } from '../lib/scrapers/linkedin-scraper';
import { scrapeGlassdoorInternships } from '../lib/scrapers/glassdoor-scraper';
import { deduplicateWithStats } from '../lib/deduplicator';

const prisma = new PrismaClient();

interface ScrapedPosting {
  company: string;
  roleTitle: string;
  description: string;
  location?: string;
  salary?: string;
  deadline?: string;
  link: string;
  skills: string[];
  sourceBoard: string;
  originalLinks?: string[];
  sourceBoards?: string[];
}

/**
 * Create URL fingerprint for deduplication in database
 */
function createUrlFingerprint(url: string): string {
  try {
    const urlObj = new URL(url);
    const domain = urlObj.hostname.replace('www.', '');
    const pathname = urlObj.pathname.toLowerCase().replace(/\/$/, '');
    return `${domain}${pathname}`;
  } catch {
    return url.toLowerCase().replace(/https?:\/\/(www\.)?/, '').split('?')[0].split('#')[0];
  }
}

/**
 * Scrape internships from multiple job boards
 */
async function scrapeJobs(): Promise<void> {
  console.log(`[${new Date().toISOString()}] Starting job scraping...`);

  try {
    // Scrape from multiple sources
    console.log('Scraping LinkedIn...');
    const linkedInJobs = await scrapeLinkedInInternships('internship');
    console.log(`  Found ${linkedInJobs.length} postings`);

    console.log('Scraping Glassdoor...');
    const glassdoorJobs = await scrapeGlassdoorInternships('internship');
    console.log(`  Found ${glassdoorJobs.length} postings`);

    // Combine and deduplicate
    const allJobs = [...linkedInJobs, ...glassdoorJobs];
    const { deduplicated, totalBefore, totalAfter, duplicatesRemoved } =
      deduplicateWithStats(allJobs);

    console.log(`Deduplication stats:`);
    console.log(`  Total before: ${totalBefore}`);
    console.log(`  Total after: ${totalAfter}`);
    console.log(`  Duplicates removed: ${duplicatesRemoved}`);

    // Store to database
    let createdCount = 0;
    let updatedCount = 0;

    for (const posting of deduplicated) {
      const fingerprint = createUrlFingerprint(posting.originalLinks[0]);
      const links = posting.originalLinks;
      const boards = posting.sourceBoards;

      // Check if posting already exists
      const existing = await prisma.internshipPosting.findFirst({
        where: {
          originalLinks: {
            hasSome: links,
          },
        },
      });

      if (existing) {
        // Update existing posting
        await prisma.internshipPosting.update({
          where: { id: existing.id },
          data: {
            scrapedAt: new Date(),
            originalLinks: {
              set: Array.from(new Set([...existing.originalLinks, ...links])),
            },
            sourceBoards: {
              set: Array.from(new Set([...existing.sourceBoards, ...boards])),
            },
          },
        });
        updatedCount++;
      } else {
        // Create new posting
        const salaryRange = posting.salary
          ? { range: posting.salary }
          : null;

        await prisma.internshipPosting.create({
          data: {
            company: posting.company,
            roleTitle: posting.roleTitle,
            description: posting.description,
            requiredSkills: posting.skills,
            location: posting.location,
            salaryRange,
            applicationDeadline: posting.deadline
              ? new Date(posting.deadline)
              : null,
            originalLinks: links,
            sourceBoards: boards,
            postedDate: new Date(),
            scrapedAt: new Date(),
          },
        });
        createdCount++;
      }
    }

    console.log(`Database operations:`);
    console.log(`  Created: ${createdCount}`);
    console.log(`  Updated: ${updatedCount}`);

    // Archive old postings (older than 30 days)
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const archivedResult = await prisma.internshipPosting.updateMany({
      where: {
        scrapedAt: {
          lt: thirtyDaysAgo,
        },
        isArchived: false,
      },
      data: {
        isArchived: true,
      },
    });

    console.log(`Archived ${archivedResult.count} old postings (older than 30 days)`);

    console.log(`[${new Date().toISOString()}] Job scraping completed successfully`);
  } catch (error) {
    console.error(`[${new Date().toISOString()}] Error during job scraping:`, error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

// Run the scraper
scrapeJobs();
