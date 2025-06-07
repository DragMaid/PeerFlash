import React, { useState } from 'react';
import { useRouter } from 'next/router';

interface Flashcard {
  question: string;
  answer: string;
  explanation?: string;
  imageUrl?: string;
}

interface FlashcardEditorProps {
  initialFlashcards?: Flashcard[];
  onSubmit: (flashcards: Flashcard[]) => Promise<void>;
}

export default function FlashcardEditor({
  initialFlashcards = [],
  onSubmit,
}: FlashcardEditorProps) {
  const router = useRouter();
  const [flashcards, setFlashcards] = useState<Flashcard[]>(initialFlashcards);
  const [currentCard, setCurrentCard] = useState<Flashcard>({
    question: '',
    answer: '',
    explanation: '',
    imageUrl: '',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleAddCard = () => {
    if (currentCard.question && currentCard.answer) {
      setFlashcards([...flashcards, currentCard]);
      setCurrentCard({
        question: '',
        answer: '',
        explanation: '',
        imageUrl: '',
      });
    }
  };

  const handleRemoveCard = (index: number) => {
    setFlashcards(flashcards.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (flashcards.length === 0) return;

    setIsSubmitting(true);
    try {
      await onSubmit(flashcards);
      router.push('/decks');
    } catch (error) {
      console.error('Error submitting flashcards:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6">
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h2 className="text-2xl font-bold mb-4">Add New Flashcard</h2>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Question
              </label>
              <textarea
                value={currentCard.question}
                onChange={(e) =>
                  setCurrentCard({ ...currentCard, question: e.target.value })
                }
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
                rows={3}
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Answer
              </label>
              <textarea
                value={currentCard.answer}
                onChange={(e) =>
                  setCurrentCard({ ...currentCard, answer: e.target.value })
                }
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
                rows={3}
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Explanation (Optional)
              </label>
              <textarea
                value={currentCard.explanation}
                onChange={(e) =>
                  setCurrentCard({ ...currentCard, explanation: e.target.value })
                }
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
                rows={2}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Image URL (Optional)
              </label>
              <input
                type="url"
                value={currentCard.imageUrl}
                onChange={(e) =>
                  setCurrentCard({ ...currentCard, imageUrl: e.target.value })
                }
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
              />
            </div>
            <button
              type="button"
              onClick={handleAddCard}
              className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
            >
              Add Card
            </button>
          </div>
        </div>

        {flashcards.length > 0 && (
          <div className="bg-white p-6 rounded-lg shadow-md">
            <h2 className="text-2xl font-bold mb-4">Flashcards ({flashcards.length})</h2>
            <div className="space-y-4">
              {flashcards.map((card, index) => (
                <div
                  key={index}
                  className="border rounded-lg p-4 flex justify-between items-start"
                >
                  <div className="flex-1">
                    <p className="font-medium">Q: {card.question}</p>
                    <p className="mt-2">A: {card.answer}</p>
                    {card.explanation && (
                      <p className="mt-2 text-sm text-gray-600">
                        Explanation: {card.explanation}
                      </p>
                    )}
                    {card.imageUrl && (
                      <img
                        src={card.imageUrl}
                        alt="Flashcard"
                        className="mt-2 max-h-32 rounded"
                      />
                    )}
                  </div>
                  <button
                    type="button"
                    onClick={() => handleRemoveCard(index)}
                    className="ml-4 text-red-600 hover:text-red-800"
                  >
                    Remove
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="flex justify-end">
          <button
            type="submit"
            disabled={isSubmitting || flashcards.length === 0}
            className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 disabled:opacity-50"
          >
            {isSubmitting ? 'Saving...' : 'Save Deck'}
          </button>
        </div>
      </form>
    </div>
  );
} 