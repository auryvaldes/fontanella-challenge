import { ComponentFixture, TestBed } from '@angular/core/testing';
import { BookingCalendarComponent } from './booking-calendar.component';
import { HttpClientTestingModule } from '@angular/common/http/testing';

describe('BookingCalendarComponent', () => {
  let component: BookingCalendarComponent;
  let fixture: ComponentFixture<BookingCalendarComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [BookingCalendarComponent, HttpClientTestingModule]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(BookingCalendarComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should open and close the help modal', () => {
    expect(component.isHelpModalOpen).toBeFalse();
    component.openHelpModal();
    expect(component.isHelpModalOpen).toBeTrue();
    component.closeHelpModal();
    expect(component.isHelpModalOpen).toBeFalse();
  });

  it('should clear successMessage when calling fetchSlots normally', () => {
    component.successMessage = 'Exito';
    component.selectedDate = '2026-05-10'; // Para pasar el guard clause
    component.fetchSlots();
    expect(component.successMessage).toBeNull();
  });

  it('should preserve successMessage when calling fetchSlots with preserveSuccess = true', () => {
    component.successMessage = 'Exito';
    component.selectedDate = '2026-05-10'; 
    component.fetchSlots(true);
    expect(component.successMessage).toEqual('Exito');
  });
});
