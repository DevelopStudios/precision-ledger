import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MarketGrid } from './market-grid';

describe('MarketGrid', () => {
  let component: MarketGrid;
  let fixture: ComponentFixture<MarketGrid>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MarketGrid]
    })
    .compileComponents();

    fixture = TestBed.createComponent(MarketGrid);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
