class Footer extends HTMLElement {
  constructor() {
    super();
  }

  connectedCallback() {
    this.innerHTML = `
      <style>
        footer {
            width: 100%;
            background-color: #f2f0eb;
            width: 100%;
            height: 48px;
            display: flex !important;
            justify-content: center;
            align-items: center;
            z-index: 2;
            /* position: fixed;
            bottom: 0; */
        }
        
        footer > p {
            margin: 0 20px;
        }
        
        footer a {
            cursor: pointer;
        }
        
        .DSHide {
            display: none;
        }
        
        .footerFix{
            position: fixed;
            bottom: 0;
        }
      </style>
      <footer>
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

customElements.define("footer-component", Footer);
