import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { environment } from 'src/environments/environment';
import { FormsModule } from '@angular/forms';

interface Property {
  id: number;
  name: string;
  address: string;
  status: string;
  type: string;
  city: string;
  state: string;
  contactNumber: string;
  price: number;
  rooms: number;
  featureIds: number[];
  imageUrl?: string;
}

@Component({
  imports: [CommonModule, FormsModule],
  selector: 'app-view-properties',
  templateUrl: './view-properties.component.html',
  styleUrls: ['./view-properties.component.scss']
})
export class ViewPropertiesComponent implements OnInit {
  searchText = '';
  properties: Property[] = [];

  featuresMap = new Map<number, string>([
    [1, 'AC'],
    [2, 'Food Available'],
    [3, 'Laundry'],
    [4, 'Parking'],
    [5, 'Refrigerator'],
    [6, 'Gym'],
    [7, 'Swimming Pool'],
  ]);

  showEditPopup: boolean = false;
  editProperty: Property = {
    id: 0,
    name: '',
    address: '',
    status: '',
    type: '',
    city: '',
    state: '',
    contactNumber: '',
    price: 0,
    rooms: 1,
    featureIds: [],
    imageUrl: ''
  };

  cities = ['Mumbai', 'Pune', 'Delhi', 'Bengaluru'];
  states = ['Maharashtra', 'Karnataka', 'Delhi', 'Tamil Nadu'];

  features = [
    { id: 1, name: 'AC' },
    { id: 2, name: 'Food Available' },
    { id: 3, name: 'Laundry' },
    { id: 4, name: 'Parking' },
    { id: 5, name: 'Refrigerator' },
    { id: 6, name: 'Gym' },
    { id: 7, name: 'Swimming Pool' }
  ];


  constructor(private http: HttpClient) {}

  ngOnInit(): void {
    this.loadUserProperties();
  }

  loadUserProperties(): void {
    const token = sessionStorage.getItem('token');

    const headers = new HttpHeaders({
      Authorization: `Bearer ${token}`
    });

    this.http.get<Property[]>(`${environment.apiBaseUrl}/api/properties/user`, { headers }).subscribe({
      next: (data) => {
        this.properties = data;
        console.log('User properties loaded:', this.properties);
      },
      error: (err) => {
        console.error('Error fetching user properties:', err);
      }
    });
  }

  filteredProperties(): Property[] {
    if (!this.searchText.trim()) return this.properties;

    return this.properties.filter((p) =>
      p.name.toLowerCase().includes(this.searchText.toLowerCase())
    );
  }

  getFeatureNames(featureIds: number[]): string[] {
    return featureIds.map((id) => this.featuresMap.get(id) || '');
  }

  // onEdit(id: number): void {
  //   console.log('Edit clicked for property:', id);
  //   // TODO: Route to edit page or open modal
  // }

  onEdit(id: number): void {
    const property = this.properties.find(p => p.id === id);
    if (property) {
      this.editProperty = { ...property };
      this.showEditPopup = true;
    }
  }

  onFeatureChange(event: any) {
    const featureId = +event.target.value;
    if (event.target.checked) {
      if (!this.editProperty.featureIds.includes(featureId)) {
        this.editProperty.featureIds.push(featureId);
      }
    } else {
      this.editProperty.featureIds = this.editProperty.featureIds.filter(id => id !== featureId);
    }
  }

  submitEdit() {
    const token = sessionStorage.getItem('token');
    const headers = new HttpHeaders({
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`
    });

    this.http.put(`${environment.apiBaseUrl}/api/properties`, this.editProperty, { headers })
      .subscribe({
        next: () => {
          this.showEditPopup = false;
          this.loadUserProperties(); // Refresh list
        },
        error: (err) => {
          console.error('Failed to update property:', err);
        }
      });
  }


  onDelete(id: number): void {
    const confirmDelete = confirm('Are you sure you want to delete this property?');
    if (!confirmDelete) return;

    const token = sessionStorage.getItem('token');
    const headers = new HttpHeaders({
      Authorization: `Bearer ${token}`
    });

    this.http.delete(`${environment.apiBaseUrl}/api/properties/${id}`, { headers, responseType: 'text' })
      .subscribe({
        next: (response) => {
          console.log(response); // Should log: "Deleted property with id - {id}"
          alert(`Property deleted successfully.`);
          this.loadUserProperties(); // Refresh the list
        },
        error: (err) => {
          console.error('Error deleting property:', err);
        }
      });
  }

}
