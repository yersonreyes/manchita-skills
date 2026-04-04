import {
  Component,
  ViewChild,
  inject,
  model,
  output,
  signal,
} from '@angular/core';
import { FormsModule } from '@angular/forms';
import { NgTemplateOutlet } from '@angular/common';
import { AssetsService } from '@core/services/assetsService/assets.service';
import { UiDialogService } from '@core/services/ui-dialog.service';
import { ImageCropperComponent, ImageCroppedEvent, LoadedImage } from 'ngx-image-cropper';
import { Button } from 'primeng/button';
import { Dialog } from 'primeng/dialog';
import { InputText } from 'primeng/inputtext';
import { BANNER_OPTIONS } from '../wiki-page/wiki-page.component';

type Tab = 'file' | 'url' | 'color';

@Component({
  selector: 'app-wiki-banner-uploader',
  standalone: true,
  imports: [Button, Dialog, FormsModule, NgTemplateOutlet, ImageCropperComponent, InputText],
  template: `
    <p-dialog
      header="Banner de página"
      [visible]="visible()"
      (visibleChange)="visible.set($event)"
      [modal]="true"
      [style]="{ width: '640px' }"
      [draggable]="false"
      [resizable]="false"
      (onHide)="reset()"
    >
      <!-- ── Tabs ── -->
      <div class="wbu-tabs">
        <button class="wbu-tab" [class.wbu-tab--active]="tab() === 'file'" (click)="setTab('file')">
          <i class="pi pi-upload"></i> Subir imagen
        </button>
        <button class="wbu-tab" [class.wbu-tab--active]="tab() === 'url'" (click)="setTab('url')">
          <i class="pi pi-link"></i> Desde URL
        </button>
        <button class="wbu-tab" [class.wbu-tab--active]="tab() === 'color'" (click)="setTab('color')">
          <i class="pi pi-palette"></i> Color sólido
        </button>
      </div>

      <!-- ── Tab: Subir archivo ── -->
      @if (tab() === 'file') {
        @if (!imageChangedEvent()) {
          <div
            class="wbu-dropzone"
            [class.wbu-dropzone--drag]="dragging()"
            (dragover)="$event.preventDefault(); dragging.set(true)"
            (dragleave)="dragging.set(false)"
            (drop)="onFileDrop($event)"
            (click)="fileInput.click()"
          >
            <i class="pi pi-cloud-upload wbu-dropzone__icon"></i>
            <p class="wbu-dropzone__title">Arrastrá una imagen o hacé click para seleccionar</p>
            <p class="wbu-dropzone__hint">PNG, JPG, WEBP — máximo 5 MB</p>
            <input
              #fileInput
              type="file"
              accept="image/png,image/jpeg,image/webp,image/gif"
              style="display:none"
              (change)="onFileChange($event)"
            />
          </div>
        } @else {
          <ng-container [ngTemplateOutlet]="cropperTpl" />
        }
      }

      <!-- ── Tab: URL ── -->
      @if (tab() === 'url') {
        @if (!urlLoaded()) {
          <div class="wbu-url-form">
            <div class="wbu-url-row">
              <input
                pInputText
                class="wbu-url-input"
                [(ngModel)]="imageUrl"
                placeholder="https://ejemplo.com/imagen.jpg"
                (keyup.enter)="loadFromUrl()"
              />
              <p-button
                label="Cargar"
                icon="pi pi-check"
                [disabled]="!imageUrl.trim()"
                (click)="loadFromUrl()"
              />
            </div>
            <p class="wbu-url-hint">La imagen se cargará para recortar y se subirá a tu almacenamiento.</p>
          </div>
        } @else {
          <ng-container [ngTemplateOutlet]="cropperTpl" />
        }
      }

      <!-- ── Tab: Color ── -->
      @if (tab() === 'color') {
        <div class="wbu-colors">
          <p class="wbu-colors__hint">Elegí un gradiente para el banner</p>
          <div class="wbu-colors__grid">
            @for (opt of bannerOptions; track opt.key) {
              <button
                class="wbu-color-swatch"
                [class.wbu-color-swatch--active]="selectedColor() === opt.key"
                [style.background]="opt.gradient"
                [title]="opt.label"
                (click)="selectedColor.set(opt.key)"
              >
                @if (selectedColor() === opt.key) {
                  <i class="pi pi-check"></i>
                }
              </button>
            }
          </div>
          @if (selectedColor()) {
            <div class="wbu-colors__confirm">
              <p-button
                label="Aplicar gradiente"
                icon="pi pi-check"
                (click)="confirm()"
              />
            </div>
          }
        </div>
      }

      <!-- ── Cropper template ── -->
      <ng-template #cropperTpl>
        <div class="wbu-cropper-wrap">
          <image-cropper
            #cropper
            [imageChangedEvent]="imageChangedEvent()"
            [imageURL]="cropperUrl()"
            [aspectRatio]="16 / 4"
            [maintainAspectRatio]="true"
            [resizeToWidth]="1200"
            output="blob"
            format="jpeg"
            (imageCropped)="onImageCropped($event)"
            (imageLoaded)="onImageLoaded($event)"
            (loadImageFailed)="onLoadFailed()"
          />
          <p class="wbu-cropper-hint">Ajustá el recorte para el banner (proporción 4:1)</p>
        </div>
        <button class="wbu-change-btn" (click)="resetImage()">
          <i class="pi pi-refresh"></i> Cambiar imagen
        </button>
      </ng-template>

      <!-- ── Footer ── -->
      <ng-template pTemplate="footer">
        <p-button
          label="Cancelar"
          severity="secondary"
          [text]="true"
          (click)="visible.set(false)"
        />
        <p-button
          [label]="uploading() ? 'Subiendo...' : 'Confirmar'"
          icon="pi pi-check"
          [loading]="uploading()"
          [disabled]="!canConfirm()"
          (click)="confirm()"
        />
      </ng-template>
    </p-dialog>
  `,
  styles: [`
    /* ─── Tabs ─── */
    .wbu-tabs {
      display: flex;
      gap: 4px;
      margin-bottom: 20px;
      border-bottom: 1px solid var(--p-surface-200);
    }
    .wbu-tab {
      display: flex;
      align-items: center;
      gap: 6px;
      padding: 8px 14px;
      font-size: 0.85rem;
      font-weight: 500;
      border: none;
      background: none;
      cursor: pointer;
      color: var(--p-text-muted-color);
      border-bottom: 2px solid transparent;
      margin-bottom: -1px;
      transition: color 0.15s, border-color 0.15s;
    }
    .wbu-tab:hover { color: var(--p-text-color); }
    .wbu-tab--active {
      color: var(--p-primary-color);
      border-bottom-color: var(--p-primary-color);
      font-weight: 600;
    }

    /* ─── Dropzone ─── */
    .wbu-dropzone {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 8px;
      padding: 40px 24px;
      border: 2px dashed var(--p-surface-300);
      border-radius: 10px;
      cursor: pointer;
      transition: border-color 0.15s, background 0.15s;
      text-align: center;
    }
    .wbu-dropzone:hover, .wbu-dropzone--drag {
      border-color: var(--p-primary-color);
      background: var(--p-primary-50);
    }
    .wbu-dropzone__icon {
      font-size: 2.25rem;
      color: var(--p-text-muted-color);
    }
    .wbu-dropzone--drag .wbu-dropzone__icon { color: var(--p-primary-color); }
    .wbu-dropzone__title {
      margin: 0;
      font-size: 0.9rem;
      font-weight: 500;
      color: var(--p-text-color);
    }
    .wbu-dropzone__hint {
      margin: 0;
      font-size: 0.78rem;
      color: var(--p-text-muted-color);
    }

    /* ─── URL form ─── */
    .wbu-url-form {
      display: flex;
      flex-direction: column;
      gap: 10px;
      padding: 16px 0;
    }
    .wbu-url-row {
      display: flex;
      gap: 8px;
    }
    .wbu-url-input { flex: 1; }
    .wbu-url-hint {
      margin: 0;
      font-size: 0.78rem;
      color: var(--p-text-muted-color);
    }

    /* ─── Cropper ─── */
    .wbu-cropper-wrap {
      border-radius: 8px;
      overflow: hidden;
      background: #111;
      min-height: 200px;
    }
    .wbu-cropper-hint {
      margin: 6px 0 0;
      font-size: 0.75rem;
      color: var(--p-text-muted-color);
      text-align: center;
    }
    .wbu-change-btn {
      display: flex;
      align-items: center;
      gap: 5px;
      margin-top: 10px;
      font-size: 0.78rem;
      color: var(--p-text-muted-color);
      background: none;
      border: none;
      cursor: pointer;
      padding: 4px 8px;
      border-radius: 6px;
      transition: background 0.12s, color 0.12s;
    }
    .wbu-change-btn:hover { background: var(--p-surface-100); color: var(--p-text-color); }

    /* ─── Colors ─── */
    .wbu-colors { padding: 8px 0; }
    .wbu-colors__hint {
      margin: 0 0 14px;
      font-size: 0.82rem;
      color: var(--p-text-muted-color);
    }
    .wbu-colors__confirm {
      margin-top: 16px;
      display: flex;
      justify-content: flex-end;
    }
    .wbu-colors__grid {
      display: grid;
      grid-template-columns: repeat(5, 1fr);
      gap: 10px;
    }
    .wbu-color-swatch {
      height: 60px;
      border-radius: 8px;
      border: 3px solid transparent;
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
      transition: transform 0.12s, border-color 0.12s;
      color: white;
      font-size: 1rem;
    }
    .wbu-color-swatch:hover { transform: scale(1.05); }
    .wbu-color-swatch--active { border-color: #1e293b; transform: scale(1.05); }
  `],
})
export class WikiBannerUploaderComponent {
  @ViewChild('cropper') cropperRef?: ImageCropperComponent;

