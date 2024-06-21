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
  baseStatsSliderValue: number = 1;
  attacksSliderValue: number = 1;
  seedCountValue: number = 1;

  constructor(
    private http: HttpClient
  ) {}

  onFileSelected(event: Event) {
    const input = event.target as HTMLInputElement;
    if (input.files?.length) {
      this.selectedFile = input.files[0];
    }
  }

  onSliderChange(event: any): void {
    const sliderId = event.target.id;
    const value = +event.target.value;

    if (sliderId === 'baseStatsSlider') {
      this.baseStatsSliderValue = value;
    } else if (sliderId === 'attacksSlider') {
      this.attacksSliderValue = value;
    }
  }

  onSeedCountChange(event: any): void {
    const value = +event.target.value;
    if (value >= 1 && value <= 20) {
      this.seedCountValue = value;
    } else if (value > 20) {
      this.seedCountValue = 20;
    } else {
      this.seedCountValue = 1;
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
    const headers = new HttpHeaders({});

    const formData = new FormData();
    const fileBlob = new Blob([binaryData], { type: 'application/octet-stream' });
    formData.append('file', fileBlob, 'baseROM.z64');
    formData.append('baseStatsSliderValue', this.baseStatsSliderValue.toString());
    formData.append('attacksSliderValue', this.attacksSliderValue.toString());
    formData.append('seedCountValue', this.seedCountValue.toString());

    this.http.post('http://localhost:3000/upload', formData, { 
      responseType: 'blob',
      observe: 'response' 
    })
    .subscribe({
      next: (response: HttpResponse<Blob>) => {
        console.log('Upload successful', response);
        this.downloadFile(response.body, 'seeds.zip');
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
