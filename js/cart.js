// js/cart.js

document.addEventListener('DOMContentLoaded', () => {
  const CART_KEY = 'thriftkids_cart';
  const badgeEl  = document.getElementById('cart-count');
  const addBtns  = document.querySelectorAll('.add-cart-btn');

  // ── Helpers ───────────────────────────────────────────────────────────────
  function getCart() {
    return JSON.parse(localStorage.getItem(CART_KEY) || '{}');
  }
  function saveCart(cart) {
    localStorage.setItem(CART_KEY, JSON.stringify(cart));
  }
  function updateBadge() {
    const cart     = getCart();
    const totalQty = Object.values(cart).reduce((sum, q) => sum + q, 0);
    if (badgeEl) badgeEl.textContent = totalQty;
  }

  // ── Initial badge & disable existing Add buttons ──────────────────────────
  updateBadge();
  const currentCart = getCart();
  addBtns.forEach(btn => {
    const id = btn.dataset.id;
    if (currentCart[id] > 0) {
      btn.textContent = 'In Cart';
      btn.disabled    = true;
    }
  });

  // ── Add to Cart click handlers ────────────────────────────────────────────
  addBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      const id = btn.dataset.id;
      const qtyInput = btn.parentElement.querySelector('.qty-input');
      const qty      = qtyInput ? parseInt(qtyInput.value, 10) : 1;

      const cart = getCart();
      cart[id] = (cart[id] || 0) + qty;
      saveCart(cart);

      updateBadge();
      btn.textContent = 'In Cart';
      btn.disabled    = true;
    });
  });

  // ── If on cart page, prune & render ───────────────────────────────────────
  if (document.body.classList.contains('cart-page')) {
    // Prune any IDs not in productData
    let cart = getCart();
    Object.keys(cart).forEach(id => {
      if (!window.productData || !window.productData[id]) {
        delete cart[id];
      }
    });
    saveCart(cart);

    renderCartPage();
  }
});


// ── Cart Page Renderer & Remove Logic ───────────────────────────────────────
function renderCartPage() {
  const CART_KEY  = 'thriftkids_cart';
  const cart      = JSON.parse(localStorage.getItem(CART_KEY) || '{}');
  const tableBody = document.querySelector('#cart-table tbody');
  const totalCell = document.getElementById('cart-total');
  const badgeEl   = document.getElementById('cart-count');

  if (!window.productData) {
    console.error('productData is missing on cart.html');
    return;
  }

  // Clear existing rows
  tableBody.innerHTML = '';
  let grandTotal = 0;

  // Build rows
  Object.entries(cart).forEach(([id, qty]) => {
    const info = window.productData[id];
    if (!info) return;

    const subtotal = info.price * qty;
    grandTotal += subtotal;

    const row = document.createElement('tr');
    row.innerHTML = `
      <td>
        <a href="${info.url}">
          <img src="${info.img}" alt="${info.name}"
               style="width:50px; vertical-align:middle; margin-right:8px;">
          ${info.name}
        </a>
      </td>
      <td style="text-align:center">${info.price}</td>
      <td style="text-align:center">${qty}</td>
      <td style="text-align:center">${subtotal}</td>
      <td style="text-align:center">
        <button class="remove-btn" data-id="${id}">Remove</button>
      </td>
    `;
    tableBody.appendChild(row);
  });

  // Update totals & badge
  totalCell.textContent = grandTotal;
  const totalQty = Object.values(cart).reduce((sum, q) => sum + q, 0);
  if (badgeEl) badgeEl.textContent = totalQty;

  // Wire up Remove buttons
  document.querySelectorAll('.remove-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const id = btn.dataset.id;
      const cart = JSON.parse(localStorage.getItem(CART_KEY) || '{}');
      delete cart[id];
      localStorage.setItem(CART_KEY, JSON.stringify(cart));
      // Re-render table and update badge
      renderCartPage();
    });
  });
}
// Proceed to Checkout button functionality
const checkoutBtn = document.getElementById('checkout-btn');
if (checkoutBtn) {
  checkoutBtn.addEventListener('click', () => {
    window.location.href = 'checkout.html';
  });
}

// js/checkout.js
document.addEventListener('DOMContentLoaded', () => {
  const CART_KEY = 'thriftkids_cart';
  const summaryTbody = document.querySelector('#summary-table tbody');
  const summaryTotal = document.getElementById('summary-total');
  const form         = document.getElementById('checkout-form');
  const thankYou     = document.getElementById('thank-you');

  // 1️⃣ Build the summary
  const cart = JSON.parse(localStorage.getItem(CART_KEY) || '{}');
  let total = 0;
  Object.entries(cart).forEach(([id, qty]) => {
    const info = window.productData[id];
    if (!info) return;
    const sub = info.price * qty;
    total += sub;
    const row = document.createElement('tr');
    row.innerHTML = `
      <td>${info.name}</td>
      <td style="text-align:center">${qty}</td>
      <td style="text-align:right">${sub}</td>
    `;
    summaryTbody.appendChild(row);
  });
  summaryTotal.textContent = total;

  // 2️⃣ On form submit
  form.addEventListener('submit', e => {
    e.preventDefault();
    // simple validation
    if (!form.checkValidity()) {
      form.reportValidity();
      return;
    }
    // “process” order: clear cart
    localStorage.removeItem(CART_KEY);
    // hide form & summary, show thank you
    document.querySelector('.order-summary').style.display = 'none';
    form.style.display = 'none';
    thankYou.style.display = 'block';
    // update badge
    const badgeEl = document.getElementById('cart-count');
    if (badgeEl) badgeEl.textContent = '0';
  });
});