  visible = model<boolean>(false);
  bannerSelected = output<string>();

  private readonly assetsService = inject(AssetsService);
  private readonly uiDialog = inject(UiDialogService);

  readonly bannerOptions = BANNER_OPTIONS;

  tab = signal<Tab>('file');
  dragging = signal(false);
  uploading = signal(false);

  imageChangedEvent = signal<Event | null>(null);
  cropperUrl = signal<string>('');
  urlLoaded = signal(false);
  imageUrl = '';

  latestBlob = signal<Blob | null>(null);
  selectedColor = signal<string | null>(null);

  canConfirm(): boolean {
    if (this.tab() === 'color') return !!this.selectedColor();
    return !!(this.imageChangedEvent() || this.urlLoaded());
  }

  setTab(t: Tab): void {
    this.tab.set(t);
    this.resetImage();
    this.selectedColor.set(null);
  }

  onFileChange(event: Event): void {
    this.latestBlob.set(null);
    this.imageChangedEvent.set(event);
  }

  onFileDrop(event: DragEvent): void {
    event.preventDefault();
    this.dragging.set(false);
    const file = event.dataTransfer?.files?.[0];
    if (!file) return;
    const syntheticEvent = { target: { files: [file] } } as unknown as Event;
    this.latestBlob.set(null);
    this.imageChangedEvent.set(syntheticEvent);
  }

