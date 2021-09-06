import { TestBed } from '@angular/core/testing';
import { DatenbestandComponent } from './datenbestand.component';

describe('AppComponent', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [
        DatenbestandComponent
      ],
    }).compileComponents();
  });

  it('should create the app', () => {
    const fixture = TestBed.createComponent(DatenbestandComponent);
    const app = fixture.componentInstance;
    expect(app).toBeTruthy();
  });

  it(`should have as title 'Datenbestand'`, () => {
    const fixture = TestBed.createComponent(DatenbestandComponent);
    const app = fixture.componentInstance;
    expect(app.title).toEqual('Datenbestand');
  });

  it('should render title', () => {
    const fixture = TestBed.createComponent(DatenbestandComponent);
    fixture.detectChanges();
    const compiled = fixture.nativeElement;
    expect(compiled.querySelector('.content span').textContent).toContain('PlanoProj app is running!');
  });
});
