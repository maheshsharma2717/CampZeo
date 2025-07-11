import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ImageEditorModule } from '@syncfusion/ej2-angular-image-editor';

@NgModule({
  declarations: [],
  imports: [
    CommonModule,
    ImageEditorModule
  ],
  exports: [
    ImageEditorModule
  ]
})
export class ImageEditorSharedModule { } 