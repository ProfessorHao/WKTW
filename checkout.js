document.addEventListener("DOMContentLoaded", function () {

    // =========================================
    // SETTINGS (edit these)
    // =========================================

    const FREE_SHIPPING_OVER = 200;   // matches your "free shipping over $200" banner
    const FLAT_SHIPPING = 9.99;       // CHANGE to your real shipping price
    const ORDER_ENDPOINT = "";        // paste a Formspree URL here to receive orders by email


    // =========================================
    // LOAD CART
    // =========================================

    let cart = [];

    try {
        cart = JSON.parse(localStorage.getItem("wktwCart")) || [];
    } catch (e) {
        cart = [];
    }

    const grid = document.getElementById("checkoutGrid");
    const emptyBox = document.getElementById("checkoutEmpty");
    const doneBox = document.getElementById("checkoutDone");
    const doneMessage = document.getElementById("doneMessage");
    const summaryItems = document.getElementById("summaryItems");
    const form = document.getElementById("checkoutForm");
    const formError = document.getElementById("formError");
    const placeOrderBtn = document.getElementById("placeOrderBtn");

    if (cart.length === 0) {
        grid.hidden = true;
        emptyBox.hidden = false;
        return;
    }


    // =========================================
    // HELPERS
    // =========================================

    function money(n) {
        return "$" + n.toFixed(2);
    }

    function escapeHtml(text) {
        const div = document.createElement("div");
        div.textContent = text;
        return div.innerHTML;
    }


    // =========================================
    // SUMMARY
    // =========================================

    const subtotal = cart.reduce(function (sum, item) {
        return sum + item.price * item.quantity;
    }, 0);

    const shipping = subtotal >= FREE_SHIPPING_OVER ? 0 : FLAT_SHIPPING;
    const total = subtotal + shipping;

    summaryItems.innerHTML = cart.map(function (item) {
        return `
            <div class="summary-item">
                <div class="summary-thumb">
                    ${item.image
                        ? `<img src="${escapeHtml(item.image)}" alt="${escapeHtml(item.name)}">`
                        : `<span>WKTW</span>`}
                </div>
                <div class="summary-item-info">
                    <h3>${escapeHtml(item.name)}</h3>
                    <p>QTY ${item.quantity} &times; ${money(item.price)}</p>
                </div>
                <strong>${money(item.price * item.quantity)}</strong>
            </div>
        `;
    }).join("");

    document.getElementById("subtotalAmount").textContent = money(subtotal);
    document.getElementById("shippingAmount").textContent =
        shipping === 0 ? "FREE" : money(shipping);
    document.getElementById("totalAmount").textContent = money(total);


    // =========================================
    // SUBMIT ORDER
    // =========================================

    form.addEventListener("submit", function (event) {

        event.preventDefault();
        formError.hidden = true;

        // Check required fields
        const requiredFields = form.querySelectorAll("[required]");
        let valid = true;

        requiredFields.forEach(function (field) {
            const empty = field.value.trim() === "";
            const badEmail = field.type === "email" && !/^\S+@\S+\.\S+$/.test(field.value.trim());

            if (empty || badEmail) {
                field.classList.add("invalid");
                valid = false;
            } else {
                field.classList.remove("invalid");
            }
        });

        if (!valid) {
            formError.textContent = "Please fill in the highlighted fields.";
            formError.hidden = false;
            return;
        }

        const order = {
            customer: {
                name: form.fullName.value.trim(),
                email: form.email.value.trim(),
                address: form.address.value.trim(),
                city: form.city.value.trim(),
                state: form.state.value.trim(),
                zip: form.zip.value.trim(),
                country: form.country.value.trim()
            },
            notes: form.notes.value.trim(),
            items: cart,
            subtotal: subtotal,
            shipping: shipping,
            total: total
        };

        // No endpoint set: do NOT pretend the order went through
        if (!ORDER_ENDPOINT) {
            formError.textContent =
                "Orders can't be submitted yet because checkout isn't connected. " +
                "Please email agelasty1@gmail.com to order.";
            formError.hidden = false;
            return;
        }

        placeOrderBtn.disabled = true;
        placeOrderBtn.textContent = "SENDING...";

        fetch(ORDER_ENDPOINT, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Accept": "application/json"
            },
            body: JSON.stringify(order)
        })
        .then(function (response) {
            if (!response.ok) throw new Error("Request failed");

            try {
                localStorage.removeItem("wktwCart");
            } catch (e) {}

            grid.hidden = true;
            doneMessage.textContent =
                "/// ORDER RECEIVED /// Thanks, " + order.customer.name +
                ". We'll email " + order.customer.email + " with next steps.";
            doneBox.hidden = false;
        })
        .catch(function () {
            formError.textContent = "Something went wrong sending your order. Please try again.";
            formError.hidden = false;
            placeOrderBtn.disabled = false;
            placeOrderBtn.innerHTML = "PLACE ORDER &gt;&gt;";
        });

    });

});