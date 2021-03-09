import { CartService } from './../../services/cart.service';
import { CartItem } from './../../commons/cart-item';
import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-cart-details',
  templateUrl: './cart-details.component.html',
  styleUrls: ['./cart-details.component.css']
})
export class CartDetailsComponent implements OnInit {

  cartItems: CartItem[] = [];
  totalPrice: number = 0;
  totalQuantity: number = 0;

  constructor(private cartService: CartService) { }

  ngOnInit(): void {
    this.listCartDetails();
  }

  listCartDetails() {

    // Traer los items alojados en el Carro para poder desplegarlos en esta tabla.
    this.cartItems = this.cartService.cartItems; 

    // Subscribir a la sección 'totalPrice' de nuestro Carro (gracias al evento subject definido en CartService).
    this.cartService.totalPrice.subscribe(
      data => this.totalPrice = data
    )

    // Subscribir a la sección 'totalQuantity' de nuestro Carro (gracias al evento subject definido en CartService).
    this.cartService.totalQuantity.subscribe(
      data => this.totalQuantity = data
    );

    // Obtener el precio total y la cantidad total de nuestro Carro (obviamente dependiendo de la cantidad de Items).
    this.cartService.computeCartTotals();

  }

  incrementQuantity(cartItem: CartItem) { // Implemento la lógica desasrrollada en el CartService para aumentar.
    this.cartService.addToCart(cartItem); // Como el item ya existe en el Carro, se aumentará la cantidad.
  }

  decrementQuantity(cartItem: CartItem) { // Implemento la lógica desasrrollada en el CartService para disminuir o borrar.
    this.cartService.decrementQuantity(cartItem);
  }

  remove(cartItem: CartItem) { // Implemento la lógica desarrollada en el CartService para eliminar el/los producto/s deseado/s.
    this.cartService.remove(cartItem);
  }

}
