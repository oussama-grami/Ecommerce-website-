package com.amassarg.ecommerce.entity;

import jakarta.persistence.*;
import lombok.Data;

@Entity
@Data
@Table(name = "state")
public class State {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id")
    private int id;
    @Column(name = "name")
    private String name;
   @ManyToOne(fetch = FetchType.EAGER)
   @JoinColumn(name = "country_id")
    private Country country;
}
