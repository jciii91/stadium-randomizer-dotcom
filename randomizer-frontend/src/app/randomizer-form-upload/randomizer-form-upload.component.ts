import { Component } from '@angular/core';
import { HttpClient, HttpHeaders, HttpResponse } from '@angular/common/http';

@Component({
  selector: 'app-randomizer-form-upload',
  standalone: true,
  imports: [],
  templateUrl: './randomizer-form-upload.component.html',
  styleUrl: './randomizer-form-upload.component.css'
})

export class RandomizerFormUploadComponent {
  selectedFile: File | null = null;

  constructor(
    private http: HttpClient
  ) {}

  onFileSelected(event: Event) {
    const input = event.target as HTMLInputElement;
    if (input.files?.length) {
      this.selectedFile = input.files[0];
    }
  }

  onSubmit(event: Event) {
    event.preventDefault();

    if (!this.selectedFile) {
      return;
    }

    const reader = new FileReader();
    reader.onload = (event: any) => {
      const binaryData = event.target.result;
      this.uploadFile(binaryData);
    };
    reader.readAsArrayBuffer(this.selectedFile);
  }

  uploadFile(binaryData: ArrayBuffer) {
    const headers = new HttpHeaders({
      'Content-Type': 'application/octet-stream'
    });

    this.http.post('http://localhost:3000/upload', binaryData, { 
      headers,
      responseType: 'blob',
      observe: 'response' 
    })
    .subscribe({
      next: (response: HttpResponse<Blob>) => {
        console.log('Upload successful', response);
        this.downloadFile(response.body, 'pkStadium.z64');
      },
      error: (error: any) => {
        console.log('Upload failed', error);
      }
    });
  }

  downloadFile(data: Blob | null, filename: string) {
    if (!data)
      return;

    const blob = new Blob([data], { type: 'application/octet-stream' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
  }
}
