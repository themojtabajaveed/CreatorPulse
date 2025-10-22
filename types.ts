export enum SourceType {
  TWITTER = 'Twitter',
  YOUTUBE = 'YouTube',
  RSS = 'RSS Feed',
}

export interface Source {
  type: SourceType;
  value: string;
}

export interface CuratedLink {
  title: string;
  url: string;
  summary: string;
}

export interface Trend {
  title: string;
  explainer: string;
  link: string;
}

export interface NewsletterDraft {
  subject: string;
  introduction: string;
  curatedLinks: CuratedLink[];
  trendsToWatch: Trend[];
}

export interface WebSource {
  uri: string;
  title: string;
}

export interface GroundingChunk {
  web: WebSource;
}
