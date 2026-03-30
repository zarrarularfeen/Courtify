import { useState } from 'react';
import './SearchBar.css';

const SearchBar = ({ onSearch, onFilterChange }) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [showFilters, setShowFilters] = useState(false);
  const [selectedSort, setSelectedSort] = useState("");

  const handleSearch = (e) => {
    const value = e.target.value;
    setSearchTerm(value);
    onSearch(value);
  };

  const handleSortChange = (sortType) => {
    setSelectedSort(sortType);
    onFilterChange(sortType);
    setShowFilters(false);
  };

  return (
    <div className="search-bar">
      <div className="search-input-container">
        <svg className="search-icon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <circle cx="11" cy="11" r="8"/>
          <path d="m21 21-4.35-4.35"/>
        </svg>
        <input
          type="text"
          placeholder="Search venues by name, type, or location..."
          className="search-input"
          value={searchTerm}
          onChange={handleSearch}
        />
      </div>
      <div className="filter-container">
        <button 
          className="filter-button btn"
          onClick={() => setShowFilters(!showFilters)}
        >
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <line x1="4" x2="20" y1="21" y2="21"/>
            <line x1="4" x2="20" y1="9" y2="9"/>
            <line x1="4" x2="20" y1="15" y2="15"/>
            <line x1="4" x2="20" y1="3" y2="3"/>
            <line x1="9" x2="9" y1="21" y2="15"/>
            <line x1="15" x2="15" y1="9" y2="3"/>
          </svg>
          <span className="filter-button-text">Filters</span>
        </button>

        {showFilters && (
          <div className="filter-menu">
            <h3>Sort By</h3>
            <button 
              className={selectedSort === 'name-asc' ? 'active' : ''}
              onClick={() => handleSortChange('name-asc')}
            >
              Name (A-Z)
            </button>
            <button 
              className={selectedSort === 'name-desc' ? 'active' : ''}
              onClick={() => handleSortChange('name-desc')}
            >
              Name (Z-A)
            </button>
            <button 
              className={selectedSort === 'price-asc' ? 'active' : ''}
              onClick={() => handleSortChange('price-asc')}
            >
              Price (Low to High)
            </button>
            <button 
              className={selectedSort === 'price-desc' ? 'active' : ''}
              onClick={() => handleSortChange('price-desc')}
            >
              Price (High to Low)
            </button>
            <button 
              className={selectedSort === 'rating-desc' ? 'active' : ''}
              onClick={() => handleSortChange('rating-desc')}
            >
              Rating (High to Low)
            </button>
            <button 
              className={selectedSort === '' ? 'active' : ''}
              onClick={() => handleSortChange('')}
            >
              Clear Sort
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export { SearchBar };