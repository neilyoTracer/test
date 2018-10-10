import { Directive } from '@angular/core';
import { NG_VALIDATORS, Validator, AbstractControl, ValidationErrors } from '@angular/forms';
import { identityRevealedValidator } from './custom-validators/identity-revealed-validator';

/* @Directive({
  selector: '[appIdentityRevealed]',
  providers:[{ 
    provide:NG_VALIDATORS,
    useValue:identityRevealedValidator,
    multi:true
  }]
})
export class IdentityRevealedDirective {

  constructor() { }

} */

@Directive({
  selector: '[appIdentityRevealed]',
  providers:[{ 
    provide:NG_VALIDATORS,
    useExisting:IdentityRevealedDirective,
    multi:true
  }]
})
export class IdentityRevealedDirective implements Validator {

  constructor() { }

  validate(control:AbstractControl):ValidationErrors | null { 
    return identityRevealedValidator(control);
  }
}


