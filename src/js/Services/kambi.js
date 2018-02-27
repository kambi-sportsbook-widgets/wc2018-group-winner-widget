import { offeringModule, widgetModule } from 'kambi-widget-core-library'

class KambiService {
  /**
   * Checks if given filter exists in current highlights.
   * @param {string} filter Filter to check
   * @returns {Promise.<boolean>}
   */
  static existsInHighlights(filter) {
    return offeringModule.getHighlight().then(response => {
      return !!response.groups.find(group =>
        group.pathTermId.match(
          new RegExp(`^/${filter.replace(/\/all/g, '')}(/all)*$`)
        )
      )
    })
  }

  /**
   * Fetches groups for given tournament.
   * @param {string} filter Tournament's filter
   * @param {number} criterionId Tournament's criterion identifier
   * @returns {Promise.<object[]>}
   */
  static getGroups(filter, criterionId) {
    return offeringModule
      .getEventsByFilter(`${filter}/all/all/competitions`)
      .then(competitions => {
          const groupEvents = []

          // filter out group events with at least one betOffer and add event request to groupEvents
          const filteredEvents = competitions.events
            .filter(event => {
              const isGroupEvent = event.event.englishName.match(/Group ([A-Z])/)
              const hasBetOffers = event.betOffers && event.betOffers.length > 0
              return isGroupEvent && hasBetOffers
            })
            .forEach(event => {
              groupEvents.push(offeringModule.getEvent(event.event.id))
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
          groupEvent.groupName = groupEvent.event.englishName.match(/Group ([A-Z])/)[1]
          return groupEvent
        })
        .sort((a, b) => { return a.event.englishName.localeCompare(b.event.englishName)})

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
    return offeringModule
      .getEventsByFilter(`${filter}/all/all/matches`)
      .then(matches => {
        const currentTime = Date.now()

        return matches.events
          .filter(
            m =>
              m.event.type === 'ET_MATCH' &&
              m.event.start &&
              m.event.start > currentTime
          )
          .sort((a, b) => a.event.start - b.event.start)
      })
      .then(matches => {
        return matches.length > 0 ? matches : null
      })
  }
}

export default KambiService