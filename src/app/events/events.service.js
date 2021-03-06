export default class EventsService {
    constructor(BaseService) {
        'ngInject';
        this.service = BaseService;
    }

    getAll() {
        return this.service.get('api/event/all/');
    }

    getEvent(id) {
        return this.service.get(`api/event/${id}/`);
    }

    createEvent(event) {
        return this.service.post('api/event/', event);
    }

    updateEvent(id, event) {
        return this.service.put(`api/event/${id}/`, event);
    }

    destroyEvent(id) {
        return this.service.delete(`api/event/${id}/`);
    }

    getCalendar(start, end) {
        var params = [
            {
                name: 'start',
                value: start
            },
            {
                name: 'end',
                value: end
            }
        ];
        return this.service.get('api/event/feed/calendar/', params);
    }

    getDashboard() {
        return this.service.get('api/event/feed/dashboard/');
    }
}
