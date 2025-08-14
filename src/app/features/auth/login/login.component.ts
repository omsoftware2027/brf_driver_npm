import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { AuthService } from '../../../core/services/auth.service';
import { ToastrService } from 'ngx-toastr';
import { Router } from '@angular/router';

@Component({
  selector: 'app-login',
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './login.component.html',
  styleUrl: './login.component.scss'
})
export class LoginComponent {
  loginForm: FormGroup;
  isLoading = false;

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private toastr: ToastrService,
    private router: Router
  ) {

    this.loginForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]],
    });
  }

  onSubmit() {
    if (this.loginForm.valid) {
      this.isLoading = true;
      const formData = {
        email: this.loginForm.value.email,
        password: this.loginForm.value.password,
      }

      this.authService.login(formData).subscribe({
        next: (data) => {
          this.isLoading = false;
          if (data && data.status === 0) {
            if (data.response && data.response.token) {
              // this.toastr.success('Login successful', 'Success');
              // this.router.navigate(['/dashboard'], {
              //   queryParams: { dId: data.response.teamId }
              // })
              this.router.navigate(['/dashboard'])
            }
          }
        },
        error: (err) => {
          this.isLoading = false;
          if (err && err.error.status === -1) {
            this.toastr.error(err.error.response);
            this.loginForm.markAllAsTouched();
          } else {
            this.toastr.error('Something went wrong');
            this.loginForm.reset();
            this.loginForm.markAllAsTouched();
          }
        }
      })
    }
    else {
      this.loginForm.markAllAsTouched();
    }
  }

  get email() { return this.loginForm.get('email'); }
  get password() { return this.loginForm.get('password'); }
}
