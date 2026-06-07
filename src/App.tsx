import React, { useState, useEffect, useRef } from 'react';
import { 
  ShoppingBag, Search, Sparkles, User, FileText, CreditCard, 
  Trash2, Plus, ArrowRight, ShieldCheck, BadgePercent, ArrowLeft,
  Truck, ArrowUpRight, HelpCircle, Star, MessageSquare, Sparkle,
  Layers, Upload, CheckCircle2, History, AlertTriangle, RefreshCw
} from 'lucide-react';

export default function App() {
  // Screens: 'home' | 'product' | 'cart' | 'checkout' | 'orders' | 'verification' | 'seller-dash' | 'admin-panel'
  const [view, setView] = useState<'home' | 'product' | 'cart' | 'checkout' | 'orders' | 'verification' | 'seller-dash' | 'admin-panel'>('home');
  
  // Onboarding Login portal status
  const [showLogin, setShowLogin] = useState<boolean>(() => {
    return sessionStorage.getItem('shopsphere_logged_in') !== 'true';
  });
  const [loginName, setLoginName] = useState('');
  const [loginEmail, setLoginEmail] = useState('');
  const [loginRole, setLoginRole] = useState<'customer' | 'wholesaler' | 'brandseller'>('customer');
  const [loginLoading, setLoginLoading] = useState(false);
  const [loginError, setLoginError] = useState('');

  // Custom non-blocking Sandbox UI toasts
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' | 'info' } | null>(null);
  const showToast = (message: string, type: 'success' | 'error' | 'info' = 'success') => {
    setToast({ message, type });
    // Auto collapse after 4.5 seconds
    const tid = setTimeout(() => {
      setToast(prev => prev?.message === message ? null : prev);
    }, 4500);
  };
  
  // Core Data State
  const [products, setProducts] = useState<any[]>([]);
  const [selectedProduct, setSelectedProduct] = useState<any>(null);
  const [user, setUser] = useState<any>(null);
  const [availableUsers, setAvailableUsers] = useState<any[]>([]);
  
  // Interaction States
  const [cartCount, setCartCount] = useState(0);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [activeCoupon, setActiveCoupon] = useState<any>(null);
  const [couponCodeInput, setCouponCodeInput] = useState('');
  const [couponError, setCouponError] = useState('');
  
  // Product Page Tabs
  const [productTab, setProductTab] = useState<'desc' | 'specs' | 'reviews' | 'qna'>('desc');
  const [reviewRating, setReviewRating] = useState(5);
  const [reviewText, setReviewText] = useState('');
  const [qnaText, setQnaText] = useState('');
  const [estimatingPincode, setEstimatingPincode] = useState('');
  const [deliveryDaysText, setDeliveryDaysText] = useState('');

  // Checkout States
  const [selectedShipping, setSelectedShipping] = useState('standard');
  const [selectedPayment, setSelectedPayment] = useState('UPI');
  const [b2bCompanyDetails, setB2bCompanyDetails] = useState({ name: '', gstNumber: '', address: '' });
  const [deliveryAddress, setDeliveryAddress] = useState('');
  const [addressError, setAddressError] = useState('');
  
  // AI Feature States
  const [isAiChatOpen, setIsAiChatOpen] = useState(false);
  const [aiChatMessage, setAiChatMessage] = useState('');
  const [aiChatResponses, setAiChatResponses] = useState<Array<{ sender: 'user' | 'ai', text: string }>>([
    { sender: 'ai', text: 'Namaste! Welcome to ShopSphere India Assistant. Ask me anything about our hybrid recommendations, wholesale pricing, or product specifications!' }
  ]);
  const [aiSummaries, setAiSummaries] = useState<{ [prodId: string]: string }>({});
  const [isSummarizing, setIsSummarizing] = useState(false);

  // Recommendations state
  const [recsPackage, setRecsPackage] = useState<{ similarProducts: any[], frequentlyBought: any[], customersAlsoViewed: any[] }>({
    similarProducts: [], frequentlyBought: [], customersAlsoViewed: []
  });
  const [personalizedRecs, setPersonalizedRecs] = useState<any[]>([]);

  // Onboarding On-the-fly fields
  const [verificationForm, setVerificationForm] = useState({
    mode: 'business', // 'business' | 'seller'
    companyName: '',
    aadhaar: '',
    pan: '',
    gst: '',
    bankAccount: '',
    address: ''
  });
  const [verificationFeedback, setVerificationFeedback] = useState('');

  // Seller Dashboard form
  const [sellerProductForm, setSellerProductForm] = useState({
    name: '', category: 'Electronics', price: '', originalPrice: '', description: '', specsText: 'Warranty: 1 Year; Brand: Premium'
  });
  const [generatingAiContent, setGeneratingAiContent] = useState(false);
  const [productSuccessMsg, setProductSuccessMsg] = useState('');

  // Admin Cockpit Lists
  const [adminPending, setAdminPending] = useState<{ pendingBusiness: any[], pendingSellers: any[] }>({
    pendingBusiness: [], pendingSellers: []
  });

  // Fresh Sync triggers
  const [orders, setOrders] = useState<any[]>([]);

  // 1. Initial Sync
  const fetchSession = async () => {
    try {
      const r = await fetch('/api/auth/session');
      const d = await r.json();
      setUser(d.user);
      setAvailableUsers(d.allAvailableUsers);
    } catch (e) {
      console.error(e);
    }
  };

  const fetchProducts = async () => {
    try {
      const url = `/api/products?${selectedCategory !== 'All' ? `category=${selectedCategory}` : ''}${searchQuery ? `&search=${searchQuery}` : ''}`;
      const r = await fetch(url);
      const d = await r.json();
      setProducts(d);
    } catch (e) {
      console.error(e);
    }
  };

  const fetchPersonalRecs = async () => {
    try {
      const r = await fetch('/api/recommendations/personalized');
      const d = await r.json();
      setPersonalizedRecs(d.recommendations || []);
    } catch (e) {}
  };

  const fetchOrders = async () => {
    try {
      const r = await fetch('/api/orders');
      const d = await r.json();
      setOrders(d);
    } catch (e) {}
  };

  useEffect(() => {
    fetchSession();
    fetchOrders();
    fetchPersonalRecs();
  }, []);

  useEffect(() => {
    fetchProducts();
  }, [selectedCategory, searchQuery]);

  // Sync Cart quantities
  const getCartItemsCount = () => {
    if (!user || !user.cart) return 0;
    return user.cart.reduce((s: number, i: any) => s + i.qty, 0);
  };

  // 2. Action Helpers
  const switchUserSession = async (uid: string) => {
    try {
      const r = await fetch('/api/auth/switch-session', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ uid })
      });
      const d = await r.json();
      if (d.success) {
        setUser(d.user);
        setView('home');
        // Refresh orders & recs for the new session user context
        const orderRes = await fetch('/api/orders');
        const orderData = await orderRes.json();
        setOrders(orderData);
        
        const recRes = await fetch('/api/recommendations/personalized');
        const recData = await recRes.json();
        setPersonalizedRecs(recData.recommendations || []);
        
        setActiveCoupon(null);
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleRegisterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!loginName || !loginEmail) {
      setLoginError('Name and Email are fully required.');
      return;
    }
    setLoginLoading(true);
    setLoginError('');
    try {
      const r = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: loginName, email: loginEmail, role: loginRole })
      });
      const d = await r.json();
      if (d.error) {
        setLoginError(d.error);
      } else {
        setUser(d.user);
        sessionStorage.setItem('shopsphere_logged_in', 'true');
        setShowLogin(false);
        showToast(`Welcome, ${d.user.name}! Active role configured as ${loginRole === 'wholesaler' ? 'B2B Wholesaler' : loginRole === 'brandseller' ? 'Brand Seller' : 'Retail Customer'}!`, 'success');
        
        await fetchSession();
        
        const orderRes = await fetch('/api/orders');
        const orderData = await orderRes.json();
        setOrders(orderData);
        
        const recRes = await fetch('/api/recommendations/personalized');
        const recData = await recRes.json();
        setPersonalizedRecs(recData.recommendations || []);
        
        setActiveCoupon(null);
        setView('home');
      }
    } catch (err) {
      setLoginError('Failed to connect to active ShopSphere Gateway routing.');
    } finally {
      setLoginLoading(false);
    }
  };

  const trackProductClick = async (productId: string) => {
    try {
      await fetch('/api/analytics/view', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ productId })
      });
    } catch (e) {}
  };

  const selectProductDetails = async (product: any) => {
    setSelectedProduct(product);
    setProductTab('desc');
    setView('product');
    trackProductClick(product.id);
    
    // Fetch Recommendations mapping
    try {
      const r = await fetch(`/api/products/${product.id}/recommendations`);
      const d = await r.json();
      setRecsPackage(d);
    } catch (e) {}
  };

  const toggleWishlist = async (prodId: string) => {
    try {
      const r = await fetch('/api/user/wishlist', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ productId: prodId })
      });
      const d = await r.json();
      if (d.success) {
        fetchSession();
      }
    } catch (e) {}
  };

  const updateCartQty = async (productId: string, qty: number, act: 'add' | 'set' | 'remove') => {
    try {
      const r = await fetch('/api/user/cart', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ productId, qty, act })
      });
      const d = await r.json();
      if (d.success) {
        await fetchSession();
      }
    } catch (e) {}
  };

  // Submit profile verification
  const submitVerification = async (e: React.FormEvent) => {
    e.preventDefault();
    setVerificationFeedback('');
    try {
      const r = await fetch('/api/auth/verify-profile', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          mode: verificationForm.mode,
          aadhaar: verificationForm.aadhaar,
          pan: verificationForm.pan,
          gst: verificationForm.gst,
          companyName: verificationForm.companyName,
          bankAccount: verificationForm.bankAccount,
          address: verificationForm.address
        })
      });
      const d = await r.json();
      if (d.error) {
        setVerificationFeedback(d.error);
      } else {
        setVerificationFeedback('Successfully submitted to the marketplace queue! Pending administrator active authorization.');
        fetchSession();
      }
    } catch (err) {
      setVerificationFeedback('Connection failure.');
    }
  };

  // Apply discount coupon
  const attemptApplyCoupon = async () => {
    setCouponError('');
    const cartAmount = calculateCartSubtotal();
    try {
      const r = await fetch('/api/coupons/apply', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code: couponCodeInput.toUpperCase(), cartAmount })
      });
      const d = await r.json();
      if (d.error) {
        setCouponError(d.error);
        setActiveCoupon(null);
      } else {
        setActiveCoupon(d.coupon);
      }
    } catch (e) {
      setCouponError('Invalid coupon');
    }
  };

  const enterCheckout = () => {
    // Pre-populate shipping address if it's currently empty
    if (!deliveryAddress) {
      if (user?.businessProfile?.address) {
        setDeliveryAddress(user.businessProfile.address);
      } else if (user?.sellerProfile?.address) {
        setDeliveryAddress(user.sellerProfile.address);
      } else if (b2bCompanyDetails.address) {
        setDeliveryAddress(b2bCompanyDetails.address);
      }
    }
    setAddressError('');
    setView('checkout');
  };

  // Checkout submitting logic
  const handleCheckoutSubmission = async () => {
    if (!deliveryAddress.trim()) {
      setAddressError('A valid delivery shipping address is strictly required to proceed with order dispatch.');
      showToast('Please specify a delivery address to place your order.', 'error');
      const element = document.getElementById('checkout-delivery-address-section');
      if (element) {
        element.scrollIntoView({ behavior: 'smooth' });
      }
      return;
    }
    setAddressError('');
    const cartItems = user?.cart || [];
    try {
      const r = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          cartItems,
          shippingMode: selectedShipping,
          paymentMethod: selectedPayment,
          couponCode: activeCoupon ? activeCoupon.code : null,
          companyDetails: b2bCompanyDetails.gstNumber ? b2bCompanyDetails : null,
          shippingAddress: deliveryAddress
        })
      });
      const d = await r.json();
      if (d.success) {
        fetchSession();
        fetchOrders();
        setView('orders');
        showToast('Your order has been placed successfully in the ShopSphere network!', 'success');
      } else {
        showToast(d.error || 'Checkout failure', 'error');
      }
    } catch (e) {
      showToast('Network failure. Please verify connection and retry.', 'error');
    }
  };

  // AI Chat bot handler
  const sendChatMessage = async () => {
    if (!aiChatMessage.trim()) return;
    const userMsg = aiChatMessage;
    setAiChatResponses(prev => [...prev, { sender: 'user', text: userMsg }]);
    setAiChatMessage('');

    try {
      const r = await fetch('/api/ai/chatbot', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: userMsg, productId: selectedProduct?.id })
      });
      const d = await r.json();
      setAiChatResponses(prev => [...prev, { sender: 'ai', text: d.response }]);
    } catch (e) {
      setAiChatResponses(prev => [...prev, { sender: 'ai', text: 'Error interacting with core assistant.' }]);
    }
  };

  const getAiReviewSummary = async (prodId: string) => {
    setIsSummarizing(true);
    try {
      const r = await fetch(`/api/ai/reviews-summary/${prodId}`);
      const d = await r.json();
      setAiSummaries(prev => ({ ...prev, [prodId]: d.summary }));
    } catch (e) {
      setAiSummaries(prev => ({ ...prev, [prodId]: 'Failed to extract AI summary.' }));
    } finally {
      setIsSummarizing(false);
    }
  };

  // Seller Dashboard adding product with AI helper!
  const generateSellerAiCopy = async () => {
    if (!sellerProductForm.name || !sellerProductForm.category) {
      showToast('Please fill Name and Category first before triggering the AI generator.', 'info');
      return;
    }
    setGeneratingAiContent(true);
    try {
      const r = await fetch('/api/ai/generate-content', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          productName: sellerProductForm.name,
          category: sellerProductForm.category,
          specs: { customSpecs: sellerProductForm.specsText }
        })
      });
      const d = await r.json();
      setSellerProductForm(prev => ({
        ...prev,
        description: d.description,
        specsText: `Tags: ${d.tags?.join(', ')}; ` + prev.specsText
      }));
    } catch (e) {} finally {
      setGeneratingAiContent(false);
    }
  };

  const addSellerProduct = async () => {
    // Parse specifications
    const lines = sellerProductForm.specsText.split(';');
    const specificationsObj: any = {};
    lines.forEach(l => {
      const parts = l.split(':');
      if (parts.length === 2) {
        specificationsObj[parts[0].trim()] = parts[1].trim();
      }
    });

    try {
      const r = await fetch('/api/products', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: sellerProductForm.name,
          category: sellerProductForm.category,
          price: Number(sellerProductForm.price),
          originalPrice: Number(sellerProductForm.originalPrice || sellerProductForm.price),
          description: sellerProductForm.description,
          specifications: specificationsObj
        })
      });
      const d = await r.json();
      if (d.success) {
        setProductSuccessMsg('Core listing submitted successfully and added to active ShopSphere India index!');
        showToast('Product draft listed successfully in active index!', 'success');
        setSellerProductForm({
          name: '', category: 'Electronics', price: '', originalPrice: '', description: '', specsText: 'Warranty: 1 Year; Brand: Premium'
        });
        fetchProducts();
      } else {
        showToast(d.error || 'Listing error', 'error');
      }
    } catch (e) {}
  };

  // Bulk uploads simulation
  const simulateBulkUpload = async () => {
    const mockCsv = [
      { name: "Apex Pro Mechanical Keyboard", category: "Electronics", price: 8999, originalPrice: 12999, stock: 45, description: "RGB mechanical gaming keyboard with magnetic tactile switches." },
      { name: "Nebula Smart Bulb Plus", category: "Appliances", price: 699, originalPrice: 1499, stock: 150, description: "16 million multi-color smart home lighting bulb." },
      { name: "Saffron Spices Combo Set", category: "Appliances", price: 2499, originalPrice: 3999, stock: 60, description: "Fresh farm selected premium organic spices collection." }
    ];

    try {
      const r = await fetch('/api/seller/bulk-upload', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ csvData: mockCsv })
      });
      const d = await r.json();
      if (d.success) {
        showToast(`Successfully uploaded ${d.uploadedProductsCount} fresh marketplace products instantly using CSV bulk protocol!`, 'success');
        fetchProducts();
      }
    } catch (e) {}
  };

  // Submit dynamic rating/review and QA
  const submitCustomerReview = async () => {
    if (!reviewText.trim()) return;
    try {
      const r = await fetch(`/api/products/${selectedProduct.id}/review`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ rating: reviewRating, comment: reviewText })
      });
      const d = await r.json();
      if (d.success) {
        setSelectedProduct(prev => ({ ...prev, reviews: d.reviews, rating: d.avgRating }));
        setReviewText('');
        // update main product catalogue
        fetchProducts();
      }
    } catch (e) {}
  };

  const submitCustomerQA = async () => {
    if (!qnaText.trim()) return;
    try {
      const r = await fetch(`/api/products/${selectedProduct.id}/qna`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ question: qnaText })
      });
      const d = await r.json();
      if (d.success) {
        setSelectedProduct(prev => ({ ...prev, qna: d.qna }));
        setQnaText('');
      }
    } catch (e) {}
  };

  // Estimate delivery
  const estimateDeliveryTimes = () => {
    if (!estimatingPincode || estimatingPincode.length < 6) {
      setDeliveryDaysText('Please enter a valid 6-digit PIN code.');
      return;
    }
    const zone = Number(estimatingPincode.charAt(0));
    let serviceDays = 4;
    let costType = 'Free standard shipping available!';
    if (zone === 4 || zone === 5) {
      serviceDays = 2;
      costType = 'Express logistics priority zone!';
    } else if (zone === 2 || zone === 1) {
      serviceDays = 1;
      costType = 'Same-day delivery active at ₹150 surcharge!';
    }
    setDeliveryDaysText(`Estimated Delivery: Within ${serviceDays} days. ${costType}`);
  };

  // Administrator tools
  const openAdminQueue = async () => {
    setView('admin-panel');
    try {
      const r = await fetch('/api/admin/pending');
      const d = await r.json();
      setAdminPending(d);
    } catch (e) {}
  };

  const processAdminApproval = async (targetUid: string, type: 'business' | 'seller', status: 'approved' | 'rejected') => {
    try {
      const r = await fetch('/api/admin/approve', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ targetUid, approvalType: type, status })
      });
      const d = await r.json();
      if (d.success) {
        showToast(`${type.toUpperCase()} request profile processed: ${status.toUpperCase()}!`, 'success');
        openAdminQueue();
        fetchSession();
      }
    } catch (e) {}
  };

  // Order return tracking
  const requestOrderReturn = async (orderId: string, reason: string) => {
    try {
      const r = await fetch(`/api/orders/${orderId}/return`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ reason, comment: 'Returning product due to standard vendor returns assurance program.' })
      });
      const d = await r.json();
      if (d.success) {
        showToast('Returns and reverse cargo processing initiated successfully. Refund details matched.', 'success');
        fetchOrders();
      }
    } catch (e) {}
  };

  // Checkout formulas
  const calculateCartSubtotal = () => {
    if (!user || !user.cart) return 0;
    return user.cart.reduce((sub: number, item: any) => {
      const p = products.find(prod => prod.id === item.productId);
      if (!p) return sub;

      let itemPrice = p.price;
      // Apply wholesale discounts on-the-fly for business tier!
      const isBusinessApproved = user.role === 'business' || (user.businessProfile && user.businessProfile.status === 'approved');
      if (isBusinessApproved && item.qty >= 5) {
        itemPrice = Math.round(p.price * 0.85); // 15% bulk off
      } else if (isBusinessApproved) {
        itemPrice = Math.round(p.price * 0.90); // 10% wholesale off
      }
      return sub + (itemPrice * item.qty);
    }, 0);
  };

  const calculateDiscount = () => {
    const sub = calculateCartSubtotal();
    if (!activeCoupon) return 0;
    if (activeCoupon.type === 'percent') {
      return Math.round((sub * activeCoupon.value) / 100);
    }
    return activeCoupon.value;
  };

  const calculateTax = () => {
    const sub = calculateCartSubtotal();
    const disc = calculateDiscount();
    return Math.round(Math.max(0, sub - disc) * 0.18);
  };

  const calculateShippingCharge = () => {
    if (selectedShipping === 'fast') return 150;
    if (selectedShipping === 'same_day') return 350;
    if (selectedShipping === 'scheduled') return 90;
    if (selectedShipping === 'express') return 250;
    return 0; // Free
  };

  const calculateTotal = () => {
    const sub = calculateCartSubtotal();
    const disc = calculateDiscount();
    const tax = calculateTax();
    const ship = calculateShippingCharge();
    return Math.max(0, sub - disc) + tax + ship;
  };

  const showInvoiceWindow = (orderId: string) => {
    window.open(`/api/invoices/${orderId}`, '_blank');
  };

  if (showLogin) {
    return (
      <div className="bg-[#020203] min-h-screen text-slate-100 flex flex-col items-center justify-center font-sans p-4 relative overflow-hidden" id="shopsphere-onboarding-portal">
        {/* Decorative background ambient elements */}
        <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] rounded-full bg-blue-600/10 blur-[130px] pointer-events-none"></div>
        <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] rounded-full bg-indigo-600/10 blur-[130px] pointer-events-none"></div>
        
        {/* Main portal window layout */}
        <div className="w-full max-w-4xl bg-slate-900/40 backdrop-blur-xl border border-white/10 rounded-3xl overflow-hidden shadow-2xl flex flex-col md:flex-row min-h-[600px] relative z-10">
          
          {/* Left branding banner */}
          <div className="md:w-[42%] bg-gradient-to-br from-blue-700 via-blue-600 to-indigo-800 p-8 md:p-12 flex flex-col justify-between relative overflow-hidden">
            <div className="absolute -right-16 -bottom-16 w-64 h-64 bg-white/5 rounded-full blur-2xl pointer-events-none"></div>
            
            <div className="relative z-10 space-y-6">
              <div className="bg-white/10 text-white p-3.5 rounded-2xl w-fit border border-white/20">
                <ShoppingBag className="w-8 h-8 text-white" />
              </div>
              <div className="space-y-2">
                <h2 className="text-3xl font-extrabold tracking-tight text-white uppercase" style={{ fontFamily: 'Georgia, serif' }}>
                  ShopSphere <br/><span className="text-blue-100 italic font-medium">India Hub</span>
                </h2>
                <div className="h-1 w-12 bg-white/40 rounded-full"></div>
              </div>
              <p className="text-xs text-blue-100/90 font-medium leading-relaxed">
                Connect directly with India's hybrid trade network. Transact at custom B2B volumes, inspect logistics live, and leverage real-time smart pricing algorithms.
              </p>
            </div>
            
            <div className="relative z-10 pt-8 border-t border-white/20 mt-8 md:mt-0">
              <div className="space-y-3.5 text-[11px] text-blue-100/80">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-300" />
                  <span>GST-enabled wholesale invoice generation</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-300" />
                  <span>Hybrid collaborative AI recommendations</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-300" />
                  <span>Dynamic multitenant simulation routes</span>
                </div>
              </div>
            </div>
          </div>
          
          {/* Right main portal: role configuration */}
          <div className="flex-1 p-8 md:p-12 flex flex-col justify-between bg-[#08090d]/95">
            <div>
              <div className="mb-6">
                <span className="text-blue-400 text-[9px] font-black uppercase tracking-widest block mb-1">Commerce Gateway</span>
                <h3 className="text-2xl font-bold tracking-tight text-white">Configure Market Identity</h3>
                <p className="text-xs text-slate-400 mt-1 font-medium leading-relaxed">Select your trading tier to customize pricing levels, listing dashboards, and express checkout routes.</p>
              </div>

              {loginError && (
                <div className="mb-5 p-3 rounded-xl bg-red-950/40 border border-red-500/30 text-red-300 text-xs font-semibold flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 shrink-0 text-red-400" />
                  <span>{loginError}</span>
                </div>
              )}

              <form onSubmit={handleRegisterSubmit} className="space-y-5">
                {/* 1. Name and Email */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[10px] font-extrabold text-slate-400 uppercase tracking-wider mb-1.5">Name / Organisation</label>
                    <input 
                      type="text"
                      required
                      placeholder="e.g. Saurabh Gupta"
                      value={loginName}
                      onChange={(e) => setLoginName(e.target.value)}
                      className="w-full bg-white/5 hover:bg-white/10 focus:bg-black text-xs text-white px-4 py-2.5 rounded-xl border border-white/10 focus:border-blue-500/50 outline-hidden transition-all"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-extrabold text-slate-400 uppercase tracking-wider mb-1.5">Email ID Address</label>
                    <input 
                      type="email"
                      required
                      placeholder="saurabhgupta1qz@gmail.com"
                      value={loginEmail}
                      onChange={(e) => setLoginEmail(e.target.value)}
                      className="w-full bg-white/5 hover:bg-white/10 focus:bg-black text-xs text-white px-4 py-2.5 rounded-xl border border-white/10 focus:border-blue-500/50 outline-hidden transition-all"
                    />
                  </div>
                </div>

                {/* 2. Account type choice selector */}
                <div>
                  <label className="block text-[10px] font-extrabold text-slate-400 uppercase tracking-wider mb-2.5">
                    Which are you? <span className="text-red-400">*</span>
                  </label>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    
                    {/* CUSTOMER TIER */}
                    <div 
                      id="opt-role-customer"
                      onClick={() => setLoginRole('customer')}
                      className={`cursor-pointer p-4 rounded-2xl border transition-all text-left flex flex-col justify-between min-h-[110px] ${
                        loginRole === 'customer' 
                          ? 'bg-blue-600/10 border-blue-500 shadow-lg shadow-blue-500/5' 
                          : 'bg-white/5 border-white/5 hover:border-white/15'
                      }`}
                    >
                      <div>
                        <div className="flex items-center justify-between">
                          <span className="text-lg">🙋‍♂️</span>
                          {loginRole === 'customer' && <span className="w-1.5 h-1.5 bg-blue-400 rounded-full"></span>}
                        </div>
                        <h4 className="text-xs font-bold text-white mt-2">Customer</h4>
                        <p className="text-[10px] text-slate-400 mt-1 leading-normal">
                          Retail buyer seeking general catalogs, fast courier, and reviews.
                        </p>
                      </div>
                    </div>

                    {/* WHOLESALER TIER */}
                    <div 
                      id="opt-role-wholesaler"
                      onClick={() => setLoginRole('wholesaler')}
                      className={`cursor-pointer p-4 rounded-2xl border transition-all text-left flex flex-col justify-between min-h-[110px] ${
                        loginRole === 'wholesaler' 
                          ? 'bg-emerald-600/10 border-emerald-500 shadow-lg shadow-emerald-500/5' 
                          : 'bg-white/5 border-white/5 hover:border-white/15'
                      }`}
                    >
                      <div>
                        <div className="flex items-center justify-between">
                          <span className="text-lg">🏢</span>
                          {loginRole === 'wholesaler' && <span className="w-1.5 h-1.5 bg-emerald-400 rounded-full"></span>}
                        </div>
                        <h4 className="text-xs font-bold text-white mt-2">Wholesaler</h4>
                        <p className="text-[10px] text-slate-400 mt-1 leading-normal">
                          B2B merchant looking for wholesale prices, bulk limits, & GST bills.
                        </p>
                      </div>
                    </div>

                    {/* BRAND SELLER TIER */}
                    <div 
                      id="opt-role-brandseller"
                      onClick={() => setLoginRole('brandseller')}
                      className={`cursor-pointer p-4 rounded-2xl border transition-all text-left flex flex-col justify-between min-h-[110px] ${
                        loginRole === 'brandseller' 
                          ? 'bg-indigo-600/10 border-indigo-500 shadow-lg shadow-indigo-500/5' 
                          : 'bg-white/5 border-white/5 hover:border-white/15'
                      }`}
                    >
                      <div>
                        <div className="flex items-center justify-between">
                          <span className="text-lg">👨‍💼</span>
                          {loginRole === 'brandseller' && <span className="w-1.5 h-1.5 bg-indigo-400 rounded-full"></span>}
                        </div>
                        <h4 className="text-xs font-bold text-white mt-2">Brand Seller</h4>
                        <p className="text-[10px] text-slate-400 mt-1 leading-normal">
                          Manufacturer listing goods, generating AI descriptions, and filling cargo.
                        </p>
                      </div>
                    </div>

                  </div>
                </div>

                {/* Submit */}
                <button
                  type="submit"
                  disabled={loginLoading}
                  className="w-full bg-blue-600 hover:bg-blue-500 disabled:bg-blue-800 text-white py-2.5 rounded-xl text-xs font-black tracking-wider uppercase transition-all shadow-lg shadow-blue-600/10 flex items-center justify-center gap-2 mt-2"
                >
                  {loginLoading ? 'Generating Identity Profile...' : 'Create Account & Enter'}
                  <ArrowRight className="w-4 h-4" />
                </button>
              </form>
            </div>

            {/* Sandbox quick access presets */}
            <div className="border-t border-white/5 pt-5 mt-6">
              <span className="block text-[9px] font-black uppercase text-slate-500 tracking-widest mb-2.5">Or log in instantly with a sandbox demo card</span>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                
                <button
                  onClick={async () => {
                    setLoginLoading(true);
                    try {
                      await switchUserSession('user_customer');
                      sessionStorage.setItem('shopsphere_logged_in', 'true');
                      setShowLogin(false);
                      showToast('Logged in successfully as Customer: Saurabh Gupta', 'success');
                    } catch (e) {
                      setLoginError('Error switching session');
                    } finally {
                      setLoginLoading(false);
                    }
                  }}
                  className="bg-white/5 text-left p-2.5 rounded-xl border border-white/5 hover:border-blue-500/30 hover:bg-white/10 transition-all flex items-center gap-2 group"
                >
                  <span className="text-base shrink-0">🙋‍♂️</span>
                  <div className="min-w-0">
                    <h5 className="text-[10px] font-bold text-white truncate group-hover:text-blue-400">Saurabh Gupta</h5>
                    <p className="text-[8px] text-blue-400 font-extrabold uppercase tracking-wide">Customer</p>
                  </div>
                </button>

                <button
                  onClick={async () => {
                    setLoginLoading(true);
                    try {
                      await switchUserSession('user_business_owner');
                      sessionStorage.setItem('shopsphere_logged_in', 'true');
                      setShowLogin(false);
                      showToast('Logged in successfully as Wholesaler B2B bulk buyer', 'success');
                    } catch (e) {
                      setLoginError('Error switching session');
                    } finally {
                      setLoginLoading(false);
                    }
                  }}
                  className="bg-white/5 text-left p-2.5 rounded-xl border border-white/5 hover:border-emerald-500/30 hover:bg-white/10 transition-all flex items-center gap-2 group"
                >
                  <span className="text-base shrink-0">🏢</span>
                  <div className="min-w-0">
                    <h5 className="text-[10px] font-bold text-white truncate group-hover:text-emerald-400">Gupta Wholesale</h5>
                    <p className="text-[8px] text-emerald-400 font-extrabold uppercase tracking-wide">Wholesaler</p>
                  </div>
                </button>

                <button
                  onClick={async () => {
                    setLoginLoading(true);
                    try {
                      await switchUserSession('user_seller_pro');
                      sessionStorage.setItem('shopsphere_logged_in', 'true');
                      setShowLogin(false);
                      showToast('Logged in successfully as Brand Seller: AeroTech', 'success');
                    } catch (e) {
                      setLoginError('Error switching session');
                    } finally {
                      setLoginLoading(false);
                    }
                  }}
                  className="bg-white/5 text-left p-2.5 rounded-xl border border-white/5 hover:border-indigo-500/30 hover:bg-white/10 transition-all flex items-center gap-2 group"
                >
                  <span className="text-base shrink-0">👨‍💼</span>
                  <div className="min-w-0">
                    <h5 className="text-[10px] font-bold text-white truncate group-hover:text-indigo-400">AeroTech official</h5>
                    <p className="text-[8px] text-indigo-400 font-extrabold uppercase tracking-wide">Brand Seller</p>
                  </div>
                </button>

              </div>
            </div>

          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-[#050505] min-h-screen text-slate-100 flex flex-col font-sans selection:bg-blue-600 selection:text-white" id="shopsphere-main-layout">
      
      {/* 🔔 CUSTOM NOTIFICATION TOAST (NON-BLOCKING SANDBOX ALERT IN IFRAME) */}
      {toast && (
        <div id="custom-app-toast" className="fixed top-16 right-5 z-[9999] max-w-sm w-full bg-slate-900/95 backdrop-blur-md border border-blue-500/30 p-4 rounded-2xl shadow-xl flex items-start gap-3 animate-fade-in transition-all">
          <div className={`p-2 rounded-lg ${toast.type === 'error' ? 'bg-red-500/20 text-red-400 border border-red-500/30' : toast.type === 'info' ? 'bg-blue-500/20 text-blue-400 border border-blue-500/20' : 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'}`}>
            {toast.type === 'error' ? <AlertTriangle className="w-4 h-4" /> : toast.type === 'info' ? <HelpCircle className="w-4 h-4" /> : <CheckCircle2 className="w-4 h-4" />}
          </div>
          <div className="flex-1">
            <h4 className="text-xs font-extrabold text-white uppercase tracking-wider">{toast.type === 'error' ? 'Alert' : toast.type === 'info' ? 'Update' : 'Success'}</h4>
            <p className="text-[11px] text-slate-200 mt-1 font-semibold leading-relaxed">{toast.message}</p>
          </div>
          <button onClick={() => setToast(null)} className="text-slate-400 hover:text-white text-base font-bold px-1 rounded hover:bg-white/5 transition-all">×</button>
        </div>
      )}

      {/* 🏷️ PRIMARY HEADER */}
      <header className="bg-black/60 backdrop-blur-md sticky top-0 z-40 border-b border-white/10 shadow-lg" id="app-header">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3.5 flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center justify-between w-full md:w-auto">
            <div 
              onClick={() => setView('home')} 
              className="flex items-center gap-2 cursor-pointer group"
              id="brand-logo-id"
            >
              <div className="bg-blue-600 text-white p-2 rounded-xl group-hover:bg-blue-700 transition-colors">
                <ShoppingBag className="w-6 h-6" />
              </div>
              <div>
                <span className="text-xl font-extrabold tracking-tighter text-white uppercase italic block" style={{ fontFamily: 'Georgia, serif' }}>
                  ShopSphere
                </span>
                <span className="text-[10px] font-bold tracking-wider block text-slate-400 uppercase">India Commercial</span>
              </div>
            </div>

            {/* Cart Widget Trigger for Small Devices */}
            <div className="md:hidden flex items-center gap-2">
              <button onClick={() => setView('cart')} className="relative p-2 text-slate-200 bg-white/5 rounded-full border border-white/10 hover:bg-white/10">
                <ShoppingBag className="w-5 h-5" />
                <span className="absolute -top-1 -right-1 bg-blue-600 text-white rounded-full text-[10px] px-1.5 font-bold min-w-4 h-4 flex items-center justify-center">
                  {getCartItemsCount()}
                </span>
              </button>
            </div>
          </div>

          {/* Core Multi-purpose Search Panel */}
          <div className="w-full md:max-w-xl relative flex items-center" id="search-bar-wrap">
            <div className="absolute left-3.5 text-slate-400 pointer-events-none">
              <Search className="w-4.5 h-4.5" />
            </div>
            <input
              type="text"
              id="search-input-field"
              placeholder='Try typing "earbuds", "smartwatch", "projector", or "breathable"...'
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-24 py-2 bg-white/5 hover:bg-white/10 focus:bg-black/45 text-sm rounded-full border border-white/10 focus:border-blue-500/50 focus:ring-2 focus:ring-blue-950 transition-all outline-hidden text-white"
            />
            {searchQuery && (
              <button 
                onClick={() => setSearchQuery('')} 
                className="absolute right-22 text-xs font-bold text-slate-400 hover:text-white px-1.5"
              >
                Clear
              </button>
            )}
            <span className="absolute right-3.5 bg-white/5 text-slate-300 border border-white/10 text-[10px] px-1.5 py-0.5 rounded-md font-mono pointer-events-none shadow-2xs">
              AI Powered
            </span>
          </div>

          {/* Action Links */}
          <div className="hidden md:flex items-center gap-4 text-sm" id="desktop-actions">
            <button
              id="btn-onboarding-switch-role"
              onClick={() => {
                sessionStorage.removeItem('shopsphere_logged_in');
                setShowLogin(true);
                showToast('Returned to active onboarding identity gateway.', 'info');
              }}
              className="flex items-center gap-1.5 font-bold py-1.5 px-3 rounded-lg text-[12px] uppercase tracking-wide text-slate-300 hover:text-white hover:bg-white/5 transition-all border border-white/5 bg-white/5"
            >
              <User className="w-3.5 h-3.5 text-blue-400" /> Switch Role / Log Out
            </button>

            <button 
              id="btn-goto-order-history"
              onClick={() => { setView('orders'); fetchOrders(); }} 
              className={`flex items-center gap-1.5 font-semibold py-2 px-3 rounded-lg transition-colors ${view === 'orders' ? 'text-blue-400 bg-blue-950/40 border border-blue-500/30' : 'text-slate-300 hover:text-white hover:bg-white/5'}`}
            >
              <History className="w-4 h-4" /> Orders
            </button>

            {/* Dynamic Button dependent on Seller verification status */}
            {user?.role === 'seller' ? (
              <button 
                id="btn-goto-seller-dashboard"
                onClick={() => setView('seller-dash')} 
                className={`flex items-center gap-1 text-sm font-semibold bg-indigo-950/40 border border-indigo-500/30 text-indigo-400 px-3 py-1.5 rounded-lg hover:bg-indigo-900/40 transition-colors ${view === 'seller-dash' ? 'bg-indigo-600 text-white' : ''}`}
              >
                <Layers className="w-4 h-4" /> Multi-Vendor Dashboard
              </button>
            ) : user?.role === 'business' ? (
              <div className="flex items-center gap-1 text-xs bg-emerald-950/40 border border-emerald-500/30 text-emerald-400 px-3 py-1.5 rounded-lg">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                <span className="font-bold uppercase tracking-wide">Approved Wholesaler</span>
              </div>
            ) : (
              <button 
                id="btn-goto-onboarding"
                onClick={() => { setView('verification'); setVerificationFeedback(''); }} 
                className="text-xs font-bold text-blue-400 hover:text-blue-300 bg-blue-950/20 hover:bg-blue-950/40 border border-blue-500/20 px-3 py-1.5 rounded-lg transition-all"
              >
                Onboard / Verify Profile
              </button>
            )}

            <button 
              id="header-cart-icon-btn"
              onClick={() => setView('cart')} 
              className="relative p-2.5 bg-white/5 hover:bg-blue-950/40 text-slate-300 hover:text-blue-400 rounded-full transition-all border border-white/10 shadow-2xs"
            >
              <ShoppingBag className="w-5 h-5 pointer-events-none" />
              <span className="absolute -top-1 -right-1 bg-blue-600 text-white rounded-full text-[10px] px-1.5 py-0.5 font-bold min-w-4 h-4 flex items-center justify-center shadow-xs">
                {getCartItemsCount()}
              </span>
            </button>
          </div>
        </div>

        {/* Categories strip */}
        <div className="bg-black/20 border-t border-b border-white/10 overflow-x-auto" id="categories-tabs-strip">
          <div className="max-w-7xl mx-auto px-4 flex gap-1 py-1">
            {['All', 'Mobiles', 'Laptops', 'Electronics', 'Appliances', 'Fashion', 'Home & Living', 'Beauty', 'Books', 'Grocery'].map((cat) => (
              <button
                key={cat}
                onClick={() => { setSelectedCategory(cat); setView('home'); }}
                className={`px-4 py-1.5 text-xs font-bold whitespace-nowrap transition-all ${
                  selectedCategory === cat 
                    ? 'text-blue-400 border-b border-blue-400 pb-1 rounded-none bg-transparent' 
                    : 'text-slate-400 hover:text-white bg-transparent hover:bg-white/5'
                }`}
              >
                {cat}
              </button>
            ))}
            <div className="ml-auto flex items-center gap-2 text-slate-400 font-bold text-[11px] uppercase tracking-wide pr-3">
              <BadgePercent className="w-4.5 h-4.5 text-blue-400" /> Use Code <span className="text-blue-400 font-mono">SHOP10</span> for 10% Off
            </div>
          </div>
        </div>
      </header>

      {/* 🖼️ CORE VIEW CONTEXTS */}
      <main className="flex-1 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">

        {/* ===================== HOME VIEW ===================== */}
        {view === 'home' && (
          <div className="space-y-8" id="home-view-container">
            {/* Promo Hero Banner */}
            <div className="relative overflow-hidden bg-black border border-white/10 rounded-3xl p-6 md:p-10 text-white shadow-lg" id="promo-banner-slide">
              <div className="relative z-10 max-w-lg space-y-4">
                <span className="inline-flex items-center gap-1 bg-blue-600/20 text-blue-400 border border-blue-500/20 text-[10px] px-3 py-1 rounded-full font-bold uppercase tracking-widest">
                  <Sparkle className="w-3.5 h-3.5 text-blue-400 animate-pulse" /> AI recommendations active
                </span>
                <h1 className="text-3xl md:text-5xl font-light leading-none" style={{ fontFamily: 'Georgia, serif' }}>
                  ShopSphere <br/><span className="italic font-normal text-blue-400">Commercial Hub</span>
                </h1>
                <p className="text-sm md:text-base text-slate-300 leading-relaxed">
                  Discover curated Indian multi-vendor catalogs with AI pricing diagnostics, real B2B wholesale clearances, and 1-day express shipping routes.
                </p>
                <div className="flex gap-3 pt-2">
                  <button 
                    onClick={() => { setSelectedCategory('All'); setSearchQuery(''); }}
                    className="bg-white text-black hover:bg-slate-200 px-5 py-2 rounded-xl font-bold text-sm shadow transition-all hover:-translate-y-0.5"
                  >
                    Browse Live Catalog
                  </button>
                  {user?.role !== 'business' && user?.role !== 'seller' && (
                    <button 
                      onClick={() => setView('verification')}
                      className="bg-blue-600/20 hover:bg-blue-600/30 border border-blue-500/30 text-blue-400 px-5 py-2 rounded-xl font-bold text-sm shadow transition-all"
                    >
                      Verify Wholesale GST
                    </button>
                  )}
                </div>
              </div>
              <div className="absolute right-0 bottom-0 top-0 opacity-15 md:opacity-30 pointer-events-none">
                <img 
                  src="https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=800" 
                  alt="Background layout" 
                  className="w-full h-full object-cover"
                />
              </div>
            </div>

            {/* Simulated Banner Alerts according to active Mode */}
            {user?.role === 'business' && (
              <div className="bg-emerald-950/20 border border-emerald-500/30 p-4 rounded-2xl flex flex-wrap gap-4 items-center justify-between shadow-xs">
                <div className="flex items-center gap-3">
                  <div className="bg-emerald-600/20 text-emerald-400 border border-emerald-500/20 p-2.5 rounded-xl">
                    <Sparkles className="w-5 h-5 text-emerald-400" />
                  </div>
                  <div>
                    <h3 className="font-bold text-emerald-400 text-sm">Enterprise Wholesale Mode Enabled</h3>
                    <p className="text-xs text-emerald-300/80">GST Registration verified. Special bulk tier discounts (Flat 10% off and 15% off for items of quantity 5+) applied on catalog.</p>
                  </div>
                </div>
                <div className="flex gap-2">
                  <span className="text-xs bg-emerald-600/20 text-emerald-400 border border-emerald-500/30 px-3 py-1 rounded-full font-extrabold uppercase">15% Bulk Tier OK</span>
                </div>
              </div>
            )}

            {/* PERSONALIZED AI SUGGESTIONS SECTION */}
            {personalizedRecs.length > 0 && (
              <div className="bg-white/5 border border-white/10 p-6 rounded-3xl" id="personalized-recs-shelf">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <div className="bg-blue-600/20 text-blue-400 border border-blue-500/20 p-1.5 rounded-lg shadow-sm">
                      <Sparkles className="w-4 h-4 text-blue-400 animate-pulse" />
                    </div>
                    <div>
                      <h2 className="text-lg font-extrabold text-white tracking-tight">Personalized Suggestions For You</h2>
                      <p className="text-xs text-blue-400/80 font-medium">Derived through collaborative user behavior filtering algorithms</p>
                    </div>
                  </div>
                  <span className="text-[10px] bg-indigo-950/40 text-indigo-400 border border-indigo-500/30 font-extrabold px-2 py-0.5 rounded-full uppercase tracking-wider">AI Synced</span>
                </div>
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                  {personalizedRecs.map((prod) => (
                    <div 
                      key={`personal-${prod.id}`}
                      onClick={() => selectProductDetails(prod)}
                      className="bg-white/5 border border-white/10 p-3 rounded-2xl cursor-pointer hover:bg-white/10 hover:border-blue-500/30 transition-all flex flex-col group relative"
                    >
                      <div className="aspect-video w-full rounded-xl overflow-hidden bg-black/45 relative">
                        <img src={prod.images[0]} alt={prod.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform" />
                        <span className="absolute bottom-2 left-2 bg-black/80 text-white text-[9px] px-1.5 py-0.5 rounded-md font-mono">₹{prod.price}</span>
                      </div>
                      <div className="mt-2.5 flex-1">
                        <h4 className="text-xs font-extrabold line-clamp-1 text-white group-hover:text-blue-400">{prod.name}</h4>
                        <p className="text-[10px] text-blue-400/90 font-medium">{prod.brand} • {prod.category}</p>
                      </div>
                      <div className="absolute right-2.5 bottom-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <ArrowRight className="w-4.5 h-4.5 text-blue-400" />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* STANDARD GRID PRODUCTS CATALOGUE */}
            <div className="space-y-5" id="products-catalog-context">
              <div className="flex flex-col sm:flex-row items-center justify-between gap-3 border-b border-white/10 pb-3">
                <div>
                  <h2 className="text-xl font-black text-white flex items-center gap-1.5 tracking-tight">
                    <ShoppingBag className="w-5.5 h-5.5 text-blue-400 animate-bounce" /> Explore Fresh Multi-Vendor Index
                  </h2>
                  <p className="text-xs text-slate-400 font-medium">Showing {products.length} live item listings in ShopSphere India hub</p>
                </div>
                <div className="flex gap-2 text-xs font-bold text-slate-300 bg-white/5 px-3 py-1.5 rounded-xl border border-white/10">
                  <span>Simulated Catalog Filters Enabled</span>
                </div>
              </div>

              {products.length === 0 ? (
                <div className="p-12 text-center bg-white/5 border border-white/10 rounded-3xl space-y-3">
                  <div className="bg-blue-950/40 text-blue-400 border border-blue-500/20 w-12 h-12 rounded-full flex items-center justify-center mx-auto">
                    <AlertTriangle className="w-6 h-6" />
                  </div>
                  <h3 className="font-extrabold text-white text-base">No matching products found</h3>
                  <p className="text-xs text-slate-400 max-w-sm mx-auto">Try refining your search keyword prefix or resetting category filters to list other wholesale electronic items.</p>
                  <button 
                    onClick={() => { setSelectedCategory('All'); setSearchQuery(''); }}
                    className="text-xs bg-blue-600 hover:bg-blue-700 text-white font-bold px-4 py-2 rounded-xl transition"
                  >
                    Reset Filters
                  </button>
                </div>
              ) : (
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                  {products.map((p) => {
                    // Check if they are already wishlisted
                    const isWish = user?.wishlist?.includes(p.id) || false;
                    return (
                      <div 
                        key={p.id}
                        id={`product-tile-${p.id}`}
                        className="bg-white/5 border border-white/10 rounded-2xl overflow-hidden hover:bg-white/10 hover:border-white/20 hover:-translate-y-1 transition-all duration-300 flex flex-col group relative"
                      >
                        {/* Wishlist toggle button overlay */}
                        <button 
                          onClick={(e) => { e.stopPropagation(); toggleWishlist(p.id); }}
                          className={`absolute top-2.5 right-2.5 p-1.5 rounded-full z-10 shadow-2xs transition-colors ${isWish ? 'bg-black/60 text-yellow-400' : 'bg-black/40 text-slate-400 hover:text-yellow-400 hover:bg-black/60'}`}
                        >
                          <Star className={`w-4.5 h-4.5 ${isWish ? 'fill-current' : ''}`} />
                        </button>

                        <div 
                          className="aspect-square bg-black/40 overflow-hidden cursor-pointer relative"
                          onClick={() => selectProductDetails(p)}
                        >
                          <img src={p.images[0]} alt={p.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                          
                          {/* Flash discount pill */}
                          {p.discount > 0 && (
                            <span className="absolute bottom-2 left-2 bg-blue-600 text-white text-[10px] font-extrabold px-2 py-0.5 rounded-md">
                              {p.discount}% OFF
                            </span>
                          )}
                        </div>

                        <div className="p-4 flex-1 flex flex-col justify-between">
                          <div className="space-y-1" onClick={() => selectProductDetails(p)}>
                            <div className="flex items-center gap-1.5 text-[10px] text-slate-400 font-bold uppercase tracking-wider">
                              <span>{p.brand}</span>
                              <span className="w-1 h-1 bg-white/20 rounded-full"></span>
                              <span>{p.category}</span>
                            </div>
                            <h3 className="font-extrabold text-sm text-white line-clamp-2 leading-snug group-hover:text-blue-400 cursor-pointer">
                              {p.name}
                            </h3>
                            <div className="flex items-center gap-1">
                              <div className="flex text-amber-400">
                                <Star className="w-3.5 h-3.5 fill-current" />
                              </div>
                              <span className="text-xs font-extrabold text-slate-200">{p.rating}</span>
                              <span className="text-[10px] text-slate-400">({p.reviews?.length || 0})</span>
                            </div>
                          </div>

                          <div className="mt-3.5 flex items-center justify-between border-t border-white/5 pt-3">
                            <div>
                              <div className="flex items-center gap-2">
                                <span className="text-base font-extrabold text-white">₹{p.price}</span>
                                {p.originalPrice && p.originalPrice > p.price && (
                                  <span className="text-xs line-through text-slate-500">₹{p.originalPrice}</span>
                                )}
                              </div>
                              {/* Wholesaler Bulk Alert Helper tag */}
                              {user?.role === 'business' && (
                                <span className="text-[9px] text-emerald-400 font-extrabold tracking-wide uppercase bg-emerald-950/40 border border-emerald-500/30 px-1 py-0.5 rounded block mt-0.5">
                                  B2B Discount OK
                                </span>
                              )}
                            </div>

                            <button
                              id={`add-cart-btn-${p.id}`}
                              onClick={() => { updateCartQty(p.id, 1, 'add'); }}
                              className="bg-blue-600 hover:bg-blue-700 text-white p-2 rounded-xl text-xs font-bold transition-all shadow-xs flex items-center justify-center gap-1.5 active:scale-95"
                            >
                              Add <Plus className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        )}


        {/* ===================== PRODUCT DETAIL VIEW ===================== */}
        {view === 'product' && selectedProduct && (
          <div className="space-y-8" id="product-page-detail-layout">
            <button 
              onClick={() => setView('home')}
              className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-300 hover:text-white bg-white/5 border border-white/10 px-3 py-1.5 rounded-lg transition"
            >
              <ArrowLeft className="w-4 h-4" /> Back to Live Catalog
            </button>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
              {/* Product Images + Video Section (Left) */}
              <div className="lg:col-span-5 space-y-4">
                <div className="aspect-square bg-white border border-slate-100 rounded-3xl overflow-hidden relative shadow-sm">
                  <img src={selectedProduct.images[0]} alt={selectedProduct.name} className="w-full h-full object-cover" />
                  <span className="absolute bottom-4 right-4 bg-black/70 text-white text-[10px] px-3 py-1 rounded-full font-mono font-bold tracking-wider uppercase shadow">
                    Interactive 360° View Simulated
                  </span>
                </div>

                {/* 360 Video Embed simulator if exists */}
                {selectedProduct.videoUrl ? (
                  <div className="bg-slate-900 p-4 rounded-3xl text-white space-y-2">
                    <div className="flex items-center justify-between text-xs font-bold text-rose-400">
                      <span>🎥 Walkthrough Commercial Available</span>
                      <span className="bg-rose-600/30 text-rose-300 text-[10px] uppercase font-bold px-2 py-0.5 rounded-full">Simulated</span>
                    </div>
                    <video 
                      src={selectedProduct.videoUrl} 
                      controls 
                      muted 
                      className="w-full h-40 rounded-xl bg-black"
                    />
                  </div>
                ) : (
                  <div className="bg-slate-100 p-4 rounded-3xl border border-dashed border-slate-300 flex items-center gap-3 text-slate-500">
                    <Sparkles className="w-6 h-6 text-indigo-500 animate-spin" />
                    <div>
                      <div className="text-xs font-extrabold text-slate-800">3D Interactive Video Loader Active</div>
                      <p className="text-[10px] text-slate-500">ShopSphere India dynamic multi-source viewport is operational for this product.</p>
                    </div>
                  </div>
                )}
              </div>

              {/* Product Configurations Panel (Right) */}
              <div className="lg:col-span-7 space-y-6 bg-[#0a0a0a] p-6 md:p-8 rounded-3xl border border-white/10 shadow-2xs">
                <div>
                  <div className="flex items-center gap-2 mb-2 text-xs font-bold text-blue-400 uppercase tracking-wider">
                    <span>{selectedProduct.brand} Brand Store</span>
                    <span className="w-1.5 h-1.5 bg-white/20 rounded-full"></span>
                    <span>Verified Vendor</span>
                  </div>
                  <h1 className="text-2xl md:text-3xl font-black text-white tracking-tight leading-tight">
                    {selectedProduct.name}
                  </h1>
                </div>

                {/* Star Ratings + reviews trigger */}
                <div className="flex items-center gap-4 border-y border-white/5 py-3">
                  <div className="flex items-center gap-1.5">
                    <div className="flex text-amber-500">
                      <Star className="w-4.5 h-4.5 fill-current" />
                    </div>
                    <span className="text-sm font-extrabold text-slate-200">{selectedProduct.rating} Stars Rating</span>
                  </div>
                  <span className="text-white/20">|</span>
                  <button onClick={() => setProductTab('reviews')} className="text-xs font-extrabold text-blue-400 hover:underline">
                    Read Verified Customer Feedback ({selectedProduct.reviews?.length || 0})
                  </button>
                </div>

                {/* Price block */}
                <div className="space-y-1">
                  <div className="flex items-baseline gap-3">
                    <span className="text-3xl font-black text-blue-400">₹{selectedProduct.price}</span>
                    {selectedProduct.originalPrice > selectedProduct.price && (
                      <span className="text-sm line-through text-slate-500">₹{selectedProduct.originalPrice}</span>
                    )}
                    {selectedProduct.discount > 0 && (
                      <span className="text-xs font-extrabold bg-blue-950/40 text-blue-400 border border-blue-500/30 px-2 py-0.5 rounded-md">
                        Save {selectedProduct.discount}% Off Instantly
                      </span>
                    )}
                  </div>
                  <p className="text-[10px] text-slate-400 font-semibold uppercase">Inclusive of all calculated central & state CGST/SGST taxes</p>
                </div>

                {/* Live Estimator delivery pin code */}
                <div className="bg-white/5 p-4 rounded-2xl border border-white/10 space-y-3">
                  <div className="text-xs font-extrabold text-slate-200 flex items-center gap-1">
                    <Truck className="w-4 h-4 text-blue-400" /> Dynamic Logistics Shipping Estimation
                  </div>
                  <div className="flex gap-2">
                    <input 
                      type="text" 
                      placeholder="Enter 6-Digit delivery PIN Code" 
                      maxLength={6}
                      value={estimatingPincode}
                      onChange={(e) => setEstimatingPincode(e.target.value)}
                      className="bg-black/45 border border-white/10 px-3 py-1.5 rounded-xl text-xs font-semibold outline-hidden focus:border-blue-500 w-48 text-white focus:ring-1 focus:ring-blue-500/50"
                    />
                    <button 
                      onClick={estimateDeliveryTimes}
                      className="bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold px-4 py-1.5 rounded-xl transition"
                    >
                      Estimate
                    </button>
                  </div>
                  {deliveryDaysText && (
                    <p className="text-xs font-bold text-indigo-300 bg-indigo-950/40 border border-indigo-500/30 p-2 rounded-xl">
                      {deliveryDaysText}
                    </p>
                  )}
                </div>

                {/* Checkout adding widget */}
                <div className="flex flex-wrap gap-4 pt-4 border-t border-white/5">
                  <button
                    id="product-page-add-cart-btn"
                    onClick={() => { updateCartQty(selectedProduct.id, 1, 'add'); showToast('Product added to active Cart successfully!', 'success'); }}
                    className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-3 px-6 rounded-2xl font-black text-sm tracking-wide shadow-md transition-all active:scale-98 flex items-center justify-center gap-2"
                  >
                    <ShoppingBag className="w-5 h-5" /> Add Product to active Bag
                  </button>

                  <button 
                    onClick={() => toggleWishlist(selectedProduct.id)}
                    className="p-3 bg-white/5 hover:bg-white/10 text-amber-400 border border-white/10 rounded-2xl transition"
                  >
                    <Star className="w-5 h-5 fill-current" />
                  </button>
                </div>
              </div>
            </div>

            {/* TABBED DETAILS & AI REVIEW SUMMARIZATION SHELF */}
            <div className="bg-[#0a0a0a] border border-white/10 p-6 md:p-8 rounded-3xl shadow-2xs space-y-5" id="product-narratives-tabs">
              <div className="flex border-b border-white/10 gap-1 overflow-x-auto pb-1">
                {(['desc', 'specs', 'reviews', 'qna'] as const).map((tab) => (
                  <button
                    key={tab}
                    onClick={() => setProductTab(tab)}
                    className={`px-5 py-2.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${productTab === tab ? 'bg-blue-600 text-white shadow-xs' : 'text-slate-400 hover:text-white hover:bg-white/5'}`}
                  >
                    {tab === 'desc' ? 'Overview Narrative' : tab === 'specs' ? 'Specifications Schema' : tab === 'reviews' ? 'User Reviews' : 'Patron Q&A'}
                  </button>
                ))}
              </div>

              {/* Tab Contents: Narrative */}
              {productTab === 'desc' && (
                <div className="space-y-4 text-slate-300 text-sm leading-relaxed" id="narratives-tab-content">
                  <p>{selectedProduct.description}</p>
                  <p>Designed and verified under stringent multi-attribute standards by the certified brand merchant <strong className="text-white">{selectedProduct.brand}</strong>. Safe returns policy applicable.</p>
                </div>
              )}

              {/* Tab Contents: Specs */}
              {productTab === 'specs' && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4" id="specs-tab-content">
                  {Object.entries(selectedProduct.specifications || {}).map(([k, v]: [string, any]) => (
                    <div key={k} className="flex justify-between p-3 border-b border-white/5 text-xs font-semibold font-mono">
                      <span className="text-slate-400 capitalize">{k}</span>
                      <span className="text-slate-200 text-right">{v}</span>
                    </div>
                  ))}
                </div>
              )}

              {/* Tab Contents: Reviews (with AI Integration) */}
              {productTab === 'reviews' && (
                <div className="space-y-6" id="reviews-tab-content">
                  
                  {/* AI SUMMARIZATION TRIGGERS */}
                  <div className="bg-blue-950/20 border border-blue-500/20 p-4 rounded-2xl space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Sparkles className="w-5 h-5 text-blue-400 animate-pulse" />
                        <h4 className="font-extrabold text-xs text-blue-200/95">AI Customer Reviews Summarizer</h4>
                      </div>
                      <button 
                        onClick={() => getAiReviewSummary(selectedProduct.id)}
                        disabled={isSummarizing}
                        className="bg-blue-600 hover:bg-blue-700 text-white text-[10px] font-black uppercase px-3 py-1.5 rounded-xl transition shadow-xs disabled:opacity-50"
                      >
                        {isSummarizing ? 'Analyzing comments...' : 'Generate AI Summary'}
                      </button>
                    </div>
                    {aiSummaries[selectedProduct.id] ? (
                      <p className="text-xs text-slate-200 font-medium leading-relaxed bg-white/5 border border-white/10 p-3.5 rounded-xl shadow-2xs">
                        {aiSummaries[selectedProduct.id]}
                      </p>
                    ) : (
                      <p className="text-[11px] text-slate-400">Generate a balanced single-paragraph summary of thousands of verified customer reviews instantly using Gemini.</p>
                    )}
                  </div>

                  {/* List verified customer reviews */}
                  <div className="space-y-4">
                    {selectedProduct.reviews?.map((r: any) => (
                      <div key={r.id} className="bg-white/5 p-4 rounded-2xl border border-white/10 flex flex-col md:flex-row gap-3">
                        <div className="flex items-center gap-2 md:w-48 shrink-0">
                          <div className="bg-white/10 text-slate-300 w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs uppercase">
                            {r.user.charAt(0)}
                          </div>
                          <div>
                            <div className="text-xs font-bold text-slate-200">{r.user}</div>
                            <div className="text-[9px] text-slate-500 font-mono">{r.date}</div>
                          </div>
                        </div>
                        <div className="flex-1 space-y-1">
                          <div className="flex text-amber-450">
                            {[...Array(r.rating)].map((_, i) => (
                              <Star key={i} className="w-3.5 h-3.5 fill-current text-amber-400" />
                            ))}
                          </div>
                          <p className="text-xs font-medium text-slate-300">{r.comment}</p>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Leave review submission drawer */}
                  <div className="bg-white/5 p-4 rounded-2xl border border-white/10 space-y-3">
                    <h4 className="font-extrabold text-xs text-white">Submit Verified Client Review</h4>
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-slate-400">Pick Rating:</span>
                        <div className="flex text-amber-400">
                          {[1,2,3,4,5].map(n => (
                            <Star 
                              key={n} 
                              onClick={() => setReviewRating(n)} 
                              className={`w-5 h-5 cursor-pointer fill-current ${reviewRating >= n ? 'text-amber-500' : 'text-slate-600'}`} 
                            />
                          ))}
                        </div>
                      </div>
                      <textarea 
                        rows={2} 
                        placeholder="Write details on ergonomics, package quality, and delivery speed..." 
                        value={reviewText}
                        onChange={(e) => setReviewText(e.target.value)}
                        className="w-full bg-black/45 border border-white/10 rounded-xl p-3 text-xs outline-hidden focus:border-blue-500 text-white animate-none"
                      />
                      <button 
                        onClick={submitCustomerReview}
                        className="bg-blue-600 hover:bg-blue-700 text-white text-xs font-black px-4 py-2 rounded-xl transition shadow"
                      >
                        Publish Verified Review
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {/* Tab Contents: Q&A */}
              {productTab === 'qna' && (
                <div className="space-y-6" id="qna-tab-content">
                  <div className="space-y-4">
                    {selectedProduct.qna?.map((item: any, i: number) => (
                      <div key={i} className="bg-white/5 p-4 rounded-2xl border border-white/10 space-y-1.5">
                        <div className="text-xs font-extrabold text-white flex items-center gap-1">
                          <HelpCircle className="w-4 h-4 text-blue-400" /> Question: {item.question}
                        </div>
                        <div className="text-xs text-slate-300 bg-black/45 border border-white/5 p-2.5 rounded-xl font-medium leading-relaxed">
                          <strong className="text-blue-400">Vendor Automated Support:</strong> {item.answer}
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="bg-white/5 p-4 rounded-2xl border border-white/10 space-y-2">
                    <h4 className="font-extrabold text-xs text-white">Submit a New Inquiry</h4>
                    <input 
                      type="text" 
                      placeholder="Ask technical sizing details or power supply configurations..." 
                      value={qnaText}
                      onChange={(e) => setQnaText(e.target.value)}
                      className="w-full bg-black/30 border border-white/10 p-2.5 rounded-xl text-xs outline-hidden focus:border-blue-500 text-white"
                    />
                    <button 
                      onClick={submitCustomerQA}
                      className="bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold px-4 py-2 rounded-xl shadow-xs"
                    >
                      Publish Question
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* HYBRID RECOMMENDATIONS EMBEDDED SYSTEM GRID */}
            <div className="space-y-6" id="hybrid-recommendations-panels">
              <div className="border-b border-white/10 pb-3">
                <h3 className="font-extrabold text-lg text-white tracking-tight flex items-center gap-1.5">
                  <Sparkles className="w-5 h-5 text-blue-400 animate-pulse" /> ShopSphere India Intelligent Recommendation Suite
                </h3>
                <p className="text-xs text-slate-400 font-medium">Real-time calculations combining Content Filters, User Clusters, and Flash Seasonal Interest indexes</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                
                {/* 1. Frequently Bought Together Bundle */}
                <div className="bg-white/5 border border-white/10 p-4 rounded-3xl space-y-4 hover:bg-white/10 transition-colors">
                  <h4 className="font-extrabold text-xs uppercase tracking-wider text-blue-400">Frequently Bought Together</h4>
                  <div className="space-y-3">
                    {recsPackage.frequentlyBought?.map((prod) => (
                      <div 
                        key={`bought-${prod.id}`}
                        onClick={() => selectProductDetails(prod)}
                        className="flex gap-3 hover:bg-white/5 p-2 rounded-xl cursor-pointer transition text-white"
                      >
                        <img src={prod.images[0]} alt={prod.name} className="w-12 h-12 rounded-lg object-cover bg-black/40" />
                        <div>
                          <h5 className="text-xs font-extrabold line-clamp-1">{prod.name}</h5>
                          <span className="text-xs font-extrabold text-blue-400">₹{prod.price}</span>
                        </div>
                      </div>
                    ))}
                    <button className="w-full bg-blue-600 hover:bg-blue-700 text-white text-[10px] font-black uppercase py-2 rounded-xl transition shadow">
                      Buy Unified Bundle Package 🛒
                    </button>
                  </div>
                </div>

                {/* 2. Similar Products (same category) */}
                <div className="bg-white/5 border border-white/10 p-4 rounded-3xl space-y-4 hover:bg-white/10 transition-colors">
                  <h4 className="font-extrabold text-xs uppercase tracking-wider text-indigo-400">Similar Catalog Items</h4>
                  <div className="space-y-3">
                    {recsPackage.similarProducts?.map((prod) => (
                      <div 
                        key={`similar-${prod.id}`}
                        onClick={() => selectProductDetails(prod)}
                        className="flex gap-3 hover:bg-white/5 p-2 rounded-xl cursor-pointer transition text-white"
                      >
                        <img src={prod.images[0]} alt={prod.name} className="w-12 h-12 rounded-lg object-cover bg-black/40" />
                        <div>
                          <h5 className="text-xs font-extrabold line-clamp-1">{prod.name}</h5>
                          <div className="flex items-center gap-1">
                            <span className="text-xs font-extrabold text-slate-200">₹{prod.price}</span>
                            <span className="text-[10px] font-bold text-slate-400">({prod.category})</span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* 3. Customers Also Viewed */}
                <div className="bg-white/5 border border-white/10 p-4 rounded-3xl space-y-4 hover:bg-white/10 transition-colors">
                  <h4 className="font-extrabold text-xs uppercase tracking-wider text-amber-500">Customers Also Viewed</h4>
                  <div className="space-y-3">
                    {recsPackage.customersAlsoViewed?.map((prod) => (
                      <div 
                        key={`viewed-${prod.id}`}
                        onClick={() => selectProductDetails(prod)}
                        className="flex gap-3 hover:bg-white/5 p-2 rounded-xl cursor-pointer transition text-white"
                      >
                        <img src={prod.images[0]} alt={prod.name} className="w-12 h-12 rounded-lg object-cover bg-black/40" />
                        <div>
                          <h5 className="text-xs font-extrabold line-clamp-1">{prod.name}</h5>
                          <span className="text-xs font-extrabold text-slate-200">₹{prod.price}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

              </div>
            </div>
          </div>
        )}


        {/* ===================== CART SCREEN ===================== */}
        {view === 'cart' && (
          <div className="space-y-6" id="cart-screen-layout">
            <h2 className="text-xl font-black text-white flex items-center gap-2">
              <ShoppingBag className="w-6 h-6 text-blue-400" /> Shopping Bag Checkout System
            </h2>

            {user?.cart?.length === 0 ? (
              <div className="bg-[#0a0a0a] rounded-3xl p-10 border border-white/10 text-center space-y-3">
                <p className="text-slate-400 font-medium">Your interactive ShopSphere basket is currently empty.</p>
                <button 
                  onClick={() => setView('home')}
                  className="bg-blue-600 text-white text-xs font-black px-5 py-2.5 rounded-xl transition inline-block hover:bg-blue-700"
                >
                  Return to Home Store
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                {/* Cart Items list (Left) */}
                <div className="lg:col-span-8 space-y-4">
                  {user?.cart?.map((item: any) => {
                    const p = products.find(prod => prod.id === item.productId);
                    if (!p) return null;

                    let itemDisplayPrice = p.price;
                    const isBusinessMode = user?.role === 'business' || (user?.businessProfile && user?.businessProfile?.status === 'approved');
                    
                    if (isBusinessMode && item.qty >= 5) {
                      itemDisplayPrice = Math.round(p.price * 0.85);
                    } else if (isBusinessMode) {
                      itemDisplayPrice = Math.round(p.price * 0.90);
                    }

                    return (
                      <div key={item.productId} className="bg-[#0a0a0a] border border-white/10 p-4 rounded-2xl flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-center">
                        <div className="flex gap-4">
                          <img src={p.images[0]} alt={p.name} className="w-16 h-16 rounded-xl object-cover bg-black/40" />
                          <div>
                            <h4 className="font-extrabold text-sm text-white">{p.name}</h4>
                            <p className="text-[10px] text-slate-400 font-bold uppercase">{p.brand} Store</p>
                            
                            {/* Wholesaler Custom Pricing Details */}
                            {isBusinessMode ? (
                              <div className="text-[9px] text-emerald-400 font-extrabold uppercase mt-1 bg-emerald-950/40 border border-emerald-500/20 px-2 py-0.5 rounded-md inline-block">
                                {item.qty >= 5 ? '15% Bulk Business Discount active' : '10% Standard Wholesale active'}
                              </div>
                            ) : null}
                          </div>
                        </div>

                        <div className="flex sm:flex-col items-end gap-3 justify-between w-full sm:w-auto border-t border-white/5 sm:border-0 pt-3 sm:pt-0">
                          <div className="text-base font-black text-blue-400">₹{itemDisplayPrice * item.qty}</div>
                          
                          <div className="flex items-center gap-2">
                            <span className="text-xs font-semibold text-slate-500">Qty:</span>
                            <div className="flex items-center border border-white/10 rounded-lg overflow-hidden h-7 bg-black/35">
                              <button 
                                onClick={() => updateCartQty(item.productId, -1, 'add')}
                                className="px-2 bg-white/5 hover:bg-white/10 text-xs text-white"
                              >
                                -
                              </button>
                              <span className="px-3 text-xs font-extrabold text-white">{item.qty}</span>
                              <button 
                                onClick={() => updateCartQty(item.productId, 1, 'add')}
                                className="px-2 bg-white/5 hover:bg-white/10 text-xs text-white"
                              >
                                +
                              </button>
                            </div>

                            <button 
                              onClick={() => updateCartQty(item.productId, 0, 'remove')}
                              className="p-1 text-slate-500 hover:text-red-500 transition-colors"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* Price Breakdown Summary (Right) */}
                <div className="lg:col-span-4 space-y-4">
                  <div className="bg-[#0a0a0a] border border-white/10 p-6 rounded-3xl shadow-sm space-y-4">
                    <h3 className="font-black text-sm text-blue-400 uppercase border-b border-white/5 pb-2 flex items-center gap-1.5">
                      <Sparkles className="w-4 h-4 text-blue-400" /> Final Pricing Summary
                    </h3>

                    {/* Coupons support widget */}
                    <div className="pb-3 border-b border-white/5 space-y-2">
                      <label className="text-xs font-extrabold text-slate-400 block">Apply India Business Coupon</label>
                      <div className="flex gap-2">
                        <input 
                          type="text" 
                          placeholder="try SHOP10 or B2BDEAL" 
                          value={couponCodeInput}
                          onChange={(e) => setCouponCodeInput(e.target.value)}
                          className="bg-black/45 border border-white/10 px-3 py-1.5 rounded-xl text-xs font-bold uppercase w-full outline-hidden text-white focus:border-blue-500"
                        />
                        <button 
                          onClick={attemptApplyCoupon}
                          className="bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold px-3 py-1.5 rounded-xl transition"
                        >
                          Apply
                        </button>
                      </div>
                      {activeCoupon ? (
                        <p className="text-[10px] text-emerald-400 bg-emerald-950/40 border border-emerald-500/25 p-1.5 rounded mt-1 font-bold">
                          Successfully Loaded Coupon: {activeCoupon.code} (-₹{calculateDiscount()})!
                        </p>
                      ) : couponError ? (
                        <p className="text-[10px] text-rose-500">{couponError}</p>
                      ) : null}
                    </div>

                    {/* Detailed line items */}
                    <div className="text-xs font-semibold text-slate-400 space-y-2">
                      <div className="flex justify-between">
                        <span>Items Subtotal:</span>
                        <span className="text-slate-200">₹{calculateCartSubtotal()}</span>
                      </div>
                      {calculateDiscount() > 0 && (
                        <div className="flex justify-between text-emerald-400">
                          <span>Coupon Discount:</span>
                          <span>-₹{calculateDiscount()}</span>
                        </div>
                      )}
                      <div className="flex justify-between">
                        <span>18% Central/State CGST+SGST:</span>
                        <span className="text-slate-200">₹{calculateTax()}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Corporate Freight Logistics:</span>
                        <span className="text-emerald-400 font-bold">₹0 (Free default)</span>
                      </div>
                    </div>

                    <div className="flex justify-between items-center text-sm font-black text-white border-t border-white/5 pt-3">
                      <span>Total Invoice Balance:</span>
                      <span className="text-lg text-blue-400">₹{calculateTotal()}</span>
                    </div>

                    <button 
                      onClick={enterCheckout}
                      className="w-full bg-blue-600 hover:bg-blue-700 text-white font-black text-sm tracking-wide py-3 rounded-2xl shadow transition"
                    >
                      Proceed to Shipping Logistics Room
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}


        {/* ===================== CHECKOUT SCREEN ===================== */}
        {view === 'checkout' && (
          <div className="space-y-6" id="checkout-view-layout">
            <h2 className="text-xl font-black text-white flex items-center gap-2">
              <CreditCard className="w-6 h-6 text-blue-400" /> Digital Checkout Hub
            </h2>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
              
              {/* Shipping and Billing Info Form (Left) */}
              <div className="lg:col-span-8 space-y-6 bg-[#0a0a0a] p-6 md:p-8 rounded-3xl border border-white/10 shadow-3xs">
                
                {/* Wholesaler B2B GST Verification Info overlay */}
                {(user?.role === 'business' || (user?.businessProfile && user?.businessProfile?.status === 'approved')) ? (
                  <div className="bg-emerald-950/40 border border-[#10b981]/30 p-4 rounded-2xl space-y-2">
                    <h4 className="font-extrabold text-xs text-emerald-300">🏢 Wholesaler GST Details Operational</h4>
                    <p className="text-[10.5px] text-emerald-450/90 leading-relaxed">
                      We will dynamically inject your verified business corporation details to generate proper 18% GST input benefit invoices directly under Indian Commercial Laws.
                    </p>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-[10px] text-slate-300 bg-black/40 border border-white/5 p-3 rounded-lg font-mono">
                      <div>Company: {user.businessProfile?.businessName || user.name}</div>
                      <div>GSTIN Registered: {user.businessProfile?.gstNumber || '27AAACG1234F1Z1'}</div>
                    </div>
                  </div>
                ) : (
                  <div className="bg-white/5 border border-white/10 p-4 rounded-2xl space-y-2">
                    <h4 className="font-extrabold text-xs text-white flex items-center gap-1.5"><History className="w-4 h-4 text-blue-400" /> B2B Wholesaler GST Invoice Generation</h4>
                    <p className="text-[10px] text-slate-400 leading-normal">
                      Are you purchasing bulk stock for a business registered entity? Fill your GST details on the fly below to auto-inject input tax credits:
                    </p>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
                      <input 
                        type="text" 
                        placeholder="Company Name" 
                        value={b2bCompanyDetails.name}
                        onChange={(e) => setB2bCompanyDetails(prev => ({ ...prev, name: e.target.value }))}
                        className="bg-black/45 border border-white/10 text-xs p-2 rounded-lg text-white"
                      />
                      <input 
                        type="text" 
                        placeholder="GSTIN (Formats Maharashtra e.g. 27...)" 
                        value={b2bCompanyDetails.gstNumber}
                        onChange={(e) => setB2bCompanyDetails(prev => ({ ...prev, gstNumber: e.target.value }))}
                        className="bg-black/45 border border-white/10 text-xs p-2 rounded-lg uppercase text-white animate-none"
                      />
                      <input 
                        type="text" 
                        placeholder="Registered Address" 
                        value={b2bCompanyDetails.address}
                        onChange={(e) => setB2bCompanyDetails(prev => ({ ...prev, address: e.target.value }))}
                        className="bg-black/45 border border-white/10 text-xs p-2 rounded-lg text-white"
                      />
                    </div>
                  </div>
                )}

                {/* 📍 Physical Delivery Address Input (REQUIRED) */}
                <div className="space-y-3 border-t border-white/5 pt-5" id="checkout-delivery-address-section">
                  <div className="flex items-center justify-between">
                    <h3 className="font-extrabold text-sm text-white flex items-center gap-1.5">
                      <span>📍 Delivery Shipping Address</span>
                      <span className="text-red-400 font-extrabold text-xs">*</span>
                    </h3>
                    <span className="text-[10px] text-slate-400 font-mono font-bold uppercase">Required</span>
                  </div>
                  
                  <textarea
                    rows={3}
                    placeholder="Provide full delivery recipient address, landmark, PIN Code & contact phone number..."
                    value={deliveryAddress}
                    onChange={(e) => {
                      setDeliveryAddress(e.target.value);
                      if (e.target.value.trim()) {
                        setAddressError('');
                      }
                    }}
                    className={`w-full bg-white/5 hover:bg-white/10 focus:bg-black text-xs text-white p-3.5 rounded-2xl border outline-hidden transition-all placeholder:text-slate-500 font-medium leading-relaxed ${
                      addressError 
                        ? 'border-red-500 focus:border-red-500 shadow-2xs shadow-red-500/20' 
                        : 'border-white/10 focus:border-blue-500/50'
                    }`}
                  />
                  
                  {addressError && (
                    <p className="text-red-400 font-bold text-[11px] flex items-center gap-1.5 transition-all">
                      <span className="w-1.5 h-1.5 bg-red-500 rounded-full animate-pulse shrink-0"></span>
                      {addressError}
                    </p>
                  )}
                  
                  {/* Option to quickly load a mock Indian location address to make testing / checkout comfortable */}
                  <div className="flex flex-wrap gap-2 pt-1">
                    <span className="text-[9px] text-slate-400 self-center font-bold font-mono">Fill Preset Address:</span>
                    <button
                      type="button"
                      onClick={() => {
                        setDeliveryAddress("Flat 403, Windchime Apartment, Outer Ring Road, Bellandur, Bengaluru, Karnataka - 560103");
                        setAddressError('');
                      }}
                      className="bg-white/5 hover:bg-blue-500/10 text-slate-300 hover:text-blue-400 border border-white/5 hover:border-blue-500/20 text-[9px] font-bold px-2 py-1 rounded-lg transition-all"
                    >
                      📍 Bengaluru HQ Office
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setDeliveryAddress("Shop No. 12, Guru Kripa Market, Phase 3, HSR Sector 2, Mumbai, Maharashtra - 400010");
                        setAddressError('');
                      }}
                      className="bg-white/5 hover:bg-emerald-500/10 text-slate-300 hover:text-emerald-400 border border-white/5 hover:border-emerald-500/20 text-[9px] font-bold px-2 py-1 rounded-lg transition-all"
                    >
                      🏢 Mumbai Warehouse Hub
                    </button>
                  </div>
                </div>

                {/* Shipping Mode Class Selection */}
                <div className="space-y-3">
                  <h3 className="font-extrabold text-sm text-white">Select Logistics Shipping Premium Class</h3>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {[
                      { key: 'standard', name: 'Free Standard Ground', cost: 0, days: '4 days' },
                      { key: 'fast', name: 'Fast Delivery Transit', cost: 150, days: '2 days' },
                      { key: 'same_day', name: 'Premium Same-Day', cost: 350, days: '0 days' }
                    ].map(ship => (
                      <div 
                        key={ship.key}
                        onClick={() => setSelectedShipping(ship.key)}
                        className={`p-4 border-2 rounded-2xl cursor-pointer transition-all flex flex-col justify-between ${selectedShipping === ship.key ? 'border-blue-500 bg-blue-950/30' : 'border-white/10 hover:border-white/20 bg-white/5'}`}
                      >
                        <div className="text-xs font-extrabold text-white">{ship.name}</div>
                        <div className="text-xs text-blue-400 font-bold mt-1">₹{ship.cost} surcharges</div>
                        <span className="text-[10px] text-slate-400 font-bold block mt-2">Arrives in {ship.days}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Payment Methods selector */}
                <div className="space-y-3">
                  <h3 className="font-extrabold text-sm text-white font-sans">Payment Methods Interface</h3>
                  <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
                    {['UPI', 'Credit Card', 'Net Banking', 'COD'].map(m => (
                      <div 
                        key={m}
                        onClick={() => setSelectedPayment(m)}
                        className={`p-3 border rounded-xl text-center cursor-pointer font-bold text-xs transition-all ${selectedPayment === m ? 'border-blue-500 bg-blue-950/40 text-blue-400 font-black' : 'border-white/10 hover:bg-white/5 text-slate-300'}`}
                      >
                        {m}
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Order total balance display (Right) */}
              <div className="lg:col-span-4 space-y-4">
                <div className="bg-[#0a0a0a] border border-white/10 p-6 rounded-3xl text-white space-y-4 shadow-sm">
                  <h3 className="font-extrabold text-sm uppercase tracking-wider text-blue-400 border-b border-white/5 pb-2">Logistics Summary</h3>
                  
                  <div className="text-xs font-semibold space-y-2 text-slate-300">
                    <div className="flex justify-between">
                      <span>Order Subtotal:</span>
                      <span>₹{calculateCartSubtotal()}</span>
                    </div>
                    {calculateDiscount() > 0 && (
                      <div className="flex justify-between text-yellow-350 bg-transparent">
                        <span>Coupon Savings:</span>
                        <span>-₹{calculateDiscount()}</span>
                      </div>
                    )}
                    <div className="flex justify-between">
                      <span>State CGST/SGST Taxes:</span>
                      <span>₹{calculateTax()}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Logistics Premium Class:</span>
                      <span>₹{calculateShippingCharge()}</span>
                    </div>
                  </div>

                  <div className="flex justify-between items-center text-sm font-black border-t border-white/5 pt-3 text-white">
                    <span>Total Net Amount:</span>
                    <span className="text-lg text-blue-400">₹{calculateTotal()}</span>
                  </div>

                  <button 
                    onClick={handleCheckoutSubmission}
                    className="w-full bg-blue-600 hover:bg-blue-700 text-white font-black text-xs py-3 rounded-2xl transition tracking-wider uppercase shadow-md active:scale-97"
                  >
                    Lock Payment & Place Order
                  </button>
                </div>
              </div>

            </div>
          </div>
        )}


        {/* ===================== LOGGED ORDERS VIEW ===================== */}
        {view === 'orders' && (
          <div className="space-y-6" id="orders-screen-layout">
            <h2 className="text-xl font-black text-white">📦 Order Dispatch & Tracking Room</h2>
            <p className="text-xs text-slate-400 font-medium">Real-time GPS tracking and e-invoice records for past transactions</p>

            {orders.length === 0 ? (
              <div className="bg-[#0a0a0a] rounded-3xl p-10 border border-white/10 text-center space-y-3">
                <p className="text-slate-400 font-medium">You have not registered any transactions on this session client yet.</p>
                <button onClick={() => setView('home')} className="bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold px-4 py-2 rounded-xl">Browse live products</button>
              </div>
            ) : (
              <div className="space-y-6">
                {orders.map((o) => (
                  <div key={o.orderId} className="bg-[#0a0a0a] border border-white/10 p-6 rounded-3xl shadow-3xs space-y-4">
                    <div className="flex flex-wrap items-center justify-between gap-3 border-b border-white/5 pb-3">
                      <div>
                        <span className="text-xs text-slate-550 text-slate-400 font-bold">Transaction Reference ID</span>
                        <div className="text-base font-black text-white">{o.orderId}</div>
                      </div>
                      <div className="flex flex-wrap gap-2 text-xs">
                        <button 
                          onClick={() => showInvoiceWindow(o.orderId)}
                          className="bg-emerald-600 hover:bg-emerald-755 hover:bg-emerald-700 text-white font-bold px-3 py-1.5 rounded-lg flex items-center gap-1 transition"
                        >
                          <FileText className="w-4 h-4" /> Download Tax GST Invoice
                        </button>
                        
                        {/* Returns button trigger */}
                        {o.deliveryStatus !== 'Return Requested' ? (
                          <button 
                            onClick={() => {
                              const r = prompt('Specify reason for returning the package:');
                              if (r) requestOrderReturn(o.orderId, r);
                            }}
                            className="bg-white/5 hover:bg-white/10 text-slate-350 text-slate-300 font-bold px-3 py-1.5 rounded-lg transition border border-white/10"
                          >
                            Return Product Cargo
                          </button>
                        ) : (
                          <span className="bg-rose-950/45 text-rose-455 text-rose-400 font-bold px-3 py-1.5 rounded-lg border border-rose-500/30">
                            Reverse Returns Cargo Initiated
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Order summary info */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                      
                      {/* Sub-item products description */}
                      <div className="space-y-2">
                        <h4 className="font-extrabold text-xs uppercase tracking-wider text-blue-400">Cargo Contents</h4>
                        <div className="space-y-1.5 text-xs text-slate-300 font-bold">
                          {o.items?.map((item: any, idx: number) => (
                            <div key={idx} className="flex justify-between">
                              <span>{item.name} (x{item.qty})</span>
                              <span className="text-white">₹{item.purchasePrice * item.qty}</span>
                            </div>
                          ))}
                          {o.gstDetails && (
                            <div className="bg-emerald-950/40 border border-emerald-500/22 p-2 rounded-xl mt-2 text-[10px] text-emerald-300">
                              Injecting GST Input tax benefit onto <strong>{o.gstDetails.companyName}</strong> [ GST: {o.gstDetails.gstNumber} ]
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Financial values */}
                      <div className="space-y-2 border-t md:border-t-0 md:border-x border-white/5 md:px-6 pt-3 md:pt-0">
                        <h4 className="font-extrabold text-xs uppercase tracking-wider text-blue-400 font-mono">Financial Log</h4>
                        <div className="space-y-1 text-xs text-slate-355 text-slate-300 font-bold">
                          <div className="flex justify-between"><span>Base Wholesale subtotal:</span> <span className="text-white">₹{o.subtotal}</span></div>
                          {o.discountAmount > 0 && <div className="flex justify-between text-emerald-400"><span>Savings applied:</span> <span>-₹{o.discountAmount}</span></div>}
                          <div className="flex justify-between"><span>CGST+SGST calculated:</span> <span className="text-white">₹{o.taxAmount}</span></div>
                          <div className="flex justify-between"><span>Freight logistics premium:</span> <span className="text-white">₹{o.shippingCost}</span></div>
                          <div className="flex justify-between font-black text-white text-sm border-t border-white/5 pt-1">
                            <span>Adjusted Net:</span> <span className="text-blue-400">₹{o.total}</span>
                          </div>
                        </div>
                      </div>

                      {/* Delivery Status and tracking timeline slider */}
                      <div className="space-y-3 pt-3 md:pt-0">
                        <h4 className="font-extrabold text-xs uppercase tracking-wider text-blue-400">Real-Time Dispatch Timeline</h4>
                        <div className="space-y-2 text-xs">
                          <div className="flex items-center gap-2">
                            <span className="w-2.5 h-2.5 bg-emerald-500 rounded-full"></span>
                            <span className="font-extrabold text-slate-200 text-slate-300">Logistics Status: {o.deliveryStatus}</span>
                          </div>
                          <p className="text-[11px] text-slate-450 text-slate-400 font-mono">Carrier expected hand-off date by: <strong className="text-white">{o.deliveryDate}</strong></p>
                          
                          {o.shippingAddress && (
                            <div className="bg-slate-950/60 border border-white/5 p-2 rounded-xl text-[10.5px] text-slate-300 font-medium leading-relaxed">
                              📍 <strong>Shipping Address:</strong> {o.shippingAddress}
                            </div>
                          )}

                          {/* Render tracking Logs */}
                          <div className="border-l border-white/10 pl-3 space-y-2 mt-1">
                            {o.trackingTimeline?.map((lg: any, idx: number) => (
                              <div key={idx} className="relative">
                                <span className="absolute -left-[17px] top-1.5 w-1.5 h-1.5 bg-blue-500 rounded-full"></span>
                                <div className="text-[10px] font-bold text-slate-205 text-slate-200">{lg.title}</div>
                                <div className="text-[9px] text-slate-450 text-slate-400">{lg.desc}</div>
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>

                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}


        {/* ===================== ONBOARDING / VERIFICATION ON-THE-FLY ===================== */}
        {view === 'verification' && (
          <div className="max-w-2xl mx-auto space-y-6" id="onboarding-on-the-fly-form">
            <div className="text-center space-y-2">
              <h2 className="text-2xl font-black text-white tracking-tight">Onboard Multi-vendor clearances</h2>
              <p className="text-xs text-slate-400 max-w-sm mx-auto font-medium">Upload valid B2B wholesaler business profile details or manufacturers bank accounts to unlock special clearance prices.</p>
            </div>

            <form onSubmit={submitVerification} className="bg-[#0a0a0a] border border-white/10 p-6 md:p-8 rounded-3xl shadow-sm space-y-4">
              <div className="space-y-2">
                <label className="text-xs font-extrabold text-slate-400 uppercase tracking-widest block font-mono">Pick clearance paradigm</label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <button 
                    type="button"
                    onClick={() => { setVerificationForm(prev => ({ ...prev, mode: 'business' })); setVerificationFeedback(''); }}
                    className={`py-3 px-3 border-2 rounded-xl text-center font-bold text-xs cursor-pointer transition-all ${verificationForm.mode === 'business' ? 'border-blue-500 bg-blue-950/45 text-blue-400' : 'border-white/10 text-slate-400 bg-white/5'}`}
                  >
                    🏢 Wholesaler Profile (Flipkart B2B)
                  </button>
                  <button 
                    type="button"
                    onClick={() => { setVerificationForm(prev => ({ ...prev, mode: 'seller' })); setVerificationFeedback(''); }}
                    className={`py-3 px-3 border-2 rounded-xl text-center font-bold text-xs cursor-pointer transition-all ${verificationForm.mode === 'seller' ? 'border-blue-500 bg-blue-950/45 text-blue-400' : 'border-white/10 text-slate-400 bg-white/5'}`}
                  >
                    👨‍💼 Merchant Seller Brand (Amazon Store)
                  </button>
                </div>
              </div>

              <div className="space-y-3 font-medium">
                <div>
                  <label className="text-xs font-bold text-slate-400 mb-1 block">Registered Legal Company Name</label>
                  <input 
                    type="text" 
                    required
                    placeholder="Enter registered trade agency name..."
                    value={verificationForm.companyName}
                    onChange={(e) => setVerificationForm(prev => ({ ...prev, companyName: e.target.value }))}
                    className="w-full bg-black/45 border border-white/10 text-xs p-2.5 rounded-xl outline-hidden focus:border-blue-500 text-white"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs font-bold text-slate-400 mb-1 block">GSTIN Registration Number</label>
                    <input 
                      type="text" 
                      required
                      placeholder="e.g. 27AAACG1234F1Z1"
                      value={verificationForm.gst}
                      onChange={(e) => setVerificationForm(prev => ({ ...prev, gst: e.target.value }))}
                      className="w-full bg-black/45 border border-white/10 text-xs p-2.5 rounded-xl outline-hidden uppercase text-white"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-bold text-slate-400 mb-1 block">Corporate PAN Card</label>
                    <input 
                      type="text" 
                      required
                      placeholder="e.g. ABCDE1234F"
                      value={verificationForm.pan}
                      onChange={(e) => setVerificationForm(prev => ({ ...prev, pan: e.target.value }))}
                      className="w-full bg-black/45 border border-white/10 text-xs p-2.5 rounded-xl outline-hidden uppercase text-white"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-400 mb-1 block">Primary Aadhaar (Authorized Signatory)</label>
                  <input 
                    type="text" 
                    required
                    placeholder="12-digit number format"
                    maxLength={12}
                    value={verificationForm.aadhaar}
                    onChange={(e) => setVerificationForm(prev => ({ ...prev, aadhaar: e.target.value }))}
                    className="w-full bg-black/45 border border-white/10 text-xs p-2.5 rounded-xl outline-hidden text-white"
                  />
                </div>

                {verificationForm.mode === 'seller' && (
                  <div>
                    <label className="text-xs font-bold text-slate-400 mb-1 block">Merchant Corporate Bank Account (for remittances)</label>
                    <input 
                      type="text" 
                      required
                      placeholder="e.g. Account Number: 91827... with IFSC Code DBSS0..."
                      value={verificationForm.bankAccount}
                      onChange={(e) => setVerificationForm(prev => ({ ...prev, bankAccount: e.target.value }))}
                      className="w-full bg-black/45 border border-white/10 text-xs p-2.5 rounded-xl outline-hidden text-white"
                    />
                  </div>
                )}

                <div>
                  <label className="text-xs font-bold text-slate-400 mb-1 block">Physical Trade Address</label>
                  <textarea 
                    rows={2}
                    required
                    placeholder="Enter physical warehouse legal address..."
                    value={verificationForm.address}
                    onChange={(e) => setVerificationForm(prev => ({ ...prev, address: e.target.value }))}
                    className="w-full bg-black/45 border border-white/10 text-xs p-2.5 rounded-xl outline-hidden focus:border-blue-400 text-white"
                  />
                </div>
              </div>

              {verificationFeedback && (
                <div className={`p-3.5 rounded-xl text-xs font-bold leading-relaxed border ${verificationFeedback.includes('Success') ? 'bg-emerald-950/40 border-emerald-500/22 text-emerald-300' : 'bg-[#e11d48]/10 border-[#e11d48]/23 text-red-300'}`}>
                  {verificationFeedback}
                </div>
              )}

              <button 
                type="submit"
                id="btn-submit-verification"
                className="w-full bg-blue-600 hover:bg-blue-700 text-white text-xs font-black py-3 rounded-2xl tracking-wider uppercase shadow-md transition"
              >
                Submit Verifications Logs
              </button>
            </form>
          </div>
        )}


        {/* ===================== SELLER DASHBOARD VIEW ===================== */}
        {view === 'seller-dash' && (
          <div className="space-y-6" id="seller-dash-view-framework">
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4 border-b border-slate-200 pb-3">
              <div>
                <h2 className="text-xl font-black text-slate-950 flex items-center gap-1.5 leading-tight">
                  <Layers className="w-6 h-6 text-indigo-600 animate-pulse" /> Verified Brand Merchant Onboarding Console
                </h2>
                <p className="text-xs text-rose-600 bg-rose-50 px-2 py-0.5 rounded font-extrabold inline-block uppercase tracking-wider mt-1.5 border border-rose-200 shadow-2xs">
                  Active Mode: Certified Seller {user?.sellerProfile?.companyName || user?.name}
                </p>
              </div>
              <div className="flex gap-2">
                <button 
                  onClick={simulateBulkUpload}
                  className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs py-2 px-4 rounded-xl shadow transition tracking-wide flex items-center gap-1.5"
                >
                  <Upload className="w-4 h-4" /> Bulk CSV Upload Simulate
                </button>
              </div>
            </div>

            {/* Simulated Live Analytics Grid */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              {[
                { title: "Net Revenue Stream", val: "₹1,48,220", change: "+18.3%", desc: "Calculated monthly cycle receipts" },
                { title: "Fulfilled Consignments", val: "48 Orders", change: "+12.2%", desc: "Dispatched via Express cargo" },
                { title: "Active Wholesale Listings", val: `${products.length} Products`, change: "Seeded ok", desc: "Live index in ShopSphere" },
                { title: "Customer Return Requests", val: "1 Inbound", change: "Hold review", desc: "Returns center active" }
              ].map(stat => (
                <div key={stat.title} className="bg-white border border-slate-100 p-4 rounded-2xl shadow-3xs hover:shadow transition">
                  <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">{stat.title}</span>
                  <div className="text-lg font-black text-slate-900 mt-1 flex items-baseline justify-between">
                    <span>{stat.val}</span>
                    <span className="text-xs text-emerald-600 font-bold">{stat.change}</span>
                  </div>
                  <p className="text-[10px] text-slate-500 mt-1.5">{stat.desc}</p>
                </div>
              ))}
            </div>

            {/* List products + Add Product form */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
              
              {/* Product list catalog details */}
              <div className="lg:col-span-7 bg-[#0a0a0a] p-6 rounded-3xl border border-white/10 shadow-2xs space-y-4">
                <h3 className="font-extrabold text-sm text-white flex items-center justify-between pb-2 border-b border-white/5">
                  <span>Current Merchant Product Inventory</span>
                  <span className="text-[10px] bg-white/5 text-slate-300 px-2 py-0.5 rounded-full font-bold uppercase tracking-wider">Manage Mode</span>
                </h3>
                <div className="space-y-3 max-h-120 overflow-y-auto pr-1">
                  {products.map(p => (
                    <div key={p.id} className="flex items-center justify-between p-3.5 border border-white/5 bg-white/5 rounded-xl hover:bg-white/10 transition">
                      <div className="flex gap-3">
                        <img src={p.images[0]} alt={p.name} className="w-12 h-12 rounded-lg object-cover bg-black/45" />
                        <div>
                          <h4 className="text-xs font-extrabold line-clamp-1 text-white">{p.name}</h4>
                          <div className="flex items-center gap-2 text-[10px] text-slate-400 font-bold">
                            <span className="text-blue-400">₹{p.price}</span>
                            <span>•</span>
                            <span>Stock: <span className="text-slate-200">{p.stock} units</span></span>
                          </div>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <button 
                          onClick={() => {
                            const st = prompt('Set newer Active Inventory Stock:');
                            if (st) {
                              fetch(`/api/products/${p.id}/stock`, {
                                method: 'PUT',
                                headers: { 'Content-Type': 'application/json' },
                                body: JSON.stringify({ stock: Number(st) })
                              }).then(() => fetchProducts());
                            }
                          }}
                          className="bg-blue-600 hover:bg-blue-700 text-white font-bold text-[10px] px-2.5 py-1 rounded-md"
                        >
                          Restock
                        </button>
                        <button 
                          onClick={() => {
                            if (confirm('Delete this product?')) {
                              fetch(`/api/products/${p.id}`, { method: 'DELETE' }).then(() => fetchProducts());
                            }
                          }}
                          className="text-slate-400 hover:text-rose-400 p-1 rounded-md hover:bg-rose-950/20"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Add Product Form (with server-side Gemini text content auto generator!) */}
              <div className="lg:col-span-5 bg-gradient-to-br from-blue-950/20 to-black p-6 rounded-3xl border border-blue-550/20 border-white/10 shadow-2xs space-y-4">
                <h3 className="font-extrabold text-sm text-blue-400 flex items-center gap-1.5 border-b border-white/5 pb-2 font-mono">
                  <Sparkles className="w-4 h-4 text-blue-400 animate-spin" /> Load a New Merchant Product
                </h3>

                <div className="space-y-3.5">
                  <div>
                    <label className="text-[11px] font-bold text-slate-400 mb-1 block">Product Title</label>
                    <input 
                      type="text" 
                      placeholder="e.g. AstroBuds Super ANC Earbuds" 
                      value={sellerProductForm.name}
                      onChange={(e) => setSellerProductForm(prev => ({ ...prev, name: e.target.value }))}
                      className="w-full bg-black/45 border border-white/10 text-xs p-2 rounded-lg text-white font-medium"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="text-[11px] font-bold text-slate-400 mb-1 block">Category</label>
                      <select 
                        value={sellerProductForm.category}
                        onChange={(e) => setSellerProductForm(prev => ({ ...prev, category: e.target.value }))}
                        className="w-full bg-black/45 border border-white/10 text-xs p-2 rounded-lg text-white font-medium [&>option]:bg-[#0c0c0c] [&>option]:text-white"
                      >
                        <option value="Mobiles">Mobiles</option>
                        <option value="Laptops">Laptops</option>
                        <option value="Electronics">Electronics</option>
                        <option value="Appliances">Appliances</option>
                        <option value="Fashion">Fashion</option>
                        <option value="Home & Living">Home & Living</option>
                        <option value="Beauty">Beauty</option>
                        <option value="Books">Books</option>
                        <option value="Grocery">Grocery</option>
                      </select>
                    </div>
                    <div>
                      <label className="text-[11px] font-bold text-slate-400 mb-1 block">Price (₹ INR)</label>
                      <input 
                        type="number" 
                        placeholder="Selling Price" 
                        value={sellerProductForm.price}
                        onChange={(e) => setSellerProductForm(prev => ({ ...prev, price: e.target.value }))}
                        className="w-full bg-black/45 border border-white/10 text-xs p-2 rounded-lg text-white font-medium"
                      />
                    </div>
                  </div>

                  {/* Server side description helper powered by Gemini AI! */}
                  <div className="space-y-1.5 bg-black/45 border border-white/10 p-3.5 rounded-2xl relative shadow-3xs">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-[10px] text-blue-400 font-extrabold uppercase tracking-wider flex items-center gap-1 font-mono">
                        <Sparkle className="w-3.5 h-3.5 text-blue-400 animate-pulse" /> Gemini AI Copy Generator
                      </span>
                      <button 
                        onClick={generateSellerAiCopy}
                        disabled={generatingAiContent}
                        className="bg-blue-600 hover:bg-blue-700 text-white text-[9px] font-black uppercase px-2.5 py-1.5 rounded-lg transition disabled:opacity-40"
                      >
                        {generatingAiContent ? 'Generating description...' : 'Draft AI Copy'}
                      </button>
                    </div>
                    <textarea 
                      rows={2.5}
                      placeholder="AI content description will load here on draft trigger..."
                      value={sellerProductForm.description}
                      onChange={(e) => setSellerProductForm(prev => ({ ...prev, description: e.target.value }))}
                      className="w-full bg-[#111111] border border-white/10 text-xs p-2 rounded-lg text-white placeholder-slate-500"
                    />
                  </div>

                  <div>
                    <label className="text-[11px] font-bold text-slate-400 mb-1 block">Specs (Separate with semicolon e.g. Warranty: 1 Yrs; Type: 3D)</label>
                    <input 
                      type="text" 
                      value={sellerProductForm.specsText}
                      onChange={(e) => setSellerProductForm(prev => ({ ...prev, specsText: e.target.value }))}
                      className="w-full bg-black/45 border border-white/10 text-xs p-2 rounded-lg text-white font-mono text-[10.5px]"
                    />
                  </div>
                </div>

                {productSuccessMsg && (
                  <div className="p-3 bg-emerald-950/45 border border-emerald-500/22 rounded-xl text-xs text-emerald-300 font-bold">
                    {productSuccessMsg}
                  </div>
                )}

                <button 
                  onClick={addSellerProduct}
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white text-xs font-black py-2.5 rounded-xl tracking-wider uppercase transition shadow-md"
                >
                  Submit Listing
                </button>
              </div>

            </div>
          </div>
        )}


        {/* ===================== PLATFORM ADMIN PANEL ===================== */}
        {view === 'admin-panel' && (
          <div className="space-y-6" id="admin-panel-console">
            <div className="border border-blue-500/20 bg-blue-950/30 p-4 rounded-3xl text-sm flex items-center justify-between flex-wrap gap-3 shadow-3xs">
              <div className="flex items-center gap-3">
                <div className="bg-blue-600 text-white p-2 rounded-2xl">
                  <ShieldCheck className="w-5.5 h-5.5" />
                </div>
                <div>
                  <h2 className="font-extrabold text-white text-base leading-tight">Master Governance Cockpit Operations</h2>
                  <p className="text-xs text-slate-400 font-medium mt-1">Accept, elevate or decline multi-vendor GST clearance dossiers instantaneously.</p>
                </div>
              </div>
              <span className="text-xs bg-blue-550/22 border border-blue-555/44 bg-blue-950/45 text-blue-400 font-extrabold tracking-wider uppercase px-2.5 py-0.5 rounded-full">Supervisor clearance</span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              
              {/* Wholesaler Queue */}
              <div className="bg-[#0a0a0a] border border-white/10 p-6 rounded-3xl shadow-sm space-y-4">
                <h3 className="font-extrabold text-sm text-slate-100 border-b border-white/5 pb-2">Pending Wholesalers Onboarding Queue</h3>
                
                {adminPending.pendingBusiness?.length === 0 ? (
                  <p className="text-xs text-slate-500">Zero pending wholesale clearance files in active buffer queue.</p>
                ) : (
                  <div className="space-y-4">
                    {adminPending.pendingBusiness?.map((u: any) => (
                      <div key={u.uid} className="bg-white/5 p-4 rounded-2xl space-y-3">
                        <div className="flex justify-between items-start">
                          <div>
                            <div className="text-xs font-extrabold text-white">{u.businessProfile?.businessName || u.name}</div>
                            <span className="text-[9px] text-slate-450 block font-mono">User ID: {u.uid} • GST Number: {u.businessProfile?.gstNumber}</span>
                          </div>
                          <span className="text-[9px] bg-blue-950 text-blue-300 font-bold px-2 py-0.5 rounded-full uppercase">18% GST File</span>
                        </div>
                        <div className="grid grid-cols-2 gap-2 text-[10px] text-slate-300 font-mono bg-[#0c0c0c] p-2.5 rounded-lg border border-white/5">
                          <div>PAN: {u.businessProfile?.panNumber}</div>
                          <div>Aadhaar: {u.businessProfile?.aadhaarNumber}</div>
                        </div>
                        <div className="flex gap-2">
                          <button 
                            onClick={() => processAdminApproval(u.uid, 'business', 'approved')}
                            className="bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold py-1 px-3 rounded-lg mr-2"
                          >
                            Approve
                          </button>
                          <button 
                            onClick={() => processAdminApproval(u.uid, 'business', 'rejected')}
                            className="text-slate-400 hover:text-rose-400 text-xs font-bold py-1"
                          >
                            Reject Dossier
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Seller queue */}
              <div className="bg-[#0a0a0a] border border-white/10 p-6 rounded-3xl shadow-sm space-y-4">
                <h3 className="font-extrabold text-sm text-slate-100 border-b border-white/5 pb-2">Pending Sellers Brands Queue</h3>
                
                {adminPending.pendingSellers?.length === 0 ? (
                  <p className="text-xs text-slate-500">Zero pending brand vendors in queue buffer.</p>
                ) : (
                  <div className="space-y-4">
                    {adminPending.pendingSellers?.map((u: any) => (
                      <div key={u.uid} className="bg-white/5 p-4 rounded-2xl space-y-3">
                        <div className="flex justify-between items-start">
                          <div>
                            <span className="text-xs font-extrabold text-white">{u.sellerProfile?.companyName || u.name}</span>
                            <span className="text-[9px] text-slate-450 block font-mono">GST: {u.sellerProfile?.gstNumber} • PAN: {u.sellerProfile?.panNumber}</span>
                          </div>
                          <span className="text-[9px] bg-blue-950 text-blue-300 font-bold px-2 py-0.5 rounded-full uppercase">Brand Onboarding</span>
                        </div>
                        <div className="bg-[#0c0c0c] p-2.5 rounded-lg text-[9.5px] text-slate-350 font-mono space-y-1.5 border border-white/5">
                          <div>Signatory Aadhaar: {u.sellerProfile?.aadhaarNumber}</div>
                          <div>Direct Remittance: {u.sellerProfile?.bankAccount}</div>
                        </div>
                        <div className="flex gap-2">
                          <button 
                            onClick={() => processAdminApproval(u.uid, 'seller', 'approved')}
                            className="bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold py-1 px-3 rounded-lg mr-2"
                          >
                            Approve
                          </button>
                          <button 
                            onClick={() => processAdminApproval(u.uid, 'seller', 'rejected')}
                            className="text-slate-400 hover:text-rose-455 hover:text-rose-400 text-xs font-bold py-1"
                          >
                            Reject Onboarding
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

            </div>
          </div>
        )}

      </main>

      {/* 🔮 INTERACTIVE INTELLIGENT SEARCH ASSISTANT CHAT MODAL OR ICON */}
      <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end gap-3" id="ai-assistant-widget">
        
        {/* Floating Chat Panel Box (Toggleable) */}
        {isAiChatOpen && (
          <div className="bg-[#111111] border border-white/10 rounded-3xl w-80 md:w-96 shadow-2xl overflow-hidden flex flex-col h-100 transition-all scale-100">
            <div className="bg-linear-to-r from-blue-700 to-[#1e1b4b] text-white p-4 flex items-center justify-between border-b border-white/10">
              <div className="flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-blue-400 animate-spin" />
                <div>
                  <h4 className="text-xs font-black tracking-wide uppercase leading-tight font-sans">ShopSphere India AI Advisor</h4>
                  <span className="text-[9px] text-slate-400 font-bold uppercase tracking-wider block">Real-time product assistant</span>
                </div>
              </div>
              <button onClick={() => setIsAiChatOpen(false)} className="text-slate-400 hover:text-white text-xs font-extrabold font-mono">
                [X]
              </button>
            </div>

            {/* Chat Messages */}
            <div className="flex-1 p-4 overflow-y-auto space-y-3 bg-[#0a0a0a]">
              {aiChatResponses.map((msg, i) => (
                <div key={i} className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
                  <div className={`p-3 max-w-[80%] rounded-2xl text-xs leading-relaxed font-medium shadow-3xs ${msg.sender === 'user' ? 'bg-blue-600 text-white font-semibold' : 'bg-white/5 border border-white/10 text-slate-100'}`}>
                    {msg.text}
                  </div>
                </div>
              ))}
            </div>

            {/* Write chat prompt panel */}
            <div className="p-3 border-t border-white/10 bg-[#111111] flex gap-2">
              <input 
                type="text" 
                placeholder="Ask pricing tier discounts, specifications..." 
                value={aiChatMessage}
                onChange={(e) => setAiChatMessage(e.target.value)}
                onKeyDown={(e) => { if (e.key === 'Enter') sendChatMessage(); }}
                className="w-full bg-black/45 border border-white/10 rounded-xl px-3 text-xs outline-hidden focus:border-blue-500 text-white placeholder-slate-500"
              />
              <button 
                onClick={sendChatMessage}
                className="bg-blue-600 hover:bg-blue-700 text-white text-xs font-black px-3.5 py-1.5 rounded-xl transition"
              >
                Send
              </button>
            </div>
          </div>
        )}

        <button 
          onClick={() => setIsAiChatOpen(prev => !prev)}
          className="bg-linear-to-r from-blue-700 to-[#1e1b4b] text-white rounded-full p-4 hover:shadow-lg hover:scale-103 transition flex items-center gap-2 font-black text-xs shadow-md border border-white/10"
          id="btn-trigger-chatbot-toggle"
        >
          <Sparkles className="w-5 h-5 text-blue-400 animate-pulse" /> Ask ShopSphere AI
        </button>

      </div>

      {/* 🏷️ FOOTER */}
      <footer className="bg-black/45 border-t border-white/10 py-6 mt-12 text-center" id="app-footer">
        <div className="max-w-7xl mx-auto px-4 text-xs font-semibold text-slate-500 space-y-2">
          <p>© 2026 ShopSphere India Multi-vendor Marketplace Platform</p>
          <p className="text-[10px] uppercase font-bold tracking-widest text-blue-550 text-blue-400/80">Amazon + Flipkart Inspired Commercial Logistics</p>
        </div>
      </footer>

    </div>
  );
}
