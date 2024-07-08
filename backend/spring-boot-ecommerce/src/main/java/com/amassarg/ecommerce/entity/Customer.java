package com.amassarg.ecommerce.entity;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;
import org.springframework.context.annotation.EnableMBeanExport;

import java.util.HashSet;
import java.util.List;
import java.util.Set;

@Entity
@Table(name="customer")
@Getter
@Setter
public class Customer {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id")
    private Long id;

    @Column(name = "first_name")
    private String firstName;

    @Column(name = "last_name")
    private String lastName;

    @Column(name = "email")
    private String email;

    @OneToMany(
            mappedBy = "customer",cascade = CascadeType.ALL
    )
    private Set<Order> orders = new HashSet<Order>();
    public void add(Order item){
        if(item != null){
            if(orders == null){
                orders = new HashSet<>();
            }
            orders.add(item);
            item.setCustomer(this);}
    }
}
