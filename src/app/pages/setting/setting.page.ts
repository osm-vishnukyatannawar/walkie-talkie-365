import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { IonicModule } from '@ionic/angular';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-setting',
  templateUrl: './setting.page.html',
  styleUrls: ['./setting.page.scss'],
  standalone: true,
  imports: [IonicModule, CommonModule, FormsModule],
})
export class SettingPage implements OnInit {
  token = '';

  constructor() {}

  ngOnInit() {
    console.log(localStorage.getItem('token'));
    this.token = localStorage.getItem('token') || '';
  }

  saveTokenToLocalStorage() {
    console.log(this.token);
    localStorage.setItem('token', this.token);
  }
}
