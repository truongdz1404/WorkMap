import { useState } from 'react';
import { Story, Category } from '../types';
import { CATEGORIES } from '../constants';
import StoryCard from './StoryCard';
import { Input } from './ui/input';
import { ScrollArea } from './ui/scroll-area';
import { Search, Filter, Map as MapIcon, List, Database } from 'lucide-react';
import { Button } from './ui/button';

interface SidebarProps {
  stories: Story[];
  onSelectStory: (story: Story) => void;
  onFilterChange: (category: Category | 'all') => void;
  selectedCategory: Category | 'all';
  onSeedData?: () => void;
}

export default function Sidebar({ stories, onSelectStory, onFilterChange, selectedCategory, onSeedData }: SidebarProps) {
  const [search, setSearch] = useState('');

  const filteredStories = stories.filter(s => {
    const matchesCategory = selectedCategory === 'all' || s.category === selectedCategory;
    const matchesSearch = s.title.toLowerCase().includes(search.toLowerCase()) || 
                         s.content.toLowerCase().includes(search.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  return (
    <div className="h-full flex flex-col bg-card border-l border-border w-full md:w-[340px] shadow-xl z-10 order-2">
      <div className="p-8 border-b border-border">
        <div className="flex items-center gap-2 mb-6">
          <div className="w-10 h-10 bg-primary rounded-xl flex items-center justify-center shadow-lg shadow-primary/20">
            <MapIcon className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-xl font-serif font-bold tracking-tight text-foreground">WorkMap</h1>
            <p className="text-[10px] uppercase font-bold tracking-widest text-muted">Community Stories</p>
          </div>
        </div>

        <div className="relative mb-6">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted" />
          <Input 
            placeholder="Search stories..." 
            className="pl-10 bg-background border-border focus-visible:ring-primary"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        <div className="flex flex-col gap-2">
          <div className="flex items-center gap-2 text-[10px] font-bold text-muted uppercase tracking-wider mb-1">
            <Filter className="w-3 h-3" /> Filter by Category
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => onFilterChange('all')}
              className={`px-3 py-1.5 rounded-full text-[11px] font-bold transition-all border ${
                selectedCategory === 'all' 
                  ? 'bg-primary text-white shadow-md border-transparent' 
                  : 'bg-white text-foreground hover:bg-accent border-border hover:border-primary/30'
              }`}
            >
              All
            </button>
            {CATEGORIES.map((cat) => (
              <button
                key={cat.value}
                onClick={() => onFilterChange(cat.value)}
                className={`px-3 py-1.5 rounded-full text-[11px] font-bold transition-all border ${
                  selectedCategory === cat.value 
                    ? '!text-white shadow-md border-transparent' 
                    : 'bg-white text-foreground hover:bg-accent/30 border-border'
                }`}
                style={{ backgroundColor: selectedCategory === cat.value ? cat.color : undefined }}
              >
                {cat.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      <ScrollArea className="flex-1 px-6">
        <div className="py-6 space-y-4">
          <div className="flex items-center justify-between mb-2 px-2">
            <h2 className="text-sm font-serif font-bold text-foreground flex items-center gap-2">
              <List className="w-4 h-4 text-primary" /> Recent Stories
            </h2>
            <span className="text-[10px] font-bold text-muted bg-accent px-2 py-0.5 rounded-full border border-border">
              {filteredStories.length}
            </span>
          </div>
          
          {filteredStories.length > 0 ? (
            filteredStories.map((story) => (
              <StoryCard 
                key={story.id} 
                story={story} 
                onClick={() => onSelectStory(story)} 
              />
            ))
          ) : (
            <div className="text-center py-12">
              <div className="w-16 h-16 bg-accent rounded-full flex items-center justify-center mx-auto mb-4 border border-border">
                <Search className="w-8 h-8 text-muted/30" />
              </div>
              <p className="text-sm text-muted font-medium mb-4">No stories found matching your search.</p>
              {stories.length === 0 && onSeedData && (
                <Button variant="outline" size="sm" onClick={onSeedData} className="gap-2 border-border text-muted hover:text-primary">
                  <Database className="w-4 h-4" /> Seed Example Data
                </Button>
              )}
            </div>
          )}
        </div>
      </ScrollArea>

      <div className="p-6 border-t border-border bg-accent/30">
        <p className="text-[10px] text-center text-muted font-medium opacity-70">
          Learning from workplace journeys. Anonymous posting enabled.
        </p>
      </div>
    </div>
  );
}
