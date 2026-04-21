import { useState, useEffect } from 'react';
import { auth, db, loginWithGoogle, logout, collection, addDoc, onSnapshot, query, orderBy, updateDoc, doc, arrayUnion, arrayRemove } from './firebase';
import { onAuthStateChanged, User } from 'firebase/auth';
import { Story, Category } from './types';
import Map from './components/Map';
import Sidebar from './components/Sidebar';
import StoryForm from './components/StoryForm';
import StoryDetail from './components/StoryDetail';
import Navbar from './components/Navbar';
import { AnimatePresence, motion } from 'motion/react';
import { AlertCircle, PanelBottomOpen, PanelBottomClose } from 'lucide-react';
import { useI18n } from './i18n';
import { detectLanguage } from './lib/translation';

export default function App() {
  const { t, language } = useI18n();
  const MOBILE_BREAKPOINT = 700;
  const DEFAULT_ANONYMOUS_AVATAR = 'https://scontent.fhan20-1.fna.fbcdn.net/v/t39.35477-6/480772267_8870171503091593_8950035799029425225_n.jpg?stp=cp0_dst-jpg_s50x50_tt6&_nc_cat=1&ccb=1-7&_nc_sid=ee2d7f&_nc_eui2=AeHx_i2sy1oVJUE7vihfADrZyo1AD-kF533KjUAP6QXnfbJ1NptTMlw3iNe4h7fLZhAz2Oc2Q-z6-H3fCngupBFs&_nc_ohc=r3qM0gJL1IQQ7kNvwEheqky&_nc_oc=AdpGoaBJi797gbe--fN-wYwGOmzehHENw6IQNIl8CtVEdheWP_M2pY9Qm_Dn2rhXn3k&_nc_zt=14&_nc_ht=scontent.fhan20-1.fna&_nc_gid=t61r1muLHw4PwcKD2Rqxyw&_nc_ss=7a3a8&oh=00_Af1g8pMSMNj4LU172by_6j1YL4wMyfl2_R5FVS4LVZUIzQ&oe=69EB7ABB';
  const [user, setUser] = useState<User | null>(null);
  const [stories, setStories] = useState<Story[]>([]);
  const [selectedStory, setSelectedStory] = useState<Story | null>(null);
  const [isAddingStory, setIsAddingStory] = useState(false);
  const [clickCoords, setClickCoords] = useState<{ lat: number; lng: number } | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<Category | 'all'>('all');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [isMobileLayout, setIsMobileLayout] = useState(() => window.innerWidth < MOBILE_BREAKPOINT);
  const [mobileSidebarHeightVh, setMobileSidebarHeightVh] = useState(55);
  const [isResizingSidebar, setIsResizingSidebar] = useState(false);
  const [isMobileSidebarVisible, setIsMobileSidebarVisible] = useState(true);

  const clampSidebarHeight = (value: number) => Math.min(75, Math.max(35, value));

  useEffect(() => {
    const unsubscribeAuth = onAuthStateChanged(auth, (user) => {
      setUser(user);
    });

    const q = query(collection(db, 'stories'), orderBy('createdAt', 'desc'));
    const unsubscribeStories = onSnapshot(q, (snapshot) => {
      const storyData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Story[];
      setStories(storyData);
    }, (err) => {
      console.error("Firestore error:", err);
      setError(t('app.errorFailedLoad'));
    });

    return () => {
      unsubscribeAuth();
      unsubscribeStories();
    };
  }, [t]);

  useEffect(() => {
    const mediaQuery = window.matchMedia(`(max-width: ${MOBILE_BREAKPOINT - 1}px)`);

    const applyViewportState = (isMobile: boolean) => {
      setIsMobileLayout(isMobile);
      if (!isMobile) {
        setIsMobileSidebarVisible(true);
        setIsResizingSidebar(false);
      }
    };

    const handleViewportChange = (event: MediaQueryListEvent) => {
      applyViewportState(event.matches);
    };

    const handleResize = () => {
      applyViewportState(window.innerWidth < MOBILE_BREAKPOINT);
    };

    applyViewportState(window.innerWidth < MOBILE_BREAKPOINT);

    if (mediaQuery.addEventListener) {
      mediaQuery.addEventListener('change', handleViewportChange);
    } else {
      mediaQuery.addListener(handleViewportChange);
    }
    window.addEventListener('resize', handleResize);

    return () => {
      if (mediaQuery.removeEventListener) {
        mediaQuery.removeEventListener('change', handleViewportChange);
      } else {
        mediaQuery.removeListener(handleViewportChange);
      }
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  // Auto dismiss error after 4 seconds
  useEffect(() => {
    if (error) {
      const timer = setTimeout(() => {
        setError(null);
      }, 4000);
      return () => clearTimeout(timer);
    }
  }, [error]);

  // Update selectedStory when stories change (for realtime updates)
  useEffect(() => {
    if (selectedStory) {
      const updatedStory = stories.find(s => s.id === selectedStory.id);
      if (updatedStory) {
        setSelectedStory(updatedStory);
      }
    }
  }, [stories]);

  const handleMapClick = async (lat: number, lng: number) => {
    // Check if user is logged in
    if (!user) {
      try {
        // Login with Google first
        await loginWithGoogle();
        // After login, the user state will be updated automatically
        setTimeout(() => {
          setClickCoords({ lat, lng });
          setIsAddingStory(true);
        }, 500);
      } catch (err) {
        console.error("Login cancelled or failed:", err);
        setError(t('app.errorLoginCancelled'));
      }
    } else {
      // User is already logged in, show dialog immediately
      setClickCoords({ lat, lng });
      setIsAddingStory(true);
    }
  };

  const handleAddStory = async () => {
    // Check if user is logged in
    if (!user) {
      try {
        // Login with Google first
        await loginWithGoogle();
        // After login, the user state will be updated automatically by onAuthStateChanged
        // Then show the dialog after a short delay to ensure user state is updated
        setTimeout(() => {
          setClickCoords({ lat: 14.0583, lng: 108.2772 });
          setIsAddingStory(true);
        }, 500);
      } catch (err) {
        console.error("Login cancelled or failed:", err);
        setError(t('app.errorLoginCancelled'));
      }
    } else {
      // User is already logged in, show dialog immediately
      setClickCoords({ lat: 14.0583, lng: 108.2772 });
      setIsAddingStory(true);
    }
  };

  const handleSubmitStory = async (data: any) => {
    setIsSubmitting(true);
    setError(null);
    try {
      const anonymousAlias = t('app.anonymousAlias', { id: Math.floor(1000 + Math.random() * 9000) });

      await addDoc(collection(db, 'stories'), {
        ...data,
        createdAt: Date.now(),
        likesCount: 0,
        upvotedBy: [],
        downvotedBy: [],
        ...(user && !data.isAnonymous ? { authorId: user.uid } : {}),
        authorName: data.isAnonymous ? anonymousAlias : (user?.displayName || t('app.anonymousName')),
        ...(data.isAnonymous
          ? { authorImage: DEFAULT_ANONYMOUS_AVATAR }
          : (user?.photoURL ? { authorImage: user.photoURL } : {})),
        sourceLanguage: detectLanguage(`${data.title} ${data.content}`),
        comments: [],
      });
      setIsAddingStory(false);
      setClickCoords(null);
    } catch (err) {
      console.error("Error adding story:", err);
      setError(t('app.errorFailedPost'));
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleUpvote = async (storyId: string) => {
    if (!user) {
      setError(t('app.errorPleaseLoginVote'));
      return;
    }
    try {
      const storyRef = doc(db, 'stories', storyId);
      const story = stories.find(s => s.id === storyId);

      // Nếu đã upvote thì unvote, không thì upvote
      if (story?.upvotedBy?.includes(user.uid)) {
        await updateDoc(storyRef, {
          upvotedBy: arrayRemove(user.uid)
        });
      } else {
        await updateDoc(storyRef, {
          upvotedBy: arrayUnion(user.uid),
          downvotedBy: arrayRemove(user.uid)
        });
      }
    } catch (err) {
      console.error("Error upvoting story:", err);
    }
  };

  const handleDownvote = async (storyId: string) => {
    if (!user) {
      setError(t('app.errorPleaseLoginVote'));
      return;
    }
    try {
      const storyRef = doc(db, 'stories', storyId);
      const story = stories.find(s => s.id === storyId);

      // Nếu đã downvote thì unvote, không thì downvote
      if (story?.downvotedBy?.includes(user.uid)) {
        await updateDoc(storyRef, {
          downvotedBy: arrayRemove(user.uid)
        });
      } else {
        await updateDoc(storyRef, {
          downvotedBy: arrayUnion(user.uid),
          upvotedBy: arrayRemove(user.uid)
        });
      }
    } catch (err) {
      console.error("Error downvoting story:", err);
    }
  };

  const handleAddComment = async (storyId: string, commentText: string) => {
    if (!user) {
      setError(t('app.errorPleaseLoginComment'));
      return;
    }
    const story = stories.find((s) => s.id === storyId);
    if (story?.allowComments === false) {
      setError(t('app.errorCommentsDisabled'));
      return;
    }
    try {
      const commentId = Date.now().toString();
      const newComment = {
        id: commentId,
        authorId: user.uid,
        authorName: user.displayName || t('app.anonymousName'),
        ...(user.photoURL ? { authorImage: user.photoURL } : {}),
        content: commentText,
        sourceLanguage: detectLanguage(commentText),
        createdAt: Date.now(),
      };
      const storyRef = doc(db, 'stories', storyId);
      await updateDoc(storyRef, {
        comments: arrayUnion(newComment)
      });
    } catch (err) {
      console.error("Error adding comment:", err);
      setError(t('app.errorFailedAddComment'));
    }
  };

  const handleSeedData = async () => {
    const exampleStories = [
      {
        title: t('seed.story1.title'),
        content: t('seed.story1.content'),
        category: "communication",
        emotion: "confusion",
        latitude: 10.7626,
        longitude: 106.6602, // Ho Chi Minh City
        createdAt: Date.now() - 86400000,
        upvotedBy: [],
        downvotedBy: [],
        authorName: t('seed.story1.author'),
        comments: [],
      },
      {
        title: t('seed.story2.title'),
        content: t('seed.story2.content'),
        category: "onboarding",
        emotion: "success",
        latitude: 21.0285,
        longitude: 105.8542, // Hanoi
        createdAt: Date.now() - 172800000,
        upvotedBy: [],
        downvotedBy: [],
        authorName: t('seed.story2.author'),
        comments: [],
      },
      {
        title: t('seed.story3.title'),
        content: t('seed.story3.content'),
        category: "conflict",
        emotion: "stress",
        latitude: 16.0544,
        longitude: 108.2022, // Da Nang
        createdAt: Date.now() - 259200000,
        upvotedBy: [],
        downvotedBy: [],
        authorName: t('seed.story3.author'),
        comments: [],
      }
    ];

    try {
      for (const story of exampleStories) {
        await addDoc(collection(db, 'stories'), story);
      }
    } catch (err) {
      console.error("Error seeding data:", err);
    }
  };

  const handleLoadMore = async () => {
    // Simulate loading delay for infinite scroll effect
    setIsLoadingMore(true);
    await new Promise(resolve => setTimeout(resolve, 500));
    setIsLoadingMore(false);
    // In the future, this can be used to fetch more stories from Firestore
    // using pagination (limit + startAfter)
  };

  const handleSidebarResizeStart = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!isMobileLayout) return;

    e.preventDefault();
    const startY = e.clientY;
    const startHeight = mobileSidebarHeightVh;
    setIsResizingSidebar(true);

    const handlePointerMove = (moveEvent: PointerEvent) => {
      const deltaVh = ((moveEvent.clientY - startY) / window.innerHeight) * 100;
      setMobileSidebarHeightVh(clampSidebarHeight(startHeight - deltaVh));
    };

    const handlePointerUp = () => {
      setIsResizingSidebar(false);
      window.removeEventListener('pointermove', handlePointerMove);
      window.removeEventListener('pointerup', handlePointerUp);
      window.removeEventListener('pointercancel', handlePointerUp);
    };

    window.addEventListener('pointermove', handlePointerMove);
    window.addEventListener('pointerup', handlePointerUp);
    window.addEventListener('pointercancel', handlePointerUp);
  };

  const mobileMainHeightVh = 100 - mobileSidebarHeightVh;
  const mobileMapHeight = isMobileLayout
    ? (isMobileSidebarVisible ? `${mobileMainHeightVh}dvh` : '100dvh')
    : undefined;

  return (
    <div className="flex h-dvh w-full flex-col overflow-hidden bg-background font-sans min-[700px]:h-screen min-[700px]:flex-row">
      <main
        className="relative order-1 h-[45dvh] min-h-[240px] flex-1 min-[700px]:h-auto min-[700px]:min-h-0"
        style={mobileMapHeight ? { height: mobileMapHeight } : undefined}
      >
        <Navbar
          user={user}
          onLogin={loginWithGoogle}
          onLogout={logout}
          onAddStory={handleAddStory}
        />

        {error && (
          <div className="absolute top-20 left-1/2 z-30 flex w-[calc(100%-2rem)] max-w-lg -translate-x-1/2 items-center gap-2 rounded-full border border-red-100 bg-red-50 px-4 py-2 text-xs font-bold text-red-600 shadow-lg sm:top-24 sm:text-sm">
            <AlertCircle className="w-4 h-4" /> {error}
          </div>
        )}

        <Map
          stories={stories}
          onSelectStory={setSelectedStory}
          onMapClick={handleMapClick}
          selectedStoryId={selectedStory?.id}
          layoutSignal={`${isMobileLayout}-${isMobileSidebarVisible}-${mobileSidebarHeightVh.toFixed(2)}`}
        />

        <AnimatePresence>
          {isAddingStory && clickCoords && (
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="fixed inset-0 z-[60] flex items-center justify-center bg-black/20 p-3 backdrop-blur-sm sm:p-4"
            >
              <StoryForm
                latitude={clickCoords.lat}
                longitude={clickCoords.lng}
                onSubmit={handleSubmitStory}
                onClose={() => setIsAddingStory(false)}
                isSubmitting={isSubmitting}
              />
            </motion.div>
          )}
        </AnimatePresence>

        <AnimatePresence>
          {selectedStory && (
            <StoryDetail
              story={selectedStory}
              onClose={() => setSelectedStory(null)}
              onUpvote={handleUpvote}
              onDownvote={handleDownvote}
              onAddComment={handleAddComment}
              currentUserId={user?.uid}
            />
          )}
        </AnimatePresence>
      </main>

      {isMobileLayout && (
        <div
          className={`order-2 ${isMobileSidebarVisible ? 'flex' : 'hidden'} h-8 items-center bg-card/90 px-2 ${isResizingSidebar ? 'bg-accent/80' : ''}`}
          onPointerDown={handleSidebarResizeStart}
          role="separator"
          aria-label={t('app.resizeSidebar')}
          aria-orientation="horizontal"
        >
          <div className="flex flex-1 cursor-row-resize touch-none select-none items-center justify-center">
            <div className="h-1.5 w-20 rounded-full bg-muted/70" />
          </div>

          <button
            type="button"
            aria-label={t('app.hideSidebar')}
            onPointerDown={(e) => e.stopPropagation()}
            onClick={(e) => {
              e.stopPropagation();
              setIsMobileSidebarVisible(false);
            }}
            className="ml-2 flex h-7 w-7 shrink-0 items-center justify-center rounded-full border border-border bg-white/95 shadow-sm backdrop-blur"
          >
            <PanelBottomClose className="h-4 w-4 text-foreground/70" />
          </button>
        </div>
      )}

      {(!isMobileLayout || isMobileSidebarVisible) && (
        <div
          className="relative order-2 min-h-0 min-[700px]:h-full"
          style={isMobileLayout ? { height: `${mobileSidebarHeightVh}dvh` } : undefined}
        >
          <Sidebar
            stories={stories}
            onSelectStory={setSelectedStory}
            onFilterChange={setSelectedCategory}
            selectedCategory={selectedCategory}
            currentUserId={user?.uid}
            onUpvote={handleUpvote}
            onDownvote={handleDownvote}
            onComment={(storyId) => {
              const story = stories.find((s) => s.id === storyId);
              if (story) {
                setSelectedStory(story);
              }
            }}
            onSeedData={handleSeedData}
            isLoadingMore={isLoadingMore}
            onLoadMore={handleLoadMore}
          />
        </div>
      )}

      {isMobileLayout && !isMobileSidebarVisible && (
        <button
          type="button"
          aria-label={t('app.showSidebar')}
          onClick={() => setIsMobileSidebarVisible(true)}
          className="fixed bottom-4 right-4 z-30 flex h-11 items-center gap-2 rounded-full border border-border bg-white/95 px-3 shadow-lg backdrop-blur"
        >
          <PanelBottomOpen className="h-4 w-4 text-foreground/80" />
          <span className="text-xs font-bold uppercase tracking-wider">{t('app.stories')}</span>
        </button>
      )}
    </div>
  );
}
