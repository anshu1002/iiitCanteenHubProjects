
const foods = [
    { id: 1, name: "Classic Burger", category: "Burger", price: 129, rating: 4.8, image: "photo-1568901346375-23c9450c58cd" },
    { id: 2, name: "Cheese Pizza", category: "Pizza", price: 179, rating: 4.7, image: "photo-1513104890138-7c749659a591" },
    { id: 3, name: "Spicy Noodles", category: "Noodles", price: 99, rating: 4.6, image: "photo-1569718212165-3a8278d5f624" },
    { id: 4, name: "Fresh Sandwich", category: "Sandwich", price: 89, rating: 4.5, image: "photo-1528735602780-2552fd46c7af" },
    { id: 5, name: "French Fries", category: "Burger", price: 69, rating: 4.7, image: "photo-1573080496219-bb080dd4f877" },
    { id: 6, name: "Cold Coffee", category: "Drinks", price: 79, rating: 4.6, image: "photo-1461023058943-07fcbe16d735" },
    { id: 7, name: "Chocolate Cake", category: "Dessert", price: 99, rating: 4.9, image: "photo-1578985545062-69928b1d9587" },
    { id: 8, name: "Loaded Pizza", category: "Pizza", price: 119, rating: 4.8, image: "photo-1579751626657-72bc17010498" }
];

let cart = [];
let selectedCategory = "All";
let currentUser = null;
let toastTimer;

const foodGrid = document.getElementById("food-grid");
const searchInput = document.getElementById("food-search");
const cartCount = document.getElementById("cart-count");
const emptyMessage = document.getElementById("empty-message");

function renderFoods() {
    if (!foodGrid || !searchInput || !emptyMessage) return;

    const searchText = searchInput.value.toLowerCase().trim();

    const filteredFoods = foods.filter(food => {
        const categoryMatches =
            selectedCategory === "All" ||
            food.category === selectedCategory;

        const searchMatches =
            food.name.toLowerCase().includes(searchText) ||
            food.category.toLowerCase().includes(searchText);

        return categoryMatches && searchMatches;
    });

    foodGrid.innerHTML = filteredFoods.map(food => `
        <article class="food-card">
            <div class="food-photo">
                <img
                    src="https://images.unsplash.com/${food.image}?auto=format&fit=crop&w=600&q=80"
                    alt="${food.name}"
                    loading="lazy"
                >
                <span class="food-tag">CAMPUS FAVOURITE</span>
            </div>

            <div class="food-info">
                <h3>${food.name}</h3>

                <div class="food-meta">
                    <span class="food-price">₹${food.price}</span>
                    <span class="food-rating">★ ${food.rating}</span>
                </div>

                <div class="food-bottom">
                    <small>Freshly made ✦</small>
                    <button class="add-btn" onclick="addToCart(${food.id})">
                        + Add
                    </button>
                </div>
            </div>
        </article>
    `).join("");

    emptyMessage.hidden = filteredFoods.length > 0;
}

function filterFood(category, button) {
    selectedCategory = category;

    document.querySelectorAll(".category").forEach(item => {
        item.classList.remove("active");
    });

    if (button) {
        button.classList.add("active");
    }

    renderFoods();
}

function searchFood() {
    renderFoods();
}

function updateNavbar() {
    const loginButton = document.getElementById("login-nav-btn");
    const signupButton = document.getElementById("signup-nav-btn");
    const profileButton = document.getElementById("profile-nav-btn");
    const userName = document.getElementById("nav-user-name");

    const loggedIn = Boolean(currentUser);

    if (loginButton) loginButton.hidden = loggedIn;
    if (signupButton) signupButton.hidden = loggedIn;
    if (profileButton) profileButton.hidden = !loggedIn;

    if (loggedIn && userName) {
        userName.textContent = currentUser.name;
    }
}

