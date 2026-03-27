import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AlphaAnalyst } from './alpha-analyst';

describe('AlphaAnalyst', () => {
  let component: AlphaAnalyst;
  let fixture: ComponentFixture<AlphaAnalyst>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AlphaAnalyst]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AlphaAnalyst);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
