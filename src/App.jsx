import { useState, useEffect } from 'react';
import { ShoppingCart, User, Search, X } from 'lucide-react';

function App() {
  const [currentUser, setCurrentUser] = useState(null);
  const [cart, setCart] = useState([]);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [activeCategory, setActiveCategory] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [piInitialized, setPiInitialized] = useState(false);

  // Sample Products
  const products = [
    { id: 1, name: "Royal Atamfa Fabric", category: "fabrics", price: 28, img: "https://picsum.photos/id/1015/600/600", desc: "Handwoven premium quality" },
    { id: 2, name: "Men's Senator Agbada Set", category: "men", price: 65, img: "https://picsum.photos/id/1027/600/600", desc: "Complete 3-piece luxury set" },
    { id: 3, name: "Elegant Nigerian Lace", category: "women", price: 45, img: "https://picsum.photos/id/1033/600/600", desc: "Premium quality lace" },
    { id: 4, name: "Kids Traditional Outfit", category: "kids", price: 22, img: "https://picsum.photos/id/106/600/600", desc: "Ceremonial wear" },
    { id: 5, name: "Velvet Aso Oke", category: "fabrics", price: 35, img: "https://picsum.photos/id/201/600/600", desc: "Luxury traditional fabric" },
    { id: 6, name: "Women's Iro & Buba", category: "women", price: 55, img: "https://picsum.photos/id/1005/600/600", desc: "Complete set" },
  ];

  // Initialize Pi SDK
  useEffect(() => {
    const initPi = async () => {
      try {
        await window.Pi.init({ version: "2.0", sandbox: true }); // false for Mainnet
        setPiInitialized(true);
      } catch (e) {
        console.error("Pi SDK failed to initialize", e);
      }
    };
    initPi();
  }, []);

  const loginWithPi = async () => {
    if (!piInitialized) return alert("Pi SDK not ready");
    
    try {
      const scopes = ['payments'];
      const auth = await window.Pi.authenticate(scopes, onIncompletePaymentFound);
      setCurrentUser(auth.user);
    } catch (err) {
      alert("Login failed. Please try again.");
    }
  };

  const onIncompletePaymentFound = (payment) => {
    console.log("Incomplete payment found:", payment);
  };

  const filteredProducts = products.filter(product => {
    const matchesCategory = activeCategory === 'all' || product.category === activeCategory;
    const matchesSearch = product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         product.desc.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const addToCart = (product) => {
    setCart([...cart, product]);
  };

  const removeFromCart = (index) => {
    const newCart = [...cart];
    newCart.splice(index, 1);
    setCart(newCart);
  };

  const totalAmount = cart.reduce((sum, item) => sum + item.price, 0);

  const checkoutWithPi = async () => {
    if (!currentUser) return alert("Please login with Pi");
    if (cart.length === 0) return;

    const paymentData = {
      amount: parseFloat(totalAmount.toFixed(2)),
      memo: `LATCINTL Order #${Date.now()}`,
      metadata: {
        items: cart.map(i => i.name),
        count: cart.length,
        user: currentUser.username
      }
    };

    try {
      await window.Pi.createPayment(paymentData, {
        onReadyForServerApproval: (paymentId) => {
          console.log("Send to backend for approval:", paymentId);
          // fetch('/api/approve-payment', { method: 'POST', body: JSON.stringify({paymentId}) })
        },
        onReadyForServerCompletion: (paymentId, txid) => {
          alert("🎉 Order placed successfully! Transaction ID: " + txid);
          setCart([]);
          setIsCartOpen(false);
        },
        onCancel: () => console.log("Payment cancelled"),
        onError: (err) => alert("Payment error: " + err.message)
      });
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="min-h-screen bg-[#f8f1e3]">
      {/* HEADER */}
      <header className="bg-gradient-to-r from-[#8B4513] to-[#A0522D] text-white sticky top-0 z-50 shadow-lg">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <h1 className="text-4xl font-bold tracking-wider">LATC<span className="text-[#D4A017]">INTL</span></h1>
            </div>

            <div className="flex-1 max-w-xl mx-8">
              <div className="relative">
                <Search className="absolute left-4 top-3.5 text-gray-400" size={20} />
                <input
                  type="text"
                  placeholder="Search Atamfa, Agbada, Lace..."
                  className="w-full pl-12 py-3 rounded-full text-black focus:outline-none"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
            </div>

            <div className="flex items-center gap-4">
              {currentUser ? (
                <div className="flex items-center gap-2 bg-white/20 px-4 py-2 rounded-full">
                  <User size={20} />
                  <span className="font-medium">@{currentUser.username}</span>
                </div>
              ) : (
                <button
                  onClick={loginWithPi}
                  className="bg-white text-[#8B4513] px-6 py-3 rounded-full font-semibold hover:bg-[#D4A017] hover:text-white transition-all flex items-center gap-2"
                >
                  Login with Pi
                </button>
              )}

              <button
                onClick={() => setIsCartOpen(true)}
                className="relative p-3 hover:bg-white/10 rounded-full transition"
              >
                <ShoppingCart size={26} />
                {cart.length > 0 && (
                  <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs w-5 h-5 rounded-full flex items-center justify-center">
                    {cart.length}
                  </span>
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Category Navigation */}
        <div className="bg-black/20 py-3">
          <div className="max-w-7xl mx-auto px-6 flex gap-8 text-sm font-medium overflow-x-auto">
            {['all', 'fabrics', 'men', 'women', 'kids'].map(cat => (
              <button
                key={cat}
                onClick={() => setActiveCategory(cat)}
                className={`pb-1 border-b-2 transition ${activeCategory === cat ? 'border-[#D4A017] text-white' : 'border-transparent hover:text-[#D4A017]'}`}
              >
                {cat === 'all' ? 'All Collections' : cat.charAt(0).toUpperCase() + cat.slice(1)}
              </button>
            ))}
          </div>
        </div>
      </header>

      {/* HERO */}
      <section className="bg-cover bg-center h-[520px] flex items-center relative" style={{backgroundImage: 'url("https://picsum.photos/id/1015/2000/800")'}}>
        <div className="absolute inset-0 bg-black/50" />
        <div className="relative max-w-4xl mx-auto text-center px-6 text-white">
          <h2 className="text-6xl font-bold mb-6">Timeless African Luxury</h2>
          <p className="text-2xl mb-10">Premium Fabrics • Traditional Fashion • Global Delivery</p>
          <button 
            onClick={() => document.getElementById('products').scrollIntoView({ behavior: 'smooth' })}
            className="bg-[#D4A017] hover:bg-amber-500 text-black text-xl font-semibold px-12 py-4 rounded-full transition"
          >
            Shop with Pi Now
          </button>
        </div>
      </section>

      {/* PRODUCTS SECTION */}
      <section id="products" className="max-w-7xl mx-auto px-6 py-16">
        <h2 className="text-4xl font-bold text-center mb-12 text-[#8B4513]">
          {activeCategory === 'all' ? 'Our Collections' : activeCategory.toUpperCase()}
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
          {filteredProducts.map(product => (
            <div key={product.id} className="bg-white rounded-3xl overflow-hidden shadow-xl hover:shadow-2xl transition-all duration-300 group">
              <div className="relative">
                <img src={product.img} alt={product.name} className="w-full h-80 object-cover group-hover:scale-105 transition" />
              </div>
              <div className="p-6">
                <h3 className="font-semibold text-xl mb-1">{product.name}</h3>
                <p className="text-gray-600 text-sm mb-4">{product.desc}</p>
                <div className="flex justify-between items-center">
                  <span className="text-3xl font-bold text-[#8B4513]">{product.price} <span className="text-lg">Pi</span></span>
                  <button
                    onClick={() => addToCart(product)}
                    className="bg-[#8B4513] text-white px-6 py-3 rounded-2xl hover:bg-[#A0522D] transition flex items-center gap-2"
                  >
                    Add to Cart
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* CART SIDEBAR */}
      <div className={`fixed top-0 right-0 h-full w-full max-w-md bg-white shadow-2xl transform transition-transform duration-300 ${isCartOpen ? 'translate-x-0' : 'translate-x-full'} z-50`}>
        <div className="h-full flex flex-col">
          <div className="p-6 border-b flex justify-between items-center bg-[#8B4513] text-white">
            <h2 className="text-2xl font-semibold flex items-center gap-3">
              <ShoppingCart /> Your Cart ({cart.length})
            </h2>
            <button onClick={() => setIsCartOpen(false)}><X size={32} /></button>
          </div>

          <div className="flex-1 overflow-auto p-6 space-y-6">
            {cart.length === 0 ? (
              <p className="text-center text-gray-500 mt-20">Your cart is empty</p>
            ) : (
              cart.map((item, index) => (
                <div key={index} className="flex gap-4 bg-gray-50 p-4 rounded-2xl">
                  <img src={item.img} className="w-20 h-20 object-cover rounded-xl" alt="" />
                  <div className="flex-1">
                    <h4 className="font-medium">{item.name}</h4>
                    <p className="text-[#8B4513] font-bold">{item.price} Pi</p>
                  </div>
                  <button onClick={() => removeFromCart(index)} className="text-red-500 text-2xl">×</button>
                </div>
              ))
            )}
          </div>

          {cart.length > 0 && (
            <div className="p-6 border-t">
              <div className="flex justify-between text-2xl font-bold mb-6">
                <span>Total</span>
                <span>{totalAmount} Pi</span>
              </div>
              <button
                onClick={checkoutWithPi}
                className="w-full bg-gradient-to-r from-[#8B4513] to-[#D4A017] text-white py-5 rounded-3xl text-xl font-semibold hover:scale-105 transition"
              >
                Pay with Pi
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default App;
