import kambi from '../../src/js/Services/kambi';
import { coreLibrary, offeringModule, widgetModule } from 'kambi-widget-core-library';


jest.mock('kambi-widget-core-library', () => ({
   coreLibrary: {
      config: {
         routeRoot: ''
      }
   },
   offeringModule: {
      getHighlight: jest.fn(),
      getEventsByFilter: jest.fn()
   },
   widgetModule: {
      createFilterUrl: jest.fn()
   }
}));

const mockHighlightGroup = {pathTermId: 'test'};

const mockEvent = {
   event: {
      type: 'ET_MATCH'
   }
};


describe('Kambi get group services', () => {

   beforeEach(() => {
      offeringModule.getEventsByFilter = jest.fn();
   });

   it('returns events correctly', () => {
      const filter = 'testTournament';

      offeringModule.getEventsByFilter.mockReturnValueOnce(new Promise(resolve => resolve({events: []})));
      offeringModule.getEventsByFilter.mockReturnValueOnce(new Promise(resolve => resolve({events: [
         mockEvent,
         Object.assign({}, mockEvent, {event: {type: 'ET_COMPETITION'}})
      ]})));

      expect(offeringModule.getEventsByFilter).not.toHaveBeenCalled();

      return kambi.getGroups(filter)
         .then((events) => {
            expect(events).toMatchSnapshot();
            expect(offeringModule.getEventsByFilter).toHaveBeenCalledTimes(1);
            expect(offeringModule.getEventsByFilter).toHaveBeenLastCalledWith('testTournament/all/all/competitions');
         });
   });

   it('behaves correctly when no events were found', () => {
      const filter = 'testTournament';

      offeringModule.getEventsByFilter.mockReturnValueOnce(new Promise(resolve => resolve({events: []})));

      expect(offeringModule.getEventsByFilter).not.toHaveBeenCalled();

      return kambi.getGroups(filter)
         .then((events) => {
            throw new Error('Not supposed to reach here');
         })
         .catch((err) => {
            expect(err.message === `No tournament data available for supplied filter: ${filter}/all/all/competitions`);
         })
   });

});


describe('Kambi getNextMatches', () => {

   beforeEach(() => {
      offeringModule.getEventsByFilter = jest.fn();
   });

   it('returns events correctly', () => {
      const filter = 'testTournament';

      offeringModule.getEventsByFilter.mockReturnValueOnce(new Promise(resolve => resolve({events: []})));
      offeringModule.getEventsByFilter.mockReturnValueOnce(new Promise(resolve => resolve({events: [
         mockEvent,
         Object.assign({}, mockEvent, {event: {type: 'ET_COMPETITION'}})
      ]})));

      expect(offeringModule.getEventsByFilter).not.toHaveBeenCalled();

      return kambi.getNextMatches(filter)
         .then((events) => {
            expect(events).toMatchSnapshot();
            expect(offeringModule.getEventsByFilter).toHaveBeenCalledTimes(1);
            expect(offeringModule.getEventsByFilter).toHaveBeenLastCalledWith('testTournament/all/all/matches');
         });
   });

   it('behaves correctly when no events were found', () => {
      const filter = 'testTournament';

      offeringModule.getEventsByFilter.mockReturnValueOnce(new Promise(resolve => resolve({events: []})));

      expect(offeringModule.getEventsByFilter).not.toHaveBeenCalled();

      return kambi.getNextMatches(filter)
         .then((events) => {
            throw new Error('Not supposed to reach here');
         })
         .catch((err) => {
            expect(err.message === `No data available for supplied filter: ${filter}/all/all/matches`);
         })
   });

});