import { Injectable } from '@angular/core';
import {CartItem} from "../common/cart-item";
import {BehaviorSubject, Subject} from "rxjs";

@Injectable({
  providedIn: 'root'
})
export class CartService {
  cartItems: CartItem[]=[];
  totalPrice:Subject<number> = new BehaviorSubject<number>(0);
  totalQuantity:Subject<number> = new BehaviorSubject<number>(0);
  storage : Storage = localStorage;
  constructor() {
    //read data from storage
    let data =JSON.parse(this.storage.getItem('cartItems') || '[]');
    if(data != null){
      this.cartItems = data ;
      this.computeCartTotals();
    }
  }
  persistCartItems(){
    this.storage.setItem('cartItems',JSON.stringify(this.cartItems));
  }
  addToCart(theCartItem : CartItem) {
    let alreadyExistingInCart: boolean = false;
    let existingCartItem: any  = undefined;

    if (this.cartItems.length != 0) {
     existingCartItem = this.cartItems.find(cartItem => {
       return cartItem.id == theCartItem.id;
     })
      alreadyExistingInCart = (existingCartItem != undefined);
    }
    if(alreadyExistingInCart){
      existingCartItem!.quantity++;
    }else{
      this.cartItems.push(theCartItem);
    }
    console.log(this.cartItems.length);
    this.computeCartTotals();
  }
  computeCartTotals(){
    let totalPriceValue: number = 0;
    let totalQuantityValue: number = 0;
    for(let cartItem of this.cartItems){
      totalPriceValue += cartItem.quantity * cartItem.unitPrice;
      totalQuantityValue += cartItem.quantity;
    }
    this.totalPrice.next(totalPriceValue);
    this.totalQuantity.next(totalQuantityValue);

    this.persistCartItems();
  }

  decrementQuantity(cartItem: CartItem) {
    cartItem.quantity--;
    if(cartItem.quantity === 0){
      this.remove(cartItem);
    }
    else{
      this.computeCartTotals();
    }
  }

  remove(cartItem: CartItem) {
    const itemIndex = this.cartItems.findIndex(
      tempCartItem => tempCartItem.id == cartItem.id   );
    if(itemIndex > -1){
      this.cartItems.splice(itemIndex,1);
      this.computeCartTotals();
    }
  }
}
