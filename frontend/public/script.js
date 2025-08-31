document.addEventListener('DOMContentLoaded', function() {
    // DOM elements
    const productsContainer = document.getElementById('products-container');
    const cartContainer = document.getElementById('cart-container');
    const cartTotal = document.getElementById('cart-total');
    const checkoutBtn = document.getElementById('checkout-btn');
    const navLinks = document.querySelectorAll('.nav-links a');
    const pages = document.querySelectorAll('.page');
    const modal = document.getElementById('product-modal');
    const closeModal = document.querySelector('.close');
    const productDetail = document.getElementById('product-detail');

    // Current state
    let products = [];
    let cart = JSON.parse(localStorage.getItem('cart')) || [];

    // Fetch products from API
    async function fetchProducts() {
        try {
            const response = await fetch('/api/products');
            products = await response.json();
            displayProducts(products);
        } catch (error) {
            console.error('Error fetching products:', error);
        }
    }

    // Display products in the grid
    function displayProducts(products) {
        productsContainer.innerHTML = '';
        products.forEach(product => {
            const productCard = document.createElement('div');
            productCard.className = 'product-card';
            productCard.innerHTML = `
                <img src="${product.image}" alt="${product.name}" class="product-image">
                <div class="product-info">
                    <h3 class="product-title">${product.name}</h3>
                    <p class="product-price">$${product.price.toFixed(2)}</p>
                    <p class="product-description">${product.description.substring(0, 60)}...</p>
                    <button class="btn view-details" data-id="${product._id}">View Details</button>
                </div>
            `;
            productsContainer.appendChild(productCard);
        });

        // Add event listeners to view details buttons
        document.querySelectorAll('.view-details').forEach(button => {
            button.addEventListener('click', function(e) {
                e.stopPropagation();
                const productId = this.getAttribute('data-id');
                showProductDetails(productId);
            });
        });
    }

    // Show product details in modal
    async function showProductDetails(productId) {
        try {
            const response = await fetch(`/api/products/${productId}`);
            const product = await response.json();
            
            productDetail.innerHTML = `
                <h2>${product.name}</h2>
                <img src="${product.image}" alt="${product.name}">
                <p class="product-price">$${product.price.toFixed(2)}</p>
                <p>${product.description}</p>
                <p>Category: ${product.category}</p>
                <p>Status: ${product.inStock ? 'In Stock' : 'Out of Stock'}</p>
                <div class="quantity-controls">
                    <button class="btn" id="decrease-quantity">-</button>
                    <span id="quantity">1</span>
                    <button class="btn" id="increase-quantity">+</button>
                </div>
                <button class="btn" id="add-to-cart" data-id="${product._id}" 
                    ${!product.inStock ? 'disabled' : ''}>
                    Add to Cart
                </button>
            `;
            
            // Quantity controls
            let quantity = 1;
            document.getElementById('increase-quantity').addEventListener('click', function() {
                quantity++;
                document.getElementById('quantity').textContent = quantity;
            });
            
            document.getElementById('decrease-quantity').addEventListener('click', function() {
                if (quantity > 1) {
                    quantity--;
                    document.getElementById('quantity').textContent = quantity;
                }
            });
            
            // Add to cart functionality
            document.getElementById('add-to-cart').addEventListener('click', function() {
                addToCart(product, quantity);
                modal.style.display = 'none';
            });
            
            modal.style.display = 'block';
        } catch (error) {
            console.error('Error fetching product details:', error);
        }
    }

    // Add product to cart
    function addToCart(product, quantity) {
        const existingItem = cart.find(item => item._id === product._id);
        
        if (existingItem) {
            existingItem.quantity += quantity;
        } else {
            cart.push({
                _id: product._id,
                name: product.name,
                price: product.price,
                image: product.image,
                quantity: quantity
            });
        }
        
        localStorage.setItem('cart', JSON.stringify(cart));
        updateCartCount();
        alert('Product added to cart!');
    }

    // Display cart items
    function displayCart() {
        cartContainer.innerHTML = '';
        
        if (cart.length === 0) {
            cartContainer.innerHTML = '<p>Your cart is empty</p>';
            return;
        }
        
        cart.forEach(item => {
            const cartItem = document.createElement('div');
            cartItem.className = 'cart-item';
            cartItem.innerHTML = `
                <div class="cart-item-info">
                    <h3>${item.name}</h3>
                    <p>$${item.price.toFixed(2)} each</p>
                </div>
                <div>
                    <button class="btn decrease" data-id="${item._id}">-</button>
                    <span style="margin: 0 10px">${item.quantity}</span>
                    <button class="btn increase" data-id="${item._id}">+</button>
                </div>
                <div>
                    <p>$${(item.price * item.quantity).toFixed(2)}</p>
                </div>
                <button class="btn btn-danger remove" data-id="${item._id}">Remove</button>
            `;
            cartContainer.appendChild(cartItem);
        });
        
        // Add event listeners to cart buttons
        document.querySelectorAll('.increase').forEach(button => {
            button.addEventListener('click', function() {
                const productId = this.getAttribute('data-id');
                updateQuantity(productId, 1);
            });
        });
        
        document.querySelectorAll('.decrease').forEach(button => {
            button.addEventListener('click', function() {
                const productId = this.getAttribute('data-id');
                updateQuantity(productId, -1);
            });
        });
        
        document.querySelectorAll('.remove').forEach(button => {
            button.addEventListener('click', function() {
                const productId = this.getAttribute('data-id');
                removeFromCart(productId);
            });
        });
        
        // Update total
        updateTotal();
    }

    // Update item quantity in cart
    function updateQuantity(productId, change) {
        const item = cart.find(item => item._id === productId);
        if (item) {
            item.quantity += change;
            if (item.quantity < 1) {
                removeFromCart(productId);
            } else {
                localStorage.setItem('cart', JSON.stringify(cart));
                displayCart();
                updateCartCount();
            }
        }
    }

    // Remove item from cart
    function removeFromCart(productId) {
        cart = cart.filter(item => item._id !== productId);
        localStorage.setItem('cart', JSON.stringify(cart));
        displayCart();
        updateCartCount();
    }

    // Update cart total
    function updateTotal() {
        const total = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
        cartTotal.textContent = `Total: $${total.toFixed(2)}`;
    }

    // Update cart count in navigation
    function updateCartCount() {
        const cartCount = cart.reduce((sum, item) => sum + item.quantity, 0);
        const cartLink = document.querySelector('[data-page="cart"]');
        
        if (cartCount > 0) {
            cartLink.textContent = `Cart (${cartCount})`;
        } else {
            cartLink.textContent = 'Cart';
        }
    }

    // Navigation functionality
    navLinks.forEach(link => {
        link.addEventListener('click', function() {
            const pageId = this.getAttribute('data-page');
            
            // Update active link
            navLinks.forEach(l => l.classList.remove('active'));
            this.classList.add('active');
            
            // Show selected page
            pages.forEach(page => {
                page.classList.remove('active');
                if (page.id === `${pageId}-page`) {
                    page.classList.add('active');
                }
            });
            
            // If cart page, display cart
            if (pageId === 'cart') {
                displayCart();
            }
        });
    });

    // Modal functionality
    closeModal.addEventListener('click', function() {
        modal.style.display = 'none';
    });

    window.addEventListener('click', function(event) {
        if (event.target === modal) {
            modal.style.display = 'none';
        }
    });

    // Checkout functionality
    checkoutBtn.addEventListener('click', function() {
        if (cart.length === 0) {
            alert('Your cart is empty!');
            return;
        }
        
        alert('Thank you for your purchase! This is a demo, so no actual payment was processed.');
        cart = [];
        localStorage.setItem('cart', JSON.stringify(cart));
        displayCart();
        updateCartCount();
    });

    // Initialize the app
    fetchProducts();
    updateCartCount();
});