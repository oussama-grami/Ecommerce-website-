import {Component, OnInit} from '@angular/core';
import {FormBuilder, FormControl, FormGroup, Validators} from "@angular/forms";
import {ShopFormService} from "../../services/shop-form.service";
import {Country} from "../../common/country";
import {State} from "../../common/state";
import {ViewportScroller} from "@angular/common";
import {FormValidators} from "../../validators/form-validators";
import {CartService} from "../../services/cart.service";
import {CheckoutService} from "../../services/checkout.service";
import {Route, Router} from "@angular/router";
import {Order} from "../../common/order";
import {OrderItem} from "../../common/order-item";
import {Purchase} from "../../common/purchase";
import {environment} from "../../../environments/environment.development";
import {PaymentInfo} from "../../common/payment-info";

@Component({
  selector: 'app-checkout',
  templateUrl: './checkout.component.html',
  styleUrl: './checkout.component.css'
})
export class CheckoutComponent implements  OnInit{
  checkoutFormGroup!: FormGroup;
  totalPrice: number = 0;
  totalQuantity: number =0;
  creditCardYears: number[] = [];
  creditCardMonths: number[] = [];
  countries: Country[] = [];
  shippingAdressStates: State[] = [];
  billingAddressStates: State[] = [];
  storage : Storage = localStorage;
  storageS : Storage = sessionStorage;
  //initialize the stripe API
  stripe = Stripe(environment.stripe_publishable_key);
  paymentInfo: PaymentInfo = new PaymentInfo();
  cardElement: any ;
  displayError:any = "";
  isDisabled: boolean = false ;

