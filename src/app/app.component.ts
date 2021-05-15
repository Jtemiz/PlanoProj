import { Component } from '@angular/core';
import {EChartsOption} from 'echarts';
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

// When the user clicks on the button, open the modal
   openChart(): void {
     const modal = document.getElementById('chart');
     modal.style.display = 'block';
     const button = document.getElementById('button1');
     button.style.display = 'none';
     modal.style.position = button.style.position;
  }

// When the user clicks on <span> (x), close the modal
  function2(): void {
   const modal = document.getElementById('myDashboard');
   modal.style.display = 'none';
   const button = document.getElementById('1');
   button.style.display = 'block';
  }

}

