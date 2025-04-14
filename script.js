// -----------------------------------Variables-------------------------------

let cart = [];
const now = new Date();
const dateString = now.toISOString().split('T')[0]; 
const timeString = now.toLocaleTimeString("tr-TR");
const orderId = "ORDER" + now.getTime(); 
const cartElement = document.getElementById("cart");
const formElement = document.getElementById("order-form");
let productToDelete = null;
let editingProduct = null;
let products = JSON.parse(localStorage.getItem("products")) || [
  {
    name: "Pizza",
    price: 80,
    image: "/images/pizza.avif",
    category: "Meal",
  },
  {
    name: "Hamburger",
    price: 60,
    image: "/images/hamburger.jpg",
    category: "Meal",
  },
  {
    name: "Fanta",
    price: 20,
    image: "/images/fanta.jpg",
    category: "Drinks",
  },
];
// -----------------------------------Variables End-------------------------------



// -----------------------------------Edit Product-------------------------------

function editProduct(name) {
  const product = products.find((p) => p.name === name);
  if (!product) return;

  editingProduct = name;

  document.getElementById("new-name").value = product.name;
  document.getElementById("new-price").value = product.price;
  document.getElementById("new-image").value = product.image;
  document.getElementById("new-category").value = product.category || "";

  document.querySelector("#add-product-form button").textContent =
    "Save Changing";

  openProductModal(true);
}
// -----------------------------------Edit Product End-------------------------------



// -----------------------------------Render Products-------------------------------

function renderProducts() {
  const filter = document.getElementById("category-filter")?.value || "";
  const container = document.getElementById("products-container");
  container.innerHTML = "";
  const filtered = filter
    ? products.filter((p) => p.category === filter)
    : products;
  filtered.forEach((product) => {
    container.innerHTML += `
        <div class="product">
          <img src="${product.image}" alt="${product.name}">
          <h2>${product.name}</h2>
          <p>$${product.price}</p>
          <button onclick="addToCart('${product.name}', ${product.price}, '${product.image}')">
            Add To Cart
          </button>
          <button onclick="editProduct('${product.name}')">Update</button>
          <button onclick="deleteProduct('${product.name}')">Delete</button>
        </div>
      `;
  });
}

// -----------------------------------Render Products End-------------------------------


// -----------------------------------Window Load-------------------------------

window.onload = function () {
  const savedCart = localStorage.getItem("cart");
  if (savedCart) {
    cart = JSON.parse(savedCart);
    updateCartDisplay();
  }
  renderProducts(); 
  renderCategorySelects();
  if (cart.length === 0) {
    cartElement.innerHTML = "<li>Cart is empty.</li>";
    formElement.style.display = "none"; // 👈 formu gizle
  }
};

// -----------------------------------Window Load End-------------------------------



// ----------------------------Save Cart To Local Storage-------------------------------
function saveCartToStorage() {
  localStorage.setItem("cart", JSON.stringify(cart));
}
// ----------------------------Save Cart To Local Storage End-------------------------------



// -----------------------------------Add To Cart-------------------------------

function addToCart(product, price, image) {
  const existingItem = cart.find((item) => item.product === product);
  if (existingItem) {
    existingItem.quantity += 1;
    existingItem.total = existingItem.quantity * price;
  } else {
    cart.push({
      product,
      price,
      image: image,
      quantity: 1,
      total: price,
    });
  }
  updateCartDisplay();
  saveCartToStorage();
}
// -----------------------------------Add To Cart End-------------------------------


// -----------------------------------Increase and Decrease Quantity-------------------------------

function increaseQuantity(product) {
  const item = cart.find((item) => item.product === product);
  if (item) {
    item.quantity += 1;
    item.total = item.quantity * item.price;
    updateCartDisplay();
    saveCartToStorage();
  }
}

function decreaseQuantity(product) {
  const item = cart.find((item) => item.product === product);
  if (item) {
    item.quantity -= 1;
    if (item.quantity <= 0) {
      cart = cart.filter((i) => i.product !== product);
    } else {
      item.total = item.quantity * item.price;
    }
    updateCartDisplay();
    saveCartToStorage();
  }
}
// -----------------------------------Increase and Decrease Quantity End-------------------------------


// -----------------------------------Update Cart-------------------------------

