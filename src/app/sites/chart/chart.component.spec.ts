import { TestBed } from '@angular/core/testing';
import { ChartComponent } from './chart.component';

describe('AppComponent', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [
        ChartComponent
      ],
    }).compileComponents();
  });

  it('should create the app', () => {
    const fixture = TestBed.createComponent(ChartComponent);
    const app = fixture.componentInstance;
    expect(app).toBeTruthy();
  });

  it(`should have as title 'PlanoProj'`, () => {
    const fixture = TestBed.createComponent(ChartComponent);
    const app = fixture.componentInstance;
    expect(app.title).toEqual('PlanoProj');
  });

  it('should render title', () => {
    const fixture = TestBed.createComponent(ChartComponent);
    fixture.detectChanges();
    const compiled = fixture.nativeElement;
    expect(compiled.querySelector('.content span').textContent).toContain('PlanoProj app is running!');
  });
});
