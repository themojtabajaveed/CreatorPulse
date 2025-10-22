import React, { useState, useEffect, useCallback } from 'react';
import { NewsletterDraft, CuratedLink, Trend, GroundingChunk } from '../types';
import { Card } from './ui/Card';
import { Button } from './ui/Button';
import { Input } from './ui/Input';
import { Textarea } from './ui/Textarea';
import { ThumbsUpIcon } from './icons/ThumbsUpIcon';
import { ThumbsDownIcon } from './icons/ThumbsDownIcon';
import { CopyIcon } from './icons/CopyIcon';
import { EditIcon } from './icons/EditIcon';
import { CheckIcon } from './icons/CheckIcon';
import { LinkIcon } from './icons/LinkIcon';
import { SendIcon } from './icons/SendIcon';

interface NewsletterPreviewProps {
  draft: NewsletterDraft | null;
  isLoading: boolean;
  error: string | null;
  groundingMetadata: GroundingChunk[];
}

const LoadingSkeleton: React.FC = () => (
  <div className="animate-pulse space-y-6">
    <div className="h-6 bg-slate-200 rounded w-3/4"></div>
    <div className="space-y-3">
      <div className="h-4 bg-slate-200 rounded"></div>
      <div className="h-4 bg-slate-200 rounded w-5/6"></div>
    </div>
    <div className="h-5 bg-slate-200 rounded w-1/4 mb-4 mt-6"></div>
    <div className="space-y-4">
      {[...Array(3)].map((_, i) => (
        <div key={i} className="space-y-2">
          <div className="h-5 bg-slate-200 rounded w-1/2"></div>
          <div className="h-3 bg-slate-200 rounded"></div>
          <div className="h-3 bg-slate-200 rounded w-5/6"></div>
        </div>
      ))}
    </div>
  </div>
);

