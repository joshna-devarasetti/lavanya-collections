import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Sparkles, Calendar, ArrowRight, ShieldCheck, Truck, RefreshCw, Heart, MessageCircle } from 'lucide-react';
import { api } from '../../services/api';
import { ProductCard } from '../../components/ProductCard';

export const HomePage = () => {
  const [categories, setCategories] = useState([]);
  const [featuredProducts, setFeaturedProducts] = useState([]);
  const [rentalProducts, setRentalProducts] = useState([]);
  const [newArrivals, setNewArrivals] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [catsRes, featRes, rentRes, newRes] = await Promise.all([
          api.getCategories(),
          api.getProducts('isFeatured=true&limit=4'),
          api.getProducts('availabilityType=rent&limit=4'),
          api.getProducts('isNewArrival=true&limit=4')
        ]);

        if (catsRes.success) setCategories(catsRes.categories);
        if (featRes.success) setFeaturedProducts(featRes.products);
        if (rentRes.success) setRentalProducts(rentRes.products);
        if (newRes.success) setNewArrivals(newRes.products);
      } catch (err) {
        console.error('Failed to load homepage data:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const whatsappNumber = import.meta.env.VITE_STORE_WHATSAPP || '+919876543210';
  const cleanPhone = whatsappNumber.replace(/[^0-9]/g, '');

  return (
    <div>
      {/* Hero Banner */}
      <section style={{
        background: 'linear-gradient(135deg, #FBF8F2 0%, #F5ECDD 50%, #EDE0CF 100%)',
        padding: '4.5rem 1rem',
        borderBottom: '1px solid var(--border-gold)',
        position: 'relative',
        overflow: 'hidden'
      }}>
        <div className="container" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', alignItems: 'center', gap: '3rem' }}>
          <div>
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', background: '#FFFFFF', padding: '0.35rem 0.85rem', borderRadius: 'var(--radius-full)', border: '1px solid var(--border-gold)', marginBottom: '1.25rem' }}>
              <Sparkles size={14} color="var(--gold-primary)" />
              <span style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--gold-dark)', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
                Boutique Heritage & Modern Elegance
              </span>
            </div>

            <h1 style={{ fontSize: 'clamp(2.2rem, 5vw, 3.4rem)', color: 'var(--text-primary)', marginBottom: '1.25rem', lineHeight: 1.15 }}>
              Traditional Splendour for Life’s Celebrations
            </h1>

            <p style={{ fontSize: '1.05rem', color: 'var(--text-secondary)', lineHeight: 1.7, marginBottom: '2rem', maxWidth: '520px' }}>
              Discover handcrafted bridal jewellery, designer photoshoot frocks, traditional doll sets, and customized decor. Available for outright purchase or flexible rental booking across India.
            </p>

            <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
              <Link to="/shop" className="btn btn-primary btn-lg">
                Explore Collections
                <ArrowRight size={18} />
              </Link>
              <Link to="/rentals" className="btn btn-secondary btn-lg">
                <Calendar size={18} />
                Rentals Catalog
              </Link>
              <Link to="/custom-orders" className="btn btn-outline btn-lg">
                <Sparkles size={18} />
                Custom Orders
              </Link>
            </div>

            {/* Advance payment highlight pill */}
            <div style={{ marginTop: '2rem', display: 'flex', alignItems: 'center', gap: '0.75rem', fontSize: '0.85rem', color: 'var(--text-muted)' }}>
              <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: 'var(--gold-primary)' }} />
              <span>Configurable Advance Payments (10% to 50%) • Fast Pan-India Shipping</span>
            </div>
          </div>

          <div style={{ position: 'relative' }}>
            <div style={{
              borderRadius: 'var(--radius-lg)',
              overflow: 'hidden',
              boxShadow: 'var(--shadow-lg)',
              border: '2px solid #FFFFFF'
            }}>
              <img
                src="https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?auto=format&fit=crop&w=800&q=80"
                alt="Lavanya Collections Jewellery"
                style={{ width: '100%', height: '420px', objectFit: 'cover', display: 'block' }}
              />
            </div>
            {/* Floating Luxury Tag */}
            <div style={{
              position: 'absolute',
              bottom: '-1.5rem',
              right: '-1rem',
              background: '#FFFFFF',
              border: '1px solid var(--border-gold)',
              borderRadius: 'var(--radius-md)',
              padding: '1rem 1.25rem',
              boxShadow: 'var(--shadow-md)',
              display: 'flex',
              alignItems: 'center',
              gap: '0.75rem'
            }}>
              <div style={{ width: '40px', height: '40px', borderRadius: '50%', background: 'var(--gold-lighter)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Sparkles size={20} color="var(--gold-primary)" />
              </div>
              <div>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'block' }}>Customized For You</span>
                <span style={{ fontWeight: 700, color: 'var(--text-primary)', fontSize: '0.95rem' }}>100% Handcrafted</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Feature Value Props */}
      <section style={{ background: '#FFFFFF', borderBottom: '1px solid var(--border-subtle)', padding: '2rem 1rem' }}>
        <div className="container" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '2rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <div style={{ padding: '0.75rem', borderRadius: '50%', background: 'var(--bg-cream)' }}>
              <Sparkles size={22} color="var(--gold-primary)" />
            </div>
            <div>
              <h4 style={{ fontSize: '0.95rem', fontWeight: 600 }}>Artisanal Quality</h4>
              <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>Authentic traditional designs</p>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <div style={{ padding: '0.75rem', borderRadius: '50%', background: 'var(--bg-cream)' }}>
              <Calendar size={22} color="var(--accent-rent)" />
            </div>
            <div>
              <h4 style={{ fontSize: '0.95rem', fontWeight: 600 }}>Flexible Rentals</h4>
              <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>Easy bookings from ₹750/3 days</p>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <div style={{ padding: '0.75rem', borderRadius: '50%', background: 'var(--bg-cream)' }}>
              <Truck size={22} color="var(--gold-primary)" />
            </div>
            <div>
              <h4 style={{ fontSize: '0.95rem', fontWeight: 600 }}>Pan-India Delivery</h4>
              <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>Reliable courier tracking</p>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <div style={{ padding: '0.75rem', borderRadius: '50%', background: 'var(--bg-cream)' }}>
              <ShieldCheck size={22} color="var(--status-success)" />
            </div>
            <div>
              <h4 style={{ fontSize: '0.95rem', fontWeight: 600 }}>Low Advance Option</h4>
              <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>Pay rest upon delivery</p>
            </div>
          </div>
        </div>
      </section>

      {/* Shop by Category */}
      <section style={{ padding: '4rem 1rem' }}>
        <div className="container">
          <div style={{ textAlign: 'center', marginBottom: '2.5rem' }}>
            <h2 style={{ fontSize: '2.2rem', marginBottom: '0.5rem' }}>Curated Categories</h2>
            <p style={{ color: 'var(--text-secondary)', fontSize: '1rem' }}>Explore our exquisite collections made for milestone memories</p>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))', gap: '1.25rem' }}>
            {categories.map((cat) => (
              <Link
                key={cat._id}
                to={`/shop?category=${cat.slug}`}
                className="card card-hover"
                style={{ textAlign: 'center', padding: '1.25rem', textDecoration: 'none', display: 'flex', flexDirection: 'column', alignItems: 'center' }}
              >
                <div style={{ width: '80px', height: '80px', borderRadius: '50%', overflow: 'hidden', marginBottom: '1rem', border: '2px solid var(--border-gold)' }}>
                  <img
                    src={cat.imageUrl || 'https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?auto=format&fit=crop&w=200&q=80'}
                    alt={cat.name}
                    style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                  />
                </div>
                <h3 style={{ fontSize: '1rem', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '0.25rem' }}>
                  {cat.name}
                </h3>
                <span style={{ fontSize: '0.78rem', color: 'var(--gold-dark)', fontWeight: 500 }}>
                  View Items →
                </span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Products */}
      <section style={{ padding: '4rem 1rem', background: 'var(--bg-cream)' }}>
        <div className="container">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '2.5rem', flexWrap: 'wrap', gap: '1rem' }}>
            <div>
              <span style={{ fontSize: '0.8rem', textTransform: 'uppercase', letterSpacing: '0.1em', color: 'var(--gold-dark)', fontWeight: 600 }}>
                Handpicked Treasures
              </span>
              <h2 style={{ fontSize: '2.2rem' }}>Featured Boutique Products</h2>
            </div>
            <Link to="/shop" className="btn btn-outline btn-sm">
              View All ({featuredProducts.length}+)
              <ArrowRight size={16} />
            </Link>
          </div>

          <div className="grid-products">
            {featuredProducts.map((p) => (
              <ProductCard key={p._id} product={p} />
            ))}
          </div>
        </div>
      </section>

      {/* Custom Design Orders Spotlight */}
      <section style={{
        padding: '5rem 1rem',
        background: 'linear-gradient(135deg, #23130C 0%, #3B2014 100%)',
        color: '#FAF6EE'
      }}>
        <div className="container" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', alignItems: 'center', gap: '3.5rem' }}>
          <div>
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', background: 'rgba(197, 155, 39, 0.2)', padding: '0.35rem 0.85rem', borderRadius: 'var(--radius-full)', border: '1px solid var(--gold-primary)', marginBottom: '1.25rem' }}>
              <Sparkles size={14} color="var(--gold-light)" />
              <span style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--gold-light)', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
                Bespoke Craftsmanship
              </span>
            </div>

            <h2 style={{ fontSize: 'clamp(2rem, 4vw, 2.8rem)', color: '#FAF6EE', marginBottom: '1.25rem', lineHeight: 1.2 }}>
              Have a Unique Idea? We Craft It For You.
            </h2>

            <p style={{ color: '#D4C4B7', fontSize: '1.05rem', lineHeight: 1.7, marginBottom: '2rem' }}>
              Send us your reference photos, Pinterest inspiration, or heirloom concepts. We review your request, prepare a detailed formal quotation, and craft your custom jewellery, frock, or gift upon quotation approval and advance payment.
            </p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginBottom: '2rem', fontSize: '0.92rem' }}>
              <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
                <div style={{ width: '24px', height: '24px', borderRadius: '50%', background: 'var(--gold-primary)', color: '#FFFFFF', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: '0.75rem' }}>1</div>
                <span>Submit your idea & reference images</span>
              </div>
              <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
                <div style={{ width: '24px', height: '24px', borderRadius: '50%', background: 'var(--gold-primary)', color: '#FFFFFF', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: '0.75rem' }}>2</div>
                <span>Receive price quotation & delivery estimate</span>
              </div>
              <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
                <div style={{ width: '24px', height: '24px', borderRadius: '50%', background: 'var(--gold-primary)', color: '#FFFFFF', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: '0.75rem' }}>3</div>
                <span>Approve quotation and pay small advance online</span>
              </div>
              <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
                <div style={{ width: '24px', height: '24px', borderRadius: '50%', background: 'var(--gold-primary)', color: '#FFFFFF', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: '0.75rem' }}>4</div>
                <span>Handcrafted with love and delivered to your doorstep</span>
              </div>
            </div>

            <Link to="/custom-orders" className="btn btn-primary btn-lg">
              Submit Your Custom Idea Now
              <ArrowRight size={18} />
            </Link>
          </div>

          <div style={{ textAlign: 'center' }}>
            <img
              src="https://images.unsplash.com/photo-1513519245088-0e12902e5a38?auto=format&fit=crop&w=700&q=80"
              alt="Custom Design Craftsmanship"
              style={{ width: '100%', maxWidth: '480px', borderRadius: 'var(--radius-lg)', border: '2px solid var(--border-gold)', boxShadow: '0 12px 36px rgba(0,0,0,0.4)' }}
            />
          </div>
        </div>
      </section>

      {/* Rentals Showcase */}
      <section style={{ padding: '4rem 1rem' }}>
        <div className="container">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '2.5rem', flexWrap: 'wrap', gap: '1rem' }}>
            <div>
              <span style={{ fontSize: '0.8rem', textTransform: 'uppercase', letterSpacing: '0.1em', color: 'var(--accent-rent)', fontWeight: 600 }}>
                Budget-Friendly Elegance
              </span>
              <h2 style={{ fontSize: '2.2rem' }}>Available for Rental</h2>
              <p style={{ color: 'var(--text-secondary)' }}>Rent bridal sets, photoshoot frocks, and backdrops for your special occasions</p>
            </div>
            <Link to="/rentals" className="btn btn-secondary btn-sm">
              View Rental Catalog
              <ArrowRight size={16} />
            </Link>
          </div>

          <div className="grid-products">
            {rentalProducts.map((p) => (
              <ProductCard key={p._id} product={p} />
            ))}
          </div>
        </div>
      </section>

      {/* WhatsApp Banner */}
      <section style={{ padding: '3.5rem 1rem', background: 'var(--gold-gradient-subtle)', borderTop: '1px solid var(--border-gold)' }}>
        <div className="container" style={{ textAlign: 'center', maxWidth: '720px' }}>
          <MessageCircle size={36} color="var(--gold-dark)" style={{ marginBottom: '1rem' }} />
          <h2 style={{ fontSize: '2rem', marginBottom: '1rem' }}>Need Advice or Want to See More Videos?</h2>
          <p style={{ color: 'var(--text-secondary)', fontSize: '1.05rem', lineHeight: 1.6, marginBottom: '2rem' }}>
            Connect with our boutique stylist directly on WhatsApp. We share live unboxing videos, sizing guidance, and rental availability checks.
          </p>
          <a
            href={`https://wa.me/${cleanPhone}?text=${encodeURIComponent('Hello Lavanya Collections! I would like to see more designs and check availability.')}`}
            target="_blank"
            rel="noopener noreferrer"
            className="btn btn-primary btn-lg"
          >
            <MessageCircle size={20} />
            Chat With Stylist on WhatsApp
          </a>
        </div>
      </section>
    </div>
  );
};
