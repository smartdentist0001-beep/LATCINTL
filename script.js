// ============== LATCINTL - Main Script ==============

let currentUser = null;
let cart = [];
let orders = []; // For demo admin view

// Initialize Pi SDK
async function initPi() {
  try {
    await Pi.init({ version: "2.0", sandbox: true }); // false = Mainnet
    console.log("✅ Pi SDK Initialized");
  } catch (e) {
    console.error("Pi SDK Init Failed", e);
  }
}

// Login
document.getElementById('login-btn').addEventListener('click', async () => {
  const scopes = ['payments'];
  try {
    const auth = await Pi.authenticate(scopes, onIncompletePaymentFound);
    currentUser = auth.user;
    
    document.getElementById('user-info').innerHTML = `👋 ${currentUser.username}`;
    document.getElementById('login-btn').style.display = 'none';
    document.getElementById('pi-balance').textContent = "248.75 Pi";
  } catch (err) {
    alert("Pi Authentication failed");
  }
});

function onIncompletePaymentFound(payment) {
  console.log("Incomplete Payment Found:", payment);
}

// Render Products
function renderProducts(filteredProducts) {
  const grid = document.getElementById('product-grid');
  grid.innerHTML = '';

  filteredProducts.forEach(product => {
    const card = document.createElement('div');
    card.className = 'product-card';
    card.innerHTML = `
      <img src="\( {product.img}" alt=" \){product.name}">
      <div class="product-info">
        <h3>${product.name}</h3>
        <p>${product.description}</p>
        <div class="price">${product.price} Pi</div>
        <button class="add-to-cart" onclick="addToCart(${product.id})">Add to Cart</button>
      </div>
    `;
    grid.appendChild(card);
  });
}

// Add to Cart
window.addToCart = function(id) {
  const product = products.find(p => p.id === id);
  if (product) {
    cart.push(product);
    updateCartUI();
    
    const toast = document.createElement('div');
    toast.style.cssText = 'position:fixed;bottom:20px;left:50%;transform:translateX(-50%);background:#8B4513;color:white;padding:12px 24px;border-radius:50px;z-index:3000;';
    toast.textContent = `${product.name} added!`;
    document.body.appendChild(toast);
    setTimeout(() => toast.remove(), 2000);
  }
};

// Update Cart
function updateCartUI() {
  document.getElementById('cart-count').textContent = cart.length;
  
  const container = document.getElementById('cart-items');
  container.innerHTML = '';
  let total = 0;

  cart.forEach((item, index) => {
    total += item.price;
    const div = document.createElement('div');
    div.className = 'cart-item';
    div.innerHTML = `
      <img src="${item.img}" style="width:70px;height:70px;object-fit:cover;border-radius:8px;">
      <div style="flex:1">
        <h4>${item.name}</h4>
        <p style="color:#8B4513;font-weight:600;">${item.price} Pi</p>
      </div>
      <button onclick="removeFromCart(${index})" style="background:none;border:none;color:#c00;font-size:1.6rem;cursor:pointer;">×</button>
    `;
    container.appendChild(div);
  });

  document.getElementById('cart-total').textContent = total.toFixed(2);
}

window.removeFromCart = function(index) {
  cart.splice(index, 1);
  updateCartUI();
};

// Checkout with Pending Status Logic
window.checkoutWithPi = async function() {
  if (!currentUser) return alert("Please login with Pi");
  if (cart.length === 0) return alert("Cart is empty");

  const total = cart.reduce((sum, item) => sum + item.price, 0);

  const paymentData = {
    amount: parseFloat(total.toFixed(2)),
    memo: `LATCINTL Order #${Date.now()}`,
    metadata: {
      items: cart.map(i => i.name),
      user: currentUser.username,
      initialStatus: "pending"
    }
  };

  try {
    await Pi.createPayment(paymentData, {
      onReadyForServerApproval: (paymentId) => {
        console.log("🔄 Payment awaiting approval:", paymentId);
        // Here you call your backend
      },
      onReadyForServerCompletion: async (paymentId, txid) => {
        // Save order with pending status
        const newOrder = {
          id: Date.now(),
          paymentId,
          txid,
          user: currentUser.username,
          items: [...cart],
          total: total,
          status: "pending",           // ← Pending by default
          date: new Date().toISOString()
        };
        
        orders.unshift(newOrder); // Add to demo orders list
        
        alert(`🎉 Payment Successful!\nOrder Status: PENDING\nTransaction: ${txid}`);
        
        cart = [];
        updateCartUI();
        toggleCart();
      },
      onCancel: () => alert("Payment was cancelled"),
      onError: (err) => alert("Payment error: " + err)
    });
  } catch (err) {
    console.error(err);
    alert("Failed to start payment");
  }
};

// Toggle Cart
window.toggleCart = function() {
  document.getElementById('cart-sidebar').classList.toggle('open');
};

// Filter Products
window.filterCategory = function(category) {
  // ... (existing filter logic)
  renderProducts(category === 'all' ? products : products.filter(p => p.category === category));
};

// Sample Products
const products = [
  { id: 1, name: "Royal Atamfa Fabric", category: "fabrics", price: 28, img: "https://picsum.photos/id/1015/600/600", description: "Premium handwoven" },
  { id: 2, name: "Men's Senator Agbada", category: "men", price: 65, img: "https://picsum.photos/id/1027/600/600", description: "Full luxury set" },
  { id: 3, name: "Elegant Lace Wrapper", category: "women", price: 45, img: "https://picsum.photos/id/1033/600/600", description: "Nigerian lace" },
  { id: 4, name: "Kids Traditional Set", category: "kids", price: 22, img: "https://picsum.photos/id/106/600/600", description: "Ceremony wear" },
];

// Initialize App
window.onload = () => {
  initPi();
  renderProducts(products);
};
