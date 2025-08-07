document.addEventListener("DOMContentLoaded", () => {
    const user = JSON.parse(localStorage.getItem("user"));
    const addressSection = document.getElementById("address-section");
    const addressForm = document.getElementById("add-address-form");
    const addAddressBtn = document.getElementById("show-address-form");
    const placeOrderBtn = document.getElementById("place-order-btn");

    let selectedAddressId = null;
    let selectedPaymentMethod = null;

    if (!user) {
        alert("Please log in to continue");
        window.location.href = "login.html";
        return;
    }

    // Load saved addresses
    fetch("get_addresses.php", {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify({ user_id: user.id })
    })
    .then(res => res.json())
    .then(data => {
        data.forEach(address => {
            const div = document.createElement("div");
            div.classList.add("address-box");
            div.textContent = `${address.house_no}, ${address.landmark}, ${address.city}, ${address.pincode}`;
            div.dataset.id = address.id;

            div.onclick = () => {
                document.querySelectorAll(".address-box").forEach(box => box.classList.remove("selected"));
                div.classList.add("selected");
                selectedAddressId = address.id;
            };

            addressSection.appendChild(div);
        });
    });

    // Show address form
    addAddressBtn.onclick = () => {
        addressForm.style.display = "block";
    };

    // Add new address
    document.getElementById("add-address-btn").onclick = () => {
        const house_no = document.getElementById("payment-house_no").value;
        const landmark = document.getElementById("payment-landmark").value;
        const city = document.getElementById("payment-city").value;
        const pincode = document.getElementById("payment-pincode").value;

        if (!house_no || !city || !pincode) {
            alert("Please fill all required address fields.");
            return;
        }

        fetch("add_address.php", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                user_id: user.id,
                house_no,
                landmark,
                city,
                pincode
            }),
        })
        .then(res => res.json())
        .then(data => {
            if (data.success) {
                alert("Address added!");
                location.reload();
            } else {
                alert("Failed to add address.");
            }
        });
    };

    // Select payment method
    document.querySelectorAll(".payment-option").forEach(option => {
        option.onclick = () => {
            document.querySelectorAll(".payment-option").forEach(o => o.classList.remove("selected"));
            option.classList.add("selected");
            selectedPaymentMethod = option.dataset.method;
        };
    });

    // Place order
    placeOrderBtn.onclick = () => {
        if (!selectedAddressId || !selectedPaymentMethod) {
            alert("Please select address and payment method.");
            return;
        }

        if (selectedPaymentMethod === "razorpay") {
            fetch("create_order.php", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    user_id: user.id,
                    address_id: selectedAddressId,
                    amount: 500 // replace with dynamic total
                }),
            })
            .then(res => res.json())
            .then(data => {
                const options = {
                    key: "RAZORPAY_KEY_PLACEHOLDER", // Replace this
                    amount: data.amount,
                    currency: "INR",
                    name: "Apna Payment",
                    description: "Order Payment",
                    order_id: data.order_id,
                    handler: function (response) {
                        alert("Payment Successful!");
                        // You can call save_order.php here
                    },
                    prefill: {
                        email: user.email
                    },
                    theme: {
                        color: "#007bff"
                    }
                };
                const rzp = new Razorpay(options);
                rzp.open();
            });
        } else if (selectedPaymentMethod === "cod") {
            fetch("save_order.php", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    user_id: user.id,
                    address_id: selectedAddressId,
                    payment_method: "COD",
                    amount: 500 // dynamic
                }),
            })
            .then(res => res.json())
            .then(data => {
                if (data.success) {
                    alert("Order placed with Cash on Delivery.");
                    location.href = "order_success.html";
                }
            });
        }
    };
});
function saveOrder(paymentMethod, paymentId = null) {
    const addressId = document.querySelector('input[name="address"]:checked')?.value;
    if (!addressId) {
        alert("Please select an address.");
        return;
    }

    const totalAmount = parseFloat(document.getElementById("total-amount").textContent);

    fetch("save_order.php", {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify({
            address_id: addressId,
            payment_method: paymentMethod,
            payment_id: paymentId,
            amount: totalAmount
        })
    })
    .then(res => res.json())
    .then(data => {
        if (data.success) {
            // ✅ Order saved successfully
            alert("Order placed successfully!");

            // ✅ Clear cart from localStorage
            localStorage.removeItem("cart");

            // ✅ Redirect or reload
            window.location.href = "success.html";  // Or reload cart
        } else {
            alert("Order failed. Try again.");
        }
    })
    .catch(err => {
        console.error("Order error:", err);
        alert("Something went wrong. Try again.");
    });
}
