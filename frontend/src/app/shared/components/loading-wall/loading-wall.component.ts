import { Component, input } from '@angular/core';
import { ProgressSpinner } from 'primeng/progressspinner';

@Component({
  selector: 'app-loading-wall',
  standalone: true,
  imports: [ProgressSpinner],
  templateUrl: './loading-wall.component.html',
  styleUrl: './loading-wall.component.sass',
})
export class LoadingWallComponent {
  visible = input(false);
}
