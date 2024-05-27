import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RandomizerFormUploadComponent } from './randomizer-form-upload.component';

describe('RandomizerFormUploadComponent', () => {
  let component: RandomizerFormUploadComponent;
  let fixture: ComponentFixture<RandomizerFormUploadComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [RandomizerFormUploadComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(RandomizerFormUploadComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
