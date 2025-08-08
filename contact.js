// Contact form functionality
document.addEventListener("DOMContentLoaded", () => {
  const contactForm = document.getElementById("contactForm")
  const submitBtn = contactForm.querySelector(".submit-btn")

  // Form validation rules
  const validationRules = {
    firstName: {
      required: true,
      minLength: 2,
      pattern: /^[a-zA-Z\s]+$/,
      message: "First name must be at least 2 characters and contain only letters",
    },
    lastName: {
      required: true,
      minLength: 2,
      pattern: /^[a-zA-Z\s]+$/,
      message: "Last name must be at least 2 characters and contain only letters",
    },
    email: {
      required: true,
      pattern: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
      message: "Please enter a valid email address",
    },
    phone: {
      required: true,
      pattern: /^[+]?[\d\s\-$$$$]{10,}$/,
      message: "Please enter a valid phone number (at least 10 digits)",
    },
    subject: {
      required: true,
      message: "Please select a subject",
    },
    message: {
      required: true,
      minLength: 10,
      message: "Message must be at least 10 characters long",
    },
  }

  // Add event listeners for real-time validation
  Object.keys(validationRules).forEach((fieldName) => {
    const field = contactForm.querySelector(`[name="${fieldName}"]`)
    if (field) {
      field.addEventListener("blur", () => validateField(fieldName))
      field.addEventListener("input", () => clearFieldError(fieldName))
    }
  })

  // Form submission handler
  contactForm.addEventListener("submit", (e) => {
    e.preventDefault()

    if (validateForm()) {
      submitForm()
    }
  })

  // Validate individual field
  function validateField(fieldName) {
    const field = contactForm.querySelector(`[name="${fieldName}"]`)
    const rules = validationRules[fieldName]
    const value = field.value.trim()

    // Clear previous errors
    clearFieldError(fieldName)

    // Required field check
    if (rules.required && !value) {
      showFieldError(fieldName, `${getFieldLabel(fieldName)} is required`)
      return false
    }

    // Skip other validations if field is empty and not required
    if (!value && !rules.required) {
      return true
    }

    // Minimum length check
    if (rules.minLength && value.length < rules.minLength) {
      showFieldError(fieldName, rules.message)
      return false
    }

    // Pattern check
    if (rules.pattern && !rules.pattern.test(value)) {
      showFieldError(fieldName, rules.message)
      return false
    }

    return true
  }

  // Validate entire form
  function validateForm() {
    let isValid = true

    Object.keys(validationRules).forEach((fieldName) => {
      if (!validateField(fieldName)) {
        isValid = false
      }
    })

    return isValid
  }

  // Show field error
  function showFieldError(fieldName, message) {
    const field = contactForm.querySelector(`[name="${fieldName}"]`)
    const formGroup = field.closest(".form-group")

    formGroup.classList.add("error")

    // Remove existing error message
    const existingError = formGroup.querySelector(".error-message")
    if (existingError) {
      existingError.remove()
    }

    // Add new error message
    const errorDiv = document.createElement("div")
    errorDiv.className = "error-message"
    errorDiv.textContent = message
    formGroup.appendChild(errorDiv)
  }

  // Clear field error
  function clearFieldError(fieldName) {
    const field = contactForm.querySelector(`[name="${fieldName}"]`)
    const formGroup = field.closest(".form-group")

    formGroup.classList.remove("error")

    const errorMessage = formGroup.querySelector(".error-message")
    if (errorMessage) {
      errorMessage.remove()
    }
  }

  // Get field label
  function getFieldLabel(fieldName) {
    const field = contactForm.querySelector(`[name="${fieldName}"]`)
    const label = field.closest(".form-group").querySelector("label")
    return label ? label.textContent.replace(" *", "") : fieldName
  }

// Submit form
async function submitForm() {
  // Show loading state
  submitBtn.classList.add("loading");
  submitBtn.disabled = true;
  submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Sending...';

  // Collect form data and normalize the name fields
  const formData = new FormData(contactForm);
  const data = Object.fromEntries(formData.entries());

  // Combine first and last name for storage
  data.name = `${data.firstName} ${data.lastName}`;
  delete data.firstName;
  delete data.lastName;

  try {
    // Send data to the new PHP endpoint
    const response = await fetch('../fastag_admin/contact_queries.php', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      throw new Error('Network response was not ok');
    }

    const result = await response.json();
    if (result.success) {
      // Show success message
      showSuccessMessage();
      // Reset form
      contactForm.reset();
      // Send notification
      showNotification("Message sent successfully! We'll get back to you soon.", "success");
    } else {
      throw new Error(result.message || 'Failed to send message.');
    }
  } catch (error) {
    console.error("Error submitting form:", error);
    showNotification("Failed to send message. Please try again.", "error");
  } finally {
    // Reset button state
    submitBtn.classList.remove("loading");
    submitBtn.disabled = false;
    submitBtn.innerHTML = '<i class="fas fa-paper-plane"></i> Send Message';
  }
}

  // Show success message
  function showSuccessMessage() {
    // Remove existing success message
    const existingSuccess = contactForm.querySelector(".success-message")
    if (existingSuccess) {
      existingSuccess.remove()
    }

    // Create success message
    const successDiv = document.createElement("div")
    successDiv.className = "success-message"
    successDiv.innerHTML = `
            <i class="fas fa-check-circle"></i>
            <span>Thank you for your message! We'll get back to you within 2 hours.</span>
        `

    // Insert at the beginning of the form
    contactForm.insertBefore(successDiv, contactForm.firstChild)

    // Scroll to success message
    successDiv.scrollIntoView({ behavior: "smooth", block: "center" })

    // Remove success message after 5 seconds
    setTimeout(() => {
      if (successDiv.parentNode) {
        successDiv.remove()
      }
    }, 5000)
  }

  // Show notification
  function showNotification(message, type = "info") {
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
            background: ${type === "success" ? "#10b981" : type === "error" ? "#ef4444" : "#3b82f6"};
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

    // Remove after 5 seconds
    setTimeout(() => {
      notification.style.transform = "translateX(100%)"
      setTimeout(() => {
        if (document.body.contains(notification)) {
          document.body.removeChild(notification)
        }
      }, 300)
    }, 5000)
  }

  // Help button handlers
  const helpButtons = document.querySelectorAll(".help-btn")
  helpButtons.forEach((button) => {
    button.addEventListener("click", function () {
      const buttonText = this.textContent.trim()

      // Pre-fill the form based on the help button clicked
      const subjectSelect = contactForm.querySelector('[name="subject"]')
      const messageTextarea = contactForm.querySelector('[name="message"]')

      let subject = "general"
      let message = ""

      if (buttonText.includes("install")) {
        subject = "technical"
        message = "I need help with FASTag installation. "
      } else if (buttonText.includes("not working")) {
        subject = "technical"
        message = "My FASTag is not working properly. "
      } else if (buttonText.includes("Recharge")) {
        subject = "billing"
        message = "I need help with FASTag recharge. "
      } else if (buttonText.includes("Track")) {
        subject = "order"
        message = "I need to track my order. "
      }

      subjectSelect.value = subject
      messageTextarea.value = message

      // Scroll to form
      contactForm.scrollIntoView({ behavior: "smooth", block: "start" })

      // Focus on message field
      setTimeout(() => {
        messageTextarea.focus()
        messageTextarea.setSelectionRange(message.length, message.length)
      }, 500)
    })
  })

  // Phone number formatting
  const phoneField = contactForm.querySelector('[name="phone"]')
  if (phoneField) {
    phoneField.addEventListener("input", function () {
      let value = this.value.replace(/\D/g, "")

      // Add country code if not present
      if (value.length > 0 && !value.startsWith("91")) {
        if (value.length === 10) {
          value = "91" + value
        }
      }

      // Format the number
      if (value.length > 2) {
        value = "+" + value.substring(0, 2) + " " + value.substring(2)
      }

      this.value = value
    })
  }

  // Auto-resize textarea
  const messageTextarea = contactForm.querySelector('[name="message"]')
  if (messageTextarea) {
    messageTextarea.addEventListener("input", function () {
      this.style.height = "auto"
      this.style.height = this.scrollHeight + "px"
    })
  }
})

// Initialize cart count on page load
document.addEventListener("DOMContentLoaded", () => {
  updateCartCount()
})

// Update cart count function
function updateCartCount() {
  const cart = JSON.parse(localStorage.getItem("cart") || "[]")
  const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0)

  const cartCountElement = document.querySelector(".cart-count")
  if (cartCountElement) {
    cartCountElement.textContent = totalItems
    cartCountElement.style.display = totalItems > 0 ? "flex" : "none"
  }
}