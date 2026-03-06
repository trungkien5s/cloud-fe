import { ComponentFixture, TestBed } from '@angular/core/testing';

import { UserProfileModal } from './user-profile-modal';

describe('UserProfileModal', () => {
  let component: UserProfileModal;
  let fixture: ComponentFixture<UserProfileModal>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [UserProfileModal],
    }).compileComponents();

    fixture = TestBed.createComponent(UserProfileModal);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
