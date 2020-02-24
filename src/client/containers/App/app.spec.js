import React from 'react';
import { expect } from 'chai';
import { shallow } from 'enzyme';

import App from './App';
import styles from './app.module.css';

describe('<App />', () => {
  let wrapper;
  beforeEach(() => {
    wrapper = shallow(<App />);
  });

  it('has a single wrapper element', () => {
    expect(wrapper.find(`.${styles.wrapper}`)).to.have.length(1);
  });

  it('has a Router component', () => {
    expect(wrapper.find('Router')).to.have.length(1);
  });
});
