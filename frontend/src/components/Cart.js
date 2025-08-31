import React, { useState, useEffect } from 'react';

const Cart = () => {
  const [cartItems, setCartItems] = useState([]);

  useEffect(() => {
    const cart = JSON.parse(localStorage.getItem('cart')) || [];
    setCartItems(cart);
  }, []);

  const updateQuantity = (id, newQuantity) => {
    if (newQuantity < 1) return;
    
    const updatedCart = cartItems.map(item => 
      item._id === id ? { ...item, quantity: newQuantity } : item
    );
    
    setCartItems(updatedCart);
    localStorage.setItem('cart', JSON.stringify(updatedCart));
  };

  const removeItem = (id) => {
    const updatedCart = cartItems.filter(item => item._id !== id);
    setCartItems(updatedCart);
    localStorage.setItem('cart', JSON.stringify(updatedCart));
  };

  const getTotal = () => {
    return cartItems.reduce((total, item) => total + (item.price * item.quantity), 0).toFixed(2);
  };

  return (
    <div className="container">
      <h1>Shopping Cart</h1>
      <div className="cart">
        {cartItems.length === 0 ? (
          <p>Your cart is empty</p>
        ) : (
          <>
            {cartItems.map(item => (
              <div key={item._id} className="cart-item">
                <div className="cart-item-info">
                  <h3>{item.name}</h3>
                  <p>${item.price} each</p>
                </div>
                <div>
                  <button onClick={() => updateQuantity(item._id, item.quantity - 1)}>
                    -
                  </button>
                  <span style={{ margin: '0 10px' }}>{item.quantity}</span>
                  <button onClick={() => updateQuantity(item._id, item.quantity + 1)}>
                    +
                  </button>
                </div>
                <div>
                  <p>${(item.price * item.quantity).toFixed(2)}</p>
                </div>
                <button 
                  className="btn btn-danger" 
                  onClick={() => removeItem(item._id)}
                >
                  Remove
                </button>
              </div>
            ))}
            <div className="cart-total">
              <h3>Total: ${getTotal()}</h3>
              <button className="btn">Checkout</button>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default Cart;