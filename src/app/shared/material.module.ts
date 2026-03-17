import { NgModule } from '@angular/core';

import { MatButtonModule } from '@angular/material/button';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatCardModule } from '@angular/material/card';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { MatSidenavModule } from '@angular/material/sidenav';  // ✅ ADD THIS
import { MatFormFieldModule } from '@angular/material/form-field'; 
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatIconModule } from '@angular/material/icon';
import { CommonModule } from '@angular/common';



@NgModule({

    declarations: [
  
    
  ],
  imports: [
    CommonModule,
   
  ],

 exports: [
 MatButtonModule,
    MatInputModule,
    MatSelectModule,
    MatCardModule,
    MatSnackBarModule,
    MatDatepickerModule,
    MatNativeDateModule,
    MatSidenavModule,        // ✅
    MatFormFieldModule,
    MatToolbarModule,
    MatIconModule
 ]

})
export class MaterialModule {}