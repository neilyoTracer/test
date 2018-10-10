import { ValidatorFn, ValidationErrors } from "@angular/forms";
import { FormGroup } from '@angular/forms';

export const identityRevealedValidator:ValidatorFn = (control:FormGroup):
ValidationErrors | null => { 
    const name = control.get('name');
    const alterEgo = control.get('alterEgo');

    return name && alterEgo && alterEgo.value && alterEgo.value.search(RegExp(name.value,'i')) > 0 ? { 'identityRevealed':true } : null
}