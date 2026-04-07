import { Component, signal } from '@angular/core';
import { NgxSonnerToaster, toast } from 'ngx-sonner';
import {MatButtonModule} from '@angular/material/button';

@Component({
    selector: 'app-root',
    standalone: true,
    imports: [
        NgxSonnerToaster,
        MatButtonModule
  ],
    templateUrl: './app.html',
    styleUrls: ['./app.css']
})
export class App {
    protected readonly toast = toast;
    protected readonly title = signal('test1');
}