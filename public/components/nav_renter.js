class Nav extends HTMLElement {
  constructor() {
    super();
  }

  connectedCallback() {
    this.innerHTML = `
    <nav>
        <div class="logoContainer"><a href="/"><img src="../images/Logo.png" /></a></div>
        <div id="landlordContainer" class="landlordContainer">成為房東</div>
        <div id="hamburgerContainer" class="hamburgerContainer">
            <img src="../images/hamburger_icon.png" />
        </div>
        <div id="personalArea" class="personalArea PAHide">
            <a href="/message.html"><div>訊息</div></a>
            <a href="/trip.html"><div>旅程</div></a>
            <a href="/favorite.html"><div>心願單</div></a>
            <div id="logoutBtn" onclick="Logout()"><a>登出</a></div>
        </div>
    </nav>
        `;
  }
}

customElements.define("nav-renter-component", Nav);
