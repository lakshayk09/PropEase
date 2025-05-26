import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { NavbarComponent } from 'src/app/shared/navbar/navbar.component';
import { environment } from 'src/environments/environment';

@Component({
  imports: [CommonModule, FormsModule, RouterModule, NavbarComponent],
  selector: 'app-my-bookings',
  templateUrl: './my-bookings.component.html',
  styleUrls: ['./my-bookings.component.scss']
})
export class MyBookingsComponent implements OnInit {
  bookings: any[] = [];
  
  //new
  showEditPopup: boolean = false;
  editBookingData: any = {
    id: null,
    startDate: '',
    endDate: '',
    guestCount: 1,
    specialRequests: ''
  };

  showCancelPopup: boolean = false;
  cancelReason: string = '';
  selectedBookingId: number | null = null;

  constructor(private http: HttpClient) {}

  ngOnInit() {
    this.fetchBookings();
  }

  fetchBookings() {
    const token = sessionStorage.getItem('token');
    const headers = new HttpHeaders({
      Authorization: `Bearer ${token}`
    });

    this.http.get<any[]>(`${environment.apiBaseUrl}/api/bookings/user`, { headers }).subscribe({
      next: (data) => {
        this.bookings = data;
      },
      error: (err) => {
        console.error('Failed to load bookings:', err);
      }
    });
  }

  editBooking(booking: any) {
    this.editBookingData = {
      id: booking.id,
      propertyId: booking.propertyId,
      propertyName: booking.propertyName,
      startDate: booking.startDate,
      endDate: booking.endDate,
      guestCount: booking.guestCount,
      specialRequests: booking.specialRequests,
      bookingAmount: booking.bookingAmount,
      bookingStatus: booking.bookingStatus,
      paymentId: booking.paymentId,
      paymentStatus: booking.paymentStatus
    };
    this.showEditPopup = true;
  }


  //new
  openCancelPopup(bookingId: number) {
    this.selectedBookingId = bookingId;
    this.cancelReason = '';
    this.showCancelPopup = true;
  }

  closeCancelPopup() {
    this.showCancelPopup = false;
    this.cancelReason = '';
    this.selectedBookingId = null;
  }

  submitEdit() {
    const token = sessionStorage.getItem('token');
    const headers = new HttpHeaders({
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`
    });

    const updatedBooking = {
      propertyId: this.editBookingData.propertyId,
      propertyName: this.editBookingData.propertyName,
      startDate: this.editBookingData.startDate,
      endDate: this.editBookingData.endDate,
      bookingAmount: this.editBookingData.bookingAmount,
      bookingStatus: this.editBookingData.bookingStatus,
      paymentId: this.editBookingData.paymentId,
      paymentStatus: this.editBookingData.paymentStatus,
      specialRequests: this.editBookingData.specialRequests,
      guestCount: this.editBookingData.guestCount
    };

    this.http.put(`${environment.apiBaseUrl}/api/bookings/${this.editBookingData.id}`, updatedBooking, { headers })
      .subscribe({
        next: () => {
          this.showEditPopup = false;
          this.fetchBookings(); // Refresh list
        },
        error: (err) => {
          console.error('Failed to update booking:', err);
        }
      });
  }

  calculateEditedBookingAmount() {
    const start = new Date(this.editBookingData.startDate);
    const end = new Date(this.editBookingData.endDate);
    const timeDiff = end.getTime() - start.getTime();
    const noOfDays = Math.ceil(timeDiff / (1000 * 60 * 60 * 24));
    this.editBookingData.bookingAmount = noOfDays > 0 ? (noOfDays * 500) + 500 : 0;
  }



  submitCancellation() {
    if (!this.cancelReason.trim() || !this.selectedBookingId) return;

    const token = sessionStorage.getItem('token');
    const headers = new HttpHeaders({
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`
    });

    const body = { message: this.cancelReason };

    this.http.put(`${environment.apiBaseUrl}/api/bookings/${this.selectedBookingId}/cancel`, body, { headers })
      .subscribe({
        next: () => {
          this.closeCancelPopup();
          this.fetchBookings(); // Refresh the list
        },
        error: (err) => {
          console.error('Cancellation failed:', err);
        }
    });
  }
  //end


  cancelBooking(booking: any) {
    console.log('Cancel booking:', booking);
    this.openCancelPopup(booking.id);
  }


}
