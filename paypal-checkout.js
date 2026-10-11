document.addEventListener("DOMContentLoaded", function () {
    const container = document.getElementById("paypal-button-container");
    const msg = document.getElementById("paypal-msg");
    if (!container) return;

    function showError(text) {
        msg.textContent = text;
        msg.hidden = false;
    }

    let cart = [];
    try {
        cart = JSON.parse(localStorage.getItem("wktwCart")) || [];
    } catch (e) {}

    if (!cart.length) {
        container.innerHTML = "/// YOUR CART IS EMPTY ///";
        return;
    }

    if (!window.paypal) {
        showError("PayPal failed to load. Check your connection or Client ID.");
        return;
    }

    // Work in cents to avoid floating-point mismatches
    const itemCents = cart.reduce(function (sum, i) {
        return sum + Math.round(i.price * 100) * i.quantity;
    }, 0);

    // Edit this to match your real shipping policy
    const shippingCents = itemCents >= 20000 ? 0 : 1000; // free over $200, else $10
    const totalCents = itemCents + shippingCents;

    const money = function (cents) { return (cents / 100).toFixed(2); };

    paypal.Buttons({
        style: { layout: "vertical", color: "black", shape: "rect", label: "paypal" },

        createOrder: function (data, actions) {
            return actions.order.create({
                purchase_units: [{
                    description: "WKTW Clothing Co. order",
                    amount: {
                        currency_code: "USD",
                        value: money(totalCents),
                        breakdown: {
                            item_total: { currency_code: "USD", value: money(itemCents) },
                            shipping:   { currency_code: "USD", value: money(shippingCents) }
                        }
                    },
                    items: cart.map(function (i) {
                        return {
                            name: i.name,
                            quantity: String(i.quantity),
                            unit_amount: { currency_code: "USD", value: money(Math.round(i.price * 100)) }
                        };
                    })
                }]
            });
        },

        onApprove: function (data, actions) {
            return actions.order.capture().then(function (details) {
                try { localStorage.removeItem("wktwCart"); } catch (e) {}
                const name = details.payer && details.payer.name ? details.payer.name.given_name : "";
                container.innerHTML =
                    "★ ORDER CONFIRMED ★<br>THANKS " + name.toUpperCase() +
                    ". A RECEIPT IS ON ITS WAY FROM PAYPAL.";
            });
        },

        onCancel: function () {
            showError("Payment cancelled. Your cart is still saved.");
        },

        onError: function () {
            showError("Something went wrong with PayPal. Please try again.");
        }
    }).render("#paypal-button-container");
});