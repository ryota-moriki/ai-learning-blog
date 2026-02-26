export type Category = '雑学' | '技術' | '実用';

export interface PostFrontmatter {
  title: string;
  description: string;
  slug: string;
  date: string;
  updated?: string;
  category: Category;
  tags: string[];
  thumbnail?: string;
  published: boolean;
}

export interface Post extends PostFrontmatter {
  content: string;
  readingTime: number;
}

export interface PostMeta extends PostFrontmatter {
  readingTime: number;
}
