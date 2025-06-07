import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import DeckList from '@/components/DeckList';

interface FlashcardSet {
  id: string;
  title: string;
  subject: string;
  difficulty: string;
  cardCount: number;
  createdAt: string;
  updatedAt: string;
}

export default function DecksPage() {
  const router = useRouter();
  const [decks, setDecks] = useState<FlashcardSet[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchDecks = async (filters: any) => {
    try {
      const queryParams = new URLSearchParams();
      if (filters.subject) queryParams.append('subject', filters.subject);
      if (filters.tags) queryParams.append('tags', filters.tags);
      if (filters.difficulty) queryParams.append('difficulty', filters.difficulty);
      if (filters.search) queryParams.append('search', filters.search);

      const response = await fetch(`/api/flashcards?${queryParams.toString()}`);
      if (!response.ok) throw new Error('Failed to fetch decks');

      const data = await response.json();
      setDecks(data.flashcardSets);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch decks');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDecks({});
  }, []);

  const handleFilterChange = (filters: any) => {
    fetchDecks(filters);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading decks...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-600">{error}</p>
          <button
            onClick={() => fetchDecks({})}
            className="mt-4 px-4 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Flashcard Decks</h1>
          <button
            onClick={() => router.push('/create')}
            className="px-4 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700"
          >
            Create New Deck
          </button>
        </div>

        <DeckList initialDecks={decks} onFilterChange={handleFilterChange} />
      </div>
    </div>
  );
} 