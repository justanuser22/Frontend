import { CartService } from './../../services/cart.service';
import { CartItem } from './../../commons/cart-item';
import { ActivatedRoute } from '@angular/router';
import { ProductService } from './../../services/product.service';
import { Product } from './../../commons/product';
import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-product-details',
  templateUrl: './product-details.component.html',
  styleUrls: ['./product-details.component.css']
})
export class ProductDetailsComponent implements OnInit {

  product: Product = new Product(); // Para evitar que las propiedades se lean como undefined.

  constructor(private productService: ProductService, private activatedRoute: ActivatedRoute,
              private cartService: CartService) { }

  ngOnInit(): void {
    this.activatedRoute.paramMap.subscribe(() => {
      this.handleProductDetails();
    })
  }

  handleProductDetails() {

    // Obtener el 'ID' de tipo String y lo casteamos a uno de tipo numérico.
    const theProductId : number = + this.activatedRoute.snapshot.paramMap.get('id');
    this.productService.getProduct(theProductId).subscribe(data => {
      this.product = data;
    })
  }

  addToCart() { // Para agregar al Carro desde los detalles de los productos.
   
    console.log(`Adding to cart: ${this.product.name}, ${this.product.unitPrice}`);
    const theCartItem = new CartItem(this.product);
    this.cartService.addToCart(theCartItem);
  }

}
