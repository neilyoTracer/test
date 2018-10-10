import { Injectable } from '@angular/core';
import { QuestionBase } from '../question-base';
import { FormControl, Validators, FormGroup, FormBuilder } from '@angular/forms';

@Injectable()
export class QuestionControlService {

  constructor(private fb:FormBuilder) { }

  toFormGroup(questions:QuestionBase<any>[]) { 
    /* let group:any = {};

    questions.forEach(question => { 
      group[question.key] = question.required ? new FormControl(question.value || '',Validators.required)
                                              : new FormControl(question.value || '');
    });
    return new FormGroup(group); */

    let group:any = {};

    questions.forEach(question => { 
      group[question.key] = question.required ? this.fb.control(question.value || '',Validators.required)
                                              : this.fb.control(question.value || '');
    });
    return this.fb.group(group);
  }
}
