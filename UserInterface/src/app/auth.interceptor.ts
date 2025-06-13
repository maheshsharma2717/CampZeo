import { ChangeDetectorRef, Injectable } from '@angular/core';
import {
  HttpRequest,
  HttpHandler,
  HttpEvent,
  HttpInterceptor,
  HttpHeaders,
  HttpErrorResponse
} from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError, finalize } from 'rxjs/operators';
import { AppService } from './services/app-service.service';
import { ToastrService } from 'ngx-toastr';

@Injectable()
export class AuthInterceptor implements HttpInterceptor {

  constructor(private service: AppService, private toaster: ToastrService) { }

  intercept(request: HttpRequest<unknown>, next: HttpHandler): Observable<HttpEvent<unknown>> {
    const token = this.service.Token;
    setTimeout(() => {
      this.service.showSpinner = true;
    });
    // Get the token from the service
    // If the token is available, clone the request and add the Authorization header
    if (token) {
      request = request.clone({
        setHeaders: {
          Authorization: `Bearer ${token}`
        }
      });
    }

    // Continue with the request and handle errors
    return next.handle(request).pipe(
      catchError((error: HttpErrorResponse) => this.handleError(error)),
      finalize(() => {
        //some code
        setTimeout(() => {
          this.service.showSpinner = false;
        });
      })
    );
  }

  private handleError(error: HttpErrorResponse): Observable<never> {
    let errorMsg = '';

    if (error.error instanceof ErrorEvent) {
      // Client-side error
      errorMsg = `Client-side error: ${error.error.message}`;
    } else {
      // Server-side error
      errorMsg = `Server-side error: Status Code ${error.status}\n Message: ${error.message}`;
    }
    setTimeout(() => {
      this.service.showSpinner = false;
    });
    // Handle specific status codes
    if (error.status === 401) {
      this.toaster.error('User unauthorized');
    } else if (error.status === 400) {
      this.toaster.error(error.error || 'Bad request');
    } else {
      this.toaster.error('An error occurred');
    }
    return throwError(() => new Error(errorMsg));
  }
}
