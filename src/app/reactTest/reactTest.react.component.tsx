// This is a TSX file, which is TypeScript with embedded XML (although really its html)
// You can also use JSX (JavaScript with XML) instead if you don't like the typings
// However, typings are entirely optional anyway so may as well use TypeScript
import * as React from 'react';

type ReactTestProps = {
    // Props from parent

    // AngularJS Injections
    LocationService: any
};
export const ReactTest = (props: ReactTestProps) => {
    props.LocationService.getLocation(1).then((response) => {
        console.log('got location', response);
    });
    return (
        <div>
            It works!
        </div>
    );
};

export default ReactTest;