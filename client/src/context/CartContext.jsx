import React, { createContext, useContext, useState, useEffect } from 'react';

const CartContext = createContext();

export const CartProvider = ({ children }) => {
  const [cartItems, setCartItems] = useState(() => {
    try {
      const saved = localStorage.getItem('lavanya_cart');
      return saved ? JSON.parse(saved) : [];
    } catch (e) {
      return [];
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem('lavanya_cart', JSON.stringify(cartItems));
    } catch (e) {}
  }, [cartItems]);

  /**
   * Add item to cart
   * @param {object} product - Full product object
   * @param {string} itemType - 'purchase' or 'rental'
   * @param {number} quantity - Quantity units
   * @param {object} rentalDetails - { startDate, endDate, days, rentalPrice } if rental
   */
  const addItem = (product, itemType = 'purchase', quantity = 1, rentalDetails = null) => {
    setCartItems((prev) => {
      const effectivePrice = product.discountPrice && product.discountPrice > 0 ? product.discountPrice : product.price;
      const advancePct = product.advancePercentage || 20;

      if (itemType === 'rental') {
        // Rental items are unique by product ID + date range
        const rentalKey = `${product._id}_${rentalDetails.startDate}_${rentalDetails.endDate}`;
        const existingIdx = prev.findIndex((i) => i.rentalKey === rentalKey);

        const subtotal = (rentalDetails.rentalPrice || 0) * quantity;
        const itemAdvance = Math.round((subtotal * advancePct) / 100);

        if (existingIdx > -1) {
          const updated = [...prev];
          const newQty = updated[existingIdx].quantity + quantity;
          const newSubtotal = (rentalDetails.rentalPrice || 0) * newQty;
          updated[existingIdx] = {
            ...updated[existingIdx],
            quantity: newQty,
            subtotal: newSubtotal,
            advanceAmount: Math.round((newSubtotal * advancePct) / 100),
            remainingAmount: newSubtotal - Math.round((newSubtotal * advancePct) / 100)
          };
          return updated;
        }

        return [
          ...prev,
          {
            productId: product._id,
            rentalKey,
            name: product.name,
            image: product.images[0] || '',
            categoryName: product.category?.name || 'Rental',
            itemType: 'rental',
            unitPrice: rentalDetails.rentalPrice,
            quantity,
            subtotal,
            paymentMode: product.paymentMode,
            advancePercentage: advancePct,
            advanceAmount: itemAdvance,
            remainingAmount: subtotal - itemAdvance,
            rentalStartDate: rentalDetails.startDate,
            rentalEndDate: rentalDetails.endDate,
            rentalDays: rentalDetails.days,
            securityDeposit: (product.securityDeposit || 0) * quantity
          }
        ];
      }

      // Ordinary purchase item
      const existingIdx = prev.findIndex((i) => i.productId === product._id && i.itemType === 'purchase');
      const subtotal = effectivePrice * quantity;
      const itemAdvance = Math.round((subtotal * advancePct) / 100);

      if (existingIdx > -1) {
        const updated = [...prev];
        const newQty = updated[existingIdx].quantity + quantity;
        const newSubtotal = effectivePrice * newQty;
        updated[existingIdx] = {
          ...updated[existingIdx],
          quantity: newQty,
          subtotal: newSubtotal,
          advanceAmount: Math.round((newSubtotal * advancePct) / 100),
          remainingAmount: newSubtotal - Math.round((newSubtotal * advancePct) / 100)
        };
        return updated;
      }

      return [
        ...prev,
        {
          productId: product._id,
          name: product.name,
          image: product.images[0] || '',
          categoryName: product.category?.name || 'Product',
          itemType: 'purchase',
          unitPrice: effectivePrice,
          quantity,
          subtotal,
          paymentMode: product.paymentMode,
          advancePercentage: advancePct,
          advanceAmount: itemAdvance,
          remainingAmount: subtotal - itemAdvance
        }
      ];
    });
  };

  const removeItem = (identifier) => {
    setCartItems((prev) =>
      prev.filter((i) => (i.rentalKey ? i.rentalKey !== identifier : i.productId !== identifier))
    );
  };

  const updateQuantity = (identifier, newQty) => {
    if (newQty <= 0) {
      removeItem(identifier);
      return;
    }

    setCartItems((prev) =>
      prev.map((item) => {
        const match = item.rentalKey ? item.rentalKey === identifier : item.productId === identifier;
        if (!match) return item;

        const subtotal = item.unitPrice * newQty;
        const itemAdvance = Math.round((subtotal * (item.advancePercentage || 20)) / 100);

        return {
          ...item,
          quantity: newQty,
          subtotal,
          advanceAmount: itemAdvance,
          remainingAmount: subtotal - itemAdvance,
          ...(item.itemType === 'rental' && {
            securityDeposit: (item.securityDeposit / item.quantity) * newQty
          })
        };
      })
    );
  };

  const clearCart = () => {
    setCartItems([]);
    localStorage.removeItem('lavanya_cart');
  };

  const itemCount = cartItems.reduce((sum, item) => sum + item.quantity, 0);
  const totalOrderValue = cartItems.reduce((sum, item) => sum + item.subtotal, 0);
  const totalAdvanceDue = cartItems.reduce((sum, item) => sum + item.advanceAmount, 0);
  const totalBalanceDue = totalOrderValue - totalAdvanceDue;

  return (
    <CartContext.Provider
      value={{
        cartItems,
        itemCount,
        totalOrderValue,
        totalAdvanceDue,
        totalBalanceDue,
        addItem,
        removeItem,
        updateQuantity,
        clearCart
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => useContext(CartContext);
