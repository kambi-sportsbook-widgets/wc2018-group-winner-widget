import kambi from '../../src/js/Services/kambi'
import { getEventsByFilter, getEvent } from 'kambi-offering-api-module'

jest.mock('kambi-offering-api-module', () => ({
  getEvent: jest.fn(),
  getEventsByFilter: jest.fn(),
}))

const mockEvent = {
  event: {
    type: 'ET_MATCH',
  },
}

describe('Kambi get group services', () => {
  it('returns events correctly', () => {
    const filter = 'testTournament'

    getEventsByFilter.mockReturnValueOnce(
      new Promise(resolve => resolve({ events: [] }))
    )
    getEventsByFilter.mockReturnValueOnce(
      new Promise(resolve =>
        resolve({
          events: [
            mockEvent,
            Object.assign({}, mockEvent, { event: { type: 'ET_COMPETITION' } }),
          ],
        })
      )
    )

    return kambi.getGroups(filter).then(events => {
      expect(events).toMatchSnapshot()
      expect(getEventsByFilter).toHaveBeenCalledTimes(1)
      expect(getEventsByFilter).toHaveBeenLastCalledWith(
        'testTournament/all/all/competitions'
      )
    })
  })

  it('behaves correctly when no events were found', () => {
    const filter = 'testTournament'

    getEventsByFilter.mockReturnValueOnce(
      new Promise(resolve => resolve({ events: [] }))
    )

    return kambi
      .getGroups(filter)
      .then(events => {
        throw new Error('Not supposed to reach here')
      })
      .catch(err => {
        expect(
          err.message ===
            `No tournament data available for supplied filter: ${filter}/all/all/competitions`
        )
      })
  })
})

describe('Kambi getNextMatches', () => {
  it('returns events correctly', () => {
    const filter = 'testTournament'

    getEventsByFilter.mockReturnValueOnce(
      new Promise(resolve => resolve({ events: [] }))
    )
    getEventsByFilter.mockReturnValueOnce(
      new Promise(resolve =>
        resolve({
          events: [
            mockEvent,
            Object.assign({}, mockEvent, { event: { type: 'ET_COMPETITION' } }),
          ],
        })
      )
    )

    return kambi.getNextMatches(filter).then(events => {
      expect(events).toMatchSnapshot()
      expect(getEventsByFilter).toHaveBeenLastCalledWith(
        'testTournament/all/all/matches'
      )
    })
  })

  it('behaves correctly when no events were found', () => {
    const filter = 'testTournament'

    getEventsByFilter.mockReturnValueOnce(
      new Promise(resolve => resolve({ events: [] }))
    )

    return kambi
      .getNextMatches(filter)
      .then(events => {
        throw new Error('Not supposed to reach here')
      })
      .catch(err => {
        expect(
          err.message ===
            `No data available for supplied filter: ${filter}/all/all/matches`
        )
      })
  })
})
