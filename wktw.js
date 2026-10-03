document.addEventListener("DOMContentLoaded", function () {

    // =========================================
    // WKTW SHOPPING CART
    // =========================================

    let cart = [];

    try {
        cart = JSON.parse(localStorage.getItem("wktwCart")) || [];
    } catch (e) {
        cart = [];
    }

    const heroButton = document.getElementById("heroBtn");
    const contactButton = document.getElementById("contactBtn");
    const buyButtons = document.querySelectorAll(".buy-btn");
    const cartButton = document.getElementById("cartBtn");
    const cartCount = document.getElementById("cartCount");

    let escHandler = null;

    updateCartCount();


    // =========================================
    // IMAGE SLIDER ON PRODUCT CARDS
    // =========================================

    document.querySelectorAll(".product-image").forEach(function (box) {

        const slides = box.querySelectorAll(".slide");
        const counter = box.querySelector(".slide-count");
        const prev = box.querySelector(".slide-btn.prev");
        const next = box.querySelector(".slide-btn.next");

        // With only one image, hide the controls
        if (slides.length < 2) {
            if (prev) prev.style.display = "none";
            if (next) next.style.display = "none";
            if (counter) counter.style.display = "none";
            return;
        }

        let current = 0;

        function show(n) {
            slides[current].classList.remove("active");
            current = (n + slides.length) % slides.length;
            slides[current].classList.add("active");

            if (counter) {
                counter.textContent = (current + 1) + " / " + slides.length;
            }
        }

        if (prev) {
            prev.addEventListener("click", function () {
                show(current - 1);
            });
        }

        if (next) {
            next.addEventListener("click", function () {
                show(current + 1);
            });
        }

    });


    // HERO BUTTON
    if (heroButton) {
        heroButton.addEventListener("click", function () {
            const shop = document.getElementById("shop");
            if (shop) {
                shop.scrollIntoView({ behavior: "smooth" });
            }
        });
    }


    // CONTACT BUTTON
    if (contactButton) {
        contactButton.addEventListener("click", function () {
            window.location.href = "mailto:agelasty1@gmail.com";
        });
    }


    // ADD TO CART
    buyButtons.forEach(function (button) {

        button.addEventListener("click", function () {

            const product = button.closest(".product");
            if (!product) return;

            const nameElement = product.querySelector("h3");
            const priceElement = product.querySelector("strong");
            const imageElement = product.querySelector("img");

            if (!nameElement || !priceElement) return;

            const productName = nameElement.textContent.trim();
            const productPrice = parseFloat(priceElement.textContent.replace("$", "").trim());
            const productImage = imageElement ? imageElement.getAttribute("src") : "";

            const existingProduct = cart.find(function (item) {
                return item.name === productName;
            });

            if (existingProduct) {
                existingProduct.quantity += 1;
            } else {
                cart.push({
                    name: productName,
                    price: productPrice,
                    image: productImage,
                    quantity: 1
                });
            }

            saveCart();
            updateCartCount();
            showAddedMessage(productName);
        });

    });


    // CART BUTTON
    if (cartButton) {
        cartButton.addEventListener("click", function (event) {
            event.preventDefault();
            openCart();
        });
    }


    // SAVE CART
    function saveCart() {
        try {
            localStorage.setItem("wktwCart", JSON.stringify(cart));
        } catch (e) {
            // storage unavailable; cart still works for this session
        }
    }


    // UPDATE CART NUMBER
    function updateCartCount() {
        if (!cartCount) return;

        const totalItems = cart.reduce(function (total, item) {
            return total + item.quantity;
        }, 0);

        cartCount.textContent = totalItems;
    }


    // ADDED TO CART MESSAGE
    function showAddedMessage(productName) {

        const message = document.createElement("div");
        message.className = "cart-message";
        message.textContent = "★ " + productName + " ADDED TO CART ★";
        document.body.appendChild(message);

        setTimeout(function () {
            message.classList.add("show");
        }, 10);

        setTimeout(function () {
            message.classList.remove("show");
            setTimeout(function () {
                message.remove();
            }, 300);
        }, 1800);
    }


    // CLOSE CART
    function closeCartBox() {
        const existing = document.getElementById("wktwCart");
        if (existing) existing.remove();

        document.body.style.overflow = "";

        if (escHandler) {
            document.removeEventListener("keydown", escHandler);
            escHandler = null;
        }
    }


    // OPEN CART
    function openCart() {

        // Clear any previous cart + its Escape listener (used on re-render)
        const existingCart = document.getElementById("wktwCart");
        if (existingCart) existingCart.remove();

        if (escHandler) {
            document.removeEventListener("keydown", escHandler);
            escHandler = null;
        }

        const cartOverlay = document.createElement("div");
        cartOverlay.id = "wktwCart";
        cartOverlay.className = "cart-overlay";

        const cartBox = document.createElement("div");
        cartBox.className = "cart-box";


        // CART HEADER
        const cartHeader = document.createElement("div");
        cartHeader.className = "cart-header";

        cartHeader.innerHTML = `
            <div>
                <span class="cart-label">/// WKTW STORE ///</span>
                <h2>YOUR CART</h2>
            </div>
            <button id="closeCart" class="close-cart">X</button>
        `;

        cartBox.appendChild(cartHeader);


        // CART ITEMS
        const cartItems = document.createElement("div");
        cartItems.className = "cart-items";

        if (cart.length === 0) {

            cartItems.innerHTML = `
                <div class="empty-cart">
                    <div>/// CART EMPTY ///</div>
                    <p>YOU HAVEN'T ADDED ANYTHING YET.</p>
                </div>
            `;

        } else {

            cart.forEach(function (item, index) {

                const cartItem = document.createElement("div");
                cartItem.className = "cart-item";

                cartItem.innerHTML = `
                    <div class="cart-item-image">
                        ${item.image
                            ? `<img src="${item.image}" alt="${item.name}">`
                            : `<span>WKTW</span>`}
                    </div>

                    <div class="cart-item-info">
                        <h3>${item.name}</h3>
                        <p>$${item.price.toFixed(2)}</p>

                        <div class="quantity-controls">
                            <button class="quantity-btn decrease-btn" data-index="${index}">-</button>
                            <span>${item.quantity}</span>
                            <button class="quantity-btn increase-btn" data-index="${index}">+</button>
                            <button class="remove-btn" data-index="${index}">REMOVE</button>
                        </div>
                    </div>
                `;

                cartItems.appendChild(cartItem);
            });

        }

        cartBox.appendChild(cartItems);


        // CART FOOTER & TOTALS
        const totalPrice = cart.reduce(function (total, item) {
            return total + (item.price * item.quantity);
        }, 0);

        const cartFooter = document.createElement("div");
        cartFooter.className = "cart-footer";

        cartFooter.innerHTML = `
            <div class="cart-total">
                <span>TOTAL:</span>
                <strong>$${totalPrice.toFixed(2)}</strong>
            </div>
            <button class="checkout-btn" id="checkoutBtn">PROCEED TO CHECKOUT &gt;&gt;</button>
        `;

        cartBox.appendChild(cartFooter);
        cartOverlay.appendChild(cartBox);
        document.body.appendChild(cartOverlay);

        // Stop page scrolling behind the cart, close on Escape
        document.body.style.overflow = "hidden";

        escHandler = function (e) {
            if (e.key === "Escape") closeCartBox();
        };
        document.addEventListener("keydown", escHandler);


        // CLOSE BUTTON
        document.getElementById("closeCart").addEventListener("click", closeCartBox);

        // CLICK OUTSIDE TO CLOSE
        cartOverlay.addEventListener("click", function (event) {
            if (event.target === cartOverlay) closeCartBox();
        });


        // QUANTITY CONTROLS
        cartItems.addEventListener("click", function (event) {

            const index = event.target.getAttribute("data-index");
            if (index === null) return;

            if (event.target.classList.contains("increase-btn")) {
                cart[index].quantity += 1;
            } else if (event.target.classList.contains("decrease-btn")) {
                cart[index].quantity -= 1;
                if (cart[index].quantity <= 0) {
                    cart.splice(index, 1);
                }
            } else if (event.target.classList.contains("remove-btn")) {
                cart.splice(index, 1);
            }

            saveCart();
            updateCartCount();
            openCart(); // re-render
        });


        // CHECKOUT
        const checkoutBtn = document.getElementById("checkoutBtn");

        if (checkoutBtn) {
            checkoutBtn.addEventListener("click", function () {

                if (cart.length === 0) {
                    alert("Your cart is empty.");
                    return;
                }

                window.location.href = "checkout.html";
            });
        }

    }

});