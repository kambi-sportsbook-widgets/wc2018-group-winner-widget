import React from 'react'
import ReactDOM from 'react-dom'
import { eventsModule } from 'kambi-widget-core-library'
import KambiService from '../Services/kambi'
import GroupWidget from '../Components/GroupWidget'

/**
 * Group Winner widget
 */
class Widget {
  /**
   * Constructor
   * @param {string?} title Widget title (will be figured out if omitted)
   * @param {string?} tagline Widget tag line (will be figured out if omitted)
   * @param {function} removeWidget Remove widget callback
   * @param {HTMLElement} rootEl Widget's DOM mount point
   */
  constructor({
    filter = '/football/world_cup_2018',
    criterionId = 1004240933, // group finishing position
    title,
    tagline,
    eventsRefreshInterval = 120000,
    pollingCount = 4,
    onFatal,
    backgroundUrl = 'assets/overview-bw-bg-desktop.jpg',
    iconUrl = 'assets/icons/world-cup-2018',
    rootEl = document.getElementById('root'),
  }) {
    this.rootEl = rootEl
    this.forcedTitle = title
    this.forcedTagline = tagline
    this.filter = filter
    this.criterionId = criterionId
    this.eventsRefreshInterval = eventsRefreshInterval
    this.pollingCount = pollingCount
    this.onFatal = onFatal
    this.iconUrl = iconUrl
    this.backgroundUrl = backgroundUrl

    this.groups = []
    this.nextMatchHomeName = null
  }

  /**
   * Initializes widget with data fetched from Kambi API.
   * @param {string} filter Tournament filter
   * @param {number} criterionId Tournament criterion identifier
   * @returns {Promise}
   */
  init() {
    return Promise.all([
      KambiService.getGroups(this.filter, this.criterionId),
      KambiService.getNextMatches(this.filter),
    ]).then(([groups, nextMatches]) => {

      this.groups = groups
      this.nextMatches = nextMatches
      this.participantsByGroup = groups.reduce((groupsObj, group) => {
        groupsObj[group.groupName] = group.betOffers[group.betOffers.length -1].outcomes.map(outcome => {
          return [outcome.label, outcome.odds]
        })
        return groupsObj
      }, {})

      // setup live group polling
      this.groups
        .filter(group => group.betOffers[0].live)
        .forEach(this.subscribeToLiveGroup.bind(this))

      this.render()
    })
  }

/**
 * 
 * @param {string} nextTeam - most recent homeName from this.nextMatches 
 * @param {string} comparable - homeName that has same starting time as nextTeam to check against
 */
  compareAgainstMostRecent(nextTeam, comparable) {
    let nextTeamStats
    let comparableStats
    Object.keys(this.participantsByGroup).forEach((key, idx) => {
      const groupMembers = this.participantsByGroup[key]
      groupMembers.forEach(member => {
        if (member[0] === nextTeam) {
          nextTeamStats = { group: key, odds: member[0]}
        } else if (member[0] === comparable) {
          comparableStats = { group: key, odds: member[0]}
        }
      })
    })

    if (nextTeamStats.group === comparableStats.group) {
      return false
    }

    return nextTeamStats.odds > comparableStats.odds
  }

  /**
   * Holds team's home name of closest tournament's match.
   * @returns {number|null}
   */
  get nextMatchGroupIdx() {
    let selected = 0
    if (!this.nextMatches) {
      return selected
    }

    const mostRecent = this.nextMatches[0].event
    // const mostRecentGroup = this.getParticipantGroup(mostRecent.homeName)
    // check if multiple games start at same time
    this.nextMatches.forEach((match, idx) => {
      if (idx > 0 && match.event.start === mostRecent.start) {
        // check if in the same group and if not - which has the lowest qualifying odds
        const matchHasLowerOdds = this.compareAgainstMostRecent(mostRecent.homeName, match.event.homeName)
        if (matchHasLowerOdds) {
          selected = idx
        }
        return
      }
      return
    })

    return selected
  }

  /**
   * Widget's title
   * @returns {string|null}
   */
  get title() {
    if (this.forcedTitle) {
      return this.forcedTitle
    }

    return this.groups[0].event.group
  }

  /**
   * Widget's tagline
   * @returns {string|null}
   */
  get tagline() {
    if (this.forcedTagline) {
      return this.forcedTagline
    }

    return this.groups[0].betOffers[0].criterion.label
  }

  /**
   * Removes given group from widget.
   * @param {object} group Tournament group (event entity)
   */
  removeGroup(group) {
    const idx = this.groups.indexOf(group)

    if (idx > -1) {
      this.groups.splice(idx, 1)
    }

    // if (!this.groups.length) {
    //   this.removeWidget()
    // }
  }

  /**
   * Subscribes given group to live updates.
   * @param {object} group Tournament group (event entity)
   */
  subscribeToLiveGroup(group) {
    eventsModule.subscribe(`LIVE:EVENT:${group.event.id}`, liveEvent => {
      liveEvent.betOffers[0].outcomes.sort((a, b) => a.odds - b.odds)
      group.betOffers = liveEvent.betOffers
      this.render()
    })

    eventsModule.subscribe(
      `LIVE:EVENT:${group.event.id}:REMOVED`,
      this.removeGroup.bind(this, group)
    )
  }

  /**
   * Renders widget.
   */
  render() {
    ReactDOM.render(
      <GroupWidget
        groups={this.groups}
        selected={this.nextMatchGroupIdx}
        title={this.title}
        tagline={this.tagline}
        backgroundUrl={this.backgroundUrl}
      />,
      this.rootEl
    )
  }
}

export default Widget