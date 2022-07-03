class Footer extends HTMLElement {
  constructor() {
    super();
  }

  connectedCallback() {
    this.innerHTML = `
        <footer class="footerUnfixed">
          <div>
              <p><small>&copy 2022 Nice Stay,Inc</small></p>
          </div>
          <p>.</p>
          <div>
              <p>隱私</p>
          </div>
          <p>.</p>
          <div>
              <p>相關條款</p>
          </div>
       </footer>
        `;
  }
}

customElements.define("footer-unfixed-component", Footer);
