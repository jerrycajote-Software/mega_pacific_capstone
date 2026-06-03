import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { ArrowLeft, Package, Clock, Truck, CheckCircle2, MapPin, Calendar, CreditCard, XCircle, Star, Upload, X, Shuffle } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

const statusSteps = [
  { key: 'pending', label: 'Order Placed', Icon: Clock },
  { key: 'processing', label: 'Processing', Icon: Package },
  { key: 'out_for_delivery', label: 'Out for Delivery', Icon: Truck },
  { key: 'delivered', label: 'Delivered', Icon: CheckCircle2 }
];

const OrderDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { token } = useAuth();
  
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Review Modal State
  const [reviewModalOpen, setReviewModalOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [reviewForm, setReviewForm] = useState({ rating: 5, title: '', comment: '', images: [] });
  const [submittingReview, setSubmittingReview] = useState(false);
  const [reviewSuccess, setReviewSuccess] = useState('');
  const [reviewError, setReviewError] = useState('');

  useEffect(() => {
    const fetchOrder = async () => {
      try {
        const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';
        const res = await axios.get(`${API_URL}/api/customer/orders/${id}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        if (res.data.success) {
          setOrder(res.data.data);
        }
      } catch (err) {
        console.error('Failed to fetch order', err);
        setError('Could not retrieve order details. Please try again.');
      } finally {
        setLoading(false);
      }
    };

    fetchOrder();
  }, [id, token]);

  if (loading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-blue-500/20 border-t-blue-500 rounded-full animate-spin"></div>
      </div>
    );
  }

  if (error || !order) {
    return (
      <div className="py-20 text-center animate-fade-in-up">
        <div className="w-20 h-20 bg-red-500/10 rounded-full flex items-center justify-center mb-6 mx-auto border border-red-500/20">
          <XCircle size={40} className="text-red-500" />
        </div>
        <h2 className="text-2xl font-bold text-white mb-4">{error || 'Order not found'}</h2>
        <button onClick={() => navigate('/orders')} className="bg-[#111111] hover:bg-[#1a1a1a] text-white px-8 py-3 rounded-xl border border-gray-700 transition-colors">
          Return to Orders
        </button>
      </div>
    );
  }

  const handleImageUpload = (e) => {
    const files = Array.from(e.target.files);
    if (reviewForm.images.length + files.length > 3) {
      setReviewError('You can only upload up to 3 images.');
      return;
    }
    setReviewError('');

    files.forEach(file => {
      const reader = new FileReader();
      reader.onloadend = () => {
        setReviewForm(prev => ({
          ...prev,
          images: [...prev.images, reader.result]
        }));
      };
      reader.readAsDataURL(file);
    });
  };

  const removeImage = (indexToRemove) => {
    setReviewForm(prev => ({
      ...prev,
      images: prev.images.filter((_, index) => index !== indexToRemove)
    }));
  };

  const submitReview = async (e) => {
    e.preventDefault();
    setSubmittingReview(true);
    setReviewError('');
    setReviewSuccess('');

    try {
      const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';
      const res = await axios.post(`${API_URL}/api/customer/reviews`, {
        productId: selectedProduct.id,
        rating: reviewForm.rating,
        title: reviewForm.title,
        comment: reviewForm.comment,
        imageUrls: reviewForm.images
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });

      if (res.data.success) {
        setReviewSuccess('Review submitted successfully!');
        setTimeout(() => {
          setReviewModalOpen(false);
          setReviewSuccess('');
          setReviewForm({ rating: 5, title: '', comment: '', images: [] });
        }, 2000);
      }
    } catch (err) {
      console.error(err);
      setReviewError(err.response?.data?.message || 'Failed to submit review.');
    } finally {
      setSubmittingReview(false);
    }
  };

  const currentStatusIndex = statusSteps.findIndex(s => s.key === order.status.toLowerCase());
  const isCancelled = order.status.toLowerCase() === 'cancelled';

  return (
    <div className="animate-fade-in-up pb-20 max-w-5xl mx-auto">
      <button 
        onClick={() => navigate(-1)}
        className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors mb-8 group"
      >
        <ArrowLeft size={20} className="group-hover:-translate-x-1 transition-transform" />
        Back to Orders
      </button>

      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-extrabold text-white flex items-center gap-3">
            Order <span className="text-blue-500">#{order.id.toString().padStart(4, '0')}</span>
          </h1>
          <p className="text-gray-400 mt-2 flex items-center gap-2">
            <Calendar size={16} /> 
            Placed on {new Date(order.createdAt).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
          </p>
        </div>
        {order.estimatedDeliveryDate && (
          <div className="bg-blue-500/10 border border-blue-500/20 px-6 py-3 rounded-xl">
            <p className="text-xs text-blue-400 font-medium uppercase tracking-wider mb-1">Estimated Delivery</p>
            <p className="text-white font-bold flex items-center gap-2">
              <Truck size={18} className="text-blue-500" />
              {new Date(order.estimatedDeliveryDate).toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
            </p>
          </div>
        )}
      </div>

      {/* Progress Tracker */}
      <div className="bg-[#111111] border border-gray-800 rounded-3xl p-8 mb-8 overflow-hidden">
        {isCancelled ? (
          <div className="flex flex-col items-center justify-center py-6">
            <div className="w-16 h-16 bg-red-500/10 rounded-full flex items-center justify-center mb-4 border border-red-500/20">
              <XCircle size={32} className="text-red-500" />
            </div>
            <h3 className="text-xl font-bold text-red-500">Order Cancelled</h3>
            <p className="text-gray-400 mt-2 text-center max-w-md">This order has been cancelled and will not be delivered.</p>
          </div>
        ) : (
          <div className="relative">
            {/* Progress Line */}
            <div className="absolute top-6 left-0 w-full h-1 bg-gray-800 rounded-full overflow-hidden">
              <div 
                className="h-full bg-blue-500 transition-all duration-1000 ease-out"
                style={{ width: `${(Math.max(currentStatusIndex, 0) / (statusSteps.length - 1)) * 100}%` }}
              ></div>
            </div>

            <div className="relative flex justify-between">
              {statusSteps.map((step, index) => {
                const isCompleted = index <= currentStatusIndex;
                const isCurrent = index === currentStatusIndex;
                return (
                  <div key={step.key} className="flex flex-col items-center">
                    <div className={`w-12 h-12 rounded-full flex items-center justify-center z-10 transition-colors duration-500 ${
                      isCompleted ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/30' : 'bg-gray-800 text-gray-500 border-4 border-[#111111]'
                    }`}>
                      <step.Icon size={20} />
                    </div>
                    <p className={`mt-3 text-sm font-medium transition-colors ${
                      isCurrent ? 'text-blue-400 font-bold' : isCompleted ? 'text-gray-300' : 'text-gray-600'
                    }`}>
                      {step.label}
                    </p>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left Column: Items & Summary */}
        <div className="lg:col-span-2 space-y-8">
          {/* Order Items */}
          <div className="bg-[#111111] border border-gray-800 rounded-3xl p-8">
            <h2 className="text-xl font-bold text-white mb-6 border-b border-gray-800 pb-4">Ordered Products</h2>
            <div className="space-y-6">
              {order.items.map((item) => (
                <div key={item.id} className="flex gap-6 items-center p-4 bg-[#0a0a0a] rounded-2xl border border-gray-800/50">
                  <div className="w-24 h-24 bg-gray-800 rounded-xl flex-shrink-0 flex items-center justify-center overflow-hidden border border-gray-700">
                    {(item.product.imageUrls?.[0] || item.product.imageUrl) ? (
                      <img src={item.product.imageUrls?.[0] || item.product.imageUrl} alt={item.product.name} className="w-full h-full object-cover" />
                    ) : (
                      <Package size={32} className="text-gray-500" />
                    )}
                  </div>
                  <div className="flex-1">
                    <h3 className="text-white font-medium text-lg">{item.product.name}</h3>
                    <p className="text-gray-400 text-sm mt-1">{item.product.type}</p>
                    {/* Variant Badge */}
                    {(item.variantName || item.variant?.name) && (
                      <div className="flex items-center gap-1.5 mt-2 px-2.5 py-1 bg-blue-500/10 border border-blue-500/20 rounded-lg w-fit">
                        <Shuffle size={11} className="text-blue-400" />
                        <span className="text-blue-400 text-xs font-semibold">
                          {item.variantName || item.variant?.name}
                        </span>
                      </div>
                    )}
                    <div className="flex justify-between items-end mt-4">
                      <span className="text-gray-300">Qty: <span className="text-white font-semibold">{item.quantity}</span></span>
                      <div className="flex flex-col items-end gap-2">
                        <span className="text-blue-400 font-bold">₱{item.price.toLocaleString()}</span>
                        {order.status.toLowerCase() === 'delivered' && (
                          <button 
                            onClick={() => {
                              setSelectedProduct(item.product);
                              setReviewModalOpen(true);
                              setReviewError('');
                              setReviewSuccess('');
                              setReviewForm({ rating: 5, title: '', comment: '', images: [] });
                            }}
                            className="flex items-center gap-1 text-xs bg-gray-800 hover:bg-gray-700 text-white px-3 py-1.5 rounded-full transition-colors"
                          >
                            <Star size={12} className="text-yellow-500 fill-yellow-500" /> Write Review
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Column: Customer Info & Total */}
        <div className="space-y-8">
          {/* Summary */}
          <div className="bg-[#111111] border border-gray-800 rounded-3xl p-6">
            <h2 className="text-lg font-bold text-white mb-6">Payment Summary</h2>
            
            <div className="space-y-3 mb-6">
              <div className="flex justify-between text-gray-400 text-sm">
                <span>Subtotal</span>
                <span>₱{order.total.toLocaleString()}</span>
              </div>
              <div className="flex justify-between text-gray-400 text-sm">
                <span>Shipping</span>
                <span className="text-green-500">Calculated</span>
              </div>
            </div>

            <div className="border-t border-gray-800 pt-4 flex justify-between items-end mb-6">
              <span className="text-gray-300 font-medium">Total Amount</span>
              <span className="text-2xl font-bold text-white">₱{order.total.toLocaleString()}</span>
            </div>

            <div className="flex items-center gap-3 p-4 bg-[#0a0a0a] rounded-xl border border-gray-800">
              <CreditCard className={order.paymentStatus === 'paid' ? 'text-green-500' : 'text-blue-500'} size={24} />
              <div>
                <p className="text-sm text-gray-400">Payment Method</p>
                <p className="text-white font-medium">{order.paymentMode}</p>
              </div>
              <div className="ml-auto">
                <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wide ${
                  order.paymentStatus === 'paid' ? 'bg-green-500/20 text-green-400' : 'bg-amber-500/20 text-amber-400'
                }`}>
                  {order.paymentStatus}
                </span>
              </div>
            </div>
          </div>

          {/* Delivery Details */}
          <div className="bg-[#111111] border border-gray-800 rounded-3xl p-6">
            <h2 className="text-lg font-bold text-white mb-6 flex items-center gap-2">
              <MapPin size={20} className="text-blue-500" /> Delivery Information
            </h2>
            <div className="space-y-4">
              <div>
                <p className="text-sm text-gray-500 mb-1">Customer Name</p>
                <p className="text-white font-medium">{order.customerName}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500 mb-1">Contact</p>
                <p className="text-white">{order.contactNumber}</p>
                <p className="text-gray-400 text-sm">{order.customerEmail}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500 mb-1">Shipping Address</p>
                <p className="text-white">{order.address}</p>
                <p className="text-gray-400 text-sm">{order.cityProvince}, {order.zipCode}</p>
              </div>
              {order.notes && (
                <div className="pt-4 border-t border-gray-800">
                  <p className="text-sm text-gray-500 mb-1">Notes</p>
                  <p className="text-gray-300 text-sm italic">"{order.notes}"</p>
                </div>
              )}
            </div>
          </div>
        </div>

      </div>

      {/* Review Modal */}
      {reviewModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
          <div className="bg-[#111111] border border-gray-800 rounded-3xl w-full max-w-4xl p-6 lg:p-8 animate-scale-in max-h-[90vh] overflow-y-auto custom-scrollbar">
            <div className="flex justify-between items-center mb-6 border-b border-gray-800 pb-4">
              <h3 className="text-2xl font-bold text-white">Write a Review</h3>
              <button onClick={() => setReviewModalOpen(false)} className="text-gray-400 hover:text-white transition-colors bg-gray-800/50 p-2 rounded-full">
                <X size={20} />
              </button>
            </div>
            
            {reviewSuccess ? (
              <div className="py-12 text-center">
                <CheckCircle2 size={64} className="text-green-500 mx-auto mb-4" />
                <p className="text-white font-bold text-xl">{reviewSuccess}</p>
                <p className="text-gray-400 mt-2">Thank you for sharing your experience!</p>
              </div>
            ) : (

              <form onSubmit={submitReview}>
                {reviewError && <p className="text-red-500 bg-red-500/10 p-4 rounded-xl border border-red-500/20 text-sm mb-6">{reviewError}</p>}
                
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12">
                  
                  {/* Left Column */}
                  <div className="space-y-8">
                    {/* Product Info */}
                    <div className="flex gap-4 items-center bg-[#0a0a0a] p-4 rounded-2xl border border-gray-800">
                      <div className="w-16 h-16 bg-gray-800 rounded-xl overflow-hidden flex-shrink-0 border border-gray-700">
                        <img src={selectedProduct?.imageUrls?.[0] || selectedProduct?.imageUrl} alt="Product" className="w-full h-full object-cover" />
                      </div>
                      <div>
                        <p className="text-white font-bold text-lg">{selectedProduct?.name}</p>
                        <p className="text-gray-400 text-sm">{selectedProduct?.type}</p>
                      </div>
                    </div>

                    {/* Rating */}
                    <div>
                      <label className="block text-base font-semibold text-white mb-3">Overall Rating</label>
                      <div className="flex gap-2">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <button
                            type="button"
                            key={star}
                            onClick={() => setReviewForm(prev => ({ ...prev, rating: star }))}
                            className="transition-transform hover:scale-110 focus:outline-none"
                          >
                            <Star 
                              size={36} 
                              className={star <= reviewForm.rating ? 'text-yellow-500 fill-yellow-500 drop-shadow-md' : 'text-gray-600'} 
                            />
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Images */}
                    <div>
                      <label className="block text-base font-semibold text-white mb-1">Add Photos</label>
                      <p className="text-sm text-gray-500 mb-3">Upload up to 3 images showing the product.</p>
                      
                      <div className="flex gap-4 flex-wrap">
                        {reviewForm.images.map((img, index) => (
                          <div key={index} className="relative w-24 h-24 rounded-2xl overflow-hidden border border-gray-700 group">
                            <img src={img} alt="Upload preview" className="w-full h-full object-cover" />
                            <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                              <button 
                                type="button" 
                                onClick={() => removeImage(index)}
                                className="bg-red-500 hover:bg-red-600 rounded-full p-2 transition-colors shadow-lg"
                              >
                                <X size={16} className="text-white" />
                              </button>
                            </div>
                          </div>
                        ))}
                        {reviewForm.images.length < 3 && (
                          <label className="w-24 h-24 flex flex-col items-center justify-center bg-[#0a0a0a] border-2 border-gray-800 border-dashed rounded-2xl cursor-pointer hover:border-blue-500 hover:text-blue-500 transition-colors text-gray-500 group">
                            <Upload size={24} className="mb-2 group-hover:-translate-y-1 transition-transform" />
                            <span className="text-xs font-medium">Upload</span>
                            <input type="file" accept="image/*" multiple onChange={handleImageUpload} className="hidden" />
                          </label>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Right Column */}
                  <div className="space-y-6 flex flex-col h-full">
                    
                    <div>
                      <label className="block text-sm font-semibold text-gray-300 mb-2">Review Title (Optional)</label>
                      <input 
                        type="text" 
                        value={reviewForm.title}
                        onChange={(e) => setReviewForm(prev => ({ ...prev, title: e.target.value }))}
                        className="w-full bg-[#0a0a0a] border border-gray-800 rounded-xl px-5 py-3.5 text-white focus:outline-none focus:border-blue-500 transition-colors"
                        placeholder="Sum up your experience in a short title"
                      />
                    </div>

                    <div className="flex-1 flex flex-col">
                      <label className="block text-sm font-semibold text-gray-300 mb-2">Review Comment <span className="text-red-500">*</span></label>
                      <textarea 
                        value={reviewForm.comment}
                        onChange={(e) => setReviewForm(prev => ({ ...prev, comment: e.target.value }))}
                        required
                        className="w-full flex-1 min-h-[160px] bg-[#0a0a0a] border border-gray-800 rounded-xl px-5 py-4 text-white focus:outline-none focus:border-blue-500 transition-colors resize-none"
                        placeholder="Tell others about product quality, durability, and your overall experience..."
                      />
                    </div>

                    {/* Guidelines */}
                    <div className="bg-blue-500/10 border border-blue-500/20 rounded-xl p-4">
                      <h4 className="text-blue-400 font-semibold text-sm mb-2 flex items-center gap-2"><Star size={14} className="fill-blue-400" /> Review Guidelines</h4>
                      <ul className="text-gray-400 text-xs space-y-1.5 list-disc list-inside">
                        <li>Focus on the product quality and usage.</li>
                        <li>Avoid revealing personal information.</li>
                        <li>Images should be clear and well-lit.</li>
                      </ul>
                    </div>

                  </div>

                </div>

                {/* Footer / Actions */}
                <div className="pt-6 mt-8 border-t border-gray-800 flex justify-end gap-4">
                  <button 
                    type="button" 
                    onClick={() => setReviewModalOpen(false)}
                    className="px-6 py-3 rounded-xl font-semibold text-gray-400 hover:text-white bg-gray-800/30 hover:bg-gray-800/60 transition-colors"
                  >
                    Cancel
                  </button>
                  <button 
                    type="submit" 
                    disabled={submittingReview}
                    className="bg-blue-600 hover:bg-blue-500 text-white px-8 py-3 rounded-xl font-bold transition-all hover:shadow-lg hover:shadow-blue-500/30 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                  >
                    {submittingReview ? (
                      <><div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" /> Submitting...</>
                    ) : 'Submit Review'}
                  </button>
                </div>

              </form>
              
            )}
          </div>
        </div>
      )}

    </div>
  );
};

export default OrderDetails;
