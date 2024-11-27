import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ActivationDialogComponent } from './activation-dialog.component';

describe('ActivationDialogComponent', () => {
  let component: ActivationDialogComponent;
  let fixture: ComponentFixture<ActivationDialogComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ActivationDialogComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(ActivationDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
