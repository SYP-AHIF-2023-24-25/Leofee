import { Component, inject, OnInit } from '@angular/core';
import { SharedService } from 'src/services/shared.service';
import { WhiteListService } from 'src/services/white-list-service.service';
import { Authentication } from './authentication';
import { KeycloakService } from 'keycloak-angular';

@Component({
  selector: 'app-whitelist-checker',
  templateUrl: './whitelist-checker.component.html',
  styleUrl: './whitelist-checker.component.css'
})
export class WhitelistCheckerComponent implements OnInit{
  isAllowed: Authentication = Authentication.checking;
  constructor(
    private whiteListService: WhiteListService, 
    private sharedService: SharedService){
  }

  ngOnInit(): void {
  }

  
}
