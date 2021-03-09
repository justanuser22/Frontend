import { CartService } from './../../services/cart.service';
import { CartItem } from './../../commons/cart-item';
import { Product } from './../../commons/product';
import { ProductService } from './../../services/product.service';
import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-products-list',
  templateUrl: './products-list-grid.component.html',
  styleUrls: ['./products-list.component.css']
})
export class ProductsListComponent implements OnInit {

  products: Product[] = [];
  currentCategoryId: number = 1;
  previousCategoryId: number = 1;
  searchMode: boolean = false;

  // Nuevas propiedades para lograr la paginación:
  thePageNumber: number = 1; // En vez de 0, en este caso '1'.
  thePageSize: number = 5;
  theTotalElements: number = 0;

  previousKeyword: string = null;

  constructor(private productService: ProductService, private activatedRoute: ActivatedRoute,
              private cartService: CartService) { }

  ngOnInit(): void {
    // Traer los productos dependendiendo de la categoría (gracias a el 'id').
    this.activatedRoute.paramMap.subscribe(() => { 
      this.listProducts();
    })
  }

  listProducts() {

    // Chequear si estamos realizando una búsqueda o no
    this.searchMode = this.activatedRoute.snapshot.paramMap.has('keyword'); // true o false.

    if (this.searchMode) { // Si estamos realizando una búsqueda...
       this.handleSearchProducts();
    } else {
      this.handleListProducts();
    }
  }

  handleListProducts() {

    // Chequear si el 'id' está habilitado.
    const hasCategoryId: boolean = this.activatedRoute.snapshot.paramMap.has('id');

    if (hasCategoryId) {
      // Obtener el parámetro 'ID', para ello debemos de castear de number a string.
      this.currentCategoryId = + this.activatedRoute.snapshot.paramMap.get('id');
    } else {
      // Si no pudimos obtener el 'ID' deseado, por defecto se nos traerán los productos de la categoría '1'.
      this.currentCategoryId = 1;
    }

    // Comprobar si tenemos una categoría diferente a la anterior.
    // Nota: Angular reutilizará un componente si está siendo visto actualmente.
    // Si tenemos una 'category_id' diferente que la anterior, entonces debemos de setear a la página a '1'.
    if (this.previousCategoryId != this.currentCategoryId) {
      this.thePageNumber = 1
    }

    this.previousCategoryId = this.currentCategoryId;
    console.log(`currentCategoryId=${this.currentCategoryId}, thePageNumber=${this.thePageNumber}`);

    // Obtener los productos dependiendo de la categoría.
    this.productService.getProductsListPaginate(this.thePageNumber -1, this.thePageSize, this.currentCategoryId)
    .subscribe(this.processResult());
    
  }

  handleSearchProducts() {

    const theKeyword: string = this.activatedRoute.snapshot.paramMap.get('keyword'); // Obtenemos el parámetro de la ruta.
    // Si tenemos una diferente palabra clave a la anterior
    // entonces settear 'thePageNumber' a 1.
    if (this.previousKeyword != theKeyword) {
      this.thePageNumber = 1;
    }
    this.previousKeyword = theKeyword;
    console.log(`keyword=${theKeyword}, thePageNumber=${this.thePageNumber}`);
    // Ahora buscar por los productos usando esta/s palabra/s clave/s sumado ahora con paginación.
    this.productService.searchProductsPaginate(this.thePageNumber - 1, this.thePageSize, theKeyword)
                        .subscribe(this.processResult());
    
  }

  updatePageSize(pageSize: number) { // Para actualizar los selects de la lista desplegable.
     this.thePageSize = pageSize;
     this.thePageNumber = 1;
     this.listProducts();
  }

  addToCart(theProduct: Product) { // Este método servirá para actualizar las cantidades y el precio total.
   
    console.log(`Adding to cart: ${theProduct.name}, ${theProduct.unitPrice}`);
    const theCartItem = new CartItem(theProduct);
    this.cartService.addToCart(theCartItem)
  }

  processResult() { // Retornamos el JSON de 'page' de /products
    return data => {
      this.products = data._embedded.products;
      this.thePageNumber = data.page.number + 1; // Esto es debido a que en Spring Data Rest: las páginas están basadas en 0.
      this.thePageSize = data.page.size;
      this.theTotalElements = data.page.totalElements;
    }
  }

}
