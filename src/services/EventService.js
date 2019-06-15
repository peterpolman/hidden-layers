export default class EventService {
    constructor() {
        this.listeners = [];
    }

    listen(e, callback) {
        const listener = { e: e, cb: callback };
        const id = this.listeners.push(listener);

        window.addEventListener(listener.e, listener.cb)

        return id-1;
    }

    clear(id) {
        window.removeEventListener(this.listeners[id].e, this.listeners[id].cb);
        return delete this.listeners[id]
    }

    remove(id) {
        return window.removeEventListener(e, callback);
    }

    dispatch(e, data) {
        const event = new CustomEvent(e, { detail: data });
        return window.dispatchEvent(event);
    }
}
