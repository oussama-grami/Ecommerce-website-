package com.amassarg.ecommerce.service;

import com.amassarg.ecommerce.dao.CustomerRespository;
import com.amassarg.ecommerce.dto.PaymentInfo;
import com.amassarg.ecommerce.dto.Purchase;
import com.amassarg.ecommerce.dto.PurchaseResponse;
import com.amassarg.ecommerce.entity.Customer;
import com.amassarg.ecommerce.entity.Order;
import com.amassarg.ecommerce.entity.OrderItem;
import com.stripe.Stripe;
import com.stripe.exception.StripeException;
import com.stripe.model.PaymentIntent;
import jakarta.transaction.Transactional;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.util.*;

@Service
public class CheckoutServiceImlp implements CheckoutService{

    private CustomerRespository customerRespository;
    public CheckoutServiceImlp(CustomerRespository customerRespository, @Value("${stripe.key.secret}") String secretKey) {
        this.customerRespository = customerRespository;
        Stripe.apiKey = secretKey;
    }
    @Override
    @Transactional
    public PurchaseResponse placeOrder(Purchase purchase) {
        //retrieve the order info from dto ;
        Order order = purchase.getOrder();
        //generate tracking number;
        String orderTrackingNumber = generateOrderTrackNumber();
        order.setOrderTrackingNumber(orderTrackingNumber);
        //populate order with orderItems
        Set<OrderItem> orderItems = purchase.getOrderItems();
        orderItems.forEach(item -> order.add(item));
        //populate order with billingAddress and shippingAddress
        order.setShippingAddress(purchase.getShippingAddress());
        order.setBillingAdsress(purchase.getBillingAddress());
        order.setTotalPrice(purchase.getOrder().getTotalPrice());
        //populate customer with order
        Customer customer = purchase.getCustomer();
        String email = customer.getEmail();
        Customer customerDB = customerRespository.findByEmail(email);
        if(customerDB != null) {
            customer= customerDB;
        }
        customer.add(order);
        //save to the dataBase
        customerRespository.save(customer);
        //return a response
        return new PurchaseResponse(orderTrackingNumber);
    }

    @Override
    public PaymentIntent createPaymentIntent(PaymentInfo paymentInfo) throws StripeException {
        List<String> paymentMethodTypes = new ArrayList<>();
        paymentMethodTypes.add("card");
        Map<String , Object> params = new HashMap<>();
        params.put("amount", paymentInfo.getAmount());
        params.put("currency",paymentInfo.getCurrency());
        params.put("payment_method_types",paymentMethodTypes);
        params.put("description","AMASSARG purchase");
        params.put("receipt_email",paymentInfo.getReceiptEmail());
        return  PaymentIntent.create(params);
    }
    private String generateOrderTrackNumber() {
        //generate a random UUID number
        return UUID.randomUUID().toString();
    }
}
