/* eslint-env jest */
import React from 'react';
import ReactShallowRenderer from 'react-test-renderer/shallow'
import { shallow } from 'enzyme'

import GroupWidget from '../../src/js/Components/GroupWidget';


const mockData = {
   groups: [
      {
         betOffers: [{
            criterion: {id: 1004240933, label: "Group Finishing Position", englishLabel: "Group Finishing Position"},
            description: 'Winner',
            eventId: 1004356030,
            outcomes: [
               {label: "Egypt", englishLabel: "Egypt", odds: 7000, participant: "Egypt", participantId: 1000000256},
               {label: "Russia", englishLabel: "Russia", odds: 2100, participant: "Russia", participantId: 1000019310},
               {label: "Saudi Arabia", englishLabel: "Saudi Arabia", odds: 51000, participant: "Saudi Arabia", participantId: 1000000247},
               {label: "Uruguay", englishLabel: "Uruguay", odds: 2100, participant: "Uruguay", participantId: 1000000155},
            ]
         }, {
            criterion: {id: 1004240933, label: "Group Finishing Position", englishLabel: "Group Finishing Position"},
            description: 'Top 2',
            eventId: 1004356030,
            outcomes: [
               {label: "Egypt", englishLabel: "Egypt", odds: 2600, participant: "Egypt", participantId: 1000000256},
               {label: "Russia", englishLabel: "Russia", odds: 1250, participant: "Russia", participantId: 1000019310},
               {label: "Saudi Arabia", englishLabel: "Saudi Arabia", odds: 12000, participant: "Saudi Arabia", participantId: 1000000247},
               {label: "Uruguay", englishLabel: "Uruguay", odds: 1180, participant: "Uruguay", participantId: 1000000155},
            ]
         }],
         event: {
            homeName: 'Group A (World Cup 2018)',
            id: 1004356030,
            group: 'World Cup 2018'
         },
         groupName: 'A'
      },
      {
         betOffers: [{
            criterion: {id: 1004240933, label: "Group Finishing Position", englishLabel: "Group Finishing Position"},
            description: 'Winner',
            eventId: 1004356030,
            outcomes: [
               {label: "Iran", englishLabel: "Iran", odds: 3100, participant: "Iran", participantId: 1000000248},
               {label: "Morocco", englishLabel: "Morocco", odds: 15000, participant: "Morocco", participantId: 1000090431},
               {label: "Portugal", englishLabel: "Portugal", odds: 3500, participant: "Portugal", participantId: 1000000147},
               {label: "Spain", englishLabel: "Spain", odds: 1500, participant: "Spain", participantId: 1000000186},
            ]
         }, {
            criterion: {id: 1004240933, label: "Group Finishing Position", englishLabel: "Group Finishing Position"},
            description: 'Top 2',
            eventId: 1004356030,
            outcomes: [
               {label: "Iran", englishLabel: "Iran", odds: 9000, participant: "Iran", participantId: 1000000248},
               {label: "Morocco", englishLabel: "Morocco", odds: 4000, participant: "Morocco", participantId: 1000090431},
               {label: "Portugal", englishLabel: "Portugal", odds: 1270, participant: "Portugal", participantId: 1000000147},
               {label: "Spain", englishLabel: "Spain", odds: 1040, participant: "Spain", participantId: 1000000186},
            ]
         }],
         event: {
            homeName: 'Group B (World Cup 2018)',
            id: 1004356031,
            group: 'World Cup 2018'
         },
         groupName: 'B'
      },
   ],
   nextMatches: [{
      event: {
         start: 1528988400000,
         homeName: 'Russia'
      },
      event: {
         start: 1529064000000,
         homeName: 'Egypt'
      }
   }],
   backgroundUrl: 'assets/overview-bw-bg-mobile.jpg',
   iconUrl: 'assets/icons/world_cup_2018_inverted.svg',
   flagUrl: 'assets/icons/',
   eventsRefreshInterval: 120000,
   pollingCount: 4,
}

let renderer;

describe('GroupWidget DOM Rendering', () => {

   const { groups, nextMatches, backgroundUrl, iconUrl, flagUrl, eventsRefreshInterval, pollingCount } = mockData

   beforeEach(() => {
      renderer = new ReactShallowRenderer();
   });

   it('renders correctly', () => {
      expect(renderer.render(
         <GroupWidget
            groups={groups}
            nextMatches={nextMatches}
            flagUrl={flagUrl}
            iconUrl={iconUrl}
            eventsRefreshInterval={eventsRefreshInterval}
            pollingCount={pollingCount}
         />
      )).toMatchSnapshot();
   });

   it('renders correctly with custom backgroundUrl', () => {
      expect(renderer.render(
         <GroupWidget
            groups={groups}
            nextMatches={nextMatches}
            flagUrl={flagUrl}
            iconUrl={iconUrl}
            eventsRefreshInterval={eventsRefreshInterval}
            pollingCount={pollingCount}
            backgroundUrl={backgroundUrl}
         />
      )).toMatchSnapshot();
   });
});

