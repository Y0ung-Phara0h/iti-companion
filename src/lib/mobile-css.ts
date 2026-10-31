/**
 * CSS injected into the ITI site inside the app's WebView.
 *
 * Everything is gated behind `html.iti-app` plus a page marker so the same
 * sheet can style the Angular portal and the IdentityServer login page without
 * leaking selectors between them. All rules live inside a phone-width media
 * query, so the "PC" toolbar toggle (1280px viewport) keeps the real desktop
 * site untouched.
 */
export const MOBILE_CSS = `
@media (max-width: 900px) {
  html.iti-app {
    font-size: 62.5% !important;
    -webkit-text-size-adjust: 100% !important;
    text-size-adjust: 100% !important;
    overflow-x: hidden !important;
  }
  html.iti-app body {
    font-size: 1.4rem !important;
    line-height: 2.1rem !important;
    overflow-x: hidden !important;
  }
  html.iti-app img,
  html.iti-app iframe,
  html.iti-app video {
    max-width: 100% !important;
  }
  html.iti-app table {
    display: block !important;
    max-width: 100% !important;
    overflow-x: auto !important;
  }

  /* ---------------------------------------------------------- app shell --- */
  html.iti-app[data-iti-page="internal"] .admin-layout__side-menu,
  html.iti-app[data-iti-page="internal"] .admin-layout__control,
  html.iti-app[data-iti-page="internal"] .admin-layout__control-arrow,
  html.iti-app[data-iti-page="internal"] .admin-layout__brand-container {
    display: none !important;
  }
  html.iti-app[data-iti-page="internal"] .admin-layout__container {
    width: 100% !important;
    margin-left: 0 !important;
  }
  html.iti-app[data-iti-page="internal"] .admin-layout__header {
    left: 0 !important;
    width: 100% !important;
    height: 5.6rem !important;
    margin-left: 0 !important;
    padding: 0 1.4rem !important;
    box-shadow: 0 1px 0 rgba(24, 28, 45, 0.07) !important;
    z-index: 1200 !important;
  }
  html.iti-app[data-iti-page="internal"] .admin-layout__body {
    margin-top: 5.6rem !important;
    padding: 1.2rem 1.2rem 2.8rem !important;
    background: #f4f5f7 !important;
  }
  html.iti-app[data-iti-page="internal"] .header {
    display: flex !important;
    align-items: center !important;
    gap: 0.8rem !important;
    height: 5.6rem !important;
    width: 100% !important;
  }
  html.iti-app[data-iti-page="internal"] .iti-app-brand {
    display: flex !important;
    flex: 0 0 auto !important;
    align-items: center !important;
    gap: 0.7rem !important;
    min-width: 0 !important;
    margin-right: auto !important;
    text-decoration: none !important;
    cursor: pointer !important;
  }
  html.iti-app[data-iti-page="internal"] .iti-app-brand img {
    display: block !important;
    height: 3rem !important;
    width: auto !important;
    flex: 0 0 auto !important;
  }
  html.iti-app[data-iti-page="internal"] .iti-app-brand span {
    display: block !important;
    max-width: 13.5rem !important;
    color: #2b2b3d !important;
    font-family: Roboto, sans-serif !important;
    font-size: 1rem !important;
    line-height: 1.35rem !important;
    font-weight: 700 !important;
    letter-spacing: 0.03em !important;
    text-transform: uppercase !important;
  }
  html.iti-app[data-iti-page="internal"] .action-menu {
    margin-left: auto !important;
    gap: 0.6rem !important;
  }
  html.iti-app[data-iti-page="internal"] .action-menu__item {
    display: none !important;
  }
  html.iti-app[data-iti-page="internal"] .admin-layout__copyright {
    padding: 0.8rem 1.4rem 1.6rem !important;
    font-size: 1.15rem !important;
    color: #8a8f9c !important;
  }

  /* ------------------------------------------------------------- headings -- */
  html.iti-app[data-iti-page="internal"] .page-header {
    display: flex !important;
    flex-direction: column !important;
    align-items: flex-start !important;
    gap: 0.4rem !important;
    height: auto !important;
  }
  html.iti-app[data-iti-page="internal"] .page-header__title-section,
  html.iti-app[data-iti-page="internal"] .page-header__title-data {
    width: 100% !important;
  }
  html.iti-app[data-iti-page="internal"] .page-header__title {
    font-size: 2.2rem !important;
    line-height: 1.3 !important;
    font-weight: 700 !important;
    color: #1c2030 !important;
    margin: 0 0 0.2rem !important;
  }
  html.iti-app[data-iti-page="internal"] .page-header__title-data span {
    display: block !important;
    font-size: 1.2rem !important;
    line-height: 1.7rem !important;
    color: #7a7f8c !important;
  }

  /* Keep the five-step progress strip on one swipeable line. */
  html.iti-app[data-iti-page="internal"] .tabs {
    max-width: 100% !important;
    overflow: hidden !important;
  }
  html.iti-app[data-iti-page="internal"] .tabs__header {
    max-width: 100% !important;
  }
  html.iti-app[data-iti-page="internal"] .tabs__container {
    display: flex !important;
    flex-direction: row !important;
    align-items: center !important;
    flex-wrap: nowrap !important;
    gap: 0.6rem !important;
    width: 100% !important;
    overflow-x: auto !important;
    padding-bottom: 0.4rem !important;
    -webkit-overflow-scrolling: touch !important;
    scrollbar-width: none !important;
  }
  html.iti-app[data-iti-page="internal"] .tabs__container::-webkit-scrollbar {
    display: none !important;
  }
  html.iti-app[data-iti-page="internal"] .tabs__tab {
    flex: 0 0 auto !important;
    white-space: nowrap !important;
  }
  /* The five-step application strip does not fit on one phone-width line;
     let it wrap so every step stays readable. */
  html.iti-app[data-iti-page="internal"] .stepper {
    display: flex !important;
    flex-direction: row !important;
    flex-wrap: wrap !important;
    align-items: center !important;
    gap: 0.6rem !important;
    row-gap: 0.7rem !important;
    width: 100% !important;
    margin: 0.4rem 0 0 !important;
  }
  html.iti-app[data-iti-page="internal"] .stepper__item {
    flex: 0 0 auto !important;
    gap: 0.5rem !important;
    padding-right: 0.4rem !important;
  }
  html.iti-app[data-iti-page="internal"] .stepper__item-title {
    font-size: 1.2rem !important;
    line-height: 1.6rem !important;
    white-space: nowrap !important;
  }
  html.iti-app[data-iti-page="internal"] .stepper__item-order {
    width: 2rem !important;
    height: 2rem !important;
    font-size: 1.15rem !important;
  }
  html.iti-app[data-iti-page="internal"] .stepper__item-arrow {
    flex: 0 0 auto !important;
    font-size: 1.2rem !important;
  }

  /* --------------------------------------------------- progress overview --- */
  html.iti-app[data-iti-page="internal"] .application-progress {
    display: flex !important;
    flex-direction: column !important;
    gap: 1.4rem !important;
    grid-template-columns: none !important;
    width: 100% !important;
    margin-top: 1rem !important;
  }
  html.iti-app[data-iti-page="internal"] .application-progress__info-section {
    order: 2 !important;
    grid-column: auto !important;
    width: 100% !important;
    min-height: 0 !important;
    padding: 0 !important;
    background: transparent !important;
    border-radius: 0 !important;
  }
  html.iti-app[data-iti-page="internal"] .application-progress__applicant-action-batchs-section {
    order: 1 !important;
    display: flex !important;
    flex-direction: column !important;
    gap: 0.8rem !important;
    width: 100% !important;
  }
  html.iti-app[data-iti-page="internal"] .application-progress__applicant-action-batchs-section > h2 {
    margin: 0 !important;
    padding-left: 0.2rem !important;
    font-size: 1.15rem !important;
    line-height: 1.6rem !important;
    font-weight: 700 !important;
    letter-spacing: 0.12em !important;
    text-transform: uppercase !important;
    color: #858b99 !important;
  }
  html.iti-app[data-iti-page="internal"] .applicant-action-batch-list {
    display: flex !important;
    flex-direction: row !important;
    gap: 0.8rem !important;
    width: 100% !important;
    padding: 0.2rem 0.2rem 0.6rem !important;
    overflow-x: auto !important;
    scroll-snap-type: x mandatory !important;
    -webkit-overflow-scrolling: touch !important;
    scrollbar-width: none !important;
  }
  html.iti-app[data-iti-page="internal"] .applicant-action-batch-list::-webkit-scrollbar {
    display: none !important;
  }
  /* The scroll-snap item is the plain wrapper Angular renders around each
     <cm-applicant-action-batch-item>, not the component host itself. */
  html.iti-app[data-iti-page="internal"] .applicant-action-batch-list__action-batch {
    flex: 0 0 15.4rem !important;
    width: 15.4rem !important;
    scroll-snap-align: start !important;
    display: block !important;
  }
  html.iti-app[data-iti-page="internal"] cm-applicant-action-batch-item {
    display: block !important;
    width: 100% !important;
  }
  html.iti-app[data-iti-page="internal"] .applicant-action-batch-item {
    position: relative !important;
    display: flex !important;
    flex-direction: column !important;
    justify-content: flex-start !important;
    gap: 0.5rem !important;
    width: 100% !important;
    min-height: 7.6rem !important;
    margin: 0 !important;
    padding: 1rem 1.1rem 1rem 1.5rem !important;
    overflow: hidden !important;
    background: #ffffff !important;
    background-color: #ffffff !important;
    color: #242838 !important;
    border: 1px solid #e6e8ee !important;
    border-radius: 1.4rem !important;
    box-shadow: 0 2px 8px rgba(20, 24, 40, 0.04) !important;
    cursor: pointer !important;
    font-size: 1.3rem !important;
    line-height: 1.75rem !important;
    font-weight: 600 !important;
    transition: background-color 0.15s ease, border-color 0.15s ease !important;
  }
  html.iti-app[data-iti-page="internal"] .applicant-action-batch-item::before {
    content: "" !important;
    position: absolute !important;
    top: 0 !important;
    bottom: 0 !important;
    left: 0 !important;
    width: 0.45rem !important;
    background: var(--iti-phase-color, #cfd3dd) !important;
  }
  html.iti-app[data-iti-page="internal"] .applicant-action-batch-item::after {
    content: attr(data-iti-step) !important;
    position: absolute !important;
    top: 0.8rem !important;
    right: 1rem !important;
    display: flex !important;
    align-items: center !important;
    justify-content: center !important;
    width: 2rem !important;
    height: 2rem !important;
    border-radius: 50% !important;
    background: #f0f1f5 !important;
    color: #7c8290 !important;
    font-size: 1.05rem !important;
    font-weight: 700 !important;
  }
  html.iti-app[data-iti-page="internal"] .applicant-action-batch-item > span:first-child {
    display: block !important;
    padding-right: 1.6rem !important;
    font-size: 1.3rem !important;
    line-height: 1.75rem !important;
    font-weight: 600 !important;
    color: inherit !important;
  }
  html.iti-app[data-iti-page="internal"] .applicant-action-batch-item > span + span {
    align-self: flex-start !important;
    display: inline-block !important;
    margin-top: 0.2rem !important;
    padding: 0.2rem 0.7rem !important;
    border-radius: 999px !important;
    background: rgba(0, 0, 0, 0.06) !important;
    font-size: 1rem !important;
    line-height: 1.5rem !important;
    font-weight: 600 !important;
    letter-spacing: 0.04em !important;
    text-transform: uppercase !important;
    color: #6f7482 !important;
  }
  html.iti-app[data-iti-page="internal"] .applicant-action-batch-item.active {
    background: #1f1f2d !important;
    background-color: #1f1f2d !important;
    color: #ffffff !important;
    border-color: #1f1f2d !important;
    box-shadow: 0 8px 20px rgba(31, 31, 45, 0.2) !important;
  }
  html.iti-app[data-iti-page="internal"] .applicant-action-batch-item.active::after {
    background: rgba(255, 255, 255, 0.14) !important;
    color: #ffffff !important;
  }
  html.iti-app[data-iti-page="internal"] .applicant-action-batch-item.active > span + span {
    background: rgba(255, 255, 255, 0.12) !important;
    color: #d9d9e2 !important;
  }

  /* ----------------------------------------------------- batch details ----- */
  html.iti-app[data-iti-page="internal"] .applicant-action-batch-details {
    display: flex !important;
    flex-direction: column !important;
    gap: 1.2rem !important;
    width: 100% !important;
    grid-template-columns: none !important;
  }
  html.iti-app[data-iti-page="internal"] .applicant-action-batch-details__title {
    display: flex !important;
    flex-direction: row !important;
    align-items: flex-start !important;
    justify-content: space-between !important;
    gap: 1rem !important;
    width: 100% !important;
  }
  html.iti-app[data-iti-page="internal"] .applicant-action-batch-details__action-batch-name {
    margin: 0 !important;
    font-size: 2rem !important;
    line-height: 2.5rem !important;
    font-weight: 700 !important;
    color: #1c2030 !important;
  }
  html.iti-app[data-iti-page="internal"] .applicant-action-batch-details__action-batch-right-section {
    display: flex !important;
    flex-direction: column !important;
    align-items: flex-end !important;
    gap: 0.5rem !important;
    flex-shrink: 0 !important;
  }
  html.iti-app[data-iti-page="internal"] cm-badge {
    display: inline-flex !important;
    width: auto !important;
    max-width: 100% !important;
    align-self: flex-start !important;
  }
  html.iti-app[data-iti-page="internal"] cm-badge .surface,
  html.iti-app[data-iti-page="internal"] cm-badge .surface__content {
    display: inline-flex !important;
    width: auto !important;
    max-width: 100% !important;
    border-radius: 999px !important;
  }
  html.iti-app[data-iti-page="internal"] cm-badge .badge__text {
    display: inline-flex !important;
    width: auto !important;
    padding: 0.35rem 1rem !important;
    border-radius: 999px !important;
    font-size: 1.15rem !important;
    line-height: 1.6rem !important;
    font-weight: 600 !important;
    white-space: nowrap !important;
  }
  html.iti-app[data-iti-page="internal"] .applicant-action-batch-details__action-batch-note {
    order: 1 !important;
    width: 100% !important;
    margin: 0 !important;
    padding: 1.2rem 1.4rem !important;
    border: 1px solid #e3e6ee !important;
    border-left: 0.4rem solid #c82333 !important;
    border-radius: 1.3rem !important;
    background: #ffffff !important;
    color: #4d5464 !important;
    font-size: 1.25rem !important;
    line-height: 1.85rem !important;
    font-weight: 400 !important;
    letter-spacing: 0 !important;
    text-transform: none !important;
  }
  html.iti-app[data-iti-page="internal"] .applicant-action-batch-details__action-batch-step,
  html.iti-app[data-iti-page="internal"] .applicant-action-batch-details__dress-code,
  html.iti-app[data-iti-page="internal"] .applicant-action-batch-details__actions {
    display: block !important;
    width: 100% !important;
    max-width: 100% !important;
    grid-column: auto !important;
  }
  /* Batch info + dress code first, exam/interview details after. */
  html.iti-app[data-iti-page="internal"] .applicant-action-batch-details__dress-code {
    order: 2 !important;
  }
  html.iti-app[data-iti-page="internal"] .applicant-action-batch-details__action-batch-step {
    order: 3 !important;
  }
  html.iti-app[data-iti-page="internal"] .applicant-action-batch-details__actions {
    order: 4 !important;
    margin-top: 0.2rem !important;
  }

  /* Dark "current step" tile. */
  html.iti-app[data-iti-page="internal"] .action-batch-step-item,
  html.iti-app[data-iti-page="internal"] .action-step-item {
    display: flex !important;
    flex-direction: column !important;
    gap: 1rem !important;
    width: 100% !important;
    height: auto !important;
    padding: 1.5rem !important;
    border-radius: 1.8rem !important;
    background: linear-gradient(135deg, #26263c 0%, #191924 100%) !important;
    color: #e7e7ef !important;
    box-shadow: 0 8px 22px rgba(25, 25, 36, 0.16) !important;
  }
  html.iti-app[data-iti-page="internal"] .action-batch-step-item__header,
  html.iti-app[data-iti-page="internal"] .action-step-item__header {
    display: flex !important;
    flex-direction: row !important;
    align-items: center !important;
    justify-content: space-between !important;
    gap: 0.8rem !important;
    color: #b9bac9 !important;
    font-size: 1.1rem !important;
    line-height: 1.6rem !important;
    font-weight: 600 !important;
    letter-spacing: 0.08em !important;
    text-transform: uppercase !important;
  }
  html.iti-app[data-iti-page="internal"] .action-batch-step-item__name,
  html.iti-app[data-iti-page="internal"] .action-step-item__name {
    font-size: 1.2rem !important;
    font-weight: 600 !important;
    color: #ffffff !important;
  }
  html.iti-app[data-iti-page="internal"] .action-batch-step-item__data,
  html.iti-app[data-iti-page="internal"] .action-step-item__data {
    display: flex !important;
    flex-direction: column !important;
    gap: 1rem !important;
    width: 100% !important;
    grid-template-columns: none !important;
  }
  html.iti-app[data-iti-page="internal"] .action-batch-step-item__image-section,
  html.iti-app[data-iti-page="internal"] .action-step-item__image-section {
    order: 1 !important;
    width: 100% !important;
    height: 11.5rem !important;
    max-height: 11.5rem !important;
    grid-column: auto !important;
  }
  html.iti-app[data-iti-page="internal"] .action-batch-step-item__image,
  html.iti-app[data-iti-page="internal"] .action-step-item__image {
    width: 100% !important;
    height: 100% !important;
    background-size: contain !important;
    background-position: center !important;
    background-repeat: no-repeat !important;
  }
  html.iti-app[data-iti-page="internal"] .action-batch-step-item__description,
  html.iti-app[data-iti-page="internal"] .action-step-item__description {
    order: 2 !important;
    width: 100% !important;
    margin: 0 !important;
    padding: 0 0.4rem !important;
    color: #c6c7d4 !important;
    font-size: 1.25rem !important;
    line-height: 1.85rem !important;
    font-weight: 400 !important;
    text-align: center !important;
    grid-column: auto !important;
  }

  /* Dress code tile. */
  html.iti-app[data-iti-page="internal"] cm-dress-code-item,
  html.iti-app[data-iti-page="internal"] .dress-code {
    display: flex !important;
    flex-direction: column !important;
    gap: 1rem !important;
    width: 100% !important;
    height: auto !important;
    grid-template-columns: none !important;
  }
  html.iti-app[data-iti-page="internal"] .dress-code__image {
    order: 3 !important;
    width: 100% !important;
    height: 15rem !important;
    max-height: 15rem !important;
    border: 1px solid #e9ebf1 !important;
    border-radius: 1.6rem !important;
    background-color: #ffffff !important;
    background-size: contain !important;
    background-position: center !important;
    background-repeat: no-repeat !important;
  }
  /* No illustration uploaded? Do not leave a tall blank card behind. */
  html.iti-app[data-iti-page="internal"] .dress-code__image[data-iti-empty] {
    display: none !important;
  }
  html.iti-app[data-iti-page="internal"] .dress-code__info {
    order: 1 !important;
    display: flex !important;
    flex-direction: column !important;
    gap: 1rem !important;
    width: 100% !important;
    grid-column: auto !important;
  }
  html.iti-app[data-iti-page="internal"] .dress-code__name {
    margin: 0 !important;
    color: #7a7f8c !important;
    font-size: 1.15rem !important;
    line-height: 1.6rem !important;
    font-weight: 600 !important;
    letter-spacing: 0.08em !important;
    text-transform: uppercase !important;
  }
  html.iti-app[data-iti-page="internal"] .dress-code__description {
    margin: 0 !important;
    padding: 1.1rem 1.3rem !important;
    border-radius: 1.4rem !important;
    background: linear-gradient(135deg, #b02a30 0%, #7e1a1f 100%) !important;
    color: #ffffff !important;
    font-size: 1.25rem !important;
    line-height: 1.8rem !important;
    font-weight: 400 !important;
    height: auto !important;
    text-transform: none !important;
  }
  html.iti-app[data-iti-page="internal"] .dress-code__dress {
    order: 2 !important;
    display: flex !important;
    flex-direction: column !important;
    gap: 0.9rem !important;
    padding: 1.2rem 1.3rem !important;
    border-radius: 1.4rem !important;
    background: linear-gradient(135deg, #0b5f8a 0%, #06456a 100%) !important;
    color: #e7f3fb !important;
  }
  html.iti-app[data-iti-page="internal"] .dress-code__tops,
  html.iti-app[data-iti-page="internal"] .dress-code__bottoms {
    display: flex !important;
    flex-direction: row !important;
    flex-wrap: wrap !important;
    align-items: center !important;
    gap: 0.5rem !important;
  }
  html.iti-app[data-iti-page="internal"] .dress-code__tops > h6:first-child,
  html.iti-app[data-iti-page="internal"] .dress-code__bottoms > h6:first-child {
    flex: 0 0 100% !important;
    margin: 0 0 0.1rem !important;
    color: rgba(231, 243, 251, 0.65) !important;
    font-size: 1rem !important;
    line-height: 1.5rem !important;
    font-weight: 600 !important;
    letter-spacing: 0.08em !important;
    text-transform: uppercase !important;
  }
  html.iti-app[data-iti-page="internal"] .dress-code__top,
  html.iti-app[data-iti-page="internal"] .dress-code__bottom {
    margin: 0 !important;
    padding: 0.25rem 0.8rem !important;
    border-radius: 999px !important;
    background: rgba(255, 255, 255, 0.12) !important;
    color: #ffffff !important;
    font-size: 1.15rem !important;
    line-height: 1.7rem !important;
    font-weight: 400 !important;
    text-transform: none !important;
  }

  /* ----------------------------------------------------- action card ------- */
  html.iti-app[data-iti-page="internal"] .applicant-action-batch-action-list__tab {
    display: inline-flex !important;
    align-items: center !important;
    justify-content: center !important;
    flex: 1 1 0 !important;
    margin: 0 !important;
    padding: 0.9rem 0.8rem !important;
    border-radius: 1.1rem !important;
    background: transparent !important;
    color: #6d7280 !important;
    font-size: 1.25rem !important;
    line-height: 1.7rem !important;
    font-weight: 600 !important;
    text-align: center !important;
    white-space: nowrap !important;
  }
  html.iti-app[data-iti-page="internal"] .applicant-action-batch-action-list__tab.active {
    background: #1f1f2d !important;
    color: #ffffff !important;
    box-shadow: 0 3px 10px rgba(31, 31, 45, 0.18) !important;
  }
  html.iti-app[data-iti-page="internal"] .applicant-action-batch-action-list .tabs__header {
    display: flex !important;
    width: 100% !important;
    padding: 0.4rem !important;
    border-radius: 1.4rem !important;
    background: #ffffff !important;
    box-shadow: 0 2px 8px rgba(20, 24, 40, 0.04) !important;
  }
  html.iti-app[data-iti-page="internal"] .applicant-action-batch-action-list .tabs__content {
    padding: 1rem 0 0 !important;
    background: transparent !important;
  }
  html.iti-app[data-iti-page="internal"] .applicant-action-batch-action-item {
    display: flex !important;
    flex-direction: column !important;
    gap: 1.2rem !important;
    width: 100% !important;
    padding: 1.4rem !important;
    border: 1px solid #e8e9ef !important;
    border-radius: 1.8rem !important;
    background: #ffffff !important;
    box-shadow: 0 3px 10px rgba(20, 24, 40, 0.04) !important;
  }
  html.iti-app[data-iti-page="internal"] .applicant-action-batch-action-item__title {
    display: flex !important;
    flex-direction: row !important;
    align-items: flex-start !important;
    justify-content: space-between !important;
    gap: 0.8rem !important;
  }
  html.iti-app[data-iti-page="internal"] .applicant-action-batch-action-item__name {
    margin: 0 !important;
    font-size: 1.6rem !important;
    line-height: 2.1rem !important;
    font-weight: 700 !important;
    color: #1c2030 !important;
  }
  html.iti-app[data-iti-page="internal"] .applicant-action-batch-action-item__description {
    margin: 0 !important;
    color: #6f7482 !important;
    font-size: 1.25rem !important;
    line-height: 1.8rem !important;
    text-transform: none !important;
  }
  html.iti-app[data-iti-page="internal"] .applicant-action-batch-action-item__info {
    display: flex !important;
    flex-direction: column !important;
    gap: 1.2rem !important;
    width: 100% !important;
    grid-template-columns: none !important;
  }
  html.iti-app[data-iti-page="internal"] .applicant-action-batch-action-item__action-step,
  html.iti-app[data-iti-page="internal"] .applicant-action-batch-action-item__action {
    width: 100% !important;
    grid-column: auto !important;
  }
  html.iti-app[data-iti-page="internal"] .applicant-action-batch-action-item__action {
    display: flex !important;
    flex-direction: column !important;
    gap: 1.2rem !important;
  }
  html.iti-app[data-iti-page="internal"] .applicant-action-batch-action-item__attandance {
    padding: 1.3rem !important;
    border-radius: 1.5rem !important;
    background: #f4f5f9 !important;
    color: #1c2030 !important;
    height: auto !important;
  }
  html.iti-app[data-iti-page="internal"] .applicant-action-batch-action-item__attandance-title {
    color: #555c6d !important;
    font-size: 1.2rem !important;
    font-weight: 600 !important;
  }
  html.iti-app[data-iti-page="internal"] .applicant-action-batch-action-item__session-body {
    margin-top: 0.8rem !important;
    padding: 1.1rem 1.2rem !important;
    border-radius: 1.2rem !important;
    font-size: 1.25rem !important;
    line-height: 1.8rem !important;
  }
  html.iti-app[data-iti-page="internal"] .applicant-action-batch-action-item__session-time,
  html.iti-app[data-iti-page="internal"] .applicant-action-batch-action-item__session-location {
    margin-top: 0.5rem !important;
    font-size: 1.25rem !important;
    line-height: 1.8rem !important;
  }
  html.iti-app[data-iti-page="internal"] .applicant-action-batch-action-item__session-exam-link {
    font-size: 1.3rem !important;
    line-height: 1.8rem !important;
  }

  /* ------------------------------------------------------------ home ------- */
  html.iti-app[data-iti-page="internal"] .home {
    width: 100% !important;
  }
  html.iti-app[data-iti-page="internal"] .home__body {
    display: flex !important;
    flex-direction: column !important;
    gap: 1.6rem !important;
    width: 100% !important;
    grid-template-columns: none !important;
  }
  html.iti-app[data-iti-page="internal"] .home__data {
    display: flex !important;
    flex-direction: column !important;
    gap: 1.6rem !important;
    width: 100% !important;
    height: auto !important;
    max-height: none !important;
    overflow: visible !important;
  }
  html.iti-app[data-iti-page="internal"] .home__intake {
    display: flex !important;
    flex-direction: column !important;
    gap: 1.6rem !important;
    width: 100% !important;
    height: auto !important;
    min-height: 0 !important;
    padding: 0 !important;
    border-radius: 0 !important;
    background: transparent !important;
  }
  html.iti-app[data-iti-page="internal"] .home__program {
    display: flex !important;
    flex-direction: column !important;
    gap: 1.4rem !important;
    width: 100% !important;
    padding: 1.6rem !important;
    border-radius: 1.8rem !important;
    background: #ffffff !important;
    box-shadow: 0 3px 14px rgba(20, 24, 40, 0.05) !important;
  }
  html.iti-app[data-iti-page="internal"] .home__program-header {
    display: flex !important;
    flex-direction: column !important;
    align-items: stretch !important;
    gap: 1rem !important;
    width: 100% !important;
  }
  html.iti-app[data-iti-page="internal"] .home__program-title {
    width: 100% !important;
    margin: 0 !important;
    font-size: 2.4rem !important;
    line-height: 1.25 !important;
    font-weight: 700 !important;
    color: #1c2030 !important;
  }
  html.iti-app[data-iti-page="internal"] .home__program-header cm-button,
  html.iti-app[data-iti-page="internal"] .home__program-header .button {
    display: block !important;
    width: 100% !important;
    min-width: 0 !important;
    height: 4.4rem !important;
    border-radius: 1.1rem !important;
    font-size: 1.35rem !important;
    font-weight: 600 !important;
  }
  html.iti-app[data-iti-page="internal"] .home__program-info {
    display: flex !important;
    flex-direction: column !important;
    gap: 1.2rem !important;
    width: 100% !important;
  }
  html.iti-app[data-iti-page="internal"] .home__program-icon {
    display: none !important;
  }
  html.iti-app[data-iti-page="internal"] .home__intake-info {
    display: flex !important;
    flex-direction: column !important;
    gap: 1rem !important;
    width: 100% !important;
    padding: 1.3rem !important;
    border-radius: 1.5rem !important;
    background: #f7f8fa !important;
  }
  html.iti-app[data-iti-page="internal"] .home__intake-title {
    font-size: 1.6rem !important;
    line-height: 2rem !important;
    font-weight: 700 !important;
    color: #1f2433 !important;
  }
  html.iti-app[data-iti-page="internal"] .home__intake-date {
    display: flex !important;
    flex-direction: column !important;
    align-items: flex-start !important;
    gap: 0.15rem !important;
    width: 100% !important;
    height: auto !important;
  }
  html.iti-app[data-iti-page="internal"] .home__intake-date-title {
    width: auto !important;
    padding: 0 !important;
    border-right: 0 !important;
    color: #9a3a33 !important;
    font-size: 1.05rem !important;
    line-height: 1.6rem !important;
    font-weight: 700 !important;
    letter-spacing: 0.07em !important;
    text-transform: uppercase !important;
    white-space: nowrap !important;
  }
  html.iti-app[data-iti-page="internal"] .home__intake-date-info {
    color: #2c3040 !important;
    font-size: 1.25rem !important;
    line-height: 1.75rem !important;
    white-space: normal !important;
  }
  html.iti-app[data-iti-page="internal"] .home__program-description {
    width: 100% !important;
    margin: 0 !important;
    color: #5a6070 !important;
    font-size: 1.3rem !important;
    line-height: 2rem !important;
  }
  html.iti-app[data-iti-page="internal"] .home__process {
    display: flex !important;
    flex-direction: column !important;
    gap: 1rem !important;
    width: 100% !important;
    padding: 0.4rem 0 0 !important;
    border-radius: 0 !important;
    background: transparent !important;
  }
  html.iti-app[data-iti-page="internal"] .home__process > h1 {
    margin: 0 !important;
    font-size: 1.8rem !important;
    line-height: 2.3rem !important;
    font-weight: 700 !important;
    color: #1c2030 !important;
  }
  html.iti-app[data-iti-page="internal"] .process-list {
    display: flex !important;
    flex-direction: column !important;
    gap: 1rem !important;
    width: 100% !important;
    grid-template-columns: none !important;
  }
  html.iti-app[data-iti-page="internal"] .process-list__process-item,
  html.iti-app[data-iti-page="internal"] .process-list__process-item cm-card,
  html.iti-app[data-iti-page="internal"] .process-list__process-item cm-surface,
  html.iti-app[data-iti-page="internal"] .process-list__process-item .surface,
  html.iti-app[data-iti-page="internal"] .process-list__process-item .surface__content,
  html.iti-app[data-iti-page="internal"] .process-list__process-item .card__container,
  html.iti-app[data-iti-page="internal"] .process-list__process-item .card__content,
  html.iti-app[data-iti-page="internal"] .process-list__process-item .card__body,
  html.iti-app[data-iti-page="internal"] .process-list__process-item .card__body-content,
  html.iti-app[data-iti-page="internal"] .process-list__process-item .process-item__body {
    display: block !important;
    width: 100% !important;
    max-width: 100% !important;
    height: auto !important;
  }
  html.iti-app[data-iti-page="internal"] .process-list__process-item .surface {
    border-radius: 1.6rem !important;
  }
  html.iti-app[data-iti-page="internal"] .process-list__process-item .card__container {
    padding: 1.4rem !important;
  }
  html.iti-app[data-iti-page="internal"] .process-item__body {
    display: flex !important;
    flex-direction: row !important;
    align-items: flex-start !important;
    gap: 1.2rem !important;
  }
  html.iti-app[data-iti-page="internal"] .process-item__title-section {
    display: flex !important;
    flex-direction: column !important;
    align-items: flex-start !important;
    gap: 0.2rem !important;
    min-width: 5.2rem !important;
    white-space: normal !important;
  }
  html.iti-app[data-iti-page="internal"] .process-item__order {
    font-size: 3.2rem !important;
    line-height: 3.4rem !important;
    color: #7b0f07 !important;
  }
  html.iti-app[data-iti-page="internal"] .process-item__title {
    margin: 0 !important;
    font-size: 1.45rem !important;
    line-height: 1.9rem !important;
    font-weight: 700 !important;
    color: #1c2030 !important;
  }
  html.iti-app[data-iti-page="internal"] .process-item__requirements {
    display: flex !important;
    flex-direction: column !important;
    gap: 0.4rem !important;
    padding-top: 0.2rem !important;
  }
  html.iti-app[data-iti-page="internal"] .process-item__requirement {
    font-size: 1.2rem !important;
    line-height: 1.7rem !important;
    color: #6f7482 !important;
  }
  html.iti-app[data-iti-page="internal"] .home__left-side {
    display: flex !important;
    flex-direction: column !important;
    gap: 1.6rem !important;
    width: 100% !important;
  }
  html.iti-app[data-iti-page="internal"] .home__intro {
    display: block !important;
    width: 100% !important;
    height: auto !important;
    aspect-ratio: 16 / 9 !important;
    border-radius: 1.6rem !important;
    overflow: hidden !important;
    background: #000000 !important;
  }
  html.iti-app[data-iti-page="internal"] .home__help {
    width: 100% !important;
    padding: 1.6rem !important;
    border-radius: 1.6rem !important;
    background: #1f1f2d !important;
    color: #e7e7ef !important;
  }
  html.iti-app[data-iti-page="internal"] .home__help h1 {
    margin: 0 0 1rem !important;
    font-size: 1.7rem !important;
    line-height: 2.2rem !important;
    color: #ffffff !important;
  }
  html.iti-app[data-iti-page="internal"] .home__contacts {
    display: flex !important;
    flex-direction: column !important;
    gap: 0.8rem !important;
    color: #d6d7e2 !important;
  }
  html.iti-app[data-iti-page="internal"] .home__contact {
    font-size: 1.25rem !important;
    line-height: 1.8rem !important;
    color: #d6d7e2 !important;
  }

  /* ------------------------------------------------------- login page ------ */
  html.iti-app[data-iti-page="identity"],
  html.iti-app[data-iti-page="identity"] body {
    min-height: 100% !important;
    background: #eef1f6 !important;
  }
  html.iti-app[data-iti-page="identity"] .master {
    min-height: 100vh !important;
    min-height: 100dvh !important;
    height: auto !important;
    padding: 2.4rem 1.4rem !important;
    display: flex !important;
    align-items: center !important;
    justify-content: center !important;
    background: radial-gradient(circle at 50% 0%, #ffffff 0%, #eef1f6 62%, #e4e8f0 100%) !important;
  }
  html.iti-app[data-iti-page="identity"] .master__card {
    display: flex !important;
    flex-direction: column !important;
    width: 100% !important;
    max-width: 42rem !important;
    min-width: 0 !important;
    margin: 0 auto !important;
    padding: 2rem 1.8rem 2.4rem !important;
    border: 1px solid rgba(23, 28, 45, 0.05) !important;
    border-radius: 2rem !important;
    background: #ffffff !important;
    box-shadow: 0 16px 40px rgba(25, 32, 54, 0.12) !important;
  }
  html.iti-app[data-iti-page="identity"] .master__header {
    display: flex !important;
    justify-content: center !important;
    padding-bottom: 0.6rem !important;
  }
  html.iti-app[data-iti-page="identity"] .master__header-logo {
    height: 4.2rem !important;
    width: auto !important;
    max-width: 70% !important;
    object-fit: contain !important;
  }
  html.iti-app[data-iti-page="identity"] .master__content {
    display: flex !important;
    flex-direction: column !important;
    gap: 0 !important;
    width: 100% !important;
  }
  html.iti-app[data-iti-page="identity"] .master__brand {
    display: none !important;
  }
  html.iti-app[data-iti-page="identity"] .master__body {
    width: 100% !important;
  }
  html.iti-app[data-iti-page="identity"] .login {
    display: flex !important;
    flex-direction: column !important;
    width: 100% !important;
    height: auto !important;
  }
  html.iti-app[data-iti-page="identity"] .login__title {
    margin: 0 0 1.6rem !important;
    color: #1c2030 !important;
    font-size: 2.4rem !important;
    line-height: 3rem !important;
    font-weight: 700 !important;
    text-align: center !important;
  }
  html.iti-app[data-iti-page="identity"] .login__form {
    display: flex !important;
    flex-direction: column !important;
    width: 100% !important;
  }
  html.iti-app[data-iti-page="identity"] .form-floating {
    position: relative !important;
    margin-bottom: 1.2rem !important;
  }
  html.iti-app[data-iti-page="identity"] .form-control {
    display: block !important;
    width: 100% !important;
    height: 5.4rem !important;
    padding: 1.9rem 1.4rem 0.6rem !important;
    border: 1px solid #d9dde6 !important;
    border-radius: 1.2rem !important;
    background: #fbfcfe !important;
    color: #1c2030 !important;
    font-size: 16px !important;
    line-height: 2.2rem !important;
  }
  html.iti-app[data-iti-page="identity"] .form-control:focus {
    border-color: #c82333 !important;
    background: #ffffff !important;
    box-shadow: 0 0 0 0.3rem rgba(200, 35, 51, 0.12) !important;
  }
  html.iti-app[data-iti-page="identity"] .form-floating > .form-label {
    position: absolute !important;
    top: 0 !important;
    left: 0 !important;
    z-index: 2 !important;
    padding: 1.1rem 1.4rem !important;
    color: #7a7f8c !important;
    font-size: 1.35rem !important;
    line-height: 1.8rem !important;
    pointer-events: none !important;
  }
  html.iti-app[data-iti-page="identity"] .form-floating > .form-control:focus ~ .form-label,
  html.iti-app[data-iti-page="identity"] .form-floating > .form-control:not(:placeholder-shown) ~ .form-label {
    padding-top: 0.6rem !important;
    padding-bottom: 0.2rem !important;
    color: #98a0b0 !important;
    font-size: 1.05rem !important;
  }
  html.iti-app[data-iti-page="identity"] .login__remember-me {
    display: flex !important;
    flex-direction: row !important;
    align-items: center !important;
    gap: 0.8rem !important;
    margin: 0.2rem 0 1.6rem !important;
  }
  html.iti-app[data-iti-page="identity"] .login__remember-me input[type="checkbox"] {
    width: 1.8rem !important;
    height: 1.8rem !important;
    margin: 0 !important;
    accent-color: #c82333 !important;
  }
  html.iti-app[data-iti-page="identity"] .login__remember-me .form-label {
    margin: 0 !important;
    font-size: 1.3rem !important;
    color: #5f6573 !important;
  }
  html.iti-app[data-iti-page="identity"] .login__submit {
    width: 100% !important;
    height: 5rem !important;
    padding: 0 1.4rem !important;
    border: 0 !important;
    border-radius: 1.2rem !important;
    background: #c82333 !important;
    color: #ffffff !important;
    font-size: 1.6rem !important;
    line-height: 5rem !important;
    font-weight: 600 !important;
    box-shadow: 0 8px 18px rgba(200, 35, 51, 0.22) !important;
  }
  html.iti-app[data-iti-page="identity"] .login__submit:active {
    transform: translateY(1px) !important;
  }
  html.iti-app[data-iti-page="identity"] .login__links {
    display: flex !important;
    flex-direction: column !important;
    align-items: center !important;
    gap: 0.9rem !important;
    margin-top: 1.6rem !important;
    text-align: center !important;
  }
  html.iti-app[data-iti-page="identity"] .login__link {
    margin: 0 !important;
    padding: 0.5rem 0 !important;
    font-size: 1.25rem !important;
    line-height: 1.8rem !important;
    color: #5f6573 !important;
  }
  html.iti-app[data-iti-page="identity"] .login__external-container {
    margin-top: 2.2rem !important;
    padding-top: 1.6rem !important;
    border-top: 1px solid #eceef3 !important;
  }
  html.iti-app[data-iti-page="identity"] .login__external-title {
    margin: 0 0 0.8rem !important;
    color: #7a7f8c !important;
    font-size: 1.3rem !important;
    line-height: 1.9rem !important;
    text-align: center !important;
  }
  html.iti-app[data-iti-page="identity"] .login__externals {
    display: flex !important;
    justify-content: center !important;
    gap: 1rem !important;
  }
  html.iti-app[data-iti-page="identity"] .login__external {
    display: flex !important;
    align-items: center !important;
    justify-content: center !important;
    width: 4.4rem !important;
    height: 4.4rem !important;
    margin: 0 !important;
    border-radius: 50% !important;
    font-size: 1.8rem !important;
  }
  html.iti-app[data-iti-page="identity"] .login h3 {
    margin-top: 1.8rem !important;
    color: #1c2030 !important;
    font-size: 1.6rem !important;
    line-height: 2.2rem !important;
    text-align: center !important;
  }
  html.iti-app[data-iti-page="identity"] .login h4 {
    margin: 0.4rem 0 0 !important;
    font-size: 1.3rem !important;
    text-align: center !important;
  }
  html.iti-app[data-iti-page="identity"] .login__newTicket {
    color: #c82333 !important;
    font-weight: 600 !important;
  }
  html.iti-app[data-iti-page="identity"] .text-danger {
    display: block !important;
    margin-top: 0.3rem !important;
    padding-left: 0.4rem !important;
    color: #c82333 !important;
    font-size: 1.15rem !important;
    line-height: 1.6rem !important;
  }
}
`;
