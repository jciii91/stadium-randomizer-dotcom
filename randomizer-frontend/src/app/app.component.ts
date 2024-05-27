import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { RandomizerFormUploadComponent } from './randomizer-form-upload/randomizer-form-upload.component';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, RandomizerFormUploadComponent],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css'
})
export class AppComponent {
  title = 'randomizer-frontend';
}
