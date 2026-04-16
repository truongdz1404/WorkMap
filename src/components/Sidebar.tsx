import { useState, useRef, useEffect } from 'react';
import { Story, Category } from '../types';
import { CATEGORIES } from '../constants';
import StoryCard from './StoryCard';
import { Input } from './ui/input';
import { ScrollArea } from './ui/scroll-area';
import { Search, Filter, Map as MapIcon, List, Database, Loader } from 'lucide-react';
import { Button } from './ui/button';

interface SidebarProps {
  stories: Story[];
  onSelectStory: (story: Story) => void;
  onFilterChange: (category: Category | 'all') => void;
  selectedCategory: Category | 'all';
  currentUserId?: string;
  onUpvote?: (storyId: string) => void;
  onDownvote?: (storyId: string) => void;
  onComment?: (storyId: string) => void;
  onSeedData?: () => void;
  isLoadingMore?: boolean;
  onLoadMore?: () => void;
}

export default function Sidebar({ stories, onSelectStory, onFilterChange, selectedCategory, currentUserId, onUpvote, onDownvote, onComment, onSeedData, isLoadingMore, onLoadMore }: SidebarProps) {
  const [search, setSearch] = useState('');
  const scrollRef = useRef<HTMLDivElement>(null);

  const filteredStories = stories.filter(s => {
    const matchesCategory = selectedCategory === 'all' || s.category === selectedCategory;
    const matchesSearch = s.title.toLowerCase().includes(search.toLowerCase()) ||
      s.content.toLowerCase().includes(search.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  // Handle scroll to load more
  useEffect(() => {
    const handleScroll = (e: Event) => {
      const scrollArea = e.target as HTMLDivElement;
      const isNearBottom = scrollArea.scrollHeight - scrollArea.scrollTop - scrollArea.clientHeight < 200;
      
      if (isNearBottom && onLoadMore && !isLoadingMore) {
        onLoadMore();
      }
    };

    const scrollElement = scrollRef.current?.querySelector('[data-radix-scroll-area-viewport]');
    if (scrollElement) {
      scrollElement.addEventListener('scroll', handleScroll);
      return () => scrollElement.removeEventListener('scroll', handleScroll);
    }
  }, [onLoadMore, isLoadingMore]);

  return (
    <div className="order-2 z-10 flex h-[48dvh] min-h-0 w-full flex-col border-t border-border bg-card shadow-xl md:h-full md:w-[340px] md:border-l md:border-t-0">
      <div className="border-b border-border px-4 py-4 sm:px-6 sm:py-6 md:px-8 md:py-8">
        <div className="mb-4 flex items-center gap-2 sm:mb-5 md:mb-6">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary shadow-lg shadow-primary/20 md:h-10 md:w-10">
            <MapIcon className="h-5 w-5 text-white md:h-6 md:w-6" />
          </div>
          <div>
            <h1 className="text-lg font-serif font-bold tracking-tight text-foreground md:text-xl">WorkMap</h1>
            <p className="text-[10px] uppercase font-bold tracking-widest text-muted">Community Stories</p>
          </div>
        </div>

        <div className="relative mb-4 sm:mb-5 md:mb-6">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted" />
          <Input
            placeholder="Search stories..."
            className="h-10 border-border bg-background pl-10 focus-visible:ring-primary"
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
              className={`px-3 py-1.5 rounded-full text-[11px] font-bold transition-all border ${selectedCategory === 'all'
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
                className={`px-3 py-1.5 rounded-full text-[11px] font-bold transition-all border ${selectedCategory === cat.value
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

      <ScrollArea ref={scrollRef} className="flex-1 min-h-0 px-4 sm:px-6">
        <div className="space-y-3 py-4 sm:space-y-4 sm:py-6">
          <div className="flex items-center justify-between mb-2 px-2">
            <h2 className="text-sm font-serif font-bold text-foreground flex items-center gap-2">
              <List className="w-4 h-4 text-primary" /> Recent Stories
            </h2>
            <span className="text-[10px] font-bold text-muted bg-accent px-2 py-0.5 rounded-full border border-border">
              {filteredStories.length}
            </span>
          </div>

          {filteredStories.length > 0 ? (
            <>
              {filteredStories.map((story) => (
                <StoryCard
                  key={story.id}
                  story={story}
                  onClick={() => onSelectStory(story)}
                  onUpvote={onUpvote}
                  onDownvote={onDownvote}
                  onComment={onComment}
                  currentUserId={currentUserId}
                />
              ))}
              
              {isLoadingMore && (
                <div className="flex justify-center items-center py-6">
                  <div className="flex items-center gap-2 text-muted">
                    <Loader className="w-4 h-4 animate-spin" />
                    <span className="text-xs font-semibold">Loading more...</span>
                  </div>
                </div>
              )}
            </>
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

      <div className="border-t border-border bg-accent/30 px-4 py-3 sm:p-6">
        <p className="text-[10px] text-center text-muted font-medium opacity-70">
          Learning from workplace journeys. Anonymous posting enabled.
        </p>
      </div>
    </div>
  );
}
