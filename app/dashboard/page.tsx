'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

interface FlashcardSet {
  id: string;
  title: string;
  subject: string;
  tags: string[];
  difficulty: number;
  description?: string;
  flashcards: Flashcard[];
}

interface Flashcard {
  id: string;
  question: string;
  answer: string;
  explanation?: string;
  imageUrl?: string;
}

export default function DashboardPage() {
  const router = useRouter();
  const [flashcardSets, setFlashcardSets] = useState<FlashcardSet[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [showCreateSet, setShowCreateSet] = useState(false);
  const [showCreateCard, setShowCreateCard] = useState(false);
  const [selectedSetId, setSelectedSetId] = useState<string | null>(null);

  // Form states
  const [setForm, setSetForm] = useState({
    title: '',
    subject: '',
    tags: '',
    difficulty: 1,
    description: '',
  });

  const [cardForm, setCardForm] = useState({
    question: '',
    answer: '',
    explanation: '',
    imageUrl: '',
  });

  useEffect(() => {
    fetchFlashcardSets();
  }, []);

  const fetchFlashcardSets = async () => {
    try {
      const response = await fetch('/api/flashcard-sets');
      if (!response.ok) throw new Error('Failed to fetch flashcard sets');
      const data = await response.json();
      setFlashcardSets(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch flashcard sets');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateSet = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const response = await fetch('/api/flashcard-sets', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...setForm,
          tags: setForm.tags.split(',').map(tag => tag.trim()),
        }),
      });

      if (!response.ok) throw new Error('Failed to create flashcard set');
      
      await fetchFlashcardSets();
      setShowCreateSet(false);
      setSetForm({
        title: '',
        subject: '',
        tags: '',
        difficulty: 1,
        description: '',
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create flashcard set');
    }
  };

  const handleCreateCard = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedSetId) return;

    try {
      const response = await fetch('/api/flashcards', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...cardForm,
          setId: selectedSetId,
        }),
      });

      if (!response.ok) throw new Error('Failed to create flashcard');
      
      await fetchFlashcardSets();
      setShowCreateCard(false);
      setCardForm({
        question: '',
        answer: '',
        explanation: '',
        imageUrl: '',
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create flashcard');
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Your Flashcard Sets</h1>
          <button
            onClick={() => setShowCreateSet(true)}
            className="bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700"
          >
            Create New Set
          </button>
        </div>

        {error && (
          <div className="mb-4 p-4 bg-red-50 text-red-700 rounded-md">
            {error}
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {flashcardSets.map((set) => (
            <div
              key={set.id}
              className="bg-white rounded-lg shadow-md p-6"
            >
              <h2 className="text-xl font-semibold mb-2">{set.title}</h2>
              <p className="text-gray-600 mb-2">{set.subject}</p>
              <div className="flex flex-wrap gap-2 mb-4">
                {set.tags.map((tag, index) => (
                  <span
                    key={index}
                    className="bg-gray-100 text-gray-700 px-2 py-1 rounded-full text-sm"
                  >
                    {tag}
                  </span>
                ))}
              </div>
              <p className="text-gray-500 mb-4">
                {set.flashcards.length} cards
              </p>
              <button
                onClick={() => {
                  setSelectedSetId(set.id);
                  setShowCreateCard(true);
                }}
                className="text-indigo-600 hover:text-indigo-700"
              >
                Add Card
              </button>
            </div>
          ))}
        </div>

        {/* Create Set Modal */}
        {showCreateSet && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
            <div className="bg-white rounded-lg p-6 max-w-md w-full">
              <h2 className="text-2xl font-bold mb-4">Create New Flashcard Set</h2>
              <form onSubmit={handleCreateSet}>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Title</label>
                    <input
                      type="text"
                      value={setForm.title}
                      onChange={(e) => setSetForm({ ...setForm, title: e.target.value })}
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Subject</label>
                    <input
                      type="text"
                      value={setForm.subject}
                      onChange={(e) => setSetForm({ ...setForm, subject: e.target.value })}
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Tags (comma-separated)</label>
                    <input
                      type="text"
                      value={setForm.tags}
                      onChange={(e) => setSetForm({ ...setForm, tags: e.target.value })}
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Difficulty (1-5)</label>
                    <input
                      type="number"
                      min="1"
                      max="5"
                      value={setForm.difficulty}
                      onChange={(e) => setSetForm({ ...setForm, difficulty: parseInt(e.target.value) })}
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Description</label>
                    <textarea
                      value={setForm.description}
                      onChange={(e) => setSetForm({ ...setForm, description: e.target.value })}
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                      rows={3}
                    />
                  </div>
                </div>
                <div className="mt-6 flex justify-end space-x-3">
                  <button
                    type="button"
                    onClick={() => setShowCreateSet(false)}
                    className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700"
                  >
                    Create Set
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Create Card Modal */}
        {showCreateCard && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
            <div className="bg-white rounded-lg p-6 max-w-md w-full">
              <h2 className="text-2xl font-bold mb-4">Add New Flashcard</h2>
              <form onSubmit={handleCreateCard}>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Question</label>
                    <textarea
                      value={cardForm.question}
                      onChange={(e) => setCardForm({ ...cardForm, question: e.target.value })}
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                      rows={3}
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Answer</label>
                    <textarea
                      value={cardForm.answer}
                      onChange={(e) => setCardForm({ ...cardForm, answer: e.target.value })}
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                      rows={3}
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Explanation (optional)</label>
                    <textarea
                      value={cardForm.explanation}
                      onChange={(e) => setCardForm({ ...cardForm, explanation: e.target.value })}
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                      rows={3}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Image URL (optional)</label>
                    <input
                      type="url"
                      value={cardForm.imageUrl}
                      onChange={(e) => setCardForm({ ...cardForm, imageUrl: e.target.value })}
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                    />
                  </div>
                </div>
                <div className="mt-6 flex justify-end space-x-3">
                  <button
                    type="button"
                    onClick={() => setShowCreateCard(false)}
                    className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700"
                  >
                    Add Card
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
} 