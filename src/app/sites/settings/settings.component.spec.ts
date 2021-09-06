import { TestBed } from '@angular/core/testing';
import { SettingsComponent } from './settings.component';

describe('AppComponent', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [
        SettingsComponent
      ],
    }).compileComponents();
  });

  it('should create the app', () => {
    const fixture = TestBed.createComponent(SettingsComponent);
    const app = fixture.componentInstance;
    expect(app).toBeTruthy();
  });

  it(`should have as title 'Settings'`, () => {
    const fixture = TestBed.createComponent(SettingsComponent);
    const app = fixture.componentInstance;
    expect(app.title).toEqual('Settings');
  });

  it('should render title', () => {
    const fixture = TestBed.createComponent(SettingsComponent);
    fixture.detectChanges();
    const compiled = fixture.nativeElement;
    expect(compiled.querySelector('.content span').textContent).toContain('PlanoProj app is running!');
  });
});
