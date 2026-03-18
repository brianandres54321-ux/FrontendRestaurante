import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ListaMesas } from './lista-mesas';

describe('ListaMesas', () => {
  let component: ListaMesas;
  let fixture: ComponentFixture<ListaMesas>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ListaMesas],
    }).compileComponents();

    fixture = TestBed.createComponent(ListaMesas);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
