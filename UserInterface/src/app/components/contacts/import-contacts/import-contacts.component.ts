import { Component } from '@angular/core';
import { AppService } from '../../../services/app-service.service';
import { Router, RouterModule } from '@angular/router';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-import-contacts',
  standalone: true,
  imports: [RouterModule],
  templateUrl: './import-contacts.component.html',
  styleUrl: './import-contacts.component.css'
})

export class ImportContactsComponent {
  CopiedText: string = '';

  constructor(private toaster: ToastrService, private service: AppService,private router:Router) { }

  onPasteClick(): void {
    const pasteArea = document.getElementById('pasteArea') as HTMLTextAreaElement;
    pasteArea.classList.remove('d-none');  // Make the textarea visible for pasting

    pasteArea.focus();  // Focus the textarea so the user can paste the text

    // After pasting, listen for changes and process the input
    pasteArea.addEventListener('input', () => {
      this.CopiedText = pasteArea.value;  // Capture the pasted text
      this.CreateCsvFromText();  // Call the CSV creation function

      // send file to UploadCsvFile(event: any) 
      pasteArea.classList.add('d-none');  // Hide the textarea after processing
      pasteArea.value = '';  // Clear the textarea
    });
  }

  // Convert copied text (assumed tab-delimited) to CSV
  CreateCsvFromText(): void {
    if (!this.CopiedText) return;

    const rows = this.CopiedText.split('\n').map(row => row.split('\t'));  // Assuming tab-delimited text
    let csvContent = 'Name,Email,Phone,WhatsApp\n';  // CSV header
    rows.forEach(row => {
      csvContent += row.join(',') + '\n';  // Convert to comma-separated format
    });

    // Create CSV file and trigger download
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = 'contacts.csv';
    link.click();
  }


  // Handle CSV file upload
  async UploadCsvFile(event: any) {
    const file = event.target.files[0];
    if (!file) return;

    const isValidFormat = await this.CheckFormatOfCsv(file);
    if (isValidFormat) {
      this.service.ImportBulkContacts(file).subscribe({
        next: (Response: any) => {
          this.toaster.success("File uploaded successfully");
          this.router.navigate(["/list-contacts"])
        }
      });
    } else {
      this.toaster.warning("Invalid File", "Please check if your file contains exactly 4 columns with the header: Name, Email, Phone, WhatsApp");
    }
  }
  // Mockup for CheckFormatOfCsv method to check the CSV file format (already implemented)
  CheckFormatOfCsv(file: File): Promise<boolean> {
    // Your implementation for CSV format validation
    return new Promise((resolve, reject) => {
      // Example validation logic
      const reader = new FileReader();
      reader.onload = () => {
        const content = reader.result as string;
        const rows = content.split('\n');
        const header = rows[0].split(',');

        const isValidFormat = header.includes('Name') && header.includes('Email') &&
          header.includes('Phone') && header.includes('WhatsApp') && header.length === 4;
        resolve(isValidFormat);
      };

      reader.onerror = () => reject(false);
      reader.readAsText(file);
    });
  }
}
