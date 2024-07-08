package com.amassarg.ecommerce.dao;

import com.amassarg.ecommerce.entity.Customer;
import org.springframework.data.jpa.repository.JpaRepository;

public interface CustomerRespository extends JpaRepository<Customer,Long> {
    public Customer findByEmail(String theEmail);
}
