import { Purchase } from './../../commons/purchase';
import { OrderItem } from './../../commons/order-item';
import { Order } from './../../commons/order';
import { CheckoutService } from './../../services/checkout.service';
import { Luv2ShopValidators } from './../../validators/luv2-shop-validators';
import { State } from './../../commons/state';
import { Country } from './../../commons/country';
import { Luv2ShopFormService } from './../../services/luv2-shop-form.service';
import { CartService } from './../../services/cart.service';
import { Component, OnDestroy, OnInit } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { Subscription } from 'rxjs'
import { Router } from '@angular/router';

@Component({
  selector: 'app-checkout',
  templateUrl: './checkout.component.html',
  styleUrls: ['./checkout.component.css']
})
export class CheckoutComponent implements OnInit, OnDestroy {

  checkoutFormGroup: FormGroup;

  // Propiedades sujetas a suscripciones.
  totalPrice: number = 0;
  totalQuantity: number = 0;

  // Propiedades para trabajar con los años y meses de la lista desplegable del Form.
  creditCardYears: number[] = [];
  creditCardMonths: number[] = [];

  monthSubscription: Subscription;
  yearSubscription: Subscription;

  // Propiedades para trabajar con los países y sus respectivos estados, desplegándolos en el Form.
  countries: Country[] = [];
  shippingAddressStates: State[] = [];
  billingAddressStates: State[] = [];

  constructor(private formBuilder: FormBuilder, private cartService: CartService,
    private service: Luv2ShopFormService, private checkoutService: CheckoutService,
    private router: Router) { }

  ngOnInit(): void {

    this.reviewCartDetails();

    // Armado del FormGroup general.
    this.checkoutFormGroup = this.formBuilder.group({
      customer: this.formBuilder.group({ // Customer
        firstName: new FormControl('', [Validators.required, Validators.minLength(2), Luv2ShopValidators.notOnlyWhitespace]),
        lastName: new FormControl('', [Validators.required, Validators.minLength(2), Luv2ShopValidators.notOnlyWhitespace]),
        email: new FormControl('',
          [Validators.required, Validators.pattern('^[a-z09._%+-]+@[a-z0-9.-]+\\.[a-z]{2,4}$'),
          Luv2ShopValidators.notOnlyWhitespace]
        )
      }),
      shippingAddress: this.formBuilder.group({ // Shipping Address
        street: new FormControl('', [Validators.required, Validators.minLength(2), Luv2ShopValidators.notOnlyWhitespace]),
        city: new FormControl('', [Validators.required, Validators.minLength(2), Luv2ShopValidators.notOnlyWhitespace]),
        state: new FormControl('', [Validators.required]),
        country: new FormControl('', [Validators.required]),
        zipCode: new FormControl('', [Validators.required, Validators.minLength(2), Luv2ShopValidators.notOnlyWhitespace])
      }),
      billingAddress: this.formBuilder.group({ // Billing Addres
        street: new FormControl('', [Validators.required, Validators.minLength(2), Luv2ShopValidators.notOnlyWhitespace]),
        city: new FormControl('', [Validators.required, Validators.minLength(2), Luv2ShopValidators.notOnlyWhitespace]),
        state: new FormControl('', [Validators.required]),
        country: new FormControl('', [Validators.required]),
        zipCode: new FormControl('', [Validators.required, Validators.minLength(2), Luv2ShopValidators.notOnlyWhitespace])
      }),
      creditCard: this.formBuilder.group({ // Credit Card.
        cardType: new FormControl('', [Validators.required]),
        nameOnCard: new FormControl('', [Validators.required, Validators.minLength(2), Luv2ShopValidators.notOnlyWhitespace]),
        cardNumber: new FormControl('', [Validators.required, Validators.pattern('[0-9]{16}')]), // Solo aceptar 16 dígitos.
        securityCode: new FormControl('', [Validators.required, Validators.pattern('[0-9]{3}')]), // Solo aceptar 3 dígitos.
        expirationMonth: [''],
        expirationYear: ['']
      })
    });
    this.cardMonths();
    this.cardYears();
    this.populateCountries();
  }

  // Populando los meses
  cardMonths() {
    const startMonth: number = new Date().getMonth() + 1; // Obtengo el mes actual.
    this.monthSubscription = this.service.getCreditCardMonths(startMonth).subscribe(data => {
      this.creditCardMonths = data;
    })
  }

  // Populando los años
  cardYears() {
    this.yearSubscription = this.service.getCreditCardYears().subscribe(data => {
      this.creditCardYears = data;
    })
  }

