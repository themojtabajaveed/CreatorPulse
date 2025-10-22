
import React, { useState } from 'react';
import { Source, SourceType } from '../types';
import { Card } from './ui/Card';
import { Input } from './ui/Input';
import { Select } from './ui/Select';
import { Button } from './ui/Button';
import { PlusIcon } from './icons/PlusIcon';
import { TrashIcon } from './icons/TrashIcon';
import { TwitterIcon } from './icons/TwitterIcon';
import { YoutubeIcon } from './icons/YoutubeIcon';
import { RssIcon } from './icons/RssIcon';

interface SourceManagerProps {
  sources: Source[];
  setSources: React.Dispatch<React.SetStateAction<Source[]>>;
}

const SourceIcon = ({ type }: { type: SourceType }) => {
  switch (type) {
    case SourceType.TWITTER: return <TwitterIcon className="h-5 w-5 text-sky-500" />;
    case SourceType.YOUTUBE: return <YoutubeIcon className="h-5 w-5 text-red-500" />;
    case SourceType.RSS: return <RssIcon className="h-5 w-5 text-orange-500" />;
    default: return null;
  }
};


const SourceManager: React.FC<SourceManagerProps> = ({ sources, setSources }) => {
  const [newSourceType, setNewSourceType] = useState<SourceType>(SourceType.TWITTER);
  const [newSourceValue, setNewSourceValue] = useState('');

  const handleAddSource = (e: React.FormEvent) => {
    e.preventDefault();
    if (newSourceValue.trim()) {
      setSources([...sources, { type: newSourceType, value: newSourceValue.trim() }]);
      setNewSourceValue('');
    }
  };

  const handleRemoveSource = (index: number) => {
    setSources(sources.filter((_, i) => i !== index));
  };
  
  const getPlaceholder = (type: SourceType) => {
      switch (type) {
          case SourceType.TWITTER: return "handle or #hashtag";
          case SourceType.YOUTUBE: return "Channel name";
          case SourceType.RSS: return "RSS feed URL";
          default: return "Source value";
      }
  }

  return (
    <Card>
      <h2 className="text-lg font-semibold text-brand-text-primary mb-1">1. Content Sources</h2>
      <p className="text-sm text-brand-text-secondary mb-4">Add sources for CreatorPulse to monitor.</p>
      
      <form onSubmit={handleAddSource} className="flex flex-col sm:flex-row gap-2 mb-4">
        <Select 
          value={newSourceType} 
          onChange={(e) => setNewSourceType(e.target.value as SourceType)}
          className="flex-shrink-0"
        >
          {Object.values(SourceType).map(type => (
            <option key={type} value={type}>{type}</option>
          ))}
        </Select>
        <Input 
          type="text" 
          value={newSourceValue} 
          onChange={(e) => setNewSourceValue(e.target.value)}
          placeholder={getPlaceholder(newSourceType)}
          className="flex-grow"
        />
        <Button type="submit" variant="icon">
          <PlusIcon className="h-5 w-5" />
        </Button>
      </form>
      
      <div className="space-y-2">
        {sources.map((source, index) => (
          <div key={index} className="flex items-center justify-between bg-slate-50 p-2 rounded-md">
            <div className="flex items-center gap-3">
              <SourceIcon type={source.type} />
              <span className="text-sm text-brand-text-primary truncate">{source.value}</span>
            </div>
            <Button variant="ghost" size="sm" onClick={() => handleRemoveSource(index)}>
              <TrashIcon className="h-4 w-4 text-slate-500 hover:text-red-600" />
            </Button>
          </div>
        ))}
         {sources.length === 0 && (
          <p className="text-center text-sm text-slate-400 py-4">No sources added yet.</p>
        )}
      </div>
    </Card>
  );
};

export default SourceManager;
