import { ChangeDetectionStrategy, Component, inject, OnInit } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet],
  template: '<router-outlet />',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class AppComponent implements OnInit {
  private translate = inject(TranslateService);

  ngOnInit(): void {
    this.translate.addLangs(['en', 'pt-BR']);
    const saved = localStorage.getItem('lang');
    const initial = saved || (navigator.language.startsWith('pt') ? 'pt-BR' : 'en');
    this.translate.use(initial);
  }
}
