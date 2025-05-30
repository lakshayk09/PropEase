import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { NavbarComponent } from 'src/app/shared/navbar/navbar.component';
import { environment } from 'src/environments/environment';

interface BookingResponse {
  id: number;
  // Add other fields if needed
}

@Component({
  standalone: true,
  imports: [CommonModule, FormsModule, NavbarComponent],
  selector: 'app-property-search',
  templateUrl: './property-search.component.html',
  styleUrls: ['./property-search.component.scss']
})
export class PropertySearchComponent implements OnInit {
  searchQuery = '';
  selectedCity = '';
  selectedState = '';

  cities = ['Mumbai', 'Pune', 'Delhi', 'Bengaluru'];
  states = ['Maharashtra', 'Karnataka', 'Delhi', 'Tamil Nadu'];

  properties: any[] = [];
  selectedProperty: any = null;
  startDate: string = '';
  endDate: string = '';
  specialRequests: string = '';
  guestCount: number = 1;
  bookingAmount: number = 0;


  constructor(private http: HttpClient) {}

  ngOnInit(): void {
    this.loadProperties();
    
 // Check if redirected from Stripe
  const bookingId = localStorage.getItem('pendingBookingId');
  const sessionId = localStorage.getItem('stripeSessionId');

  if (bookingId && sessionId) {
    this.updatePaymentStatus(+bookingId, sessionId, 'SUCCESS');
    localStorage.removeItem('pendingBookingId');
    localStorage.removeItem('stripeSessionId');
  }

  }

  loadProperties(): void {
    const token = sessionStorage.getItem('token');

    const headers = new HttpHeaders({
      Authorization: `Bearer ${token}`
    });

    this.http.get<any[]>(`${environment.apiBaseUrl}/api/properties`, { headers }).subscribe({
      next: (data) => {
        this.properties = data;
      },
      error: (err) => {
        console.error('Error loading properties:', err);
      }
    });
  }

  get filteredProperties() {
    return this.properties.filter(prop =>
      (!this.searchQuery || prop.name.toLowerCase().includes(this.searchQuery.toLowerCase())) &&
      (!this.selectedCity || prop.city === this.selectedCity) &&
      (!this.selectedState || prop.state === this.selectedState)
    );
  }

  openBookingPopup(prop: any) {
    this.selectedProperty = prop;
    this.startDate = '';
    this.endDate = '';
    this.specialRequests = '';
    this.guestCount = 1;
    this.bookingAmount=0;
  }

  calculateBookingAmount() {
    if (this.startDate && this.endDate) {
      const start = new Date(this.startDate);
      const end = new Date(this.endDate);
      const timeDiff = end.getTime() - start.getTime();
      const noOfDays = Math.ceil(timeDiff / (1000 * 60 * 60 * 24));
      this.bookingAmount = noOfDays > 0 ? (noOfDays * 500) + 500 : 0;
    } else {
      this.bookingAmount = 0;
    }
  }


  closePopup() {
    this.selectedProperty = null;
  }

  submitBooking() {
    if (!this.startDate || !this.endDate || !this.selectedProperty) return;


    const start = new Date(this.startDate);
    const end = new Date(this.endDate);

    // Calculate the number of days between the two dates
    const timeDiff = end.getTime() - start.getTime();
    const noOfDays = Math.ceil(timeDiff / (1000 * 60 * 60 * 24));

    // Calculate booking amount
    const bookingAmount =( noOfDays * 500.0 ) + 500;


    const bookingPayload = {
      propertyId: this.selectedProperty.id,
      propertyName: this.selectedProperty.name,
      bookingDate: new Date().toISOString().split('T')[0],
      startDate: this.startDate,
      endDate: this.endDate,
      bookingAmount: bookingAmount,
      bookingStatus: 'pending',
      paymentId: 'null',
      paymentStatus: 'PENDING',
      specialRequests: this.specialRequests,
      guestCount: this.guestCount
    };


    const token = sessionStorage.getItem('token');
    const headers = new HttpHeaders({ Authorization: `Bearer ${token}` });

    // for testing comment this out
    this.http.post<BookingResponse>(`${environment.apiBaseUrl}/api/bookings`, bookingPayload, { headers }).subscribe({
      next: (res) => {
        //new-payment2
        const bookingId = res.id; // assuming backend returns booking ID

        alert('Booking successful!');
        //new-payment
        this.initiatePayment(bookingAmount, this.selectedProperty.name, bookingId);

        this.closePopup();
      },
      error: (err) => {
        console.error('Booking failed:', err);
        alert('Booking failed. Please try again.');
      }
    });
    console.log(bookingPayload.bookingAmount);
  }

  //new-payment
  initiatePayment(amount: number, name: string, bookingId: number) {
    
    const token = sessionStorage.getItem('token');
    const headers = new HttpHeaders({
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`
    });

    const paymentRequest = {
      amount: amount,
      quantity: 1,
      currency: 'INR',
      name: name
    };

    this.http.post<any>(`${environment.paymentUrl}/api/payment/checkout`, paymentRequest, { headers })
      .subscribe({
      next: (response) => {
          if (response && response.sessionUrl && response.sessionId) {
            // Store bookingId and sessionId for use after redirect
            localStorage.setItem('pendingBookingId', bookingId.toString());
            localStorage.setItem('stripeSessionId', response.sessionId);
            window.open(response.sessionUrl, '_blank');
          } else {
            alert('Failed to initiate payment session.');
          }
        },
        error: (err) => {
          console.error('Payment initiation failed:', err);
          alert('Payment initiation failed. Please try again.');
        }
      });

}

updatePaymentStatus(bookingId: number, paymentId: string, paymentStatus: string) {
  const token = sessionStorage.getItem('token');
  const headers = new HttpHeaders({
    Authorization: `Bearer ${token}`
  });

  const params = {
    paymentId: paymentId,
    paymentStatus: paymentStatus
  };

  this.http.put(`${environment.apiBaseUrl}/api/bookings/${bookingId}/payment`, null, { headers, params })
    .subscribe({
      next: () => {
        console.log('Payment status updated successfully.');
      },
      error: (err) => {
        console.error('Failed to update payment status:', err);
      }
    });
}



  bookProperty(prop: any) {
    this.openBookingPopup(prop);
  }
}
