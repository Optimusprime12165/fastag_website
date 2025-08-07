// Cart functionality
class CartManager {
  constructor() {
    this.cart = this.loadCart()
    this.promoCode = ""
    this.promoDiscount = 0
    this.freeShippingThreshold = 1000
    this.shippingCost = 50

    this.init()
  }

  init() {
    this.renderCart()
    this.setupEventListeners()
    this.updateCartCount()
    this.loadRecommendedProducts()
  }

  loadCart() {
  const cart = JSON.parse(localStorage.getItem("cart") || "[]");
  this.promoCode = localStorage.getItem("promoCode") || "";
  this.promoDiscount = parseInt(localStorage.getItem("promoDiscount") || "0");
  return cart;
}


    saveCart() {
  localStorage.setItem("cart", JSON.stringify(this.cart));
  localStorage.setItem("promoCode", this.promoCode);             
  localStorage.setItem("promoDiscount", this.promoDiscount);   
  this.updateCartCount();
}

  setupEventListeners() {
    // Clear cart button
    const clearCartBtn = document.getElementById("clearCartBtn")
    if (clearCartBtn) {
      clearCartBtn.addEventListener("click", () => this.clearCart())
    }

    // Promo code
    const applyPromoBtn = document.getElementById("applyPromoBtn")
    const promoCodeInput = document.getElementById("promoCode")

    if (applyPromoBtn && promoCodeInput) {
      applyPromoBtn.addEventListener("click", () => this.applyPromoCode())
      promoCodeInput.addEventListener("keypress", (e) => {
        if (e.key === "Enter") {
          this.applyPromoCode()
        }
      })
    }

    // Checkout button
    const checkoutBtn = document.getElementById("checkoutBtn")
    if (checkoutBtn) {
      checkoutBtn.addEventListener("click", () => this.proceedToCheckout())
    }

    // Delivery check
    const checkDeliveryBtn = document.getElementById("checkDeliveryBtn")
    const pincodeInput = document.getElementById("pincode")

    if (checkDeliveryBtn && pincodeInput) {
      checkDeliveryBtn.addEventListener("click", () => this.checkDelivery())
      pincodeInput.addEventListener("keypress", (e) => {
        if (e.key === "Enter") {
          this.checkDelivery()
        }
      })

      document.getElementById("add-address-btn").addEventListener("click", function () {
  const houseNo = document.getElementById("cart-house-no").value.trim();
  const landmark = document.getElementById("cart-landmark").value.trim();
  const city = document.getElementById("cart-city").value.trim();
  const pincode = document.getElementById("cart-pincode").value.trim();

  if (!houseNo || !landmark || !city || !pincode) {
    alert("Please fill in all address fields.");
    return;
  }

  // Create address object
  const address = {
    houseNo,
    landmark,
    city,
    pincode,
  };
  // Save to backend using AJAX
  fetch("save_address.php", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(address),
  })
    .then(res => res.json())
    .then(data => {
      if (data.success) {
        alert("Address saved!");
        loadSavedAddresses(); // refresh address list
      } else {
        alert("Error saving address.");
      }
    });
});
    function loadSavedAddresses() {
  fetch("get_addresses.php")
    .then(res => res.json())
    .then(addresses => {
      const container = document.getElementById("saved-addresses");
      container.innerHTML = "";

      if (addresses.length === 0) {
        container.innerHTML = "<p>No saved addresses yet.</p>";
        return;
      }

      addresses.forEach((addr, index) => {
        const div = document.createElement("div");
        div.classList.add("saved-address");
        div.innerHTML = `
          <input type="radio" name="selectedAddress" value="${index}" id="addr${index}">
          <label for="addr${index}">
            ${addr.house_no}, ${addr.landmark}, ${addr.city} - ${addr.pincode}
          </label>
        `;
        container.appendChild(div);
      });
    });
}

window.addEventListener("load", loadSavedAddresses);
    }
  }

  renderCart() {
    const emptyCart = document.getElementById("emptyCart")
    const cartContent = document.getElementById("cartContent")
    const itemsList = document.getElementById("itemsList")
    const itemCount = document.getElementById("itemCount")

    if (this.cart.length === 0) {
      emptyCart.style.display = "flex"
      cartContent.style.display = "none"
      return
    }
    
    // show cart content
    emptyCart.style.display = "none"
    cartContent.style.display = "block"
    
    // Update item count
    const totalItems = this.cart.reduce((sum, item) => sum + item.quantity, 0)
    itemCount.textContent = totalItems

    // Render cart items
    itemsList.innerHTML = ""
    this.cart.forEach((item, index) => {
      const itemElement = this.createCartItemElement(item, index)
      itemsList.appendChild(itemElement)
    })

    // Update order summary
    this.updateOrderSummary()
  }

  createCartItemElement(item, index) {
    const itemDiv = document.createElement("div")
    itemDiv.className = "cart-item"
    itemDiv.innerHTML = `
            <div class="item-image">
                ${item.bank}
            </div>
            <div class="item-details">
                <div class="item-name">${item.name}</div>
                <div class="item-badges">
                    <span class="item-badge bank">${item.bank}</span>
                    <span class="item-badge category">${item.category}</span>
                </div>
               <div class="item-price">₹${(typeof item.price === 'number' ? item.price : 0).toLocaleString()} </div>
                <div class="item-specs">
                    Validity: 5 years • Activation: Within 24 hours
                </div>
            </div> 
            
            <div class="item-actions">
                <div class="quantity-controls">
<button class="quantity-btn decrease-btn" data-index="${index}" ${item.quantity <= 1 ? "disabled" : ""}>
            <i class="fas fa-minus"></i>
          </button>
          <span class="quantity-display">${item.quantity}</span>
          <button class="quantity-btn increase-btn" data-index="${index}">
            <i class="fas fa-plus"></i>
          </button>
        </div>
        <button class="remove-btn" data-index="${index}" title="Remove item">
          <i class="fas fa-trash"></i>
        </button>
      </div>
    `;

    // Add event listeners instead of inline onclick
    this.attachItemEventListeners(itemDiv, index);
    
    return itemDiv;
  }

  attachItemEventListeners(itemDiv, index) {
    const decreaseBtn = itemDiv.querySelector('.decrease-btn');
    const increaseBtn = itemDiv.querySelector('.increase-btn');
    const removeBtn = itemDiv.querySelector('.remove-btn');

    decreaseBtn.addEventListener('click', (e) => {
      e.preventDefault();
      this.updateQuantity(index, this.cart[index].quantity - 1);
    });

    increaseBtn.addEventListener('click', (e) => {
      e.preventDefault();
      this.updateQuantity(index, this.cart[index].quantity + 1);
    });

    removeBtn.addEventListener('click', (e) => {
      e.preventDefault();
      this.removeItem(index);
    });
  }

  updateQuantity(index, newQuantity) {
    if (index < 0 || index >= this.cart.length) {
      console.error('Invalid cart index:', index);
      return;
    }

    if (newQuantity <= 0) {
      this.removeItem(index)
      return
    }

    this.cart[index].quantity = newQuantity
    this.saveCart()
    this.renderCart()

    this.showNotification(`Quantity updated to ${newQuantity}`, "success")
  }

  removeItem(index) {
    const item = this.cart[index]
    this.cart.splice(index, 1)
    this.saveCart()
    this.renderCart()

    this.showNotification(`${item.bank} FASTag - ${item.name} removed from cart`, "info")
  }

  clearCart() {
    if (this.cart.length === 0) return

    if (confirm("Are you sure you want to clear your cart?")) {
      this.cart = []
      this.promoCode = ""
      this.promoDiscount = 0
      this.saveCart()
      this.renderCart()

      // Clear promo code input
      const promoCodeInput = document.getElementById("promoCode")
      if (promoCodeInput) {
        promoCodeInput.value = ""
      }

      this.showNotification("Cart cleared successfully", "info")
    }
  }

  updateOrderSummary() {
    
    const subtotal = this.cart.reduce((sum, item) => sum + item.price * item.quantity, 0)
    const shipping = subtotal >= this.freeShippingThreshold ? 0 : this.shippingCost
    const discount = this.promoDiscount
    const total = subtotal + shipping - discount

    // Update DOM elements
    document.getElementById("subtotal").textContent = `₹${subtotal.toLocaleString()}`
    document.getElementById("shipping").textContent = shipping === 0 ? "Free" : `₹${shipping}`
    document.getElementById("discount").textContent = `-₹${discount.toLocaleString()}`
    document.getElementById("total").textContent = `₹${total.toLocaleString()}`

    // Show/hide discount row
    const discountRow = document.getElementById("discountRow")
    if (discount > 0) {
      discountRow.style.display = "flex"
    } else {
      discountRow.style.display = "none"
    }

    // Update shipping info
    const shippingInfo = document.getElementById("shippingInfo")
    const freeShippingAmount = document.getElementById("freeShippingAmount")

    if (subtotal < this.freeShippingThreshold) {
      const remaining = this.freeShippingThreshold - subtotal
      freeShippingAmount.textContent = remaining.toLocaleString()
      shippingInfo.style.display = "block"
    } else {
      shippingInfo.style.display = "none"
    }

    // Enable/disable checkout button
    const checkoutBtn = document.getElementById("checkoutBtn")
    if (checkoutBtn) {
      checkoutBtn.disabled = this.cart.length === 0
    }
  }

  applyPromoCode() {
    const promoCodeInput = document.getElementById("promoCode")
    const promoMessage = document.getElementById("promoMessage")
    const code = promoCodeInput.value.trim().toUpperCase()

    if (!code) {
      this.showPromoMessage("Please enter a promo code", "error")
      return
    }

    // Simulate promo code validation
    const validCodes = {
      SAVE10: { discount: 0.1, type: "percentage", message: "10% discount applied!" },
      FLAT50: { discount: 50, type: "fixed", message: "₹50 discount applied!" },
      WELCOME: { discount: 0.05, type: "percentage", message: "5% welcome discount applied!" },
      FASTAG20: { discount: 20, type: "fixed", message: "₹20 discount applied!" },
    }

    if (validCodes[code]) {
      const promo = validCodes[code]
      const subtotal = this.cart.reduce((sum, item) => sum + item.price * item.quantity, 0)

      if (promo.type === "percentage") {
        this.promoDiscount = Math.round(subtotal * promo.discount)
      } else {
        this.promoDiscount = promo.discount
      }

      this.promoCode = code
      this.showPromoMessage(promo.message, "success")
      this.updateOrderSummary()

      // Disable the input and button
      promoCodeInput.disabled = true
      document.getElementById("applyPromoBtn").textContent = "Applied"
      document.getElementById("applyPromoBtn").disabled = true
    } else {
      this.showPromoMessage("Invalid promo code", "error")
    }
  }

  showPromoMessage(message, type) {
    const promoMessage = document.getElementById("promoMessage")
    promoMessage.textContent = message
    promoMessage.className = `promo-message ${type}`

    // Clear message after 5 seconds
    setTimeout(() => {
      promoMessage.textContent = ""
      promoMessage.className = "promo-message"
    }, 5000)
  }

  checkDelivery() {
    const pincodeInput = document.getElementById("pincode")
    const pincode = pincodeInput.value.trim()

    if (!pincode || pincode.length !== 6) {
      this.showNotification("Please enter a valid 6-digit pincode", "error")
      return
    }

    // Simulate delivery check
    const checkDeliveryBtn = document.getElementById("checkDeliveryBtn")
    const originalText = checkDeliveryBtn.textContent

    checkDeliveryBtn.textContent = "Checking..."
    checkDeliveryBtn.disabled = true

    setTimeout(() => {
      // Simulate different delivery options based on pincode
      const deliveryAvailable = !["000000", "999999"].includes(pincode)

      if (deliveryAvailable) {
        this.showNotification(`Delivery available to ${pincode}`, "success")

        // Show delivery options
        const deliveryOptions = document.getElementById("deliveryOptions")
        deliveryOptions.style.display = "block"
      } else {
        this.showNotification(`Sorry, delivery not available to ${pincode}`, "error")
      }

      checkDeliveryBtn.textContent = originalText
      checkDeliveryBtn.disabled = false
    }, 1500)
  }

  proceedToCheckout() {
    if (this.cart.length === 0) {
      this.showNotification("Your cart is empty", "error")
      return
    }

    // Simulate checkout process
    const checkoutBtn = document.getElementById("checkoutBtn")
    const originalText = checkoutBtn.innerHTML

    checkoutBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Processing...'
    checkoutBtn.disabled = true

    setTimeout(() => {
      // For demo purposes, show success message
      this.showNotification("Redirecting to payment gateway...", "success")

      // In a real application, you would redirect to payment page
      // window.location.href = 'checkout.html';

      checkoutBtn.innerHTML = originalText
      checkoutBtn.disabled = false
    }, 2000)
  }

  loadRecommendedProducts() {
    const recommendedGrid = document.getElementById("recommendedGrid")
    const recommendedSection = document.getElementById("recommendedSection")

    if (!recommendedGrid || this.cart.length === 0) {
      if (recommendedSection) {
        recommendedSection.style.display = "flex"
      }
      return
    }

    // Sample recommended products
    const recommendations = [
      { name: "Bajaj FASTag - VC6", price: 400, category: "VC6", bank: "Bajaj" },
      { name: "IDFC FASTag - VC12", price: 400, category: "VC12", bank: "IDFC" },
    ]

    recommendedGrid.innerHTML = ""
    recommendations.forEach((product, index) => {
      const productElement = this.createRecommendedProductElement(product, index)
      recommendedGrid.appendChild(productElement)
    })
  }

  createRecommendedProductElement(product, index) {
    const productDiv = document.createElement("div")
    productDiv.className = "recommended-item"
    productDiv.innerHTML = `
            <div class="recommended-item-image">
                ${product.bank}
            </div>
            <h3>${product.name}</h3>
            <span class="category">${product.category}</span>
            <div class="price">₹${product.price.toLocaleString()}</div>
            <button class="add-recommended-btn" onclick="cartManager.addRecommendedToCart(${index})">
                Add to Cart
            </button>
        `
    return productDiv
  }

  addRecommendedToCart(index) {
    const recommendations = [
      {
        id: "bajaj-vc6",
        name: "Bus/Truck",
        price: 400,
        category: "VC6",
        bank: "Bajaj",
        description: "For buses and trucks (2 axle)",
      },
      {
        id: "idfc-vc12",
        name: "Mini Bus",
        price: 500,
        category: "VC12",
        bank: "IDFC",
        description: "Mini bus and small commercial vehicles",
      },
    ]

    const product = recommendations[index]

    // Check if product already exists in cart
    const existingItem = this.cart.find((item) => item.id === product.id)

    if (existingItem) {
      existingItem.quantity += 1
    } else {
      this.cart.push({
        ...product,
        quantity: 1,
        addedAt: new Date().toISOString(),
      })
    }

    this.saveCart()
    this.renderCart()
    this.showNotification(`${product.name} added to cart!`, "success")
  }

  updateCartCount() {
    const totalItems = this.cart.reduce((sum, item) => sum + item.quantity, 0)
    const cartCountElement = document.querySelector(".cart-count")

    if (cartCountElement) {
      cartCountElement.textContent = totalItems
      cartCountElement.style.display = totalItems > 0 ? "flex" : "none"
    }
  }

  showNotification(message, type = "info") {
    const notification = document.createElement("div")
    notification.className = `notification ${type}`
    notification.innerHTML = `
            <i class="fas fa-${type === "success" ? "check-circle" : type === "error" ? "exclamation-circle" : "info-circle"}"></i>
            <span>${message}</span>
        `

    notification.style.cssText = `
            position: fixed;
            top: 100px;
            right: 20px;
            background: ${type === "success" ? "#10aeb9ff" : type === "error" ? "#f36363ff" : "#2b69ceff"};
            color: white;
            padding: 16px 24px;
            border-radius: 8px;
            box-shadow: 0 4px 12px rgba(0,0,0,0.15);
            z-index: 1000;
            transform: translateX(100%);
            transition: transform 0.3s ease;
            display: flex;
            align-items: center;
            gap: 8px;
            max-width: 350px;
        `

    document.body.appendChild(notification)

    // Animate in
    setTimeout(() => {
      notification.style.transform = "translateX(0)"
    }, 100)

    // Remove after 4 seconds
    setTimeout(() => {
      notification.style.transform = "translateX(100%)"
      setTimeout(() => {
        if (document.body.contains(notification)) {
          document.body.removeChild(notification)
        }
      }, 300)
    }, 4000)
  }
}

