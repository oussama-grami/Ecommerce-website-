import { Injectable } from '@angular/core';
import {Observable, of} from "rxjs";
import {HttpClient} from "@angular/common/http";
import {map} from "rxjs/operators";
import {Country} from "../common/country";
import { State } from '../common/state';
import {environment} from "../../environments/environment";

@Injectable({
  providedIn: 'root'
})
export class ShopFormService {
  private countriesUrl = environment.shopUrl+'/countries';
  private statesUrl = environment.shopUrl+'/states';

  constructor(private httpClient: HttpClient) { }
  getCountries():Observable<Country[]>{

    return this.httpClient.get<GetResponseCountries>(this.countriesUrl).pipe(
      map(
        data => data._embedded.countries))
  }
  getStates(theCountryCode: string ):Observable<State[]>{
    const searchUrl =`${this.statesUrl}/search/findByCountryCode?code=${theCountryCode}`;
    return this.httpClient.get<GetResponseState>(searchUrl).pipe(
      map(data => data._embedded.states)
    )
  }
  getCreditCardMonths(startMonth: number):Observable<number[]>{
    let data: number[] = [];
    for(let theMonth = startMonth ;theMonth<= 12;theMonth++){
      data.push(theMonth);
    }
    return of(data);
  }
  getCreditCardYears():Observable<number[]>{
    let data: number[] = [];
    const startYear: number = new Date().getFullYear();
    const endYear: number = startYear + 10 ;
    for(let theYear = startYear ;theYear <= endYear ;theYear++ ){
      data.push(theYear);
    }
    return of(data);
  }

}
interface GetResponseCountries{
  _embedded:{
    countries: Country[]
  }
}
interface GetResponseState{
  _embedded:{
    states :State[]
  }
}
