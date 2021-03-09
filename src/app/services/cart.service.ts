import { CartItem } from './../commons/cart-item';
import { Injectable } from '@angular/core';
import { BehaviorSubject, Subject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class CartService {

  cartItems: CartItem[] = [];

  totalPrice: Subject<number> = new BehaviorSubject<number>(0); // Utilizado para publicar eventos en nuestro código.
                                                       // Este evento será enviado a todos los que lo subscriban.

  totalQuantity: Subject<number> = new BehaviorSubject<number>(0); // Igual que el anterior.

  constructor() { }

  addToCart(theCartItem: CartItem) {

    // Chequear si ya tenemos el item en nuestro carrito.
    let alreadyExistsCart: boolean = false;
    let existingCartItem: CartItem = undefined;

    if (this.cartItems.length > 0) {
    // Encontrar el item en el Carro basándose en el 'id' de este item.
     existingCartItem = this.cartItems.find(tempCartItem => tempCartItem.id === theCartItem.id);
    // Chequear si lo encontramos.
    alreadyExistsCart = (existingCartItem != undefined); // Siempre y cuando no sea 'undefined'.
    }
    
    if (alreadyExistsCart) {
      // Si existe ese item en el carrito, simplemente incrementarlo.
      existingCartItem.quantity++;
    } else {
      // Si no, añádelo al arreglo de items del Carro.
      this.cartItems.push(theCartItem);
    }
    // Computar el precio total y la cantidad alojados en nuestro Carro.
    this.computeCartTotals();
  }

  computeCartTotals() { // Para obtener la cantidad de items y el total del precio (sumando los valores de los items).

    let totalPriceValue: number = 0;
    let totalQuantityValue: number = 0;

    for (let currentCartItem of this.cartItems) {
      totalPriceValue += currentCartItem.quantity * currentCartItem.unitPrice;
      totalQuantityValue += currentCartItem.quantity;
    }
    // Publicar los nuevos valores, recordando que todos los que subscriban recibirán los nuevos datos.
    this.totalPrice.next(totalPriceValue); // el método next es el que publicará/enviará el evento.
    this.totalQuantity.next(totalQuantityValue); // el método next es el que publicará/enviará el evento.
    // Cargar los datos del Carro para corroborar que todo está bien...
    this.logCartData(totalPriceValue, totalQuantityValue);
  }

  decrementQuantity(cartItem: CartItem) {
    
    // Restar la cantidad de 1 en 1.
    cartItem.quantity--;

    if (cartItem.quantity === 0) { // Si la cantidad llega a 0...
       this.remove(cartItem); // removerlo!
    } else {
       this.computeCartTotals(); // Sino, mostrar el total.
    }
  }

  remove (cartItem: CartItem) {

    // Obtener el índice del Producto en el Array.
    const itemIndex = this.cartItems.findIndex(tempCartItem => tempCartItem.id === cartItem.id);

    // Si lo encontramos, removerlo del array (basándose en el índice)
    if (itemIndex > -1) { // Lo encontramos
       this.cartItems.splice(itemIndex, 1);  // lo eliminamos entonces.
       this.computeCartTotals(); // actualizamos este método para mostrar el total, ya que se ha eliminado un/os producto/s.
    }
  }

  logCartData(totalPriceValue: number, totalQuantityValue: number) { // Corroborando por consola que todo está bien.

    console.log('Contents of the cart');
    for (let tempCartItem of this.cartItems) {
      const subTotallPrice = tempCartItem.quantity * tempCartItem.unitPrice;
      console.log(`name: ${tempCartItem.name}, quantity: ${tempCartItem.quantity},
       unitPrice: ${tempCartItem.unitPrice}, subTotalPrice: ${subTotallPrice}`)
    }
    console.log(`totalPrice: ${totalPriceValue.toFixed(2)}, totalQuantity: ${totalQuantityValue}`);
    console.log('====');
  }
}
