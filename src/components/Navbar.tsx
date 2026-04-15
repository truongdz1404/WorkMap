import { User } from 'firebase/auth';
import { Button } from './ui/button';
import { LogIn, LogOut, User as UserIcon, Plus } from 'lucide-react';

interface NavbarProps {
  user: User | null;
  onLogin: () => void;
  onLogout: () => void;
  onAddStory: () => void;
}

export default function Navbar({ user, onLogin, onLogout, onAddStory }: NavbarProps) {
  return (
    <div className="absolute top-8 left-8 z-20 flex items-center gap-4">
      <div className="flex items-center gap-6 bg-white/90 backdrop-blur-md px-6 py-2 rounded-full shadow-lg border border-border">
        <div className="font-serif font-bold text-lg text-primary tracking-tight">WorkMap</div>
        <div className="hidden md:flex items-center gap-4 text-[11px] font-bold uppercase tracking-widest text-muted">
          <span className="text-primary underline underline-offset-4 cursor-pointer">Explore Map</span>
          <span className="hover:text-primary cursor-pointer transition-colors">Insights</span>
          <span className="hover:text-primary cursor-pointer transition-colors">Guidebook</span>
        </div>
      </div>

      <Button 
        onClick={onAddStory}
        className="rounded-full shadow-lg bg-primary hover:bg-primary/90 px-6 font-bold h-11 text-xs uppercase tracking-widest"
      >
        <Plus className="w-4 h-4 mr-2" /> Share Story
      </Button>

      {user ? (
        <div className="flex items-center gap-2 bg-white/90 backdrop-blur-md p-1 pr-4 rounded-full shadow-lg border border-border">
          {user.photoURL ? (
            <img src={user.photoURL} alt={user.displayName || ''} className="w-9 h-9 rounded-full border-2 border-white shadow-sm" referrerPolicy="no-referrer" />
          ) : (
            <div className="w-9 h-9 rounded-full bg-accent flex items-center justify-center">
              <UserIcon className="w-4 h-4 text-muted" />
            </div>
          )}
          <div className="hidden md:block">
            <p className="text-[9px] uppercase font-black text-muted leading-none mb-1">Welcome</p>
            <p className="text-[11px] font-bold text-foreground leading-none">{user.displayName?.split(' ')[0]}</p>
          </div>
          <Button variant="ghost" size="icon" onClick={onLogout} className="ml-2 w-8 h-8 rounded-full hover:bg-red-50 hover:text-red-600">
            <LogOut className="w-3.5 h-3.5" />
          </Button>
        </div>
      ) : (
        <Button 
          variant="outline" 
          onClick={onLogin}
          className="rounded-full shadow-lg bg-white border-border px-6 font-bold h-11 text-xs uppercase tracking-widest hover:bg-accent"
        >
          <LogIn className="w-4 h-4 mr-2" /> Sign In
        </Button>
      )}
    </div>
  );
}
