import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MarketControls } from './market-controls';

describe('MarketControls', () => {
  let component: MarketControls;
  let fixture: ComponentFixture<MarketControls>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MarketControls]
    })
    .compileComponents();

    fixture = TestBed.createComponent(MarketControls);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