  // Populando los países
  populateCountries() {

    this.service.getCountries().subscribe(data => {
      this.countries = data;
    })
  }

  // Populando los estados
  populateStates(formGroupName: string) {

    const formGroup = this.checkoutFormGroup.get(formGroupName); // Puede ser 'shippingAddress' o 'billingAddress'.
    const countryCode = formGroup.value.country.code; // Obtengo el código del país seleccionado.

    this.service.getStates(countryCode).subscribe(data => {
      if (formGroupName === 'shippingAddress') {
        this.shippingAddressStates = data;
      } else {
        this.billingAddressStates = data;
      }
      // Seleccionar el primer 'state' por defecto.
      formGroup.get('state').setValue(data[0]);
    }
    )
  }

  ngOnDestroy(): void {
    //Called once, before the instance is destroyed.
    //Add 'implements OnDestroy' to the class.
    this.monthSubscription.unsubscribe();
    this.yearSubscription.unsubscribe();
  }


  copyShippingAddressToBillingAddress(event) {

    if (event.target.checked) { // Si hemos checkeado...
      this.checkoutFormGroup.controls.billingAddress // Copiar el contenido de Shipping Address a Billing Address.
        .setValue(this.checkoutFormGroup.controls.shippingAddress.value);
      // bug fix code for billing state not updating when 'same as shipping address' selected
      this.billingAddressStates = this.shippingAddressStates;
    } else { // Si no está chequeado, resetear esta parte del form.
      this.checkoutFormGroup.controls.billingAddres.reset();
      // bug fix code for billing states
      this.billingAddressStates = [];
    }
  }

  handleMonthsYears() { // Con este método, podremos hacer dependientes a los meses con los años.

    const creditCardFormGroup = this.checkoutFormGroup.get('creditCard');
    const currentYear: number = new Date().getFullYear();
    const selectedYear: number = Number(creditCardFormGroup.value.expirationYear);

    // Si el año actual equivale al año seleccionado...
    let startMonth: number;
    if (currentYear === selectedYear) { // entonces empezar con el mes actual.
      startMonth = new Date().getMonth() + 1;
    } else { // sino, mostrar todos los meses, del 1 al 12.
      startMonth = 1;
    }
    // Obtener los meses:
    this.service.getCreditCardMonths(startMonth).subscribe(data => {
      this.creditCardMonths = data;
    })
  }
  /* Métodos 'get' para acceder a los campos del formulario y poder asi manejar sus errores */

  get firstName() { // Método 'get' para acceder a la propiedad 'firstName' del Form.
    return this.checkoutFormGroup.get('customer.firstName');
  }

  get lastName() { // Método 'get' para acceder a la propiedad 'lastName' del Form.
    return this.checkoutFormGroup.get('customer.lastName');
  }

  get email() { // Método 'get' para acceder a la propiedad 'email' del Form.
    return this.checkoutFormGroup.get('customer.email');
  }

  get shippingAddressStret() { // Método 'get' para acceder a la propiedad 'street' del Form.
    return this.checkoutFormGroup.get('shippingAddress.street');
  }

  get shippingAddressCity() { // Método 'get' para acceder a la propiedad 'city' del Form.
    return this.checkoutFormGroup.get('shippingAddress.city');
  }

  get shippingAddressZipCode() { // Método 'get' para acceder a la propiedad 'city' del Form.
    return this.checkoutFormGroup.get('shippingAddress.zipCode');
  }

  get shippingAddressCountry() { // Método 'get' para acceder a la propiedad 'country' del Form.
    return this.checkoutFormGroup.get('shippingAddress.country')
  }

  get shippingAddressStateZ() { // Método 'get' para acceder a la propiedad 'state' del Form.
    return this.checkoutFormGroup.get('shippingAddress.state');
  }

  // Billing Address

  get billingAddressStreet() { // Método 'get' para acceder a la propiedad 'street' del Form.
    return this.checkoutFormGroup.get('billingAddress.street');
  }

  get billingAddressCity() { // Método 'get' para acceder a la propiedad 'city' del Form.
    return this.checkoutFormGroup.get('billingAddress.city');
  }

  get billingAddressZipCode() { // Método 'get' para acceder a la propiedad 'city' del Form.
    return this.checkoutFormGroup.get('billingAddress.zipCode');
  }

  get billingAddressCountry() { // Método 'get' para acceder a la propiedad 'country' del Form.
    return this.checkoutFormGroup.get('billingAddress.country')
  }

