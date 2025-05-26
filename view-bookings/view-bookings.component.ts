import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';

 interface Booking {
  id: number;
  propertyId: number;
  propertyName: string;
  userId: number;
  userName: string;
  bookingDate: string;
  startDate: string;
  endDate: string;
  bookingAmount: number;
  bookingStatus: string;
  paymentId?: string | null;
  paymentStatus?: string | null;
  specialRequests?: string;
  guestCount: number;
}


@Component({
  imports: [CommonModule],
  selector: 'app-view-bookings',
  templateUrl: './view-bookings.component.html',
  styleUrls: ['./view-bookings.component.scss']
})
export class ViewBookingsComponent {
  bookings: Booking[] = [
    {
      id: 1,
      propertyId: 1,
      propertyName: "Sunset Residency",
      userId: 1,
      userName: "john",
      bookingDate: "2025-05-24",
      startDate: "2025-06-01",
      endDate: "2025-06-05",
      bookingAmount: 5000000.0,
      bookingStatus: "confirmed",
      paymentId: "PAY12345",
      paymentStatus: "SUCCESS",
      specialRequests: "Near elevator",
      guestCount: 2
    },
    {
      id: 2,
      propertyId: 2,
      propertyName: "Greenview PG",
      userId: 1,
      userName: "john",
      bookingDate: "2025-05-24",
      startDate: "2025-06-10",
      endDate: "2025-06-20",
      bookingAmount: 400.0,
      bookingStatus: "pending",
      paymentId: null,
      paymentStatus: null,
      specialRequests: "Quiet room please",
      guestCount: 1
    }
  ];
}
