import React from 'react';
import styles from 'styles/footer-dashboard.module.css';

const Footer = () =>
  <footer className={styles.footer}>
    <div className={styles.center}>
      Need help? Email john@septur.com with your questions/comments.
    </div>
    <div className={styles.center}>
      <a href="/public/Hungrybot-TermsofUse-2.pdf" className={styles['legal-link']}>
        Terms of Use
      </a>
      <a href="/public/Hungrybot-PrivacyPolicy-2.pdf" className={styles['legal-link']}>
        Privacy Policy
      </a>
    </div>
  </footer>;

export default Footer;
