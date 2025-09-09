import { CommonModule } from '@angular/common';
import { Component, ElementRef, QueryList, ViewChildren } from '@angular/core';
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

  otpArray = Array(4).fill(0);  // For 6 boxes
  otpValues: string[] = Array(4).fill('');

  userInfo: any = {};


  @ViewChildren('otpInput') otpInputs!: QueryList<ElementRef>;


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
              if (data?.response?.role?.toLowerCase() === 'driver') {
                this.step = 'otp';
                this.userInfo.name = data?.response?.name;
                this.userInfo.id = data?.response?.teamId;
                this.userInfo.token = data?.response?.token;

                this.authService.getTeamById(data.response.teamId).subscribe({
                  next: (teamData) => {
                    this.userInfo.profilePicture = teamData?.response?.profilePicture || '';
                  },
                  error: () => {
                    console.log('Failed to fetch profile image');
                  }
                })

                this.authService.sendOtp(this.loginForm.value.email).subscribe({
                  next: () => {
                    // this.step = 'otp';
                    this.toastr.info('OTP sent to your registered contact', 'Info');
                  },
                  error: () => {
                    this.toastr.error('Failed to send OTP', 'Error');
                  }
                })
              } else {
                this.toastr.error('You are not authorized as a driver', 'Access Denied');
              }
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
    this.otp = this.otpValues.join('');
    if (!this.otp) {
      this.toastr.warning('Please enter OTP', 'Warning');
      return;
    }
    this.authService.verifyOtp(this.otp, this.loginForm.value.email).subscribe({
      next: (res) => {
        if (res?.status === 0) {
          this.authService.setUser(this.userInfo);
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

  onOtpInput(event: any, index: number) {
    const input = event.target as HTMLInputElement;
    const value = input.value;
    if (!/^[0-9]$/.test(value)) {
      this.otpValues[index] = '';
      input.value = '';
      return;
    }
    if (value && index < this.otpArray.length - 1) {
      this.otpInputs.toArray()[index + 1].nativeElement.focus();
    }
  }

  onOtpKeyDown(event: KeyboardEvent, index: number) {
    const input = event.target as HTMLInputElement;
    if (event.key === 'Backspace' && !input.value && index > 0) {
      this.otpInputs.toArray()[index - 1].nativeElement.focus();
    }
  }

  onBackToLogin() {
    this.step = 'login';
    this.otpValues = Array(this.otpArray.length).fill('');
    this.otp = '';
  }

  get email() { return this.loginForm.get('email'); }
  get password() { return this.loginForm.get('password'); }
}
