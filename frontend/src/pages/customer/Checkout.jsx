import React, { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../../context/AuthContext';
import { ArrowLeft, CheckCircle2, AlertCircle, ShoppingBag, CreditCard, Loader2, Package, Shuffle } from 'lucide-react';

const InputField = ({ label, name, type = 'text', placeholder, required = false, formData, errors, handleInputChange }) => (
  <div className="mb-5">
    <label className="block text-gray-300 text-sm font-medium mb-2">
      {label} {required && <span className="text-red-500">*</span>}
    </label>
    {type === 'textarea' ? (
      <textarea
        name={name}
        value={formData[name]}
        onChange={handleInputChange}
        placeholder={placeholder}
        rows="3"
        className={`w-full bg-[#0a0a0a] border ${errors[name] ? 'border-red-500 focus:ring-red-500/50' : 'border-gray-700 focus:border-blue-500 focus:ring-blue-500/50'} rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-1 transition-all resize-none`}
      />
    ) : (
      <input
        type={type}
        name={name}
        value={formData[name]}
        onChange={handleInputChange}
        placeholder={placeholder}
        className={`w-full bg-[#0a0a0a] border ${errors[name] ? 'border-red-500 focus:ring-red-500/50' : 'border-gray-700 focus:border-blue-500 focus:ring-blue-500/50'} rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-1 transition-all`}
      />
    )}
    {errors[name] && <p className="text-red-500 text-xs mt-1.5 flex items-center gap-1"><AlertCircle size={12}/> {errors[name]}</p>}
  </div>
);

const Checkout = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, token } = useAuth();

  // State from ProductDetails — now includes optional variant
  const { product, variant, quantity, total } = location.state || {};

  const [formData, setFormData] = useState({
    customerName: user?.name || '',
    customerEmail: user?.email || '',
    contactNumber: '',
    address: '',
    cityProvince: '',
    zipCode: '',
    notes: '',
    paymentMode: 'Cash on Delivery'
  });

  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);

  if (!user) {
    return (
      <div className="py-20 text-center animate-fade-in-up">
        <div className="w-20 h-20 bg-amber-500/10 rounded-full flex items-center justify-center mb-6 mx-auto border border-amber-500/20">
          <AlertCircle size={40} className="text-amber-500" />
        </div>
        <h2 className="text-2xl font-bold text-white mb-4">Authentication Required</h2>
        <p className="text-gray-400 mb-8 max-w-md mx-auto">You must be logged in to your account to proceed with the checkout and place an order.</p>
        <button onClick={() => navigate('/dashboard')} className="bg-blue-600 hover:bg-blue-500 text-white px-8 py-3 rounded-xl font-medium transition-colors">Go to Dashboard to Login</button>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="py-20 text-center">
        <h2 className="text-2xl font-bold text-white mb-4">No Items in Checkout</h2>
        <button onClick={() => navigate('/dashboard')} className="text-blue-500 hover:underline">Return to Catalog</button>
      </div>
    );
  }

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors(prev => ({ ...prev, [name]: '' }));
  };

  const validateForm = () => {
    const newErrors = {};
    if (!formData.customerName.trim()) newErrors.customerName = 'Full Name is required';
    if (!formData.customerEmail.trim()) newErrors.customerEmail = 'Email is required';
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.customerEmail)) newErrors.customerEmail = 'Invalid email format';
    if (!formData.contactNumber.trim()) newErrors.contactNumber = 'Contact Number is required';
    if (!formData.address.trim()) newErrors.address = 'Complete Address is required';
    if (!formData.cityProvince.trim()) newErrors.cityProvince = 'City/Province is required';
    if (!formData.zipCode.trim()) newErrors.zipCode = 'Zip Code is required';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    setIsSubmitting(true);
    try {
      const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';
      const orderPayload = {
        userId: user?.id,
        productId: product.id,
        variantId: variant?.id || null,   // Pass variant ID if selected
        quantity,
        ...formData
      };

      const res = await axios.post(`${API_URL}/api/customer/orders`, orderPayload, {
        headers: { Authorization: `Bearer ${token}` }
      });

      if (res.data.success) {
        setSuccess(res.data.data.id);
      }
    } catch (err) {
      console.error('Failed to submit order', err);
      setErrors({ submit: err.response?.data?.error || 'Failed to place order. Please try again.' });
      setIsSubmitting(false);
    }
  };

  if (success) {
    return (
      <div className="flex flex-col items-center justify-center py-32 animate-fade-in-up text-center">
        <div className="w-20 h-20 bg-green-500/10 rounded-full flex items-center justify-center mb-6 border border-green-500/20">
          <CheckCircle2 size={40} className="text-green-500" />
        </div>
        <h2 className="text-3xl font-bold text-white mb-4">Order Placed Successfully!</h2>
        <p className="text-gray-400 mb-8 max-w-md">Thank you for your purchase. We have received your order and will process it shortly.</p>
        <div className="flex items-center gap-4 justify-center">
          <button onClick={() => navigate('/dashboard')} className="px-6 py-3 bg-[#111111] border border-gray-700 hover:border-gray-500 text-white rounded-xl transition-all font-medium">Return to Dashboard</button>
          <button onClick={() => navigate(`/order/${success}`)} className="px-6 py-3 bg-blue-600 hover:bg-blue-500 text-white rounded-xl transition-all font-medium flex items-center gap-2 shadow-lg shadow-blue-500/20">
            <Package size={18} /> View Order
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="animate-fade-in-up pb-20">
      <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors mb-8 group">
        <ArrowLeft size={20} className="group-hover:-translate-x-1 transition-transform" />
        Back to Product
      </button>

      <div className="flex items-center gap-3 mb-8">
        <CreditCard className="text-blue-500" size={32} />
        <h1 className="text-3xl font-extrabold text-white">Secure Checkout</h1>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">

        {/* Left Form Section */}
        <div className="lg:col-span-2">
          <form onSubmit={handleSubmit} className="bg-[#111111] border border-gray-800 rounded-3xl p-8">
            <h2 className="text-xl font-bold text-white mb-6 border-b border-gray-800 pb-4">Shipping Information</h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6">
              <InputField label="Full Name" name="customerName" required placeholder="John Doe" formData={formData} errors={errors} handleInputChange={handleInputChange} />
              <InputField label="Email Address" name="customerEmail" type="email" required placeholder="john@example.com" formData={formData} errors={errors} handleInputChange={handleInputChange} />
              <InputField label="Contact Number" name="contactNumber" required placeholder="09123456789" formData={formData} errors={errors} handleInputChange={handleInputChange} />
              <InputField label="Zip Code" name="zipCode" required placeholder="e.g. 1000" formData={formData} errors={errors} handleInputChange={handleInputChange} />
            </div>

            <InputField label="Complete Address" name="address" required placeholder="Street Name, Building, House No." formData={formData} errors={errors} handleInputChange={handleInputChange} />
            <InputField label="City/Province" name="cityProvince" required placeholder="e.g. Quezon City, Metro Manila" formData={formData} errors={errors} handleInputChange={handleInputChange} />
            <InputField label="Additional Notes" name="notes" type="textarea" placeholder="Any special instructions for delivery? (Optional)" formData={formData} errors={errors} handleInputChange={handleInputChange} />

            <h2 className="text-xl font-bold text-white mt-10 mb-6 border-b border-gray-800 pb-4">Payment Method</h2>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
              {['Cash on Delivery', 'Bank Transfer', '50% downpayment'].map((mode) => (
                <label key={mode} className={`flex flex-col items-center justify-center p-4 border rounded-xl cursor-pointer transition-all ${formData.paymentMode === mode ? 'border-blue-500 bg-blue-500/10 text-blue-400' : 'border-gray-700 bg-[#0a0a0a] text-gray-400 hover:border-gray-500'}`}>
                  <input type="radio" name="paymentMode" value={mode} checked={formData.paymentMode === mode} onChange={handleInputChange} className="sr-only" />
                  <span className="text-sm font-medium text-center">{mode}</span>
                </label>
              ))}
            </div>

            {errors.submit && (
              <div className="mb-6 p-4 bg-red-500/10 border border-red-500/20 text-red-500 rounded-xl flex items-center gap-2">
                <AlertCircle size={18} />{errors.submit}
              </div>
            )}

            <div className="flex justify-end pt-4">
              <button type="submit" disabled={isSubmitting} className="bg-blue-600 hover:bg-blue-500 text-white px-8 py-4 rounded-xl font-semibold flex items-center gap-3 transition-all hover:shadow-lg hover:shadow-blue-500/20 disabled:opacity-70 disabled:cursor-not-allowed w-full md:w-auto">
                {isSubmitting ? (<><Loader2 size={20} className="animate-spin" />Processing Order...</>) : (<><CheckCircle2 size={20} />Complete Order</>)}
              </button>
            </div>
          </form>
        </div>

        {/* Right Summary Section */}
        <div className="lg:col-span-1">
          <div className="bg-[#111111] border border-gray-800 rounded-3xl p-6 sticky top-24">
            <h2 className="text-lg font-bold text-white mb-6 flex items-center gap-2">
              <ShoppingBag size={20} className="text-blue-500" /> Order Summary
            </h2>

            <div className="flex gap-4 mb-6">
              <div className="w-20 h-20 bg-gray-800 rounded-lg flex-shrink-0 flex items-center justify-center overflow-hidden border border-gray-700">
                {(product.imageUrls?.[0] || product.imageUrl) ? (
                  <img src={product.imageUrls?.[0] || product.imageUrl} alt={product.name} className="w-full h-full object-cover" />
                ) : (
                  <Package size={24} className="text-gray-500" />
                )}
              </div>
              <div className="flex flex-col justify-center flex-1">
                <h3 className="text-white font-medium line-clamp-2 text-sm">{product.name}</h3>
                <p className="text-gray-400 text-xs mt-1">{product.type}</p>

                {/* Variant display in summary */}
                {variant && (
                  <div className="flex items-center gap-1.5 mt-2 px-2 py-1 bg-blue-500/10 border border-blue-500/20 rounded-lg w-fit">
                    <Shuffle size={11} className="text-blue-400" />
                    <span className="text-blue-400 text-xs font-semibold">{variant.name}</span>
                  </div>
                )}

                <div className="flex justify-between items-center mt-2">
                  <span className="text-gray-300 text-sm">Qty: {quantity}</span>
                  <span className="text-blue-400 font-semibold text-sm">₱{(variant?.price ?? product.price).toLocaleString()}</span>
                </div>
              </div>
            </div>

            <div className="border-t border-gray-800 pt-4 space-y-3 mb-6">
              <div className="flex justify-between text-gray-400 text-sm">
                <span>Subtotal</span>
                <span>₱{total.toLocaleString()}</span>
              </div>
              <div className="flex justify-between text-gray-400 text-sm">
                <span>Shipping</span>
                <span className="text-green-500">Calculated later</span>
              </div>
            </div>

            <div className="border-t border-gray-800 pt-4 flex justify-between items-end">
              <span className="text-gray-300 font-medium">Total Amount</span>
              <span className="text-2xl font-bold text-white">₱{total.toLocaleString()}</span>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};

export default Checkout;
