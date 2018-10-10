import { Component, OnInit } from '@angular/core';
import { FormGroup, FormControl,FormBuilder,Validators,FormArray } from '@angular/forms';


@Component({
  selector: 'app-profile-editor',
  templateUrl: './profile-editor.component.html',
  styleUrls: ['./profile-editor.component.css']
})
export class ProfileEditorComponent implements OnInit {

  /* profileForm = new FormGroup({
    firstName:new FormControl(''),
    lastName:new FormControl(''),
    address:new FormGroup({ 
      street:new FormControl(''),
      city:new FormControl(''),
      state:new FormControl(''),
      zip:new FormControl('')
    })
  }) */

  profileForm = this.fb.group({ 
    firstName:['',Validators.required],
    lastName:[''],
    address:this.fb.group({ 
      street:[''],
      city:[''],
      state:[''],
      zip:['']
    }),
    aliases:this.fb.array([
      this.fb.control('')
    ])
  });

  get aliases() { 
    return this.profileForm.get('aliases') as FormArray;
  }

  constructor(private fb:FormBuilder) { }

  ngOnInit() {
  }

  onSubmit() {
    console.warn(this.profileForm.value);
  }

  updateProfile() { 
    this.profileForm.patchValue({ 
      firstName:'Nancy',
      address:{ 
        street:'123 Drew Street'
      }
    });
  }

  addAlias() { 
    this.aliases.push(this.fb.control(''));
  }

}

// 注意：你可以只使用初始值来定义控件，
// 但是如果你的控件还需要同步或异步验证器，
// 那就在这个数组中的第二项和第三项提供同步和异步验证器。
