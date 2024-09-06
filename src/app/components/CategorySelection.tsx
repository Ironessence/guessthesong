import React from 'react';

export type Category = '70s' | '80s' | '90s' | '00s' | '2010s' | 'recent';

interface CategorySelectorProps {
  selectedCategory: Category | null;
  onSelectCategory: (category: Category) => void;
}

const categories: Category[] = ['70s', '80s', '90s', '00s', '2010s', 'recent'];

const CategorySelector: React.FC<CategorySelectorProps> = ({ selectedCategory, onSelectCategory }) => {
  return (
    <div className="mb-4">
      <h2 className="text-xl font-bold mb-2">Select a Category:</h2>
      <div className="flex space-x-2">
        {categories.map((category) => (
          <button
            key={category}
            onClick={() => onSelectCategory(category)}
            className={`px-4 py-2 rounded ${
              selectedCategory === category
                ? 'bg-blue-500 text-white'
                : 'bg-gray-200 text-black hover:bg-gray-300'
            }`}
          >
            {category}
          </button>
        ))}
      </div>
    </div>
  );
};

export default CategorySelector;