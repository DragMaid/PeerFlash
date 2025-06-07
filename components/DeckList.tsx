import React from 'react';
import Link from 'next/link';

interface FlashcardSet {
  id: string;
  title: string;
  subject: string;
  difficulty: string;
  cardCount: number;
  createdAt: string;
  updatedAt: string;
}

interface DeckListProps {
  initialDecks: FlashcardSet[];
  onFilterChange?: (filters: any) => void;
}

export default function DeckList({ initialDecks, onFilterChange }: DeckListProps) {
  if (initialDecks.length === 0) {
    return (
      <div className="bg-white shadow rounded-lg p-6">
        <p className="text-gray-500 text-center">No decks created yet</p>
        <div className="mt-4 text-center">
          <Link
            href="/create"
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-primary-600 hover:bg-primary-700"
          >
            Create Your First Deck
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {initialDecks.map((deck) => (
        <Link
          key={deck.id}
          href={`/deck/${deck.id}`}
          className="block bg-white shadow rounded-lg p-6 border border-gray-200 hover:border-primary-500 transition-colors"
        >
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-medium text-gray-900">{deck.title}</h3>
              <p className="text-sm text-gray-500">{deck.subject}</p>
            </div>
            <span className="px-2 py-1 text-xs font-medium bg-gray-100 text-gray-800 rounded-full">
              {deck.difficulty}
            </span>
          </div>

          <div className="mt-4 flex items-center justify-between text-sm text-gray-500">
            <span>{deck.cardCount} cards</span>
            <span>Last updated: {new Date(deck.updatedAt).toLocaleDateString()}</span>
          </div>
        </Link>
      ))}
    </div>
  );
} 