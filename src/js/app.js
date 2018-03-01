import React from 'react'
import ReactDOM from 'react-dom'
import {
   coreLibrary,
   eventsModule,
   widgetModule,
 } from 'kambi-widget-core-library'
 import kambi from './Services/kambi'
 import GroupWidget from './Components/GroupWidget'
 
 /**
  * Removes widget on fatal errors.
  * @param {Error} error Error instance
  */
 const onFatal = function(error) {
   console.error(error)
   widgetModule.removeWidget()
 }
 
 coreLibrary
    .init({
      widgetTrackingName: 'wc2018-group-winner',
      filter: "/football/world_cup_2018",
      iconUrl: 'assets/icons/world_cup_2018_inverted.svg',
      flagUrl: 'assets/icons/',
      backgroundUrl: 'assets/overview-bw-bg-desktop.jpg',
      criterionId: 1004240933,
      pollingInterval: 30000,
      pollingCount: 4,
      eventsRefreshInterval: 120000,
    })
   .then(() => {
     const { filter, criterionId } = coreLibrary.args

      return Promise.all([
        kambi.getGroups(filter, criterionId),
        kambi.getNextMatches(filter),
      ])
    })
    .then(([groups, nextMatches]) => {
      const { 
        eventsRefreshInterval,
        pollingCount,
        backgroundUrl,
        iconUrl,
        flagUrl,
        criterionId,
        pollingInterval,
        title,
        tagline
      } = coreLibrary.args

      eventsModule.liveEventPollingInterval = pollingInterval

      return ReactDOM.render(
        <GroupWidget
          groups={groups}
          nextMatches={nextMatches}
          title={title}
          tagline={tagline}
          backgroundUrl={backgroundUrl}
          pollingCount={pollingCount}
          eventsRefreshInterval={eventsRefreshInterval}
          iconUrl={iconUrl}
          flagUrl={flagUrl}
        />,
        document.getElementById('root')
      )
    })
    .catch(err => {
      console.error(err)
        widgetModule.removeWidget()
    })