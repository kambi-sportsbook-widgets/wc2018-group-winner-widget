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
    filter: '/football/world_cup_2018',
    iconUrl:
      'https://d1fqgomuxh4f5p.cloudfront.net/tournamentdata/worldcup2018/icons/world_cup_2018_inverted.svg',
    flagUrl:
      'https://d1fqgomuxh4f5p.cloudfront.net/tournamentdata/worldcup2018/icons/',
    backgroundUrl:
      'https://d1fqgomuxh4f5p.cloudfront.net/tournamentdata/worldcup2018/overview-bw-bg-desktop.jpg',
    pollingInterval: 30000,
    pollingCount: 4,
    eventsRefreshInterval: 120000,
    criterionId: 1004240933,
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
      tagline,
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
