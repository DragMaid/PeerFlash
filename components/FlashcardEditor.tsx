import React, { useState } from 'react';

interface Flashcard {
  question: string;
  answer: string;
  explanation?: string;
  imageUrl?: string;
}

interface FlashcardEditorProps {
  onSubmit: (flashcards: Flashcard[]) => void;
}

export default function FlashcardEditor({ onSubmit }: FlashcardEditorProps) {
  const [flashcards, setFlashcards] = useState<Flashcard[]>([{ question: '', answer: '' }]);
  const [loading, setLoading] = useState(false);

  const handleAddCard = () => {
    setFlashcards([...flashcards, { question: '', answer: '' }]);
  };

  const handleRemoveCard = (index: number) => {
    setFlashcards(flashcards.filter((_, i) => i !== index));
  };

  const handleCardChange = (index: number, field: keyof Flashcard, value: string) => {
    const newFlashcards = [...flashcards];
    newFlashcards[index] = { ...newFlashcards[index], [field]: value };
    setFlashcards(newFlashcards);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Validate that all required fields are filled
      const isValid = flashcards.every(card => card.question && card.answer);
      if (!isValid) {
        throw new Error('Please fill in all required fields');
      }

      await onSubmit(flashcards);
    } catch (err) {
      console.error('Error submitting flashcards:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-sm p-6 sm:p-8">
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h2 className="text-lg font-medium text-gray-900">Flashcards</h2>
          <button
            type="button"
            onClick={handleAddCard}
            className="inline-flex items-center px-3 py-1.5 border border-transparent text-sm font-medium rounded-md text-indigo-700 bg-indigo-100 hover:bg-indigo-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
          >
            Add Card
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {flashcards.map((card, index) => (
            <div key={index} className="relative bg-gray-50 rounded-lg p-4">
              {flashcards.length > 1 && (
                <button
                  type="button"
                  onClick={() => handleRemoveCard(index)}
                  className="absolute top-2 right-2 text-gray-400 hover:text-gray-500"
                >
                  <svg className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                    <path
                      fillRule="evenodd"
                      d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                      clipRule="evenodd"
                    />
                  </svg>
                </button>
              )}

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Question
                  </label>
                  <input
                    type="text"
                    value={card.question}
                    onChange={(e) => handleCardChange(index, 'question', e.target.value)}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                    placeholder="Enter the question"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Answer
                  </label>
                  <input
                    type="text"
                    value={card.answer}
                    onChange={(e) => handleCardChange(index, 'answer', e.target.value)}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                    placeholder="Enter the answer"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Explanation (optional)
                  </label>
                  <textarea
                    value={card.explanation || ''}
                    onChange={(e) => handleCardChange(index, 'explanation', e.target.value)}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                    placeholder="Add an explanation for the answer"
                    rows={2}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Image URL (optional)
                  </label>
                  <input
                    type="url"
                    value={card.imageUrl || ''}
                    onChange={(e) => handleCardChange(index, 'imageUrl', e.target.value)}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                    placeholder="Enter an image URL"
                  />
                </div>
              </div>
            </div>
          ))}

          <div className="flex justify-end">
            <button
              type="submit"
              disabled={loading}
              className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
            >
              {loading ? (
                <>
                  <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Creating...
                </>
              ) : (
                'Create Deck'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
} 