  get billingAddressState() { // Método 'get' para acceder a la propiedad 'state' del Form.
    return this.checkoutFormGroup.get('billingAddress.state');
  }

  // Credit Card

  get cardType() { // Método 'get' para acceder a la propiedad 'cardType' del Form.
    return this.checkoutFormGroup.get('creditCard.cardType');
  }

  get nameOnCard() { // Método 'get' para acceder a la propiedad 'nameOnCard' del Form.
    return this.checkoutFormGroup.get('creditCard.nameOnCard');
  }

  get cardNumber() { // Método 'get' para acceder a la propiedad 'cardNumber' del Form.
    return this.checkoutFormGroup.get('creditCard.cardNumber');
  }

  get securityCode() { // Método 'get' para acceder a la propiedad 'securityCode' del Form.
    return this.checkoutFormGroup.get('creditCard.securityCode');
  }

  get expirationMonth() { // Método 'get' para acceder a la propiedad 'expirationMonth' del Form.
    return this.checkoutFormGroup.get('creditCard.expirationMonth');
  }

  get expirationYear() { // Método 'get' para acceder a la propiedad 'expirationYear' del Form.
    return this.checkoutFormGroup.get('creditCard.expirationYear');
  }

  reviewCartDetails() { // Para lograr obtener la cantidades y precios totales.

    // Suscribimos a cartService.totalQuantity
    this.cartService.totalQuantity.subscribe(totalQuantity => this.totalQuantity = totalQuantity);
    // Suscribimos a cartService.totalPrice
    this.cartService.totalPrice.subscribe(totalPrice => this.totalPrice = totalPrice);
  }

  onSubmit() {
    console.log("Handling the submit button");
    //console.log(this.checkoutFormGroup.get('customer').value); // Checkeando que se devuelve en 'customer'.
    //console.log(this.checkoutFormGroup.get('customer').value.email); // Chequeando un valor determinado,
    //console.log(this.checkoutFormGroup.get('billingAddress').value)
    if (this.checkoutFormGroup.invalid) { // Si es inválido...
      this.checkoutFormGroup.markAllAsTouched(); // Tocar todos los campos activa la visualización de los mensajes de error.
      return;
    }

    // Preparar una orden.
    let order = new Order();
    order.totalPrice = this.totalPrice;
    order.totalQuantity = this.totalQuantity;

    // Obtener los items del Carro.
    const cartItems = this.cartService.cartItems;

    // Crear items de la orden desde nuestro CartItem.
    let orderItems: OrderItem[] = cartItems.map(tempCartItem => new OrderItem(tempCartItem));

    // Preparar el 'purchase'.
    let purchase = new Purchase();

    // Popular purchase - customer.
    purchase.customer = this.checkoutFormGroup.controls['customer'].value;

    // Popular purchase - shipping address.
    purchase.shippingAddress = this.checkoutFormGroup.controls['shippingAddress'].value;
    const shippingState: State = JSON.parse(JSON.stringify(purchase.shippingAddress.state));
    const shippingCountry: Country = JSON.parse(JSON.stringify(purchase.shippingAddress.country));
    purchase.shippingAddress.state = shippingState.name;
    purchase.shippingAddress.country = shippingCountry.name;

    // Popular purchase - billing address.
    purchase.billingAddress = this.checkoutFormGroup.controls['billingAddress'].value;
    const billingState: State = JSON.parse(JSON.stringify(purchase.billingAddress.state));
    const billingCountry: Country = JSON.parse(JSON.stringify(purchase.billingAddress.country));
    purchase.billingAddress.state = billingState.name;
    purchase.billingAddress.country = billingCountry.name;

    // Popular purchase - order y orderItems.
    purchase.order = order;
    purchase.orderItems = orderItems;

    // Llamar a nuestra API REST a través de CheckoutService.
    this.checkoutService.placeOrder(purchase).subscribe(
      {
        next: response => {
          alert(`Your order has been received.\nOrder tracking number: ${response.orderTrackingNumber}`)
          // Resetear el Carro.
          this.resetCart();
        },
        error: err => {
          alert(`There was an error: ${err.message}`);
        }
      }
    )
  }

  resetCart() { // Una vez que hemos realizado el pedido, resetear nuestro Carro.

    // Resetear los datos del Carro:
    this.cartService.cartItems = [];
    this.cartService.totalPrice.next(0);
    this.cartService.totalQuantity.next(0);

    // Resetear el Form:
    this.checkoutFormGroup.reset();

    // Navegar hasta la parte principal, la de los productos.
    this.router.navigateByUrl('/products');
  }


}