  constructor(private formBuilder: FormBuilder,
              private shopFormService: ShopFormService,
              private cartService: CartService,
              private checkoutService : CheckoutService,
              private router: Router,
              private viewPortScroller : ViewportScroller) {
  }
  ngOnInit() {
    this.setupStripePaymentForm();
    this.reviewCartDetails();
    const theEmail = JSON.parse(this.storageS.getItem('userEmail')!);
    this.checkoutFormGroup = this.formBuilder.group({
      customer: this.formBuilder.group({
        firstName: new FormControl('',[Validators.required,Validators.minLength(2),FormValidators.notOnlyWhitespace]),
        lastName:  new FormControl('',[Validators.required,Validators.minLength(2),FormValidators.notOnlyWhitespace]),
        email:  new FormControl(theEmail,[Validators.required,
          Validators.pattern('^[a-z0-9._%+-]+@[a-z0-9.-]+\\.[a-z]{2,4}$')])
      }),
      shippingAddress: this.formBuilder.group({
        street: new FormControl('',[Validators.required,Validators.minLength(2),FormValidators.notOnlyWhitespace]),
        city:  new FormControl('',[Validators.required,Validators.minLength(2),FormValidators.notOnlyWhitespace]),
        state:  new FormControl('',[Validators.required]),
        country: new FormControl('',[Validators.required]),
        zipCode:  new FormControl('',[Validators.required,Validators.minLength(2),FormValidators.notOnlyWhitespace])
      }),
      billingAddress: this.formBuilder.group({
        street: new FormControl('',[Validators.required,Validators.minLength(2),FormValidators.notOnlyWhitespace]),
        city:  new FormControl('',[Validators.required,Validators.minLength(2),FormValidators.notOnlyWhitespace]),
        state:  new FormControl('',[Validators.required]),
        country: new FormControl('',[Validators.required]),
        zipCode:  new FormControl('',[Validators.required,Validators.minLength(2),FormValidators.notOnlyWhitespace])
      }),
      creditCard: this.formBuilder.group({
        /*
        cardType: new FormControl('' ,[Validators.required]),
        nameOnCard:new FormControl('' ,[Validators.required,Validators.minLength(2),FormValidators.notOnlyWhitespace]),
        cardNumber:new FormControl('' ,[Validators.required,Validators.pattern('[0-9]{16}')]),
        securityCode: new FormControl('' ,[Validators.required,Validators.pattern('[0-9]{3}')]),
        expirationMonth: [''],
        expirationYear: ['']
         */
      })
    });
    /*
    //populate credit card months
    const startMonth: number = new Date().getMonth() +1 ;
    console.log("startMonth: "+startMonth);
    this.shopFormService.getCreditCardMonths(startMonth).subscribe(
      data =>{
        console.log("retrieved credit card months: "+JSON.stringify(data));
        this.creditCardMonths = data;
      }
    );

    //popultae credit card years
    this.shopFormService.getCreditCardYears().subscribe(
      data =>{
        console.log("retrieved credit card years: "+JSON.stringify(data));
        this.creditCardYears = data;
      }
    );
     */
    //populate countries
    this.shopFormService.getCountries().subscribe(
      data =>{
        this.countries =data;
      }
    )
  }
  onSubmit(){
    console.log("handling the submit button");
    if(this.checkoutFormGroup.invalid){
      this.checkoutFormGroup.markAllAsTouched();
      this.viewPortScroller.scrollToPosition([0,0]);
      return ;
    }
    // set up order
    let order = new Order();
    order.totalPrice = this.totalPrice;
    order.totalQuantity = this.totalQuantity
    //get cart items
    const cartItems  = this.cartService.cartItems;
    //create orderItems from cartItems
    let orderItems :OrderItem[] = cartItems.map(cartItem => new OrderItem(cartItem));
    //set up purchase
    let purchase = new Purchase();
    //populate purchase - customer
      purchase.customer = this.checkoutFormGroup.controls['customer'].value;
    //populate purchase -shipping address
    purchase.shippingAddress = this.checkoutFormGroup.controls['shippingAddress'].value;
    const shippingState: State = JSON.parse(JSON.stringify(purchase.shippingAddress.state));
    const shippingCountry: Country = JSON.parse(JSON.stringify(purchase.shippingAddress.country));
    purchase.shippingAddress.state = shippingState.name ;
    purchase.shippingAddress.country = shippingCountry.name ;
    //populate purchase - billing address
    purchase.billingAddress = this.checkoutFormGroup.controls['billingAddress'].value;
    const billingState: State = JSON.parse(JSON.stringify(purchase.billingAddress.state));
    const billingCountry: Country = JSON.parse(JSON.stringify(purchase.billingAddress.country));
    purchase.billingAddress.state = billingState.name ;
    purchase.billingAddress.country = billingCountry.name ;
    // populate purchase -order and orderItems
    purchase.order = order ;
    purchase.orderItems = orderItems;
    //compute payment info
    this.paymentInfo.amount = Math.round(this.totalPrice * 100);
    this.paymentInfo.currency = "USD";
    this.paymentInfo.receiptEmail = purchase.customer.email;
    //call REST API  via the checkout service
    if(!this.checkoutFormGroup.invalid && this.displayError.textContent === ""){
      this.isDisabled = true;
      this.checkoutService.createPaymentIntent(this.paymentInfo).subscribe(
        (paymentIntentResponse) => {
          this.stripe.confirmCardPayment(paymentIntentResponse.client_secret , {
            payment_method: {
              card: this.cardElement,
              billing_details:{
                email:purchase.customer.email,
                name:`${purchase.customer.firstName} ${purchase.customer.lastName}`,
                address: {
                  line1:purchase.billingAddress.street,
                  city: purchase.billingAddress.city,
                  postal_code: purchase.billingAddress.zipCode,
                  country: this.billingAddressCountry?.value.code
                }
              }
            }
          },{
            handleActions: false})
            .then((result: any) =>{
              if(result.error){
                //inform the customer there was an error
                alert(`There was an error: ${result.error.message}`)
                this.isDisabled = false;
              }else{
                //call REST API via the checkoutService
                this.checkoutService.placeOrder(purchase).subscribe({
                  next:(response:any) => {
                    alert(`Your order has been received.\n Order tracking number: ${response.orderTrackingNumber}`)
                    this.resetCart();
                    this.isDisabled = false ;
                  },
                  error:(err:any) => {
                    alert(`There was an error: ${err.message}`);
                    this.isDisabled = false ;
                  }
                })            }
            } );
        }
      );
    }else{
      this.checkoutFormGroup.markAllAsTouched();
      return ;
    }
  }
 get firstName() {
    return this.checkoutFormGroup.get('customer.firstName');
  }
  get lastName() {
    return this.checkoutFormGroup.get('customer.lastName');
  }
  get email() {
    return this.checkoutFormGroup.get('customer.email');
  }
  get shippingAddressStreet(){return this.checkoutFormGroup.get('shippingAddress.street')};
  get shippingAddressCity(){return this.checkoutFormGroup.get('shippingAddress.city')};
  get shippingAddressState(){return this.checkoutFormGroup.get('shippingAddress.state')};
  get shippingAddressZipCode(){return this.checkoutFormGroup.get('shippingAddress.zipCode')};
  get shippingAddressCountry(){return this.checkoutFormGroup.get('shippingAddress.country')};

