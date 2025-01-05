import { Dialog } from '@angular/cdk/dialog';
import { Component, Input, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';

@Component({
  selector: 'app-confirmation-dialog',
  templateUrl: './confirmation-dialog.component.html',
  styleUrl: './confirmation-dialog.component.css'
})
export class ConfirmationDialogComponent implements OnInit{
  @Input() title: string = "Add User"
  @Input() message: string = "Do you really want to add User"
  
  constructor(private activeDialog: Dialog) {
  }

  ngOnInit(): void {
  }
  
  public decline() {
    
  }
  
}