function addToCart(id) {
    if (!currentUser) {
        showToast("Please log in to add food to your cart!");
        openAuth("login");
        return;
    }

    const food = foods.find(item => item.id === id);

    if (!food) return;

    const existingItem = cart.find(item => item.id === id);

    if (existingItem) {
        existingItem.quantity++;
    } else {
        cart.push({ ...food, quantity: 1 });
    }

    updateCartCount();
    showToast(`${food.name} added to cart!`);
}

function updateCartCount() {
    if (!cartCount) return;

    cartCount.textContent = cart.reduce(
        (sum, item) => sum + item.quantity,
        0
    );
}

function showToast(message) {
    const toast = document.getElementById("toast");

    if (!toast) {
        alert(message);
        return;
    }

    toast.textContent = message;
    toast.classList.add("show");

    clearTimeout(toastTimer);

    toastTimer = setTimeout(() => {
        toast.classList.remove("show");
    }, 2600);
}

function openAuth(mode) {
    const overlay = document.getElementById("auth-overlay");

    if (!overlay) {
        showToast("Login window could not be found.");
        return;
    }

    updateAuthUIForMode(mode);
    overlay.classList.add("open");
    document.body.style.overflow = "hidden";
}

function updateAuthUIForMode(mode) {
    window.authMode = mode;

    const authTitle = document.getElementById("auth-title");
    const authSubtitle = document.getElementById("auth-subtitle");
    const nameField = document.getElementById("name-field");
    const nameInput = document.getElementById("auth-name");
    const submitButton = document.getElementById("auth-submit");
    const switchText = document.getElementById("auth-switch-text");
    const switchButton = document.getElementById("auth-switch-button");
    const message = document.getElementById("auth-message");

    if (authTitle) {
        authTitle.textContent =
            mode === "signup" ? "Create your account" : "Welcome back!";
    }

    if (authSubtitle) {
        authSubtitle.textContent =
            mode === "signup"
                ? "Join your campus food community."
                : "Your favourite campus bites await.";
    }

    if (nameField) nameField.hidden = mode !== "signup";
    if (nameInput) nameInput.required = mode === "signup";

    if (submitButton) {
        submitButton.textContent =
            mode === "signup" ? "Create account →" : "Log in →";
    }

    if (switchText) {
        switchText.textContent =
            mode === "signup"
                ? "Already have an account?"
                : "New to IIIT Hub?";
    }

    if (switchButton) {
        switchButton.textContent =
            mode === "signup" ? "Log in" : "Create account";
    }

    if (message) message.textContent = "";
}

function closeAuth() {
    const overlay = document.getElementById("auth-overlay");

    if (overlay) overlay.classList.remove("open");

    document.body.style.overflow = "";
}

function switchAuth() {
    updateAuthUIForMode(
        window.authMode === "signup" ? "login" : "signup"
    );
}

function showProfile() {
    if (!currentUser) {
        openAuth("login");
        return;
    }

    const profileName = document.getElementById("profile-name");
    const profileEmail = document.getElementById("profile-email");
    const overlay = document.getElementById("profile-overlay");

    if (!overlay) {
        showToast("Profile window could not be found.");
        return;
    }

    if (profileName) profileName.textContent = currentUser.name;
    if (profileEmail) profileEmail.textContent = currentUser.email;

    overlay.classList.add("open");
    document.body.style.overflow = "hidden";
}

function closeProfile() {
    const overlay = document.getElementById("profile-overlay");

    if (overlay) overlay.classList.remove("open");

    document.body.style.overflow = "";
}

function logoutUser() {
    currentUser = null;
    cart = [];

    updateCartCount();
    updateNavbar();
    closeProfile();

    showToast("You have logged out successfully.");
}

