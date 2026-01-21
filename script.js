// Grab elements
const menuIcon = document.getElementById("menuIcon");
const sidebar = document.getElementById("sidebar");
const links = document.querySelectorAll(".sidebar a");
let isSidebarOpen = false;
let productsInCart = [];
let cartList = [];

// Event listener to handle clicking the menu icon
menuIcon.addEventListener("click", () => {
    if (window.innerWidth <= 768) {
        // Mobile: toggle the 'open' class
        sidebar.classList.toggle("open");
    } else {
        // Desktop: use 'left' positioning to toggle visibility
        if (isSidebarOpen) {
            sidebar.style.left = "-200px";
        } else {
            sidebar.style.left = "0";
        }
    }

    // Toggle the state
    isSidebarOpen = !isSidebarOpen;
});

// Function to close the sidebar and navigate to a page
function selectPage(event) {
    event.preventDefault(); // Prevent the default link navigation to ensure the sidebar closes first
    const targetUrl = event.target.getAttribute("href"); // Get the target URL from the clicked link

    // Close the sidebar with a smooth transition
    if (window.innerWidth <= 768) {
        sidebar.classList.remove("open"); // Close the sidebar on mobile
    } else {
        sidebar.style.left = "-200px"; // Close the sidebar on desktop
    }

    // Wait for the transition to complete before navigating
    setTimeout(() => {
        window.location.href = targetUrl; // Navigate to the new page after the sidebar closes
    }, 500); // Delay matches the CSS transition time (0.5s)
}

// Add event listeners to all sidebar links
links.forEach((link) => {
    link.addEventListener("click", selectPage);
});

// ---------------- GENERATE THE Reviews ---------------- //
const customReviews = [
    {
        Name: "Gordon",
        Review:
            "My grandkids really enjoyed this school! how do i give it 5 stars on this flabergasted web-a-ma-thingy?",
        Time: "3/31/24",
    },
    {
        Name: "Nick",
        Review: "Is there online classes for if you get sick?",
        Time: "9/15/24",
    },
];
let render;
document.addEventListener("DOMContentLoaded", () => {
    const grid = document.getElementById("reviewList");

    render = (list) => {
        grid.innerHTML = "";

        list.forEach((review) => {
            const col = document.createElement("div");
            col.className = "col-12";

            col.innerHTML = `
        <div class="card h-100 shadow-sm home-txt-b">
          <div class="card-body text-center">
            <h5 class="card-title mb-1">${review.Name}</h5>
            <p class="card-text small">${review.Review}</p>
            <div class="text-muted small">${review.Time}</div>
          </div>
        </div>
      `;

            grid.appendChild(col);
        });
    };

    render(customReviews);
});

function submitReview() {
    let customerName = document.getElementById("textCommentName").value;
    let customerComment = document.getElementById("commentArea").value;
    customReviews.push({
        Name: customerName,
        Review: customerComment,
        Time: new Date().toLocaleDateString(),
    });
    render(customReviews);
}

function addingToCart(itemName, itemPrice) {
    const item = { name: itemName, price: itemPrice };
    productsInCart.push(item);
}

window.addEventListener("beforeunload", () => {
    if (document.querySelector("body").id == "products")
        sessionStorage.setItem("cart", JSON.stringify(productsInCart));
});

window.addEventListener("load", () => {
    if (document.querySelector("body").id == "cart") {
        cartList = JSON.parse(sessionStorage.getItem("cart"));
        renderCart();
    }
    if (document.querySelector("body").id == "products") {
        if (sessionStorage.getItem("cart"))
            productsInCart = JSON.parse(sessionStorage.getItem("cart"));
        else productsInCart = [];
    }
});


function renderCart() {
    if (document.querySelector("body").id !== "cart") return;

    const container = document.getElementById("cartItems");
    container.innerHTML = "";

    if (!cartList || cartList.length === 0) {
        container.innerHTML = "<p>Your cart is empty.</p>";
        return;
    }

    cartList.forEach((item) => {
        const card = document.createElement("div");
        card.className = "card shadow-sm mb-3";
        card.style.padding = "1rem";

        card.innerHTML = `
      <div class="card-body itemCards">
        <h5 class="card-title">${item.name || "Unnamed Product"}</h5>
        <p class="card-text">Price: $${item.price?.toFixed(2) || "0.00"}</p>
      </div>
    `;

        container.appendChild(card);
    });
}