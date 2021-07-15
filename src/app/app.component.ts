import { Component } from '@angular/core';
@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {
  title = 'PlanoProj';

// Get the button that opens the modal
   btn = document.getElementById('1');

// Get the <span> element that closes the modal
   span = document.getElementsByClassName('close')[0];
}

