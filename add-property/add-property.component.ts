import { CommonModule } from '@angular/common';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { environment } from 'src/environments/environment';
interface Feature {
  id: number;
  name: string;
}

@Component({
  imports: [CommonModule, FormsModule],
  selector: 'app-add-property',
  templateUrl: './add-property.component.html',
})
export class AddPropertyComponent {
constructor(private http: HttpClient){}

  cities = ['Delhi', 'Mumbai', 'Bangalore', 'Chennai', 'Kolkata', 'Hyderabad', 'Pune'];
  states = ['Delhi', 'Maharashtra', 'Karnataka', 'Tamil Nadu', 'West Bengal', 'Telangana'];

  features: Feature[] = [
    { id: 1, name: 'AC' },
    { id: 2, name: 'Food Available' },
    { id: 3, name: 'Laundry' },
    { id: 4, name: 'Parking' },
    { id: 5, name: 'Refrigerator' },
    { id: 6, name: 'Gym' },
    { id: 7, name: 'Swimming Pool' },
  ];

  property = {
    name: '',
    address: '',
    status: '',
    type: '',
    city: '',
    state: '',
    contactNumber: '',
    price: null as number | null,
    rooms: null as number | null,
    featureIds: [] as number[],
    imageUrl: ''
  };

  onFeatureChange(event: Event) {
    const checkbox = event.target as HTMLInputElement;
    const value = Number(checkbox.value);

    if (checkbox.checked) {
      if (!this.property.featureIds.includes(value)) {
        this.property.featureIds.push(value);
      }
    } else {
      this.property.featureIds = this.property.featureIds.filter((id) => id !== value);
    }
  }

  onSubmit() {
  const token = sessionStorage.getItem('token'); // Adjust if stored elsewhere

  const headers = new HttpHeaders({
    'Content-Type': 'application/json',
    Authorization: `Bearer ${token}`
  });

  this.http.post(`${environment.apiBaseUrl}/api/properties`, this.property, { headers })
    .subscribe({
      next: (response) => {
        console.log('Property added successfully:', response);
        // Optional: Navigate or show success message
      },
      error: (error) => {
        console.error('Error adding property:', error);
      }
    });
}

}
