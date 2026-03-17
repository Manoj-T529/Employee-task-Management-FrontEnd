import { Injectable } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';

@Injectable({ providedIn: 'root' })
export class ToastService {

  constructor(
    private snack: MatSnackBar
  ) {}

  success(msg: string) {

    this.snack.open(
      msg,
      'OK',
      { duration: 2000 }
    );

  }

  error(msg: string) {

    this.snack.open(
      msg,
      'ERROR',
      { duration: 3000 }
    );

  }

}