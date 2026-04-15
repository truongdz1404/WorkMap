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
import { AlertCircle } from 'lucide-react';

export default function App() {
  const [user, setUser] = useState<User | null>(null);
  const [stories, setStories] = useState<Story[]>([]);
  const [selectedStory, setSelectedStory] = useState<Story | null>(null);
  const [isAddingStory, setIsAddingStory] = useState(false);
  const [clickCoords, setClickCoords] = useState<{ lat: number; lng: number } | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<Category | 'all'>('all');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

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
      setError("Failed to load stories. Please check your connection.");
    });

    return () => {
      unsubscribeAuth();
      unsubscribeStories();
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
        setError("Login cancelled. Please try again.");
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
        setError("Login cancelled. Please try again.");
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
      await addDoc(collection(db, 'stories'), {
        ...data,
        createdAt: Date.now(),
        likesCount: 0,
        upvotedBy: [],
        downvotedBy: [],
        ...(user ? { authorId: user.uid } : {}),
        authorName: user?.displayName || 'Anonymous',
        authorImage: user?.photoURL || undefined,
        comments: [],
      });
      setIsAddingStory(false);
      setClickCoords(null);
    } catch (err) {
      console.error("Error adding story:", err);
      setError("Failed to post story. You might need to sign in.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleUpvote = async (storyId: string) => {
    if (!user) {
      setError("Please login to vote");
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
      setError("Please login to vote");
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
      setError("Please login to comment");
      return;
    }
    try {
      const commentId = Date.now().toString();
      const newComment = {
        id: commentId,
        authorId: user.uid,
        authorName: user.displayName || 'Anonymous',
        authorImage: user.photoURL || undefined,
        content: commentText,
        createdAt: Date.now(),
      };
      const storyRef = doc(db, 'stories', storyId);
      await updateDoc(storyRef, {
        comments: arrayUnion(newComment)
      });
    } catch (err) {
      console.error("Error adding comment:", err);
      setError("Failed to add comment");
    }
  };

  const handleSeedData = async () => {
    const exampleStories = [
      {
        title: "Communication breakdown in remote team",
        content: "Our team was struggling with async communication. We started using a shared document for daily updates and it cleared up so much confusion! The key was being explicit about expectations and deadlines.",
        category: "communication",
        emotion: "confusion",
        latitude: 10.7626,
        longitude: 106.6602, // Ho Chi Minh City
        createdAt: Date.now() - 86400000,
        upvotedBy: [],
        downvotedBy: [],
        authorName: "Minh Thu",
        comments: [],
      },
      {
        title: "First day onboarding success",
        content: "I was so nervous about my first day as an intern. But the team had a clear checklist and a buddy assigned to me. It made me feel welcome and productive from day one. Highly recommend this approach for all startups!",
        category: "onboarding",
        emotion: "success",
        latitude: 21.0285,
        longitude: 105.8542, // Hanoi
        createdAt: Date.now() - 172800000,
        upvotedBy: [],
        downvotedBy: [],
        authorName: "Hoang Nam",
        comments: [],
      },
      {
        title: "Navigating office politics",
        content: "Dealing with conflicting interests between departments was stressful. I learned that transparency and documentation are your best friends. Always keep a paper trail and try to understand the motivations of all stakeholders.",
        category: "conflict",
        emotion: "stress",
        latitude: 16.0544,
        longitude: 108.2022, // Da Nang
        createdAt: Date.now() - 259200000,
        upvotedBy: [],
        downvotedBy: [],
        authorName: "Anh Tuan",
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

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-background font-sans">
      <main className="flex-1 relative order-1">
        <Navbar
          user={user}
          onLogin={loginWithGoogle}
          onLogout={logout}
          onAddStory={handleAddStory}
        />

        {error && (
          <div className="absolute top-24 left-1/2 -translate-x-1/2 z-30 bg-red-50 border border-red-100 text-red-600 px-4 py-2 rounded-full flex items-center gap-2 shadow-lg text-sm font-bold">
            <AlertCircle className="w-4 h-4" /> {error}
          </div>
        )}

        <Map
          stories={stories}
          onSelectStory={setSelectedStory}
          onMapClick={handleMapClick}
          selectedStoryId={selectedStory?.id}
        />

        <AnimatePresence>
          {isAddingStory && clickCoords && (
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="absolute inset-0 z-40 flex items-center justify-center p-4 bg-black/20 backdrop-blur-sm"
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

      <Sidebar
        stories={stories}
        onSelectStory={setSelectedStory}
        onFilterChange={setSelectedCategory}
        selectedCategory={selectedCategory}
        currentUserId={user?.uid}
        onUpvote={handleUpvote}
        onDownvote={handleDownvote}
        onSeedData={handleSeedData}
      />
    </div>
  );
}
