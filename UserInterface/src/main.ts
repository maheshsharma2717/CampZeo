  // import { bootstrapApplication } from '@angular/platform-browser';
  // import { appConfig } from './app/app.config';
  // import { AppComponent } from './app/app.component';

  // bootstrapApplication(AppComponent, appConfig)
  //   .catch((err) => console.error(err));

  import { bootstrapApplication } from '@angular/platform-browser';
  import { importProvidersFrom } from '@angular/core';
  import { AppComponent } from './app/app.component';
  import { appConfig } from './app/app.config';
  import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
  import { provideToastr } from 'ngx-toastr';
  import { registerLicense } from '@syncfusion/ej2-base';
  registerLicense('ORg4AjUWIQA/Gnt2XFhhQlJHfV5AQmBIYVp/TGpJfl96cVxMZVVBJAtUQF1hTH5Wd0NjXHpcc3xVRWdZWkZ/');
  
  bootstrapApplication(AppComponent, {
    ...appConfig,
    providers: [
      ...appConfig.providers,
      importProvidersFrom(BrowserAnimationsModule),
      provideToastr({
        timeOut: 3000, 
        positionClass: 'toast-top-right',
        preventDuplicates: true, 
        closeButton: true,
        progressBar: true 
      }),
    ],
  }).catch((err) => console.error(err));