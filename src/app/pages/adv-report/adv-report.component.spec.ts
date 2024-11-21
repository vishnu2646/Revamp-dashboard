import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AdvReportComponent } from './adv-report.component';

describe('AdvReportComponent', () => {
  let component: AdvReportComponent;
  let fixture: ComponentFixture<AdvReportComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AdvReportComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(AdvReportComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
