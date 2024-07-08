import {Component, OnInit} from '@angular/core';
import {CartService} from "../../services/cart.service";

@Component({
  selector: 'app-cart-status',
  templateUrl: './cart-status.component.html',
  styleUrl: './cart-status.component.css'
})
export class CartStatusComponent implements OnInit{
  totalPrice: number = 0.00;
  totalQuantity: number = 0;
  constructor(private cartService:CartService) {
  }
  ngOnInit() {
    this.updateCartStatus();
  }

  private updateCartStatus() {
    this.cartService.totalPrice.subscribe(
      totalPrice =>{
        this.totalPrice= totalPrice;
      }
    );
    this.cartService.totalQuantity.subscribe(
      totalQuantity => {
        this.totalQuantity = totalQuantity;
      }
    )
  }
}
