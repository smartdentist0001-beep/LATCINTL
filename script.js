let currentUser = null;
let cart = [];

// Initialize Pi SDK
async function initPi() {
  try {
    await Pi.init({ version: "2.0", sandbox: true }); // Set sandbox: false for Mainnet
    console.log("Pi SDK initialized");
  } catch (e) {
    console.error("Pi init failed", e);
  }
}

// Authenticate
document.getElementById('login-btn').addEventListener('click', async () => {
  const scopes = ['payments'];
  try {
    const auth = await Pi.authenticate(scopes, onIncompletePaymentFound);
    currentUser = auth.user;
    document.getElementById('user-info').innerHTML = `Hi, ${currentUser.username}!`;
    document.getElementById('login-btn').style.display = 'none';
    loadProducts();
  } catch (err) {
    console.error(err);
    alert("Authentication failed");
  }
});

function onIncompletePaymentFound(payment) {
  console.log("Incomplete payment found:", payment);
  // Handle incomplete payments (e.g., call your server to complete)
}

// Sample Products (expand with real data / database later)
const products = [
  { id: 1, name: "Premium Atamfa Fabric", category: "fabrics", price: 15, img: "https://via.placeholder.com/300x200?text=Atamfa" },
  { id: 2, name: "Men's Traditional Agbada", category: "men", price: 45, img: "https://via.placeholder.com/300x200?text=Agbada" },
  // Add more...
];

function loadProducts(category = 'all') {
  const container = document.getElementById('products');
  container.innerHTML = '<div class="product-grid"></div>';
  const grid = container.querySelector('.product-grid');

  products.filter(p => category === 'all' || p.category === category).forEach(product => {
    const card = document.createElement('div');
    card.className = 'product-card';
    card.innerHTML = `
      <img src="\( {product.img}" alt=" \){product.name}">
      <div class="product-info">
        <h3>${product.name}</h3>
        <p>${product.price} Pi</p>
        <button onclick="addToCart(${product.id})">Add to Cart</button>
      </div>
    `;
    grid.appendChild(card);
  });
}

function addToCart(id) {
  const product = products.find(p => p.id === id);
  cart.push(product);
  updateCart();
}

function updateCart() {
  document.getElementById('cart-count').textContent = cart.length;
  // Render cart items...
}

// Checkout with Pi Payment
document.getElementById('checkout-btn').addEventListener('click', async () => {
  if (!currentUser || cart.length === 0) return alert("Login or add items");

  const total = cart.reduce((sum, item) => sum + item.price, 0);

  const paymentData = {
    amount: total,
    memo: `LATCINTL Order #${Date.now()}`,
    metadata: {
      items: cart.map(item => item.name),
      userId: currentUser.uid
    }
  };

  try {
    const payment = await Pi.createPayment(paymentData, {
      onReadyForServerApproval: (paymentId) => {
        approvePaymentOnServer(paymentId, paymentData);
      },
      onReadyForServerCompletion: (paymentId, txid) => {
        completePaymentOnServer(paymentId, txid);
      },
      onCancel: () => alert("Payment cancelled"),
      onError: (err) => alert("Payment error: " + err)
    });

    console.log("Payment initiated", payment);
  } catch (err) {
    console.error(err);
  }
});

async function approvePaymentOnServer(paymentId, paymentData) {
  const res = await fetch('/api/approve-payment', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ paymentId, paymentData })
  });
  const data = await res.json();
  console.log("Server approval:", data);
}

async function completePaymentOnServer(paymentId, txid) {
  const res = await fetch('/api/complete-payment', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ paymentId, txid })
  });
  const data = await res.json();
  if (data.success) {
    alert("Payment successful! Thank you.");
    cart = [];
    updateCart();
  }
}

// Init
initPi();
loadProducts();
