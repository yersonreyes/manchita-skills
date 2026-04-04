import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { firstValueFrom } from 'rxjs';
import { environment } from '../../../../environments/environment';

interface UploadResponse {
  res: { url: string; key: string };
  code: number;
  message: string;
}

@Injectable({ providedIn: 'root' })
export class AssetsService {
  private readonly http = inject(HttpClient);
  private readonly uploadUrl = `${environment.apiBaseUrl}/assets/upload`;

  async uploadFile(file: File): Promise<string> {
    const formData = new FormData();
    formData.append('file', file);
    const response = await firstValueFrom(
      this.http.post<UploadResponse>(this.uploadUrl, formData),
    );
    return response.res.url;
  }
}
