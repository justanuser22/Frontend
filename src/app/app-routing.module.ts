import { CheckoutComponent } from './components/checkout/checkout.component';
import { ProductDetailsComponent } from './components/product-details/product-details.component';
import { ProductsListComponent } from './components/products-list/products-list.component';
import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { CartDetailsComponent } from './components/cart-details/cart-details.component';


const routes: Routes = [
  /* Recomendado definir las rutas de la más específica a la más general */
  
  {path: 'cart-details', component: CartDetailsComponent}, // Para acceder a la lista de los Productos alojados en nuestro Carro.
  {path: 'product/:id', component: ProductDetailsComponent}, // Para acceder a determinado producto y ver sus características.
  {path: 'search/:keyword', component: ProductsListComponent}, // Para encontrar los productos basándose en los datos colocados.
  {path: 'category/:id', component: ProductsListComponent}, // Para acceder a la lista de productos dependiendo de la categoría.
  {path: 'checkout', component: CheckoutComponent}, // Para acceder a distintos campos para rellenar, luego de confirmar un pedido.
  {path: 'category', component: ProductsListComponent},
  {path: 'products', component: ProductsListComponent},
  {path: '', redirectTo: '/products', pathMatch: 'full'},
  {path: '**', redirectTo: '/products', pathMatch: 'full'}

];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
