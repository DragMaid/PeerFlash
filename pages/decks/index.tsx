import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import { getDIDFromLocalStorage } from '@/lib/did';

interface Flashcard {
  id: string;
  question: string;
  answer: string;
  explanation?: string;
  imageUrl?: string;
}

interface FlashcardSet {
  id: string;
  title: string;
  subject: string;
  tags: string[];
  description: string;
  creatorDid: string;
  flashcards: Flashcard[];
  createdAt: string;
  updatedAt: string;
}

export default function DecksPage() {
  const router = useRouter();
  const [flashcardSets, setFlashcardSets] = useState<FlashcardSet[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedSet, setSelectedSet] = useState<FlashcardSet | null>(null);
  const [currentCardIndex, setCurrentCardIndex] = useState(0);
  const [showAnswer, setShowAnswer] = useState(false);

  useEffect(() => {
    const did = getDIDFromLocalStorage();
    if (!did) {
      router.push('/signup');
      return;
    }

    const fetchFlashcardSets = async () => {
      try {
        const response = await fetch('/api/flashcard-sets');
        if (!response.ok) {
          throw new Error('Failed to fetch flashcard sets');
        }
        const data = await response.json();
        setFlashcardSets(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An error occurred');
      } finally {
        setLoading(false);
      }
    };

    fetchFlashcardSets();
  }, [router]);

  const handleStartRevision = (set: FlashcardSet) => {
    setSelectedSet(set);
    setCurrentCardIndex(0);
    setShowAnswer(false);
  };

  const handleNextCard = () => {
    if (selectedSet && currentCardIndex < selectedSet.flashcards.length - 1) {
      setCurrentCardIndex(prev => prev + 1);
      setShowAnswer(false);
    }
  };

  const handlePreviousCard = () => {
    if (currentCardIndex > 0) {
      setCurrentCardIndex(prev => prev - 1);
      setShowAnswer(false);
    }
  };

  const handleExitRevision = () => {
    setSelectedSet(null);
    setCurrentCardIndex(0);
    setShowAnswer(false);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-indigo-50 to-white flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading decks...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-indigo-50 to-white flex items-center justify-center">
        <div className="text-center">
          <div className="bg-red-50 border-l-4 border-red-400 p-4">
            <div className="flex">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3">
                <p className="text-sm text-red-700">{error}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (selectedSet) {
    const currentCard = selectedSet.flashcards[currentCardIndex];
    return (
      <div className="min-h-screen bg-gradient-to-b from-indigo-50 to-white">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-semibold text-gray-900">{selectedSet.title}</h2>
              <button
                onClick={handleExitRevision}
                className="text-sm text-gray-600 hover:text-gray-900"
              >
                Exit Revision
              </button>
            </div>

            <div className="mb-6">
              <div className="text-sm text-gray-500 mb-2">
                Card {currentCardIndex + 1} of {selectedSet.flashcards.length}
              </div>
              <div className="bg-gray-50 rounded-lg p-6 mb-4">
                <h3 className="text-lg font-medium text-gray-900 mb-4">Question:</h3>
                <p className="text-gray-700">{currentCard.question}</p>
                {currentCard.imageUrl && (
                  <img
                    src={currentCard.imageUrl}
                    alt="Question illustration"
                    className="mt-4 max-w-full h-auto rounded-lg"
                  />
                )}
              </div>

              {showAnswer && (
                <div className="bg-indigo-50 rounded-lg p-6 mb-4">
                  <h3 className="text-lg font-medium text-gray-900 mb-4">Answer:</h3>
                  <p className="text-gray-700">{currentCard.answer}</p>
                  {currentCard.explanation && (
                    <div className="mt-4">
                      <h4 className="text-sm font-medium text-gray-900 mb-2">Explanation:</h4>
                      <p className="text-gray-600">{currentCard.explanation}</p>
                    </div>
                  )}
                </div>
              )}

              <div className="flex justify-between items-center">
                <button
                  onClick={handlePreviousCard}
                  disabled={currentCardIndex === 0}
                  className={`px-4 py-2 rounded-md text-sm font-medium ${
                    currentCardIndex === 0
                      ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                      : 'bg-indigo-100 text-indigo-700 hover:bg-indigo-200'
                  }`}
                >
                  Previous
                </button>

                <button
                  onClick={() => setShowAnswer(!showAnswer)}
                  className="px-4 py-2 bg-indigo-600 text-white rounded-md text-sm font-medium hover:bg-indigo-700"
                >
                  {showAnswer ? 'Hide Answer' : 'Show Answer'}
                </button>

                <button
                  onClick={handleNextCard}
                  disabled={currentCardIndex === selectedSet.flashcards.length - 1}
                  className={`px-4 py-2 rounded-md text-sm font-medium ${
                    currentCardIndex === selectedSet.flashcards.length - 1
                      ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                      : 'bg-indigo-100 text-indigo-700 hover:bg-indigo-200'
                  }`}
                >
                  Next
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-indigo-50 to-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Flashcard Decks</h1>
          <Link
            href="/create"
            className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
          >
            Create New Deck
          </Link>
        </div>

        {flashcardSets.length === 0 ? (
          <div className="text-center py-12">
            <h3 className="mt-2 text-sm font-medium text-gray-900">No decks found</h3>
            <p className="mt-1 text-sm text-gray-500">Get started by creating a new flashcard deck.</p>
            <div className="mt-6">
              <Link
                href="/create"
                className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
              >
                Create New Deck
              </Link>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {flashcardSets.map((set) => (
              <div
                key={set.id}
                className="bg-white overflow-hidden shadow-sm rounded-lg hover:shadow-md transition-shadow duration-200"
              >
                <div className="p-6">
                  <div className="flex items-center justify-between">
                    <h3 className="text-lg font-medium text-gray-900 truncate">{set.title}</h3>
                  </div>
                  <p className="mt-1 text-sm text-gray-500">{set.subject}</p>
                  {set.tags && set.tags.length > 0 && (
                    <div className="mt-2 flex flex-wrap gap-2">
                      {set.tags.map((tag) => (
                        <span
                          key={tag}
                          className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-gray-100 text-gray-800"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                  )}
                  <p className="mt-2 text-sm text-gray-600 line-clamp-2">{set.description}</p>
                  <div className="mt-4 flex justify-between items-center">
                    <span className="text-sm text-gray-500">
                      {set.flashcards?.length || 0} cards
                    </span>
                    <div className="space-x-2">
                      <button
                        onClick={() => handleStartRevision(set)}
                        className="text-sm font-medium text-indigo-600 hover:text-indigo-500"
                      >
                        Start Revision
                      </button>
                      <Link
                        href={`/decks/${set.id}`}
                        className="text-sm font-medium text-gray-600 hover:text-gray-500"
                      >
                        View Details
                      </Link>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
} 