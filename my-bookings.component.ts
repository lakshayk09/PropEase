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
  showCancelPopup: boolean = false;
  cancelReason: string = '';
  selectedBookingId: number | null = null;
  //end

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
    console.log('Edit booking:', booking);
    // Implement edit logic (e.g. navigate to booking update page)
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

  // cancelBooking(booking: any) {
  //   console.log('Cancel booking:', booking);
  //   // Implement cancel logic (API call to cancel booking)
  // }
  cancelBooking(booking: any) {
    console.log('Cancel booking:', booking);
    this.openCancelPopup(booking.id);
  }


}
