package com.amassarg.ecommerce.service;

import com.amassarg.ecommerce.dto.PaymentInfo;
import com.amassarg.ecommerce.dto.Purchase;
import com.amassarg.ecommerce.dto.PurchaseResponse;
import com.stripe.exception.StripeException;
import com.stripe.model.PaymentIntent;

public interface CheckoutService {
    PurchaseResponse placeOrder(Purchase purchase);
    PaymentIntent createPaymentIntent(PaymentInfo paymentInfo) throws StripeException;
}
