import { ProductCategory } from './../commons/product-category';
import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable} from 'rxjs';
import { map } from 'rxjs/operators'
import { Product } from '../commons/product';

@Injectable({
  providedIn: 'root'
})
export class ProductService {

  private baseUrl = 'http://localhost:8080/api/products';
  private categoryUrl = 'http://localhost:8080/api/products-categories';

  constructor(private http: HttpClient) { }

  getProductsList(theCategoryId: number): Observable<Product[]> { // Mapeamos los datos JSON de la Spring Data Rest a un arreglo de Productos.
    
    // Este método ese el que se conecta con los datos de la BD y al implementarlo, traerá los productos basándose en el ID de la categoría.
    // Se necesita reconstruir la URL dependiendo del 'id' de la categoría.
    const searchURL = `${this.baseUrl}/search/findByCategoryId?id=${theCategoryId}`;
    return this.getProducts(searchURL);
  }

  getProductsListPaginate(thePage: number, thePageSize: number, theCategoryId: number): Observable<GetResponseProducts> { 
    
    // URL reforzada para traer productos y elegir la cantidad que se quieren traer gracias a la paginación.
    const searchURL = `${this.baseUrl}/search/findByCategoryId?id=${theCategoryId}`
                      + `&page=${thePage}&size=${thePageSize}`; 
    return this.http.get<GetResponseProducts>(searchURL);
  }

  getProductCategories() : Observable<ProductCategory[]> { // Mapeamos los datos JSON de la Spring Data Rest a el arreglo de ProductCategory.
    
    return this.http.get<GetResponseProductsCategory>(this.categoryUrl).pipe(
      map(response => response._embedded.productCategory)
    );
  }

  searchProducts(theKeyword: string) : Observable<Product[]> {
    
    // refactorizar la URL basandose en la palabra clave.
    const searchURL = `${this.baseUrl}/search/findByNameContaining?name=${theKeyword}`;
    return this.getProducts(searchURL);
  }

  searchProductsPaginate(thePage: number, thePageSize: number, theKeyword: string): Observable<GetResponseProducts> { 
    
    // URL reforzada para traer producto/s que cohincidan con lo ingresado (agregando la pagiación).
    const searchURL = `${this.baseUrl}/search/findByNameContaining?name=${theKeyword}`
                      + `&page=${thePage}&size=${thePageSize}`; 
    return this.http.get<GetResponseProducts>(searchURL);
  }


  private getProducts(searchURL: string): Observable<Product[]> {
    return this.http.get<GetResponseProducts>(searchURL).pipe(
      map(response => response._embedded.products)
    );
  }

  getProduct(theProductId: number) : Observable<Product> {

    // refactorizar la URL basandose en el ID del producto.
    const productUrl = `${this.baseUrl}/${theProductId}`;
    return this.http.get<Product>(productUrl);
  }
}

interface GetResponseProducts { // Interface para ayudar a traer los datos del JSON de 'products'.
  _embedded: {
    products: Product[];
  },
  page: { // Metadata correspondiente a page.
    size: number,
    totalElements: number,
    totalPages: number,
    number: number
  }
}

interface GetResponseProductsCategory { // Interface para ayudar a traer los datos del JSON de 'products-categories'.
  _embedded: {
    productCategory: ProductCategory[];
  }
}
