import { ComponentFixture, TestBed } from '@angular/core/testing';

import { GroupedOrderDetailsComponent } from './grouped-order-details.component';

describe('GroupedOrderDetailsComponent', () => {
  let component: GroupedOrderDetailsComponent;
  let fixture: ComponentFixture<GroupedOrderDetailsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [GroupedOrderDetailsComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(GroupedOrderDetailsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
