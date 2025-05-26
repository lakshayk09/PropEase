import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { environment } from 'src/environments/environment';

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
  imports: [CommonModule],
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

  onEdit(id: number): void {
    console.log('Edit clicked for property:', id);
    // TODO: Route to edit page or open modal
  }

  // onDelete(id: number): void {
  //   console.log('Delete clicked for property:', id);
  //   // TODO: Call backend DELETE API and refresh list
  // }

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
