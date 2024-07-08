import { Injectable } from '@angular/core';
import {HttpClient} from "@angular/common/http";
import {OrderHistory} from "../common/order-history";
import {environment} from "../../environments/environment";

@Injectable({
  providedIn: 'root'
})
export class OrderHistoryService {
  private orderUrl = environment.shopUrl+'/orders';
  constructor(private httpClient: HttpClient) { }
  getOrderHistory(theEmail: string){
    const orderHistoryUrl = `${this.orderUrl}/search/findByCustomerEmailOrderByDateCreatedDesc?email=${theEmail}`;
    return this.httpClient.get<GetResponseOrderHistory>(orderHistoryUrl)
  }

}
interface GetResponseOrderHistory{
  _embedded:{
    orders:OrderHistory[];
  }
}
