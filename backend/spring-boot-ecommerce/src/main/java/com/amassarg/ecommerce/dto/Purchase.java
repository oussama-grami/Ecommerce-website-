package com.amassarg.ecommerce.dto;

import com.amassarg.ecommerce.entity.Address;
import com.amassarg.ecommerce.entity.Customer;
import com.amassarg.ecommerce.entity.Order;
import com.amassarg.ecommerce.entity.OrderItem;
import lombok.Data;

import java.util.Set;

@Data
public class Purchase {
    private Customer customer;
    private Address shippingAddress;
    private Address billingAddress;
    private Order order;
    private Set<OrderItem> orderItems;


}
