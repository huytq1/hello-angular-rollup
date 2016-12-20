import {Component} from '@angular/core';

@Component({
    moduleId: module.id,
    selector: 'my-app',
    templateUrl: 'app.component.html',
    styles: [`
        h1 {
            color: red;
        }
    `],
    styleUrls: ['app.css']
})
export class AppComponent {
    showHeading = true;
    heroes = ['Magneta', 'Bombasto', 'Magma', 'Tornado'];

    constructor() {
        console.log('initializing app conponent');
    }

    toggleHeading() {
        this.showHeading = !this.showHeading;
    }
}