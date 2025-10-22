import React, { useState, useCallback, useEffect } from 'react';
import { Source, NewsletterDraft, SourceType, GroundingChunk } from './types';
import { generateNewsletterDraft } from './services/geminiService';
import Header from './components/Header';
import SourceManager from './components/SourceManager';
import StyleTrainer from './components/StyleTrainer';
import NewsletterPreview from './components/NewsletterPreview';
import { Button } from './components/ui/Button';
import { Card } from './components/ui/Card';
import { Select } from './components/ui/Select';
import { Input } from './components/ui/Input';

const App: React.FC = () => {
  const [apiKey, setApiKey] = useState<string>(() => localStorage.getItem('creatorPulseApiKey') || '');
  const [sources, setSources] = useState<Source[]>(() => {
    const savedSources = localStorage.getItem('creatorPulseSources');
    return savedSources ? JSON.parse(savedSources) : [
      { type: SourceType.TWITTER, value: '#ai' },
      { type: SourceType.YOUTUBE, value: 'Marques Brownlee' },
      { type: SourceType.RSS, value: 'https://techcrunch.com/feed/' },
    ];
  });
  const [writingStyle, setWritingStyle] = useState<string[]>(() => {
    const savedStyles = localStorage.getItem('creatorPulseWritingStyle');
    return savedStyles ? JSON.parse(savedStyles) : ['Example: "Hey everyone! Welcome to this week\'s roundup of the most exciting news in tech. We\'ve got some amazing stories for you, so let\'s dive right in!"'];
  });

  const [tone, setTone] = useState<string>('Default (from Style)');
  const [newsletterDraft, setNewsletterDraft] = useState<NewsletterDraft | null>(null);
  const [groundingMetadata, setGroundingMetadata] = useState<GroundingChunk[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    localStorage.setItem('creatorPulseApiKey', apiKey);
  }, [apiKey]);

  useEffect(() => {
    localStorage.setItem('creatorPulseSources', JSON.stringify(sources));
  }, [sources]);

  useEffect(() => {
    localStorage.setItem('creatorPulseWritingStyle', JSON.stringify(writingStyle));
  }, [writingStyle]);

  const handleGenerateDraft = useCallback(async () => {
    if (!apiKey) {
      setError("Please enter your Gemini API key to generate a draft.");
      return;
    }
     if (sources.length === 0 || writingStyle.length === 0) {
      setError("Please add at least one source and provide at least one writing style sample.");
      return;
    }

    setIsLoading(true);
    setError(null);
    setNewsletterDraft(null);
    setGroundingMetadata([]);

    try {
      const { draft, groundingMetadata } = await generateNewsletterDraft(apiKey, sources, writingStyle, tone);
      setNewsletterDraft(draft);
      setGroundingMetadata(groundingMetadata);
    } catch (err) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError("An unknown error occurred while generating the draft.");
      }
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  }, [apiKey, sources, writingStyle, tone]);
  
  const TONE_OPTIONS = ["Default (from Style)", "Professional", "Casual", "Enthusiastic", "Witty", "Urgent"];

  return (
    <div className="min-h-screen bg-slate-50 text-brand-text-primary">
      <Header />
      <main className="container mx-auto p-4 md:p-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
          <div className="lg:col-span-1 flex flex-col gap-8">
            <Card>
              <h2 className="text-lg font-semibold text-brand-text-primary mb-1">Gemini API Key</h2>
              <p className="text-sm text-brand-text-secondary mb-4">
                Enter your API key to use the app. It's stored only in your browser for this session.
              </p>
              <Input
                type="password"
                placeholder="Enter your Gemini API Key..."
                value={apiKey}
                onChange={(e) => setApiKey(e.target.value)}
              />
            </Card>
            <SourceManager sources={sources} setSources={setSources} />
            <StyleTrainer writingStyleSamples={writingStyle} setWritingStyleSamples={setWritingStyle} />
          </div>
          <div className="lg:col-span-2 flex flex-col gap-8">
            <Card>
               <h2 className="text-lg font-semibold text-brand-text-primary mb-1">3. Adjust Tone</h2>
               <p className="text-sm text-brand-text-secondary mb-4">Optionally, select a specific tone for this draft.</p>
               <Select value={tone} onChange={(e) => setTone(e.target.value)}>
                 {TONE_OPTIONS.map(option => (
                   <option key={option} value={option}>{option}</option>
                 ))}
               </Select>
            </Card>
            <div className="sticky top-8">
               <div className="flex justify-end mb-4">
                  <Button 
                    onClick={handleGenerateDraft} 
                    disabled={isLoading || !apiKey || sources.length === 0 || writingStyle.length === 0}
                    className="w-full sm:w-auto"
                  >
                    {isLoading ? 'Generating...' : 'Generate Newsletter Draft'}
                  </Button>
                </div>
              <NewsletterPreview draft={newsletterDraft} isLoading={isLoading} error={error} groundingMetadata={groundingMetadata} />
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default App;