function updateCartDisplay() {
  cartElement.innerHTML = "";

  if (cart.length === 0) {
    cartElement.innerHTML = "<li>Cart is empty.</li>";
    formElement.style.display = "none"; // 👈 formu gizle
    return;
  }

  cart.forEach((item) => {
    cartElement.innerHTML += `
      <li class="cart-item">
      <img src="${item.image}" alt="${item.product}" class="cart-thumb">
        <span class="item-name">${item.product}</span>
        <span class="item-qty">${item.quantity} pcs - $${item.total} </span>
        <span class="item-buttons">
          <button onclick="increaseQuantity('${item.product}')">+</button>
          <button onclick="decreaseQuantity('${item.product}')">−</button>
        </span>
      </li>
    `;
  });
  formElement.style.display = "flex";
}

// -----------------------------------Update Cart End-------------------------------


// -----------------------------------Order Submit-------------------------------

document.getElementById("order-form").addEventListener("submit", function (e) {
  e.preventDefault();

  if (cart.length === 0) {
    alert("Sepet boş!");
    return;
  }

  const name = document.getElementById("name").value.trim();
  const address = document.getElementById("address").value.trim();
  const phone = document.getElementById("phone").value.trim();

  if (!name || !address || !phone) {
    alert("Please enter all fields!");
    return;
  }

  const total = cart.reduce((sum, item) => sum + item.total, 0);

  let orderHTML = `
  <p><strong>Order No:</strong> ${orderId}</p>
  <p><strong>Date:</strong> ${dateString} - ${timeString}</p>
  <p><strong>Name:</strong> ${name}</p>
  <p><strong>Address:</strong> ${address}</p>
  <p><strong>Telephone Number:</strong> ${phone}</p>
  <hr>
  <h4>Order:</h4>
  <div style="text-align:left;">`;

  cart.forEach((item) => {
    orderHTML += `<div style="display:flex; align-items:center; gap:10px; margin-bottom:10px;">
      <img src="${item.image}" alt="${item.product}" width="60" height="45" style="border-radius:6px;">
      <div>
        <strong>${item.product}</strong><br>
        ${item.quantity} piece(s) - $${item.total}
      </div>
    </div>`;
  });

  orderHTML += `</ul><hr><p><strong>Total:</strong> $${total}</p>`;

  document.getElementById("order-summary").innerHTML = orderHTML;
  document.getElementById("order-modal").style.display = "block";

  const orderRecord = {
    id: orderId,
    date: dateString,
    time: timeString,
    name,
    address,
    phone,
    items: cart,
  };

  let orderHistory = JSON.parse(localStorage.getItem("orders") || "[]");
  orderHistory.push(orderRecord);
  localStorage.setItem("orders", JSON.stringify(orderHistory));
});


// Close Order Summary Modal
function closeOrderSummaryModal() {
  document.getElementById("order-modal").style.display = "none";
  cart = [];
  localStorage.removeItem("cart");
  updateCartDisplay();
  document.getElementById("order-form").reset();
}
// -----------------------------------Order Submit End-------------------------------


// -----------------------------------Add new Product-------------------------------

document
  .getElementById("add-product-form")
  .addEventListener("submit", function (e) {
    e.preventDefault();

    const name = document.getElementById("new-name").value.trim();
    const price = parseFloat(document.getElementById("new-price").value);
    const image = document.getElementById("new-image").value.trim();
    const category = document.getElementById("new-category").value.trim();

    if (!name || !price || !image || !category) {
      showToast("Please enter all field.")
    }else{
      if (editingProduct) {
        
        const product = products.find((p) => p.name === editingProduct);
        if (product) {
          product.name = name;
          product.price = price;
          product.image = image;
          product.category = category;
        }
        editingProduct = null;
        document.querySelector("#add-product-form button").textContent =
          "Add Product";
        closeModal('product-modal');
          this.reset();
      } else {
       
        products.push({ name, price, image, category });
        showToast("Product added successfully ");
        
    this.reset();
    closeModal('product-modal');
      }
    }

    
    localStorage.setItem("products", JSON.stringify(products)); 
    renderProducts(); 
    renderCategorySelects();

   
  });

  // -----------------------------------Add new Product End-------------------------------


// -----------------------------------Print-------------------------------

