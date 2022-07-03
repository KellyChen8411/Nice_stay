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
            <div><a>訊息</a></div>
            <div><a href="/trip.html">旅程</a></div>
            <div><a href="/favorite.html">心願單</a></div>
            <div id="logoutBtn" onclick="Logout()"><a>登出</a></div>
        </div>
    </nav>
        `;
  }
}

customElements.define("nav-renter-component", Nav);
