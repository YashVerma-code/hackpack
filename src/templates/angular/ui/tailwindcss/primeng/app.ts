import { Component, signal } from '@angular/core';
import { NgxSonnerToaster, toast } from 'ngx-sonner';

import { ButtonModule } from 'primeng/button';
@Component({
  selector: 'app-root',
  standalone: true,
  imports: [
    NgxSonnerToaster,
    ButtonModule,
  ],
  templateUrl: './app.html',
  styleUrls: ['./app.css']
})
export class App {
  protected readonly toast = toast;
  protected readonly title = signal('test1');
}
