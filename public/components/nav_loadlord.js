class Nav extends HTMLElement {
  constructor() {
    super();
  }

  connectedCallback() {
    this.innerHTML = `

      <nav>
          <div class="logoContainer">
              <a href="/"><img src="../images/Logo.png" /></a>
          </div>
          <div id="hamburgerContainer" class="hamburgerContainer">
              <img src="../images/hamburger_icon.png" />
          </div>
          <div id="personalArea" class="personalArea PAHide">
              <div><a href="/admin/manageBooking.html">管理預定</a></div>
              <div><a href="/admin/manageHouse.html">管理房源</a></div>
              <div><a href="/admin/createHouse.html">建立房源</a></div>
              <div><a href="/admin/message.html">訊息</a></div>
              <div id="loginBtn"><a href="/login.html">登入</a></div>
              <div id="logoutBtn" class="DSHide"><a>登出</a></div>
          </div>
      </nav>
      `;
  }
}

customElements.define("nav-component", Nav);
