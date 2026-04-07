import { Component, signal } from '@angular/core';
import { NgxSonnerToaster, toast } from 'ngx-sonner';
@Component({
    selector: 'app-root',
    standalone: true,
    imports: [
        NgxSonnerToaster,
  ],
    templateUrl: './app.html',
    styleUrls: ['./app.css']
})
export class App {
    protected readonly toast = toast;
    protected readonly title = signal('test1');
}