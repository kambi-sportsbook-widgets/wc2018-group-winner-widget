/* eslint-env jest */
import React from 'react';
import ReactShallowRenderer from 'react-test-renderer/shallow'
import { shallow } from 'enzyme'

import GroupListItem from '../../src/js/Components/GroupListItem';


const mockData = {
   participant: 'Uruguay',
   outcomes: [{
      betOfferId: 2104811235,
      changedDate:"2018-02-07T11:55:05Z",
      englishLabel:"Uruguay",
      id:2373848420,
      label:"Uruguay",
      odds:2100,
      oddsAmerican:"110",
      oddsFractional:"11/10",
      participant:"Uruguay",
      participantId:1000000155,
      status:"OPEN",
      type:"OT_UNTYPED"
   }, {
      betOfferId: 2104811236,
      changedDate:"2018-02-07T11:55:05Z",
      englishLabel:"Uruguay",
      id:2373848422,
      label:"Uruguay",
      odds:1180,
      oddsAmerican:"-590",
      oddsFractional:"1/6",
      participant:"Uruguay",
      participantId:1000000155,
      status:"OPEN",
      type:"OT_UNTYPED"
   }],
   flagUrl: "assets/icons/uruguay.svg",
   handleClick: jest.fn()
}

const mockOnlyOneOutcome = {
   participant: 'Uruguay',
   outcomes: [{
      betOfferId: 2104811236,
      changedDate:"2018-02-07T11:55:05Z",
      englishLabel:"Uruguay",
      id:2373848422,
      label:"Uruguay",
      odds:1180,
      oddsAmerican:"-590",
      oddsFractional:"1/6",
      participant:"Uruguay",
      participantId:1000000155,
      status:"OPEN",
      type:"OT_UNTYPED"
   }],
   flagUrl: "assets/icons/uruguay.svg",
   handleClick: jest.fn()
}

let renderer;

describe('GroupListItem DOM Rendering', () => {

   const { participant, outcomes, flagUrl, handleClick } = mockData

   beforeEach(() => {
      renderer = new ReactShallowRenderer();
   });

   it('renders correctly', () => {
      expect(renderer.render(
         <GroupListItem
            participant={participant}
            outcomes={outcomes}
            flagUrl={flagUrl}
            handleClick={handleClick}
         />
      )).toMatchSnapshot();
   });

   it('renders correctly withouth flagUrl', () => {
      expect(renderer.render(
         <GroupListItem
            participant={participant}
            outcomes={outcomes}
            handleClick={handleClick}
         />
      )).toMatchSnapshot();
   });

   it('handles a broken imgLink correctly', () => {
      expect(renderer.render(
         <GroupListItem
            participant={participant}
            outcomes={outcomes}
            flagUrl={'assets/icons/incorrecturl.svg'}
            handleClick={handleClick}
         />
      )).toMatchSnapshot();
   });

   it('handles only receiving one outcome per participant', () => {
      expect(renderer.render(
         <GroupListItem
            participant={participant}
            outcomes={outcomes}
            flagUrl={'assets/icons/incorrecturl.svg'}
            handleClick={handleClick}
         />
      )).toMatchSnapshot();
   });

});
