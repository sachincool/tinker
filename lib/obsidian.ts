// Obsidian integration utilities
// In a real implementation, this would connect to your Obsidian vault via GitHub Actions

export interface ObsidianNote {
  title: string;
  content: string;
  tags: string[];
  created: string;
  modified: string;
  type: 'post' | 'til';
}

export interface ObsidianGraph {
  nodes: Array<{
    id: string;
    name: string;
    type: 'note' | 'tag';
    size: number;
  }>;
  links: Array<{
    source: string;
    target: string;
  }>;
}

// Mock data for demo - in real app, this would fetch from your vault
export const mockObsidianData: ObsidianNote[] = [
  {
    title: "Modern React Patterns",
    content: "# Modern React Patterns\n\nExploring compound components, render props, and custom hooks...",
    tags: ["react", "javascript", "patterns"],
    created: "2025-09-08",
    modified: "2025-09-08",
    type: "post"
  },
  {
    title: "CSS Grid auto-fit vs auto-fill",
    content: "The difference is subtle but important for responsive layouts...",
    tags: ["css", "responsive"],
    created: "2025-09-10",
    modified: "2025-09-10",
    type: "til"
  }
];

export async function syncFromObsidian(): Promise<ObsidianNote[]> {
  // In real implementation:
  // 1. Connect to GitHub API
  // 2. Fetch markdown files from your Obsidian vault repo
  // 3. Parse frontmatter and content
  // 4. Return structured data
  
  return new Promise((resolve) => {
    setTimeout(() => resolve(mockObsidianData), 1000);
  });
}

export async function publishToObsidian(note: Partial<ObsidianNote>): Promise<boolean> {
  // In real implementation:
  // 1. Create markdown file with frontmatter
  // 2. Commit to GitHub repo
  // 3. Trigger rebuild of site
  
  console.log('Publishing to Obsidian vault:', note);
  return new Promise((resolve) => {
    setTimeout(() => resolve(true), 1000);
  });
}

export function generateGraph(notes: ObsidianNote[]): ObsidianGraph {
  const nodes = new Map();
  const links: Array<{ source: string; target: string }> = [];

  // Add note nodes
  notes.forEach(note => {
    nodes.set(note.title, {
      id: note.title,
      name: note.title,
      type: 'note',
      size: note.content.length / 100
    });

    // Add tag nodes and links
    note.tags.forEach(tag => {
      if (!nodes.has(tag)) {
        nodes.set(tag, {
          id: tag,
          name: tag,
          type: 'tag',
          size: 5
        });
      }
      links.push({ source: note.title, target: tag });
    });
  });

  return {
    nodes: Array.from(nodes.values()),
    links
  };
}
