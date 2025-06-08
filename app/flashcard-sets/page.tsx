'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { getDIDFromLocalStorage } from '@/lib/did';

interface FlashcardSet {
  id: string;
  title: string;
  description: string;
  subject: string;
  difficulty: string;
  createdAt: string;
}

export default function FlashcardSetsPage() {
  const [isLoading, setIsLoading] = useState(true);
  const [flashcardSets, setFlashcardSets] = useState<FlashcardSet[]>([]);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const did = getDIDFromLocalStorage();
        if (!did) {
          router.push('/signup');
          return;
        }

        const response = await fetch('/api/flashcard-sets');
        if (!response.ok) {
          throw new Error('Failed to fetch flashcard sets');
        }
        const data = await response.json();
        setFlashcardSets(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An error occurred');
      } finally {
        setIsLoading(false);
      }
    };

    checkAuth();
  }, [router]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading your flashcard sets...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="text-red-600 text-lg mb-4">Error: {error}</div>
          <button
            onClick={() => router.push('/')}
            className="text-indigo-600 hover:text-indigo-500"
          >
            Return to Home
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Your Flashcard Sets</h1>
            <p className="mt-2 text-sm text-gray-600">
              Browse and study your flashcard sets
            </p>
          </div>
          <Link
            href="/flashcard-sets/create"
            className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
          >
            Create New Set
          </Link>
        </div>

        {flashcardSets.length === 0 ? (
          <div className="text-center py-12">
            <h3 className="mt-2 text-sm font-medium text-gray-900">No flashcard sets</h3>
            <p className="mt-1 text-sm text-gray-500">
              Get started by creating a new flashcard set.
            </p>
            <div className="mt-6">
              <Link
                href="/flashcard-sets/create"
                className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
              >
                Create New Set
              </Link>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {flashcardSets.map((set) => (
              <Link
                key={set.id}
                href={`/flashcard-sets/${set.id}`}
                className="group relative bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow duration-200"
              >
                <div className="p-6">
                  <div className="flex items-center justify-between">
                    <h3 className="text-lg font-medium text-gray-900 group-hover:text-indigo-600">
                      {set.title}
                    </h3>
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-indigo-100 text-indigo-800">
                      {set.difficulty}
                    </span>
                  </div>
                  <p className="mt-2 text-sm text-gray-500">{set.description}</p>
                  <div className="mt-4 flex items-center justify-between">
                    <span className="text-sm text-gray-500">{set.subject}</span>
                    <span className="text-sm text-gray-500">
                      {new Date(set.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
} 