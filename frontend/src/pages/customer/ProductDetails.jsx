import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../../context/AuthContext';
import {
  ArrowLeft,
  Package,
  Minus,
  Plus,
  ShoppingCart,
  MessageSquare,
  ShieldCheck,
  Truck,
  ChevronLeft,
  ChevronRight,
  ZoomIn,
  X,
  ImageOff,
  Star,
  Shuffle,
  CheckCircle,
} from 'lucide-react';
import { buildProductOptions, getDefaultOption } from './buildProductOptions';

/* ─────────────────────────────────────────────
   Image Gallery Component
───────────────────────────────────────────── */
const ImageGallery = ({ images, productName }) => {
  const [activeIndex, setActiveIndex] = useState(0);
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [isTransitioning, setIsTransitioning] = useState(false);

  const imgs = images && images.length > 0 ? images : [];
  const hasImages = imgs.length > 0;

  const goTo = useCallback(
    (index) => {
      if (isTransitioning) return;
      const next = (index + imgs.length) % imgs.length;
      if (next === activeIndex) return;
      setIsTransitioning(true);
      setTimeout(() => { setActiveIndex(next); setIsTransitioning(false); }, 180);
    },
    [activeIndex, imgs.length, isTransitioning]
  );

  const goPrev = useCallback((e) => { e?.stopPropagation(); goTo(activeIndex - 1); }, [activeIndex, goTo]);
  const goNext = useCallback((e) => { e?.stopPropagation(); goTo(activeIndex + 1); }, [activeIndex, goTo]);

  useEffect(() => {
    if (!lightboxOpen) return;
    const handler = (e) => {
      if (e.key === 'ArrowLeft') goPrev();
      if (e.key === 'ArrowRight') goNext();
      if (e.key === 'Escape') setLightboxOpen(false);
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [lightboxOpen, goPrev, goNext]);

  useEffect(() => {
    document.body.style.overflow = lightboxOpen ? 'hidden' : '';
    return () => { document.body.style.overflow = ''; };
  }, [lightboxOpen]);

  if (!hasImages) {
    return (
      <div className="bg-white border border-gray-200 shadow-sm rounded-3xl flex flex-col items-center justify-center min-h-[420px] gap-4">
        <ImageOff size={64} className="text-gray-400" />
        <p className="text-gray-500 text-sm font-medium">No images uploaded for this product</p>
      </div>
    );
  }

  return (
    <>
      <div className="flex flex-col gap-4">
        <div className="relative bg-white border border-gray-200 shadow-sm rounded-3xl overflow-hidden group" style={{ minHeight: 420 }}>
          <div className={`w-full h-full flex items-center justify-center p-6 transition-opacity duration-[180ms] ${isTransitioning ? 'opacity-0' : 'opacity-100'}`} style={{ minHeight: 420 }}>
            <img src={imgs[activeIndex]} alt={`${productName} — image ${activeIndex + 1}`} className="w-full h-full object-contain max-h-[500px] drop-shadow-md select-none" draggable={false} />
          </div>
          <button onClick={() => setLightboxOpen(true)} className="absolute bottom-4 right-4 bg-black/60 hover:bg-black/80 backdrop-blur-sm border border-white/10 text-white rounded-xl p-2.5 opacity-0 group-hover:opacity-100 transition-all duration-200 hover:scale-110" title="View full size">
            <ZoomIn size={18} />
          </button>
          {imgs.length > 1 && (
            <>
              <button onClick={goPrev} className="absolute left-3 top-1/2 -translate-y-1/2 bg-black/60 hover:bg-black/80 backdrop-blur-sm border border-white/10 text-white rounded-xl p-2 opacity-0 group-hover:opacity-100 transition-all duration-200 hover:scale-110 disabled:opacity-30" aria-label="Previous image"><ChevronLeft size={22} /></button>
              <button onClick={goNext} className="absolute right-3 top-1/2 -translate-y-1/2 bg-black/60 hover:bg-black/80 backdrop-blur-sm border border-white/10 text-white rounded-xl p-2 opacity-0 group-hover:opacity-100 transition-all duration-200 hover:scale-110" aria-label="Next image"><ChevronRight size={22} /></button>
              <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-1.5">
                {imgs.map((_, i) => (
                  <button key={i} onClick={() => goTo(i)} className={`rounded-full transition-all duration-200 ${i === activeIndex ? 'w-5 h-2 bg-blue-500' : 'w-2 h-2 bg-white/30 hover:bg-white/60'}`} aria-label={`Go to image ${i + 1}`} />
                ))}
              </div>
            </>
          )}
          {imgs.length > 1 && (
            <div className="absolute top-4 right-4 bg-black/60 backdrop-blur-sm border border-white/10 text-white text-xs font-medium px-2.5 py-1 rounded-full">{activeIndex + 1} / {imgs.length}</div>
          )}
        </div>
        {imgs.length > 1 && (
          <div className="flex gap-2.5 overflow-x-auto pb-1 scrollbar-thin">
            {imgs.map((url, i) => (
              <button key={i} onClick={() => goTo(i)} className={`flex-shrink-0 w-16 h-16 rounded-xl overflow-hidden border-2 transition-all duration-200 ${i === activeIndex ? 'border-blue-500 shadow-md scale-105' : 'border-gray-200 hover:border-gray-400 opacity-60 hover:opacity-100'}`} aria-label={`View image ${i + 1}`}>
                <img src={url} alt={`Thumbnail ${i + 1}`} className="w-full h-full object-cover" draggable={false} />
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Lightbox */}
      {lightboxOpen && (
        <div className="fixed inset-0 z-[200] bg-black/95 backdrop-blur-sm flex flex-col items-center justify-center p-4" onClick={() => setLightboxOpen(false)}>
          <button onClick={() => setLightboxOpen(false)} className="absolute top-4 right-4 bg-white/10 hover:bg-white/20 text-white rounded-xl p-2.5 transition-colors z-10" aria-label="Close lightbox"><X size={22} /></button>
          <div className="absolute top-4 left-1/2 -translate-x-1/2 text-white/60 text-sm font-medium">{activeIndex + 1} / {imgs.length}</div>
          <div className="relative max-w-5xl w-full flex items-center justify-center" onClick={(e) => e.stopPropagation()}>
            <img src={imgs[activeIndex]} alt={`${productName} — full view ${activeIndex + 1}`} className={`max-h-[80vh] max-w-full object-contain rounded-2xl transition-opacity duration-[180ms] select-none ${isTransitioning ? 'opacity-0' : 'opacity-100'}`} draggable={false} />
            {imgs.length > 1 && (
              <>
                <button onClick={goPrev} className="absolute -left-4 md:-left-14 bg-white/10 hover:bg-white/20 backdrop-blur-sm text-white rounded-xl p-3 transition-all hover:scale-110" aria-label="Previous"><ChevronLeft size={26} /></button>
                <button onClick={goNext} className="absolute -right-4 md:-right-14 bg-white/10 hover:bg-white/20 backdrop-blur-sm text-white rounded-xl p-3 transition-all hover:scale-110" aria-label="Next"><ChevronRight size={26} /></button>
              </>
            )}
          </div>
          {imgs.length > 1 && (
            <div className="flex gap-2 mt-6 overflow-x-auto max-w-full px-4" onClick={(e) => e.stopPropagation()}>
              {imgs.map((url, i) => (
                <button key={i} onClick={() => goTo(i)} className={`flex-shrink-0 w-14 h-14 rounded-lg overflow-hidden border-2 transition-all duration-200 ${i === activeIndex ? 'border-blue-500 scale-110' : 'border-white/20 opacity-50 hover:opacity-100'}`}>
                  <img src={url} alt="" className="w-full h-full object-cover" draggable={false} />
                </button>
              ))}
            </div>
          )}
        </div>
      )}
    </>
  );
};

/* ─────────────────────────────────────────────
   Variant Selector Component
   Renders all selectable options (base product + variants)
───────────────────────────────────────────── */
const VariantSelector = ({ options, selectedOption, onSelect }) => {
  if (!options || options.length === 0) return null;

  return (
    <div className="mb-6">
      <div className="flex items-center gap-2 mb-3">
        <Shuffle size={16} className="text-gray-500" />
        <span className="text-gray-700 font-bold text-sm">Select Option</span>
        {selectedOption && (
          <span className="ml-auto text-xs text-gray-500">
            Selected: <span className="text-gray-900 font-bold">{selectedOption.name}</span>
          </span>
        )}
      </div>
      <div className="flex flex-wrap gap-2">
        {options.map((opt) => {
          // Use a stable key: null id (base) gets a string key
          const optKey = opt.id !== null ? opt.id : '_base';
          const isSelected = selectedOption?.id === opt.id && selectedOption?.isBaseProduct === opt.isBaseProduct;
          const isOutOfStock = opt.status === 'out_of_stock' || opt.stock === 0;
          return (
            <button
              key={optKey}
              onClick={() => !isOutOfStock && onSelect(opt)}
              disabled={isOutOfStock}
              className={`relative px-4 py-2.5 rounded-xl border-2 text-sm font-bold transition-all duration-200 flex flex-col items-center gap-0.5
                ${isSelected
                  ? 'border-blue-500 bg-blue-50 text-blue-700 shadow-md'
                  : isOutOfStock
                    ? 'border-gray-200 bg-gray-50 text-gray-400 cursor-not-allowed'
                    : 'border-gray-300 bg-white text-gray-700 hover:border-gray-400 hover:bg-gray-50 hover:text-gray-900 shadow-sm'
                }`}
            >
              {isSelected && (
                <span className="absolute -top-1.5 -right-1.5 w-5 h-5 bg-blue-500 rounded-full flex items-center justify-center">
                  <CheckCircle size={12} className="text-white fill-white" />
                </span>
              )}
              <span className="flex items-center gap-1.5">
                {opt.name}
                {opt.isBaseProduct && (
                  <span className="text-[10px] bg-blue-500/20 text-blue-300 px-1.5 py-0.5 rounded font-semibold">DEFAULT</span>
                )}
              </span>
              <span className={`text-xs font-extrabold ${isSelected ? 'text-blue-600' : isOutOfStock ? 'text-gray-400' : 'text-gray-900'}`}>
                ₱{Number(opt.price).toLocaleString()}
              </span>
              {isOutOfStock && <span className="text-[10px] text-red-500 font-semibold">Out of Stock</span>}
            </button>
          );
        })}
      </div>
    </div>
  );
};

/* ─────────────────────────────────────────────
   Main Page Component
───────────────────────────────────────────── */
const ProductDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { token } = useAuth();

  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [quantity, setQuantity] = useState(1);
  const [reviews, setReviews] = useState([]);
  const [fetchingReviews, setFetchingReviews] = useState(true);

  // Selected option state (base product or variant)
  const [selectedOption, setSelectedOption] = useState(null);

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';
        const res = await axios.get(`${API_URL}/api/customer/products/${id}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (res.data.success) {
          const productData = res.data.data;
          setProduct(productData);
          // Build unified options and auto-select the default (base product first)
          const options = buildProductOptions(productData);
          const defaultOpt = getDefaultOption(options);
          if (defaultOpt) {
            setSelectedOption(defaultOpt);
          }
        }
      } catch (err) {
        console.error('Failed to fetch product details', err);
        setError('Could not load product details.');
      } finally {
        setLoading(false);
      }
    };

    const fetchReviews = async () => {
      try {
        const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';
        const res = await axios.get(`${API_URL}/api/customer/reviews/product/${id}`);
        if (res.data.success) setReviews(res.data.data);
      } catch (err) {
        console.error('Failed to fetch product reviews', err);
      } finally {
        setFetchingReviews(false);
      }
    };

    fetchProduct();
    fetchReviews();
  }, [id, token]);

  // Build unified selectable options from base product + variants
  const productOptions = useMemo(() => buildProductOptions(product), [product]);
  const hasOptions = productOptions.length > 0;

  // Derived values based on the currently selected option
  const activePrice = selectedOption?.price ?? product?.price ?? 0;
  const activeStock = selectedOption?.stock ?? product?.stock ?? 0;

  const handleOptionSelect = (opt) => {
    setSelectedOption(opt);
    setQuantity(1); // Reset quantity when switching option
  };

  const handleDecrease = () => { if (quantity > 1) setQuantity(quantity - 1); };
  const handleIncrease = () => { if (quantity < activeStock) setQuantity(quantity + 1); };

  const handleProceedToCheckout = () => {
    if (hasOptions && !selectedOption) {
      alert('Please select a product option before proceeding.');
      return;
    }
    if (quantity > 0 && quantity <= activeStock) {
      // Map the selected option back to the variant shape expected by Checkout/Order.
      // Base product: variant = null (variantId will be null in the order)
      // Variant: pass the original variant object from product.variants
      let variantForCheckout = null;
      if (selectedOption && !selectedOption.isBaseProduct) {
        variantForCheckout = product.variants.find(v => v.id === selectedOption.id) || null;
      }
      navigate('/checkout', {
        state: {
          product,
          variant: variantForCheckout,
          quantity,
          total: activePrice * quantity
        }
      });
    }
  };

  const getProductImages = (p) => {
    if (!p) return [];
    if (p.imageUrls && p.imageUrls.length > 0) return p.imageUrls;
    if (p.imageUrl) return [p.imageUrl];
    return [];
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-32 text-gray-400">
        <div className="w-12 h-12 border-4 border-blue-500/20 border-t-blue-500 rounded-full animate-spin mb-4" />
        Loading product details...
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="py-20 text-center">
        <div className="bg-red-50 border border-red-200 text-red-600 p-6 rounded-xl inline-block font-semibold">{error || 'Product not found.'}</div>
        <div className="mt-6"><button onClick={() => navigate(-1)} className="text-gray-600 hover:text-gray-900 font-medium hover:underline">&larr; Go Back</button></div>
      </div>
    );
  }

  const productImages = getProductImages(product);
  const canBuy = activeStock > 0 && (!hasOptions || selectedOption !== null);

  return (
    <div className="animate-fade-in-up pb-20">
      {/* Back Button */}
      <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-gray-500 hover:text-gray-900 font-medium transition-colors mb-8 group">
        <ArrowLeft size={20} className="group-hover:-translate-x-1 transition-transform" />
        BACK TO CATALOG
      </button>

      {/* Product Top Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 mb-16">

        {/* Left: Image Gallery */}
        <div className="relative">
          <div className="absolute top-4 left-4 z-10">
            <span className="bg-white/90 text-gray-900 border border-gray-200 shadow-sm text-sm font-bold px-4 py-1.5 rounded-full backdrop-blur-md">{product.type}</span>
          </div>
          <ImageGallery images={productImages} productName={product.name} />
          {productImages.length > 1 && (
            <p className="text-center text-gray-600 text-xs mt-2">{productImages.length} photos · Click main image to zoom</p>
          )}
        </div>

        {/* Right: Product Info & Order Form */}
        <div className="flex flex-col">
          <h1 className="text-4xl font-extrabold text-gray-900 mb-2 tracking-tight">{product.name}</h1>

          {/* Average Rating */}
          <div className="flex items-center gap-2 mb-4">
            <div className="flex text-yellow-500">
              {[1, 2, 3, 4, 5].map((star) => (
                <Star key={star} size={18} className={star <= (product.averageRating || 0) ? 'fill-yellow-500' : 'text-gray-300'} />
              ))}
            </div>
            <span className="text-gray-900 font-extrabold">{product.averageRating ? product.averageRating.toFixed(1) : '0.0'}</span>
            <span className="text-gray-500 text-sm font-medium">({product.reviewCount || 0} reviews)</span>
          </div>

          {/* Price — updates reactively based on selected option */}
          <div className="flex items-end gap-2 mb-4">
            <span className="text-4xl font-extrabold text-gray-900 transition-all duration-200 tracking-tight">
              ₱{activePrice.toLocaleString()}
            </span>
            {selectedOption && (
              <span className="text-gray-600 mb-1 text-sm font-medium">— {selectedOption.name}</span>
            )}
            {!hasOptions && <span className="text-gray-500 mb-1 font-medium">/ {product.unit}</span>}
          </div>

          <p className="text-gray-700 text-lg leading-relaxed mb-6 font-medium">
            {product.description || 'Premium quality roofing material designed for long-lasting durability and exceptional aesthetic appeal. Perfect for your construction needs.'}
          </p>

          {/* Features */}
          <div className="grid grid-cols-2 gap-4 mb-6">
            <div className="flex items-center gap-3 text-gray-700">
              <div className="bg-green-50 text-green-600 p-2 rounded-lg border border-green-100"><ShieldCheck size={20} /></div>
              <span className="text-sm font-bold">Quality Guaranteed</span>
            </div>
            <div className="flex items-center gap-3 text-gray-700">
              <div className="bg-blue-50 text-blue-600 p-2 rounded-lg border border-blue-100"><Truck size={20} /></div>
              <span className="text-sm font-bold">Free Delivery</span>
            </div>
          </div>

          {/* Order Box */}
          <div className="bg-white border border-gray-200 shadow-sm rounded-2xl p-6 mt-auto">

            {/* Product Option Selector (Base Product + Variants) */}
            <VariantSelector
              options={productOptions}
              selectedOption={selectedOption}
              onSelect={handleOptionSelect}
            />

            {/* Option required warning */}
            {hasOptions && !selectedOption && (
              <div className="mb-4 px-4 py-2.5 bg-amber-500/10 border border-amber-500/20 rounded-xl flex items-center gap-2 text-amber-400 text-sm">
                <Shuffle size={14} />
                Please select a product option to continue.
              </div>
            )}

            {/* Stock indicator */}
            <div className="flex justify-between items-center mb-4">
              <span className="text-gray-600 font-bold">Available Stock</span>
              <span className={`px-3 py-1 rounded-full text-sm font-extrabold transition-all duration-200 ${activeStock > 10 ? 'bg-green-50 text-green-600 border border-green-200' : activeStock > 0 ? 'bg-amber-50 text-amber-600 border border-amber-200' : 'bg-red-50 text-red-600 border border-red-200'}`}>
                {activeStock} units
              </span>
            </div>

            {/* Quantity Selector */}
            <div className="flex items-center justify-between mb-6">
              <span className="text-gray-700 font-bold">Quantity</span>
              <div className="flex items-center bg-gray-50 border border-gray-200 rounded-xl overflow-hidden">
                <button onClick={handleDecrease} disabled={quantity <= 1} className="p-3 text-gray-500 hover:text-gray-900 hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"><Minus size={18} /></button>
                <div className="w-16 text-center font-extrabold text-gray-900 text-lg">{quantity}</div>
                <button onClick={handleIncrease} disabled={quantity >= activeStock || activeStock === 0} className="p-3 text-gray-500 hover:text-gray-900 hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"><Plus size={18} /></button>
              </div>
            </div>

            {/* Total & Action */}
            <div className="pt-4 border-t border-gray-200 flex items-center justify-between">
              <div>
                <p className="text-gray-500 font-bold text-sm mb-1">Total Price</p>
                <p className="text-2xl font-extrabold text-gray-900 transition-all duration-200 tracking-tight">
                  ₱{(activePrice * quantity).toLocaleString()}
                </p>
              </div>
              <button
                onClick={handleProceedToCheckout}
                disabled={!canBuy}
                className="bg-gray-900 hover:bg-gray-800 text-white px-8 py-3.5 rounded-xl font-bold flex items-center gap-3 transition-all hover:shadow-lg hover:shadow-gray-300 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <ShoppingCart size={20} />
                Buy Now
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Reviews Section */}
      <div className="mt-12">
        <div className="flex items-center gap-3 mb-8 pb-4 border-b border-gray-200">
          <MessageSquare className="text-gray-700" size={24} />
          <h2 className="text-2xl font-bold text-gray-900 tracking-tight">Customer Reviews</h2>
          <span className="bg-gray-100 text-gray-700 text-sm font-extrabold px-3 py-1 rounded-full ml-2 border border-gray-200">{product.reviewCount || 0}</span>
        </div>

        {fetchingReviews ? (
          <div className="flex justify-center py-12"><div className="w-8 h-8 border-2 border-gray-300 border-t-gray-700 rounded-full animate-spin" /></div>
        ) : reviews.length === 0 ? (
          <div className="bg-white border border-gray-200 shadow-sm rounded-2xl p-16 flex flex-col items-center justify-center text-center">
            <div className="bg-gray-50 border border-gray-100 p-4 rounded-full mb-4"><MessageSquare size={32} className="text-gray-400" /></div>
            <h3 className="text-xl font-extrabold text-gray-900 mb-2 tracking-tight">No reviews yet</h3>
            <p className="text-gray-500 max-w-md font-medium">Customer reviews will appear here once this product has been purchased and rated by our community.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {reviews.map((review) => (
              <div key={review.id} className="bg-white border border-gray-200 shadow-sm rounded-2xl p-6 hover:border-gray-300 transition-colors">
                <div className="flex justify-between items-start mb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-gray-100 text-gray-800 flex items-center justify-center font-bold text-lg border border-gray-200">
                      {review.user?.name?.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <p className="text-gray-900 font-bold">{review.user?.name}</p>
                      <p className="text-gray-500 font-medium text-xs">{new Date(review.createdAt).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</p>
                    </div>
                  </div>
                  <div className="flex text-yellow-500 gap-0.5">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <Star key={star} size={14} className={star <= review.rating ? 'fill-yellow-500' : 'text-gray-300'} />
                    ))}
                  </div>
                </div>
                {review.title && <h4 className="text-gray-900 font-extrabold mb-2">{review.title}</h4>}
                <p className="text-gray-700 text-sm leading-relaxed mb-4 font-medium">{review.comment}</p>
                {review.imageUrls && review.imageUrls.length > 0 && (
                  <div className="flex gap-2 mt-4">
                    {review.imageUrls.map((img, idx) => (
                      <div key={idx} className="w-16 h-16 rounded-lg overflow-hidden border border-gray-200">
                        <img src={img} alt={`Review by ${review.user?.name}`} className="w-full h-full object-cover" />
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default ProductDetails;
