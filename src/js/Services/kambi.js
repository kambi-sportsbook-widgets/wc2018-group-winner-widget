import { getEventsByFilter, getEvent } from 'kambi-offering-api-module'

class KambiService {
  /**
   * Fetches groups for given tournament.
   * @param {string} filter Tournament's filter
   * @param {number} criterionId Tournament's criterion identifier
   * @returns {Promise.<object[]>}
   */
  static getGroups(filter, criterionId) {
    return getEventsByFilter(`${filter}/all/all/competitions`)
      .then(competitions => {
        if (competitions == null) {
          throw new Error(
            `No tournament data available for supplied filter: ${filter}/all/all/competitions`
          )
        }
        const groupEvents = []

        // filter out group events with at least one betOffer and add event request to groupEvents
        const filteredEvents = competitions.events
          .filter(event => {
            const isGroupEvent = event.event.englishName.match(/Group ([A-Z])/)
            const hasBetOffers = event.betOffers && event.betOffers.length > 0
            return isGroupEvent && hasBetOffers
          })
          .forEach(event => {
            groupEvents.push(getEvent(event.event.id))
          })

        return Promise.all(groupEvents)
      })
      .then(groupEvents => {
        // filter betOffers by criterionId and sort groups by name
        const filteredByCriterionId = groupEvents
          .map(groupEvent => {
            groupEvent.betOffers = groupEvent.betOffers.filter(betOffer => {
              return betOffer.criterion.id === criterionId
            })
            groupEvent.groupName = groupEvent.event.englishName.match(
              /Group ([A-Z])/
            )[1]

            if (groupEvent.betOffers.length < 2 || !groupEvent.groupName) {
              throw new Error('Could not find matching betoffers or group name')
              return
            }
            return groupEvent
          })
          .sort((a, b) => {
            return a.event.englishName.localeCompare(b.event.englishName)
          })

        return Promise.resolve(filteredByCriterionId)
      })
      .catch(err => {
        return Promise.reject(err)
      })
  }

  /**
   * Returns home team name of tournament's closest match.
   * @param {string} filter Tournament's filter
   * @returns {Promise.<string|null>}
   */
  static getNextMatches(filter) {
    return getEventsByFilter(`${filter}/all/all/matches`)
      .then(matches => {
        if (matches == null) {
          throw new Error(
            `No data available for supplied filter: ${filter}/all/all/matches`
          )
        }
        const currentTime = new Date(Date.now())

        return matches.events
          .filter(m => {
            const eventStart = new Date(m.event.start)
            return (
              m.event.tags.indexOf('MATCH') !== -1 &&
              eventStart &&
              eventStart > currentTime
            )
          })
          .sort((a, b) => new Date(a.event.start) - new Date(b.event.start))
      })
      .then(matches => {
        return matches.length > 0 ? matches : null
      })
  }
}

export default KambiService
