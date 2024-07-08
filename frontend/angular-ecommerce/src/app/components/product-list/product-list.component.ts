import {Component, OnInit} from '@angular/core';
import {ProductService} from "../../services/product.service";
import {Product} from "../../common/product";
import {ActivatedRoute} from "@angular/router";
import {CartItem} from "../../common/cart-item";
import {CartService} from "../../services/cart.service";

@Component({
  selector: 'app-product-list',
  templateUrl: './product-list-grid.component.html',
  styleUrl: './product-list.component.css'
})
export class ProductListComponent implements OnInit {
  products: Product[] = [];
  currentCategoryId: number = 1;
  previousCategoryId: number =1;
  searchMode: boolean = false;
  //properties for pagination
  thePageNumber: number =1;
  thePageSize: number =5;
  theTotalElements: number =0;
  previousKeyWord:string = "";

  constructor(private productService: ProductService,
              private route: ActivatedRoute,
              private cartService: CartService) {
  }

  ngOnInit(): void {
    this.route.paramMap.subscribe(() => {
      this.listProducts();
    });
  }

  listProducts() {
    this.searchMode = this.route.snapshot.paramMap.has('keyword');
    if(this.searchMode) {
      this.handleSearchProducts();
    }
    else {
      this.handleListProduct();
    }
  }
  handleSearchProducts() {
    const theKeyword: string = this.route.snapshot.paramMap.get('keyword')!;
    if(this.previousKeyWord!=theKeyword){
      this.thePageNumber = 1;
    }
    this.previousKeyWord=theKeyword;
    this.productService.searchProductPaginate(this.thePageNumber-1,
                                                this.thePageSize,
                                                theKeyword).subscribe(this.processResult());
  }
  handleListProduct() {
    //check if "id" parameter is available
    const hasCategoryId : boolean =  this.route.snapshot.paramMap.has('id');
    if(hasCategoryId){
      this.currentCategoryId = +this.route.snapshot.paramMap.get('id')!;
    }else{
      this.currentCategoryId=1;
    }
    if(this.previousCategoryId!=this.currentCategoryId){
      this.thePageNumber = 1;
    }
    this.previousCategoryId = this.currentCategoryId;
    this.productService.getProductListPaginate(this.thePageNumber-1,this.thePageSize,this.currentCategoryId).subscribe(this.processResult())
  }
  updatePageSize(pageSize :string){
    this.thePageSize = +pageSize;
    this.thePageNumber = 1;
    this.listProducts();
  }
  processResult(){
    return(data : any)=>{
      this.products = data._embedded.products;
      this.thePageNumber = data.page.number+1;
      this.thePageSize  = data.page.size;
      this.theTotalElements = data.page.totalElements;
    }
  }
  addToCart(theProduct: Product){
    const theCartItem = new CartItem(theProduct);
    this.cartService.addToCart(theCartItem);
  }

  }