function renderCart() {
    const cartItems = document.getElementById("cart-items");
    const cartTotal = document.getElementById("cart-total");
    const checkoutBtn = document.getElementById("checkout-btn");

    if (!cartItems || !cartTotal || !checkoutBtn) {
        console.error(
            "Cart HTML missing: check cart-items, cart-total and checkout-btn IDs."
        );
        showToast("Cart section HTML is missing. Please check the cart IDs.");
        return false;
    }

    if (cart.length === 0) {
        cartItems.innerHTML = "<p>Your cart is empty.</p>";
        cartTotal.textContent = "Total: ₹0";
        checkoutBtn.disabled = true;
        return true;
    }

    cartItems.innerHTML = cart.map(item => `
        <div class="form-field">
            <strong>${item.name}</strong>
            <p>₹${item.price} × ${item.quantity}</p>

            <button type="button" class="login-btn"
                onclick="changeQuantity(${item.id}, -1)">−</button>

            <button type="button" class="login-btn"
                onclick="changeQuantity(${item.id}, 1)">+</button>

            <button type="button" class="login-btn"
                onclick="removeCartItem(${item.id})">Remove</button>
        </div>
    `).join("");

    const total = cart.reduce(
        (sum, item) => sum + item.price * item.quantity,
        0
    );

    cartTotal.textContent = `Total: ₹${total}`;
    checkoutBtn.disabled = false;

    return true;
}

function showCart() {
    if (!currentUser) {
        showToast("Please log in to view your cart!");
        openAuth("login");
        return;
    }

    const cartOverlay = document.getElementById("cart-overlay");

    if (!cartOverlay) {
        console.error("Cart overlay not found. Check id='cart-overlay'.");
        showToast("Cart window could not be found. Please check your HTML.");
        return;
    }

    const rendered = renderCart();

    if (!rendered) return;

    cartOverlay.classList.add("open");
    document.body.style.overflow = "hidden";
}

function closeCart() {
    const overlay = document.getElementById("cart-overlay");

    if (overlay) overlay.classList.remove("open");

    document.body.style.overflow = "";
}

function changeQuantity(id, amount) {
    const item = cart.find(food => food.id === id);

    if (!item) return;

    item.quantity += amount;

    if (item.quantity <= 0) {
        cart = cart.filter(food => food.id !== id);
    }

    updateCartCount();
    renderCart();
}

function removeCartItem(id) {
    cart = cart.filter(food => food.id !== id);

    updateCartCount();
    renderCart();
}

function startCheckout() {
    if (cart.length === 0) {
        showToast("Your cart is empty!");
        return;
    }

    const paymentOverlay = document.getElementById("payment-overlay");
    const paymentTotal = document.getElementById("payment-total");
    const paymentMessage = document.getElementById("payment-message");

    if (!paymentOverlay || !paymentTotal || !paymentMessage) {
        showToast("Payment section HTML is missing.");
        return;
    }

    const total = cart.reduce(
        (sum, item) => sum + item.price * item.quantity,
        0
    );

    paymentTotal.textContent = `₹${total}`;
    paymentMessage.textContent = "";

    closeCart();

    paymentOverlay.classList.add("open");
    document.body.style.overflow = "hidden";
}

function closePayment() {
    const overlay = document.getElementById("payment-overlay");

    if (overlay) overlay.classList.remove("open");

    document.body.style.overflow = "";
}