// Printer
function printReceipt() {
  const printContent = document.getElementById("order-summary").innerHTML;

  const printWindow = window.open("", "", "width=600,height=600");
  printWindow.document.write(`
      <html>
        <head>
          <title>Printable Order Slip</title>
          <style>
            body { font-family: Arial, sans-serif; padding: 20px; }
            h2 { text-align: center; }
            ul { padding-left: 20px; }
            p, li { font-size: 14px; margin: 6px 0; }
          </style>
        </head>
        <body>
          <h2>🧾 Order Slip</h2>
          ${printContent}
        </body>
      </html>
    `);
  printWindow.document.close();
  printWindow.focus();
  printWindow.print();
  printWindow.close();
}


// -----------------------------------Print End-------------------------------


// -----------------------------------Delete Product-------------------------------

function deleteProduct(name) {
  productToDelete = name;
  document.getElementById(
    "delete-text"
  ).textContent = `Do you want the product named "${name}"?`;
  document.getElementById("delete-modal").style.display = "block";
}

function openProductModal(isEdit = false) {
  document.getElementById("product-modal").style.display = "block";
  document.getElementById("add-product-modal-title").textContent = isEdit
    ? "Update Product"
    : "Add New Product";
}

function closeProductModal() {
  document.getElementById("product-modal").style.display = "none";
  document.getElementById("add-product-form").reset();
  editingProduct = null;
  
}

function confirmDelete() {
  if (productToDelete) {
    products = products.filter((p) => p.name !== productToDelete);
    localStorage.setItem("products", JSON.stringify(products));
    renderProducts();
    renderCategorySelects();
  }
  closeDeleteModal();
}

function cancelDelete() {
  closeDeleteModal();
}

function closeDeleteModal() {
  document.getElementById("delete-modal").style.display = "none";
  productToDelete = null;
}
// -----------------------------------Delete Product End-------------------------------


// -----------------------------------Categories-------------------------------

// Get Categories
function getUniqueCategories() {
  const allCategories = products
    .map((p) => p.category || "")
    .filter((c) => c.trim() !== "");
  return [...new Set(allCategories)];
}

// Render Category List
function renderCategorySelects() {
  const categories = getUniqueCategories();

  // Category in Prduct Add Form
  const catSelect = document.getElementById("new-category");
  catSelect.innerHTML = categories
    .map((c) => `<option value="${c}">${c}</option>`)
    .join("");

  // Category List
  const filterSelect = document.getElementById("category-filter");
  const current = filterSelect.value; 
  filterSelect.innerHTML =
    `<option value="">All Categories</option>` +
    categories.map((c) => `<option value="${c}">${c}</option>`).join("");
  filterSelect.value = current;
}

// -----------------------------------Categories End-------------------------------


// -----------------------------------Render Order History-------------------------------
function renderOrderHistoryModal() {
  
  const allOrders = JSON.parse(localStorage.getItem('orders') || '[]');
  const query = document.getElementById('order-search')?.value.toLowerCase() || '';
  const start = document.getElementById('date-start')?.value;
  const end = document.getElementById('date-end')?.value;
  const orders = allOrders.filter(order =>
  {
    const matchesText =order.name.toLowerCase().includes(query) || order.phone.includes(query);

    const orderDate = order.date ? new Date(order.date) : null;

    const afterStart = start ? (orderDate && orderDate >= new Date(start)) : true;
    const beforeEnd = end ? (orderDate && orderDate <= new Date(end)) : true;
    

    return matchesText && afterStart && beforeEnd;
  }
  );
  const container = document.getElementById("order-history-content");
  if (orders.length === 0) {
    container.innerHTML = "<p>No past orders found.</p>";
    return;
  }
  container.innerHTML = `
  <div style="margin-bottom: 10px;">
  <input type="checkbox" id="select-all-orders" onchange="toggleAllOrders(this)">
  <label for="select-all-orders">Select All</label>
  <button onclick="deletSelectedOrders()">Delete Selected</button>
</div>
`;
  container.innerHTML += orders
    .map((order) => {
      const totalAmount = order.items.reduce(
        (sum, item) => sum + item.total,
        0
      );
      const itemList = order.items
        .map(
          (item) =>
            `<li>
        <img src="${item.image}" width="40" style="vertical-align:middle; margin-right:8px; border-radius:4px;">
        ${item.product} (${item.quantity} pcs - $${item.total})
      </li>`
        )
        .join("");
      const total = order.items.reduce((sum, i) => sum + i.total, 0);

      return `
        <div class="history-cart">
        <input type="checkbox" class="order-checkbox" data-id="${order.id}">
          <h4>${order.id}</h4>
          <p><strong>${order.date} ${order.time}</strong></p>
          <p>${order.name} - ${order.phone}</p>
          <ul>${itemList}</ul>
          <p><strong>Toplam:</strong> $${totalAmount} </p>
          </div>
          
      `;
    })
    .reverse()
    .join("");

  const grandTotal = orders.reduce((sum, order) => {
    return sum + order.items.reduce((s, item) => s + item.total, 0);
  }, 0);

  container.innerHTML += `
        <div class="history-total">
          <strong>Grand Total:</strong> $${grandTotal} 
        </div>
      `;
}
// -----------------------------------Render Order History End-------------------------------