const NewsletterPreview: React.FC<NewsletterPreviewProps> = ({ draft, isLoading, error, groundingMetadata }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editedDraft, setEditedDraft] = useState<NewsletterDraft | null>(draft);
  const [copied, setCopied] = useState(false);
  const [feedback, setFeedback] = useState<'up' | 'down' | null>(null);

  useEffect(() => {
    setEditedDraft(draft);
    setIsEditing(false);
    setFeedback(null);
  }, [draft]);

  const handleEditToggle = useCallback(() => {
    setIsEditing(prev => !prev);
  }, []);

  const handleCopy = useCallback(() => {
    if (!editedDraft) return;
    const textToCopy = `Subject: ${editedDraft.subject}\n\n${editedDraft.introduction}\n\nCURATED LINKS\n\n${editedDraft.curatedLinks.map(link => `${link.title}\n${link.summary}\n${link.url}`).join('\n\n')}\n\nTRENDS TO WATCH\n\n${editedDraft.trendsToWatch.map(trend => `${trend.title}\n${trend.explainer}\n${trend.link}`).join('\n\n')}`;
    navigator.clipboard.writeText(textToCopy);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }, [editedDraft]);

  const handleSendEmail = useCallback(() => {
    if (!editedDraft) return;

    const formatToHtml = (draftData: NewsletterDraft): string => {
      const styles = {
        body: 'font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif, "Apple Color Emoji", "Segoe UI Emoji", "Segoe UI Symbol"; color: #1e293b; line-height: 1.6;',
        h2: 'font-size: 20px; font-weight: 600; margin-top: 24px; margin-bottom: 16px; border-bottom: 1px solid #e2e8f0; padding-bottom: 8px;',
        h3: 'font-size: 18px; font-weight: 600; margin-bottom: 4px; margin-top: 0;',
        p: 'margin-top: 0; margin-bottom: 16px;',
        a: 'color: #4f46e5; text-decoration: none;',
        linkBlock: 'margin-bottom: 24px;',
      };

      let html = `<div style="${styles.body}">`;
      
      html += `<p style="${styles.p}">${draftData.introduction.replace(/\n/g, '<br>')}</p>`;
      
      html += `<h2 style="${styles.h2}">Curated Links</h2>`;
      draftData.curatedLinks.forEach(link => {
        html += `<div style="${styles.linkBlock}">`;
        html += `<h3 style="${styles.h3}">${link.title}</h3>`;
        html += `<p style="${styles.p}">${link.summary}</p>`;
        html += `<a href="${link.url}" style="${styles.a}">${link.url}</a>`;
        html += `</div>`;
      });
      
      html += `<h2 style="${styles.h2}">Trends to Watch</h2>`;
      draftData.trendsToWatch.forEach(trend => {
        html += `<div style="${styles.linkBlock}">`;
        html += `<h3 style="${styles.h3}">${trend.title}</h3>`;
        html += `<p style="${styles.p}">${trend.explainer}</p>`;
        html += `<a href="${trend.link}" style="${styles.a}">${trend.link}</a>`;
        html += `</div>`;
      });
      
      html += '</div>';
      return html;
    };

    const subject = encodeURIComponent(editedDraft.subject);
    const body = encodeURIComponent(formatToHtml(editedDraft));
    
    const mailtoLink = `mailto:?subject=${subject}&body=${body}`;

    if (mailtoLink.length > 2000) {
      alert("The newsletter is too long to send directly. Please use the 'Copy' button and paste it into your email client manually.");
      return;
    }

    window.location.href = mailtoLink;

  }, [editedDraft]);

  const handleFeedback = useCallback((type: 'up' | 'down') => {
    setFeedback(type);
    // In a real application, this feedback would be sent to a server.
  }, []);

  const handleDraftChange = (field: keyof NewsletterDraft, value: string) => {
    setEditedDraft(prev => prev ? { ...prev, [field]: value } : null);
  };
  
  const handleLinkChange = (index: number, field: keyof CuratedLink, value: string) => {
    setEditedDraft(prev => {
        if (!prev) return null;
        const newLinks = [...prev.curatedLinks];
        newLinks[index] = { ...newLinks[index], [field]: value };
        return { ...prev, curatedLinks: newLinks };
    });
  };

  const handleTrendChange = (index: number, field: keyof Trend, value: string) => {
     setEditedDraft(prev => {
        if (!prev) return null;
        const newTrends = [...prev.trendsToWatch];
        newTrends[index] = { ...newTrends[index], [field]: value };
        return { ...prev, trendsToWatch: newTrends };
    });
  };


  const renderContent = () => {
    if (isLoading) return <LoadingSkeleton />;
    if (error) return <p className="text-center text-red-600 bg-red-50 p-4 rounded-lg">{error}</p>;
    if (!editedDraft) {
      return (
        <div className="text-center py-16">
          <h3 className="text-lg font-medium text-brand-text-primary">Your Draft Awaits</h3>
          <p className="text-brand-text-secondary mt-1">Configure your sources and style, then click "Generate" to see the magic happen.</p>
        </div>
      );
    }
    
    if (isEditing) {
       return (
        <div className="space-y-6">
          <div>
            <label className="text-sm font-medium text-slate-600">Subject</label>
            <Input value={editedDraft.subject} onChange={e => handleDraftChange('subject', e.target.value)} className="mt-1" />
          </div>
          <div>
            <label className="text-sm font-medium text-slate-600">Introduction</label>
            <Textarea value={editedDraft.introduction} onChange={e => handleDraftChange('introduction', e.target.value)} rows={5} className="mt-1" />
          </div>
          
          <div>
            <h3 className="font-semibold text-xl mt-8 mb-4">Curated Links</h3>
            {editedDraft.curatedLinks.map((link, index) => (
              <div key={index} className="mb-4 p-4 border bg-slate-50 rounded-lg space-y-2">
                <Input aria-label="Link Title" value={link.title} onChange={e => handleLinkChange(index, 'title', e.target.value)} placeholder="Title" />
                <Textarea aria-label="Link Summary" value={link.summary} onChange={e => handleLinkChange(index, 'summary', e.target.value)} placeholder="Summary" rows={3}/>
                <Input aria-label="Link URL" value={link.url} onChange={e => handleLinkChange(index, 'url', e.target.value)} placeholder="URL" />
              </div>
            ))}
          </div>
          
          <div>
            <h3 className="font-semibold text-xl mt-8 mb-4">Trends to Watch</h3>
            {editedDraft.trendsToWatch.map((trend, index) => (
              <div key={index} className="mb-4 p-4 border bg-slate-50 rounded-lg space-y-2">
                <Input aria-label="Trend Title" value={trend.title} onChange={e => handleTrendChange(index, 'title', e.target.value)} placeholder="Title" />
                <Textarea aria-label="Trend Explainer" value={trend.explainer} onChange={e => handleTrendChange(index, 'explainer', e.target.value)} placeholder="Explainer" rows={2}/>
                <Input aria-label="Trend Link" value={trend.link} onChange={e => handleTrendChange(index, 'link', e.target.value)} placeholder="URL" />
              </div>
            ))}
          </div>
        </div>
      );
    }

    return (
      <div className="prose prose-slate max-w-none">
        <h2 className="text-2xl font-bold !mb-2">Subject: {editedDraft.subject}</h2>
        <hr className="my-6" />
        <p>{editedDraft.introduction}</p>
        
        <h3 className="font-semibold text-xl mt-8 mb-4">Curated Links</h3>
        {editedDraft.curatedLinks.map((link, index) => (
          <div key={index} className="mb-6 p-4 border-l-4 border-brand-primary bg-slate-50 rounded-r-lg">
            <h4 className="font-bold !mt-0 !mb-1">{link.title}</h4>
            <p className="text-sm !my-0">{link.summary}</p>
            <a href={link.url} target="_blank" rel="noopener noreferrer" className="text-sm text-brand-primary hover:underline break-all">{link.url}</a>
          </div>
        ))}

        <h3 className="font-semibold text-xl mt-8 mb-4">Trends to Watch</h3>
        <ul className="list-disc pl-5">
            {editedDraft.trendsToWatch.map((trend, index) => (
            <li key={index} className="mb-4">
                <strong className="block">{trend.title}</strong>
                <p className="!my-0">{trend.explainer}</p>
                <a href={trend.link} target="_blank" rel="noopener noreferrer" className="text-sm text-brand-primary hover:underline break-all">{trend.link}</a>
            </li>
            ))}
        </ul>
      </div>
    );
  };

  return (
    <Card>
      <div className="flex justify-between items-start mb-4 gap-4">
        <h2 className="text-lg font-semibold text-brand-text-primary">4. Generated Draft</h2>
        {draft && (
          <div className="flex items-center flex-shrink-0 gap-2">
            <Button variant="secondary" size="sm" onClick={handleEditToggle}>
              {isEditing ? <CheckIcon className="h-5 w-5" /> : <EditIcon className="h-5 w-5" />}
              <span className="ml-1.5 hidden sm:inline">{isEditing ? 'Save' : 'Edit'}</span>
            </Button>
            <Button variant="secondary" size="sm" onClick={handleCopy} disabled={isEditing}>
              <CopyIcon className="h-5 w-5" />
              <span className="ml-1.5 hidden sm:inline">{copied ? 'Copied!' : 'Copy'}</span>
            </Button>
            <Button variant="secondary" size="sm" onClick={handleSendEmail} disabled={isEditing}>
              <SendIcon className="h-5 w-5" />
              <span className="ml-1.5 hidden sm:inline">Send Email</span>
            </Button>
          </div>
        )}
      </div>
      <div className="min-h-[400px]">
        {renderContent()}
      </div>
       {draft && !isEditing && (
        <>
        {groundingMetadata && groundingMetadata.length > 0 && (
          <div className="mt-6 pt-4 border-t">
            <h4 className="text-sm font-semibold text-slate-600 mb-2 flex items-center">
              <LinkIcon className="h-4 w-4 mr-2 text-slate-400" />
              Sources
            </h4>
            <ul className="space-y-1">
              {groundingMetadata.map((chunk, index) => (
                <li key={index}>
                  <a href={chunk.web.uri} target="_blank" rel="noopener noreferrer" className="text-xs text-blue-600 hover:underline truncate block" title={chunk.web.title}>
                    {chunk.web.title || chunk.web.uri}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        )}
        <div className="mt-6 pt-4 border-t flex items-center justify-center gap-2 sm:gap-4">
          <p className="text-sm text-slate-500">Was this draft helpful?</p>
          <div className="flex items-center gap-1">
            <Button aria-label="Good draft" variant="ghost" size="sm" onClick={() => handleFeedback('up')} disabled={!!feedback}>
              <ThumbsUpIcon className={`h-5 w-5 transition-colors ${feedback === 'up' ? 'text-green-500' : 'text-slate-400 hover:text-green-500'}`} />
            </Button>
            <Button aria-label="Bad draft" variant="ghost" size="sm" onClick={() => handleFeedback('down')} disabled={!!feedback}>
              <ThumbsDownIcon className={`h-5 w-5 transition-colors ${feedback === 'down' ? 'text-red-500' : 'text-slate-400 hover:text-red-500'}`} />
            </Button>
          </div>
          {feedback && <p className="text-sm text-brand-primary font-medium">Thanks for your feedback!</p>}
        </div>
        </>
      )}
    </Card>
  );
};

export default NewsletterPreview;