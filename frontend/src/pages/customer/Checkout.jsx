import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../../context/AuthContext';
import { useCart } from '../../context/CartContext';
import { ArrowLeft, CheckCircle2, AlertCircle, ShoppingBag, CreditCard, Loader2, Package, Shuffle, MapPin, Edit3 } from 'lucide-react';

const InputField = ({ label, name, type = 'text', placeholder, required = false, formData, errors, handleInputChange }) => (
  <div className="mb-5">
    <label className="block text-gray-700 text-sm font-bold mb-2">
      {label} {required && <span className="text-red-500">*</span>}
    </label>
    {type === 'textarea' ? (
      <textarea
        name={name}
        value={formData[name] || ''}
        onChange={handleInputChange}
        placeholder={placeholder}
        rows="3"
        className={`w-full bg-white border shadow-sm ${errors[name] ? 'border-red-500 focus:ring-red-500/50' : 'border-gray-300 focus:border-gray-400 focus:ring-gray-400/50'} rounded-xl px-4 py-3 text-gray-900 font-medium focus:outline-none focus:ring-1 transition-all resize-none`}
      />
    ) : (
      <input
        type={type}
        name={name}
        value={formData[name] || ''}
        onChange={handleInputChange}
        placeholder={placeholder}
        className={`w-full bg-white border shadow-sm ${errors[name] ? 'border-red-500 focus:ring-red-500/50' : 'border-gray-300 focus:border-gray-400 focus:ring-gray-400/50'} rounded-xl px-4 py-3 text-gray-900 font-medium focus:outline-none focus:ring-1 transition-all`}
      />
    )}
    {errors[name] && <p className="text-red-500 text-xs mt-1.5 flex items-center gap-1 font-bold"><AlertCircle size={12} /> {errors[name]}</p>}
  </div>
);

