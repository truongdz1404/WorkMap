import { User } from 'firebase/auth';
import { Button } from './ui/button';
import { LogIn, LogOut, User as UserIcon, Plus, MapPin } from 'lucide-react';

interface NavbarProps {
  user: User | null;
  onLogin: () => void;
  onLogout: () => void;
  onAddStory: () => void;
}

export default function Navbar({ user, onLogin, onLogout, onAddStory }: NavbarProps) {
  return (
    <div className="absolute left-2 right-2 top-2 z-20 flex flex-wrap items-center gap-2 sm:left-4 sm:right-4 sm:top-4 sm:gap-3 md:left-6 md:right-auto md:top-6 md:flex-nowrap md:gap-4 lg:left-8 lg:top-8">
      <div className="flex min-w-0 flex-1 items-center gap-3 rounded-full border border-border bg-white/90 px-4 py-2 shadow-lg backdrop-blur-md sm:gap-4 sm:px-5 md:flex-none md:gap-6 md:px-6">
        <div className="flex min-w-0 items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-green-500 to-green-600 shadow-md">
            <MapPin className="h-5 w-5 text-white" />
          </div>
          <div className="truncate font-serif text-base font-bold tracking-tight text-primary sm:text-lg">WorkMap</div>
        </div>
        <div className="hidden md:flex items-center gap-4 text-[11px] font-bold uppercase tracking-widest text-muted">
          <span className="text-primary underline underline-offset-4 cursor-pointer">Explore Map</span>
          <span className="hover:text-primary cursor-pointer transition-colors">Insights</span>
          <span className="hover:text-primary cursor-pointer transition-colors">Guidebook</span>
        </div>
      </div>

      <Button
        onClick={onAddStory}
        className="h-10 rounded-full bg-primary px-4 text-[10px] font-bold uppercase tracking-widest shadow-lg hover:bg-primary/90 sm:h-11 sm:px-5 sm:text-xs md:px-6"
      >
        <Plus className="mr-1 h-4 w-4 sm:mr-2" />
        <span className="hidden sm:inline">Share Story</span>
        <span className="sm:hidden">Share</span>
      </Button>

      {user ? (
        <div className="flex items-center gap-2 rounded-full border border-border bg-white/90 p-1 pr-2 shadow-lg backdrop-blur-md sm:pr-4">
          {user.photoURL ? (
            <img src={user.photoURL} alt={user.displayName || ''} className="h-8 w-8 rounded-full border-2 border-white shadow-sm sm:h-9 sm:w-9" referrerPolicy="no-referrer" />
          ) : (
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-accent sm:h-9 sm:w-9">
              <UserIcon className="h-4 w-4 text-muted" />
            </div>
          )}
          <div className="hidden md:block">
            <p className="text-[9px] uppercase font-black text-muted leading-none mb-1">Welcome</p>
            <p className="text-[11px] font-bold text-foreground leading-none">{user.displayName?.split(' ')[0]}</p>
          </div>
          <Button variant="ghost" size="icon" onClick={onLogout} className="h-8 w-8 rounded-full hover:bg-red-50 hover:text-red-600 sm:ml-2">
            <LogOut className="h-3.5 w-3.5" />
          </Button>
        </div>
      ) : (
        <Button
          variant="outline"
          onClick={onLogin}
          className="h-10 rounded-full border-border bg-white px-4 text-[10px] font-bold uppercase tracking-widest shadow-lg hover:bg-accent sm:h-11 sm:px-6 sm:text-xs"
        >
          <LogIn className="mr-1 h-4 w-4 sm:mr-2" /> Sign In
        </Button>
      )}
    </div>
  );
}