// --- Phone number prompt logic ---
document.addEventListener("DOMContentLoaded", function () {
    const user = JSON.parse(localStorage.getItem("user"));

    if (user && (!user.phone || user.phone === "")) {
        const phoneContainer = document.getElementById("phone-container");
        if (phoneContainer) phoneContainer.style.display = "block";

        const saveBtn = document.getElementById("save-phone-btn");
        if (saveBtn) {
            saveBtn.addEventListener("click", function () {
                const phoneInput = document.getElementById("cart-user-phone");
                const phone = phoneInput.value.trim();

                if (!/^\d{10}$/.test(phone)) {
                    alert("Please enter a valid 10-digit phone number.");
                    return;
                }

                fetch("save_phone.php", {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify({
                        email: user.email,
                        phone: phone,
                    }),
                })
                    .then((res) => res.json())
                    .then((data) => {
                        if (data.success) {
                            alert("Phone number saved!");
                            user.phone = phone;
                            localStorage.setItem("user", JSON.stringify(user));
                            phoneContainer.style.display = "none";
                        } else {
                            alert(data.message || "Failed to save phone.");
                        }
                    })
                    .catch((err) => {
                        console.error("Error saving phone:", err);
                        alert("Something went wrong.");
                    });
            });
        }
    }
    const addAddressBtn = document.getElementById("add-address-btn");

    if (addAddressBtn) {
        addAddressBtn.addEventListener("click", function () {
            const user = JSON.parse(localStorage.getItem("user"));

            if (!user || !user.email) {
                alert("⚠️ Please log in to add a delivery address.");
                return;
            }

            // Show the address form if logged in
            document.getElementById("address-form-container").style.display = "block";
        });
    }

// Initialize cart manager
let cartManager
  window.cartManager = new CartManager();

 // --- Checkout button ---
    const checkoutBtn = document.getElementById("checkoutBtn");
    if (checkoutBtn) {
        checkoutBtn.addEventListener("click", function () {
            window.location.href = "payment.html";
        });
    }
});