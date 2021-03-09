import { State } from './../commons/state';
import { HttpClient } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { Injectable } from '@angular/core';
import { Country } from '../commons/country';
import { map } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class Luv2ShopFormService {

  // En esta sección se añadirán métodos para lograr popular los años y meses de el form 'Credit Card'.
  // También para popular los países y sus respectivos estados.

  // Endpoints correspondientes a los countries y states:
  private countriesUrl = 'http://localhost:8080/api/countries';
  private statesUrl = 'http://localhost:8080/api/states';
  

  constructor(private http: HttpClient) { }

  getCreditCardMonths(startMonth: number) : Observable<number[]> { // Para popular la lista desplegable de los Meses.

    let data: number[] = [];
    // construir un array para la lista desplegable correspondiente a los Meses.
    // empezar por el mes actual y desplegar hasta el mes 12.
    for (let theMonth = startMonth; theMonth <= 12; theMonth++) {
      data.push(theMonth);
    }
    return of(data); // El operador 'of' envolverá un objeto como un Observable.
  }

  getCreditCardYears() : Observable<number[]> { // Para popular la lista desplegable de los Años.

  let data: number[] = [];
  // construir un array para la lista desplegable correspondiente a los Años.
  // empezar por el año actual y desplegar hasta los próximos 10 años.
  const startYear: number = new Date().getFullYear(); // Me devolverá el actual año.
  const endYear: number = startYear + 10; // Le sumamos 10 años, para indicar el fin de la lista desplegable (en años obviamente).
  for (let theYear = startYear; theYear <= endYear; theYear++) {
    data.push(theYear);
  }
    return of(data); // El operador 'of' envolverá un objeto como un Observable.
  }

  getCountries(): Observable<Country[]> { // Trayendo los 'countries' de nuestro JSON.

    return this.http.get<GetResponseCountries>(this.countriesUrl).pipe(
      map(response => response._embedded.countries)
    );
  }

  getStates(theCountryCode: string): Observable<State[]> {

    // URL de búsqueda para traer los estados, dependiendo de los códigos de los países:
    const searchStatesUrl = `${this.statesUrl}/search/findByCountryCode?code=${theCountryCode}`;

    return this.http.get<GetResponseStates>(searchStatesUrl).pipe(
      map(response => response._embedded.states)
    );
  }

}

interface GetResponseCountries { // Interface para lograr mapear los datos JSON correspondiente a 'countries'.
  _embedded: {
    countries: Country[];
  }
}

interface GetResponseStates { // Interface para lograr mapear los datos JSON correspondiente a 'states'.
  _embedded: {
    states: State[];
  }
}
