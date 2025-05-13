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
  registerLicense('Ngo9BigBOggjHTQxAR8/V1NNaF5cXmBCe0xxWmFZfVtgcl9GaFZSQ2YuP1ZhSXxWdkFgWX9YcHxWQWZZVkZ9XUs=');
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