function makeDummyPayment() {
    if (cart.length === 0) {
        showToast("Your cart is empty!");
        closePayment();
        return;
    }

    const payButton = document.getElementById("pay-now-btn");
    const paymentMessage = document.getElementById("payment-message");

    if (!payButton || !paymentMessage) {
        showToast("Payment section HTML is missing.");
        return;
    }

    payButton.disabled = true;
    paymentMessage.textContent = "Processing demo payment...";

    setTimeout(() => {
        try {
            const methodElement = document.getElementById("payment-method");
            const orderId = "DEMO-" + Date.now();

            const total = cart.reduce(
                (sum, item) => sum + item.price * item.quantity,
                0
            );

            const order = {
                id: orderId,
                items: cart.map(item => ({ ...item })),
                total: total,
                paymentMethod: methodElement
                    ? methodElement.value
                    : "Demo",
                paymentStatus: "Demo payment successful",
                createdAt: new Date().toISOString()
            };

            const orderTitle =
                document.getElementById("order-result-title");
            const orderMessage =
                document.getElementById("order-result-message");
            const orderIdElement =
                document.getElementById("order-id");
            const orderStatus =
                document.getElementById("order-payment-status");
            const orderOverlay =
                document.getElementById("order-overlay");

            if (!orderOverlay) {
                showToast("Order confirmation section is missing.");
                return;
            }

            if (orderTitle) {
                orderTitle.textContent = "Order Confirmed!";
            }

            if (orderMessage) {
                orderMessage.textContent =
                    `Your demo order total is ₹${order.total}.`;
            }

            if (orderIdElement) {
                orderIdElement.textContent = order.id;
            }

            if (orderStatus) {
                orderStatus.textContent =
                    `${order.paymentStatus} via ${order.paymentMethod}`;
            }

            closePayment();

            orderOverlay.classList.add("open");

            cart = [];
            updateCartCount();
        } finally {
            payButton.disabled = false;
        }
    }, 1000);
}

function simulatePaymentFailure() {
    const message = document.getElementById("payment-message");

    if (message) {
        message.textContent =
            "Demo payment failed. Your cart is still available. Please try again.";
    }
}

function finishOrder() {
    const overlay = document.getElementById("order-overlay");

    if (overlay) overlay.classList.remove("open");

    document.body.style.overflow = "";

    showToast("Thank you for ordering from IIIT Hub!");
}

document.addEventListener("DOMContentLoaded", () => {
    const authOverlay = document.getElementById("auth-overlay");
    const profileOverlay = document.getElementById("profile-overlay");
    const cartOverlay = document.getElementById("cart-overlay");
    const authForm = document.getElementById("auth-form");

    if (authOverlay) {
        authOverlay.addEventListener("click", event => {
            if (event.target === authOverlay) closeAuth();
        });
    }

    if (profileOverlay) {
        profileOverlay.addEventListener("click", event => {
            if (event.target === profileOverlay) closeProfile();
        });
    }

    if (cartOverlay) {
        cartOverlay.addEventListener("click", event => {
            if (event.target === cartOverlay) closeCart();
        });
    }

    document.addEventListener("keydown", event => {
        if (event.key === "Escape") {
            closeAuth();
            closeProfile();
            closeCart();
            closePayment();
        }
    });

    if (authForm) {
        authForm.addEventListener("submit", async event => {
            event.preventDefault();

            const email =
                document.getElementById("auth-email").value.trim();
            const password =
                document.getElementById("auth-password").value;
            const name =
                document.getElementById("auth-name").value.trim();
            const message =
                document.getElementById("auth-message");
            const submitButton =
                document.getElementById("auth-submit");
            const mode = window.authMode;

            if (!message || !submitButton) return;

            if (!email || password.length < 8) {
                message.textContent =
                    "Enter a valid email and a password of at least 8 characters.";
                return;
            }

            if (mode === "signup" && !name) {
                message.textContent = "Please enter your full name.";
                return;
            }

            submitButton.disabled = true;
            message.textContent = "Please wait...";

            try {
                const response = await fetch(
                    mode === "signup"
                        ? "/api/auth/signup"
                        : "/api/auth/login",
                    {
                        method: "POST",
                        headers: {
                            "Content-Type": "application/json"
                        },
                        body: JSON.stringify(
                            mode === "signup"
                                ? { name, email, password }
                                : { email, password }
                        )
                    }
                );

                const data = await response.json();

                if (!response.ok) {
                    message.textContent =
                        data.message || "Request failed.";
                    return;
                }

                currentUser = data.user;

                updateNavbar();
                closeAuth();

                showToast(`Welcome, ${currentUser.name}!`);
            } catch (error) {
                console.error("Authentication error:", error);

                message.textContent =
                    "Server se connect nahi ho pa raha. Please try again.";
            } finally {
                submitButton.disabled = false;
            }
        });
    }

    updateNavbar();
    updateCartCount();
    renderFoods();
});