  get billingAddressStreet(){return this.checkoutFormGroup.get('billingAddress.street')};
  get billingAddressCity(){return this.checkoutFormGroup.get('billingAddress.city')};
  get billingAddressState(){return this.checkoutFormGroup.get('billingAddress.state')};
  get billingAddressZipCode(){return this.checkoutFormGroup.get('billingAddress.zipCode')};
  get billingAddressCountry(){return this.checkoutFormGroup.get('billingAddress.country')};
  get creditCardType(){return this.checkoutFormGroup.get('creditCard.cardType')};
  get creditCardNameOnCard(){return this.checkoutFormGroup.get('creditCard.nameOnCard')};
  get creditCardNumber(){return this.checkoutFormGroup.get('creditCard.cardNumber')};
  get creditCardSecurityCode(){return this.checkoutFormGroup.get('creditCard.securityCode')};
  copyShippingAddressToBillingAddress(event:Event) {
    if((<HTMLInputElement>event.target).checked){
      this.checkoutFormGroup.get('billingAddress')!.setValue(this.checkoutFormGroup.get('shippingAddress')!.value)
      //bug fix for states
      this.billingAddressStates = this.shippingAdressStates;
    }else{
      this.checkoutFormGroup.get('billingAddress')!.reset();
      //bug fix for states
      this.billingAddressStates = [];
    }
  }

  handleMonthsAndYears() {
    const creditCardFormGroup = this.checkoutFormGroup.get('creditCard');
    const currentYear: number = new Date().getFullYear();
    const selectedYear: number = Number(creditCardFormGroup!.value.expirationYear);
    let startMonth: number ;
    if(currentYear == selectedYear){
      startMonth = new Date().getMonth() +1;
    }else{
      startMonth = 1;
    }
    this.shopFormService.getCreditCardMonths(startMonth).subscribe(
      data =>{
        this.creditCardMonths = data ;
      }
    )
  }
  getStates(formGroupName: string) {
    const formGroup = this.checkoutFormGroup.get(formGroupName);
    const countryCode = formGroup?.value.country.code;
    const countryName = formGroup?.value.country.name;
    this.shopFormService.getStates(countryCode).subscribe(
      data => {
        if(formGroupName === 'shippingAddress'){
          this.shippingAdressStates = data ;
        }else{
          this.billingAddressStates = data ;
        }
        formGroup?.get('state')!.setValue(data[0]);
      }
    )
  }

  private reviewCartDetails() {
    this.cartService.totalQuantity.subscribe(
      data => {
        this.totalQuantity = data;
      }
    );
    this.cartService.totalPrice.subscribe(
      data => {
        this.totalPrice = data;
      }
    )
  }

  private resetCart() {
    // reset Cart data
    this.cartService.cartItems= [];
    this.cartService.totalPrice.next(0);
    this.cartService.totalQuantity.next(0) ;
    this.storage.setItem('cartItems',JSON.stringify([]));

    //reset form data
      this.checkoutFormGroup.reset();
    //navigate back to the products page
    this.router.navigateByUrl("/products");
  }

  private setupStripePaymentForm() {
    var elements = this.stripe.elements();
    this.cardElement = elements.create('card',{hidePostalCode: true});
    this.cardElement.mount('#card-element');
    this.cardElement.on('change',(event:any)=> {
      this.displayError = document.getElementById('card-errors');
      if(event.complete){
        this.displayError.textContent = "";
      }else if (event.error){
        this.displayError.textContent = event.error.message;
      }
    })
  }
}
