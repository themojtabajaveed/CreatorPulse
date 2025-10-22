import React, { useState } from 'react';
import { Card } from './ui/Card';
import { Textarea } from './ui/Textarea';
import { Button } from './ui/Button';
import { PlusIcon } from './icons/PlusIcon';
import { TrashIcon } from './icons/TrashIcon';

interface StyleTrainerProps {
  writingStyleSamples: string[];
  setWritingStyleSamples: (samples: string[]) => void;
}

const StyleTrainer: React.FC<StyleTrainerProps> = ({ writingStyleSamples, setWritingStyleSamples }) => {
  const [newSample, setNewSample] = useState('');

  const handleAddSample = (e: React.FormEvent) => {
    e.preventDefault();
    if (newSample.trim()) {
      setWritingStyleSamples([...writingStyleSamples, newSample.trim()]);
      setNewSample('');
    }
  };

  const handleRemoveSample = (index: number) => {
    setWritingStyleSamples(writingStyleSamples.filter((_, i) => i !== index));
  };

  return (
    <Card>
      <h2 className="text-lg font-semibold text-brand-text-primary mb-1">2. Writing Style Trainer</h2>
      <p className="text-sm text-brand-text-secondary mb-4">Add multiple samples of your writing so the AI can learn your voice and tone.</p>
      
      <div className="space-y-2 mb-4">
        {writingStyleSamples.map((sample, index) => (
          <div key={index} className="flex items-start justify-between bg-slate-50 p-3 rounded-md gap-3">
            <p className="text-sm text-brand-text-primary flex-grow break-words">&ldquo;{sample}&rdquo;</p>
            <Button variant="ghost" size="sm" onClick={() => handleRemoveSample(index)} className="flex-shrink-0">
              <TrashIcon className="h-4 w-4 text-slate-500 hover:text-red-600" />
            </Button>
          </div>
        ))}
         {writingStyleSamples.length === 0 && (
          <p className="text-center text-sm text-slate-400 py-4">No writing samples added yet.</p>
        )}
      </div>

      <form onSubmit={handleAddSample} className="space-y-2">
        <Textarea 
          value={newSample}
          onChange={(e) => setNewSample(e.target.value)}
          rows={4}
          placeholder="Paste a new writing sample here..."
        />
        <Button type="submit" size="sm" className="w-full" disabled={!newSample.trim()}>
          <PlusIcon className="h-4 w-4 mr-2" />
          Add Sample
        </Button>
      </form>
    </Card>
  );
};

export default StyleTrainer;