// Bank Pages JavaScript

// Initialize page
document.addEventListener("DOMContentLoaded", () => {
  updateCartCount()
  initializeAnimations()
})

// Select category function
function selectCategory(bank, category, name, price) {
  const product = {
    id: `${bank.toLowerCase()}-${category.toLowerCase()}`,
    bank: bank,
    category: category,
    name: name,
    price: price,
    description: `${bank} FASTag for ${name}`,
    quantity: 1,
    addedAt: new Date().toISOString(),
  }

  // Get current cart from localStorage
  const cart = JSON.parse(localStorage.getItem("cart") || "[]")

  // Check if product already exists in cart
  const existingItem = cart.find((item) => item.id === product.id)

  if (existingItem) {
    existingItem.quantity += 1
    showNotification(`${bank} FASTag - ${name} quantity updated in cart!`, "success")
  } else {
    cart.push(product)
    showNotification(`${bank} FASTag - ${name} added to cart!`, "success")
  }

  // Save to localStorage
  localStorage.setItem("cart", JSON.stringify(cart))

  // Update cart count
  updateCartCount()

  // Add visual feedback to button
  const button = event.target
  const originalHTML = button.innerHTML
  button.innerHTML = '<i class="fas fa-check"></i> Added!'
  button.style.background = "linear-gradient(135deg, #10b981, #059669)"
  button.disabled = true

  setTimeout(() => {
    button.innerHTML = originalHTML
    button.style.background = ""
    button.disabled = false
  }, 2000)
}

// Update cart count in navbar
function updateCartCount() {
  const cart = JSON.parse(localStorage.getItem("cart") || "[]")
  const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0)

  const cartCountElement = document.querySelector(".cart-count")
  if (cartCountElement) {
    cartCountElement.textContent = totalItems
    cartCountElement.style.display = totalItems > 0 ? "flex" : "none"
  }
}

// Show notification
function showNotification(message, type = "info") {
  const notification = document.createElement("div")
  notification.className = `notification ${type}`
  notification.innerHTML = `
        <i class="fas fa-${type === "success" ? "check-circle" : "info-circle"}"></i>
        <span>${message}</span>
    `

  notification.style.cssText = `
        position: fixed;
        top: 100px;
        right: 20px;
        background: ${type === "success" ? "#10b981" : "#3b82f6"};
        color: white;
        padding: 16px 24px;
        border-radius: 12px;
        box-shadow: 0 8px 32px rgba(0,0,0,0.15);
        z-index: 1000;
        transform: translateX(100%);
        transition: transform 0.3s ease;
        display: flex;
        align-items: center;
        gap: 12px;
        max-width: 350px;
        font-weight: 500;
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

// Initialize animations
function initializeAnimations() {
  const observerOptions = {
    threshold: 0.1,
    rootMargin: "0px 0px -50px 0px",
  }

  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add("visible")
      }
    })
  }, observerOptions)

  // Observe elements for fade-in animation
  document.querySelectorAll(".category-card, .benefit-card, .notice-card").forEach((el) => {
    el.classList.add("fade-in")
    observer.observe(el)
  })
}

// Export functions for global access
window.selectCategory = selectCategory
