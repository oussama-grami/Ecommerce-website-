import { Injectable } from '@angular/core';
import {HttpClient } from '@angular/common/http';
import {Observable} from "rxjs";
import{map} from 'rxjs/operators'
import {Product} from "../common/product";
import {ProductCategory} from "../common/product-category";
import {environment} from "../../environments/environment";
@Injectable({
  providedIn: 'root'
})
export class ProductService {
  private baseUrl =environment.shopUrl+'/products';
  private categoryUrl = environment.shopUrl+'/product-category';
  constructor(private httpClient: HttpClient ){}
  getProduct(theProductId: number):Observable<Product>{
    const productUrl = `${this.baseUrl}/${theProductId}`;
    return this.httpClient.get<Product>(productUrl);
  }
  getProductListPaginate(thePage: number,
                         thePageSize: number ,
                         theCategoryId : number): Observable<GetResponseProducts>{
    const searchUrl = `${this.baseUrl}/search/findByCategoryId?id=${theCategoryId}&page=${thePage}&size=${thePageSize}`
    return this.httpClient.get<GetResponseProducts>(searchUrl);
  }
  getProductList(theCategoryId : number): Observable<Product[]>{
  const searchUrl = `${this.baseUrl}/search/findByCategoryId?id=${theCategoryId}`
    return this.httpClient.get<GetResponseProducts>(searchUrl).pipe(
      map(response => response._embedded.products)
    );
  }
  getProductCategories():Observable<ProductCategory[]>{
    return this.httpClient.get<GetResponseProductCategory>(this.categoryUrl).pipe(
      map(response => response._embedded.productCategory)
    );
  }

  searchProducts(theKeyword: string):Observable<Product[]> {
    const searchUrl = `${this.baseUrl}/search/findByNameContaining?name=${theKeyword}`;
    return this.httpClient.get<GetResponseProducts>(searchUrl).pipe(
      map(response => response._embedded.products)
    )
  }
  searchProductPaginate(thePage: number,
                         thePageSize: number ,
                         theKeyWord : string): Observable<GetResponseProducts>{
    const searchUrl = `${this.baseUrl}/search/findByNameContaining?name=${theKeyWord}&page=${thePage}&size=${thePageSize}`
    return this.httpClient.get<GetResponseProducts>(searchUrl);
  }
}
interface GetResponseProducts{
  _embedded :{
    products: Product[]
  },
  page:{
    size: number;
    totalElements: number,
    totalPages: number,
    number: number
  }
}
interface GetResponseProductCategory{
  _embedded :{
    productCategory: ProductCategory[]
  }
}
