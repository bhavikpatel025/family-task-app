import { Component } from '@angular/core';
import { RouterOutlet, RouterLink, RouterLinkActive } from '@angular/router';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, RouterLink, RouterLinkActive],
  template: `
    <nav class="navbar">
      <div class="navbar-container">
        <!-- Logo Section - Left Side -->
        <div class="navbar-brand">
          <a routerLink="/" class="logo-link">
            <div class="logo-box">
              <svg width="48" height="48" viewBox="0 0 120 120" fill="none" xmlns="http://www.w3.org/2000/svg">
                <!-- Top Center Circle (Cyan) -->
                <circle cx="60" cy="20" r="12" fill="#fdffffff"/>
                
                <!-- Left Person (Orange/Yellow) -->
                <circle cx="25" cy="50" r="10" fill="#f59e0b"/>
                <path d="M 12 65 Q 10 60 16 58 Q 25 56 26 65 Q 26 58 35 60 Q 40 62 38 68 L 38 82 Q 38 85 34 85 L 16 85 Q 12 85 12 82 Z" fill="#f59e0b"/>
                
                <!-- Center Person (Magenta/Pink) -->
                <circle cx="60" cy="55" r="13" fill="#ec4899"/>
                <path d="M 45 75 Q 43 68 50 66 Q 60 64 61 75 Q 61 66 70 68 Q 76 70 74 78 L 74 95 Q 74 99 70 99 L 50 99 Q 46 99 46 95 Z" fill="#ec4899"/>
                
                <!-- Right Person (Green) -->
                <circle cx="95" cy="50" r="10" fill="#520bfaff"/>
                <path d="M 82 65 Q 80 60 86 58 Q 95 56 96 65 Q 96 58 105 60 Q 110 62 108 68 L 108 82 Q 108 85 104 85 L 86 85 Q 82 85 82 82 Z" fill="#520bfaff"/>
                
                <!-- Connecting curved lines -->
                <path d="M 35 65 Q 45 45 60 35" stroke="#edf1f1ff" stroke-width="4" fill="none" stroke-linecap="round"/>
                <path d="M 85 65 Q 75 45 60 35" stroke="#edf1f1ff" stroke-width="4" fill="none" stroke-linecap="round"/>
              </svg>
            </div>
            <span class="logo-text">Family Task</span>
          </a>
        </div>

        <!-- Mobile Toggle Button -->
        <button class="navbar-toggle" type="button" (click)="toggleMobileMenu()" [class.active]="mobileMenuOpen" aria-label="Toggle navigation">
          <span></span>
          <span></span>
          <span></span>
        </button>

        <!-- Navigation Links - Right Side -->
        <div class="navbar-menu" [class.active]="mobileMenuOpen">
          <ul class="nav-list">
            <li class="nav-item">
              <a class="nav-link" 
                 routerLink="/" 
                 routerLinkActive="active" 
                 [routerLinkActiveOptions]="{exact: true}"
                 (click)="closeMobileMenu()">              
                <span>Members</span>
              </a>
            </li>
            <li class="nav-item">
              <a class="nav-link" 
                 routerLink="/tasks" 
                 routerLinkActive="active"
                 (click)="closeMobileMenu()">                
                <span>Manage Tasks</span>
              </a>
            </li>
          </ul>
        </div>
      </div>
    </nav>

    <main class="main-content">
      <router-outlet></router-outlet>
    </main>

    <footer class="footer">
      <div class="footer-container">
        <p class="footer-text">© 2025 Family Task Manager. All rights reserved.</p>
      </div>
    </footer>
  `,
  styles: [`
    * {
      margin: 0;
      padding: 0;
      box-sizing: border-box;
    }

    :host {
      display: flex;
      flex-direction: column;
      min-height: 100vh;
      background: linear-gradient(135deg, #f0f9ff 0%, #cffafe 100%);
    }

    /* ============ NAVBAR STYLES ============ */
    .navbar {
      background: #06b6d4;
      box-shadow: 0 4px 20px rgba(6, 182, 212, 0.15);
      position: sticky;
      top: 0;
      z-index: 1000;
      backdrop-filter: blur(10px);
    }

    .navbar-container {
      max-width: 1400px;
      margin: 0 auto;
      padding: 0 32px;
      display: flex;
      justify-content: space-between;
      align-items: center;
      height: 75px;
      width: 100%;
    }

    /* ============ BRAND/LOGO - LEFT SIDE ============ */
    .navbar-brand {
      display: flex;
      align-items: center;
      flex-shrink: 0;
    }

    .logo-link {
      display: flex;
      align-items: center;
      gap: 16px;
      text-decoration: none;
      cursor: pointer;
      transition: transform 0.3s ease;
    }

    .logo-link:hover {
      transform: translateY(-2px);
    }

    .logo-box {
      width: 56px;
      height: 56px;
      background: #06b6d4;
      border-radius: 12px;
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 4px;
      transition: all 0.3s ease;
      box-shadow: 0 4px 12px rgba(6, 182, 212, 0.2);
      flex-shrink: 0;
    }

    .logo-link:hover .logo-box {
      box-shadow: 0 8px 24px rgba(6, 182, 212, 0.3);
      transform: translateY(-4px);
    }

    .logo-text {
      font-size: 22px;
      font-weight: 800;
      color: white;
      letter-spacing: 0.8px;
      white-space: nowrap;
      font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
    }

    /* ============ NAVIGATION MENU - RIGHT SIDE ============ */
    .navbar-menu {
      display: flex;
      align-items: center;
    }

    .nav-list {
      display: flex;
      gap: 12px;
      list-style: none;
      margin: 0;
      padding: 0;
    }

    .nav-item {
      position: relative;
    }

    .nav-link {
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 8px;
      padding: 12px 24px;
      color: rgba(255, 255, 255, 0.85);
      text-decoration: none;
      font-size: 15px;
      font-weight: 600;
      border-radius: 8px;
      transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
      white-space: nowrap;
      position: relative;
      overflow: hidden;
      font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
    }

    .nav-link::before {
      content: '';
      position: absolute;
      inset: 0;
      background: rgba(255, 255, 255, 0.1);
      transform: scaleX(0);
      transform-origin: left;
      transition: transform 0.3s ease;
      border-radius: 8px;
      z-index: -1;
    }

    .nav-link i {
      font-size: 16px;
    }

    .nav-link:hover {
      color: white;
      transform: translateY(-2px);
    }

    .nav-link:hover::before {
      transform: scaleX(1);
    }

    .nav-link.active {
      color: white;
      background: rgba(255, 255, 255, 0.25);
      font-weight: 600;
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
    }

    /* ============ MOBILE TOGGLE BUTTON ============ */
    .navbar-toggle {
      display: none;
      flex-direction: column;
      background: none;
      border: none;
      cursor: pointer;
      gap: 5px;
      padding: 8px;
      z-index: 1001;
    }

    .navbar-toggle span {
      width: 24px;
      height: 2.5px;
      background: white;
      border-radius: 2px;
      transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
      display: block;
    }

    .navbar-toggle.active span:nth-child(1) {
      transform: rotate(45deg) translate(10px, 10px);
    }

    .navbar-toggle.active span:nth-child(2) {
      opacity: 0;
    }

    .navbar-toggle.active span:nth-child(3) {
      transform: rotate(-45deg) translate(7px, -7px);
    }

    /* ============ MAIN CONTENT ============ */
    .main-content {
      flex: 1;
      max-width: 1400px;
      width: 100%;
      margin: 0 auto;
      padding: 48px 32px;
      animation: fadeIn 0.4s ease-in;
    }

    @keyframes fadeIn {
      from {
        opacity: 0;
        transform: translateY(10px);
      }
      to {
        opacity: 1;
        transform: translateY(0);
      }
    }

    /* ============ FOOTER ============ */
    .footer {
      background: rgba(255, 255, 255, 0.8);
      backdrop-filter: blur(10px);
      border-top: 1px solid rgba(6, 182, 212, 0.1);
      margin-top: auto;
      padding: 40px 32px;
    }

    .footer-container {
      max-width: 1400px;
      margin: 0 auto;
    }

    .footer-text {
      text-align: center;
      color: #4b5563;
      font-size: 14px;
      font-weight: 600;
      font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
      letter-spacing: 0.3px;
    }

    /* ============ RESPONSIVE DESIGN ============ */
    @media (max-width: 768px) {
      .navbar-toggle {
        display: flex;
      }

      .navbar-container {
        padding: 0 16px;
      }

      .navbar-menu {
        position: fixed;
        top: 70px;
        left: 0;
        right: 0;
        background: #06b6d4;
        flex-direction: column;
        max-height: 0;
        overflow: hidden;
        transition: max-height 0.3s cubic-bezier(0.4, 0, 0.2, 1);
        box-shadow: 0 8px 16px rgba(0, 0, 0, 0.1);
      }

      .navbar-menu.active {
        max-height: 200px;
      }

      .nav-list {
        flex-direction: column;
        gap: 0;
        padding: 16px 0;
      }

      .nav-item {
        width: 100%;
      }

      .nav-link {
        width: 100%;
        padding: 14px 20px;
        border-radius: 0;
        justify-content: flex-start;
        gap: 12px;
        border-left: 4px solid transparent;
        transition: all 0.2s ease;
      }

      .nav-link:hover {
        background: rgba(255, 255, 255, 0.1);
        border-left-color: white;
        transform: translateX(4px);
      }

      .nav-link.active {
        background: rgba(255, 255, 255, 0.15);
        border-left-color: white;
        box-shadow: none;
      }

      .main-content {
        padding: 30px 16px;
      }

      .logo-text {
        font-size: 18px;
      }

      .logo-box {
        width: 48px;
        height: 48px;
      }
    }

    @media (max-width: 480px) {
      .navbar-container {
        height: 70px;
        padding: 0 16px;
      }

      .logo-box {
        width: 44px;
        height: 44px;
      }

      .logo-text {
        font-size: 18px;
        letter-spacing: 0px;
      }

      .logo-link {
        gap: 10px;
      }

      .navbar-menu.active {
        max-height: 180px;
      }

      .nav-link {
        padding: 14px 20px;
        font-size: 14px;
      }

      .nav-link i {
        font-size: 14px;
      }

      .main-content {
        padding: 28px 16px;
      }

      .footer {
        padding: 28px 16px;
      }

      .footer-text {
        font-size: 12px;
      }
    }

    @media (max-width: 360px) {
      .logo-text {
        display: none;
      }

      .navbar-container {
        padding: 0 8px;
      }

      .logo-link {
        gap: 0;
      }

      .nav-link span {
        display: none;
      }

      .nav-link {
        padding: 10px 14px;
      }

      .logo-box {
        width: 38px;
        height: 38px;
      }
    }
  `]
})
export class AppComponent {
  title = 'Family Task Manager';
  mobileMenuOpen = false;

  toggleMobileMenu() {
    this.mobileMenuOpen = !this.mobileMenuOpen;
  }

  closeMobileMenu() {
    this.mobileMenuOpen = false;
  }
}