  loadFromUrl(): void {
    if (!this.imageUrl.trim()) return;
    this.latestBlob.set(null);
    this.cropperUrl.set(this.imageUrl.trim());
    this.urlLoaded.set(true);
  }

  onImageLoaded(_img: LoadedImage): void { /* ok */ }

  onImageCropped(event: ImageCroppedEvent): void {
    if (event.blob) this.latestBlob.set(event.blob);
  }

  onLoadFailed(): void {
    this.uiDialog.showError('Error', 'No se pudo cargar la imagen. Verificá la URL o intentá con otro archivo.');
    this.resetImage();
  }

  resetImage(): void {
    this.imageChangedEvent.set(null);
    this.cropperUrl.set('');
    this.urlLoaded.set(false);
    this.imageUrl = '';
    this.latestBlob.set(null);
  }

  reset(): void {
    this.resetImage();
    this.tab.set('file');
    this.selectedColor.set(null);
  }

  async confirm(): Promise<void> {
    if (this.tab() === 'color') {
      const key = this.selectedColor();
      if (key) {
        this.bannerSelected.emit(key);
        this.visible.set(false);
      }
      return;
    }

    this.uploading.set(true);
    try {
      // Intentar obtener blob fresco del cropper, o usar el último capturado
      let blob = this.latestBlob();
      if (!blob && this.cropperRef) {
        const result = await this.cropperRef.crop('blob');
        blob = result?.blob ?? null;
      }
      if (!blob) {
        this.uiDialog.showWarn('Sin imagen', 'Ajustá el recorte antes de confirmar.');
        return;
      }
      const file = new File([blob], `wiki-banner-${Date.now()}.jpg`, { type: 'image/jpeg' });
      const url = await this.assetsService.uploadFile(file);
      this.bannerSelected.emit(url);
      this.visible.set(false);
    } catch {
      this.uiDialog.showError('Error', 'No se pudo subir la imagen. Intentá de nuevo.');
    } finally {
      this.uploading.set(false);
    }
  }
}
