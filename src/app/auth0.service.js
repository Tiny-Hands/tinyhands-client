import {createAuth0Client} from '@auth0/auth0-spa-js';

// Tried to move these to a backend endpoint,
// but these are required for our http client itself!
// TODO move these into a .env but for the UI? or to constants.js?
const AUTH0_CLIENT_ID = '3Dip91hyG5oiP8RBJ7mZlA6Q81RSNWpP';
const AUTH0_DOMAIN = 'dev-oiz87mbf.us.auth0.com';
const AUTH0_AUDIENCE_ID = 'https://searchlightdata.org/api';

function createAuth0Service() {

    // This is NOT a wrapper around auth0-js (the old javascript-only auth0 api)
    // nor is it a wrapper around angular-auth0 (the official angularJS wrapper around the OLD api above)
    // instead, this is a (paper-thin) wrapper around the new vanilla javascript auth0-spa-js
    // https://github.com/auth0/auth0-spa-js
    // This is because the old api was targeted at having your own login page and code,
    // where as the new API is targeted at redirecting to yourdomain.auth0.com to authenticate which is less work
    const clientReadyPromise = createAuth0Client({
        domain: AUTH0_DOMAIN,
        clientId: AUTH0_CLIENT_ID,
        authorizationParams: {
            audience: AUTH0_AUDIENCE_ID
        },
        cacheLocation: 'localstorage'
    });
    const auth0Service = {
        auth0Client: undefined,
        clientReadyPromise: clientReadyPromise
    };
    clientReadyPromise.then((auth0Client) => {
        auth0Service.auth0Client = auth0Client;
        return auth0Client;
    });

    return auth0Service;
}

export default createAuth0Service;
export {AUTH0_DOMAIN, AUTH0_CLIENT_ID, AUTH0_AUDIENCE_ID};