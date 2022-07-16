class Nav extends HTMLElement {
  constructor() {
    super();
  }

  connectedCallback() {
    this.innerHTML = `

      <nav>
          <div class="logoContainer">
            <a href="/"><img src="../images/Nlogo2.jpg" class="Nlogo" /></a>
          </div>
          <div id="hamburgerContainer" class="hamburgerContainer">
              <img src="../images/hamburger_icon.png" />
          </div>
          <div id="personalArea" class="personalArea PAHide">
              <a href="/admin/manageBooking.html"><div>管理預定</div></a>
              <a href="/admin/manageHouse.html"><div>管理房源</div></a>
              <a href="/admin/createHouse.html"><div>建立房源</div></a>
              <a href="/admin/message.html"><div>訊息</div></a>
              <a href="/login.html"><div id="loginBtn">登入</div></a>
              <div id="logoutBtn" class="DSHide"><a>登出</a></div>
          </div>
      </nav>
      `;
  }
}

customElements.define("nav-component", Nav);
