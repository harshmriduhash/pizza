import React from 'react';
import { expect } from 'chai';
import { shallow } from 'enzyme';

import Header from './Header';

describe('<Header />', () => {
  let wrapper;
  beforeEach(() => {
    wrapper = shallow(<Header />);
  });

  it('contains a title component with learning react', () => {
    expect(wrapper.find('h1').first().text())
      .to.equal('Learning React');
  });
});
