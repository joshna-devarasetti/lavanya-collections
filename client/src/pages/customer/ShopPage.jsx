import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Search, Filter, SlidersHorizontal, RefreshCcw } from 'lucide-react';
import { api } from '../../services/api';
import { ProductCard } from '../../components/ProductCard';

export const ShopPage = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [totalCount, setTotalCount] = useState(0);

  // Filter States
  const currentCategory = searchParams.get('category') || '';
  const currentAvailability = searchParams.get('availability') || '';
  const currentSearch = searchParams.get('search') || '';
  const currentSort = searchParams.get('sort') || 'newest';
  const minPrice = searchParams.get('minPrice') || '';
  const maxPrice = searchParams.get('maxPrice') || '';

  const [searchInput, setSearchInput] = useState(currentSearch);
  const [minPriceInput, setMinPriceInput] = useState(minPrice);
  const [maxPriceInput, setMaxPriceInput] = useState(maxPrice);

  useEffect(() => {
    // Load categories
    api.getCategories().then((res) => {
      if (res.success) setCategories(res.categories);
    });
  }, []);

  useEffect(() => {
    const fetchProducts = async () => {
      setLoading(true);
      try {
        const queryParams = new URLSearchParams(searchParams);
        const res = await api.getProducts(queryParams.toString());
        if (res.success) {
          setProducts(res.products);
          setTotalCount(res.total);
        }
      } catch (err) {
        console.error('Failed to load products:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, [searchParams]);

  const updateFilter = (key, value) => {
    const next = new URLSearchParams(searchParams);
    if (value) {
      next.set(key, value);
    } else {
      next.delete(key);
    }
    setSearchParams(next);
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    updateFilter('search', searchInput.trim());
  };

  const handlePriceApply = () => {
    const next = new URLSearchParams(searchParams);
    if (minPriceInput) next.set('minPrice', minPriceInput);
    else next.delete('minPrice');

    if (maxPriceInput) next.set('maxPrice', maxPriceInput);
    else next.delete('maxPrice');

    setSearchParams(next);
  };

  const resetAllFilters = () => {
    setSearchInput('');
    setMinPriceInput('');
    setMaxPriceInput('');
    setSearchParams({});
  };

  return (
    <div style={{ padding: '2.5rem 1rem' }}>
      <div className="container">
        {/* Page Header */}
        <div style={{ marginBottom: '2rem' }}>
          <h1 style={{ fontSize: '2.4rem', marginBottom: '0.5rem' }}>All Collections</h1>
          <p style={{ color: 'var(--text-secondary)' }}>
            Showing {totalCount} authentic handcrafted products and rental collections
          </p>
        </div>

        {/* Filter Controls Bar */}
        <div className="card" style={{ padding: '1.25rem', marginBottom: '2rem' }}>
          {/* Top row: Search and Sort */}
          <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.25rem' }}>
            <form onSubmit={handleSearchSubmit} style={{ display: 'flex', gap: '0.5rem', flex: 1, minWidth: '280px' }}>
              <div style={{ position: 'relative', flex: 1 }}>
                <input
                  type="text"
                  placeholder="Search products by title, stone, fabric..."
                  value={searchInput}
                  onChange={(e) => setSearchInput(e.target.value)}
                  className="form-input"
                  style={{ paddingLeft: '2.2rem' }}
                />
                <Search size={16} color="var(--text-muted)" style={{ position: 'absolute', left: '0.8rem', top: '50%', transform: 'translateY(-50%)' }} />
              </div>
              <button type="submit" className="btn btn-secondary btn-sm">Search</button>
            </form>

            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)', whiteSpace: 'nowrap' }}>Sort By:</span>
              <select
                value={currentSort}
                onChange={(e) => updateFilter('sort', e.target.value)}
                className="form-select"
                style={{ width: 'auto', padding: '0.5rem 1rem', fontSize: '0.85rem' }}
              >
                <option value="newest">Newest Arrivals</option>
                <option value="price_asc">Price: Low to High</option>
                <option value="price_desc">Price: High to Low</option>
                <option value="popular">Most Popular</option>
              </select>
            </div>
          </div>

          {/* Middle row: Availability Pills */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap', marginBottom: '1.25rem', paddingBottom: '1rem', borderBottom: '1px solid var(--border-subtle)' }}>
            <span style={{ fontSize: '0.82rem', fontWeight: 600, color: 'var(--text-secondary)', marginRight: '0.5rem' }}>
              Availability:
            </span>
            <button
              onClick={() => updateFilter('availability', '')}
              className={`btn btn-sm ${!currentAvailability ? 'btn-primary' : 'btn-outline-dark'}`}
            >
              All Items
            </button>
            <button
              onClick={() => updateFilter('availability', 'buy')}
              className={`btn btn-sm ${currentAvailability === 'buy' ? 'btn-primary' : 'btn-outline-dark'}`}
            >
              Buy Available
            </button>
            <button
              onClick={() => updateFilter('availability', 'rent')}
              className={`btn btn-sm ${currentAvailability === 'rent' ? 'btn-primary' : 'btn-outline-dark'}`}
            >
              Rent Available
            </button>
          </div>

          {/* Bottom row: Category Tabs */}
          <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', alignItems: 'center' }}>
            <span style={{ fontSize: '0.82rem', fontWeight: 600, color: 'var(--text-secondary)', marginRight: '0.5rem' }}>
              Category:
            </span>
            <button
              onClick={() => updateFilter('category', '')}
              className={`badge ${!currentCategory ? 'badge-gold' : ''}`}
              style={{ padding: '0.45rem 0.85rem', cursor: 'pointer', background: !currentCategory ? 'var(--gold-primary)' : 'var(--bg-ivory)', color: !currentCategory ? '#fff' : 'var(--text-primary)', border: '1px solid var(--border-subtle)' }}
            >
              All Categories
            </button>
            {categories.map((c) => (
              <button
                key={c._id}
                onClick={() => updateFilter('category', c.slug)}
                className={`badge`}
                style={{
                  padding: '0.45rem 0.85rem',
                  cursor: 'pointer',
                  background: currentCategory === c.slug ? 'var(--gold-primary)' : 'var(--bg-ivory)',
                  color: currentCategory === c.slug ? '#fff' : 'var(--text-primary)',
                  border: '1px solid var(--border-subtle)'
                }}
              >
                {c.name}
              </button>
            ))}

            {(currentCategory || currentAvailability || currentSearch || currentSort !== 'newest') && (
              <button
                onClick={resetAllFilters}
                style={{ marginLeft: 'auto', background: 'transparent', color: 'var(--status-danger)', fontSize: '0.82rem', display: 'flex', alignItems: 'center', gap: '0.35rem' }}
              >
                <RefreshCcw size={13} />
                <span>Reset Filters</span>
              </button>
            )}
          </div>
        </div>

        {/* Product Grid Area */}
        {loading ? (
          <div style={{ textAlign: 'center', padding: '5rem 0', color: 'var(--text-muted)' }}>
            <p>Loading handcrafted treasures...</p>
          </div>
        ) : products.length === 0 ? (
          <div className="card" style={{ textAlign: 'center', padding: '4rem 1rem' }}>
            <h3 style={{ fontSize: '1.4rem', marginBottom: '0.75rem' }}>No products found</h3>
            <p style={{ color: 'var(--text-muted)', marginBottom: '1.5rem' }}>
              We could not find any products matching your selected filters.
            </p>
            <button onClick={resetAllFilters} className="btn btn-outline">
              Clear All Filters
            </button>
          </div>
        ) : (
          <div className="grid-products">
            {products.map((p) => (
              <ProductCard key={p._id} product={p} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