// -----------------------------------DELETE ORDERS-------------------------------

function toggleAllOrders(masterCheckbox) {
  const checkboxes = document.querySelectorAll(".order-checkbox");
  checkboxes.forEach((cb) => (cb.checked = masterCheckbox.checked));
}

function deletSelectedOrders() {
  const selectedIds = Array.from(document.querySelectorAll(".order-checkbox"))
    .filter((cb) => cb.checked)
    .map((cb) => cb.dataset.id);

    if (!confirm("Are you sure?")){
      return;
    }else{
      let orders = JSON.parse(localStorage.getItem('orders') || '[]');
    let trash = JSON.parse(localStorage.getItem('orderTrash') || '[]');
  
    const toTrash = orders.filter(o => selectedIds.includes(o.id));
    trash = trash.concat(toTrash);
  
    orders = orders.filter(o => !selectedIds.includes(o.id));
  
    localStorage.setItem('orders', JSON.stringify(orders));
    localStorage.setItem('orderTrash', JSON.stringify(trash));
  
    renderOrderHistoryModal();
    showToast("Order deleted successfully")
    }

    

}

// -----------------------------------DELETE ORDERS END-------------------------------



// -----------------------------------TRASH-------------------------------

  function renderTrash() {
    const trash = JSON.parse(localStorage.getItem('orderTrash') || '[]');
    const container = document.getElementById('trash-content');
    console.log("Trash")
    if (trash.length === 0) {
      container.innerHTML = "<p>Trash is empty.</p>";
      return;
    }
  
    container.innerHTML = trash.map(order => `
      <div style="border: 1px solid #ddd; padding: 10px; margin-bottom: 10px;">
        <strong>${order.id}</strong> - ${order.name} - ${order.phone}
        <div class="trash-buttons">
            <button onclick="restoreOrder('${order.id}')">Restore</button>
        <button onclick="deleteOrderPermanently('${order.id}')">Delete Forever</button>
        </div>
      </div>
    `).join('');
  }
  
  function openTrashModal() {
    document.getElementById('trash-modal').style.display = 'block';
    renderTrash();
  }
  function restoreOrder(id) {
    let trash = JSON.parse(localStorage.getItem('orderTrash') || '[]');
    let orders = JSON.parse(localStorage.getItem('orders') || '[]');
  
    const restored = trash.find(o => o.id === id);
    if (!restored) return;
  
    orders.push(restored);
    trash = trash.filter(o => o.id !== id);
  
    localStorage.setItem('orders', JSON.stringify(orders));
    localStorage.setItem('orderTrash', JSON.stringify(trash));
  
    renderTrash();
    renderOrderHistoryModal();
    showToast("Order restored successfully")
  }
  
  function deleteOrderPermanently(id) {
    let trash = JSON.parse(localStorage.getItem('orderTrash') || '[]');
    trash = trash.filter(o => o.id !== id);
    localStorage.setItem('orderTrash', JSON.stringify(trash));
    renderTrash();
    showToast("Order deleted permanently!");

  }
// -----------------------------------TRASH END-------------------------------

//   -------------------------------Modal Open and Close-----------------------------------
  function openModal(id) {
    const el = document.getElementById(id);
    if (el) el.style.display = 'block';
  }
  
  function closeModal(id) {
    const el = document.getElementById(id);
    if (el) el.style.display = 'none';
  }
//   -------------------------------Modal Open and Close End-----------------------------------


//   -------------------------------Show Toast-----------------------------------
  
  function showToast(message) {
    const toastContainer = document.getElementById("toast-container");
    const toast = document.createElement("div");
    toast.className = "toast";
    toast.innerText = message;
  
    toastContainer.appendChild(toast);
  
    setTimeout(() => {
      toast.remove();
    }, 4000); 
  }
  
//   -------------------------------Show Toast End-----------------------------------
