import React from 'react';
import styles from 'styles/footer.module.css';

const Footer = () =>
  <footer className={styles.footer}>
    <div className={styles.center}>
      Want Hungrybot in your channel? Check out&nbsp;
      <a href="http://hungrybot.co" className={styles.link}>
        hungrybot.co
      </a>
      &nbsp;to learn more.
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