const Checkout = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, token } = useAuth();
  const { clearCart, removeFromCart, updateQuantity } = useCart();

  const state = location.state || {};
  let initialOrderItems = [];
  let initialOrderTotal = 0;
  
  if (state.isBulk && state.items) {
    initialOrderItems = state.items;
    initialOrderTotal = state.total;
  } else if (state.isSingle && state.item) {
    initialOrderItems = [state.item];
    initialOrderTotal = state.item.price * state.item.quantity;
  } else if (state.product) {
    initialOrderItems = [{
      product: state.product,
      variant: state.variant,
      variantId: state.variant?.id || null,
      quantity: state.quantity,
      price: state.total / state.quantity
    }];
    initialOrderTotal = state.total;
  }

  const [orderItems, setOrderItems] = useState(initialOrderItems);
  const [orderTotal, setOrderTotal] = useState(initialOrderTotal);

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
  
  // Profile loading & bypass logic
  const [isLoadingProfile, setIsLoadingProfile] = useState(true);
  const [hasProfile, setHasProfile] = useState(false);
  const [isEditingAddress, setIsEditingAddress] = useState(false);

  useEffect(() => {
    if (!token) {
      setIsLoadingProfile(false);
      return;
    }

    const fetchProfile = async () => {
      try {
        const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';
        const res = await axios.get(`${API_URL}/api/auth/profile`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        if (res.data.data) {
          const profile = res.data.data;
          setFormData(prev => ({
            ...prev,
            customerName: profile.name || prev.customerName,
            customerEmail: profile.email || prev.customerEmail,
            contactNumber: profile.contactNumber || '',
            address: profile.address || '',
            cityProvince: profile.cityProvince || '',
            zipCode: profile.zipCode || ''
          }));
          
          if (profile.address && profile.contactNumber && profile.cityProvince && profile.zipCode) {
            setHasProfile(true);
          }
        }
      } catch (err) {
        console.error("Failed to load profile", err);
      } finally {
        setIsLoadingProfile(false);
      }
    };

    fetchProfile();
  }, [token]);

  if (!user) {
    return (
      <div className="py-20 text-center animate-fade-in-up">
        <div className="w-20 h-20 bg-amber-50 rounded-full flex items-center justify-center mb-6 mx-auto border border-amber-200">
          <AlertCircle size={40} className="text-amber-500" />
        </div>
        <h2 className="text-2xl font-extrabold text-gray-900 tracking-tight mb-4">Authentication Required</h2>
        <p className="text-gray-600 font-medium mb-8 max-w-md mx-auto">You must be logged in to your account to proceed with the checkout and place an order.</p>
        <button onClick={() => navigate('/dashboard')} className="bg-gray-900 hover:bg-gray-800 text-white shadow-sm px-8 py-3 rounded-xl font-bold transition-colors">Go to Dashboard to Login</button>
      </div>
    );
  }

  if (orderItems.length === 0) {
    return (
      <div className="py-20 text-center">
        <h2 className="text-2xl font-extrabold text-gray-900 tracking-tight mb-4">No Items in Checkout</h2>
        <button onClick={() => navigate('/dashboard')} className="text-gray-600 hover:text-gray-900 font-bold hover:underline">Return to Catalog</button>
      </div>
    );
  }

  if (isLoadingProfile) {
    return (
      <div className="flex flex-col items-center justify-center py-32 text-gray-400">
        <Loader2 size={48} className="animate-spin mb-4 text-blue-500" />
        Loading your secure checkout...
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
    if (!formData.contactNumber?.trim()) newErrors.contactNumber = 'Contact Number is required';
    if (!formData.address?.trim()) newErrors.address = 'Complete Address is required';
    if (!formData.cityProvince?.trim()) newErrors.cityProvince = 'City/Province is required';
    if (!formData.zipCode?.trim()) newErrors.zipCode = 'Zip Code is required';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const saveProfileAddress = async () => {
    try {
      const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';
      await axios.put(`${API_URL}/api/auth/profile`, {
        contactNumber: formData.contactNumber,
        address: formData.address,
        cityProvince: formData.cityProvince,
        zipCode: formData.zipCode
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setHasProfile(true);
      setIsEditingAddress(false);
    } catch (err) {
      console.error("Failed to save profile address", err);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    setIsSubmitting(true);
    

    if (isEditingAddress || !hasProfile) {
      await saveProfileAddress();
    }

    try {
      const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';
      
      let res;
      if (state.isBulk || orderItems.length > 1) {
        
        const bulkPayload = {
          userId: user?.id,
          paymentMode: formData.paymentMode,
          customerName: formData.customerName,
          customerEmail: formData.customerEmail,
          contactNumber: formData.contactNumber,
          address: formData.address,
          cityProvince: formData.cityProvince,
          zipCode: formData.zipCode,
          notes: formData.notes,
          items: orderItems.map(item => ({
            productId: item.product.id,
            variantId: item.variant?.id || item.variantId || null,
            quantity: item.quantity
          }))
        };
        res = await axios.post(`${API_URL}/api/customer/orders/bulk`, bulkPayload, {
          headers: { Authorization: `Bearer ${token}` }
        });
        if (res.data.success && state.isBulk) {
          clearCart(); 
        }
      } else {
        
        const singleItem = orderItems[0];
        const singlePayload = {
          userId: user?.id,
          productId: singleItem.product.id,
          variantId: singleItem.variant?.id || singleItem.variantId || null,
          quantity: singleItem.quantity,
          ...formData
        };
        res = await axios.post(`${API_URL}/api/customer/orders`, singlePayload, {
          headers: { Authorization: `Bearer ${token}` }
        });
        if (res.data.success && state.isSingle) {
          removeFromCart(state.item.id); 
        }
      }

      if (res.data.success) {
        setSuccess(res.data.data.id);
      }
    } catch (err) {
      console.error('Failed to submit order', err);
      if (err.response?.status === 409 && err.response?.data?.details?.type === 'STOCK_ERROR') {
         const { itemName, available, requested } = err.response.data.details;
         if (available === 0) {
           setErrors({ submit: `The item "${itemName}" is Out of Stock, please find another item available.` });
         } else {
           setErrors({ submit: `The item "${itemName}" only has ${available} units left (you requested ${requested}). We've adjusted your quantity. Please review and try again.` });
           
           
           const updatedItems = orderItems.map(item => {
             const nameMatches = item.variant ? item.variant.name === itemName : item.product.name === itemName;
             if (nameMatches) {
               if (updateQuantity && item.id) updateQuantity(item.id, available); // sync with cart
               return { ...item, quantity: available };
             }
             return item;
           });
           setOrderItems(updatedItems);
           const newTotal = updatedItems.reduce((acc, item) => acc + ((item.variant?.price ?? item.product.price) * item.quantity), 0);
           setOrderTotal(newTotal);
         }
      } else {
        setErrors({ submit: err.response?.data?.error || 'Failed to place order. Please try again.' });
      }
      setIsSubmitting(false);
    }
  };

  if (success) {
    return (
      <div className="flex flex-col items-center justify-center py-32 animate-fade-in-up text-center">
        <div className="w-20 h-20 bg-green-50 rounded-full flex items-center justify-center mb-6 border border-green-200">
          <CheckCircle2 size={40} className="text-green-600" />
        </div>
        <h2 className="text-3xl font-extrabold text-gray-900 tracking-tight mb-4">Order Placed Successfully!</h2>
        <p className="text-gray-600 font-medium mb-8 max-w-md">Thank you for your purchase. We have received your order and will process it shortly.</p>
        <div className="flex items-center gap-4 justify-center">
          <button onClick={() => navigate('/dashboard')} className="px-6 py-3 bg-white border border-gray-300 hover:border-gray-400 shadow-sm text-gray-700 rounded-xl transition-all font-bold">Return to Dashboard</button>
          <button onClick={() => navigate(`/order/${success}`)} className="px-6 py-3 bg-gray-900 hover:bg-gray-800 text-white shadow-sm rounded-xl transition-all font-bold flex items-center gap-2">
            <Package size={18} /> View Order
          </button>
        </div>
      </div>
    );
  }

  const showAddressForm = !hasProfile || isEditingAddress;

  return (
    <div className="animate-fade-in-up pb-20">
      <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-gray-500 hover:text-gray-900 font-bold transition-colors mb-8 group">
        <ArrowLeft size={20} className="group-hover:-translate-x-1 transition-transform" />
        Back to Previous
      </button>

      <div className="flex items-center gap-3 mb-8">
        <CreditCard className="text-gray-700" size={32} />
        <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight">Secure Checkout</h1>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">

        
        <div className="lg:col-span-2">
          
          <form onSubmit={handleSubmit} className="bg-white border border-gray-200 shadow-sm rounded-3xl p-8">
            
            <div className="flex justify-between items-center mb-6 border-b border-gray-200 pb-4">
              <h2 className="text-xl font-extrabold text-gray-900 tracking-tight">Shipping Information</h2>
              {hasProfile && !isEditingAddress && (
                <button 
                  type="button" 
                  onClick={() => setIsEditingAddress(true)}
                  className="text-blue-600 hover:text-blue-800 font-bold text-sm flex items-center gap-1"
                >
                  <Edit3 size={16} /> Edit Address
                </button>
              )}
              {isEditingAddress && hasProfile && (
                <button 
                  type="button" 
                  onClick={() => {
                    setIsEditingAddress(false);
                    setErrors({});
                  }}
                  className="text-gray-500 hover:text-gray-700 font-bold text-sm flex items-center gap-1"
                >
                  Cancel Edit
                </button>
              )}
            </div>

            {showAddressForm ? (
              <>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6">
                  <InputField label="Full Name" name="customerName" required placeholder="John Doe" formData={formData} errors={errors} handleInputChange={handleInputChange} />
                  <InputField label="Email Address" name="customerEmail" type="email" required placeholder="john@example.com" formData={formData} errors={errors} handleInputChange={handleInputChange} />
                  <InputField label="Contact Number" name="contactNumber" required placeholder="09123456789" formData={formData} errors={errors} handleInputChange={handleInputChange} />
                  <InputField label="Zip Code" name="zipCode" required placeholder="e.g. 1000" formData={formData} errors={errors} handleInputChange={handleInputChange} />
                </div>

                <InputField label="Complete Address" name="address" required placeholder="Street Name, Building, House No." formData={formData} errors={errors} handleInputChange={handleInputChange} />
                <InputField label="City/Province" name="cityProvince" required placeholder="e.g. Quezon City, Metro Manila" formData={formData} errors={errors} handleInputChange={handleInputChange} />
              </>
            ) : (
              <div className="bg-gray-50 border border-gray-200 rounded-2xl p-6 mb-8 flex gap-4 items-start">
                <MapPin className="text-blue-600 flex-shrink-0 mt-1" size={24} />
                <div>
                  <h3 className="font-extrabold text-gray-900 text-lg mb-1">{formData.customerName}</h3>
                  <p className="text-gray-600 font-medium mb-1">{formData.contactNumber}</p>
                  <p className="text-gray-700 font-medium">{formData.address}, {formData.cityProvince} {formData.zipCode}</p>
                  <p className="text-gray-500 text-sm mt-1">{formData.customerEmail}</p>
                </div>
              </div>
            )}

            <InputField label="Additional Notes" name="notes" type="textarea" placeholder="Any special instructions for delivery? (Optional)" formData={formData} errors={errors} handleInputChange={handleInputChange} />

            <h2 className="text-xl font-extrabold text-gray-900 tracking-tight mt-10 mb-6 border-b border-gray-200 pb-4">Payment Method</h2>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
              {['Cash on Delivery with 50% Bank tranfer', 'Bank Transfer Fully Paid'].map((mode) => (
                <label key={mode} className={`flex flex-col items-center justify-center p-4 border rounded-xl cursor-pointer transition-all ${formData.paymentMode === mode ? 'border-gray-900 bg-gray-50 text-gray-900 shadow-sm' : 'border-gray-200 bg-white text-gray-500 hover:border-gray-300 hover:text-gray-700 shadow-sm'}`}>
                  <input type="radio" name="paymentMode" value={mode} checked={formData.paymentMode === mode} onChange={handleInputChange} className="sr-only" />
                  <span className="text-sm font-bold text-center">{mode}</span>
                </label>
              ))}
            </div>

            {errors.submit && (
              <div className="mb-6 p-4 bg-red-50 border border-red-200 text-red-600 rounded-xl flex items-center gap-2 font-bold">
                <AlertCircle size={18} />{errors.submit}
              </div>
            )}

            <div className="flex justify-end pt-4">
              <button type="submit" disabled={isSubmitting} className="bg-gray-900 hover:bg-gray-800 text-white shadow-sm px-8 py-4 rounded-xl font-bold flex items-center gap-3 transition-all hover:shadow-md disabled:opacity-70 disabled:cursor-not-allowed w-full md:w-auto">
                {isSubmitting ? (<><Loader2 size={20} className="animate-spin" />Processing Order...</>) : (<><CheckCircle2 size={20} />Complete Order</>)}
              </button>
            </div>
          </form>
        </div>

        {/* Right Summary Section */}
        <div className="lg:col-span-1">
          <div className="bg-white border border-gray-200 shadow-sm rounded-3xl p-6 sticky top-24">
            <h2 className="text-lg font-extrabold text-gray-900 tracking-tight mb-6 flex items-center gap-2">
              <ShoppingBag size={20} className="text-gray-700" /> Order Summary
            </h2>

            <div className="flex flex-col gap-4 mb-6 max-h-[300px] overflow-y-auto scrollbar-thin pr-2">
              {orderItems.map((item, idx) => (
                <div key={idx} className="flex gap-4">
                  <div className="w-16 h-16 bg-white rounded-lg flex-shrink-0 flex items-center justify-center overflow-hidden border border-gray-200">
                    {(item.product.imageUrls?.[0] || item.product.imageUrl) ? (
                      <img src={item.product.imageUrls?.[0] || item.product.imageUrl} alt={item.product.name} className="w-full h-full object-cover" />
                    ) : (
                      <Package size={20} className="text-gray-400" />
                    )}
                  </div>
                  <div className="flex flex-col justify-center flex-1">
                    <h3 className="text-gray-900 font-bold tracking-tight line-clamp-1 text-sm">{item.product.name}</h3>
                    
                    {/* Variant display in summary */}
                    {item.variant && (
                      <div className="flex items-center gap-1.5 mt-1 px-2 py-0.5 bg-gray-50 border border-gray-200 shadow-sm rounded-md w-fit">
                        <Shuffle size={10} className="text-gray-500" />
                        <span className="text-gray-900 font-bold text-[10px]">{item.variant.name}</span>
                      </div>
                    )}

                    <div className="flex justify-between items-center mt-2">
                      <span className="text-gray-600 font-medium text-xs">Qty: {item.quantity}</span>
                      <span className="text-gray-900 font-extrabold text-xs">₱{((item.variant?.price ?? item.product.price) * item.quantity).toLocaleString()}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className="border-t border-gray-200 pt-4 space-y-3 mb-6">
              <div className="flex justify-between text-gray-600 font-medium text-sm">
                <span>Subtotal</span>
                <span>₱{orderTotal.toLocaleString()}</span>
              </div>
              <div className="flex justify-between text-gray-600 font-medium text-sm">
                <span>Shipping</span>
                <span className="text-green-600 font-bold">Calculated later</span>
              </div>
            </div>

            <div className="border-t border-gray-200 pt-4 flex justify-between items-end">
              <span className="text-gray-600 font-bold">Total Amount</span>
              <span className="text-2xl font-extrabold text-gray-900 tracking-tight">₱{orderTotal.toLocaleString()}</span>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};

export default Checkout;
