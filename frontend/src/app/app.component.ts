import { Component } from '@angular/core';
import { BookingCalendarComponent } from './components/booking-calendar/booking-calendar.component';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [BookingCalendarComponent],
  template: '<app-booking-calendar></app-booking-calendar>'
})
export class AppComponent { }
