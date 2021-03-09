import { FormControl, ValidationErrors } from '@angular/forms';

 // Espacios en blancos validación.
export class Luv2ShopValidators {

    static notOnlyWhitespace(control: FormControl): ValidationErrors {
        
        // Si el chequeo de validación falla, retornar este 'ValidationErrors'
        // chequeando si nuestro string solo contiene espacios en blanco:
        if ((control.value != null) && (control.value.trim().length === 0)) {
            return { 'notOnlyWhitespace': true };
        } else {
            // sino, retornar 'null'.
            return null;
        }

    }
}
