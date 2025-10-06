import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MyPublications } from './my-publications';

describe('MyPublications', () => {
  let component: MyPublications;
  let fixture: ComponentFixture<MyPublications>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MyPublications]
    })
    .compileComponents();

    fixture = TestBed.createComponent(MyPublications);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
