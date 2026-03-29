import { Component, input, output } from '@angular/core';
import { ToolApplicationResDto } from '@core/services/toolApplicationService/tool-application.res.dto';
import { AiChatComponent } from '../../ai-chat/ai-chat';

@Component({
  selector: 'app-cinco-porques',
  standalone: true,
  imports: [AiChatComponent],
  template: `
    <app-ai-chat
      [application]="application()"
      (sessionSaved)="sessionSaved.emit()"
    />
  `,
})
export class CincoPorquesComponent {
  application = input<ToolApplicationResDto | null>(null);
  sessionSaved = output<void>();
}
