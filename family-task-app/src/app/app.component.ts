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
              <svg width="40" height="40" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
                <!-- Left Person (Blue) -->
                <circle cx="22" cy="25" r="9" fill="#5B9BD5"/>
                <path d="M 8 42 Q 8 37 13 37 Q 22 37 22 46 Q 22 37 31 37 Q 36 37 36 42 L 36 58 Q 36 62 32 62 L 12 62 Q 8 62 8 58 Z" fill="#5B9BD5"/>

                <!-- Middle Person (Orange) -->
                <circle cx="50" cy="25" r="9" fill="#F5A623"/>
                <path d="M 36 42 Q 36 37 41 37 Q 50 37 50 46 Q 50 37 59 37 Q 64 37 64 42 L 64 58 Q 64 62 60 62 L 40 62 Q 36 62 36 58 Z" fill="#F5A623"/>

                <!-- Right Person (Pink/Magenta) -->
                <circle cx="78" cy="25" r="9" fill="#E74C8C"/>
                <path d="M 64 42 Q 64 37 69 37 Q 78 37 78 46 Q 78 37 87 37 Q 92 37 92 42 L 92 58 Q 92 62 88 62 L 68 62 Q 64 62 64 58 Z" fill="#E74C8C"/>
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
      background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%);
    }

    /* ============ NAVBAR STYLES ============ */
    .navbar {
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      box-shadow: 0 4px 20px rgba(102, 126, 234, 0.15);
      position: sticky;
      top: 0;
      z-index: 1000;
      backdrop-filter: blur(10px);
    }

    .navbar-container {
      max-width: 1400px;
      margin: 0 auto;
      padding: 0 20px;
      display: flex;
      justify-content: space-between;
      align-items: center;
      height: 70px;
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
      gap: 12px;
      text-decoration: none;
      cursor: pointer;
      transition: transform 0.3s ease;
    }

    .logo-link:hover {
      transform: translateY(-2px);
    }

    .logo-box {
      width: 46px;
      height: 46px;
      background: white;
      border-radius: 10px;
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 4px;
      transition: all 0.3s ease;
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
      flex-shrink: 0;
    }

    .logo-link:hover .logo-box {
      box-shadow: 0 4px 16px rgba(0, 0, 0, 0.15);
      transform: translateY(-2px);
    }

    .logo-text {
      font-size: 20px;
      font-weight: 700;
      color: white;
      letter-spacing: 0.5px;
      white-space: nowrap;
    }

    /* ============ NAVIGATION MENU - RIGHT SIDE ============ */
    .navbar-menu {
      display: flex;
      align-items: center;
    }

    .nav-list {
      display: flex;
      gap: 8px;
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
      padding: 10px 18px;
      color: rgba(255, 255, 255, 0.8);
      text-decoration: none;
      font-size: 14px;
      font-weight: 500;
      border-radius: 8px;
      transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
      white-space: nowrap;
      position: relative;
      overflow: hidden;
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
      padding: 40px 20px;
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
      border-top: 1px solid rgba(102, 126, 234, 0.1);
      margin-top: auto;
      padding: 30px 20px;
    }

    .footer-container {
      max-width: 1400px;
      margin: 0 auto;
    }

    .footer-text {
      text-align: center;
      color: #666;
      font-size: 13px;
      font-weight: 500;
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
        background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
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
        width: 42px;
        height: 42px;
      }
    }

    @media (max-width: 480px) {
      .navbar-container {
        height: 60px;
        padding: 0 12px;
      }

      .logo-box {
        width: 40px;
        height: 40px;
      }

      .logo-text {
        font-size: 16px;
        letter-spacing: 0px;
      }

      .logo-link {
        gap: 10px;
      }

      .navbar-menu.active {
        max-height: 180px;
      }

      .nav-link {
        padding: 12px 16px;
        font-size: 13px;
      }

      .nav-link i {
        font-size: 14px;
      }

      .main-content {
        padding: 20px 12px;
      }

      .footer {
        padding: 20px 12px;
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