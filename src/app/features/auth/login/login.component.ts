import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { AuthService } from '../../../core/services/auth.service';
import { ToastrService } from 'ngx-toastr';
import { Router } from '@angular/router';

@Component({
  selector: 'app-login',
  imports: [CommonModule, ReactiveFormsModule, FormsModule],
  templateUrl: './login.component.html',
  styleUrl: './login.component.scss'
})
export class LoginComponent {
  loginForm: FormGroup;
  isLoading = false;
  step: 'login' | 'otp' = 'login';
  otp: string = '';
  userEmail: string = '';

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
      this.userEmail = this.loginForm.value.email;
      this.isLoading = true;
      const formData = {
        email: this.loginForm.value.email,
        password: this.loginForm.value.password,
        userType: 'driver'
      }

      this.authService.login(formData).subscribe({
        next: (data) => {
          this.isLoading = false;
          if (data && data.status === 0) {
            if (data.response && data.response.token) {
              debugger
              const userInfo = {
                name: data.response.name,
                id: data.response.teamId,
                token: data.response.token,
                // role: data.response.role,
              }
              this.authService.setUser(userInfo);
              this.authService.sendOtp().subscribe({
                next: ()=>{
                  this.step = 'otp';
                  this.toastr.info('OTP sent to your registered contact', 'Info');
                },
                error: ()=> {
                  this.toastr.error('Failed to send OTP', 'Error');
                }
              })
              // this.router.navigate(['/dashboard'])
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

  onVerifyOtp() {
    if (!this.otp) {
      this.toastr.warning('Please enter OTP', 'Warning');
      return;
    }
    this.authService.verifyOtp(this.otp).subscribe({
      next: (res) => {
        if (res?.status === 0) {
          this.toastr.success('Login successful!', 'Success');
          this.router.navigate(['/dashboard']);
        } else {
          this.toastr.error('Invalid OTP. Please try again.', 'Error');
        }
      },
      error: () => {
        this.toastr.error('Failed to verify OTP', 'Error');
      }
    });
  }

  get email() { return this.loginForm.get('email'); }
  get password() { return this.loginForm.get('password'); }
}
